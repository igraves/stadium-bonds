import { useMemo } from 'react';
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
import { usePaydownComparison } from '../hooks/useSimulation';
import type { BondParams, LocalAddInsConfig } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SensitivityViewProps {
  bondParams: BondParams;
  localAddIns: LocalAddInsConfig;
}

export function SensitivityView({ bondParams, localAddIns }: SensitivityViewProps) {
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

  if (paydownLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

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
