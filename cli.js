#!/usr/bin/env node
import { scale, fluid, css } from './src/index.js';

const HELP = `type-ramp -?--?- modular type scale + fluid clamp() generator

Usage
  type-ramp [options]

Options
  --base <px>      base size (default 16)
  --ratio <n>      step ratio (default 1.333)
  --steps <n>      sizes at or above base (default 6)
  --down <n>       sizes below base (default 0)
  --unit <px|rem>  unit for the table (default rem)
  --css            print CSS custom properties instead of a table
  --fluid          with --css: emit fluid clamp() values
  --prefix <s>     with --css: property prefix (default --fs)
  --json           print JSON
  --help           show this help

Examples
  type-ramp
  type-ramp --base 16 --ratio 1.25 --steps 7
  type-ramp --css --fluid --prefix --type
`;

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) { out._.push(arg); continue; }
    const key = arg.slice(2);
    const flagOnly = ['css', 'fluid', 'json', 'help'];
    if (flagOnly.includes(key)) { out[key] = true; continue; }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      throw new Error(`missing value for --${key}`);
    }
    out[key] = next;
    i += 1;
  }
  return out;
}

const num = (value, fallback) => {
  if (value === undefined) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`expected a number, received "${value}"`);
  return n;
};

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`type-ramp: ${error.message}`);
    console.error('run with --help for usage');
    process.exit(1);
  }

  if (args.help) { console.log(HELP); return; }

  try {
    const options = {
      base: num(args.base, 16),
      ratio: num(args.ratio, 1.333),
      steps: num(args.steps, 6),
      down: num(args.down, 0),
      unit: args.unit ?? 'rem',
    };

    if (args.css) {
      process.stdout.write(`${css({
        ...options,
        prefix: args.prefix ?? '--fs',
        fluid: Boolean(args.fluid),
      })}\n`);
      return;
    }

    const rows = scale(options);

    if (args.json) {
      console.log(JSON.stringify(rows, null, 2));
      return;
    }

    const header = ['step', 'px', 'rem'];
    const body = rows.map((r) => [
      String(r.step),
      r.px.toFixed(2),
      r.rem.toFixed(4),
    ]);
    const widths = header.map((h, i) => Math.max(h.length, ...body.map((r) => r[i].length)));
    const line = (cells) => cells.map((c, i) => c.padEnd(widths[i])).join('  ').trimEnd();

    console.log(`modular scale | base ${options.base}px | ratio ${options.ratio} | ${rows.length} steps`);
    console.log('');
    console.log(line(header));
    console.log(line(widths.map((w) => '-'.repeat(w))));
    for (const row of body) console.log(line(row));
    console.log('');
    console.log(`fluid example  ${fluid({ minPx: options.base, maxPx: options.base * options.ratio ** 3 }).clamp}`);
  } catch (error) {
    console.error(`type-ramp: ${error.message}`);
    process.exit(1);
  }
}

main();
