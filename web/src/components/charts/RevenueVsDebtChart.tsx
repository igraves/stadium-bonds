import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import type { AmortizationRow } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface RevenueVsDebtChartProps {
  schedule: AmortizationRow[];
  annualDebtService: number;
  coverageRatio: number;
  capYears: number;
  payoffYear: number | null;
}

export function RevenueVsDebtChart({
  schedule,
  annualDebtService,
  coverageRatio,
  capYears,
  payoffYear,
}: RevenueVsDebtChartProps) {
  const requiredRevenue = annualDebtService * coverageRatio;

  const data = schedule.map((row) => ({
    year: row.year,
    available: row.availableRevenue,
    debtService: row.debtService,
    extraPrincipal: row.extraPrincipal,
    total: row.debtService + row.extraPrincipal,
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* Cap period shading */}
          {capYears > 0 && (
            <ReferenceArea
              x1={1}
              x2={capYears}
              fill="#f3f4f6"
              fillOpacity={0.8}
            />
          )}

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
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                available: 'Available Revenue',
                debtService: 'Debt Service',
                extraPrincipal: 'Extra Principal',
              };
              return [formatCurrency(value as number), labels[name as string] ?? name];
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

          {/* Available revenue area */}
          <Area
            type="monotone"
            dataKey="available"
            name="Available Revenue"
            fill="#22c55e"
            fillOpacity={0.3}
            stroke="#22c55e"
            strokeWidth={2}
          />

          {/* Debt service area */}
          <Area
            type="monotone"
            dataKey="debtService"
            name="Debt Service"
            fill="#ef4444"
            fillOpacity={0.5}
            stroke="#ef4444"
            strokeWidth={2}
          />

          {/* Extra principal area */}
          <Area
            type="monotone"
            dataKey="extraPrincipal"
            name="Extra Principal"
            fill="#f97316"
            fillOpacity={0.5}
            stroke="#f97316"
            strokeWidth={2}
          />

          {/* Required coverage threshold */}
          <ReferenceLine
            y={requiredRevenue}
            stroke="#dc2626"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: `Required (${coverageRatio}x)`,
              position: 'right',
              fontSize: 10,
              fill: '#dc2626',
            }}
          />

          {/* Payoff year line */}
          {payoffYear && payoffYear < schedule.length && (
            <ReferenceLine
              x={payoffYear}
              stroke="#22c55e"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Payoff`,
                position: 'top',
                fontSize: 10,
                fill: '#22c55e',
              }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
