import { Card } from './ui/Card';

interface InsightsCardProps {
  onFeedbackClick: () => void;
}

export function InsightsCard({ onFeedbackClick }: InsightsCardProps) {
  return (
    <Card title="Welcome">
      <div className="prose prose-sm max-w-none text-gray-700">
        <p>
          Welcome to the KS STAR Bond Financing Model for the proposed Chiefs stadium that has been
          approved by the Chiefs, the LCC, and the Kansas Governor. The Kansas sales tax rates will
          not be impacted by this proposal, but this tool is to help us understand the actual costs
          to the Kansas taxpayer over the life of bonds related to the project. This tool is a work
          in progress. If you have feedback please{' '}
          <button
            onClick={onFeedbackClick}
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            submit it here
          </button>.
        </p>
      </div>
    </Card>
  );
}
