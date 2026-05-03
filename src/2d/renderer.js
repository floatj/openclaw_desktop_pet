import { RABBIT_SPRITE, PUCCI_SPRITE, PALETTE } from './sprite-manifest.js';
import { drawRabbitPose } from './sprites/rabbit-procedural.js';
import { drawPucciPose } from './sprites/pucci-procedural.js';
import { drawPixelPose, isPixelSheetReady } from './sprites/pixel-sheet.js';
import { getCurrentRabbitPose, getCurrentPucciPose } from './state.js';

export const CANVAS_W = 160;
export const CANVAS_H = 192;

const RABBIT_WORLD = { x: 80, y: 170 }; // anchor (feet center) world position
const PUCCI_WORLD  = { x: 128, y: 178 };

export function setupCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

function drawShadowBlob(ctx, x, y, w) {
  ctx.fillStyle = PALETTE.shadow;
  const half = Math.floor(w / 2);
  ctx.fillRect(x - half, y, w, 2);
  ctx.fillRect(x - half + 1, y + 2, w - 2, 1);
}

function drawSpriteAt(ctx, sprite, worldX, worldY, drawFn, poseKey, blinking = false) {
  const sx = worldX - sprite.anchor.x;
  const sy = worldY - sprite.anchor.y;
  ctx.save();
  ctx.translate(sx, sy);
  drawFn(ctx, poseKey);
  // Blink overlay (simple: draw a 1px dark line over each eye region for rabbit only)
  if (blinking && sprite.id === 'rabbit-maid') {
    ctx.fillStyle = PALETTE.outline;
    ctx.fillRect(22, 24, 4, 1);
    ctx.fillRect(38, 24, 4, 1);
  }
  ctx.restore();
}

export function render(ctx, state) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  const rabbitPose = getCurrentRabbitPose(state);
  if (isPixelSheetReady()) {
    const rx = RABBIT_WORLD.x + state.offset.x;
    const ry = RABBIT_WORLD.y + state.offset.y;
    drawShadowBlob(ctx, RABBIT_WORLD.x, RABBIT_WORLD.y + 2, 28);
    drawShadowBlob(ctx, RABBIT_WORLD.x + 46, RABBIT_WORLD.y + 2, 18);

    if (state.facing === 'left') {
      ctx.save();
      ctx.translate(CANVAS_W, 0);
      ctx.scale(-1, 1);
      const flippedX = CANVAS_W - rx;
      drawSpriteAt(ctx, RABBIT_SPRITE, flippedX, ry, drawPixelPose, rabbitPose, false);
      ctx.restore();
    } else {
      drawSpriteAt(ctx, RABBIT_SPRITE, rx, ry, drawPixelPose, rabbitPose, false);
    }
    return;
  }

  // Shadows
  drawShadowBlob(ctx, RABBIT_WORLD.x, RABBIT_WORLD.y + 2, 28);
  drawShadowBlob(ctx, PUCCI_WORLD.x, PUCCI_WORLD.y + 2, 18);

  // Pucci first (behind rabbit if overlapping later)
  const pucciPose = getCurrentPucciPose(state);
  drawSpriteAt(ctx, PUCCI_SPRITE, PUCCI_WORLD.x, PUCCI_WORLD.y, drawPucciPose, pucciPose);

  // Rabbit with offset
  const rx = RABBIT_WORLD.x + state.offset.x;
  const ry = RABBIT_WORLD.y + state.offset.y;
  // Apply facing: flip horizontally if facing left
  if (state.facing === 'left') {
    ctx.save();
    ctx.translate(CANVAS_W, 0);
    ctx.scale(-1, 1);
    const flippedX = CANVAS_W - rx;
    drawSpriteAt(ctx, RABBIT_SPRITE, flippedX, ry, drawRabbitPose, rabbitPose, state.blinking);
    ctx.restore();
  } else {
    drawSpriteAt(ctx, RABBIT_SPRITE, rx, ry, drawRabbitPose, rabbitPose, state.blinking);
  }
}

export function getRabbitHeadHitboxScreen(scale = 2) {
  const hb = RABBIT_SPRITE.hitboxes.head;
  const sx = RABBIT_WORLD.x - RABBIT_SPRITE.anchor.x + hb.x;
  const sy = RABBIT_WORLD.y - RABBIT_SPRITE.anchor.y + hb.y;
  return { x: sx * scale, y: sy * scale, w: hb.w * scale, h: hb.h * scale };
}

export function canvasToInternal(canvas, clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const px = ((clientX - r.left) / r.width) * CANVAS_W;
  const py = ((clientY - r.top) / r.height) * CANVAS_H;
  return { x: px, y: py };
}

export function pointInRabbitHead(internalX, internalY) {
  const hb = RABBIT_SPRITE.hitboxes.head;
  const sx = RABBIT_WORLD.x - RABBIT_SPRITE.anchor.x + hb.x;
  const sy = RABBIT_WORLD.y - RABBIT_SPRITE.anchor.y + hb.y;
  return internalX >= sx && internalX <= sx + hb.w && internalY >= sy && internalY <= sy + hb.h;
}
