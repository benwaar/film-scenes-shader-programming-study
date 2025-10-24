precision mediump float;
uniform sampler2D atlasEng, atlasToki; // SDF atlases
uniform sampler2D glyphUVTex;          // per-glyph rects (xy=origin, zw=size)
uniform sampler2D idMap;               // glyph id per-frag (0..1)
uniform float u_time, u_lock;
varying vec2 v_texCoord;               // in laid-out text quad space

float hash1(float x){ return fract(sin(x)*43758.5453123); }

void main(){
  float gidF = texture2D(idMap, v_texCoord).r;
  float gid  = floor(gidF * 1024.0 + 0.5);
  float r = hash1(gid*17.0);
  float perGlyphLock = smoothstep(0.0,1.0, u_lock * (0.6 + 0.8*r));
  float flip = step(0.5, hash1(gid + floor(u_time*12.0)));
  float useToki = mix(flip, 1.0, perGlyphLock);

  // Sample glyph rect
  vec2 uvKey = vec2((gid+0.5)/1024.0, 0.5);
  vec4 g = texture2D(glyphUVTex, uvKey);
  vec2 glyphUV = g.xy + v_texCoord * g.zw;

  float e = texture2D(atlasEng, glyphUV).r;
  float t = texture2D(atlasToki, glyphUV).r;
  float sdf = mix(e, t, useToki);
  float alpha = smoothstep(0.5, 0.49, sdf);

  gl_FragColor = vec4(vec3(1.0), alpha);
}
