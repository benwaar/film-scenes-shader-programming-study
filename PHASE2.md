# Phase 2 – Learn to Program Shaders (with 3 Study Shots)

Phase 2 is about **actually learning to write shaders** in small, safe steps, while gradually building up the three target effects:

1. Study 01 – Foundations / Cinematic Post  
2. Study 02 – Distant Forest Explosion  
3. Study 03 – Rocket Propulsion  

The idea: lots of tiny exercises → each one adds one new concept → we immediately plug it into one of the study shots so it never feels abstract.

---

## 0. Goals & Mental Model

By the end of Phase 2 you should feel:

- Comfortable editing fragment shaders without fear of “breaking everything”.
- Able to **reason in UV space** (0–1 coordinates over the screen).
- Familiar with:
  - Color math (mixing, lerp, contrast, saturation).
  - Time-based animation (`uTime`, normalized 0–1 “life”).
  - Simple noise and patterns.
  - Masks and compositing (putting FX “behind” things).
- Confident that you can sit down and build:
  - A **simple post-process pass** (Study 01),
  - A **radial explosion over a plate** (Study 02),
  - A **directional plume** (Study 03).

---

## 1. Warm-Up – Shader Comfort

**Goal:** Know where the shader file is, how to run it, and how not to panic.

### 1.1 Open and poke

- Open the Study 01 shader (e.g. `study01_*.frag`).
- Find:
  - The **main function** (`main()` / `mainImage()` depending on setup).
  - The **uniforms** (`uSceneTex`, `uTime`, `uResolution`, etc).
  - The **final color output** line.

**Mini exercises:**

- Change a constant:
  - e.g. a vignette strength or exposure value.
- Recompile / reload and observe.
- Add a comment:
  - `// TODO: this is where we'll add glow`  
  Just to mark mental “anchors” in the file.

> ✅ When this feels trivial, move on.

---

## 2. UV Space & Basic Shapes

**Goal:** Be at home in normalized coordinates and simple distance-based shapes.

We’ll work mostly in a `debug` mode first, then apply to Study 01 / 02.

### 2.1 See the UVs

In a throwaway or debug shader:

- Output UV as color:

```glsl
vec2 uv = vUv; // or computed from fragCoord / uResolution
fragColor = vec4(uv, 0.0, 1.0);
```

You should see:
- left = black,
- right = red,
- bottom = black,
- top = green,
- diagonal gradient across screen.

**Mini exercises:**

- Flip X or Y (`uv.y = 1.0 - uv.y;`) and see what happens.
- Zoom UV (`uv *= 2.0;`) and see the tiling / repetition.

### 2.2 Circles & masks

**Concept:** Distance from a point in UV.

```glsl
vec2 uv = vUv;
vec2 center = vec2(0.5);
float dist = length(uv - center);
```

**Mini exercises:**

- Use `dist` as a grayscale:

```glsl
float v = dist;        // 0 at center, ~0.7 at corners
fragColor = vec4(vec3(v), 1.0);
```

- Create a **soft circle** with `smoothstep`:

```glsl
float radius = 0.3;
float edge = 0.02;
float circle = 1.0 - smoothstep(radius - edge, radius + edge, dist);
fragColor = vec4(vec3(circle), 1.0);
```

- Move the circle with a uniform (e.g. `uCirclePos`).

### 2.3 Apply to Study 02

- In Study 02’s shader:
  - Replace the “explosion” with a simple circle mask first.
  - Use `uExplosionPos` and `uExplosionSize` to place and scale the circle.
- Output:
  - The base plate with your circle **added** as a faint brightening.
- Don’t worry about color or realism yet—just confirm the circle shows up in the right place.

> ✅ When you can put a soft circle exactly where you want in the shot, you’re ready for color.

---

## 3. Color, Blending & Grading

**Goal:** Understand how to colorize masks and combine them with the plate.

### 3.1 Solid colors & mix

In a debug shader or Study 01:

- Start with a grayscale mask `m` (0–1).
- Pick two colors:

```glsl
vec3 a = vec3(0.0, 0.0, 0.0);  // black
vec3 b = vec3(1.0, 0.5, 0.0);  // orange
vec3 col = mix(a, b, m);
```

**Mini exercises:**

- Try `mix(colorA, colorB, uv.x)` to see a left/right gradient between colors.
- Use `pow(m, 2.0)` or `sqrt(m)` before mixing to change the curve.

### 3.2 Additive vs normal blend

Given:

```glsl
vec3 base = texture(uSceneTex, uv).rgb;
vec3 fx   = someEffectColor;
```

Experiment:

- **Normal mix**:

```glsl
vec3 c = mix(base, fx, alpha);
```

- **Additive**:

```glsl
vec3 c = base + fx;
```

- **Additive with mask**:

```glsl
vec3 c = base + fx * mask;
```

**Mini exercises:**

- Add a small white circle to the forest plate using normal mix.
- Do the same with additive and compare:
  - Normal mix looks like paint,
  - Additive feels like light.

### 3.3 Apply to Study 02

- Take the explosion circle mask from Section 2.
- Create a simple fire color: near center = white, outer edge = orange/red.
- Add it **additively** on top of the plate, with a low intensity factor:
  - It doesn’t have to be realistic yet, just “light over the forest”.

> ✅ When you can colorize a mask and choose between normal/additive intentionally, you’re ready for time & motion.

---

## 4. Time & Motion

**Goal:** Learn to animate things using `uTime` and normalized “life”.

### 4.1 Simple time experiments

In a debug shader:

```glsl
float t = uTime;
float v = 0.5 + 0.5 * sin(t);
fragColor = vec4(vec3(v), 1.0);
```

**Mini exercises:**

- Change the speed: `sin(t * 2.0)` vs `sin(t * 0.1)`.
- Create a pulsing circle: radius depends on `sin`.

### 4.2 Normalized life

For explosions we want a 0–1 timeline:

```glsl
float t = max(uTime - uExplosionStart, 0.0);
float life = clamp(t / uExplosionDuration, 0.0, 1.0);
```

**Mini exercises:**

- Visualize `life` as grayscale on screen.
- Use `life` to drive:
  - radius growth: `radius = mix(startR, endR, life);`
  - intensity fade: `intensity = 1.0 - life;`

### 4.3 Apply to Study 02

- Use `life` to:
  - Grow the explosion radius over time.
  - Fade the brightness after a peak (e.g. very bright at `life ~ 0.1`, then drop).

You now have a **timed, growing, fading circle** over the forest.

> ✅ When timing feels controllable, you’re ready for noise and detail.

---

## 5. Noise & Detail

**Goal:** Break up perfect gradients into something more natural and “FX-like”.

(Exact noise function depends on the project; use whatever utility is already in the repo.)

### 5.1 Visualizing noise

In a debug shader:

```glsl
float n = snoise(vec3(uv * 5.0, uTime));
n = n * 0.5 + 0.5; // remap -1..1 to 0..1
fragColor = vec4(vec3(n), 1.0);
```

**Mini exercises:**

- Change frequency: `uv * 2.0`, `uv * 10.0`.
- Stop time to see static noise vs animated.

### 5.2 Noise-modded masks

Take the circle mask from earlier and multiply by noise:

```glsl
float circle = ...;     // 0..1
float n = snoise(vec3(uv * 20.0, uTime * 2.0));
n = n * 0.5 + 0.5;
float mask = circle * smoothstep(0.2, 1.0, n);
```

Now the circle edge is broken and flickery.

### 5.3 Apply to Study 02

- Plug noisy mask into your explosion color.
- Tune:
  - frequency,
  - animation speed,
  - noise contrast (`smoothstep` thresholds).

You now have a **boiling, noisy fireball**.

> ✅ When your explosion no longer looks like a clean vector circle, you’re ready for masks & compositing.

---

## 6. Masks & Compositing (Depth Fake)

**Goal:** Use a mask texture to hide FX behind foreground elements.

### 6.1 Visualize the mask

In Study 02:

```glsl
float m = texture(uMaskTex, uv).r;
fragColor = vec4(vec3(m), 1.0);
```

You should see:
- White where trees/ridge/character are,
- Black where sky/mountains/valley are.

### 6.2 Use mask to hide FX

With:

```glsl
vec3 base = texture(uSceneTex, uv).rgb;
vec3 explosion = ...; // what you've built so far
float mask = texture(uMaskTex, uv).r;
```

Mix:

```glsl
vec3 withExplosion = base + explosion;       // explosion composited on top
vec3 finalColor = mix(withExplosion, base, mask);
```

Where `mask = 1.0`, you just get `base` (foreground hides explosion).

### 6.3 Study 02 Milestone

At this point you should have:

- A timed, growing, noisy, colored explosion.
- Additive glow.
- Smoke and/or darkening around it (optional).
- Correct foreground occlusion using the mask.

> 🎯 This is a good point to save as a “Study 02 v1” milestone.

---

## 7. Directional FX – Rocket Plume

Now we reuse all the pieces (UVs, time, noise, color, masks) but in a **directional** way for Study 03.

**Goal:** Model a directional jet, not a radial ball.

### 7.1 Local axis & coordinates

Define a plume axis from a point (`origin`) with an angle (`uPlumeAngle`).

```glsl
vec2 uv = vUv;

// move into a local space with origin at plume start
vec2 p = uv - uPlumeOrigin;

// rotate by -angle so axis is “to the right”
float ca = cos(-uPlumeAngle);
float sa = sin(-uPlumeAngle);
vec2 q = vec2(
    p.x * ca - p.y * sa,
    p.x * sa + p.y * ca
);

// now q.x = along plume, q.y = perpendicular
```

**Mini exercises:**

- Visualize `q.x` and `q.y` as colors.
- Make a static stripe where `q.x` is between 0 and some length.

### 7.2 Cone / jet shape

Use `q` to define a plume:

```glsl
float along = q.x;        // along axis
float perp  = abs(q.y);   // distance from axis

float lengthMask = smoothstep(0.0, uPlumeLength, along) *
                   (1.0 - smoothstep(uPlumeLength * 0.8, uPlumeLength, along));

float widthAtX = mix(uPlumeWidth * 0.3, uPlumeWidth, along / uPlumeLength);
float widthMask = 1.0 - smoothstep(widthAtX * 0.5, widthAtX, perp);

float plumeMask = lengthMask * widthMask;
```

### 7.3 Bands / shock diamonds

Add a periodic pattern along the axis:

```glsl
float bands = 0.5 + 0.5 * sin(along * bandFrequency + uTime * bandSpeed);
float bandMask = mix(0.7, 1.3, bands); // slightly brighten/darken
float plume = plumeMask * bandMask;
```

### 7.4 Apply color & animation

- Use `along / uPlumeLength` to drive a color ramp:
  - White/yellow near nozzle,
  - Orange mid,
  - Red/brown far.
- Animate with noise similar to Study 02:
  - Use `snoise(vec3(q * frequency, uTime * speed))`.

### 7.5 Heat distortion (stretch)

Instead of (or in addition to) emissive color:

- Use noise to offset background UVs:

```glsl
vec2 distortion = noise2D(q * distortionFreq + uTime * distortionSpeed);
distortion *= uDistortionAmount;
vec3 base = texture(uSceneTex, uv + distortion * plumeMask).rgb;
```

Then add emissive flame on top additively.

### 7.6 Study 03 Milestone

You’re done when:

- The rocket has a directional plume that:
  - Aligns with `uPlumeAngle`,
  - Has a tunable length and width,
  - Shows some banding / flicker,
  - Optionally refracts the background.

---

## 8. Suggested Practice Loop

To really **own** Phase 2:

- For each new concept:
  1. Try it in a **tiny debug shader** (no plate, just colors).
  2. Port it into the relevant Study (01, 02, or 03).
  3. Save a versioned screenshot or commit (e.g. `study02_radial_v1`, `study03_plume_v1`).

You don’t need to do everything at once. The important part is:
- **Small steps**,  
- **Constant visual feedback**,  
- Always tying the abstract concept back to one of your **three shots**.
