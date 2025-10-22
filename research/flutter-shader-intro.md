# 🌈 Intro to Flutter Shaders (GLSL-style) for 2D Games

This note shows how to use **fragment shaders** in **Flutter** to create cinematic 2D effects for your card game — things like **vignette**, **glow**, **grain**, **tint**, and **atmospheric falloff**.

> TL;DR: Put a `.frag` file in `flutter: shaders:`, load it with `FragmentProgram.fromAsset(...)`, pass uniforms via `floats: [...]`, and draw with a `CustomPainter` (or `ShaderMask`).

---

## ✅ Quickstart Checklist

1. Create a `shaders/` folder in your Flutter project  
2. Add your fragment shader file (e.g., `shaders/film_vignette.frag`)  
3. Register it in `pubspec.yaml` under `flutter: shaders:`  
4. Load it in Dart with `FragmentProgram.fromAsset(...)`  
5. Build a `CustomPainter` that sets `paint.shader = program.fragmentShader(...)`  
6. Draw a `Rect` or `RRect` using that paint

---

## 📦 `pubspec.yaml`

```yaml
flutter:
  shaders:
    - shaders/film_vignette.frag
```

> The path must match your actual file location. Flutter will compile the `.frag` at build time and make it available via `FragmentProgram.fromAsset(...)`.

---

## 📁 Suggested Project Layout

```
lib/
  main.dart
  widgets/
    cinematic_card.dart
  painters/
    vignette_painter.dart
shaders/
  film_vignette.frag
```

---

## 🧪 Example Fragment Shader: `shaders/film_vignette.frag`

This shader creates a **soft vignette** with subtle **film grain**. It expects uniforms in this exact order:  
`u_resolution (vec2), u_time (float), u_intensity (float)`

```glsl
precision mediump float;

uniform vec2 u_resolution;   // canvas size in pixels
uniform float u_time;        // seconds
uniform float u_intensity;   // 0.0 .. 1.0

// Hash-based noise (cheap pseudo-random). Good enough for film grain.
float hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)),
           dot(p, vec2(269.5, 183.3)));
  return fract(sin(p.x + p.y) * 43758.5453);
}

void main() {
  // Normalized coordinates (0..1) with origin at bottom-left-ish
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  // Vignette: darker towards edges
  float d = distance(uv, vec2(0.5));
  float vignette = smoothstep(0.8, 0.2, d); // bright center, dark edges

  // Film grain: animated noise scaled by intensity
  float n = hash(uv * (u_time * 60.0));
  float grain = (n - 0.5) * 0.08 * u_intensity;

  // Combine tone + grain (clamped for safety)
  float tone = clamp(vignette + grain, 0.0, 1.0);

  gl_FragColor = vec4(vec3(tone), 1.0);
}
```

> ⚠️ **Uniform order matters.** When you create `fragmentShader(floats: ...)` in Dart, you must pass values in the same order that the uniforms are declared.

---

## 🎯 Dart Integration (CustomPainter)

A minimal painter that fills its area using the shader above.

```dart
// lib/painters/vignette_painter.dart
import 'dart:ui' as ui;
import 'dart:typed_data';
import 'package:flutter/material.dart';

class VignettePainter extends CustomPainter {
  VignettePainter(this.program, this.timeSeconds, this.intensity);

  final ui.FragmentProgram program;
  final double timeSeconds; // feed an animated time
  final double intensity;   // 0..1

  @override
  void paint(Canvas canvas, Size size) {
    final shader = program.fragmentShader(
      floats: Float32List.fromList([
        size.width, size.height,    // u_resolution
        timeSeconds.toDouble(),     // u_time
        intensity.toDouble(),       // u_intensity
      ]),
    );

    final paint = Paint()..shader = shader;
    canvas.drawRect(Offset.zero & size, paint);
  }

  @override
  bool shouldRepaint(covariant VignettePainter oldDelegate) {
    return oldDelegate.timeSeconds != timeSeconds ||
           oldDelegate.intensity != intensity ||
           oldDelegate.program != program;
  }
}
```

Load the shader once (e.g., in `initState`) and pass it down:

```dart
// lib/widgets/cinematic_card.dart
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import '../painters/vignette_painter.dart';

class CinematicCard extends StatefulWidget {
  const CinematicCard({super.key, this.intensity = 0.7, this.child});
  final double intensity;
  final Widget? child;

  @override
  State<CinematicCard> createState() => _CinematicCardState();
}

class _CinematicCardState extends State<CinematicCard> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  ui.FragmentProgram? _program;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(days: 1))
      ..repeat(); // cheap "time" for subtle grain

    _loadShader();
  }

  Future<void> _loadShader() async {
    final program = await ui.FragmentProgram.fromAsset('shaders/film_vignette.frag');
    setState(() => _program = program);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_program == null) {
      return const SizedBox.shrink(); // or a placeholder
    }

    // Animate time in seconds
    final time = _ctrl.lastElapsedDuration?.inMilliseconds ?? 0;
    final timeSeconds = time / 1000.0;

    return CustomPaint(
      painter: VignettePainter(_program!, timeSeconds, widget.intensity),
      child: widget.child,
    );
  }
}
```

Use it like any widget:

```dart
// lib/main.dart (snippet)
CinematicCard(
  intensity: 0.6,
  child: Container(
    width: 280,
    height: 400,
    padding: const EdgeInsets.all(16),
    child: const Center(child: Text('Ace of Hearts', style: TextStyle(fontSize: 24))),
  ),
),
```

---

## 🧰 Applying the Effect to a Specific Shape (e.g., Rounded Card)

Wrap your `CustomPaint` in a `ClipRRect` to constrain the shader to a card shape:

```dart
ClipRRect(
  borderRadius: BorderRadius.circular(16),
  child: CustomPaint(
    painter: VignettePainter(_program!, timeSeconds, 0.7),
    child: // your card content
  ),
)
```

Or draw the rounded rect directly in the painter:

```dart
final rrect = RRect.fromRectAndRadius(Offset.zero & size, const Radius.circular(16));
canvas.drawRRect(rrect, paint);
```

---

## 🎬 Cinematic Variations to Try Next

- **Chromatic Aberration:** offset RGB channels by small UV shifts near edges  
- **Color Tint / LUT-ish:** multiply tone by a color, or remap with a 1D curve  
- **Depth-ish Fog:** fake depth with vertical position, darkening lower areas  
- **Scanlines / Halation:** add subtle horizontal lines or glow around highlights  
- **Selection Pulse:** modulate vignette radius with `sin(u_time)` when a card is selected

---

## 📈 Performance Tips (Web & Mobile)

- Keep shaders **simple** (avoid heavy loops / branches)  
- Prefer **mediump** precision unless you need high precision  
- Pass only the uniforms you need; pack floats tightly  
- Cache `FragmentProgram` (load once) and avoid recreating `fragmentShader` per frame unless parameters change  
- Use **smaller draw areas** (clip to card shapes) when possible

---

## 🐞 Debugging Tips

- If your shader doesn’t load, double-check `pubspec.yaml` path under `flutter: shaders:`  
- If you see nothing drawn, try outputting a constant color first to confirm the pipeline  
- Verify **uniform order** matches the Dart `floats:` list order  
- Print the `Size` you pass as `u_resolution` to ensure non-zero values  
- On web, try in Chrome first; ensure no CSP blocks and no canvas errors in console

---

## 🧭 Next Exercises

1. Duplicate the shader as `card_glow.frag` that adds a soft inner glow for **hover/selection**  
2. Create a **film grain intensity slider** in the UI and bind it to the `u_intensity` uniform  
3. Build a **“mood board” page** where you can switch between multiple shaders on a sample card

---

## 📚 Reference Mapping (Film → Shader Concept)

| Film Look | Shader Idea |
|----------|-------------|
| **Noir** (hard contrast, edges) | Vignette + high contrast curve + subtle grain |
| **Dreamy** (soft, hazy) | Gaussian-ish blur, bloom, warm tint |
| **Retro** (analog) | Scanlines, halation, chromatic aberration, LUT tint |
| **Mystery** (cool, deep) | Cool tint + corner darkening + gentle noise |

---

Happy coding — and have fun painting with math ✨
