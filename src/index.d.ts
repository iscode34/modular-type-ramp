export interface ScaleOptions {
  /** Base size in px. Default 16. */
  base?: number;
  /** Step multiplier, must be > 1. Default 1.333. */
  ratio?: number;
  /** How many sizes at or above the base. Default 6. */
  steps?: number;
  /** How many sizes below the base. Default 0. */
  down?: number;
  /** Unit of `value`. Default 'rem'. */
  unit?: 'px' | 'rem';
  /** Px per rem. Default 16. */
  root?: number;
}

export interface ScaleStep {
  step: number;
  name: string;
  px: number;
  rem: number;
  value: string;
  unit: 'px' | 'rem';
}

export interface FluidOptions {
  /** Size at the small viewport, px. Default 16. */
  minPx?: number;
  /** Size at the large viewport, px. Default 48. */
  maxPx?: number;
  /** Viewport where the minimum applies, px. Default 320. */
  minVw?: number;
  /** Viewport where the maximum applies, px. Default 1280. */
  maxVw?: number;
  /** Px per rem. Default 16. */
  root?: number;
}

export interface FluidResult {
  clamp: string;
  minRem: number;
  maxRem: number;
  slopeVw: number;
  interceptRem: number;
}

export interface CssOptions extends ScaleOptions {
  prefix?: string;
  fluid?: boolean;
  minPx?: number;
  maxPx?: number;
  comments?: boolean;
}

/** Build a modular scale (base - ratio^step). */
export function scale(options?: ScaleOptions): ScaleStep[];

/** Produce a fluid clamp() between two sizes over a viewport range. */
export function fluid(options?: FluidOptions): FluidResult;

/** Render the ramp as CSS custom properties. */
export function css(options?: CssOptions): string;

declare const _default: {
  scale: typeof scale;
  fluid: typeof fluid;
  css: typeof css;
};
export default _default;
