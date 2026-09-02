import { useMemo } from 'react';

interface HeatmapProps<T extends object> {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  valueKey: keyof T;
  xLabels: number[];
  yLabels: number[];
  formatValue: (value: number | null) => string;
  formatXLabel: (value: number) => string;
  formatYLabel: (value: number) => string;
  colorScale: (value: number | null, viable: boolean) => string;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  onCellClick?: (cell: T) => void;
  viableKey?: keyof T;
}

export function Heatmap<T extends object>({
  data,
  xKey,
  yKey,
  valueKey,
  xLabels,
  yLabels,
  formatValue,
  formatXLabel,
  formatYLabel,
  colorScale,
  title,
  xAxisLabel,
  yAxisLabel,
  onCellClick,
  viableKey,
}: HeatmapProps<T>) {
  // Build a lookup map for fast access
  const cellMap = useMemo(() => {
    const map = new Map<string, T>();
    data.forEach((cell) => {
      const key = `${cell[xKey]}-${cell[yKey]}`;
      map.set(key, cell);
    });
    return map;
  }, [data, xKey, yKey]);

  const cellWidth = 60;
  const cellHeight = 40;
  const labelPadding = 50;

  return (
    <div className="overflow-x-auto">
      {title && (
        <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">{title}</h3>
      )}

      <div className="inline-block">
        {/* Y-axis label */}
        {yAxisLabel && (
          <div
            className="text-xs text-gray-500 mb-2 text-center"
            style={{ marginLeft: labelPadding }}
          >
            ↓ {yAxisLabel}
          </div>
        )}

        <div className="flex">
          {/* Y-axis labels */}
          <div className="flex flex-col" style={{ width: labelPadding }}>
            <div style={{ height: cellHeight }} /> {/* Spacer for X labels */}
            {yLabels.map((y) => (
              <div
                key={y}
                className="flex items-center justify-end pr-2 text-xs text-gray-600"
                style={{ height: cellHeight }}
              >
                {formatYLabel(y)}
              </div>
            ))}
          </div>

          <div>
            {/* X-axis labels */}
            <div className="flex">
              {xLabels.map((x) => (
                <div
                  key={x}
                  className="flex items-end justify-center text-xs text-gray-600 pb-1"
                  style={{ width: cellWidth, height: cellHeight }}
                >
                  {formatXLabel(x)}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="border border-gray-200 rounded">
              {yLabels.map((y) => (
                <div key={y} className="flex">
                  {xLabels.map((x) => {
                    const cell = cellMap.get(`${x}-${y}`);
                    const value = cell ? (cell[valueKey] as number | null) : null;
                    const viable = viableKey && cell ? (cell[viableKey] as boolean) : true;
                    const bgColor = colorScale(value, viable);

                    return (
                      <div
                        key={`${x}-${y}`}
                        className={`
                          flex items-center justify-center text-xs font-medium
                          border-r border-b border-gray-100 last:border-r-0
                          ${onCellClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 hover:ring-inset' : ''}
                          ${!viable ? 'text-gray-400' : 'text-gray-800'}
                        `}
                        style={{
                          width: cellWidth,
                          height: cellHeight,
                          backgroundColor: bgColor,
                        }}
                        onClick={() => onCellClick?.(cell!)}
                        title={cell ? `Interest: ${formatXLabel(x)}, Growth: ${formatYLabel(y)}\nValue: ${formatValue(value)}` : undefined}
                      >
                        {formatValue(value)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* X-axis label */}
            {xAxisLabel && (
              <div className="text-xs text-gray-500 mt-2 text-center">
                {xAxisLabel} →
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
