# How Flutter Uses the GPU and Shaders

## 1. The Rendering Engine
Flutter renders through its engine, **Impeller**, which sits above the platform’s GPU APIs:

| Platform | GPU Backend | Example API |
|-----------|--------------|--------------|
| Android | Vulkan | Khronos Vulkan |
| iOS / macOS | Metal | Apple Metal |
| Windows | Direct3D 12 | Microsoft D3D |
| Web | WebGL (future: WebGPU) | Browser |

Impeller automatically translates Flutter’s drawing commands into the correct GPU calls.

---

## 2. Custom Shaders in Flutter

Flutter lets you load custom fragment shaders via:

```dart
final program = await FragmentProgram.fromAsset('shaders/hud_text_flicker.frag');
```

## 3. Why Flutter = Great for Shader Learning

You can run the same GLSL code on Android, iOS, desktop, and web.

The shader math and visual results are identical to WebGL.

You learn how GPU fragments behave without needing low-level API setup.

## 4. The Compilation Flow

GLSL (.frag)
     ↓ (Flutter build)
Impeller Shader Compiler
     ↓
Platform GPU binary (Metal/Vulkan/Direct3D/WebGL)
     ↓
Rendered in your widget via CustomPaint
