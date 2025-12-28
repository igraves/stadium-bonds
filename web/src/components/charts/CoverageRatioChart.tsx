import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { AmortizationRow } from '../../types';
import { PERIOD_COLORS, getPeriodColor } from '../../utils/colors';
import { formatRatio } from '../../utils/formatters';

interface CoverageRatioChartProps {
  schedule: AmortizationRow[];
  requiredRatio: number;
}

export function CoverageRatioChart({ schedule, requiredRatio }: CoverageRatioChartProps) {
  const data = schedule.map((row) => ({
    year: row.year,
    coverage: Math.min(row.coverageRatio, 5), // Cap at 5x for display
    actualCoverage: row.coverageRatio,
    inCapPeriod: row.inCapPeriod,
    bondsRetired: row.bondsRetired,
  }));

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            domain={[0, 5]}
            tickFormatter={(value) => `${value.toFixed(1)}x`}
          />
          <Tooltip
            formatter={(value: number, name: string, props: { payload: { actualCoverage: number } }) => {
              const actual = props.payload.actualCoverage;
              return [formatRatio(actual), 'Coverage Ratio'];
            }}
            labelFormatter={(label) => `Year ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '12px',
            }}
          />
          <Legend
            payload={[
              { value: 'Cap Period', type: 'square', color: PERIOD_COLORS.cap },
              { value: 'Amortization', type: 'square', color: PERIOD_COLORS.amort },
              { value: 'Paid Off', type: 'square', color: PERIOD_COLORS.paid },
            ]}
            wrapperStyle={{ fontSize: '11px' }}
          />

          {/* Coverage ratio bars */}
          <Bar dataKey="coverage" name="Coverage" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getPeriodColor(entry.inCapPeriod, entry.bondsRetired)}
                fillOpacity={0.8}
              />
            ))}
          </Bar>

          {/* Required coverage line */}
          <ReferenceLine
            y={requiredRatio}
            stroke="#f97316"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: `Required (${requiredRatio}x)`,
              position: 'right',
              fontSize: 10,
              fill: '#f97316',
            }}
          />

          {/* 1.0x baseline */}
          <ReferenceLine
            y={1}
            stroke="#6b7280"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
