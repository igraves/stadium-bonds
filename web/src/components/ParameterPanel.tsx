import { X, RotateCcw } from 'lucide-react';
import type { BondParams, LocalAddInsConfig, StreamOverrides } from '../types';
import { BondParametersForm } from './forms/BondParametersForm';
import { LocalAddInsForm } from './forms/LocalAddInsForm';
import { PaydownSlider } from './forms/PaydownSlider';
import { AdvancedSettingsForm } from './forms/AdvancedSettingsForm';

interface ParameterPanelProps {
  bondParams: BondParams;
  localAddIns: LocalAddInsConfig;
  paydownPct: number;
  streamOverrides: StreamOverrides;
  onBondParamsChange: (params: BondParams) => void;
  onLocalAddInsChange: (config: LocalAddInsConfig) => void;
  onPaydownPctChange: (pct: number) => void;
  onStreamOverridesChange: (overrides: StreamOverrides) => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ParameterPanel({
  bondParams,
  localAddIns,
  paydownPct,
  streamOverrides,
  onBondParamsChange,
  onLocalAddInsChange,
  onPaydownPctChange,
  onStreamOverridesChange,
  onReset,
  isOpen,
  onClose,
}: ParameterPanelProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between lg:hidden">
          <h2 className="font-semibold text-gray-800">Parameters</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <BondParametersForm
            values={bondParams}
            onChange={onBondParamsChange}
          />

          <div className="border-t border-gray-100 pt-4">
            <LocalAddInsForm
              values={localAddIns}
              onChange={onLocalAddInsChange}
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <PaydownSlider
              value={paydownPct}
              onChange={onPaydownPctChange}
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <AdvancedSettingsForm
              streamOverrides={streamOverrides}
              onChange={onStreamOverridesChange}
            />
          </div>

          {/* Reset Button */}
          <div className="border-t border-gray-100 pt-4">
            <button
              onClick={onReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
