# Study 03 – Rocket Propulsion

Close-up of a rocket nozzle with a bright directional exhaust plume.

Builds on Study 02 (explosion) to introduce **directional flow, banding, and heat distortion**.

See also: `research/02_explosion_and_rocket.md` for design notes and reference frame.

## Files
- `study03_rocket.frag` — Main fragment shader.
- `assets/study03/rocket_plate.png` — Background plate (nozzle image).

## Uniforms
```
sampler2D uSceneTex;
float uTime;
vec2 uResolution;
vec2 uPlumeOrigin;
float uPlumeAngle;
float uPlumeLength;
float uPlumeWidth;
float uTurbulence;
float uFlicker;
float uIntensity;
int uEnableDistortion;
float uDistortionAmount;
```

## Shader Concept
1. Compute local coordinates aligned to `uPlumeAngle`.
2. Define a **cone/jet shape** using distance along/perpendicular to the axis.
3. Modulate brightness along the axis using a repeating sine pattern or banded noise.
4. Apply a **color ramp** (white/yellow near nozzle → orange → red/brown).
5. Animate noise scrolling along the axis to simulate flow.
6. Optionally apply **heat distortion** by offsetting background UVs with noise.

## Focus
- Directional coordinates and anisotropy.
- Combining periodic and noise patterns (shock diamonds).
- Additive vs. refractive effects.
- Time-based motion and flicker.
