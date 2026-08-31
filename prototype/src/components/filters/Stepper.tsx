"use client";

/**
 * The `− değer +` control from the Finview reference, with a track under it.
 *
 * **Three ways to reach the same number, and each is for a different person.**
 * The buttons are for a small adjustment, the track is for a large one, and the
 * text field is for somebody who already knows the figure. Finview offers only
 * the first, which means moving from 6.000 to 60.000 is fifty-four presses.
 *
 * **A native `<input type="range">`, not a hand-built track.** Dragging is the
 * easy half; what a hand-built slider almost always loses is the arrow keys,
 * Home and End, the announced value, and the touch target on a phone. The
 * native element has all of that already and needs styling rather than
 * rebuilding — so the accessibility is the default here instead of the thing
 * somebody remembers to add.
 *
 * The value is a real `<input>` too, so 37.500 can be typed instead of stepped
 * to. Clamped at both ends, and the buttons disable at the ends rather than
 * silently doing nothing.
 */
export function Stepper({
  label,
  value,
  min,
  max,
  step,
  format,
  parse,
  hint,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** How the number reads to a person: `42.990 ₺`, `7 ay`. */
  format: (value: number) => string;
  /** The inverse, for when they type. Returns null when it cannot be read. */
  parse: (raw: string) => number | null;
  /** The end labels under the track. */
  hint?: [string, string];
  onChange: (value: number) => void;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  const atMin = value <= min;
  const atMax = value >= max;
  const filled = ((value - min) / (max - min)) * 100;

  const button =
    "grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-lg font-semibold text-slate-700 transition-colors hover:enabled:border-sky-600 hover:enabled:bg-sky-50 hover:enabled:text-sky-800 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          aria-label={`${label} azalt`}
          className={button}
          disabled={atMin}
          onClick={() => onChange(clamp(value - step))}
          type="button"
        >
          −
        </button>

        <div className="min-w-0 flex-1 text-center">
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {label}
          </div>
          <input
            aria-label={`${label} değeri`}
            className="w-full bg-transparent text-center text-base font-semibold tabular-nums text-slate-900 focus:outline-none"
            onChange={(event) => {
              const parsed = parse(event.target.value);
              if (parsed !== null) onChange(clamp(parsed));
            }}
            value={format(value)}
          />
        </div>

        <button
          aria-label={`${label} artır`}
          className={button}
          disabled={atMax}
          onClick={() => onChange(clamp(value + step))}
          type="button"
        >
          +
        </button>
      </div>

      {/*
       * The track. `--filled` drives the gradient so the portion left of the
       * thumb is coloured; the thumb itself is styled in `globals.css`, because
       * `::-webkit-slider-thumb` cannot be written as a Tailwind utility.
       */}
      <input
        aria-label={`${label} kaydırıcı`}
        aria-valuetext={format(value)}
        className="range-track mt-2 w-full"
        max={max}
        min={min}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        step={step}
        style={{ ["--filled" as string]: `${filled}%` }}
        type="range"
        value={value}
      />

      {hint === undefined ? null : (
        <div className="flex justify-between text-[10px] tabular-nums text-slate-400">
          <span>{hint[0]}</span>
          <span>{hint[1]}</span>
        </div>
      )}
    </div>
  );
}
