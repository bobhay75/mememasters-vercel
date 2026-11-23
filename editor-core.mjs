/**
 * Pure layout helpers for the offline MemeMasters editor.
 * No network, accounts, paid AI, analytics, or user content persistence.
 */
export function clampNumber(value, min, max, fallback = min) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

export function fitImage(sourceWidth, sourceHeight, targetWidth, targetHeight, mode = 'cover') {
  const values = [sourceWidth, sourceHeight, targetWidth, targetHeight];
  if (!values.every(n => Number.isFinite(n) && n > 0)) {
    throw new RangeError('Image and canvas dimensions must be positive finite numbers.');
  }
  if (!['cover', 'contain'].includes(mode)) {
    throw new RangeError('Unsupported image-fit mode.');
  }
  const scaleX = targetWidth / sourceWidth;
  const scaleY = targetHeight / sourceHeight;
  const scale = mode === 'contain' ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return { x: (targetWidth - width) / 2, y: (targetHeight - height) / 2, width, height };
}

export function wrapCaption(text, maxWidth, measure) {
  if (!Number.isFinite(maxWidth) || maxWidth <= 0 || typeof measure !== 'function') {
    throw new TypeError('A positive width and text-measure function are required.');
  }
  const words = String(text ?? '').trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);
  const lines = [];
  let line = '';
  const emit = () => { if (line) { lines.push(line); line = ''; } };
  for (const word of words) {
    if (measure(word) > maxWidth) {
      emit();
      let part = '';
      for (const char of Array.from(word)) {
        if (part && measure(part + char) > maxWidth) {
          lines.push(part);
          part = '';
        }
        part += char;
      }
      line = part;
    } else if (!line) {
      line = word;
    } else if (measure(line + ' ' + word) <= maxWidth) {
      line += ' ' + word;
    } else {
      emit();
      line = word;
    }
  }
  emit();
  return lines;
}

export function safeFilename(value) {
  const cleaned = String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56)
    .replace(/-+$/g, '');
  return (cleaned || 'meme') + '.png';
}
