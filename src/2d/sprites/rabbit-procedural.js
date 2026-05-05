import { PALETTE as P } from '../sprite-manifest.js';

// All coordinates are in 64x80 frame-local pixels, top-left origin.
// Chibi proportions: head dominates the upper half (y=0..40), body fills the lower half (y=40..78).
// Anchor (feet center) is at (32, 74).

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// Filled block with a 1px outline. Optionally chip the four corners (1px) for a soft silhouette.
function block(ctx, x, y, w, h, fill, opts = {}) {
  const outline = opts.outline ?? P.outline;
  const round = opts.round ?? false;
  rect(ctx, x, y, w, h, fill);
  // Outline edges
  rect(ctx, x, y, w, 1, outline);
  rect(ctx, x, y + h - 1, w, 1, outline);
  rect(ctx, x, y, 1, h, outline);
  rect(ctx, x + w - 1, y, 1, h, outline);
  if (round) {
    // Chip corners — clear to outline so silhouette reads softer
    rect(ctx, x, y, 1, 1, outline);
    rect(ctx, x + w - 1, y, 1, 1, outline);
    rect(ctx, x, y + h - 1, 1, 1, outline);
    rect(ctx, x + w - 1, y + h - 1, 1, 1, outline);
  }
}

// =========================================================================
// EARS — tall paddle shape, slight inward taper, pink inner, outline border.
// Each ear ~5 wide × 12 tall, base sits at y=10.
// =========================================================================
function drawEars(ctx, opts = {}) {
  const wL = opts.wiggleL ?? 0;
  const wR = opts.wiggleR ?? 0;
  drawSingleEar(ctx, 19, 0 + wL);
  drawSingleEar(ctx, 40, 0 + wR);
}

function drawSingleEar(ctx, x, y) {
  // Outer outline silhouette (rounded paddle)
  rect(ctx, x + 1, y, 3, 1, P.outline);     // top edge
  rect(ctx, x, y + 1, 1, 10, P.outline);    // left edge
  rect(ctx, x + 4, y + 1, 1, 10, P.outline); // right edge
  rect(ctx, x + 1, y + 11, 3, 1, P.outline); // bottom edge
  // Fill: hairMain
  rect(ctx, x + 1, y + 1, 3, 10, P.hairMain);
  // Inner shape: pink, narrower than outer (1px gap on all sides)
  rect(ctx, x + 2, y + 3, 1, 6, P.blush);
  // Highlight on outer-left edge of fill
  rect(ctx, x + 1, y + 2, 1, 5, P.hairLight);
}

// =========================================================================
// HEAD — chibi: huge round face, layered hair, defined eyes.
// Face block: x=14..50 (36 wide), y=8..38 (30 tall).
// =========================================================================
function drawHead(ctx, opts = {}) {
  const yOff = opts.yOffset || 0;
  const eyesClosed = !!opts.eyesClosed;
  const blush = opts.blush !== false; // default blushy
  const eyeDX = opts.eyeOffsetX || 0;
  const happy = !!opts.happy;

  ctx.save();
  ctx.translate(0, yOff);

  // ---- Hair back (twin-tail mass + back of head) ----
  // Back hair behind face — larger silhouette
  rect(ctx, 12, 14, 40, 22, P.hairShadow);
  // Soften back-hair corners
  rect(ctx, 12, 14, 1, 2, P.outline);
  rect(ctx, 51, 14, 1, 2, P.outline);
  // Outline back-hair sides
  rect(ctx, 11, 16, 1, 18, P.outline);
  rect(ctx, 52, 16, 1, 18, P.outline);
  rect(ctx, 12, 35, 40, 1, P.outline);

  // ---- Face oval ----
  // Face fill (skin)
  rect(ctx, 16, 14, 32, 24, P.skin);
  // Face outline silhouette
  rect(ctx, 17, 13, 30, 1, P.outline);  // top
  rect(ctx, 17, 38, 30, 1, P.outline);  // bottom
  rect(ctx, 15, 15, 1, 22, P.outline);  // left
  rect(ctx, 48, 15, 1, 22, P.outline);  // right
  // Chip face corners (rounder)
  rect(ctx, 16, 13, 1, 1, P.outline);
  rect(ctx, 47, 13, 1, 1, P.outline);
  rect(ctx, 16, 38, 1, 1, P.outline);
  rect(ctx, 47, 38, 1, 1, P.outline);
  // Chin shadow (subtle skin shadow on lower-right cheek)
  rect(ctx, 42, 30, 5, 5, P.skinShadow);

  // ---- Twin tails — vertical pear masses on the sides ----
  // Left twin tail
  rect(ctx, 8, 22, 6, 16, P.hairMain);
  rect(ctx, 9, 24, 4, 12, P.hairLight);
  rect(ctx, 7, 22, 1, 16, P.outline);
  rect(ctx, 14, 22, 1, 16, P.outline);
  rect(ctx, 8, 21, 6, 1, P.outline);
  rect(ctx, 8, 38, 6, 1, P.outline);
  // Right twin tail
  rect(ctx, 50, 22, 6, 16, P.hairMain);
  rect(ctx, 51, 24, 4, 12, P.hairLight);
  rect(ctx, 49, 22, 1, 16, P.outline);
  rect(ctx, 56, 22, 1, 16, P.outline);
  rect(ctx, 50, 21, 6, 1, P.outline);
  rect(ctx, 50, 38, 6, 1, P.outline);

  // ---- Bangs — three lobes, asymmetric ----
  // Left bang lobe
  rect(ctx, 16, 14, 10, 7, P.hairMain);
  rect(ctx, 17, 15, 4, 4, P.hairLight);
  rect(ctx, 16, 21, 10, 1, P.outline);
  // Center fringe (shorter)
  rect(ctx, 26, 14, 12, 5, P.hairMain);
  rect(ctx, 28, 15, 4, 3, P.hairLight);
  rect(ctx, 26, 19, 12, 1, P.outline);
  // Right bang lobe
  rect(ctx, 38, 14, 10, 7, P.hairMain);
  rect(ctx, 40, 15, 4, 4, P.hairLight);
  rect(ctx, 38, 21, 10, 1, P.outline);

  // ---- White maid headband (sits on top of bangs) ----
  rect(ctx, 18, 12, 28, 2, P.apron);
  rect(ctx, 18, 11, 28, 1, P.outline);
  rect(ctx, 18, 14, 28, 1, P.outline);
  rect(ctx, 17, 12, 1, 2, P.outline);
  rect(ctx, 46, 12, 1, 2, P.outline);
  // Two small headband puffs/dots on either side
  rect(ctx, 21, 10, 2, 2, P.apron);
  rect(ctx, 41, 10, 2, 2, P.apron);
  rect(ctx, 21, 9, 2, 1, P.outline);
  rect(ctx, 41, 9, 2, 1, P.outline);
  rect(ctx, 20, 10, 1, 2, P.outline);
  rect(ctx, 23, 10, 1, 2, P.outline);
  rect(ctx, 40, 10, 1, 2, P.outline);
  rect(ctx, 43, 10, 1, 2, P.outline);

  // ---- Eyes — large multi-tone anime moe eyes (6w × 7h) ----
  if (eyesClosed) {
    // Closed: happy curved line
    rect(ctx, 21 + eyeDX, 28, 6, 1, P.outline);
    rect(ctx, 22 + eyeDX, 27, 4, 1, P.outline);
    rect(ctx, 37 + eyeDX, 28, 6, 1, P.outline);
    rect(ctx, 38 + eyeDX, 27, 4, 1, P.outline);
  } else {
    drawEye(ctx, 21 + eyeDX, 24);
    drawEye(ctx, 37 + eyeDX, 24);
  }

  // ---- Mouth ----
  if (happy) {
    // Open happy mouth
    rect(ctx, 30, 33, 4, 2, P.outline);
    rect(ctx, 31, 34, 2, 1, P.blush);
  } else {
    // Small smile — 3px arc
    rect(ctx, 30, 33, 4, 1, P.outline);
    rect(ctx, 31, 34, 2, 1, P.outline);
  }

  // ---- Blush ovals on cheeks (under eyes) ----
  if (blush) {
    rect(ctx, 18, 31, 4, 2, P.blush);
    rect(ctx, 42, 31, 4, 2, P.blush);
    rect(ctx, 19, 33, 2, 1, P.blush);
    rect(ctx, 43, 33, 2, 1, P.blush);
  }

  ctx.restore();
}

// 6-wide × 7-tall eye with iris, pupil, and lower highlight.
function drawEye(ctx, x, y) {
  // Outline frame
  rect(ctx, x, y, 6, 1, P.outline);     // top lash
  rect(ctx, x, y + 6, 6, 1, P.outline); // bottom lash
  rect(ctx, x, y + 1, 1, 5, P.outline); // left
  rect(ctx, x + 5, y + 1, 1, 5, P.outline); // right
  // White
  rect(ctx, x + 1, y + 1, 4, 5, P.apron);
  // Iris (blue, fills most of the eye)
  rect(ctx, x + 1, y + 2, 4, 3, P.hairShadow);
  // Pupil (dark, center)
  rect(ctx, x + 2, y + 3, 2, 2, P.outline);
  // Lower highlight (1px white in pupil bottom-left = moe sparkle)
  rect(ctx, x + 2, y + 4, 1, 1, P.apron);
  // Upper-left white catchlight on white area
  rect(ctx, x + 1, y + 1, 1, 1, P.apron);
}

// =========================================================================
// BODY — A-line dress with apron front, puff sleeves, white gloves, shoes.
// Body block y=38..76.
// =========================================================================
function drawBody(ctx, opts = {}) {
  // ---- Bow at neck ----
  rect(ctx, 27, 38, 10, 4, P.bow);
  rect(ctx, 30, 39, 4, 2, P.dressShadow); // knot
  rect(ctx, 27, 38, 10, 1, P.outline);
  rect(ctx, 27, 41, 10, 1, P.outline);
  rect(ctx, 26, 38, 1, 4, P.outline);
  rect(ctx, 37, 38, 1, 4, P.outline);
  // Bow tails
  rect(ctx, 28, 42, 2, 3, P.bow);
  rect(ctx, 34, 42, 2, 3, P.bow);
  rect(ctx, 28, 45, 2, 1, P.outline);
  rect(ctx, 34, 45, 2, 1, P.outline);

  // ---- Dress: A-line, narrower at chest, wider at hem ----
  // Chest band (narrowest)
  rect(ctx, 22, 42, 20, 6, P.dress);
  rect(ctx, 22, 42, 20, 1, P.outline);
  rect(ctx, 21, 43, 1, 5, P.outline);
  rect(ctx, 42, 43, 1, 5, P.outline);
  // Mid skirt
  rect(ctx, 20, 48, 24, 8, P.dress);
  rect(ctx, 19, 48, 1, 8, P.outline);
  rect(ctx, 44, 48, 1, 8, P.outline);
  // Lower skirt (widest)
  rect(ctx, 18, 56, 28, 8, P.dress);
  rect(ctx, 17, 56, 1, 8, P.outline);
  rect(ctx, 46, 56, 1, 8, P.outline);
  // Hem outline
  rect(ctx, 17, 64, 30, 1, P.outline);
  // Dress shadow band along right side
  rect(ctx, 39, 48, 3, 16, P.dressShadow);

  // ---- Apron: white, narrower than dress, in front ----
  // Apron straps from chest going up
  rect(ctx, 25, 42, 2, 3, P.apron);
  rect(ctx, 37, 42, 2, 3, P.apron);
  rect(ctx, 24, 42, 1, 3, P.outline);
  rect(ctx, 27, 42, 1, 3, P.outline);
  rect(ctx, 36, 42, 1, 3, P.outline);
  rect(ctx, 39, 42, 1, 3, P.outline);
  // Apron front panel (chest to hem)
  rect(ctx, 25, 45, 14, 18, P.apron);
  rect(ctx, 25, 45, 14, 1, P.outline);
  rect(ctx, 24, 46, 1, 17, P.apron); // soft left edge
  rect(ctx, 24, 46, 1, 17, P.outline);
  rect(ctx, 39, 46, 1, 17, P.outline);
  // Frilly hem (small steps)
  rect(ctx, 25, 63, 14, 1, P.outline);
  rect(ctx, 26, 62, 2, 1, P.apron);
  rect(ctx, 30, 62, 2, 1, P.apron);
  rect(ctx, 34, 62, 2, 1, P.apron);
  // Subtle apron shadow on right
  rect(ctx, 37, 47, 2, 15, P.apronShadow);
  // Apron mark (small badge)
  rect(ctx, 30, 52, 4, 4, P.apronShadow);
  rect(ctx, 31, 53, 2, 2, P.hairShadow);

  // ---- Legs (short white stockings) ----
  rect(ctx, 25, 64, 5, 6, P.apron);
  rect(ctx, 34, 64, 5, 6, P.apron);
  rect(ctx, 24, 65, 1, 5, P.outline);
  rect(ctx, 30, 65, 1, 5, P.outline);
  rect(ctx, 33, 65, 1, 5, P.outline);
  rect(ctx, 39, 65, 1, 5, P.outline);
  // Stocking shadow
  rect(ctx, 28, 65, 2, 5, P.apronShadow);
  rect(ctx, 37, 65, 2, 5, P.apronShadow);

  // ---- Shoes (Mary Jane, blue) ----
  rect(ctx, 23, 70, 9, 4, P.dress);
  rect(ctx, 32, 70, 9, 4, P.dress);
  rect(ctx, 23, 70, 9, 1, P.outline);
  rect(ctx, 32, 70, 9, 1, P.outline);
  rect(ctx, 23, 73, 9, 1, P.outline);
  rect(ctx, 32, 73, 9, 1, P.outline);
  rect(ctx, 22, 71, 1, 2, P.outline);
  rect(ctx, 31, 71, 1, 2, P.outline);
  rect(ctx, 32, 71, 1, 2, P.outline);
  rect(ctx, 41, 71, 1, 2, P.outline);
  // Shoe shine highlight
  rect(ctx, 24, 71, 2, 1, P.hairLight);
  rect(ctx, 33, 71, 2, 1, P.hairLight);
}

function drawSittingBody(ctx, opts = {}) {
  const bob = opts.bob || 0;
  ctx.save();
  ctx.translate(0, bob);

  // Compact torso tucked into a seated skirt.
  rect(ctx, 23, 43, 18, 8, P.dress);
  rect(ctx, 22, 44, 1, 7, P.outline);
  rect(ctx, 41, 44, 1, 7, P.outline);
  rect(ctx, 23, 43, 18, 1, P.outline);
  rect(ctx, 23, 50, 18, 1, P.outline);

  rect(ctx, 18, 51, 28, 13, P.dress);
  rect(ctx, 16, 56, 32, 10, P.dress);
  rect(ctx, 15, 57, 1, 8, P.outline);
  rect(ctx, 48, 57, 1, 8, P.outline);
  rect(ctx, 17, 51, 29, 1, P.outline);
  rect(ctx, 16, 66, 32, 1, P.outline);
  rect(ctx, 40, 53, 5, 12, P.dressShadow);

  // Apron drapes over the lap.
  rect(ctx, 25, 44, 14, 19, P.apron);
  rect(ctx, 24, 45, 1, 17, P.outline);
  rect(ctx, 39, 45, 1, 17, P.outline);
  rect(ctx, 25, 44, 14, 1, P.outline);
  rect(ctx, 25, 62, 14, 1, P.outline);
  rect(ctx, 37, 48, 2, 13, P.apronShadow);
  rect(ctx, 27, 63, 3, 1, P.apron);
  rect(ctx, 33, 63, 3, 1, P.apron);

  // Bent legs and shoes peeking out to the sides.
  rect(ctx, 17, 65, 11, 4, P.apron);
  rect(ctx, 36, 65, 11, 4, P.apron);
  rect(ctx, 16, 65, 1, 4, P.outline);
  rect(ctx, 28, 65, 1, 4, P.outline);
  rect(ctx, 35, 65, 1, 4, P.outline);
  rect(ctx, 47, 65, 1, 4, P.outline);
  rect(ctx, 17, 69, 11, 1, P.outline);
  rect(ctx, 36, 69, 11, 1, P.outline);
  rect(ctx, 13, 68, 12, 5, P.dress);
  rect(ctx, 39, 68, 12, 5, P.dress);
  rect(ctx, 13, 68, 12, 1, P.outline);
  rect(ctx, 39, 68, 12, 1, P.outline);
  rect(ctx, 12, 69, 1, 3, P.outline);
  rect(ctx, 51, 69, 1, 3, P.outline);
  rect(ctx, 13, 72, 12, 1, P.outline);
  rect(ctx, 39, 72, 12, 1, P.outline);

  // Bow sits just under the chin.
  rect(ctx, 27, 39, 10, 4, P.bow);
  rect(ctx, 30, 40, 4, 2, P.dressShadow);
  rect(ctx, 27, 39, 10, 1, P.outline);
  rect(ctx, 27, 42, 10, 1, P.outline);

  ctx.restore();
}

// =========================================================================
// ARMS — puff sleeve at top, white glove at hand. Resting at sides by default.
// =========================================================================
function drawArms(ctx, opts = {}) {
  const lY = opts.leftY ?? 0;
  const rY = opts.rightY ?? 0;
  const leftRaised = !!opts.leftRaised;
  const rightRaised = !!opts.rightRaised;

  // Left arm
  if (leftRaised) {
    // Puff sleeve at shoulder
    rect(ctx, 16, 42, 6, 5, P.dress);
    rect(ctx, 16, 42, 6, 1, P.outline);
    rect(ctx, 15, 43, 1, 4, P.outline);
    rect(ctx, 22, 43, 1, 4, P.outline);
    rect(ctx, 16, 47, 6, 1, P.outline);
    // Arm extending up
    rect(ctx, 12, 30, 4, 13, P.dress);
    rect(ctx, 11, 31, 1, 12, P.outline);
    rect(ctx, 16, 31, 1, 12, P.outline);
    // Glove at top (raised hand)
    rect(ctx, 11, 26, 6, 5, P.apron);
    rect(ctx, 11, 25, 6, 1, P.outline);
    rect(ctx, 10, 26, 1, 5, P.outline);
    rect(ctx, 17, 26, 1, 5, P.outline);
    rect(ctx, 11, 31, 6, 1, P.outline);
  } else {
    // Puff sleeve at shoulder
    rect(ctx, 17, 42 + lY, 5, 5, P.dress);
    rect(ctx, 17, 42 + lY, 5, 1, P.outline);
    rect(ctx, 16, 43 + lY, 1, 4, P.outline);
    rect(ctx, 22, 43 + lY, 1, 4, P.outline);
    // Forearm
    rect(ctx, 18, 47 + lY, 4, 8, P.skin);
    rect(ctx, 17, 48 + lY, 1, 7, P.outline);
    rect(ctx, 22, 48 + lY, 1, 7, P.outline);
    // Glove
    rect(ctx, 17, 55 + lY, 5, 4, P.apron);
    rect(ctx, 17, 55 + lY, 5, 1, P.outline);
    rect(ctx, 16, 56 + lY, 1, 4, P.outline);
    rect(ctx, 22, 56 + lY, 1, 4, P.outline);
    rect(ctx, 17, 59 + lY, 5, 1, P.outline);
    // Cuff
    rect(ctx, 17, 56 + lY, 5, 1, P.apronShadow);
  }

  // Right arm
  if (rightRaised) {
    rect(ctx, 42, 42, 6, 5, P.dress);
    rect(ctx, 42, 42, 6, 1, P.outline);
    rect(ctx, 41, 43, 1, 4, P.outline);
    rect(ctx, 48, 43, 1, 4, P.outline);
    rect(ctx, 42, 47, 6, 1, P.outline);
    // Arm extending up
    rect(ctx, 48, 30, 4, 13, P.dress);
    rect(ctx, 47, 31, 1, 12, P.outline);
    rect(ctx, 52, 31, 1, 12, P.outline);
    // Glove (waving)
    rect(ctx, 47, 26, 6, 5, P.apron);
    rect(ctx, 47, 25, 6, 1, P.outline);
    rect(ctx, 46, 26, 1, 5, P.outline);
    rect(ctx, 53, 26, 1, 5, P.outline);
    rect(ctx, 47, 31, 6, 1, P.outline);
  } else {
    rect(ctx, 42, 42 + rY, 5, 5, P.dress);
    rect(ctx, 42, 42 + rY, 5, 1, P.outline);
    rect(ctx, 41, 43 + rY, 1, 4, P.outline);
    rect(ctx, 47, 43 + rY, 1, 4, P.outline);
    rect(ctx, 42, 47 + rY, 4, 8, P.skin);
    rect(ctx, 41, 48 + rY, 1, 7, P.outline);
    rect(ctx, 46, 48 + rY, 1, 7, P.outline);
    rect(ctx, 42, 55 + rY, 5, 4, P.apron);
    rect(ctx, 42, 55 + rY, 5, 1, P.outline);
    rect(ctx, 41, 56 + rY, 1, 4, P.outline);
    rect(ctx, 47, 56 + rY, 1, 4, P.outline);
    rect(ctx, 42, 59 + rY, 5, 1, P.outline);
    rect(ctx, 42, 56 + rY, 5, 1, P.apronShadow);
  }
}

// =========================================================================
// PROPS
// =========================================================================
function drawCarrot(ctx, x, y) {
  rect(ctx, x, y, 6, 8, P.carrot);
  rect(ctx, x + 1, y + 2, 4, 5, P.carrotShadow);
  rect(ctx, x, y, 6, 1, P.outline);
  rect(ctx, x + 6, y + 1, 1, 6, P.outline);
  rect(ctx, x - 1, y + 1, 1, 6, P.outline);
  rect(ctx, x + 1, y + 8, 4, 1, P.outline);
  // Leaf
  rect(ctx, x + 1, y - 2, 2, 2, P.carrotLeaf);
  rect(ctx, x + 3, y - 3, 2, 3, P.carrotLeaf);
}

function drawCodingLaptop(ctx, x, y, opts = {}) {
  rect(ctx, x, y, 28, 14, P.outline);
  rect(ctx, x + 1, y + 1, 26, 12, P.laptop);
  rect(ctx, x + 3, y + 3, 22, 8, P.outline);
  rect(ctx, x + 4, y + 4, 20, 6, P.laptopScreen);
  rect(ctx, x + 5, y + 5, 7, 1, P.carrotLeaf);
  rect(ctx, x + 13, y + 5, 8, 1, P.hairLight);
  rect(ctx, x + 5, y + 8, 5, 1, P.blush);
  rect(ctx, x + 11, y + 8, 10, 1, P.carrotLeaf);
  if (opts.cursor) rect(ctx, x + 22, y + 7, 1, 4, P.apron);

  rect(ctx, x - 4, y + 14, 36, 6, P.laptopShadow);
  rect(ctx, x - 5, y + 14, 38, 1, P.outline);
  rect(ctx, x - 4, y + 19, 36, 1, P.outline);
  for (let kx = x - 1 + (opts.keyOffset || 0); kx < x + 27; kx += 4) {
    rect(ctx, kx, y + 16, 2, 1, P.apronShadow);
  }
}

// =========================================================================
// POSE COMPOSITIONS
// =========================================================================
const POSES = {
  idle_a(ctx) {
    drawEars(ctx);
    drawBody(ctx);
    drawArms(ctx);
    drawHead(ctx);
  },
  idle_b(ctx) {
    drawEars(ctx, { wiggleL: -1 });
    drawBody(ctx);
    drawArms(ctx, { leftY: 1, rightY: 1 });
    drawHead(ctx, { yOffset: 1 });
  },
  idle_c(ctx) {
    drawEars(ctx, { wiggleR: -1 });
    drawBody(ctx);
    drawArms(ctx);
    drawHead(ctx);
  },
  wave_a(ctx) {
    drawEars(ctx);
    drawBody(ctx);
    drawArms(ctx, { rightRaised: true });
    drawHead(ctx, { happy: true });
  },
  wave_b(ctx) {
    drawEars(ctx, { wiggleR: 1 });
    drawBody(ctx);
    drawArms(ctx, { rightRaised: true });
    drawHead(ctx, { happy: true, yOffset: -1 });
  },
  wave_c(ctx) {
    drawEars(ctx, { wiggleR: -1 });
    drawBody(ctx);
    drawArms(ctx, { rightRaised: true });
    drawHead(ctx, { happy: true });
  },
  run_a(ctx) {
    drawEars(ctx, { wiggleL: -2, wiggleR: -2 });
    drawBody(ctx);
    drawArms(ctx, { leftY: -2, rightY: 2 });
    drawHead(ctx, { yOffset: -1 });
  },
  run_b(ctx) {
    drawEars(ctx);
    drawBody(ctx);
    drawArms(ctx);
    drawHead(ctx);
  },
  run_c(ctx) {
    drawEars(ctx, { wiggleL: 2, wiggleR: 2 });
    drawBody(ctx);
    drawArms(ctx, { leftY: 2, rightY: -2 });
    drawHead(ctx, { yOffset: -1 });
  },
  sleep_a(ctx) {
    drawEars(ctx, { wiggleL: 1 });
    // Sit pose: shift body up so legs/shoes are out of view
    ctx.save();
    ctx.translate(0, -2);
    drawBody(ctx);
    drawArms(ctx);
    ctx.restore();
    drawHead(ctx, { eyesClosed: true, yOffset: 0 });
    // Z effect
    ctx.fillStyle = P.outline;
    ctx.font = 'bold 6px monospace';
    ctx.fillText('z', 6, 16);
    ctx.fillText('Z', 2, 10);
  },
  sleep_b(ctx) {
    drawEars(ctx, { wiggleL: -1 });
    ctx.save();
    ctx.translate(0, -2);
    drawBody(ctx);
    drawArms(ctx);
    ctx.restore();
    drawHead(ctx, { eyesClosed: true, yOffset: 1 });
    ctx.fillStyle = P.outline;
    ctx.font = 'bold 7px monospace';
    ctx.fillText('Z', 4, 14);
  },
  sit_a(ctx) {
    drawEars(ctx, { wiggleL: 1 });
    drawSittingBody(ctx);
    drawArms(ctx, { leftY: 4, rightY: 4 });
    drawHead(ctx, { yOffset: 2 });
  },
  sit_b(ctx) {
    drawEars(ctx);
    drawSittingBody(ctx, { bob: 1 });
    drawArms(ctx, { leftY: 5, rightY: 5 });
    drawHead(ctx, { happy: true, yOffset: 3 });
  },
  sit_c(ctx) {
    drawEars(ctx, { wiggleR: 1 });
    drawSittingBody(ctx);
    drawArms(ctx, { leftY: 4, rightY: 4 });
    drawHead(ctx, { eyesClosed: true, yOffset: 2 });
  },
  eat_a(ctx) {
    drawEars(ctx);
    drawBody(ctx);
    drawArms(ctx);
    drawHead(ctx);
    drawCarrot(ctx, 36, 28);
  },
  eat_b(ctx) {
    drawEars(ctx, { wiggleR: 1 });
    drawBody(ctx);
    drawArms(ctx);
    drawHead(ctx, { yOffset: 1 });
    drawCarrot(ctx, 36, 28);
  },
  eat_c(ctx) {
    drawEars(ctx);
    drawBody(ctx);
    drawArms(ctx);
    drawHead(ctx);
    drawCarrot(ctx, 36, 28);
    rect(ctx, 36, 30, 2, 2, P.carrotShadow);
  },
  code_a(ctx) {
    drawEars(ctx, { wiggleL: 1 });
    drawSittingBody(ctx);
    drawArms(ctx, { leftY: 5, rightY: 4 });
    drawHead(ctx, { yOffset: 2 });
    drawCodingLaptop(ctx, 18, 55, { cursor: true });
  },
  code_b(ctx) {
    drawEars(ctx);
    drawSittingBody(ctx, { bob: 1 });
    drawArms(ctx, { leftY: 4, rightY: 5 });
    drawHead(ctx, { yOffset: 2 });
    drawCodingLaptop(ctx, 18, 55, { keyOffset: 1 });
  },
  code_c(ctx) {
    drawEars(ctx, { wiggleR: 1 });
    drawSittingBody(ctx);
    drawArms(ctx, { leftY: 5, rightY: 5 });
    drawHead(ctx, { eyesClosed: true, yOffset: 2 });
    drawCodingLaptop(ctx, 18, 55, { cursor: true, keyOffset: 2 });
  },
  code_d(ctx) {
    drawEars(ctx);
    drawSittingBody(ctx, { bob: 1 });
    drawArms(ctx, { leftY: 4, rightY: 4 });
    drawHead(ctx, { yOffset: 2 });
    drawCodingLaptop(ctx, 18, 55);
  },
  pat_a(ctx) {
    drawEars(ctx, { wiggleL: 2, wiggleR: 2 });
    drawBody(ctx);
    drawArms(ctx);
    drawHead(ctx, { happy: true, yOffset: 1 });
    rect(ctx, 6, 6, 2, 2, P.blush);
    rect(ctx, 56, 8, 2, 2, P.blush);
  },
  pat_b(ctx) {
    drawEars(ctx, { wiggleL: -2, wiggleR: -2 });
    drawBody(ctx);
    drawArms(ctx);
    drawHead(ctx, { happy: true, eyesClosed: true });
    rect(ctx, 4, 10, 2, 2, P.blush);
    rect(ctx, 58, 4, 2, 2, P.blush);
  },
  pat_c(ctx) {
    drawEars(ctx, { wiggleL: 2, wiggleR: 2 });
    drawBody(ctx);
    drawArms(ctx);
    drawHead(ctx, { happy: true, yOffset: 2 });
    rect(ctx, 2, 6, 2, 2, P.blush);
    rect(ctx, 60, 10, 2, 2, P.blush);
  },
};

export function drawRabbitPose(ctx, poseKey) {
  const fn = POSES[poseKey] || POSES.idle_a;
  fn(ctx);
}

export function hasRabbitPose(key) {
  return Object.prototype.hasOwnProperty.call(POSES, key);
}
