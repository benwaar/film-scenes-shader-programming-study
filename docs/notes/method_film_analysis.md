# Method: Describe → Identify → Extract (No-Upload Film Analysis)

Goal: analyze film text-effects without clips. We capture intent and visual behaviors, then map them to shader tasks.

## Step 1 — Describe (your effect brief)
- **Display context:** screen, visor, paper, hologram…
- **Era/style cues:** 80s CRT, modern OLED, magical ink…
- **Behavior:** flicker, dissolve, morph, scan, tear, lock…
- **Language dynamics:** A↔B switching, reveal, partial translation…
- **End state:** what it settles to (e.g., Toki Pona)

## Step 2 — Identify (candidate scenes)
List 3–5 scenes that feel similar (title + 1 line why). No clips needed.

## Step 3 — Extract (visual attributes)
- **Timing:** fast→slow, loop, single lock
- **Masking:** noise, wipe, glow, threshold
- **Distortion:** tear, ripple, curvature
- **Color:** glow/bloom, chroma split, palette
- **Typography:** serif/sans, runes, logographs, SDF needs
- **UI framing:** gridlines, vignette, scanlines
- **Sound cues:** beeps on lock/tears (optional)

## Step 4 — Shader Mapping
- **Inputs:** textures/atlases/id maps
- **Uniforms:** u_time, u_lock, u_res, …
- **Passes:** single vs multi-pass (glow/curvature)
- **Perf notes:** tap counts, texture sizes
- **Acceptance checks:** precise checks that prove the look
