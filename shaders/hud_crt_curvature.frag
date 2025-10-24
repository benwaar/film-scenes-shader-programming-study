#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D baseTex, glowTex; // base text pass + blurred bloom
uniform float u_time, u_lock;
uniform vec2 u_res;

vec2 barrel(vec2 uv, float k){
  vec2 c = uv*2.0-1.0;
  float r2 = dot(c,c);
  c *= 1.0 + k*r2; // barrel
  return (c+1.0)*0.5;
}

void main(){
  float stability = smoothstep(0.0,1.0,u_lock);
  vec2 uv = barrel(v_uv, 0.12);
  vec2 shift = vec2(0.002*(1.0-stability), 0.0);

  vec3 base = texture(baseTex, uv).rgb;
  vec3 glow = texture(glowTex, uv).rgb;

  vec3 rgb;
  rgb.r = texture(baseTex, uv + shift).r;
  rgb.g = base.g;
  rgb.b = texture(baseTex, uv - shift).b;
  rgb = mix(rgb, base, stability);

  float scan = 0.92 + 0.08*sin((uv.y*u_res.y) + u_time*220.0);
  float roll = fract(u_time*0.7);
  float refresh = 1.0 + 0.25 * exp(-pow((uv.y - roll),2.0)/0.0008);

  rgb = (rgb + glow*1.2) * scan * refresh;
  float vig = smoothstep(0.95, 0.55, length(uv-0.5));
  rgb *= (1.0 - 0.35*vig);

  fragColor = vec4(rgb, 1.0);
}
