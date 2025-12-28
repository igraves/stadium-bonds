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
  Legend,
} from 'recharts';
import { Heatmap, createColorScale } from './charts/Heatmap';
import { Card } from './ui/Card';
import { useSensitivity, usePaydownComparison } from '../hooks/useSimulation';
import type { BondParams, LocalAddInsConfig, SensitivityCell } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SensitivityViewProps {
  bondParams: BondParams;
  localAddIns: LocalAddInsConfig;
}

type HeatmapMetric = 'capYears' | 'totalInterestB' | 'payoffYear';

const METRIC_OPTIONS: { value: HeatmapMetric; label: string }[] = [
  { value: 'capYears', label: 'Capitalization Years' },
  { value: 'totalInterestB', label: 'Total Interest ($B)' },
  { value: 'payoffYear', label: 'Payoff Year' },
];

export function SensitivityView({ bondParams, localAddIns }: SensitivityViewProps) {
  const [selectedMetric, setSelectedMetric] = useState<HeatmapMetric>('capYears');

  // Fetch sensitivity data
  const { data: sensitivityData, isLoading: sensitivityLoading } = useSensitivity({
    bond: bondParams,
    localAddIns,
  });

  // Fetch paydown comparison
  const { data: paydownData, isLoading: paydownLoading } = usePaydownComparison({
    bond: bondParams,
    localAddIns,
  });

  // Color scales for different metrics
  const colorScales = useMemo(() => ({
    capYears: createColorScale(0, 15, [
      { value: 0, color: '#dcfce7' },  // green-100
      { value: 5, color: '#86efac' },  // green-300
      { value: 10, color: '#fef08a' }, // yellow-200
      { value: 15, color: '#fecaca' }, // red-200
    ]),
    totalInterestB: createColorScale(1, 3, [
      { value: 1, color: '#dcfce7' },  // green-100
      { value: 1.5, color: '#86efac' },
      { value: 2, color: '#fef08a' },
      { value: 2.5, color: '#fed7aa' },
      { value: 3, color: '#fecaca' },
    ]),
    payoffYear: createColorScale(15, 30, [
      { value: 15, color: '#dcfce7' },
      { value: 20, color: '#bbf7d0' },
      { value: 25, color: '#fef08a' },
      { value: 30, color: '#fecaca' },
    ]),
  }), []);

  // Format functions
  const formatMetricValue = (metric: HeatmapMetric) => (value: number | null) => {
    if (value === null) return '—';
    switch (metric) {
      case 'capYears':
        return `${value}`;
      case 'totalInterestB':
        return `$${value.toFixed(2)}B`;
      case 'payoffYear':
        return `Yr ${value}`;
      default:
        return String(value);
    }
  };

  const formatInterestRate = (rate: number) => `${(rate * 100).toFixed(1)}%`;
  const formatGrowthRate = (rate: number) => `${(rate * 100).toFixed(1)}%`;

  // Prepare paydown comparison chart data
  const paydownChartData = useMemo(() => {
    if (!paydownData?.data?.comparison) return [];
    return paydownData.data.comparison.map((row) => ({
      ...row,
      label: `${row.paydownPct}%`,
      totalInterest: row.totalInterestB * 1e9,
      savings: row.interestSavingsM * 1e6,
    }));
  }, [paydownData]);

  if (sensitivityLoading || paydownLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const grid = sensitivityData?.data?.grid ?? [];
  const interestRates = sensitivityData?.data?.interestRates ?? [];
  const growthRates = sensitivityData?.data?.growthRates ?? [];

  return (
    <div className="space-y-6">
      {/* Heatmap Section */}
      <Card title="Sensitivity Analysis">
        <div className="space-y-4">
          {/* Metric Selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Show:</span>
            <div className="flex gap-2">
              {METRIC_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMetric(option.value)}
                  className={`
                    px-3 py-1.5 text-sm rounded-lg transition-colors
                    ${selectedMetric === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Heatmap */}
          {grid.length > 0 && (
            <Heatmap<SensitivityCell>
              data={grid}
              xKey="interestRate"
              yKey="growthRate"
              valueKey={selectedMetric}
              xLabels={interestRates}
              yLabels={growthRates}
              formatValue={formatMetricValue(selectedMetric)}
              formatXLabel={formatInterestRate}
              formatYLabel={formatGrowthRate}
              colorScale={colorScales[selectedMetric]}
              xAxisLabel="Interest Rate"
              yAxisLabel="Growth Rate"
              viableKey="viable"
            />
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-4">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span>Better</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-200 border border-yellow-300 rounded"></div>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span>Worse / Not Viable</span>
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
                    formatter={(value: number) => formatCurrency(value)}
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
                    formatter={(value: number) => formatCurrency(value)}
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
                  <td className="px-4 py-2 font-medium">{row.paydownPct}%</td>
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
