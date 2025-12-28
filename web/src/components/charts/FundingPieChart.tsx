import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters';

interface FundingPieChartProps {
  publicPrincipal: number;
  publicInterest: number;
  privateInvestment: number;
}

const COLORS = {
  principal: '#3b82f6', // Blue
  interest: '#93c5fd', // Light blue
  private: '#22c55e', // Green
};

export function FundingPieChart({ publicPrincipal, publicInterest, privateInvestment }: FundingPieChartProps) {
  const totalPublic = publicPrincipal + publicInterest;
  const total = totalPublic + privateInvestment;

  const data = [
    { name: 'Public Principal', value: publicPrincipal, color: COLORS.principal },
    { name: 'Public Interest', value: publicInterest, color: COLORS.interest },
    { name: 'Private Investment', value: privateInvestment, color: COLORS.private },
  ];

  const publicPct = ((totalPublic / total) * 100).toFixed(1);
  const privatePct = ((privateInvestment / total) * 100).toFixed(1);

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: unknown) => formatCurrency(value as number)}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary below chart */}
      <div className="mt-2 grid grid-cols-2 gap-4 text-center text-sm">
        <div>
          <div className="text-gray-500">Public Spend</div>
          <div className="font-semibold text-blue-600">
            {formatCurrency(totalPublic)} ({publicPct}%)
          </div>
        </div>
        <div>
          <div className="text-gray-500">Private Investment</div>
          <div className="font-semibold text-green-600">
            {formatCurrency(privateInvestment)} ({privatePct}%)
          </div>
        </div>
      </div>
    </div>
  );
}
