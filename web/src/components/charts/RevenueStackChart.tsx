import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AmortizationRow } from '../../types';
import { STREAM_COLORS, getStreamDisplayName } from '../../utils/colors';
import { formatCurrency } from '../../utils/formatters';

interface RevenueStackChartProps {
  schedule: AmortizationRow[];
}

export function RevenueStackChart({ schedule }: RevenueStackChartProps) {
  // Get stream keys from first row
  const streamKeys = schedule.length > 0 ? Object.keys(schedule[0].revenueByStream) : [];

  // Transform data for Recharts
  const data = schedule.map((row) => ({
    year: row.year,
    ...row.revenueByStream,
    total: row.availableRevenue,
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `$${(value / 1e6).toFixed(0)}M`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              getStreamDisplayName(name),
            ]}
            labelFormatter={(label) => `Year ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '12px',
            }}
          />
          <Legend
            formatter={(value) => getStreamDisplayName(value)}
            wrapperStyle={{ fontSize: '11px' }}
          />
          {streamKeys.map((key) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={STREAM_COLORS[key] ?? '#888'}
              fill={STREAM_COLORS[key] ?? '#888'}
              fillOpacity={0.7}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
