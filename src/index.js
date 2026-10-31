/**
 * modular-type-ramp
 * Generate a modular type scale and fluid clamp() sizes. Zero dependencies.
 *
 * @module modular-type-ramp
 */

const round = (n, digits = 4) => Number(n.toFixed(digits));

function assertNumber(name, value, min, max) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new TypeError(`${name} must be a number, received ${typeof value}`);
  }
  if (value < min || (max !== undefined && value > max)) {
    throw new RangeError(`${name} must be between ${min}${max === undefined ? '' : ` and ${max}`}, received ${value}`);
  }
}

/**
 * Build a modular scale: each step multiplies the base by `ratio`.
 *
 * @param {object} [options]
 * @param {number} [options.base=16]   base size in px
 * @param {number} [options.ratio=1.333] step multiplier, must be > 1
 * @param {number} [options.steps=6]   how many sizes at or above the base
 * @param {number} [options.down=0]    how many sizes below the base
 * @param {'px'|'rem'} [options.unit='rem'] unit for `value`
 * @param {number} [options.root=16]   px per rem when unit is 'rem'
 * @returns {{step:number,name:string,px:number,rem:number,value:string,unit:string}[]}
 */
export function scale(options = {}) {
  const {
    base = 16,
    ratio = 1.333,
    steps = 6,
    down = 0,
    unit = 'rem',
    root = 16,
  } = options;

  assertNumber('base', base, 1, 512);
  assertNumber('ratio', ratio, 1.0001, 3);
  assertNumber('steps', steps, 1, 24);
  assertNumber('down', down, 0, 12);
  assertNumber('root', root, 1, 64);
  if (unit !== 'px' && unit !== 'rem') {
    throw new TypeError("unit must be 'px' or 'rem'");
  }

  const out = [];
  for (let i = -down; i < steps; i += 1) {
    const px = round(base * ratio ** i, 3);
    const rem = round(px / root, 4);
    out.push({
      step: i,
      name: `step-${i < 0 ? 'minus' : ''}${Math.abs(i)}`,
      px,
      rem,
      value: unit === 'px' ? `${px}px` : `${rem}rem`,
      unit,
    });
  }
  return out;
}

/**
 * Produce a fluid `clamp()` that grows with the viewport between two sizes.
 *
 * @param {object} [options]
 * @param {number} [options.minPx=16]  size at the small viewport
 * @param {number} [options.maxPx=48]  size at the large viewport
 * @param {number} [options.minVw=320] viewport where the minimum applies, px
 * @param {number} [options.maxVw=1280] viewport where the maximum applies, px
 * @param {number} [options.root=16]   px per rem
 * @returns {{clamp:string,minRem:number,maxRem:number,slopeVw:number,interceptRem:number}}
 */
export function fluid(options = {}) {
  const {
    minPx = 16,
    maxPx = 48,
    minVw = 320,
    maxVw = 1280,
    root = 16,
  } = options;

  assertNumber('minPx', minPx, 1, 512);
  assertNumber('maxPx', maxPx, 1, 512);
  assertNumber('minVw', minVw, 100, 4000);
  assertNumber('maxVw', maxVw, 100, 4000);
  assertNumber('root', root, 1, 64);
  if (maxPx < minPx) {
    throw new RangeError('maxPx must be greater than or equal to minPx');
  }
  if (maxVw <= minVw) {
    throw new RangeError('maxVw must be greater than minVw');
  }

  const minRem = round(minPx / root, 4);
  const maxRem = round(maxPx / root, 4);
  const slopeVw = round(((maxPx - minPx) / (maxVw - minVw)) * 100, 4);
  const interceptRem = round(minRem - (slopeVw / 100) * minVw / root, 4);

  return {
    clamp: `clamp(${minRem}rem, ${interceptRem}rem + ${slopeVw}vw, ${maxRem}rem)`,
    minRem,
    maxRem,
    slopeVw,
    interceptRem,
  };
}

/**
 * Render the scale (or a fluid ramp) as CSS custom properties.
 *
 * @param {object} [options]
 * @param {string} [options.prefix='--fs'] property prefix
 * @param {boolean} [options.fluid=false] emit fluid values instead of fixed ones
 * @param {number} [options.minPx=16] fluid minimum for step 0 (fluid only)
 * @param {number} [options.maxPx=48] fluid maximum for the last step (fluid only)
 * @param {boolean} [options.comments=true] include step comments
 * @returns {string} CSS declarations, one per line
 */
export function css(options = {}) {
  const {
    prefix = '--fs',
    fluid: isFluid = false,
    minPx = 16,
    maxPx = 48,
    comments = true,
    ...scaleOptions
  } = options;

  const steps = scale(scaleOptions);

  if (!isFluid) {
    return steps
      .map((s) => `${comments ? `/* ${s.step}: ${s.px}px */ ` : ''}${prefix}-${s.step < 0 ? `minus${Math.abs(s.step)}` : s.step}: ${s.value};`)
      .join('\n');
  }

  // Each step keeps the scale's shape: step i is minPx·rⁱ at the small viewport
  // and maxPx·rⁱ at the large one, so the ramp is fluid without breaking the ratio.
  const baseForRatio = scaleOptions.base ?? 16;
  return steps
    .map((s) => {
      const factor = s.px / baseForRatio;
      const lo = Math.max(1, round(minPx * factor, 2));
      const hi = Math.max(lo, round(maxPx * factor, 2));
      const f = fluid({ minPx: lo, maxPx: hi });
      const name = `${prefix}-${s.step < 0 ? `minus${Math.abs(s.step)}` : s.step}`;
      return `${comments ? `/* ${s.step}: ${f.minRem}rem → ${f.maxRem}rem */ ` : ''}${name}: ${f.clamp};`;
    })
    .join('\n');
}

export default { scale, fluid, css };
