# VFX Timing Map – "Helmet Wake"

**Timeline: 0.0 → 3.5s (WebGL player drives uniforms)**

| t (s) | u_lock | flickRate (Hz) | tawaPulse | scanStrength | chromaSplit | hueShift | Notes |
|------:|:------:|:--------------:|:---------:|:------------:|:-----------:|:--------:|------|
| 0.0   | 0.00   | 1.0            | 0.00      | 0.70         | 0.60        | 0.00     | wake, confusion, slow flicker |
| 0.6   | 0.10   | 1.8            | 0.10      | 0.70         | 0.60        | 0.02     | “GROUND APPROACHING” appears |
| 1.2   | 0.20   | 3.0            | 0.25      | 0.65         | 0.55        | 0.03     | symbol *tawa* enters (small) |
| 1.8   | 0.30   | 5.0            | 0.45      | 0.60         | 0.45        | 0.05     | panic rising, faster swaps |
| 2.4   | 0.45   | 7.0            | 0.65      | 0.55         | 0.35        | 0.06     | HUD “teaching” harder |
| 2.8   | 0.70   | 4.0            | 0.85      | 0.50         | 0.25        | 0.08     | recognition; symbol dominates |
| 3.0   | 1.00   | 0.0            | 1.00      | 0.45         | 0.15        | 0.12→0.00| **voice: “o tawa!”** → lock & bloom |
| 3.5   | 1.00   | 0.0            | 0.40      | 0.35         | 0.10        | 0.00     | stabilized TP; micro-noise |

**Easing:**  
- Use `quadIn` for flickRate ramp-up (feels like panic).  
- Use `smoothstep` for `u_lock`.  
- Use `attack/decay` envelope for `tawaPulse` (attack=fast, decay=slower).

**Acceptance checks:**  
- By **t=2.8s**, flicker visually favors TP ~70%.  
- At **t=3.0s**, TP is fully locked; no swaps for ≥0.3s.  
- Post-lock chroma < **0.5px**; scanlines still visible but reduced.
