# Shader Architecture for Reuse

## Passes (small focused shaders)
1) **Text Swap (dual texture)** – `hud_text_flicker.frag`  
   - Inputs: `texEng`, `texToki`  
   - Uniforms: `u_time`, `u_res`, `u_lock`, `flickRate`, `scanStrength`, `chromaSplit`  
   - Responsibility: English↔TP blending + scanlines/chroma.

2) **Glyph Swap (SDF)** – `hud_glyph_flip.frag`  
   - Inputs: `atlasEng`, `atlasToki`, `glyphUVTex`, `idMap`  
   - Uniforms: `u_time`, `u_lock`, `flickRate`  
   - Responsibility: per-glyph learning flip.

3) **Symbol Pulse** – `hud_symbol_pulse.frag`  
   - Inputs: `symbolTex` (tawa glyph)  
   - Uniforms: `tawaPulse`, `hueShift`  
   - Responsibility: centered icon/text overlay & pulse.

4) **Post FX (CRT)** – `hud_crt_curvature.frag`  
   - Inputs: `baseTex`, `glowTex`  
   - Uniforms: `u_time`, `u_lock`, `bloomBoost`  
   - Responsibility: curvature, chroma finalize, bloom.

## Why multiple shaders?
- Clarity: each shader owns one idea.  
- Reuse: swap text module for other languages/scenes.  
- Testing: you can A/B modules quickly in the player.
