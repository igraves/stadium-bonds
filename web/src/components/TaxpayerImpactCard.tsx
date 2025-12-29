import { Card } from './ui/Card';
import { formatCurrency } from '../utils/formatters';

interface TaxpayerImpactCardProps {
  principal: number;
  totalInterest: number;
  payoffYear: number | null;
  termYears: number;
}

export function TaxpayerImpactCard({
  principal,
  totalInterest,
  payoffYear,
  termYears,
}: TaxpayerImpactCardProps) {
  const totalPublicInvestment = principal + totalInterest;
  const years = payoffYear ?? termYears;

  return (
    <Card title="Taxpayer Impact">
      <div className="h-64 flex items-center justify-center">
        <p className="text-xl md:text-2xl font-semibold text-gray-800 text-center px-4">
          <span className="text-red-600">{formatCurrency(totalPublicInvestment, { scale: 'B', decimals: 2 })}</span>
          {' '}taxpayer dollars diverted to stadium project over{' '}
          <span className="text-red-600">{years} years</span>
        </p>
      </div>
    </Card>
  );
}
