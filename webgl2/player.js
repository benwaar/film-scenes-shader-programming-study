const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl2');
if(!gl){ alert('WebGL2 not supported'); throw new Error('WebGL2 required'); }

const sel = document.getElementById('shaderSelect');
const lockSlider = document.getElementById('lock');
const lockVal = document.getElementById('lockVal');
const auto = document.getElementById('auto');
document.getElementById('reload').onclick = ()=> loadSelected(true);

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

async function buildProgram(fragPath){
  const fragRaw = await fetchText(fragPath);
  const baseDir = fragPath.substring(0, fragPath.lastIndexOf('/')) || '.';
  const fragSrc = await preprocess(fragRaw, baseDir);
  const vs = compile(gl, gl.VERTEX_SHADER, VS_SRC);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
    throw new Error('Link error: '+gl.getProgramInfoLog(prog));
  }
  return prog;
}

// Fullscreen quad
const verts = new Float32Array([ -1,-1,0,0,  1,-1,1,0,  -1,1,0,1,  1,1,1,1 ]);
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,16,0);
gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,2,gl.FLOAT,false,16,8);

let manifest;
async function loadManifest(){
  manifest = await (await fetch('manifest.json')).json();
  sel.innerHTML = '';
  for(const f of manifest.fragments){
    const opt = document.createElement('option');
    opt.value = manifest.root + f;
    opt.textContent = f;
    sel.appendChild(opt);
  }
  const preferred = manifest.fragments.find(f=>f.includes('hud_text_flicker')) || manifest.fragments[0];
  if(preferred){ sel.value = manifest.root + preferred; }
}

let prog, locs = {}, startTime;
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
    loadImage('assets/text/eng_line.png'),
    loadImage('assets/text/toki_line.png'),
  ]);
  texEng = makeTex(eng);
  texToki = makeTex(toki);
}

async function loadSelected(force=false){
  await ensureTextures();
  const fragPath = sel.value;
  if(!force && prog && locs.fragPath === fragPath) return;
  prog && gl.deleteProgram(prog);
  prog = await buildProgram(fragPath);
  gl.useProgram(prog);
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
  const u_time = locs.u_time; if(u_time) gl.uniform1f(u_time, t);
  const u_lock = locs.u_lock; if(u_lock) gl.uniform1f(u_lock, autolock);
  const u_res  = locs.u_res;  if(u_res)  gl.uniform2f(u_res, canvas.width, canvas.height);

  if(locs.texEng){ gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texEng); }
  if(locs.texToki){ gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texToki); }

  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(frame);
}

(async function init(){
  await loadManifest();
  await loadSelected(true);
  requestAnimationFrame(frame);
})();
sel.addEventListener('change', ()=> loadSelected(true));
