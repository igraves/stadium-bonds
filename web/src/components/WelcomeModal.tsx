import { X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
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
        className="fixed inset-4 md:inset-y-10 md:inset-x-20 lg:inset-y-16 lg:inset-x-40 xl:inset-y-20 xl:inset-x-60 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden"
        style={{ zIndex: 101 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-blue-600">
          <h2 className="text-xl font-bold text-white">Welcome to the Chiefs STAR Bond Analysis Tool</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-500 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* About Section */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Tool</h3>
              <p className="text-gray-600 leading-relaxed">
                This interactive analysis tool was created by <strong>Ian Graves</strong> after reviewing
                the executed STAR bond agreement terms and researching the initial sales tax revenue bases
                for the proposed bond district. The model calculates projected bond draws, debt service
                requirements, and payoff timelines based on these inputs.
              </p>
            </section>

            {/* Purpose Section */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Purpose</h3>
              <p className="text-gray-600 leading-relaxed">
                This is a <strong>work in progress</strong> designed to help myself and others better
                understand the STAR bond financing structure, its various components, and the potential
                cost implications for Johnson County and Wyandotte County residents. The goal is to make
                complex municipal finance concepts more accessible and explorable.
              </p>
            </section>

            {/* What's Modeled Section */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Modeled</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Revenue streams pledged to the STAR bonds (state sales tax, use tax, liquor taxes, sports wagering)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Capitalized interest during the ramp-up period</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Debt service schedules and coverage ratios</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Accelerated paydown scenarios and interest savings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Public vs. private investment breakdown</span>
                </li>
              </ul>
            </section>

            {/* Disclaimer Section */}
            <section className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Important Disclaimer</h3>
              <p className="text-amber-700 text-sm leading-relaxed">
                The results presented here are <strong>estimates</strong> intended to provide a sense of
                the right <strong>order of magnitude</strong> for taxpayers. They are not guaranteed to
                be accurate and should not be used for financial or investment decisions. Actual outcomes
                will depend on economic conditions, policy changes, and many other factors not captured
                in this simplified model. For official information, please consult the Kansas Department
                of Commerce and relevant government sources.
              </p>
            </section>

            {/* Learn More */}
            <section className="text-center pt-2">
              <p className="text-sm text-gray-500">
                Click the <strong>ⓘ</strong> icon in the header to view detailed model assumptions and data sources.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </>
  );
}
