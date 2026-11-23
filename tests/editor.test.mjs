import test from 'node:test';
import assert from 'node:assert/strict';
import { clampNumber, fitImage, wrapCaption, safeFilename } from '../editor-core.mjs';

test('cover crops a wide image without stretching', () => {
  assert.deepEqual(fitImage(1200, 600, 1080, 1080, 'cover'),
    { x: -540, y: 0, width: 2160, height: 1080 });
});
test('contain letterboxes a wide image without distortion', () => {
  assert.deepEqual(fitImage(1200, 600, 1080, 1080, 'contain'),
    { x: 0, y: 270, width: 1080, height: 540 });
});
test('invalid dimensions and modes fail closed', () => {
  assert.throws(() => fitImage(0, 600, 1080, 1080), RangeError);
  assert.throws(() => fitImage(100, Infinity, 1080, 1080), RangeError);
  assert.throws(() => fitImage(100, 100, 1080, 1080, 'stretch'), RangeError);
});
test('caption wraps words without losing any text', () => {
  assert.deepEqual(wrapCaption('hello   world', 55, s => s.length * 10), ['hello', 'world']);
  assert.deepEqual(wrapCaption('', 55, s => s.length * 10), []);
});
test('caption splits extremely long unbroken text', () => {
  assert.deepEqual(wrapCaption('abcdefgh', 30, s => s.length * 10), ['abc', 'def', 'gh']);
});
test('file names cannot traverse paths or inject control characters', () => {
  assert.equal(safeFilename('../Great! Surprise \n'), 'great-surprise.png');
  assert.equal(safeFilename(''), 'meme.png');
  assert.equal(safeFilename('éclair meme'), 'eclair-meme.png');
});
test('numeric settings remain in a finite supported range', () => {
  assert.equal(clampNumber('800', 26, 100), 100);
  assert.equal(clampNumber('22', 26, 100), 26);
  assert.equal(clampNumber('bad', 26, 100, 58), 58);
});
