import { createState, setAction, CORE_ACTIONS } from './state.js';
import { setupCanvas, render, canvasToInternal, pointInRabbitHead, CANVAS_W, CANVAS_H } from './renderer.js';
import { updateState } from './state.js';

const canvas = document.getElementById('pet-canvas');
const hudLabel = document.getElementById('action-label');
const ctx = setupCanvas(canvas);
const state = createState();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  updateState(state, dt);
  render(ctx, state);
  if (hudLabel) hudLabel.textContent = state.currentAction;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Double-click — random action
canvas.addEventListener('dblclick', (e) => {
  e.preventDefault();
  const next = CORE_ACTIONS[Math.floor(Math.random() * CORE_ACTIONS.length)];
  setAction(state, next, { force: true });
});

// Click — head hitbox triggers headpat
canvas.addEventListener('click', (e) => {
  const { x, y } = canvasToInternal(canvas, e.clientX, e.clientY);
  if (pointInRabbitHead(x, y)) {
    setAction(state, 'headpat', { force: true });
  }
});

// D key toggles dark mode
window.addEventListener('keydown', (e) => {
  if (e.key === 'd' || e.key === 'D') {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark', state.darkMode);
  }
});

// Suppress default context menu in browser (real menu comes in step 6)
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

// Expose for debugging
window.__pet = { state, setAction, CORE_ACTIONS };
