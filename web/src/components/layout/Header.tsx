import { useState } from 'react';
import { Settings, Info, Share2, Check, MessageSquare, BookOpen } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onInfoClick: () => void;
  onFeedbackClick: () => void;
  onGlossaryClick: () => void;
  onShareClick?: () => Promise<boolean>;
}

export function Header({ onMenuClick, onInfoClick, onFeedbackClick, onGlossaryClick, onShareClick }: HeaderProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleShare = async () => {
    if (!onShareClick) return;
    const success = await onShareClick();
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          aria-label="Open settings"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-lg font-bold text-gray-900">STAR Bond Financing Model</h1>
            <p className="text-xs text-gray-500">Kansas Stadium Project Analysis</p>
          </div>
          <button
            onClick={onInfoClick}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors border border-blue-200"
            aria-label="View model assumptions and data sources"
            title="Model Assumptions & Data Sources"
          >
            <Info className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">Assumptions</span>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onGlossaryClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
          aria-label="View glossary of terms"
          title="Glossary of Terms"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Glossary</span>
        </button>
        <button
          onClick={onFeedbackClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700"
          aria-label="Send feedback"
          title="Send feedback"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Feedback</span>
        </button>
        {onShareClick && (
          <button
            onClick={handleShare}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
              ${copySuccess
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
            aria-label="Share simulation settings"
            title="Copy shareable link to clipboard"
          >
            {copySuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
