# Phase 2 – Learn to Program Shaders (with 3 Study Shots)
_Updated: 2025-11-10_

Phase 2 is about **actually learning to write shaders** in small, safe steps, while gradually building up the three target effects:

1. Study 01 – Foundations / Cinematic Post  
2. Study 02 – Distant Forest Explosion  
3. Study 03 – Rocket Propulsion  

The idea: lots of tiny exercises → each one adds one new concept → we immediately plug it into one of the study shots so it never feels abstract.

---

## Legend (tags) & Progress

- 🎨 **ART** – visual / cinematic craft (composition, grading, FX readability)  
- 💡 **SHADER** – core shader literacy (GLSL, UVs, textures, uniforms)  
- 🧮 **MATH** – math & signal-processing (distance, interpolation, frequency)  
- 🧵 **PAR** – parallel / GPU thinking (data-parallel, divergence, coherence)  
- 🧱 **ENG** – software-engineering habits (debugging, modularity, APIs, reproducibility)

**Progress legend:**  
- `[ ]` = not started · `[▶]` = in progress · `[✓]` = done

> Tip: replace `[ ]` with `[▶]` or `[✓]` as you move through tasks. Keep commits or screenshots when you hit milestones.

---

## 0. Goals & Mental Model – 💡 SHADER · 🧵 PAR · 🧱 ENG

By the end of Phase 2 you should feel:

- [ ] Comfortable editing fragment shaders without fear of “breaking everything”. 💡🧱  
- [ ] Able to **reason in UV space** (0–1 coordinates over the screen). 💡🧮  
- [ ] Familiar with:  
  - [ ] Color math (mixing, lerp, contrast, saturation). 💡🧮🎨  
  - [ ] Time-based animation (`uTime`, normalized 0–1 “life”). 💡🧮  
  - [ ] Simple noise and patterns. 💡🧮  
  - [ ] Masks and compositing (putting FX “behind” things). 💡🎨  
- [ ] Confident that you can sit down and build:  
  - [ ] A **simple post-process pass** (Study 01), 💡🎨  
  - [ ] A **radial explosion over a plate** (Study 02), 💡🧮🧵  
  - [ ] A **directional plume** (Study 03). 💡🧮🧵  

> 🧵 **PAR mental model:** A fragment shader is a tiny function that runs **independently for every pixel in parallel**. Given the same inputs, it always produces the same color (like a pure function).

---

## 1. Warm-Up – Shader Comfort – 💡 SHADER · 🧱 ENG

**Goal:** Know where the shader file is, how to run it, and how not to panic.

You’re just getting comfortable poking at the code and seeing cause → effect.

### 1.1 Open and poke – 💡 SHADER

- [ ] Open the Study 01 shader (e.g. `study01_*.frag`).  
- [ ] Find:  
  - [ ] The **main function** (`main()` / `mainImage()` depending on setup).  
  - [ ] The **uniforms** (`uSceneTex`, `uTime`, `uResolution`, etc).  
  - [ ] The **final color output** line.  

**Mini exercises – 🧱 ENG**

- [ ] Change a constant (e.g. a vignette strength or exposure value).  
- [ ] Recompile / reload and observe what changed.  
- [ ] Add a comment anchor, e.g. `// TODO: this is where we'll add glow`.  

> ✅ When this feels trivial, move on.

---

## 2. UV Space & Basic Shapes – 💡 SHADER · 🧮 MATH · 🧵 PAR

**Goal:** Be at home in normalized coordinates and simple distance-based shapes.

We’ll work mostly in a `debug` mode first, then apply things directly to Study 01 / 02.

### 2.1 See the UVs – 💡 SHADER · 🧮 MATH

In a throwaway or debug shader, you want to *see* the coordinate system.

```glsl
vec2 uv = vUv; // or computed from fragCoord / uResolution
fragColor = vec4(uv, 0.0, 1.0);
```

You should see:
- left = black, right = red,  
- bottom = black, top = green,  
- a diagonal gradient across the screen.

**Mini exercises – 💡 SHADER · 🧮 MATH**

- [ ] Flip X or Y (`uv.y = 1.0 - uv.y;`) and see what happens.  
- [ ] Zoom UV (`uv *= 2.0;`) and see the tiling / repetition.  
- [ ] Offset UV (`uv += vec2(0.1, 0.0);`) and notice the shift.  

> 🧵 **PAR note:** Every pixel runs this same code with a different `uv`. There’s no shared state between pixels—this is pure, perfect data-parallel work.

### 2.2 Circles & masks – 💡 SHADER · 🧮 MATH

**Concept:** Distance from a point in UV.

```glsl
vec2 uv = vUv;
vec2 center = vec2(0.5);
float dist = length(uv - center);
```

**Mini exercises – 🧮 MATH**

- [ ] Use `dist` as a grayscale:

```glsl
float v = dist;        // 0 at center, ~0.7 at corners
fragColor = vec4(vec3(v), 1.0);
```

- [ ] Create a **soft circle** with `smoothstep`:

```glsl
float radius = 0.3;
float edge = 0.02;
float circle = 1.0 - smoothstep(radius - edge, radius + edge, dist);
fragColor = vec4(vec3(circle), 1.0);
```

- [ ] Move the circle with a uniform (e.g. `uCirclePos`).  

> 🧵 **PAR note:** Using `smoothstep` instead of `if (dist < radius)` is a **branchless**, GPU-friendly way to decide “inside vs outside” that plays nicely with SIMD execution and gives nice anti-aliased edges.

### 2.3 Apply to Study 02 – 💡 SHADER · 🎨 ART

Now you bring this into the real shot.

- [ ] In Study 02’s shader, temporarily replace the “explosion” with a simple circle mask.  
- [ ] Use `uExplosionPos` and `uExplosionSize` to place and scale the circle.  
- [ ] Output the base plate with your circle **added** as a faint brightening.  
- [ ] Confirm the circle appears in the expected valley/sky region.

> 🔍 Don’t worry about color or realism yet—this is just about precise placement.

**Milestone**  
- [ ] **You can put a soft circle exactly where you want in the shot.**

---

## 3. Color, Blending & Grading – 🎨 ART · 💡 SHADER · 🧮 MATH

**Goal:** Understand how to colorize masks and combine them with the plate in ways that feel like light, not just paint.

### 3.1 Solid colors & mix – 🎨 ART · 🧮 MATH

In a debug shader or in Study 01, start from a grayscale mask `m` (0–1).

```glsl
vec3 a = vec3(0.0, 0.0, 0.0);  // black
vec3 b = vec3(1.0, 0.5, 0.0);  // orange
vec3 col = mix(a, b, m);
```

**Mini exercises – 🎨 ART · 🧮 MATH**

- [ ] Try `mix(colorA, colorB, uv.x)` to see a left/right gradient between colors.  
- [ ] Use `pow(m, 2.0)` or `sqrt(m)` before mixing to change the contrast curve.  
- [ ] Try three-color blend: center → mid → edge using two masks or chained `mix` calls.

### 3.2 Additive vs normal blend – 🎨 ART · 💡 SHADER

Given:

```glsl
vec3 base = texture(uSceneTex, uv).rgb;
vec3 fx   = someEffectColor;
```

Experiment:

- [ ] Use **normal mix**:

```glsl
vec3 c = mix(base, fx, alpha);
```

- [ ] Use **additive**:

```glsl
vec3 c = base + fx;
```

- [ ] Use **additive with mask**:

```glsl
vec3 c = base + fx * mask;
```

**Mini exercises – 🎨 ART**

- [ ] Add a small white circle to the forest plate using normal mix and look at how it flattens things.  
- [ ] Add the same circle additively and see how it feels like a light source.  
- [ ] Try lowering intensity (e.g. multiply `fx` by 0.3) and judge which feels more cinematic.

### 3.3 Apply to Study 02 – 🎨 ART · 💡 SHADER

- [ ] Take the explosion circle mask from Section 2.  
- [ ] Create a simple fire color: near center = white/yellow, outer edge = orange/red.  
- [ ] Add it **additively** on top of the plate, with a modest intensity.  
- [ ] Check that the plate still reads clearly (don’t blow out everything).  

> ✅ When you can colorize a mask and choose between normal/additive intentionally, you’re ready for time & motion.

**Milestone**  
- [ ] **Explosion has a clear fire color and feels emissive, not painted.**

---

## 4. Time & Motion – 💡 SHADER · 🧮 MATH · 🧵 PAR

**Goal:** Learn to animate things using `uTime` and normalized “life” values.

### 4.1 Simple time experiments – 💡 SHADER · 🧮 MATH

In a debug shader:

```glsl
float t = uTime;
float v = 0.5 + 0.5 * sin(t);
fragColor = vec4(vec3(v), 1.0);
```

**Mini exercises – 🧮 MATH**

- [ ] Change the speed: `sin(t * 2.0)` vs `sin(t * 0.1)`.  
- [ ] Create a pulsing circle where radius depends on `sin(t)`.  
- [ ] Create an animated gradient that slides left/right by offsetting `uv.x` with `sin(t)`.

> 🧵 **PAR note:** Time is just another uniform—**every pixel** sees the same `uTime` and animates identically in terms of timing, still fully parallel.

### 4.2 Normalized life – 💡 SHADER · 🧮 MATH

For explosions we want a 0→1 timeline:

```glsl
float t = max(uTime - uExplosionStart, 0.0);
float life = clamp(t / uExplosionDuration, 0.0, 1.0);
```

**Mini exercises – 🧮 MATH**

- [ ] Visualize `life` as grayscale on screen (dark at start, bright at end).  
- [ ] Use `life` to drive radius growth: `radius = mix(startR, endR, life);`.  
- [ ] Use `life` or a curve of it (like `life * (1.0 - life)`) to drive intensity, peaking in the middle.

### 4.3 Apply to Study 02 – 💡 SHADER · 🎨 ART

- [ ] Use `life` to grow the explosion radius over time.  
- [ ] Make brightness peak early (e.g. around `life ~ 0.1-0.2`) and then fade.  
- [ ] Ensure start/end are clean (no lingering glow past `uExplosionDuration`).  

You now have a **timed, growing, fading circle** over the forest.

**Milestone**  
- [ ] **Explosion timing feels under control (you can make it fast/slow/flashy at will).**

---

## 5. Noise & Detail – 💡 SHADER · 🧮 MATH · 🧵 PAR

**Goal:** Break up perfect gradients into something more natural and “FX-like”.

(Exact noise function depends on the project; use whatever utility is already in the repo.)

### 5.1 Visualizing noise – 💡 SHADER · 🧮 MATH

In a debug shader:

```glsl
float n = snoise(vec3(uv * 5.0, uTime));
n = n * 0.5 + 0.5; // remap -1..1 to 0..1
fragColor = vec4(vec3(n), 1.0);
```

**Mini exercises – 🧮 MATH**

- [ ] Change frequency: try `uv * 2.0`, `uv * 10.0`, `uv * 40.0`.  
- [ ] Stop time (`uTime = 0.0` or constant) to compare static vs animated noise.  
- [ ] Observe how higher frequency starts to alias / shimmer.

> 🧵 **PAR note:** Noise is computed per-pixel with no shared state. It’s a classic data-parallel workload: same function, millions of independent inputs.

### 5.2 Noise-modded masks – 💡 SHADER · 🧮 MATH

Take the circle mask from earlier and multiply by noise:

```glsl
float circle = ...;     // 0..1
float n = snoise(vec3(uv * 20.0, uTime * 2.0));
n = n * 0.5 + 0.5;
float mask = circle * smoothstep(0.2, 1.0, n);
```

Now the circle edge is broken and flickery.

**Mini exercises – 🧮 MATH**

- [ ] Tune noise frequency until the edge feels detailed but not noisy at your render resolution.  
- [ ] Adjust `smoothstep` thresholds to control how “chunky” or “wispy” the edges look.  
- [ ] Try different animation speeds for the noise and observe perceived “energy level”.

### 5.3 Apply to Study 02 – 🎨 ART · 💡 SHADER

- [ ] Plug noisy mask into your explosion color.  
- [ ] Check that the fireball edge feels irregular/boiling rather than perfect.  
- [ ] Try dialing back noise strength to avoid over-busy edges.

You now have a **boiling, noisy fireball**.

**Milestone**  
- [ ] **Explosion no longer looks like a clean vector circle; it has believable texture.**

---

## 6. Masks & Compositing (Depth Fake) – 🎨 ART · 💡 SHADER · 🧱 ENG

**Goal:** Use a mask texture to hide FX behind foreground elements and integrate everything into the plate.

### 6.1 Visualize the mask – 💡 SHADER

In Study 02:

```glsl
float m = texture(uMaskTex, uv).r;
fragColor = vec4(vec3(m), 1.0);
```

You should see:
- White where trees/ridge/character are,  
- Black where sky/mountains/valley are.

- [ ] Confirm the mask aligns correctly with the underlying plate.  
- [ ] Fix/adjust mask painting if necessary.

### 6.2 Use mask to hide FX – 💡 SHADER · 🎨 ART

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

- [ ] Implement the mix and verify occlusion looks right.  
- [ ] Scrub through explosion timing and check that it never “pops” in front of trees/ridge.

> 🧵 **PAR note:** Each pixel decides independently whether to show FX or foreground based on the mask value at that pixel. No shared memory—just consistent rules applied everywhere.

### 6.3 Study 02 Milestone – 🎨 ART · 💡 SHADER · 🧱 ENG

At this point you should have:

- [ ] A timed, growing, noisy, colored explosion.  
- [ ] Additive glow (if implemented).  
- [ ] Smoke and/or darkening around it (optional, but nice).  
- [ ] Correct foreground occlusion using the mask.  

> 🎯 **Milestone:** Save as a “Study 02 v1” state (screenshot + commit or tag).

---

## 7. Directional FX – Rocket Plume – 💡 SHADER · 🧮 MATH · 🧵 PAR

Now we reuse all the pieces (UVs, time, noise, color, masks) but in a **directional** way for Study 03.

**Goal:** Model a directional jet, not a radial ball.

### 7.1 Local axis & coordinates – 💡 SHADER · 🧮 MATH

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

**Mini exercises – 🧮 MATH**

- [ ] Visualize `q.x` as a grayscale (along-axis gradient).  
- [ ] Visualize `q.y` as a grayscale (distance from axis).  
- [ ] Make a static stripe where `q.x` is between 0 and a length `L`.

### 7.2 Cone / jet shape – 💡 SHADER · 🧮 MATH

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

- [ ] Implement `plumeMask` and visualize it as grayscale.  
- [ ] Adjust `uPlumeLength` and `uPlumeWidth` until the shape feels like your reference.

### 7.3 Bands / shock diamonds – 💡 SHADER · 🧮 MATH

Add a periodic pattern along the axis:

```glsl
float bands = 0.5 + 0.5 * sin(along * bandFrequency + uTime * bandSpeed);
float bandMask = mix(0.7, 1.3, bands); // slightly brighten/darken
float plume = plumeMask * bandMask;
```

- [ ] Add banding modulation and confirm it reads as subtle bright/dark rings.  
- [ ] Tune frequency so you see a few bands, not a dense barcode.

### 7.4 Apply color & animation – 🎨 ART · 💡 SHADER

- [ ] Use `along / uPlumeLength` to drive a color ramp:  
  - White/yellow near nozzle, orange mid, red/brown far.  
- [ ] Animate noise similar to Study 02: `snoise(vec3(q * frequency, uTime * speed))`.  
- [ ] Scroll noise in the along-axis direction to suggest outward flow.  

> 🧵 **PAR note:** Just like the explosion, each pixel along the plume independently computes its own brightness and color from the same rules. That’s the GPU at its happiest: “same work, different data”.

### 7.5 Heat distortion (stretch goal) – 💡 SHADER · 🧮 MATH · 🧵 PAR

Instead of (or in addition to) emissive color:

- [ ] Use noise to offset background UVs inside `plumeMask`:

```glsl
vec2 distortion = noise2D(q * distortionFreq + uTime * distortionSpeed);
distortion *= uDistortionAmount;
vec3 base = texture(uSceneTex, uv + distortion * plumeMask).rgb;
```

- [ ] Keep distortion small and smooth to avoid ugly artifacts.  
- [ ] Compare look with/without distortion to decide if it helps clarity.

> 🧵 **PAR note:** Distortion is “sample the texture at a slightly different UV per pixel”. Keeping offsets smooth means neighboring pixels sample neighboring locations → better cache behavior and fewer artifacts.

### 7.6 Study 03 Milestone – 🎨 ART · 💡 SHADER · 🧱 ENG

You’re done when:

- [ ] The rocket has a directional plume that aligns with `uPlumeAngle`.  
- [ ] Length and width feel right for the shot.  
- [ ] Banding / flicker are visible but not distracting.  
- [ ] Optional heat distortion feels physically plausible and not too noisy.  

> 🎯 **Milestone:** Save as “Study 03 v1” and record useful parameter values (`uPlumeLength`, `uPlumeWidth`, `bandFrequency`, etc).

---

## 8. Suggested Practice Loop – 🧱 ENG · 🧵 PAR

To really **own** Phase 2:

- [ ] For each new concept, build a **tiny debug shader** that shows it in isolation (no plate, just colors). 💡🧮  
- [ ] Port the concept into the relevant Study (01, 02, or 03). 💡🎨  
- [ ] Save a versioned screenshot or commit (e.g. `study02_radial_v1`, `study03_plume_v1`). 🧱  
- [ ] Follow an A/B discipline: change ≤ 2 parameters per run, note what happened. 🧱  
- [ ] Keep asking: “Does each pixel have all the inputs it needs locally?” If yes, you’re designing in a GPU-friendly way. 🧵  

The important part isn’t racing through all steps—it’s moving in **small steps**, with **constant visual feedback**, always tying the abstract concept back to one of your **three shots**.
