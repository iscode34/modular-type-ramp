import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scale, fluid, css } from '../src/index.js';

test('scale: default has six steps starting at the base', () => {
  const rows = scale();
  assert.equal(rows.length, 6);
  assert.equal(rows[0].px, 16);
  assert.equal(rows[0].value, '1rem');
  assert.equal(rows[5].step, 5);
});

test('scale: each step multiplies by the ratio', () => {
  const rows = scale({ base: 16, ratio: 1.25, steps: 3 });
  assert.deepEqual(rows.map((r) => r.px), [16, 20, 25]);
  assert.equal(rows[2].rem, 1.5625);
});

test('scale: down steps are included and named', () => {
  const rows = scale({ down: 2, steps: 1 });
  assert.equal(rows.length, 3);
  assert.equal(rows[0].step, -2);
  assert.equal(rows[0].name, 'step-minus2');
  assert.ok(rows[0].px < 16);
});

test('scale: unit px is honoured', () => {
  const rows = scale({ base: 18, steps: 1, unit: 'px' });
  assert.equal(rows[0].value, '18px');
  assert.equal(rows[0].unit, 'px');
});

test('scale: rejects a ratio that does not grow', () => {
  assert.throws(() => scale({ ratio: 1 }), RangeError);
  assert.throws(() => scale({ ratio: 0.8 }), RangeError);
});

test('scale: rejects zero steps and non-numbers', () => {
  assert.throws(() => scale({ steps: 0 }), RangeError);
  assert.throws(() => scale({ base: '16' }), TypeError);
});

test('fluid: clamp goes from min to max over the viewport range', () => {
  const f = fluid({ minPx: 16, maxPx: 48, minVw: 320, maxVw: 1280 });
  assert.equal(f.minRem, 1);
  assert.equal(f.maxRem, 3);
  assert.match(f.clamp, /^clamp\(1rem, .+vw, 3rem\)$/);
  assert.ok(f.slopeVw > 0);
});

test('fluid: slope is a straight line through both endpoints', () => {
  const { minPx = 16, maxPx = 48, minVw = 320, maxVw = 1280 } = {};
  const f = fluid({ minPx, maxPx, minVw, maxVw });
  const at = (vw) => f.interceptRem * 16 + (f.slopeVw / 100) * vw;
  assert.ok(Math.abs(at(minVw) - minPx) < 0.01, `at ${minVw}px expected ${minPx}, got ${at(minVw)}`);
  assert.ok(Math.abs(at(maxVw) - maxPx) < 0.01, `at ${maxVw}px expected ${maxPx}, got ${at(maxVw)}`);
});

test('fluid: equal sizes produce a zero slope', () => {
  const f = fluid({ minPx: 24, maxPx: 24 });
  assert.equal(f.slopeVw, 0);
});

test('fluid: rejects inverted viewport ranges and descending sizes', () => {
  assert.throws(() => fluid({ minVw: 1280, maxVw: 320 }), RangeError);
  assert.throws(() => fluid({ minPx: 48, maxPx: 16 }), RangeError);
});

test('css: fixed mode emits one custom property per step', () => {
  const out = css({ base: 16, ratio: 1.25, steps: 3 });
  const lines = out.split('\n');
  assert.equal(lines.length, 3);
  assert.match(lines[0], /--fs-0: 1rem;/);
  assert.match(lines[2], /--fs-2: 1\.5625rem;/);
});

test('css: custom prefix and no comments', () => {
  const out = css({ steps: 2, prefix: '--type', comments: false });
  assert.equal(out.split('\n')[0], '--type-0: 1rem;');
});

test('css: fluid mode emits clamp() for every step', () => {
  const out = css({ steps: 4, fluid: true });
  for (const line of out.split('\n')) assert.match(line, /clamp\(/);
});

test('css: fluid step 0 starts at minPx and grows to maxPx', () => {
  const out = css({ base: 16, ratio: 1.25, steps: 3, fluid: true, minPx: 16, maxPx: 40, comments: false });
  const [first] = out.split('\n');
  assert.match(first, /^--fs-0: clamp\(1rem, .+, 2\.5rem\);$/);
});

test('css: fluid steps keep the ratio between their endpoints', () => {
  const out = css({ base: 16, ratio: 1.25, steps: 3, fluid: true, minPx: 16, maxPx: 40, comments: false });
  const lines = out.split('\n');
  // step 1 endpoint = step 0 endpoint - 1.25 -> 1.25rem - 3.125rem
  assert.match(lines[1], /clamp\(1\.25rem, .+, 3\.125rem\)/);
});

test('css: negative steps are named minus', () => {
  const out = css({ steps: 1, down: 1, comments: false });
  assert.match(out, /--fs-minus1:/);
});
