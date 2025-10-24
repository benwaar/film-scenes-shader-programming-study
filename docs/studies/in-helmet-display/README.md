# In-Helmet Display (HUD) – Language Trainer

**Intent.** Inside-helmet retro HUD that flickers between English and Toki Pona as if the visor is “teaching” language; it finally stabilizes on Toki Pona.

## Studies (progressive)
1. **hud_text_flicker.frag** – Crossfade two text textures + CRT scanlines & glitches. One-pass, fast.
2. **hud_glyph_flip.frag** – Per-glyph flicker with SDF atlases. Each glyph learns at its own pace.
3. **hud_crt_curvature.frag** – Multi-pass look: bloom, curvature, chroma split, rolling refresh bar.

## Controls
- `u_time` (seconds)
- `u_lock` (0..1): 0=flicker training, 1=locked on Toki Pona
- `u_res` (viewport px)
- Optional: `u_glitchIntensity`, `u_chroma`, `u_scanStrength`

## Test Script (drive `u_lock`)
```
0.0–1.5s  rapid flicker, heavy glitches
1.5–3.0s  flicker slows, per-glyph stabilization
>3.0s     lock achieved: stable Toki Pona, micro-noise only
```

## Assets
- `assets/text/eng_line.png`, `assets/text/toki_line.png` (Study 1)
- `assets/fonts/eng_sdf.png`, `assets/fonts/toki_sdf.png`, `assets/fonts/glyph_uvs.png`, `assets/fonts/id_map.png` (Study 2)

See `scene-analysis.md` and `shader-notes.md` for details.
