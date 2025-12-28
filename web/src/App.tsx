import { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/layout/Header';
import { ParameterPanel } from './components/ParameterPanel';
import { MetricsSummary } from './components/MetricsSummary';
import { RevenueStackChart } from './components/charts/RevenueStackChart';
import { FundingPieChart } from './components/charts/FundingPieChart';
import { RevenueVsDebtChart } from './components/charts/RevenueVsDebtChart';
import { PrincipalBalanceChart } from './components/charts/PrincipalBalanceChart';
import { CoverageRatioChart } from './components/charts/CoverageRatioChart';
import { AmortizationTable } from './components/AmortizationTable';
import { SensitivityView } from './components/SensitivityView';
import { InsightsCard } from './components/InsightsCard';
import { InfoModal } from './components/InfoModal';
import { WelcomeModal } from './components/WelcomeModal';
import { FeedbackModal } from './components/FeedbackModal';
import { Card } from './components/ui/Card';
import { CardSkeleton, MetricsSkeleton, TableSkeleton } from './components/ui/Skeleton';
import { useSimulation, useDefaults } from './hooks/useSimulation';
import { useDebounce } from './hooks/useDebounce';
import { parseUrlParamsOnMount, useUrlParams } from './hooks/useUrlParams';
import type { BondParams, LocalAddInsConfig, SimulateRequest, StreamOverrides } from './types';
import { DEFAULT_BOND_PARAMS, DEFAULT_LOCAL_ADD_INS } from './types';

// Parse URL params once at module load to get initial state
const initialUrlParams = parseUrlParamsOnMount();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

type ViewTab = 'dashboard' | 'sensitivity';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(() => {
    // Show welcome modal if user hasn't seen it before
    return !localStorage.getItem('welcomeDismissed');
  });
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [bondParams, setBondParams] = useState<BondParams>(initialUrlParams.bondParams);
  const [localAddIns, setLocalAddIns] = useState<LocalAddInsConfig>(initialUrlParams.localAddIns);
  const [paydownPct, setPaydownPct] = useState(initialUrlParams.paydownPct);
  const [streamOverrides, setStreamOverrides] = useState<StreamOverrides>(initialUrlParams.streamOverrides);
  const [privateInvestment, setPrivateInvestment] = useState(1_600_000_000); // $1.6B default

  // URL parameter synchronization
  const shareableParams = useMemo(() => ({
    bondParams,
    localAddIns,
    paydownPct,
    streamOverrides,
  }), [bondParams, localAddIns, paydownPct, streamOverrides]);

  const { copyShareUrl } = useUrlParams(shareableParams);

  // Reset all parameters to defaults
  const handleReset = () => {
    setBondParams(DEFAULT_BOND_PARAMS);
    setLocalAddIns(DEFAULT_LOCAL_ADD_INS);
    setPaydownPct(0);
    setStreamOverrides({});
  };

  // Dismiss welcome modal and remember preference
  const handleWelcomeClose = () => {
    setWelcomeOpen(false);
    localStorage.setItem('welcomeDismissed', 'true');
  };

  // Load defaults from API
  useDefaults();

  // Build request object
  const request: SimulateRequest = useMemo(
    () => ({
      bond: bondParams,
      localAddIns,
      excessPaydownPct: paydownPct,
      streamOverrides,
    }),
    [bondParams, localAddIns, paydownPct, streamOverrides]
  );

  // Debounce the request to avoid excessive API calls
  const debouncedRequest = useDebounce(request, 300);

  // Fetch simulation results
  const { data: response, isLoading, error } = useSimulation(debouncedRequest, true);

  const result = response?.data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} onInfoClick={() => setInfoOpen(true)} onFeedbackClick={() => setFeedbackOpen(true)} onShareClick={copyShareUrl} />

      {/* Welcome Modal */}
      <WelcomeModal isOpen={welcomeOpen} onClose={handleWelcomeClose} />

      {/* Info Modal */}
      <InfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} />

      {/* Feedback Modal */}
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      <div className="flex flex-1 overflow-hidden">
        <ParameterPanel
          bondParams={bondParams}
          localAddIns={localAddIns}
          paydownPct={paydownPct}
          streamOverrides={streamOverrides}
          privateInvestment={privateInvestment}
          onBondParamsChange={setBondParams}
          onLocalAddInsChange={setLocalAddIns}
          onPaydownPctChange={setPaydownPct}
          onStreamOverridesChange={setStreamOverrides}
          onPrivateInvestmentChange={setPrivateInvestment}
          onReset={handleReset}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Tab Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex gap-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`
                  pb-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === 'dashboard'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('sensitivity')}
                className={`
                  pb-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === 'sensitivity'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Sensitivity Analysis
              </button>
            </nav>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              Error loading simulation: {error.message}
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {isLoading && !result && (
                <div className="space-y-6">
                  <MetricsSkeleton />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                  </div>
                  <TableSkeleton />
                </div>
              )}

              {result && (
                <div className="space-y-6">
                  {/* Metrics Summary */}
                  <MetricsSummary summary={result.summary} />

                  {/* Analysis Insights - Full Width */}
                  <InsightsCard onFeedbackClick={() => setFeedbackOpen(true)} />

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card title="Revenue by Source">
                      <RevenueStackChart schedule={result.schedule} />
                    </Card>

                    <Card title="Public vs Private Investment">
                      <FundingPieChart
                        publicPrincipal={result.summary.initialPrincipal}
                        publicInterest={result.summary.totalInterest}
                        privateInvestment={privateInvestment}
                      />
                    </Card>

                    <Card title="Revenue vs Debt Service">
                      <RevenueVsDebtChart
                        schedule={result.schedule}
                        annualDebtService={result.summary.annualDebtService}
                        coverageRatio={result.summary.coverageRatio}
                        capYears={result.summary.capitalizationYears}
                        payoffYear={result.summary.payoffYear}
                      />
                    </Card>

                    <Card title="Principal Balance">
                      <PrincipalBalanceChart
                        schedule={result.schedule}
                        initialPrincipal={result.summary.initialPrincipal}
                        payoffYear={result.summary.payoffYear}
                      />
                    </Card>

                    <Card title="Coverage Ratio">
                      <CoverageRatioChart
                        schedule={result.schedule}
                        requiredRatio={result.summary.coverageRatio}
                      />
                    </Card>
                  </div>

                  {/* Amortization Table */}
                  <Card title="Amortization Schedule">
                    <AmortizationTable
                      schedule={result.schedule}
                      payoffYear={result.summary.payoffYear}
                      summary={result.summary}
                      bondParams={bondParams}
                      localAddIns={localAddIns}
                      streamOverrides={streamOverrides}
                      paydownPct={paydownPct}
                    />
                  </Card>
                </div>
              )}
            </>
          )}

          {/* Sensitivity Tab */}
          {activeTab === 'sensitivity' && (
            <SensitivityView
              bondParams={bondParams}
              localAddIns={localAddIns}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
