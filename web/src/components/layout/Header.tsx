import { Menu, Info } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onInfoClick: () => void;
}

export function Header({ onMenuClick, onInfoClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-lg font-bold text-gray-900">STAR Bond Financing Model</h1>
            <p className="text-xs text-gray-500">Kansas Stadium Project Analysis</p>
          </div>
          <button
            onClick={onInfoClick}
            className="p-1.5 rounded-full hover:bg-blue-50 text-blue-600 transition-colors"
            aria-label="View model assumptions and data sources"
            title="Model Assumptions & Data Sources"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
