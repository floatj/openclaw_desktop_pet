import { createState, setAction, CORE_ACTIONS, pickNextAction } from './state.js';
import { setupCanvas, render, canvasToInternal, pointInRabbitHead, pointInRabbit, pointInPucci } from './renderer.js';
import { updateState } from './state.js';

const canvas = document.getElementById('pet-canvas');
const hudLabel = document.getElementById('action-label');
const petMenu = document.getElementById('pet-menu');
const ctx = setupCanvas(canvas);
const state = createState();

const ACTION_LABELS = {
  idle: 'Idle',
  wave: 'Wave',
  run: 'Run',
  sit_down: 'Sit down',
  sleep: 'Sleep',
  eat: 'Eat',
  coding: 'Coding',
  headpat: 'Headpat',
};

function hidePetMenu() {
  if (!petMenu) return;
  petMenu.classList.remove('open');
  petMenu.setAttribute('aria-hidden', 'true');
}

function positionPetMenu(clientX, clientY) {
  if (!petMenu) return;
  const margin = 8;
  const rect = petMenu.getBoundingClientRect();
  const x = Math.min(clientX, window.innerWidth - rect.width - margin);
  const y = Math.min(clientY, window.innerHeight - rect.height - margin);
  petMenu.style.left = `${Math.max(margin, x)}px`;
  petMenu.style.top = `${Math.max(margin, y)}px`;
}

function buildPetMenu() {
  if (!petMenu) return;
  petMenu.innerHTML = '';

  const randomButton = document.createElement('button');
  randomButton.type = 'button';
  randomButton.setAttribute('role', 'menuitemradio');
  randomButton.dataset.action = 'random';
  randomButton.textContent = 'Random';
  petMenu.append(randomButton);

  for (const action of CORE_ACTIONS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('role', 'menuitemradio');
    button.dataset.action = action;
    button.textContent = ACTION_LABELS[action] ?? action;
    petMenu.append(button);
  }
}

function updatePetMenuChecks() {
  if (!petMenu) return;
  for (const button of petMenu.querySelectorAll('button')) {
    const isRandom = button.dataset.action === 'random';
    const checked = isRandom
      ? state.rabbitActionMode === 'random'
      : state.rabbitActionMode === 'manual' && button.dataset.action === state.currentAction;
    button.setAttribute('aria-checked', checked ? 'true' : 'false');
  }
}

function showPetMenu(clientX, clientY) {
  if (!petMenu) return;
  updatePetMenuChecks();
  petMenu.classList.add('open');
  petMenu.setAttribute('aria-hidden', 'false');
  positionPetMenu(clientX, clientY);
}

buildPetMenu();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  updateState(state, dt);
  render(ctx, state);
  if (hudLabel) {
    const mode = state.rabbitActionMode === 'manual' ? 'locked' : 'random';
    hudLabel.textContent = `${ACTION_LABELS[state.currentAction] ?? state.currentAction} · ${mode}`;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Double-click — random action
canvas.addEventListener('dblclick', (e) => {
  e.preventDefault();
  if (state.rabbitActionMode === 'manual') {
    hidePetMenu();
    return;
  }
  const next = CORE_ACTIONS[Math.floor(Math.random() * CORE_ACTIONS.length)];
  setAction(state, next, { force: true });
  hidePetMenu();
});

// Click — head hitbox triggers headpat
canvas.addEventListener('click', (e) => {
  if (state.rabbitActionMode === 'manual') return;
  const { x, y } = canvasToInternal(canvas, e.clientX, e.clientY);
  if (pointInRabbitHead(x, y)) {
    setAction(state, 'headpat', { force: true });
    hidePetMenu();
  }
});

// D key toggles dark mode
window.addEventListener('keydown', (e) => {
  if (e.key === 'd' || e.key === 'D') {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark', state.darkMode);
  }
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const { x, y } = canvasToInternal(canvas, e.clientX, e.clientY);
  if (pointInPucci(x, y) || pointInRabbit(x, y) || pointInRabbitHead(x, y)) {
    showPetMenu(e.clientX, e.clientY);
  } else {
    hidePetMenu();
  }
});

petMenu?.addEventListener('click', (e) => {
  const button = e.target.closest('button[data-action]');
  if (!button) return;

  if (button.dataset.action === 'random') {
    state.rabbitActionMode = 'random';
    setAction(state, pickNextAction(state), { force: true });
  } else {
    state.rabbitActionMode = 'manual';
    setAction(state, button.dataset.action, { force: true });
  }

  hidePetMenu();
});

window.addEventListener('pointerdown', (e) => {
  if (e.button === 2) return;
  if (petMenu?.contains(e.target)) return;
  hidePetMenu();
});

window.addEventListener('blur', hidePetMenu);
window.addEventListener('resize', hidePetMenu);

// Expose for debugging
window.__pet = { state, setAction, CORE_ACTIONS };
