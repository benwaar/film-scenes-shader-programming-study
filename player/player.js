const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl2');
if(!gl){ alert('WebGL2 not supported'); throw new Error('WebGL2 required'); }

const sel = document.getElementById('shaderSelect');
const lockSlider = document.getElementById('lock');
const lockVal = document.getElementById('lockVal');
const auto = document.getElementById('auto');
const panel = document.getElementById('uniformPanel');
document.getElementById('reload').onclick = ()=> loadSelected(true);

const SHADER_ROOT = '../shaders/';      // <— reads from repo root /shaders
const MANIFEST_URL = SHADER_ROOT + 'manifest.json';

const VS_SRC = `#version 300 es
  precision mediump float;
  layout(location=0) in vec2 a_pos;
  layout(location=1) in vec2 a_uv;
  out vec2 v_uv;
  out vec2 v_texCoord;
  void main(){
    v_uv = a_uv;
    v_texCoord = a_uv;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

function compile(gl, type, src){
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
    const log = gl.getShaderInfoLog(sh);
    console.error(src.split('\n').map((l,i)=>`${i+1}: ${l}`).join('\n'));
    throw new Error('Shader compile error:\n' + log);
  }
  return sh;
}

async function fetchText(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('fetch failed '+url);
  return await res.text();
}

// #include support (relative to the .frag dir)
async function preprocess(src, baseDir){
  const lines = src.split(/\r?\n/);
  let out = '';
  for(const line of lines){
    const m = line.match(/^\s*#include\s+"([^"]+)"\s*$/);
    if(m){
      const incPath = baseDir + '/' + m[1];
      const incText = await fetchText(incPath);
      out += `\n// begin include ${m[1]}\n` + incText + `\n// end include ${m[1]}\n`;
    }else{
      out += line + '\n';
    }
  }
  return out;
}

// Upgrade GLSL ES 1.00 -> 3.00 (heuristics)
function upgradeTo300es(src){
  const lines = src.split(/\r?\n/);
  let body = [];
  for(const ln of lines){
    if(ln.trim().startsWith("#version")) continue; // drop existing version
    body.push(ln);
  }
  let s = body.join('\n');
  s = s.replace(/\btexture2D\s*\(/g, 'texture(');
  s = s.replace(/\btextureCube\s*\(/g, 'texture(');
  s = s.replace(/\bgl_FragColor\b/g, 'fragColor');
  s = s.replace(/\bvarying\b/g, 'in');
  if(!/\bout\s+vec4\s+fragColor\b/.test(s)){ s = 'out vec4 fragColor;\n' + s; }
  if(!/\bprecision\s+mediump\s+float\b/.test(s)){ s = 'precision mediump float;\n' + s; }
  if(!/\bin\s+vec2\s+v_uv\b/.test(s) && !/\bin\s+vec2\s+v_texCoord\b/.test(s)){
    s = 'in vec2 v_uv;\n' + s;
  }
  s = '#version 300 es\n' + s;
  return s;
}

// Extract float uniforms with optional hints
function extractFloatUniforms(src){
  const re = /uniform\s+float\s+([A-Za-z_][A-Za-z0-9_]*)\s*;\s*(?:\/\/\s*@range\s+(-?\d*\.?\d+)\s+(-?\d*\.?\d+)\s*(?:@step\s+(\d*\.?\d+))?\s*(?:@label\s+(.+))?)?/g;
  const out = [];
  let m;
  while((m = re.exec(src))){
    const name = m[1];
    if(name === 'u_time' || name === 'u_lock' || name === 'u_res') continue;
    const min = m[2] !== undefined ? parseFloat(m[2]) : 0.0;
    const max = m[3] !== undefined ? parseFloat(m[3]) : 1.0;
    const step = m[4] !== undefined ? parseFloat(m[4]) : (max-min)/100.0 || 0.01;
    const label = m[5] ? m[5].trim() : name;
    out.push({name, min, max, step, label, value: (min+max)/2});
  }
  return out;
}

async function buildProgram(fragPath){
  let fragRaw = await fetchText(fragPath);
  const baseDir = fragPath.substring(0, fragPath.lastIndexOf('/')) || '.';
  fragRaw = await preprocess(fragRaw, baseDir);
  const has300 = /^\s*#version\s+300\s+es\b/m.test(fragRaw);
  const fragSrc = has300 ? fragRaw : upgradeTo300es(fragRaw);

  const vs = compile(gl, gl.VERTEX_SHADER, VS_SRC);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
    throw new Error('Link error: '+gl.getProgramInfoLog(prog));
  }
  return {prog, fragSrc};
}

function buildUniformUI(uniforms){
  panel.innerHTML = '';
  for(const u of uniforms){
    const box = document.createElement('div'); box.className = 'u';
    const id = 'u_'+u.name;
    const label = document.createElement('label'); label.htmlFor = id;
    const spanVal = document.createElement('span'); spanVal.textContent = u.value.toFixed(3);
    label.innerHTML = `${u.label} <code>${u.name}</code> = `; label.appendChild(spanVal);
    const slider = document.createElement('input'); slider.type = 'range';
    slider.min = u.min; slider.max = u.max; slider.step = u.step; slider.value = u.value;
    slider.id = id;
    slider.addEventListener('input', ()=>{ u.value = parseFloat(slider.value); spanVal.textContent = u.value.toFixed(3); });
    box.appendChild(label); box.appendChild(slider); panel.appendChild(box);
  }
}

let prog, locs = {}, startTime, floatUniforms = [];
let texEng, texToki;

function makeTex(img){
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  return t;
}
async function loadImage(url){ const i=new Image(); i.src=url; i.decoding='async'; await i.decode(); return i; }
async function ensureTextures(){
  if(texEng && texToki) return;
  const [eng, toki] = await Promise.all([
    loadImage('../assets/text/eng_line.png'),
    loadImage('../assets/text/toki_line.png'),
  ]);
  texEng = makeTex(eng); texToki = makeTex(toki);
}

async function loadManifest(){
  const m = await (await fetch(MANIFEST_URL)).json();
  sel.innerHTML = '';
  for(const f of m.fragments){
    const opt = document.createElement('option');
    opt.value = SHADER_ROOT + f;
    opt.textContent = f;
    sel.appendChild(opt);
  }
  const preferred = m.fragments.find(f=>f.includes('hud_text_flicker')) || m.fragments[0];
  if(preferred) sel.value = SHADER_ROOT + preferred;
}

async function loadSelected(force=false){
  await ensureTextures();
  const fragPath = sel.value;
  if(!force && prog && locs.fragPath === fragPath) return;
  if(prog) gl.deleteProgram(prog);

  const built = await buildProgram(fragPath);
  prog = built.prog;
  const src = built.fragSrc;
  gl.useProgram(prog);

  floatUniforms = extractFloatUniforms(src);
  buildUniformUI(floatUniforms);

  locs = {
    fragPath,
    u_time: gl.getUniformLocation(prog, 'u_time'),
    u_lock: gl.getUniformLocation(prog, 'u_lock'),
    u_res:  gl.getUniformLocation(prog, 'u_res'),
    texEng: gl.getUniformLocation(prog, 'texEng'),
    texToki:gl.getUniformLocation(prog, 'texToki'),
  };
  if(locs.texEng) gl.uniform1i(locs.texEng, 0);
  if(locs.texToki) gl.uniform1i(locs.texToki, 1);
  for(const u of floatUniforms){ u.loc = gl.getUniformLocation(prog, u.name); }

  startTime = performance.now();
}

function resize(){
  const dpr = Math.min(window.devicePixelRatio||1,2);
  const w = Math.min(1024, Math.floor(window.innerWidth*0.95));
  const h = Math.floor(w * (256/1024));
  canvas.style.width = w+'px'; canvas.style.height = h+'px';
  canvas.width = Math.floor(w*dpr); canvas.height = Math.floor(h*dpr);
}
window.addEventListener('resize', resize); resize();

function frame(now){
  if(!prog){ requestAnimationFrame(frame); return; }
  const t = (now - startTime)/1000;
  const autolock = auto.checked ? Math.min(1, t/3.0) : parseFloat(lockSlider.value);
  lockVal.textContent = autolock.toFixed(2);

  gl.viewport(0,0,canvas.width, canvas.height);
  gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(prog);
  if(locs.u_time) gl.uniform1f(locs.u_time, t);
  if(locs.u_lock) gl.uniform1f(locs.u_lock, autolock);
  if(locs.u_res)  gl.uniform2f(locs.u_res, canvas.width, canvas.height);
  for(const u of floatUniforms){ if(u.loc) gl.uniform1f(u.loc, u.value); }

  // draw
  const verts = new Float32Array([ -1,-1,0,0,  1,-1,1,0,  -1,1,0,1,  1,1,1,1 ]);
  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,16,0);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,2,gl.FLOAT,false,16,8);

  // bind known samplers
  if(locs.texEng){ gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texEng); }
  if(locs.texToki){ gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texToki); }

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(frame);
}

(async function init(){
  await loadManifest();
  await loadSelected(true);
  requestAnimationFrame(frame);
})();

sel.addEventListener('change', ()=> loadSelected(true));
