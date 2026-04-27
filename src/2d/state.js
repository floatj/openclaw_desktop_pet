import { RABBIT_SPRITE, PUCCI_SPRITE } from './sprite-manifest.js';

const CORE_ACTIONS = ['idle', 'wave', 'run', 'sleep', 'eat', 'typing', 'headpat'];

const TIME_WEIGHTS = {
  morning: { idle: 3, wave: 3, run: 2, eat: 2, typing: 1, headpat: 1, sleep: 0 },
  day:     { idle: 3, wave: 2, run: 3, eat: 1, typing: 3, headpat: 1, sleep: 0 },
  evening: { idle: 4, wave: 2, run: 1, eat: 2, typing: 2, headpat: 2, sleep: 1 },
  night:   { idle: 2, wave: 1, run: 1, eat: 1, typing: 1, headpat: 1, sleep: 6 },
};

function timeBucket(date = new Date()) {
  const h = date.getHours();
  if (h >= 6 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

function weightedPick(weights, rng = Math.random) {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [k, w] of entries) {
    r -= w;
    if (r <= 0) return k;
  }
  return entries[0][0];
}

export function createState() {
  return {
    // Action scheduling
    currentAction: 'idle',
    actionTimer: 0,
    actionDuration: 4,
    nextActionDelay: 4,

    // Animation playback
    poseTime: 0,
    animFrameIndex: 0,
    animElapsed: 0,

    // Pucci animation
    pucciAction: 'idle',
    pucciAnimFrameIndex: 0,
    pucciAnimElapsed: 0,

    // Mode flags
    quietMode: false,
    roaming: false,
    darkMode: false,
    startupDone: true,
    quitting: false,

    // Visuals
    facing: 'right',
    emotion: 'normal',
    scale: 2,
    velocity: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },

    // Props
    props: {
      carrot: false,
      sword: false,
      laptop: false,
    },

    effects: [],

    // Blink
    blinkTimer: 2 + Math.random() * 3,
    blinking: false,
    blinkLeft: 0,
  };
}

export function setAction(state, action, opts = {}) {
  if (state.currentAction === action && !opts.force) return;
  state.currentAction = action;
  state.actionTimer = 0;
  state.poseTime = 0;
  state.animFrameIndex = 0;
  state.animElapsed = 0;

  // Reset all action props, then enable for this action
  state.props.carrot = false;
  state.props.laptop = false;
  if (action === 'eat') state.props.carrot = true;
  if (action === 'typing') state.props.laptop = true;

  // Action durations (seconds)
  const durations = {
    idle: 4 + Math.random() * 4,
    wave: 2.5,
    run: 3 + Math.random() * 3,
    sleep: 6,
    eat: 4,
    typing: 5 + Math.random() * 4,
    headpat: 2.5,
  };
  state.actionDuration = durations[action] ?? 3;
}

export function pickNextAction(state) {
  const bucket = timeBucket();
  const weights = { ...TIME_WEIGHTS[bucket] };
  if (state.quietMode) {
    // Mute high-energy actions
    weights.run = 0;
    weights.wave = Math.max(0, (weights.wave || 0) - 1);
    weights.sleep = (weights.sleep || 0) + 4;
    weights.idle = (weights.idle || 0) + 2;
  }
  // Avoid picking the same action twice in a row
  if (weights[state.currentAction] !== undefined) {
    weights[state.currentAction] = Math.max(0, weights[state.currentAction] - 1);
  }
  return weightedPick(weights);
}

export function updateState(state, dt) {
  state.poseTime += dt;
  state.actionTimer += dt;

  // Action scheduler
  if (state.actionTimer >= state.actionDuration) {
    const next = pickNextAction(state);
    setAction(state, next);
  }

  // Per-action offset / velocity
  state.offset.x = 0;
  state.offset.y = 0;
  if (state.currentAction === 'idle') {
    state.offset.y = Math.sin(state.poseTime * 2.0) * 0.5;
  } else if (state.currentAction === 'run') {
    state.offset.y = Math.abs(Math.sin(state.poseTime * 10)) * -2;
    state.velocity.x = state.facing === 'right' ? 30 : -30;
  } else {
    state.velocity.x = 0;
  }

  // Animation frame stepping for rabbit
  const anim = RABBIT_SPRITE.animations[state.currentAction] || RABBIT_SPRITE.animations.idle;
  state.animElapsed += dt;
  const frameDuration = 1 / anim.fps;
  while (state.animElapsed >= frameDuration) {
    state.animElapsed -= frameDuration;
    state.animFrameIndex = anim.loop
      ? (state.animFrameIndex + 1) % anim.frames.length
      : Math.min(state.animFrameIndex + 1, anim.frames.length - 1);
  }

  // Pucci animation
  const pAnim = PUCCI_SPRITE.animations[state.pucciAction] || PUCCI_SPRITE.animations.idle;
  state.pucciAnimElapsed += dt;
  const pFrameDuration = 1 / pAnim.fps;
  while (state.pucciAnimElapsed >= pFrameDuration) {
    state.pucciAnimElapsed -= pFrameDuration;
    state.pucciAnimFrameIndex = pAnim.loop
      ? (state.pucciAnimFrameIndex + 1) % pAnim.frames.length
      : Math.min(state.pucciAnimFrameIndex + 1, pAnim.frames.length - 1);
  }

  // Blink (overlay; doesn't change action)
  state.blinkTimer -= dt;
  if (state.blinking) {
    state.blinkLeft -= dt;
    if (state.blinkLeft <= 0) {
      state.blinking = false;
      state.blinkTimer = 2 + Math.random() * 4;
    }
  } else if (state.blinkTimer <= 0) {
    state.blinking = true;
    state.blinkLeft = 0.12;
  }
}

export function getCurrentRabbitPose(state) {
  const anim = RABBIT_SPRITE.animations[state.currentAction] || RABBIT_SPRITE.animations.idle;
  const idx = state.animFrameIndex % anim.frames.length;
  return anim.frames[idx];
}

export function getCurrentPucciPose(state) {
  const anim = PUCCI_SPRITE.animations[state.pucciAction] || PUCCI_SPRITE.animations.idle;
  const idx = state.pucciAnimFrameIndex % anim.frames.length;
  return anim.frames[idx];
}

export { CORE_ACTIONS };
