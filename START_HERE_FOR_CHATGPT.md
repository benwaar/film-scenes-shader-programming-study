# START HERE (for ChatGPT)

This repository is a **shader study project**. When a new chat begins, **read and apply these project preferences before doing anything else.**

## 1) Read these files first
- `chatgpt_prefs.base.json`
- `chatgpt_prefs.webgl2.json`
- `README.md`
- `STUDY_PLAN.md`
- `PHASE2.md`

## 2) Apply the prefs (summary)
- Target **WebGL2** with **GLSL ES 3.00** (auto-upgrade legacy GLSL if needed).
- Use the **auto-uniform slider** pattern: create sliders for `uniform float` (respect inline range/step/label comments).
- Load shaders from `shaders/` using `shaders/manifest.json`. Do not hardcode lists elsewhere.
- Keep code **clean, modern, and well-commented**, and explain any non-obvious changes briefly.
- Prefer JSON configs over hardcoded paths.

## 3) Runtime behavior (already wired in the player)
- The player reads prefs for **theme** and **default canvas size** on startup (`player/prefs.js`).
- The shader picker uses `shaders/manifest.json`.
- Float uniforms with annotations like:<br>
  `uniform float hueShift; // [-0.5, 0.5] @step 0.01 @label Hue Shift (radians)`<br>
  will auto-generate labeled sliders.

## 4) When continuing the study
- **Read `README.md`** for context and conventions.
- **Read `STUDY_PLAN.md` and `PHASE2.md`** to understand the curriculum.
- Use commit-style messages in explanations (e.g., "feat(shader): add hud_symbol_pulse with hue slider").

## 5) Safe defaults for helpers
- If a new shader is requested, start from a **minimal, commented stub** compatible with the WebGL2 player and register it in `manifest.json`.
- Add inline uniform annotations for any tweakable parameters (range/step/label).
- Prefer **non-destructive** edits (append new files; avoid breaking existing demos).

---

**Reminder for Chat Start**  
> "Please read `chatgpt_prefs.base.json`, `chatgpt_prefs.webgl2.json`, `README.md`, `STUDY_PLAN.md`, and `PHASE2.md`. Apply the prefs and continue the study accordingly."
