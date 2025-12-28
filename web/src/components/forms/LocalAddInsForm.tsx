import type { LocalAddInsConfig } from '../../types';

interface LocalAddInsFormProps {
  values: LocalAddInsConfig;
  onChange: (values: LocalAddInsConfig) => void;
}

export function LocalAddInsForm({ values, onChange }: LocalAddInsFormProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Local Add-Ins</h4>
      <p className="text-xs text-gray-500">Include local tax increment from:</p>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={values.includeOlathe}
          onChange={(e) => onChange({ ...values, includeOlathe: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Olathe ($65.9M base)</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={values.includeWyandotteUG}
          onChange={(e) => onChange({ ...values, includeWyandotteUG: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">Wyandotte UG ($107.1M base)</span>
      </label>
    </div>
  );
}
