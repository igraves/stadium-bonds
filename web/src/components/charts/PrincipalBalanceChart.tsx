import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { AmortizationRow } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface PrincipalBalanceChartProps {
  schedule: AmortizationRow[];
  initialPrincipal: number;
  payoffYear: number | null;
}

export function PrincipalBalanceChart({
  schedule,
  initialPrincipal,
  payoffYear,
}: PrincipalBalanceChartProps) {
  const data = schedule.map((row) => ({
    year: row.year,
    principal: row.endingPrincipal,
    extraPrincipal: row.extraPrincipal,
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `$${(value / 1e9).toFixed(1)}B`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `$${(value / 1e6).toFixed(0)}M`}
          />
          <Tooltip
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                principal: 'Principal Balance',
                extraPrincipal: 'Extra Principal Paid',
              };
              const scale = (name as string) === 'principal' ? 'B' : 'M';
              return [formatCurrency(value as number, { scale }), labels[name as string] ?? name];
            }}
            labelFormatter={(label) => `Year ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />

          {/* Principal balance area */}
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="principal"
            name="Principal Balance"
            fill="#3b82f6"
            fillOpacity={0.3}
            stroke="#3b82f6"
            strokeWidth={2}
          />

          {/* Extra principal bars */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="extraPrincipal"
            name="Extra Principal Paid"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 3 }}
          />

          {/* Original principal reference */}
          <ReferenceLine
            yAxisId="left"
            y={initialPrincipal}
            stroke="#3b82f6"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
            label={{
              value: 'Original',
              position: 'right',
              fontSize: 10,
              fill: '#3b82f6',
            }}
          />

          {/* Payoff year line */}
          {payoffYear && payoffYear < schedule.length && (
            <ReferenceLine
              x={payoffYear}
              stroke="#22c55e"
              strokeDasharray="5 5"
              strokeWidth={2}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
