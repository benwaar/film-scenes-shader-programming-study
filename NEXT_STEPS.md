# 🎬 Next Steps – Film Scenes Shader Programming Study

- [ ] **Pre-Flight:** Post a “Session Pre-Flight Snapshot” (see README) before executing any step below.

_Last updated: October 22, 2025_

## ✅ Current Progress
- Repository structure created  
- `README.md` written 
- In-helmet HUDstarted  

---

## 🧭 Immediate Next Steps
- [ ] Document emotional/visual effect from HUD evample  
- [ ] Begin general shaders with `film_vignette.frag`
- [ ] detect uniform vec2/vec3 and create multi-knob controls or expose a tiny JSON beside each shader with control metadata (for non-float uniforms)?
- [ ] Add explainations for the Player.js controls
- [ ] Understand / document differences between different GL versions

---

## 💬 ChatGPT Suggestions – VFX Breakdown & Timing Map (to add now)

- [ ] Create companion VFX breakdown: `docs/scene_guides/opening_helmet_training_scene_vfx.md`
- [ ] Create VFX timing map: `docs/scene_guides/opening_helmet_training_scene_timing.md`
- [ ] Implement slow→fast **text/image swap ramp**:
  - Start with dual-texture swap (English ↔ Toki Pona) via `hud_text_flicker.frag`.
  - Drive `flickRate` from slow → fast (ease-in) while `u_lock` ramps 0→1.
  - Keep **code reusable** by splitting into:
    1) **Text pass** (swap logic; textures or SDF glyphs)
    2) **Symbol pulse** (tawa glyph overlay)
    3) **Post FX** (CRT curvature/glow/scanlines)
- [ ] Decide: single shader with mode flags vs. multiple small shaders
  - ✅ Prefer **multiple small shaders** for clarity & reuse:
    - `hud_text_flicker.frag` (dual texture swap)
    - `hud_glyph_flip.frag` (SDF per-glyph swap)
    - `hud_symbol_pulse.frag` (tawa icon overlay)
    - `hud_crt_curvature.frag` (post-pass)
- [ ] Player integration:
  - Add `flickRate`, `scanStrength`, `hueShift`, `tawaPulse` as float uniforms (with `@range` hints).
  - Script `u_lock`, `flickRate`, `tawaPulse` in `player.js` using a simple timeline/ease.


---
## 💬 ChatGPT Suggestions – Next Steps

These notes summarize where to continue next time, based on the current repo structure and study goals.

### 🎨 Shader Development
- [ ] Finalize `hud_text_flicker.frag` behavior:
  - test with `u_lock` sweep 0→1 to confirm glitch resolves cleanly.
  - experiment with scanline and chroma split parameters (add `@range` hints for sliders).
- [ ] Add second study: `hud_glyph_flip.frag` – per-glyph language switching.
  - plan uniform + texture structure (atlas, idMap).
  - test fallback monochrome text pass first.
- [ ] Create shared utility file `shaders/common.glslinc` for `hash1`, `hash2`, `barrel()`, etc.
- [ ] Ensure all fragment shaders use `#version 300 es` or rely on player auto-upgrade.

### 🧩 Player Enhancements
- [ ] Integrate manifest pre-flight check (warn if listed shader missing).
- [ ] Add optional FPS/performance overlay.
- [ ] Extend uniform UI to support `vec2`, `vec3`, and `bool`.
- [ ] Allow saving/loading preset JSONs under `presets/<shader>/`.
- [ ] Improve error handling: clear on-screen messages for shader compile/link failures.

### 📁 Repo / Structure
- [ ] Add `docs/INDEX.md` linking to study notes, templates, and analysis method.
- [ ] Keep `chatgpt_prefs.json` updated with `"shader_language": "GLSL ES 3.00"` and `"auto_upgrade_shaders": true`.
- [ ] Optionally add `chatgpt_history.md` — brief log of each session’s updates.

### 🎬 Film-Scene Analysis Loop
- [ ] Continue using **Describe → Identify → Extract → Map** workflow:
- describe a scene effect in natural language.
- identify up to three similar reference films.
- extract the visual technique or shader pattern.
- map to a new GLSL study file under `/shaders/`.
- [ ] For each new scene, fill the analysis template and link to the resulting shader study.

### 🚀 Future Studies
- [ ] Add Study 2: per-glyph language flipping (training transition).
- [ ] Add Study 3: CRT curvature + glow post-pass.
- [ ] Later: mirror shaders in WGSL for WebGPU comparison.
- [ ] Optionally: minimal screenshot capture button in player.

---

🗒️ *Next session*:  
- review current shader output vs. film reference,  
- decide which visual behaviors to refine or add to the next study folder,  
- and align documentation + player features with your shader iteration pace.


---
## Track: In-Helmet HUD – WebGL (GLSL only)

- [ ] Run the WebGL demo (`webgl2/1_hud_lang/`) and verify Study 1 (flicker → lock)
- [ ] Tweak shader params (`u_lock` timeline, scanline strength, chroma split)
- [ ] Add 2+ text pairs (English ↔ Toki Pona) and test
- [ ] Use the Describe→Identify→Extract method (`docs/notes/method_film_analysis.md`)
- [ ] Write one analysis using the template (`docs/templates/scene-analysis-template.md`)
- [ ] Map analysis → shader tasks (fill the “Shader Mapping” section)
- [ ] Optional: Study 2 (per-glyph) in WebGL
- [ ] Optional: Study 3 (curvature/glow pass) in WebGL

---

## 🧪 Coming Soon
- [ ] `card_glow.frag`: hover/selection highlight shader  
- [ ] `film-to-shader-mapping.md`: translating film imagery into shader logic  
- [ ] Visual moodboard for **scene references and shader styles**  
- [ ] Begin integrating multiple shaders for stylistic comparison  

---

## 💡 Note for Future Sessions

> When resuming this project:  
> - Refer to this `NEXT_STEPS.md` file first  
> - Choose one task or research note to expand (scene analysis, shader experiment, or documentation)  
> - Update this file with new progress and mark completed items with ✅  

This file acts as a **continuation anchor** for collaborative and iterative study across sessions.  
