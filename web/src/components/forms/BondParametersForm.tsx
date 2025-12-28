import type { BondParams } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface BondParametersFormProps {
  values: BondParams;
  onChange: (values: BondParams) => void;
}

export function BondParametersForm({ values, onChange }: BondParametersFormProps) {
  const handleChange = (field: keyof BondParams, value: number) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Bond Parameters</h4>

      {/* Principal */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Principal ({formatCurrency(values.principal, { scale: 'B' })})
        </label>
        <input
          type="range"
          min={1_000_000_000}
          max={5_000_000_000}
          step={100_000_000}
          value={values.principal}
          onChange={(e) => handleChange('principal', Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>$1B</span>
          <span>$5B</span>
        </div>
      </div>

      {/* Interest Rate */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Interest Rate ({formatPercent(values.interestRate)})
        </label>
        <input
          type="range"
          min={0.03}
          max={0.08}
          step={0.005}
          value={values.interestRate}
          onChange={(e) => handleChange('interestRate', Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>3%</span>
          <span>8%</span>
        </div>
      </div>

      {/* Term Years */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Term ({values.termYears} years)
        </label>
        <input
          type="range"
          min={15}
          max={40}
          step={1}
          value={values.termYears}
          onChange={(e) => handleChange('termYears', Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>15 yrs</span>
          <span>40 yrs</span>
        </div>
      </div>

      {/* Coverage Ratio */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Coverage Ratio ({values.coverageRatio.toFixed(2)}x)
        </label>
        <input
          type="range"
          min={1.0}
          max={1.6}
          step={0.05}
          value={values.coverageRatio}
          onChange={(e) => handleChange('coverageRatio', Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1.00x</span>
          <span>1.60x</span>
        </div>
      </div>
    </div>
  );
}
