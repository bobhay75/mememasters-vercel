import { clampNumber, fitImage, wrapCaption, safeFilename } from './editor-core.mjs';

const canvas = document.getElementById('meme-preview');
const ctx = canvas.getContext('2d', { alpha: false });
const upload = document.getElementById('photo');
const topField = document.getElementById('top-caption');
const bottomField = document.getElementById('bottom-caption');
const fontField = document.getElementById('font-size');
const fitField = document.getElementById('image-fit');
const sizeField = document.getElementById('canvas-size');
const status = document.getElementById('editor-status');
const downloadButton = document.getElementById('download');
const resetButton = document.getElementById('reset');
const fileLabel = document.getElementById('file-selection');
const MAX_FILE_BYTES = 12 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

let image = null;
let imageUrl = null;
let uploadSerial = 0;

function setStatus(message) {
  status.textContent = message;
}

function drawPlaceholder() {
  const background = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, '#251759');
  background.addColorStop(0.55, '#124b65');
  background.addColorStop(1, '#0c1228');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,.09)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 6; i += 1) {
    const radius = canvas.width * (0.16 + 0.13 * i);
    ctx.beginPath();
    ctx.arc(canvas.width * .58, canvas.height * .50, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function paintCaption(value, placement, requestedSize) {
  const text = String(value || '').trim();
  if (!text) return;
  const maxWidth = canvas.width * 0.9;
  const maxHeight = canvas.height * 0.4;
  const maxLines = 5;
  let fontSize = Math.min(requestedSize, Math.round(canvas.width * .15));
  let lines = [];
  let lineHeight = 0;
  while (fontSize >= 24) {
    ctx.font = '900 ' + fontSize + 'px Impact, "Arial Black", sans-serif';
    lines = wrapCaption(text, maxWidth, word => ctx.measureText(word).width);
    lineHeight = fontSize * 1.13;
    if (lines.length <= maxLines && lines.length * lineHeight <= maxHeight) break;
    fontSize -= 2;
  }
  ctx.font = '900 ' + fontSize + 'px Impact, "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#0a0a0a';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = Math.max(5, fontSize * .14);
  const padding = canvas.height * .037;
  const startY = placement === 'top'
    ? padding
    : canvas.height - padding - lines.length * lineHeight;
  for (let i = 0; i < lines.length; i += 1) {
    const x = canvas.width / 2;
    const y = startY + i * lineHeight;
    ctx.strokeText(lines[i], x, y, maxWidth);
    ctx.fillText(lines[i], x, y, maxWidth);
  }
}

function render() {
  const tall = sizeField.value === 'portrait';
  canvas.width = 1080;
  canvas.height = tall ? 1350 : 1080;
  drawPlaceholder();
  if (image) {
    const dimensions = fitImage(
      image.naturalWidth, image.naturalHeight,
      canvas.width, canvas.height, fitField.value
    );
    if (fitField.value === 'contain') {
      ctx.fillStyle = '#09101d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(image, dimensions.x, dimensions.y, dimensions.width, dimensions.height);
  }
  const requestedSize = clampNumber(fontField.value, 26, 100, 68);
  paintCaption(topField.value, 'top', requestedSize);
  paintCaption(bottomField.value, 'bottom', requestedSize);
}

function releaseImage() {
  uploadSerial += 1;
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = null;
  image = null;
}

upload.addEventListener('change', () => {
  const candidate = upload.files && upload.files[0];
  if (!candidate) return;
  if (!ALLOWED_MIME.has(candidate.type)) {
    upload.value = '';
    setStatus('Choose a JPG, PNG, or WebP image.');
    return;
  }
  if (candidate.size > MAX_FILE_BYTES) {
    upload.value = '';
    setStatus('That image exceeds the 12 MB limit. Please select a smaller file.');
    return;
  }
  const serial = ++uploadSerial;
  const nextUrl = URL.createObjectURL(candidate);
  const nextImage = new Image();
  nextImage.onload = () => {
    if (serial !== uploadSerial) {
      URL.revokeObjectURL(nextUrl);
      return;
    }
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageUrl = nextUrl;
    image = nextImage;
    fileLabel.textContent = candidate.name;
    render();
    setStatus('Image loaded locally. It has not been uploaded to a server.');
  };
  nextImage.onerror = () => {
    URL.revokeObjectURL(nextUrl);
    if (serial === uploadSerial) {
      setStatus('This image could not be opened. Try a different JPG, PNG or WebP.');
    }
  };
  nextImage.src = nextUrl;
});

[topField, bottomField, fontField, fitField, sizeField].forEach(control => {
  control.addEventListener('input', render);
  control.addEventListener('change', render);
});

downloadButton.addEventListener('click', () => {
  if (!ctx) return;
  downloadButton.disabled = true;
  render();
  canvas.toBlob(blob => {
    downloadButton.disabled = false;
    if (!blob) {
      setStatus('Could not create the PNG. Please retry in a supported browser.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFilename(topField.value || bottomField.value || 'meme');
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    setStatus('PNG prepared. Check your browser downloads.');
  }, 'image/png');
});

resetButton.addEventListener('click', () => {
  releaseImage();
  upload.value = '';
  fileLabel.textContent = 'No image selected — the built-in gradient is shown.';
  topField.value = 'YOUR IDEA';
  bottomField.value = 'YOUR MEME';
  fontField.value = '68';
  fitField.value = 'cover';
  sizeField.value = 'square';
  render();
  setStatus('Editor reset. Start with a new photo or use the gradient.');
});

window.addEventListener('pagehide', releaseImage);

if (!ctx || typeof canvas.toBlob !== 'function') {
  downloadButton.disabled = true;
  setStatus('This browser does not support Canvas export. Try a current Chrome, Firefox or Safari.');
} else {
  render();
  setStatus('Ready. Add your photo, edit the captions, then download a PNG.');
}
