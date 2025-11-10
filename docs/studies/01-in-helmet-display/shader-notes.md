# Shader Notes

**Noise/Hash.** Tiny hash for deterministic per-scanline/per-glyph randomness.

**Scanlines.** `scan = 0.9 + 0.1 * sin(uv.y * resY * π)`; scale with `u_res.y`.

**Chroma split.** Sample base texture with ±x shift; reduce with stability (`u_lock`).

**Barrel distortion.** Radial `r^2` term: `uv' = uv + k * r^2 * (uv - 0.5)`.

**Bloom.** Threshold then separable blur (5–7 taps) for mobile.

**Confidence per glyph.** `perGlyphLock = smoothstep(0,1, u_lock * (0.6 + 0.8*rand(gid)))`.
