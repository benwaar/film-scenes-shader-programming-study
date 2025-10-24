# Shader Languages Overview

## Current focus: GLSL (Web + Flutter)

The current study uses **GLSL ES 3.0** fragment shaders.  
This choice ensures compatibility across **Flutter (native + web)** and **WebGL**.

### Why GLSL first?
- Flutter’s `FragmentProgram` uses GLSL.
- WebGL (browser GPU API) also uses GLSL.
- The same shader can run both in a Flutter app and in a WebGL demo with only minor changes (varying/input names, precision qualifiers).

This makes GLSL the best first step for practical shader learning.

---

## Later: WebGPU and WGSL

**WebGPU** is a new browser graphics API that replaces WebGL.  
It uses a different shading language called **WGSL**.

WGSL is similar conceptually to GLSL but has:
- Explicit bindings (`@group`, `@binding`)
- Strong typing and validation
- A cleaner, modern syntax (inspired by Rust and Vulkan SPIR-V)

We’ll port one or more HUD shaders to WGSL later to learn the new model.

| Layer | Language | API | Status |
|--------|-----------|-----|--------|
| Flutter / WebGL | GLSL ES 3.0 | WebGL / Impeller | ✅ Active focus |
| WebGPU | WGSL | WebGPU | 🧩 Future module |
