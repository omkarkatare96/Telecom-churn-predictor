type LineChartProps = {
  data: { label: string; value: number }[];
};

export function LineChart({ data }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value), 1);
  const width = 800;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const xStep = chartWidth / (data.length - 1 || 1);
  const yScale = chartHeight / maxValue;

  const points = data.map((item, index) => ({
    x: padding + index * xStep,
    y: height - padding - item.value * yScale,
    value: item.value,
  }));

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaData = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[600px]">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <path
          d={areaData}
          fill="url(#lineGradient)"
          className="transition-all duration-300"
        />

        <path
          d={pathData}
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="white"
              stroke="rgb(59, 130, 246)"
              strokeWidth="3"
              className="transition-all duration-300 hover:r-7 cursor-pointer dark:fill-slate-800"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="15"
              fill="transparent"
              className="cursor-pointer"
            >
              <title>{`${data[index].label}: ${point.value}%`}</title>
            </circle>
          </g>
        ))}

        {data.map((item, index) => (
          <text
            key={index}
            x={padding + index * xStep}
            y={height - padding + 25}
            textAnchor="middle"
            className="text-xs fill-slate-600 dark:fill-slate-400"
          >
            {item.label}
          </text>
        ))}

        {points.map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={point.y - 15}
            textAnchor="middle"
            className="text-xs font-semibold fill-blue-600 dark:fill-blue-400"
          >
            {point.value}%
          </text>
        ))}
      </svg>
    </div>
  );
}
