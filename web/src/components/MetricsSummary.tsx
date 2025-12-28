import { CheckCircle, XCircle, TrendingDown, Calendar, DollarSign, Percent } from 'lucide-react';
import type { SimulationSummary } from '../types';
import { formatCurrency, formatPercent, formatPayoffYear } from '../utils/formatters';
import { Card } from './ui/Card';

interface MetricsSummaryProps {
  summary: SimulationSummary;
}

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  highlight?: 'positive' | 'negative' | 'neutral';
}

function MetricCard({ label, value, subValue, icon, highlight = 'neutral' }: MetricCardProps) {
  const highlightColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-900',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${highlightColors[highlight]}`}>{value}</p>
          {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </div>
  );
}

export function MetricsSummary({ summary }: MetricsSummaryProps) {
  const hasEarlyPayoff = summary.payoffYear !== null && summary.payoffYear < summary.termYears;

  return (
    <div className="space-y-4">
      {/* Viability indicator */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          summary.viable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}
      >
        {summary.viable ? (
          <>
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Viable</span>
            <span className="text-sm opacity-75">
              — Coverage met in Year {summary.capitalizationYears + 1}
            </span>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5" />
            <span className="font-medium">Not Viable</span>
            <span className="text-sm opacity-75">
              — Capitalization exceeds maximum
            </span>
          </>
        )}
      </div>

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Cap Period"
          value={`${summary.capitalizationYears} yrs`}
          subValue={`${summary.amortizationYears} yrs amortization`}
          icon={<Calendar className="w-5 h-5" />}
        />

        <MetricCard
          label="Payoff Year"
          value={formatPayoffYear(summary.payoffYear, summary.termYears)}
          subValue={hasEarlyPayoff ? `${summary.yearsSaved} years early` : undefined}
          icon={<TrendingDown className="w-5 h-5" />}
          highlight={hasEarlyPayoff ? 'positive' : 'neutral'}
        />

        <MetricCard
          label="Total Interest"
          value={formatCurrency(summary.totalInterest, { scale: 'B' })}
          subValue={`${summary.interestPctOfPrincipal.toFixed(0)}% of principal`}
          icon={<DollarSign className="w-5 h-5" />}
        />

        <MetricCard
          label="Interest Savings"
          value={summary.interestSavings > 0 ? formatCurrency(summary.interestSavings, { scale: 'B' }) : '—'}
          subValue={summary.interestSavings > 0 ? 'vs. no acceleration' : 'No acceleration'}
          icon={<Percent className="w-5 h-5" />}
          highlight={summary.interestSavings > 0 ? 'positive' : 'neutral'}
        />
      </div>

      {/* Secondary metrics */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Annual Debt Service</span>
            <p className="font-semibold">{formatCurrency(summary.annualDebtService)}</p>
          </div>
          <div>
            <span className="text-gray-500">Principal After Cap</span>
            <p className="font-semibold">{formatCurrency(summary.principalAfterCap, { scale: 'B' })}</p>
          </div>
          <div>
            <span className="text-gray-500">30-Year Revenue</span>
            <p className="font-semibold">{formatCurrency(summary.totalRevenue30yr, { scale: 'B' })}</p>
          </div>
          <div>
            <span className="text-gray-500">Extra Principal Paid</span>
            <p className="font-semibold">
              {summary.totalExtraPrincipal > 0
                ? formatCurrency(summary.totalExtraPrincipal, { scale: 'B' })
                : '—'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
