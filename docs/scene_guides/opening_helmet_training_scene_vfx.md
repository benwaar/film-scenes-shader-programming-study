# VFX Breakdown – Opening: "Helmet Wake"

**Emotional beats → shader parameters**  
Goal: align panic → recognition → activation with visual language of the HUD.

## Beats & Parameters
| Beat | Visual Intent | Primary Params | Secondary Params | Shader(s) |
| --- | --- | --- | --- | --- |
| Confusion (0–1.2s) | Unstable bilingual flicker; chaotic scanlines | `u_lock≈0.0`, `flickRate: 1→2 Hz` | `scanStrength: 0.7`, `chromaSplit: 0.6` | `hud_text_flicker` |
| Rising Panic (1.2–2.6s) | Faster alternation; symbol appears; color shifts warmer | `flickRate: 2→9 Hz`, `tawaPulse: 0→1` | `hueShift: 0→+0.08`, `tearChance: +` | `hud_text_flicker` + `hud_symbol_pulse` |
| Recognition (2.6–3.0s) | Flicker slows but stabilizes toward TP; symbol dominates | `u_lock: 0.4→0.8`, `flickRate: 9→3 Hz` | `scanStrength: 0.5`, `chromaSplit: 0.3` | `hud_text_flicker` + `hud_symbol_pulse` |
| Activation (≈3.0s) | Lock to TP; pulse peaks; brightness bloom | `u_lock: 1.0`, `tawaPulse: 1.0` | `bloomBoost: +`, `hueShift: +0.12→0` | `hud_crt_curvature` (post) |
| Stabilize (3.0–3.5s) | Clean, readable TP; micro-noise only | `flickRate: 0`, `u_lock: 1.0` | `scanStrength: 0.3`, `chromaSplit: 0.1` | all |

## Parameter Glossary
- **u_lock (0–1):** global stability; 0=flicker, 1=locked TP.  
- **flickRate (Hz):** language swap frequency (dual-texture or per-glyph).  
- **tawaPulse (0–1):** symbol amplitude/intensity for *tawa* icon.  
- **scanStrength (0–1):** scanline modulation strength.  
- **chromaSplit (px):** RGB x-offset for CRT misalignment.  
- **hueShift (radians):** slight color rotation for stress.  
- **tearChance (0–1):** chance of horizontal tear per frame.  
- **bloomBoost:** post-pass brightness factor at activation.
