import { PALETTE as P } from '../sprite-manifest.js';

// 32x32 frame, anchor at (16, 30). Rounded purple square pucci.

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawBody(ctx, opts = {}) {
  const yOff = opts.yOffset || 0;
  ctx.save();
  ctx.translate(0, yOff);

  // ---- Body silhouette: rounded square (28w × 22h) ----
  // Main fill
  rect(ctx, 4, 4, 24, 20, P.pucciMain);
  // Shadow band — right + bottom (inside outline)
  rect(ctx, 20, 6, 8, 18, P.pucciShadow);
  rect(ctx, 6, 20, 22, 4, P.pucciShadow);
  // Highlight — upper-left
  rect(ctx, 6, 6, 8, 6, P.pucciHighlight);
  rect(ctx, 7, 7, 4, 3, P.apron); // brightest spot

  // Outline
  rect(ctx, 5, 3, 22, 1, P.outline);    // top
  rect(ctx, 5, 24, 22, 1, P.outline);   // bottom
  rect(ctx, 3, 5, 1, 18, P.outline);    // left
  rect(ctx, 28, 5, 1, 18, P.outline);   // right
  // Rounded corner chips (2px each)
  rect(ctx, 4, 4, 2, 1, P.outline);
  rect(ctx, 4, 4, 1, 2, P.outline);
  rect(ctx, 26, 4, 2, 1, P.outline);
  rect(ctx, 27, 4, 1, 2, P.outline);
  rect(ctx, 4, 23, 2, 1, P.outline);
  rect(ctx, 4, 22, 1, 2, P.outline);
  rect(ctx, 26, 23, 2, 1, P.outline);
  rect(ctx, 27, 22, 1, 2, P.outline);

  // ---- Eyes (dot eyes) ----
  // Left eye
  rect(ctx, 9, 11, 3, 4, P.outline);
  rect(ctx, 9, 11, 1, 1, P.apron); // sparkle
  // Right eye
  rect(ctx, 20, 11, 3, 4, P.outline);
  rect(ctx, 20, 11, 1, 1, P.apron);

  // ---- White tooth-opening mouth (irregular pentagon, wider at top) ----
  // Outer dark border
  rect(ctx, 13, 16, 6, 6, P.outline);
  // Inner white tooth shape
  rect(ctx, 14, 17, 4, 4, P.pucciTooth);
  // Narrow at bottom (chip lower corners)
  rect(ctx, 14, 20, 1, 1, P.outline);
  rect(ctx, 17, 20, 1, 1, P.outline);
  // Tiny tooth shadow detail
  rect(ctx, 17, 18, 1, 2, P.apronShadow);

  // ---- Tiny arms (side stubs) ----
  // Left
  rect(ctx, 1, 13, 3, 4, P.pucciMain);
  rect(ctx, 0, 14, 1, 2, P.outline);
  rect(ctx, 1, 12, 3, 1, P.outline);
  rect(ctx, 1, 17, 3, 1, P.outline);
  rect(ctx, 4, 13, 1, 4, P.outline);
  // Right (slightly raised in some poses via opt)
  if (opts.rightArmRaised) {
    rect(ctx, 28, 9, 3, 4, P.pucciMain);
    rect(ctx, 31, 10, 1, 2, P.outline);
    rect(ctx, 28, 8, 3, 1, P.outline);
    rect(ctx, 28, 13, 3, 1, P.outline);
    rect(ctx, 27, 9, 1, 4, P.outline);
  } else {
    rect(ctx, 28, 13, 3, 4, P.pucciMain);
    rect(ctx, 31, 14, 1, 2, P.outline);
    rect(ctx, 28, 12, 3, 1, P.outline);
    rect(ctx, 28, 17, 3, 1, P.outline);
    rect(ctx, 27, 13, 1, 4, P.outline);
  }

  ctx.restore();

  // ---- Tiny legs at bottom (don't bob with body) ----
  rect(ctx, 9, 24, 4, 4, P.pucciShadow);
  rect(ctx, 19, 24, 4, 4, P.pucciShadow);
  rect(ctx, 8, 25, 1, 3, P.outline);
  rect(ctx, 13, 25, 1, 3, P.outline);
  rect(ctx, 18, 25, 1, 3, P.outline);
  rect(ctx, 23, 25, 1, 3, P.outline);
  rect(ctx, 9, 28, 4, 1, P.outline);
  rect(ctx, 19, 28, 4, 1, P.outline);
}

const POSES = {
  idle_a(ctx) { drawBody(ctx); },
  idle_b(ctx) { drawBody(ctx, { yOffset: -1 }); },
  hop_a(ctx) { drawBody(ctx, { yOffset: -3, rightArmRaised: true }); },
  hop_b(ctx) { drawBody(ctx); },
};

export function drawPucciPose(ctx, poseKey) {
  const fn = POSES[poseKey] || POSES.idle_a;
  fn(ctx);
}
