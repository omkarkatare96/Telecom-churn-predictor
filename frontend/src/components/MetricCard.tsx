import { LucideIcon } from 'lucide-react';

type MetricCardProps = {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  gradient: string;
  trend?: 'up' | 'down' | 'neutral';
};

export function MetricCard({ title, value, change, icon: Icon, gradient, trend }: MetricCardProps) {
  const getTrendColor = () => {
    if (!trend) return '';
    if (trend === 'up') return 'text-green-600 dark:text-green-400';
    if (trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700">
      <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`}></div>

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</p>
          {change && (
            <p className={`text-sm font-medium ${getTrendColor()}`}>
              {change}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-xl ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
