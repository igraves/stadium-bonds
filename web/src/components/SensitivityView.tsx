import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card } from './ui/Card';
import { Heatmap, createColorScale } from './charts/Heatmap';
import { usePaydownComparison, useSensitivity } from '../hooks/useSimulation';
import type { BondParams, LocalAddInsConfig, SensitivityCell } from '../types';
import { formatCurrency } from '../utils/formatters';

type MetricKey = 'capYears' | 'totalInterestB' | 'payoffYear';

const METRIC_OPTIONS: { key: MetricKey; label: string; description: string }[] = [
  { key: 'capYears', label: 'Capitalization Years', description: 'Years of interest-only payments' },
  { key: 'totalInterestB', label: 'Total Interest ($B)', description: 'Total interest paid over bond life' },
  { key: 'payoffYear', label: 'Payoff Year', description: 'Year when bonds are fully paid' },
];

interface SensitivityViewProps {
  bondParams: BondParams;
  localAddIns: LocalAddInsConfig;
}

export function SensitivityView({ bondParams, localAddIns }: SensitivityViewProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('payoffYear');

  // Fetch sensitivity analysis
  const { data: sensitivityData, isLoading: sensitivityLoading } = useSensitivity({
    bond: bondParams,
    localAddIns,
  });

  // Fetch paydown comparison
  const { data: paydownData, isLoading: paydownLoading } = usePaydownComparison({
    bond: bondParams,
    localAddIns,
  });

  // Prepare paydown comparison chart data
  const paydownChartData = useMemo(() => {
    if (!paydownData?.data?.comparison) return [];
    return paydownData.data.comparison.map((row) => ({
      ...row,
      label: `${row.paydownPct * 100}%`,
      totalInterest: row.totalInterestB * 1e9,
      savings: row.interestSavingsM * 1e6,
    }));
  }, [paydownData]);

  // Create color scale based on selected metric
  const colorScale = useMemo(() => {
    const grid = sensitivityData?.data?.grid || [];
    const values = grid
      .filter((c) => c.viable && c[selectedMetric] !== null)
      .map((c) => c[selectedMetric] as number);

    if (values.length === 0) {
      return createColorScale(0, 100, [
        { value: 0, color: '#dcfce7' },
        { value: 100, color: '#166534' },
      ]);
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    // Different color schemes for different metrics
    if (selectedMetric === 'totalInterestB') {
      // Lower is better for total interest - green to red
      return createColorScale(min, max, [
        { value: min, color: '#dcfce7' }, // green-100
        { value: (min + max) / 2, color: '#fef9c3' }, // yellow-100
        { value: max, color: '#fecaca' }, // red-200
      ]);
    } else {
      // Lower is better for capYears and payoffYear - green to red
      return createColorScale(min, max, [
        { value: min, color: '#dcfce7' }, // green-100
        { value: (min + max) / 2, color: '#fef9c3' }, // yellow-100
        { value: max, color: '#fecaca' }, // red-200
      ]);
    }
  }, [sensitivityData, selectedMetric]);

  // Format value based on metric
  const formatValue = (value: number | null): string => {
    if (value === null) return '—';
    if (selectedMetric === 'totalInterestB') {
      return `$${value.toFixed(1)}B`;
    }
    return value.toString();
  };

  if (sensitivityLoading && paydownLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sensitivity Matrix Section */}
      <Card title="Interest Rate vs Growth Rate Sensitivity">
        <div className="space-y-4">
          {/* Metric Selector */}
          <div className="flex flex-wrap gap-2">
            {METRIC_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => setSelectedMetric(option.key)}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                  ${selectedMetric === option.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Heatmap */}
          {sensitivityLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sensitivityData?.data?.grid ? (
            <div className="overflow-x-auto py-4">
              <Heatmap<SensitivityCell>
                data={sensitivityData.data.grid}
                xKey="interestRate"
                yKey="growthRate"
                valueKey={selectedMetric}
                xLabels={sensitivityData.data.interestRates}
                yLabels={sensitivityData.data.growthRates}
                formatValue={formatValue}
                formatXLabel={(v) => `${(v * 100).toFixed(1)}%`}
                formatYLabel={(v) => `${(v * 100).toFixed(1)}%`}
                colorScale={colorScale}
                xAxisLabel="Interest Rate"
                yAxisLabel="Growth Rate"
                viableKey="viable"
              />
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No sensitivity data available
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-200" />
              <span>Better</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200" />
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-200" />
              <span>Worse</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-50 border border-red-200" />
              <span>Not Viable</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Paydown Comparison Section */}
      <Card title="Paydown Comparison">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Interest Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Total Interest by Paydown %</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paydownChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatCurrency(v)}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    labelFormatter={(label) => `Paydown: ${label}`}
                  />
                  <Bar dataKey="totalInterest" name="Total Interest">
                    {paydownChartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.viable ? '#3b82f6' : '#f87171'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interest Savings Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Interest Savings vs 0% Paydown</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paydownChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => formatCurrency(v)}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    width={50}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    labelFormatter={(label) => `Paydown: ${label}`}
                  />
                  <Bar dataKey="savings" name="Interest Saved" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paydown %</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Interest</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payoff Year</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Interest Saved</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paydownData?.data?.comparison.map((row) => (
                <tr key={row.paydownPct} className={!row.viable ? 'bg-red-50' : ''}>
                  <td className="px-4 py-2 font-medium">{row.paydownPct * 100}%</td>
                  <td className="px-4 py-2">${row.totalInterestB.toFixed(2)}B</td>
                  <td className="px-4 py-2">Year {row.payoffYear}</td>
                  <td className="px-4 py-2 text-green-600">
                    {row.interestSavingsM > 0 ? `$${row.interestSavingsM.toFixed(0)}M` : '—'}
                  </td>
                  <td className="px-4 py-2">
                    {row.viable ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Viable
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Not Viable
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
