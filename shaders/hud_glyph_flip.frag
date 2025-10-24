#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D atlasEng, atlasToki; // SDF atlases
uniform sampler2D glyphUVTex;          // per-glyph rects (xy=origin, zw=size)
uniform sampler2D idMap;               // glyph id per-frag (0..1)
uniform float u_time, u_lock;

float hash1(float x){ return fract(sin(x)*43758.5453123); }

void main(){
  float gidF = texture(idMap, v_uv).r;
  float gid  = floor(gidF * 1024.0 + 0.5);
  float r = hash1(gid*17.0);
  float perGlyphLock = smoothstep(0.0,1.0, u_lock * (0.6 + 0.8*r));
  float flip = step(0.5, hash1(gid + floor(u_time*12.0)));
  float useToki = mix(flip, 1.0, perGlyphLock);

  // Sample glyph rect
  vec2 uvKey = vec2((gid+0.5)/1024.0, 0.5);
  vec4 g = texture(glyphUVTex, uvKey);
  vec2 glyphUV = g.xy + v_uv * g.zw;

  float e = texture(atlasEng, glyphUV).r;
  float t = texture(atlasToki, glyphUV).r;
  float sdf = mix(e, t, useToki);
  float alpha = smoothstep(0.5, 0.49, sdf);

  fragColor = vec4(vec3(1.0), alpha);
}
