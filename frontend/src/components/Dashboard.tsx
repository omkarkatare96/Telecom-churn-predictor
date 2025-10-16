import { useEffect, useState } from 'react';
import { Users, TrendingDown, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { ChartCard } from './ChartCard';
import { PieChart } from './charts/PieChart';
import { BarChart } from './charts/BarChart';
import { LineChart } from './charts/LineChart';
import { apiService } from '../lib/api';

type DashboardData = {
  totalCustomers: number;
  churnRate: number;
  avgMonthlyCharges: number;
  avgTenure: number;
  highRiskCount: number;
  churnData: { label: string; value: number; color: string }[];
  tenureData: { label: string; churned: number; stayed: number }[];
  chargesData: { label: string; value: number }[];
};

export function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    totalCustomers: 0,
    churnRate: 0,
    avgMonthlyCharges: 0,
    avgTenure: 0,
    highRiskCount: 0,
    churnData: [],
    tenureData: [],
    chargesData: [],
  });
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Check API health first
      const healthResponse = await apiService.healthCheck();
      setApiStatus('connected');
      
      // For now, use mock data since we don't have a database
      // In a real implementation, you would fetch this from your backend API
      const mockData: DashboardData = {
        totalCustomers: 1250,
        churnRate: 18.5,
        avgMonthlyCharges: 65.50,
        avgTenure: 24.3,
        highRiskCount: 45,
        churnData: [
          { label: 'Active', value: 1018, color: 'rgb(34, 197, 94)' },
          { label: 'Churned', value: 232, color: 'rgb(239, 68, 68)' },
        ],
        tenureData: [
          { label: '0-12', churned: 45, stayed: 120 },
          { label: '13-24', churned: 38, stayed: 180 },
          { label: '25-36', churned: 25, stayed: 220 },
          { label: '37-48', churned: 15, stayed: 280 },
          { label: '49+', churned: 8, stayed: 350 },
        ],
        chargesData: [
          { label: '$0-30', value: 5.2 },
          { label: '$31-60', value: 12.8 },
          { label: '$61-90', value: 28.5 },
          { label: '$91+', value: 45.2 },
        ],
      };

      setData(mockData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setApiStatus('disconnected');
      
      // Set default data when API is not available
      setData({
        totalCustomers: 0,
        churnRate: 0,
        avgMonthlyCharges: 0,
        avgTenure: 0,
        highRiskCount: 0,
        churnData: [],
        tenureData: [],
        chargesData: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Dashboard Overview</h2>
          <p className="text-slate-600 dark:text-slate-400">Real-time customer analytics and churn insights</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          apiStatus === 'connected' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : apiStatus === 'disconnected'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        }`}>
          {apiStatus === 'connected' ? 'API Connected' : apiStatus === 'disconnected' ? 'API Disconnected' : 'Checking...'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Total Customers"
          value={data.totalCustomers.toLocaleString()}
          icon={Users}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <MetricCard
          title="Churn Rate"
          value={`${data.churnRate}%`}
          trend="down"
          change={data.churnRate < 20 ? 'Low risk' : 'High risk'}
          icon={TrendingDown}
          gradient="bg-gradient-to-br from-red-500 to-red-600"
        />
        <MetricCard
          title="Avg Monthly Charge"
          value={`$${data.avgMonthlyCharges}`}
          icon={DollarSign}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
        />
        <MetricCard
          title="Avg Tenure"
          value={`${data.avgTenure} mo`}
          icon={Clock}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <MetricCard
          title="High Risk"
          value={data.highRiskCount}
          trend="neutral"
          change="Needs attention"
          icon={AlertTriangle}
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Churn Distribution">
          <PieChart data={data.churnData} />
        </ChartCard>

        <ChartCard title="Tenure vs Churn" className="lg:col-span-2">
          <BarChart data={data.tenureData} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Monthly Charges vs Churn Rate">
          <LineChart data={data.chargesData} />
        </ChartCard>
      </div>
    </div>
  );
}
