import { useState } from 'react';
import { Brain, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { apiService, PredictionRequest } from '../lib/api';

type PredictionResult = {
  churnProbability: number;
  loyaltyScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
};

export function PredictPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    telecom_partner: 'Reliance Jio',
    gender: 'F',
    age: 35,
    state: 'Karnataka',
    city: 'Bangalore',
    pincode: 560001,
    date_of_registration: '1/1/2020',
    num_dependents: 2,
    estimated_salary: 75000,
    calls_made: 50,
    sms_sent: 30,
    data_used: 5000,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'age' || name === 'pincode' || name === 'num_dependents' || 
              name === 'estimated_salary' || name === 'calls_made' || name === 'sms_sent' || 
              name === 'data_used' ? Number(value) : value 
    }));
  };

  const makePrediction = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await apiService.predictChurn(formData as PredictionRequest);
      
      const churnProbability = response.churn_probability;
      const loyaltyScore = Math.round((1 - churnProbability) * 100);
      const riskLevel = churnProbability > 0.6 ? 'high' : churnProbability > 0.3 ? 'medium' : 'low';

      const suggestions: string[] = [];
      if (churnProbability > 0.6) {
        suggestions.push('Offer a loyalty discount or special promotion');
        suggestions.push('Contact customer to discuss service satisfaction');
        suggestions.push('Upgrade to a longer-term contract with benefits');
      } else if (churnProbability > 0.3) {
        suggestions.push('Send personalized retention offers');
        suggestions.push('Improve service quality and customer support');
      } else {
        suggestions.push('Customer is satisfied - maintain service quality');
        suggestions.push('Consider upselling additional services');
      }

      if (formData.estimated_salary > 80000) {
        suggestions.push('Review pricing plan for potential savings');
      }
      if (formData.num_dependents > 0) {
        suggestions.push('Provide family plan benefits');
      }

      const predictionResult = {
        churnProbability,
        loyaltyScore,
        riskLevel,
        suggestions: suggestions.slice(0, 4),
      };

      setResult(predictionResult);
    } catch (err: any) {
      console.error('Prediction error:', err);
      setError(err.response?.data?.error || 'Failed to make prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    if (level === 'low') return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (level === 'medium') return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">AI Churn Prediction</h2>
        <p className="text-slate-600 dark:text-slate-400">Enter customer details to predict churn probability</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            Customer Information
          </h3>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Telecom Partner
                </label>
                <select
                  name="telecom_partner"
                  value={formData.telecom_partner}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option>Reliance Jio</option>
                  <option>Airtel</option>
                  <option>Vodafone</option>
                  <option>BSNL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option>M</option>
                  <option>F</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="18"
                  max="100"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pincode
                </label>
                <input
                  type="number"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  min="100000"
                  max="999999"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date of Registration
                </label>
                <input
                  type="text"
                  name="date_of_registration"
                  value={formData.date_of_registration}
                  onChange={handleInputChange}
                  placeholder="MM/DD/YYYY"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Number of Dependents
                </label>
                <input
                  type="number"
                  name="num_dependents"
                  value={formData.num_dependents}
                  onChange={handleInputChange}
                  min="0"
                  max="10"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Salary
                </label>
                <input
                  type="number"
                  name="estimated_salary"
                  value={formData.estimated_salary}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Calls Made
                </label>
                <input
                  type="number"
                  name="calls_made"
                  value={formData.calls_made}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  SMS Sent
                </label>
                <input
                  type="number"
                  name="sms_sent"
                  value={formData.sms_sent}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Data Used (MB)
                </label>
                <input
                  type="number"
                  name="data_used"
                  value={formData.data_used}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={makePrediction}
            disabled={loading}
            className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Predict Churn
              </>
            )}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Prediction Results</h3>

          {!result ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <Brain className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">Enter customer details and click predict</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold mb-4 ${getRiskColor(result.riskLevel)}`}>
                  {result.riskLevel === 'low' ? (
                    <TrendingDown className="w-5 h-5" />
                  ) : (
                    <TrendingUp className="w-5 h-5" />
                  )}
                  {result.riskLevel.toUpperCase()} RISK
                </div>

                <div className="mb-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Churn Probability</p>
                  <p className="text-5xl font-bold text-slate-900 dark:text-white">
                    {(result.churnProbability * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="relative w-full h-8 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
                      result.riskLevel === 'low'
                        ? 'bg-gradient-to-r from-green-500 to-green-400'
                        : result.riskLevel === 'medium'
                        ? 'bg-gradient-to-r from-orange-500 to-orange-400'
                        : 'bg-gradient-to-r from-red-500 to-red-400'
                    }`}
                    style={{ width: `${result.churnProbability * 100}%` }}
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 mb-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Customer Loyalty Score</p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                      {result.loyaltyScore}
                    </div>
                    <div className="text-2xl text-slate-400 dark:text-slate-500">/100</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  Retention Suggestions
                </h4>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold mt-0.5">
                        {index + 1}
                      </span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
