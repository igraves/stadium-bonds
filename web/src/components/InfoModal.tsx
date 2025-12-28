import { useState } from 'react';
import { X, ChevronDown, ChevronRight, Download } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 text-left hover:bg-gray-50 px-1"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="pb-4 px-1">{children}</div>}
    </div>
  );
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        style={{ zIndex: 100 }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-4 md:inset-10 lg:inset-20 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden"
        style={{ zIndex: 101 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Model Assumptions & Data Sources</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <CollapsibleSection title="Bond Structure" defaultOpen={true}>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Per the executed STAR Bond Agreement (Project Monitor 2.0, December 22, 2025):</p>
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-1.5 text-gray-500">Total Stadium Budget</td>
                    <td className="py-1.5 font-medium text-gray-900">$3.0 billion</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-500">Public Share (STAR Bonds)</td>
                    <td className="py-1.5 font-medium text-gray-900">$1.8 billion (60%)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-500">Private Share (Team)</td>
                    <td className="py-1.5 font-medium text-gray-900">$1.2 billion (40%)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-500">Default Interest Rate</td>
                    <td className="py-1.5 font-medium text-gray-900">5.0% (tax-exempt municipal)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-500">Bond Term</td>
                    <td className="py-1.5 font-medium text-gray-900">30 years</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-gray-500">Default Coverage Ratio</td>
                    <td className="py-1.5 font-medium text-gray-900">1.30x</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">
                Coverage ratio is industry standard for revenue bonds. Required revenue = Debt Service × Coverage Ratio.
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Revenue Stream Base Values">
            <div className="space-y-3 text-sm text-gray-600">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="py-2 text-xs font-medium text-gray-500 uppercase">Base Amount</th>
                    <th className="py-2 text-xs font-medium text-gray-500 uppercase">Growth Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2">Sales + Use Tax (State)</td>
                    <td className="py-2 font-medium">$668M/year</td>
                    <td className="py-2">2.5%</td>
                  </tr>
                  <tr>
                    <td className="py-2 pl-4 text-gray-500">— Sales Tax</td>
                    <td className="py-2">$495M</td>
                    <td className="py-2">—</td>
                  </tr>
                  <tr>
                    <td className="py-2 pl-4 text-gray-500">— Use Tax (34.9% ratio)</td>
                    <td className="py-2">$173M</td>
                    <td className="py-2">—</td>
                  </tr>
                  <tr>
                    <td className="py-2">Liquor Enforcement Tax (LET)</td>
                    <td className="py-2 font-medium">$17.4M/year</td>
                    <td className="py-2">2.0%</td>
                  </tr>
                  <tr>
                    <td className="py-2">Liquor Excise Tax</td>
                    <td className="py-2 font-medium">$8.2M/year</td>
                    <td className="py-2">2.0%</td>
                  </tr>
                  <tr>
                    <td className="py-2">APSK (65% pledged)</td>
                    <td className="py-2 font-medium">$5.7M/year</td>
                    <td className="py-2">3.0%</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">
                Sales tax base reflects post-grocery-exemption (state rate on food = 0% as of 2025).
                APSK = Attracting Professional Sports to Kansas Fund from sports wagering.
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Historical Growth Rates (CAGR)">
            <div className="space-y-3 text-sm text-gray-600">
              <p>Compound Annual Growth Rates derived from Kansas tax collection data (2014-2025):</p>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 text-xs font-medium text-gray-500 uppercase">Tax Type</th>
                    <th className="py-2 text-xs font-medium text-gray-500 uppercase">Historical CAGR</th>
                    <th className="py-2 text-xs font-medium text-gray-500 uppercase">Model Default</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2">Johnson County Sales Tax</td>
                    <td className="py-2 font-medium">4.2%</td>
                    <td className="py-2">2.5% (conservative)</td>
                  </tr>
                  <tr>
                    <td className="py-2">Wyandotte County Sales Tax</td>
                    <td className="py-2 font-medium">3.8%</td>
                    <td className="py-2">2.5% (conservative)</td>
                  </tr>
                  <tr>
                    <td className="py-2">Kansas Statewide Sales Tax</td>
                    <td className="py-2 font-medium">3.1%</td>
                    <td className="py-2">2.5% (conservative)</td>
                  </tr>
                  <tr>
                    <td className="py-2">Liquor Enforcement Tax</td>
                    <td className="py-2 font-medium">2.4%</td>
                    <td className="py-2">2.0% (conservative)</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">
                Model defaults are set conservatively below historical rates to account for economic uncertainty.
                Adjust growth rates in the parameter panel to see different scenarios.
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Capitalized Interest Model">
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                This model uses <strong>capitalized interest</strong> during the ramp-up period when revenues
                are insufficient to cover debt service:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Interest that cannot be paid from available revenue is added to principal</li>
                <li>No principal payments during capitalization period</li>
                <li>Capitalization ends when revenues can cover full debt service at the coverage ratio</li>
                <li>Maximum capitalization period is configurable (default: 15 years)</li>
              </ul>
              <p className="mt-2">
                <strong>After capitalization:</strong> Level annual debt service is calculated on the
                inflated principal over the remaining term.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This approach differs from the "immediate debt service" model where construction-period
                payments are funded from gross bond proceeds.
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Accelerated Paydown">
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                When <strong>Excess Paydown %</strong> is set above 0%, revenues exceeding debt service
                are applied to principal reduction:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Excess Revenue = Available Revenue − Required Debt Service</li>
                <li>Extra Principal = Excess Revenue × Paydown Percentage</li>
                <li>Higher paydown percentages result in earlier bond retirement and lower total interest</li>
                <li>100% paydown = all excess revenue goes to principal reduction</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                Use the Sensitivity Analysis tab to compare different paydown scenarios.
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Local Add-Ins (Optional Revenue)">
            <div className="space-y-3 text-sm text-gray-600">
              <p>Optional additional revenue streams that may be pledged to the bond:</p>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="py-2 text-xs font-medium text-gray-500 uppercase">Base Amount</th>
                    <th className="py-2 text-xs font-medium text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2">Olathe Local Sales Tax</td>
                    <td className="py-2 font-medium">$65.9M/year</td>
                    <td className="py-2 text-gray-500">City of Olathe local sales tax collections</td>
                  </tr>
                  <tr>
                    <td className="py-2">Wyandotte UG Sales Tax</td>
                    <td className="py-2 font-medium">$107.1M/year</td>
                    <td className="py-2 text-gray-500">Wyandotte County Unified Government collections</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-2">
                These represent actual local tax collection bases that could hypothetically be pledged to support bond coverage.
                Toggle them in the parameter panel to see their impact on bond viability.
              </p>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Data Sources">
            <div className="space-y-3 text-sm text-gray-600">
              <p className="text-xs text-gray-500 mb-2">Click on any document to download:</p>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 text-xs font-medium text-gray-500 uppercase">Document</th>
                    <th className="py-2 text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="py-2 text-xs font-medium text-gray-500 uppercase w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-2">
                      <a
                        href="/api/data/Project-Monitor-2.0-STAR-Bond-Agreement-Execution-Version.pdf"
                        download
                        className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Project-Monitor-2.0-STAR-Bond-Agreement.pdf
                      </a>
                    </td>
                    <td className="py-2">Official STAR Bond Agreement (Dec 22, 2025)</td>
                    <td className="py-2">
                      <a
                        href="/api/data/Project-Monitor-2.0-STAR-Bond-Agreement-Execution-Version.pdf"
                        download
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <a
                        href="/api/data/liqenffy25.pdf"
                        download
                        className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        liqenffy25.pdf
                      </a>
                    </td>
                    <td className="py-2">Kansas Liquor Enforcement Tax FY25 by county</td>
                    <td className="py-2">
                      <a
                        href="/api/data/liqenffy25.pdf"
                        download
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <a
                        href="/api/data/450-Kansas-Lottery-FY-2026.pdf"
                        download
                        className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        450-Kansas-Lottery-FY-2026.pdf
                      </a>
                    </td>
                    <td className="py-2">Kansas Lottery FY25-26 Budget Report</td>
                    <td className="py-2">
                      <a
                        href="/api/data/450-Kansas-Lottery-FY-2026.pdf"
                        download
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <a
                        href="/api/data/pub17000126.xlsx"
                        download
                        className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        pub17000126.xlsx
                      </a>
                    </td>
                    <td className="py-2">KDOR Pub 1700 - Sales Tax Rates (Jan 2026)</td>
                    <td className="py-2">
                      <a
                        href="/api/data/pub17000126.xlsx"
                        download
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <a
                        href="/api/data/CY25LocUseTaxDist.xlsx"
                        download
                        className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        CY25LocUseTaxDist.xlsx
                      </a>
                    </td>
                    <td className="py-2">KDOR CY2025 Local Use Tax Distributions</td>
                    <td className="py-2">
                      <a
                        href="/api/data/CY25LocUseTaxDist.xlsx"
                        download
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2">
                      <a
                        href="/api/data/johnson_wyandotte_tax_consolidated.xlsx"
                        download
                        className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        johnson_wyandotte_tax_consolidated.xlsx
                      </a>
                    </td>
                    <td className="py-2">Johnson County / Wyandotte County sales tax data</td>
                    <td className="py-2">
                      <a
                        href="/api/data/johnson_wyandotte_tax_consolidated.xlsx"
                        download
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Key Caveats">
            <div className="space-y-2 text-sm text-gray-600">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Projections are estimates</strong> — actual revenues depend on economic conditions, consumer behavior, and policy changes.</li>
                <li><strong>Grocery exemption assumed permanent</strong> — if grocery tax is reinstated, sales tax base would increase.</li>
                <li><strong>Use tax ratio may vary</strong> — 34.9% ratio is based on current local data; state-level ratio may differ.</li>
                <li><strong>Sports wagering is volatile</strong> — market is young (since 2022); growth rates are uncertain.</li>
                <li><strong>No recession modeling</strong> — projections assume steady growth without economic downturns.</li>
                <li><strong>District boundaries matter</strong> — actual captured revenue depends on precise STAR district geography.</li>
              </ul>
            </div>
          </CollapsibleSection>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            This model is for analytical purposes only. Consult official sources and financial advisors for investment decisions.
          </p>
        </div>
      </div>
    </>
  );
}
