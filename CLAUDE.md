# Minecraft Pet — Project Overview

## Two Separate HTML Versions

This project has **two completely independent HTML entry points** that share the same character design but serve different purposes:

### `web/index.html` — Standalone browser demo
- Full **keyboard-controlled** movement: WASD move, Space jump, **Ctrl run**, **Shift crouch/sneak**
- OrbitControls (mouse drag + scroll zoom)
- Full 3D scene: sky, fog, ground, flowers, trees, clouds, sakura particles
- Pucci (purple pet) follows avatar as AI companion
- FPS counter + speed display

### `src/index.html` — Tauri desktop app (transparent window)
- **No player input for movement** — avatar runs via autonomous AI state machine
- States: idle, walk, run, sit, sleep, dance, wave, spin, jump, nod, eat, headpat, sneeze, shake, celebrate, look, etc.
- Transparent background (sits on user's desktop)
- Right-click context menu: 開始亂跑 / 切換武器 / 測試通知 / 離開
- Notification speech bubble system
- Diamond sword toggle
- `D` key = dark mode toggle
- Tauri IPC integration (`data-tauri-drag-region`, Tauri API calls)

## Important Rules

- **Do NOT apply web/index.html movement/input features to src/index.html** — they have separate architectures.
- When asked to add a feature "to the character", clarify which version unless the user specifies (e.g., "@web/index.html").
- `web/index.html` is a self-contained single file (no build step, CDN imports).
- `src/index.html` is the Tauri frontend — changes are built/run via `cargo tauri dev`.
