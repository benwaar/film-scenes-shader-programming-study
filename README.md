# 🎨 Visual Language & Shader Coding Study (Flutter Focus)

This repository explores how **visual language in film** can inspire **shader-based visual design** for 2D games focusing on **emotion, color, and texture** rather than 3D realism.  

> _“Studying how cinematic imagery can live inside interactive flat worlds.”_

---

## 🧩 Study Landscape

```text
Visual Storytelling
├── Film Imagery Analysis
│   ├── Composition, Color, Light, Texture
│   └── Symbolism & Visual Mood
├── Shader Design
│   ├── Fragment Shaders (GLSL)
│   ├── Procedural Light, Blur, Grain, Tint
│   └── Color Grading & Post-FX for 2D Cards
└── Visual Integration in WebComponents and Flutter
    ├── Applying Shaders to Card Elements
    ├── Interactive Layering (hover, selection)
    └── Cinematic Style Consistency Across Scenes
```

---

### Study Plan

To continue from where the last session left off, see:  
👉 [**STUDY_PLAN.md**](STUDY_PLAN.md)
👉 [**PHASE2.md**](PHASE2.md)


### Notes & Explanations
Reference documents explaining technologies and language choices.

See:
- `docs/notes/shader_languages.md`
- `docs/notes/flutter_rendering.md`
- `docs/notes/roadmap_shader_targets.md`
- `docs/notes/architecture_reuse.md`

---


## 🧠 Future Research

| Topic | Status | Summary |
|-------|--------|----------|
| **[Procedural Lighting in 2D](notes/future/procedural-lighting.md)** | 🧪 | Creating depth and atmosphere in flat scenes |
| **[Emotion Through Color & Texture](notes/future/color-emotion-shaders.md)** | 🧪 | Using shader-driven color changes to reflect game states |
| **[Shader Optimization for Mobile](notes/future/flutter-shader-performance.md)** | 🧪 | Ensuring smooth rendering across devices |

---

## 🎥 Study Approach: Start Simple, Build Up

This project follows a **progressive learning approach** — starting with simple shader effects and gradually layering complexity inspired by cinematic imagery.

1. Begin with basic fragment shaders (film grain, color tint, vignette).  
2. Apply them to your 2D card game using Flutter’s shader API.  
3. Analyze how these visual effects mirror filmic techniques (composition, color, tone).  
4. Incrementally combine effects to simulate cinematic moods (e.g., noir, dreamy, retro).  

> _“Build from simplicity — each small shader teaches one piece of visual language.”_

---

## 🌐 Resources & Inspiration

Here are key references used to guide shader development and visual research:

| # | Resource | Description |
|---|-----------|--------------|
| 1 | [**Writing & using fragment shaders (Flutter Docs)**](https://docs.flutter.dev/ui/design/graphics/fragment-shaders?utm_source=chatgpt.com) | Official Flutter guide for loading and using `.frag` shaders. Essential for setup and understanding. |
| 2 | [**Shady Flutter: Using GLSL Shaders in Flutter**](https://blog.codemagic.io/shady-flutter/?utm_source=chatgpt.com) | Hands-on intro with GLSL shader examples in Flutter — practical for 2D visual effects. |
| 3 | [**Practical Fragment Shaders in Flutter – Droids on Roids**](https://www.thedroidsonroids.com/blog/fragment-shaders-in-flutter-app-development?utm_source=chatgpt.com) | Explains fragment shaders with clear examples, ideal for learning Flutter shader workflow. |
| 4 | [**Analyzing Optic & Filmic Effects in WebGL**](https://medium.com/%40josecastrovaron/analyzing-optic-and-filmic-effects-in-webgl-47abe74df74e?utm_source=chatgpt.com) | Visual deep-dive into film grain, LUTs, and color grading — useful for connecting film language to shader logic. |
| 5 | [**Film Grain Shader Example (GLSL)**](https://gameidea.org/2023/12/01/film-grain-shader/?utm_source=chatgpt.com) | Simple yet powerful example shader for film grain — perfect as a starting effect. |

---

##  Start here for new sessions

If you're opening this project in a **fresh ChatGPT session** (or for a new collaborator):

1. Read **`START_HERE_FOR_CHATGPT.md`** for the bootstrapping instructions and project preferences.
2. Follow the curriculum in **`STUDY_PLAN.md`** and **`PHASE2.md`**.
3. Keep code clean, modern, and well-commented; target **WebGL2 / GLSL ES 3.00** and use `shaders/manifest.json`.

