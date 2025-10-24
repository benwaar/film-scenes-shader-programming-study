precision mediump float;
uniform sampler2D texEng, texToki;
uniform float u_time, u_lock; // 0..1
uniform vec2  u_res;          // viewport
varying vec2  v_texCoord;     // adjust to your pipeline

float hash2(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }

void main(){
  vec2 uv = v_texCoord;

  // occasional horizontal tear
  float line = floor(uv.y * u_res.y);
  float tear = step(0.97, hash2(vec2(line, floor(u_time*6.0)))) * 0.008;
  uv.x += tear * (hash2(vec2(line+u_time, 1.23)) - 0.5);

  // language training mix
  float flick = step(0.5, hash2(vec2(u_time*10.0, uv.y*13.0)));
  float mixLang = smoothstep(0.0,1.0, mix(flick, 1.0, u_lock));

  // subtle chroma split
  vec2 shift = vec2(0.0015, 0.0);
  vec3 eng = vec3(
    texture2D(texEng, uv+shift).r,
    texture2D(texEng, uv).g,
    texture2D(texEng, uv-shift).b
  );
  vec3 tok = vec3(
    texture2D(texToki, uv+shift).r,
    texture2D(texToki, uv).g,
    texture2D(texToki, uv-shift).b
  );
  vec3 col = mix(eng, tok, mixLang);

  // scanlines + vignette
  float scan = 0.9 + 0.1*sin((uv.y*u_res.y));
  float vig  = smoothstep(0.95, 0.6, length(uv-0.5));
  col *= scan * (1.0 - 0.35*vig);

  gl_FragColor = vec4(col, 1.0);
}
