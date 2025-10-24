const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl2');
if(!gl){ alert('WebGL2 not supported'); }

const vsSrc = document.getElementById('vs').textContent.trim();
const fsSrc = document.getElementById('fs').textContent.trim();

function compile(type, src){
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){
    throw new Error(gl.getShaderInfoLog(sh));
  }
  return sh;
}

const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSrc));
gl.linkProgram(prog);
if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
  throw new Error(gl.getProgramInfoLog(prog));
}
gl.useProgram(prog);

// Fullscreen quad
const verts = new Float32Array([
  -1,-1,  0,0,
   1,-1,  1,0,
  -1, 1,  0,1,
   1, 1,  1,1,
]);
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

// Uniforms
const u_time = gl.getUniformLocation(prog, 'u_time');
const u_lock = gl.getUniformLocation(prog, 'u_lock');
const u_res  = gl.getUniformLocation(prog, 'u_res');

// Textures
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

async function loadImage(url){
  const img = new Image();
  img.src = url;
  img.decoding = 'async';
  await img.decode();
  return img;
}

let texEng, texToki;
Promise.all([
  loadImage('assets/text/eng_line.png'),
  loadImage('assets/text/toki_line.png'),
]).then(([eng, toki])=>{
  texEng = makeTex(eng);
  texToki = makeTex(toki);
  start();
});

// Bind texture units
const locEng = gl.getUniformLocation(prog, 'texEng');
const locToki = gl.getUniformLocation(prog, 'texToki');
gl.uniform1i(locEng, 0);
gl.uniform1i(locToki, 1);

// Controls
const lockSlider = document.getElementById('lock');
const lockVal = document.getElementById('lockVal');
const auto = document.getElementById('auto');

let t0;
function start(){
  t0 = performance.now();
  requestAnimationFrame(frame);
}
function frame(now){
  const t = (now - t0) / 1000.0;
  const autolock = auto.checked ? Math.min(1, t/3.0) : parseFloat(lockSlider.value);
  if(!auto.checked){
    lockVal.textContent = parseFloat(lockSlider.value).toFixed(2);
  }else{
    lockVal.textContent = autolock.toFixed(2);
  }

  gl.viewport(0,0,canvas.width, canvas.height);
  gl.clearColor(0,0,0,1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texEng);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, texToki);

  gl.uniform1f(u_time, t);
  gl.uniform1f(u_lock, autolock);
  gl.uniform2f(u_res, canvas.width, canvas.height);

  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(frame);
}

// Resize handling
function resize(){
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.min(1024, Math.floor(window.innerWidth * 0.95));
  const h = Math.floor(w * (256/1024));
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
}
window.addEventListener('resize', resize);
resize();
