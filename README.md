# Birthday-Sister

A small birthday landing page upgraded to include a lightweight Three.js 3D scene with an animated cake, floating balloons, clickable candle blow-out behavior, and a confetti overlay.

This README explains how to run the site locally, where to place assets, and how to customize the 3D scene and interactions.

---

## Files

- `index.html` – page markup (includes a `#threeContainer` where the WebGL canvas is mounted)
- `style.css` – complete styling (includes rules for the 3D canvas and confetti overlay)
- `script.js` – module script that builds the Three.js scene and implements UI behavior:
  - Cake, candles, balloons, spark particles
  - Click/tap a flame to extinguish it
  - When all candles are out, confetti animation plays
  - Music toggle, surprise modal, countdown, and reveal observer are preserved
- `assets/` – (not included by default) store music, sounds, and photos here
  - `assets/music/birthday.mp3` — optional birthday song used by the Music button
  - `assets/sounds/blow.mp3` — optional short "blow" sound for candle extinguish
  - `assets/images/photo1.jpg` .. `photo4.jpg` — optional gallery photos

---

## Run locally

From the repository root run a simple static server (Python example):

```bash
python -m http.server 8000
```

Then open:

http://localhost:8000

Notes:
- Some browsers block audio autoplay. Use the Music button to start playback with a user gesture.
- WebGL is disabled in some older browsers or low-power devices. The page gracefully falls back to decorative DOM elements.

---

## Customize

Change the birthday date used by the countdown
- In `script.js` modify the `getNextBirthdayDate()` function. It currently uses September 15 (month 8, day 15).

Swap the music or add a blow sound
- Place your favorite song at `assets/music/birthday.mp3`.
- Optionally add a short blow sound at `assets/sounds/blow.mp3` to replace the soft built-in WebAudio puff.

Use your photos
- Replace `assets/images/photo1.jpg` .. `photo4.jpg` with your photos. The CSS will use them as the gallery backgrounds.

Add 3D models
- If you want a photorealistic cake or custom balloons, add `.gltf`/`.glb` files to `assets/models/` and I can update `script.js` to load them using GLTFLoader.

Performance tuning
- The scene is tuned for moderate devices. To enable a low-power mode:
  - Lower the renderer pixel ratio (line with `renderer.setPixelRatio(...)` in `script.js`).
  - Reduce `particleCount` in the script.
  - Disable the confetti overlay on small screens (already hidden via CSS under 420px).

Accessibility
- The 3D canvas is marked `aria-hidden` and the page keeps fallback DOM decorations for users with limited WebGL support.
- Countdown values are in an `aria-live="polite"` container to announce updates to assistive tech.

---

## Developer notes

- The site uses Three.js from the UNPKG CDN in module form. If you prefer a locked dependency, download the build files into `vendor/` and update script imports.
- The code is written in vanilla JS as an ES module. Keep `type="module"` on the `<script>` tag in `index.html`.

---

If you'd like, I can:
- Add sample placeholder audio files (music and blow sound) into `assets/`.
- Add GLTF model loading and a progress bar.
- Implement microphone-based blow detection (requires user permission and careful UX handling).

Tell me which of the above you want and I will update the repository accordingly.
