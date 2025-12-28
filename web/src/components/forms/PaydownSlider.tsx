import { formatPercent } from '../../utils/formatters';

interface PaydownSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const PRESETS = [0, 0.25, 0.5, 0.75, 1.0];

export function PaydownSlider({ value, onChange }: PaydownSliderProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Accelerated Paydown
      </h4>
      <p className="text-xs text-gray-500">
        Apply excess revenue to early principal reduction
      </p>

      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-blue-600">{formatPercent(value, 0)}</span>
        <span className="text-xs text-gray-500">of excess</span>
      </div>

      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />

      <div className="flex justify-between gap-1">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            className={`px-2 py-1 text-xs rounded ${
              Math.abs(value - preset) < 0.01
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {formatPercent(preset, 0)}
          </button>
        ))}
      </div>
    </div>
  );
}
