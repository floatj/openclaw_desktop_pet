const preview = new Image();
let previewReady = false;

preview.addEventListener('load', () => {
  previewReady = true;
});
preview.src = new URL('../assets/pixel-preview-static.png', import.meta.url).href;

export function isStaticPreviewReady() {
  return previewReady;
}

export function drawStaticPreview(ctx, x, y) {
  if (!previewReady) return false;
  ctx.drawImage(preview, x, y);
  return true;
}
