# modular-type-ramp

Generate a **modular type scale** and **fluid `clamp()`** sizes — deterministically, with no dependencies, no build step, and no runtime CSS parsing.

A modular scale is a sequence of sizes built from one base size and one ratio (`16 × 1.25ⁿ`). It is how print designers kept hierarchy consistent for a century; on the web it is also the easiest way to stop inventing `13px`, `15px` and `17px` by accident.

```bash
npm install modular-type-ramp
```

```js
import { scale, fluid, css } from 'modular-type-ramp';

scale({ base: 16, ratio: 1.25, steps: 5 });
// [{ step: 0, name: 'step-0', px: 16,    rem: 1,      value: '1rem',      unit: 'rem' },
//  { step: 1, name: 'step-1', px: 20,    rem: 1.25,   value: '1.25rem',   unit: 'rem' },
//  { step: 2, name: 'step-2', px: 25,    rem: 1.5625, value: '1.5625rem', unit: 'rem' },
//  { step: 3, name: 'step-3', px: 31.25, rem: 1.9531, value: '1.9531rem', unit: 'rem' },
//  { step: 4, name: 'step-4', px: 39.06, rem: 2.4414, value: '2.4414rem', unit: 'rem' }]
```

## Why

A type scale is a constraint, not a decoration. When every size on a page comes from one ratio:

- hierarchy becomes predictable (two steps bigger always means the same jump);
- hand-off between designers and developers stops drifting;
- you can prove a typography decision instead of arguing about it.

Adding fluid sizing on top means the same ramp works from a phone to a 4K monitor without a single media query.

## API

### `scale(options?)`

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `base` | `number` | `16` | base size in px |
| `ratio` | `number` | `1.333` | step multiplier, must be `> 1` |
| `steps` | `number` | `6` | sizes at or above the base |
| `down` | `number` | `0` | sizes below the base (useful for captions) |
| `unit` | `'px' \| 'rem'` | `'rem'` | unit of the returned `value` |
| `root` | `number` | `16` | px per rem |

Returns `{ step, name, px, rem, value, unit }[]`, ordered from the smallest step upward.

### `fluid(options?)`

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `minPx` | `number` | `16` | size at the small viewport |
| `maxPx` | `number` | `48` | size at the large viewport |
| `minVw` | `number` | `320` | viewport where the minimum applies |
| `maxVw` | `number` | `1280` | viewport where the maximum applies |
| `root` | `number` | `16` | px per rem |

Returns the `clamp()` string plus the numbers behind it, so you can test the line:

```js
fluid({ minPx: 20, maxPx: 40, minVw: 360, maxVw: 1200 });
// {
//   clamp: 'clamp(1.25rem, 0.7381rem + 2.2727vw, 2.5rem)',
//   minRem: 1.25, maxRem: 2.5, slopeVw: 2.2727, interceptRem: 0.7381
// }
```

### `css(options?)`

Renders the ramp as CSS custom properties, ready to paste into a stylesheet.

```js
css({ base: 16, ratio: 1.25, steps: 5, prefix: '--fs' });
```

```css
/* 0: 16px */ --fs-0: 1rem;
/* 1: 20px */ --fs-1: 1.25rem;
/* 2: 25px */ --fs-2: 1.5625rem;
/* 3: 31.25px */ --fs-3: 1.9531rem;
/* 4: 39.06px */ --fs-4: 2.4414rem;
```

Set `fluid: true` to emit `clamp()` values instead, and `comments: false` for a clean block.

## CLI

```bash
npx type-ramp                       # print the table
npx type-ramp --ratio 1.25 --steps 7
npx type-ramp --css --fluid         # emit clamp() custom properties
npx type-ramp --json                # machine-readable
npx type-ramp --help
```

```
$ npx type-ramp --base 16 --ratio 1.25 --steps 4
modular scale · base 16px · ratio 1.25 · 4 steps

step  px     rem
────  ─────  ───────
0     16.00  1.0000
1     20.00  1.2500
2     25.00  1.5625
3     31.25  1.9531

fluid example  clamp(1rem, 0.125rem + 4.375vw, 3.05rem)
```

## Typical ratios

| Ratio | Character | Use for |
| --- | --- | --- |
| `1.125` (major second) | tight | dense product UI |
| `1.25` (major third) | balanced | most web interfaces |
| `1.333` (perfect fourth) | editorial | marketing, long-form |
| `1.5` (perfect fifth) | loud | posters, hero-only |

## Guarantees

- **Zero dependencies.** `npm ls --omit=dev` is empty; nothing to audit.
- **ESM**, with TypeScript declarations shipped in the package.
- **Validated input.** A ratio of `1` or a descending viewport range throws instead of emitting broken CSS.
- **Tested arithmetic.** The fluid slope is asserted against both endpoints, not eyeballed.

## Scripts

```bash
npm test    # node --test, no test framework to install
npm run demo
```

## License

MIT © Mohammad Istahad Alam Chowdhury
