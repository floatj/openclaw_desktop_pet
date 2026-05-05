const DRAW_FRAME_SIZE = 128;
const SOURCE_FRAME_SIZE = 256;

const sheet = new Image();
let sheetReady = false;

sheet.addEventListener('load', () => {
  sheetReady = true;
});
sheet.src = `${new URL('../assets/npc-rabbit-strip-atlas.png', import.meta.url).href}?v=highres-strip-pipeline-1`;

const FRAME_MAP = {
  idle_a: [0, 0],
  idle_b: [0, 1],
  idle_c: [0, 2],
  idle_d: [0, 3],
  wave_a: [2, 0],
  wave_b: [2, 1],
  wave_c: [2, 2],
  wave_d: [2, 3],
  wave_e: [2, 4],
  wave_f: [2, 5],
  run_a: [8, 0],
  run_b: [8, 1],
  run_c: [8, 2],
  run_d: [8, 3],
  run_e: [8, 4],
  run_f: [8, 5],
  sleep_a: [5, 0],
  sleep_b: [5, 1],
  sleep_c: [5, 2],
  sleep_d: [5, 3],
  sit_a: [10, 0],
  sit_b: [10, 1],
  sit_c: [10, 2],
  sit_d: [10, 3],
  code_a: [11, 0],
  code_b: [11, 1],
  code_c: [11, 2],
  code_d: [11, 3],
  eat_a: [2, 0],
  eat_b: [2, 1],
  eat_c: [2, 2],
  eat_d: [2, 3],
  pat_a: [7, 0],
  pat_b: [7, 1],
  pat_c: [7, 2],
  pat_d: [7, 3],
};

export function isPixelSheetReady() {
  return sheetReady;
}

export function drawPixelPose(ctx, poseKey) {
  const frame = FRAME_MAP[poseKey];
  if (!frame) return false;

  if (!sheetReady) return false;

  const [row, col] = frame;
  ctx.drawImage(
    sheet,
    col * SOURCE_FRAME_SIZE,
    row * SOURCE_FRAME_SIZE,
    SOURCE_FRAME_SIZE,
    SOURCE_FRAME_SIZE,
    0,
    0,
    DRAW_FRAME_SIZE,
    DRAW_FRAME_SIZE,
  );
  return true;
}
