type PieChartProps = {
  data: { label: string; value: number; color: string }[];
};

export function PieChart({ data }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">
        No data available
      </div>
    );
  }

  let currentAngle = -90;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (currentAngle * Math.PI) / 180;

    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...item,
      percentage: percentage.toFixed(1),
      path: `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <svg viewBox="0 0 200 200" className="w-full max-w-[200px] h-auto">
        {segments.map((segment, index) => (
          <g key={index} className="group">
            <path
              d={segment.path}
              fill={segment.color}
              className="transition-all duration-300 group-hover:opacity-80 cursor-pointer"
            />
          </g>
        ))}
        <circle cx="100" cy="100" r="45" fill="white" className="dark:fill-slate-800" />
        <text
          x="100"
          y="95"
          textAnchor="middle"
          className="text-2xl font-bold fill-slate-900 dark:fill-white"
        >
          {total}
        </text>
        <text
          x="100"
          y="110"
          textAnchor="middle"
          className="text-xs fill-slate-600 dark:fill-slate-400"
        >
          Total
        </text>
      </svg>

      <div className="flex flex-wrap gap-4 justify-center">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {segment.label}: <span className="font-semibold text-slate-900 dark:text-white">{segment.percentage}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
