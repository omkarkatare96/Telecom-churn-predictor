type BarChartProps = {
  data: { label: string; churned: number; stayed: number }[];
};

export function BarChart({ data }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.churned + item.stayed));
  const scale = maxValue > 0 ? 200 / maxValue : 0;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2 h-64 px-4">
        {data.map((item, index) => {
          const churnedHeight = item.churned * scale;
          const stayedHeight = item.stayed * scale;
          const total = item.churned + item.stayed;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center gap-1 relative group">
                <div
                  className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg transition-all duration-300 hover:opacity-80 relative"
                  style={{ height: `${churnedHeight}px` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Churned: {item.churned}
                  </div>
                </div>
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 transition-all duration-300 hover:opacity-80 relative"
                  style={{ height: `${stayedHeight}px` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Stayed: {item.stayed}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{total}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-6 justify-center mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Churned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Stayed</span>
        </div>
      </div>
    </div>
  );
}
