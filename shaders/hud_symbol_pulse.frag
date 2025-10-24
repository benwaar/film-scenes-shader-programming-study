#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 fragColor;

// This version matches the repo's WebGL2 player: it binds texEng and texToki,
// and exposes u_lock as the "pulse" slider in the UI.
uniform sampler2D texEng;   // base english text line (used as the underlay)
uniform sampler2D texToki;  // toki glyph line (used as the symbol mask)
uniform float u_time;       // seconds
uniform float u_lock;       // 0..1 (use the Player's slider or Auto)
uniform vec2  u_res;        // viewport (unused but kept for consistency)

// Optional small hue rotation (radians).
// Tip: try 0.0 (no change), 0.25, or -0.25.
uniform float hueShift; // [-0.5, 0.5] @step 0.01 @label Hue Shift (radians)

// --- helper: approximate hue rotation around luminance ---
mat3 hueRotate(float a){
    float c = cos(a), s = sin(a);
    const vec3 w = vec3(0.299, 0.587, 0.114);
    return mat3(
        w.x + (1.0 - w.x)*c + 0.0,  w.x*(1.0 - c) - w.x*s,  w.x*(1.0 - c) + (1.0 - w.x)*s,
        w.y*(1.0 - c) + w.y*s,      w.y + (1.0 - w.y)*c + 0.0,  w.y*(1.0 - c) - w.y*s,
        w.z*(1.0 - c) - (1.0 - w.z)*s,  w.z*(1.0 - c) + (1.0 - w.z)*s,  w.z + (1.0 - w.z)*c + 0.0
    );
}

// Ease the "pulse" so it feels softer near 0 and snappier near 1.
float shape(float x){
    x = clamp(x, 0.0, 1.0);
    return smoothstep(0.0, 1.0, x*x*(3.0 - 2.0*x));
}

void main(){
    // Underlay: english line
    vec3 base = texture(texEng, v_uv).rgb;

    // Mask: toki glyph line (treat brighter as "ink")
    float glyph = texture(texToki, v_uv).r;

    // Pulse: driven by u_lock (slider). You can also make it auto-blink:
    // float blink = 0.5 + 0.5*sin(6.28318*1.2*u_time);
    float pulse = shape(u_lock);

    // Symbol tint (amber-ish) that scales with pulse
    vec3 glyphCol = vec3(1.0, 0.8, 0.25) * mix(0.25, 1.0, pulse);

    // Soft additive glow around bright glyph pixels
    float glow = smoothstep(0.0, 1.0, glyph) * pulse * 0.6;

    // Composite: base + (glyph as color) using glyph as alpha
    vec3 comp = mix(base, glyphCol, glyph);
    comp += glyphCol * glow * 0.25;

    // Optional tiny hue rotation for stress cue
    comp = hueShift != 0.0 ? hueRotate(hueShift) * comp : comp;

    fragColor = vec4(comp, 1.0);
}
