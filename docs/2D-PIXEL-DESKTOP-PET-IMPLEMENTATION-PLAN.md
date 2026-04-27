# 2D Pixel Desktop Pet MVP Implementation Plan

## Goal

Create a separate 8-bit/16-bit pure 2D MVP version of the current OpenClaw desktop pet while preserving the existing Minecraft-style Three.js version.

The current 3D implementation must remain usable and unchanged unless a shared compatibility fix is required. The 2D version should be a duplicated skeleton with its own renderer, assets, and entry point, but it should reuse the product behavior model where practical.

## Non-Goals

- Do not replace `src/index.html` as the default 3D desktop pet.
- Do not remove Three.js or the Minecraft-style avatar.
- Do not migrate the browser demo in `web/index.html`.
- Do not build polished final sprite sheets before the MVP works.
- Do not add OpenClaw hook/SSE integration in the first 2D MVP pass.

## Current 3D Baseline

Main desktop app:

- `src/index.html`
- `src/main.js`
- `src/styles.css`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`

The active desktop implementation is mostly inline in `src/index.html`:

- Three.js transparent renderer.
- Minecraft-style cuboid rabbit maid avatar.
- Generated 64x64 skin texture.
- Pucci companion built from 3D boxes.
- Right-click context menu.
- Notification bubble.
- Autonomous action scheduler.
- Startup and quit animation timelines.
- Drag-to-move Tauri window behavior.
- Roaming, scale presets, quiet mode, weapon toggle, emotion toggle.

Important existing actions:

- `idle`
- `wave`
- `jump`
- `spin`
- `look`
- `dance`
- `sit`
- `sleep`
- `run`
- `stretch`
- `sneeze`
- `nod`
- `eat`
- `typing`
- `headpat`

## Reference Art Notes

Reference files:

- `references/npc_rabbit/npc_rabbit_reference.png`
- `references/pucci/pucci1.png`
- `references/pucci/pucci2.png`
- `references/pucci/pucci3.png`
- `references/pucci/pucci4.png`
- `references/nzxt_logo.png`

Rabbit identity to preserve:

- Chibi rabbit maid silhouette.
- Large head and eyes.
- Tall rabbit ears.
- Pale blue hair.
- Twin tails.
- White maid headband.
- Blue maid dress.
- White apron.
- Blue bow.
- White gloves.
- Blush cheeks.
- Optional NPC badge or small apron mark.

Pucci identity to preserve:

- Rounded purple square body.
- Dark purple side/shadow.
- Simple dot eyes.
- White mouth/tooth opening.
- Tiny arms and legs.
- Occasional accessories can come later.

## Proposed File Layout

Keep the current 3D entry point:

- `src/index.html`

Add a separate 2D entry point:

- `src/index-2d.html`

Add 2D-specific source files:

- `src/2d/main.js`
- `src/2d/styles.css`
- `src/2d/state.js`
- `src/2d/renderer.js`
- `src/2d/sprite-manifest.js`
- `src/2d/sprites/rabbit-procedural.js`
- `src/2d/sprites/pucci-procedural.js`
- `src/2d/effects.js`
- `src/2d/ui.js`
- `src/2d/tauri-window.js`

Optional later asset folder:

- `src/2d/assets/rabbit-sheet.png`
- `src/2d/assets/pucci-sheet.png`
- `src/2d/assets/props-sheet.png`

## Tauri Entry Strategy

Decision: use a `?mode=2d` query param on a shared thin loader so both versions are reachable from a single Tauri build, without touching `tauri.conf.json` per session.

Concretely:

- Keep `src/index.html` as the Tauri entry point.
- Add a small inline check at the top of `src/index.html` that, when `location.search` contains `mode=2d`, redirects (or `location.replace`s) to `src/index-2d.html`.
- Default (no query) loads the existing 3D pet exactly as today — no behavior change for current users.
- During 2D development, run `cargo tauri dev` and append `?mode=2d` to the dev URL, or temporarily open `src/index-2d.html` directly.
- The 3D context menu later gains an "Open 2D Pixel Pet" item that reloads with `?mode=2d`. The 2D context menu gains the inverse.

This unblocks the Tauri verification checklist without forking the Tauri config.

## Renderer Requirements

Use Canvas 2D only.

No Three.js, no WebGL, no DOM-based body-part animation for the pet itself.

Canvas setup:

- Full transparent window canvas.
- Low internal pixel resolution, scaled up.
- Internal logical canvas size is **fixed** at `160x192` for the MVP. Scale presets resize the Tauri window and the CSS display size only — never the internal canvas — to keep pixel art crisp at integer multiples (2x, 3x, 4x).
- Use `ctx.imageSmoothingEnabled = false`.
- CSS should use `image-rendering: pixelated`.

Frame timing:

- Render via `requestAnimationFrame`.
- Animation frame stepping is decoupled from render frame: each animation tracks elapsed time and advances based on its declared `fps`. This avoids tying sprite cadence to monitor refresh rate.

Recommended render pipeline:

1. Clear transparent canvas.
2. Update state machine.
3. Draw shadow blob.
4. Draw Pucci.
5. Draw rabbit.
6. Draw props.
7. Draw effects.
8. Let DOM notification bubble and context menu render above canvas.

## Sprite Architecture

Use a sprite manifest so procedural MVP art can later be replaced by real sprite sheets.

For the MVP, `frames` are **string pose keys** that map to procedural draw functions in `rabbit-procedural.js` / `pucci-procedural.js`. When a real PNG atlas is added later, the same keys map to atlas frame indices via a lookup table — the state machine and animation player do not change.

All coordinates (`anchor`, `hitboxes`) are in **frame-local pixels with top-left origin**, at internal logical resolution. The renderer applies anchor + world position + scale at draw time. Hitboxes are per-sprite for the MVP (not per-animation); the sleep/sit poses tolerate a slightly loose head hitbox.

Suggested shape:

```js
export const RABBIT_SPRITE = {
  id: "rabbit-maid",
  frameSize: { w: 64, h: 80 },
  anchor: { x: 32, y: 74 }, // feet center, frame-local
  hitboxes: {
    head: { x: 16, y: 8, w: 32, h: 28 },
    body: { x: 18, y: 34, w: 28, h: 34 }
  },
  animations: {
    idle:    { frames: ["idle_a", "idle_b", "idle_a", "idle_c"], fps: 4,  loop: true },
    wave:    { frames: ["wave_a", "wave_b", "wave_c", "wave_b"], fps: 8,  loop: true },
    run:     { frames: ["run_a", "run_b", "run_c", "run_b"],     fps: 10, loop: true },
    sleep:   { frames: ["sleep_a", "sleep_b"],                   fps: 2,  loop: true },
    eat:     { frames: ["eat_a", "eat_b", "eat_c", "eat_b"],     fps: 6,  loop: true },
    typing:  { frames: ["type_a", "type_b"],                     fps: 8,  loop: true },
    headpat: { frames: ["pat_a", "pat_b", "pat_c", "pat_b"],     fps: 12, loop: true }
  }
};
```

For MVP, `rabbit-procedural.js` exports `drawPose(ctx, poseKey, ...)` and a registry mapping keys to draw functions. Later, `renderer.js` can swap to `drawImage()` from a PNG atlas (with a separate manifest mapping keys → integer frame indices) without changing the state machine.

## MVP Animation Mapping

Implement these first:

- `idle`: breathing offset, blink, slight ear twitch.
- `wave`: right arm wave, happy face.
- `run`: walking/running loop for roaming.
- `sleep`: seated/sleep pose with closed eyes and optional Z effect.
- `eat`: carrot prop near mouth.
- `typing`: laptop prop and alternating hands.
- `headpat`: blush, ear shake, head wobble.

Map lower-priority current 3D actions to MVP fallbacks:

- `jump` -> simple vertical bounce using `idle` or a `jump` frame if quick.
- `spin` -> horizontal flip or squash/stretch effect.
- `look` -> idle with eye offset.
- `dance` -> wave/run hybrid.
- `sit` -> sleep pose with open eyes.
- `stretch` -> wave-like arms-up frame.
- `sneeze` -> quick squash frame.
- `nod` -> idle with head Y offset.

This preserves behavior coverage without requiring all final art in the first pass.

## State Machine

Move the reusable behavior concepts from the current 3D file into `src/2d/state.js`.

Keep:

- `currentAction`
- `actionTimer`
- `nextActionDelay`
- time-of-day weighted action selection
- quiet mode
- roaming state
- scale preset state
- current emotion
- startup/quit state

Do not copy Three.js object/mesh mutation code. **Do** lift the action scheduler logic near-verbatim — weighted random action selection, time-of-day weights, quiet-mode gating, and the `nextActionDelay` / `actionTimer` driver in `src/index.html` are pure logic and should move into `state.js` unchanged in spirit. Only the per-action body that mutates Three.js objects gets rewritten as renderer-friendly state.

Convert each action into renderer-friendly state:

```js
{
  action: "idle",
  emotion: "normal",
  facing: "right",
  poseTime: 1.25,           // seconds since action started
  animFrameIndex: 2,        // current index into animations[action].frames
  velocity: { x: 0, y: 0 }, // for roaming / window-move computation
  offset: { x: 0, y: 0 },   // small in-canvas displacement (idle bob, etc.)
  scale: 2,                 // CSS/window display scale, NOT internal canvas
  props: {
    carrot: true,
    sword: false,
    laptop: false
  },
  effects: ["blink"]
}
```

Roaming + window movement parity: the rabbit is always drawn centered horizontally in the canvas. Roaming moves the **Tauri window**, not the in-canvas sprite. `offset.x/y` is reserved for small per-action displacements (idle bob, jump bounce, sneeze recoil). `velocity` drives the window-move call, not the canvas draw position.

## 2D Interaction Parity

Preserve these desktop interactions:

- Left mouse drag starts Tauri window dragging.
- Right-click opens context menu.
- Double-click triggers a random action.
- Single click on head hitbox triggers `headpat`.
- `D` key toggles dark mode (matches 3D version).
- Diamond sword toggle is exposed as a context menu prop toggle (no keyboard shortcut needed for MVP).
- Context menu toggles roaming.
- Context menu toggles carrot/sword prop.
- Context menu cycles emotion.
- Context menu toggles quiet mode.
- Context menu cycles scale.
- Context menu triggers test notification.
- Context menu triggers typing action.
- Context menu triggers quit animation.

DOM elements (notification bubble, context menu, dark-mode styling) are **duplicated** into `src/index-2d.html` and `src/2d/styles.css` rather than shared with the 3D version, matching the project rule that the two entry points evolve independently.

Replace 3D raycast head detection with 2D hitbox math:

1. Convert mouse position to internal canvas coordinates.
2. Compare against the active rabbit head hitbox.
3. Trigger `headpat` if inside.

## Startup And Quit MVP

Startup sequence:

1. Pixel NZXT logo appears.
2. Small pixel hole opens.
3. Rabbit pops up with bounce.
4. Pucci pops up beside rabbit.
5. Hole closes.
6. Enter `idle`.

Quit sequence:

1. Rabbit waves.
2. Hole opens.
3. Rabbit drops into hole.
4. Pucci hesitates then drops.
5. Hole closes.
6. Tauri window closes.

Implement these in `effects.js` as timeline phases, not as ad hoc code inside the renderer.

## Art MVP Approach

Use procedural pixel art first.

Reason:

- Fast to iterate.
- No external art dependency.
- Easy to preserve transparent edges.
- Keeps implementation testable before final sprite sheets.

Procedural style constraints:

- Use a limited palette.
- Avoid gradients.
- Use 1px or 2px dark outlines at internal resolution.
- Use blocky stepped curves, not anti-aliased curves.
- Keep rabbit readable at 2x and 3x scale.
- Keep Pucci simpler and slightly smaller than rabbit.

Initial palette:

- Outline: `#223047`
- Skin: `#ffd7c2`
- Skin shadow: `#e9ad9b`
- Blush: `#ff8fa3`
- Hair light: `#b8d8ee`
- Hair main: `#8eb8d4`
- Hair shadow: `#5f86a3`
- Dress: `#234987`
- Dress shadow: `#172f5d`
- Apron: `#ffffff`
- Apron shadow: `#d7e1ed`
- Pucci main: `#5a2d86`
- Pucci shadow: `#321947`
- Pucci highlight: `#7b4bb0`

## Extension Hooks To Preserve

Design the 2D MVP so these are easy later:

- Real PNG sprite sheets.
- Multiple skins.
- Emotion overlays.
- Accessory overlays.
- OpenClaw event-driven actions.
- Public viewer mode.
- Telegram Mini App mode.
- Per-action sound effects.
- More Pucci behaviors.
- Small desktop mini interactions.

## Implementation Order

1. Add `src/index-2d.html`, `src/2d/main.js`, and `src/2d/styles.css`.
2. Create transparent Canvas 2D renderer with pixelated scaling.
3. Add procedural rabbit idle drawing.
4. Add procedural Pucci idle drawing.
5. Add state machine with `idle`, `wave`, `run`, `sleep`, `eat`, `typing`, `headpat`.
6. Add context menu copied in behavior but not tightly coupled to the 3D code.
7. Add Tauri drag support.
8. Add notification bubble support.
9. Add head hitbox detection.
10. Add roaming support.
11. Add scale presets.
12. Add startup timeline.
13. Add quit timeline.
14. Add fallback mapping for remaining 3D actions.
15. Verify in browser.
16. Verify in Tauri.
17. Decide final launch/switching mechanism.

## Verification Checklist

Browser:

- `src/index-2d.html` opens without module errors.
- Canvas background is transparent or visually blank behind pet.
- Pixel art is crisp, not blurred.
- Rabbit idles and blinks.
- Pucci appears beside rabbit.
- Right-click menu opens.
- Test notification appears.
- Double-click changes action.
- Head click triggers `headpat`.

Tauri:

- Window remains transparent.
- Left-drag moves the window.
- Right-click menu items are clickable.
- Quit animation closes the window.
- Roaming moves the Tauri window.
- Scale presets resize the window.

Regression:

- `src/index.html` still runs as the original 3D Three.js pet.
- No 3D behavior is removed.
- No web demo behavior is changed.

## Suggested Handover Prompt For Claude Code

Implement the 2D Pixel Desktop Pet MVP described in `docs/2D-PIXEL-DESKTOP-PET-IMPLEMENTATION-PLAN.md`.

Important constraints:

- Preserve the existing `src/index.html` Three.js/Minecraft desktop pet.
- Add a separate `src/index-2d.html` and `src/2d/` implementation.
- Use Canvas 2D only for the new 2D pet.
- Keep the implementation modular enough for future PNG sprite sheets.
- Start with procedural pixel art.
- Preserve desktop UX parity where listed in the plan.
- Do not refactor unrelated docs or the `web/` demo.

