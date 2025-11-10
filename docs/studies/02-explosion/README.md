# Study 02 – Distant Forest Explosion

Small background explosion composited into a still forest/mountain plate.

This study builds directly on **Study 01** and adds:
- localized radial fireball,
- additive glow and smoke layers,
- foreground masking for depth.

The goal is to learn the core building blocks for 2D “FX over plate” work in GLSL.

See also: `research/02_explosion_and_rocket.md` for concept and reference frames.

## Files
- `study02_explosion.frag` — Main fragment shader.
- `assets/study02/forest_plate.png` — Background plate.
- `assets/study02/forest_mask.png` — Foreground mask (white = occluder).

## Uniforms
```
sampler2D uSceneTex;
sampler2D uMaskTex;
float uTime;
vec2 uResolution;
vec2 uExplosionPos;
float uExplosionSize;
float uExplosionStart;
float uExplosionDuration;
float uExplosionIntensity;
float uSmokeAmount;
float uGlowAmount;
float uNoiseAmount;
```

## Notes
- Use `length(uv - uExplosionPos)` for radial distance.
- Grow radius with time: `radius = uExplosionSize * mix(0.3, 1.0, life);`
- Blend additively for fireball/glow, normally for smoke.
- Mask using `mix(explosionComposite, base, mask)`.

## Focus
- Radial math, timing, noise modulation, additive blending, masking.
