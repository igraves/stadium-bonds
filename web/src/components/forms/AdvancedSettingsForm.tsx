import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  RevenueStreamType,
  DEFAULT_REVENUE_STREAMS,
  RAW_TAX_BASES,
  DEFAULT_GROCERY_EXEMPTIONS,
  STREAM_LABELS,
  type StreamOverrides,
} from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface AdvancedSettingsFormProps {
  streamOverrides: StreamOverrides;
  onChange: (overrides: StreamOverrides) => void;
  privateInvestment: number;
  onPrivateInvestmentChange: (value: number) => void;
}

// Tax streams with grocery exemption controls
const TAX_STREAMS: RevenueStreamType[] = [
  RevenueStreamType.STATE_SALES_TAX,
  RevenueStreamType.USE_TAX,
];

// Other core streams (no grocery exemption)
const OTHER_CORE_STREAMS: RevenueStreamType[] = [
  RevenueStreamType.LET,
  RevenueStreamType.LIQUOR_EXCISE,
  RevenueStreamType.APSK,
];

// Local add-in streams
const LOCAL_STREAMS: RevenueStreamType[] = [
  RevenueStreamType.OLATHE_LOCAL,
  RevenueStreamType.WYANDOTTE_UG_LOCAL,
];

// Get raw base for tax streams
const getRawBase = (streamType: RevenueStreamType): number => {
  if (streamType === RevenueStreamType.STATE_SALES_TAX) {
    return RAW_TAX_BASES.stateSalesTax;
  }
  if (streamType === RevenueStreamType.USE_TAX) {
    return RAW_TAX_BASES.useTax;
  }
  return DEFAULT_REVENUE_STREAMS[streamType].base;
};

// Get default grocery exemption for tax streams
const getDefaultGroceryExemption = (streamType: RevenueStreamType): number => {
  if (streamType === RevenueStreamType.STATE_SALES_TAX) {
    return DEFAULT_GROCERY_EXEMPTIONS.stateSalesTax;
  }
  if (streamType === RevenueStreamType.USE_TAX) {
    return DEFAULT_GROCERY_EXEMPTIONS.useTax;
  }
  return 0;
};

export function AdvancedSettingsForm({
  streamOverrides,
  onChange,
  privateInvestment,
  onPrivateInvestmentChange
}: AdvancedSettingsFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleBaseChange = (streamType: RevenueStreamType, value: string) => {
    const numValue = parseFloat(value.replace(/,/g, ''));
    if (isNaN(numValue)) return;

    const newOverrides = { ...streamOverrides };
    if (!newOverrides[streamType]) {
      newOverrides[streamType] = {};
    }
    newOverrides[streamType]!.base = numValue * 1_000_000; // Convert from millions
    onChange(newOverrides);
  };

  const handleGrowthChange = (streamType: RevenueStreamType, value: number) => {
    const newOverrides = { ...streamOverrides };
    if (!newOverrides[streamType]) {
      newOverrides[streamType] = {};
    }
    newOverrides[streamType]!.growthRate = value / 100; // Convert from percentage
    onChange(newOverrides);
  };

  const handleGroceryExemptionChange = (streamType: RevenueStreamType, value: number) => {
    const rawBase = getRawBase(streamType);
    const exemptionPct = value / 100;
    const adjustedBase = rawBase * (1 - exemptionPct);

    const newOverrides = { ...streamOverrides };
    if (!newOverrides[streamType]) {
      newOverrides[streamType] = {};
    }
    newOverrides[streamType]!.base = adjustedBase;
    newOverrides[streamType]!.groceryExemption = exemptionPct;
    onChange(newOverrides);
  };

  const getBaseValue = (streamType: RevenueStreamType): number => {
    const override = streamOverrides[streamType]?.base;
    if (override !== undefined) return override / 1_000_000;
    return DEFAULT_REVENUE_STREAMS[streamType].base / 1_000_000;
  };

  const getRawBaseValue = (streamType: RevenueStreamType): number => {
    return getRawBase(streamType) / 1_000_000;
  };

  const getGrowthValue = (streamType: RevenueStreamType): number => {
    const override = streamOverrides[streamType]?.growthRate;
    if (override !== undefined) return override * 100;
    return DEFAULT_REVENUE_STREAMS[streamType].growthRate * 100;
  };

  const getGroceryExemptionValue = (streamType: RevenueStreamType): number => {
    const override = streamOverrides[streamType]?.groceryExemption;
    if (override !== undefined) return override * 100;
    return getDefaultGroceryExemption(streamType) * 100;
  };

  const isModified = (streamType: RevenueStreamType): boolean => {
    const override = streamOverrides[streamType];
    if (!override) return false;
    const defaults = DEFAULT_REVENUE_STREAMS[streamType];
    const defaultGrocery = getDefaultGroceryExemption(streamType);
    return (
      (override.base !== undefined && override.base !== defaults.base) ||
      (override.growthRate !== undefined && override.growthRate !== defaults.growthRate) ||
      (override.groceryExemption !== undefined && override.groceryExemption !== defaultGrocery)
    );
  };

  // Render a tax stream with grocery exemption slider
  const renderTaxStreamControl = (streamType: RevenueStreamType) => {
    const rawBase = getRawBaseValue(streamType);
    const effectiveBase = getBaseValue(streamType);
    const growthValue = getGrowthValue(streamType);
    const groceryExemption = getGroceryExemptionValue(streamType);
    const modified = isModified(streamType);
    const defaultGrocery = getDefaultGroceryExemption(streamType) * 100;

    return (
      <div key={streamType} className="space-y-2 pb-3 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">
            {STREAM_LABELS[streamType]}
          </label>
          {modified && (
            <span className="text-xs text-amber-600">Modified</span>
          )}
        </div>

        {/* Raw Base (read-only display) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-20">Raw Base:</span>
          <span className="text-xs font-medium text-gray-700">
            ${rawBase.toFixed(0)}M
          </span>
        </div>

        {/* Grocery Exemption Slider */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-20">Grocery Adj:</span>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={groceryExemption}
            onChange={(e) => handleGroceryExemptionChange(streamType, parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <span className="text-xs font-medium text-gray-700 w-12 text-right">
            -{groceryExemption.toFixed(0)}%
          </span>
        </div>

        {/* Effective Base (computed) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-20">Effective:</span>
          <span className="text-xs font-medium text-blue-600">
            ${effectiveBase.toFixed(1)}M
          </span>
          <span className="text-xs text-gray-400">
            (${rawBase.toFixed(0)}M × {(100 - groceryExemption).toFixed(0)}%)
          </span>
        </div>

        {/* Growth Rate Slider */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-20">CAGR:</span>
          <input
            type="range"
            min="0"
            max="6"
            step="0.1"
            value={growthValue}
            onChange={(e) => handleGrowthChange(streamType, parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-xs font-medium text-gray-700 w-12 text-right">
            {growthValue.toFixed(1)}%
          </span>
        </div>

        {/* Default hint */}
        <div className="text-xs text-gray-400">
          Default: -{defaultGrocery.toFixed(0)}% grocery adj @ {(DEFAULT_REVENUE_STREAMS[streamType].growthRate * 100).toFixed(1)}% CAGR
        </div>
      </div>
    );
  };

  // Render a regular stream (no grocery exemption)
  const renderStreamControl = (streamType: RevenueStreamType) => {
    const defaultStream = DEFAULT_REVENUE_STREAMS[streamType];
    const baseValue = getBaseValue(streamType);
    const growthValue = getGrowthValue(streamType);
    const modified = isModified(streamType);

    return (
      <div key={streamType} className="space-y-2 pb-3 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-700">
            {STREAM_LABELS[streamType]}
          </label>
          {modified && (
            <span className="text-xs text-amber-600">Modified</span>
          )}
        </div>

        {/* Base Revenue */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-12">Base:</span>
          <div className="flex-1 relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
            <input
              type="number"
              value={baseValue.toFixed(1)}
              onChange={(e) => handleBaseChange(streamType, e.target.value)}
              className="w-full pl-5 pr-8 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              step="0.1"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">M</span>
          </div>
        </div>

        {/* Growth Rate Slider */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-12">CAGR:</span>
          <input
            type="range"
            min="0"
            max="6"
            step="0.1"
            value={growthValue}
            onChange={(e) => handleGrowthChange(streamType, parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-xs font-medium text-gray-700 w-12 text-right">
            {growthValue.toFixed(1)}%
          </span>
        </div>

        {/* Default hint */}
        <div className="text-xs text-gray-400">
          Default: {formatCurrency(defaultStream.base)} @ {(defaultStream.growthRate * 100).toFixed(1)}%
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-sm font-semibold text-gray-800">Advanced Settings</h3>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4 pt-2">
          {/* Private Investment */}
          <div className="space-y-3 pb-3 border-b border-gray-100">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Private Investment
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">Amount:</span>
                <div className="flex-1 relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                  <input
                    type="number"
                    value={(privateInvestment / 1_000_000_000).toFixed(2)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        onPrivateInvestmentChange(val * 1_000_000_000);
                      }
                    }}
                    className="w-full pl-5 pr-8 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    step="0.1"
                    min="0"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">B</span>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Default: $1.6B (team/private contribution to stadium)
              </div>
            </div>
          </div>

          {/* Tax Streams with Grocery Exemption */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tax Revenue Streams
            </h4>
            <p className="text-xs text-gray-400">
              Adjust grocery exemption % to model food sales tax phase-out impact.
            </p>
            {TAX_STREAMS.map(renderTaxStreamControl)}
          </div>

          {/* Other Core Streams */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Other Revenue Streams
            </h4>
            {OTHER_CORE_STREAMS.map(renderStreamControl)}
          </div>

          {/* Local Add-Ins */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Local Add-In Streams
            </h4>
            <p className="text-xs text-gray-400">
              These are only included when enabled above.
            </p>
            {LOCAL_STREAMS.map(renderStreamControl)}
          </div>
        </div>
      )}
    </div>
  );
}
