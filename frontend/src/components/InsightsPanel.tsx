import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { apiService, PredictionRequest, PredictionResponse } from '../lib/api';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const predefinedInsights = [
  {
    question: 'What are the main factors causing customer churn?',
    answer:
      'Based on our data, the primary churn factors include: 1) Month-to-month contracts show 40% higher churn rates, 2) Customers with fiber optic internet without tech support are 30% more likely to churn, 3) High monthly charges above $80 correlate with increased churn, 4) Customers with tenure under 12 months have significantly higher churn risk.',
  },
  {
    question: 'How can we improve customer retention?',
    answer:
      'Key retention strategies: 1) Incentivize long-term contracts with discounts or perks, 2) Proactively offer tech support to fiber optic customers, 3) Implement tiered pricing to reduce monthly charges for loyal customers, 4) Create onboarding programs for new customers in first year, 5) Regular satisfaction surveys and proactive outreach to high-risk customers.',
  },
  {
    question: 'What is the profile of a high-risk customer?',
    answer:
      'High-risk customer profile typically includes: Month-to-month contract, tenure less than 12 months, fiber optic internet without additional services, monthly charges over $70, electronic check payment method, no tech support or online security, and paperless billing. These customers show 65%+ churn probability.',
  },
  {
    question: 'Which contract type has the lowest churn rate?',
    answer:
      'Two-year contracts have the lowest churn rate at approximately 3-5%, followed by one-year contracts at 15-20%. Month-to-month contracts show the highest churn rate at 45-50%. This demonstrates the strong correlation between contract commitment and customer retention.',
  },
];

export function InsightsPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello! I\'m your AI assistant for telecom churn insights. Ask me anything about customer churn patterns, retention strategies, or data analysis.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 1) Try to extract a structured PredictionRequest from the user's message
      const maybeRequest = await extractPredictionRequest(input.trim());

      const requiredFields: (keyof PredictionRequest)[] = [
        'telecom_partner', 'gender', 'age', 'state', 'city', 'pincode',
        'date_of_registration', 'num_dependents', 'estimated_salary',
        'calls_made', 'sms_sent', 'data_used'
      ];

      const missing = requiredFields.filter((k) =>
        maybeRequest[k] === undefined || maybeRequest[k] === null || (typeof maybeRequest[k] === 'string' && (maybeRequest[k] as unknown as string).trim() === '')
      );

      // 2) If we have a complete request, call the prediction API
      if (missing.length === 0) {
        try {
          const prediction: PredictionResponse = await apiService.predictChurn(maybeRequest as PredictionRequest);
          const content = formatPredictionMessage(prediction);

          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiResponse]);
        } catch (err: any) {
          const errorText = err?.response?.data?.error || 'Prediction failed. Please check the backend and try again.';
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: errorText,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiResponse]);
        }
      } else {
        // 3) If incomplete, provide next steps or fallback to insights
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
        if (apiKey) {
          // Offer guided clarification asking specifically for missing fields
          const clarification = `To run a prediction, I still need: ${missing.join(', ')}. Please provide them in a sentence or JSON.`;
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: clarification,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiResponse]);
        } else {
          // No Gemini available, fallback to predefined insights
          const fallback: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: generateAIResponse(input.trim()),
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, fallback]);
        }
      }
    } catch (e) {
      const fallback: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(input.trim()),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallback]);
    } finally {
      setLoading(false);
    }
  };

  const extractPredictionRequest = async (text: string): Promise<Partial<PredictionRequest>> => {
    // Heuristic quick parse for common patterns
    const quick: Partial<PredictionRequest> = {};
    const numberFrom = (label: string) => {
      const m = new RegExp(`${label}[:=]\\s*([0-9]+)`, 'i').exec(text);
      return m ? Number(m[1]) : undefined;
    };
    const stringFrom = (label: string) => {
      const m = new RegExp(`${label}[:=]\\s*([A-Za-z ]+)`, 'i').exec(text);
      return m ? m[1].trim() : undefined;
    };

    quick.age = numberFrom('age');
    quick.pincode = numberFrom('pincode');
    quick.num_dependents = numberFrom('num_dependents');
    quick.estimated_salary = numberFrom('estimated_salary');
    quick.calls_made = numberFrom('calls_made');
    quick.sms_sent = numberFrom('sms_sent');
    quick.data_used = numberFrom('data_used');
    quick.gender = stringFrom('gender');
    quick.state = stringFrom('state');
    quick.city = stringFrom('city');
    quick.telecom_partner = stringFrom('telecom_partner');
    const dateMatch = /date_of_registration[:=]\s*([0-9/\-]+)/i.exec(text);
    quick.date_of_registration = dateMatch ? dateMatch[1] : undefined;

    // If quick parse is incomplete and Gemini is available, ask Gemini to produce strict JSON
    const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const schemaInstruction = `Extract a JSON object with EXACTLY these keys for a churn prediction request:
{
  "telecom_partner": string,
  "gender": string,
  "age": number,
  "state": string,
  "city": string,
  "pincode": number,
  "date_of_registration": string,
  "num_dependents": number,
  "estimated_salary": number,
  "calls_made": number,
  "sms_sent": number,
  "data_used": number
}
Rules:
- If a value is not present in the user text, omit that key.
- Output ONLY the JSON. No commentary.`;
        const prompt = `${schemaInstruction}\n\nUser text:\n${text}`;
        const result = await model.generateContent(prompt);
        const raw = (result.response.text() || '').trim();
        const json = safeParseJson(raw);
        const merged = { ...quick, ...json } as Partial<PredictionRequest>;
        // Coerce number types if needed
        coerceTypes(merged);
        return merged;
      } catch {
        coerceTypes(quick);
        return quick;
      }
    }

    coerceTypes(quick);
    return quick;
  };

  const coerceTypes = (obj: Partial<PredictionRequest>) => {
    const toNum = (v: any) => (typeof v === 'string' ? Number(v) : v);
    if (obj.age !== undefined) obj.age = toNum(obj.age) as number;
    if (obj.pincode !== undefined) obj.pincode = toNum(obj.pincode) as number;
    if (obj.num_dependents !== undefined) obj.num_dependents = toNum(obj.num_dependents) as number;
    if (obj.estimated_salary !== undefined) obj.estimated_salary = toNum(obj.estimated_salary) as number;
    if (obj.calls_made !== undefined) obj.calls_made = toNum(obj.calls_made) as number;
    if (obj.sms_sent !== undefined) obj.sms_sent = toNum(obj.sms_sent) as number;
    if (obj.data_used !== undefined) obj.data_used = toNum(obj.data_used) as number;
  };

  const safeParseJson = (text: string): Partial<PredictionRequest> => {
    try {
      const jsonText = extractJsonBlock(text);
      return JSON.parse(jsonText);
    } catch {
      return {} as Partial<PredictionRequest>;
    }
  };

  const extractJsonBlock = (text: string): string => {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return text.slice(start, end + 1);
    }
    return text;
  };

  const formatPredictionMessage = (pred: PredictionResponse): string => {
    const risk = pred.churn_probability > 0.6 ? 'HIGH' : pred.churn_probability > 0.3 ? 'MEDIUM' : 'LOW';
    const suggestions: string[] = [];
    if (pred.churn_probability > 0.6) {
      suggestions.push('Offer loyalty discount or retention bundle');
      suggestions.push('Proactive support outreach');
      suggestions.push('Review plan suitability and pricing');
    } else if (pred.churn_probability > 0.3) {
      suggestions.push('Send targeted retention offer');
      suggestions.push('Check service quality and response times');
    } else {
      suggestions.push('Maintain service quality');
      suggestions.push('Consider upsell of value-added services');
    }

    return [
      `Prediction: ${pred.prediction_text} (confidence ${(pred.confidence * 100).toFixed(1)}%)`,
      `Churn Probability: ${(pred.churn_probability * 100).toFixed(1)}% (Risk: ${risk})`,
      `No-Churn Probability: ${(pred.no_churn_probability * 100).toFixed(1)}%`,
      '',
      'Recommended Actions:',
      ...suggestions.map(s => `- ${s}`),
    ].join('\n');
  };

  const generateAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('churn') && lowerQuestion.includes('factor')) {
      return predefinedInsights[0].answer;
    } else if (lowerQuestion.includes('retention') || lowerQuestion.includes('improve')) {
      return predefinedInsights[1].answer;
    } else if (lowerQuestion.includes('high-risk') || lowerQuestion.includes('profile')) {
      return predefinedInsights[2].answer;
    } else if (lowerQuestion.includes('contract') && lowerQuestion.includes('churn')) {
      return predefinedInsights[3].answer;
    } else {
      return 'I understand your question about telecom churn analysis. Based on our machine learning model and historical data, I can provide insights on customer behavior patterns, churn risk factors, and retention strategies. Could you be more specific about what aspect you\'d like to explore?';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">AI Insights Assistant</h2>
        <p className="text-slate-600 dark:text-slate-400">Get intelligent insights about customer churn patterns and retention strategies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 h-[600px] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Chat with AI Assistant
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about churn patterns, retention strategies..."
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Insights</h3>
            <div className="space-y-3">
              {predefinedInsights.map((insight, index) => (
                <button
                  key={index}
                  onClick={() => setInput(insight.question)}
                  className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {insight.question}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">AI Capabilities</h3>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li>• Churn pattern analysis</li>
              <li>• Risk factor identification</li>
              <li>• Retention strategy recommendations</li>
              <li>• Customer segmentation insights</li>
              <li>• Predictive modeling explanations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
