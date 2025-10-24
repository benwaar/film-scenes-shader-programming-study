# Player layout (no build step)

- Put this `player/` folder in your repo root.
- Keep your shaders in repo root at `shaders/`.
- Maintain `shaders/manifest.json` by hand — list the `.frag` files you want in the dropdown.

Run:
```
cd player
python -m http.server 8000
# open http://localhost:8000
```
