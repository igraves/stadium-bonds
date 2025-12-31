import { useState } from 'react';
import { X, Search } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GlossaryTerm {
  term: string;
  definition: string;
  category: 'bond' | 'tax' | 'revenue' | 'model';
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  // Bond Terms
  {
    term: 'STAR Bond',
    definition: 'Sales Tax and Revenue Bond - a type of municipal bond issued in Kansas where sales tax revenues generated within a designated district are pledged to repay the bonds. Used to finance major tourism and entertainment projects.',
    category: 'bond',
  },
  {
    term: 'Principal',
    definition: 'The original amount borrowed through the bond issuance, excluding interest. This is the base amount that must be repaid to bondholders.',
    category: 'bond',
  },
  {
    term: 'Capitalized Interest',
    definition: 'Interest that accrues during a period when revenues are insufficient to cover debt payments. Instead of being paid, this interest is added to the principal balance, increasing the total debt.',
    category: 'bond',
  },
  {
    term: 'Coverage Ratio',
    definition: 'The ratio of available revenue to required debt service payments. A 1.30x ratio means revenues must be 30% higher than debt service. Higher ratios provide more security for bondholders.',
    category: 'bond',
  },
  {
    term: 'Debt Service',
    definition: 'The total annual payment required on a bond, including both principal repayment and interest. Calculated to fully pay off the bond over its term.',
    category: 'bond',
  },
  {
    term: 'Amortization',
    definition: 'The process of paying off debt through regular payments over time. Each payment includes both interest and a portion of principal.',
    category: 'bond',
  },
  {
    term: 'Excess Paydown',
    definition: 'Revenue beyond required debt service that is applied to principal reduction. Higher paydown percentages accelerate bond retirement and reduce total interest paid.',
    category: 'bond',
  },
  {
    term: 'Bond Term',
    definition: 'The total number of years over which the bond will be repaid. STAR bonds typically have 20-30 year terms.',
    category: 'bond',
  },

  // Tax Terms
  {
    term: 'Sales Tax Increment',
    definition: 'The growth in sales tax revenue over time above a base year amount. In STAR financing, this growth is captured and pledged to bond repayment.',
    category: 'tax',
  },
  {
    term: 'Use Tax',
    definition: 'A tax on goods purchased outside Kansas but used within the state. Collected at the same rate as sales tax and eligible for capture under STAR bond statutes.',
    category: 'tax',
  },
  {
    term: 'Liquor Enforcement Tax (LET)',
    definition: 'An 8% state tax on retail liquor sales in Kansas. A portion of collections within the STAR district can be pledged to bond repayment.',
    category: 'tax',
  },
  {
    term: 'Liquor Excise Tax',
    definition: 'A 10% state tax on drinks sold by the drink at licensed establishments. Also known as the "drink tax."',
    category: 'tax',
  },

  // Revenue Terms
  {
    term: 'APSK Fund',
    definition: 'Attracting Professional Sports to Kansas Fund - receives 80% of state sports wagering revenue (10% privilege fee). 65% of APSK is pledged to STAR bond debt service.',
    category: 'revenue',
  },
  {
    term: 'Sports Wagering Revenue',
    definition: 'State receipts from licensed sports betting operators. Kansas legalized sports wagering in September 2022.',
    category: 'revenue',
  },
  {
    term: 'RMMO Fund',
    definition: 'Repairs, Maintenance, Management, and Operations Fund - receives 10% of Sports Fund allocation. Used for stadium upkeep costs exceeding the team\'s threshold.',
    category: 'revenue',
  },
  {
    term: 'Local Add-Ins',
    definition: 'Optional additional revenue streams from local governments (city/county sales taxes) that could hypothetically be pledged to support bond coverage.',
    category: 'revenue',
  },

  // Model Terms
  {
    term: 'CAGR',
    definition: 'Compound Annual Growth Rate - the average annual growth rate over a period of time, accounting for compounding. Used to project future revenue based on historical trends.',
    category: 'model',
  },
  {
    term: 'CPI',
    definition: 'Consumer Price Index - a measure of inflation used to project revenue growth. Model defaults use conservative 2-2.5% growth assumptions.',
    category: 'model',
  },
  {
    term: 'Base Year',
    definition: 'The reference year from which tax increment growth is measured. Revenues in excess of the base year amount are captured for bond repayment.',
    category: 'model',
  },
  {
    term: 'Payoff Year',
    definition: 'The projected year when the bond principal will be fully repaid. Can be earlier than the bond term if excess paydown is applied.',
    category: 'model',
  },
  {
    term: 'Capitalization Period',
    definition: 'The number of years at the start of the bond when revenues are insufficient to cover debt service, requiring interest to be capitalized.',
    category: 'model',
  },
];

const CATEGORY_LABELS: Record<GlossaryTerm['category'], string> = {
  bond: 'Bond Structure',
  tax: 'Tax Revenue',
  revenue: 'Revenue Streams',
  model: 'Model Concepts',
};

export function GlossaryModal({ isOpen, onClose }: GlossaryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GlossaryTerm['category'] | 'all'>('all');

  if (!isOpen) return null;

  const filteredTerms = GLOSSARY_TERMS.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedTerms = filteredTerms.reduce((acc, term) => {
    if (!acc[term.category]) {
      acc[term.category] = [];
    }
    acc[term.category].push(term);
    return acc;
  }, {} as Record<string, GlossaryTerm[]>);

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
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Glossary of Terms</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {(Object.keys(CATEGORY_LABELS) as GlossaryTerm['category'][]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {filteredTerms.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No terms found matching "{searchQuery}"
            </p>
          ) : (
            <div className="space-y-6">
              {(Object.keys(groupedTerms) as GlossaryTerm['category'][]).map((category) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    {CATEGORY_LABELS[category]}
                  </h3>
                  <dl className="space-y-4">
                    {groupedTerms[category].map((item) => (
                      <div key={item.term} className="border-l-2 border-blue-200 pl-4">
                        <dt className="font-semibold text-gray-900">{item.term}</dt>
                        <dd className="text-sm text-gray-600 mt-1">{item.definition}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''} shown
          </p>
        </div>
      </div>
    </>
  );
}
