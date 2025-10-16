import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type UploadStatus = 'idle' | 'processing' | 'success' | 'error';

export function UploadPanel() {
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ total: 0, imported: 0, errors: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      setStatus('error');
      setMessage('Please upload a CSV or Excel file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setStatus('error');
      setMessage('File size must be less than 10MB');
      return;
    }

    setStatus('processing');
    setMessage('Processing file...');

    // Simulate file processing
    setTimeout(() => {
      const total = Math.floor(Math.random() * 1000) + 500;
      const imported = Math.floor(total * 0.95);
      const errors = total - imported;

      setStats({ total, imported, errors });
      
      if (errors === 0) {
        setStatus('success');
        setMessage(`Successfully imported ${imported} records`);
      } else {
        setStatus('success');
        setMessage(`Imported ${imported} records with ${errors} errors`);
      }
    }, 3000);
  };

  const resetUpload = () => {
    setStatus('idle');
    setMessage('');
    setStats({ total: 0, imported: 0, errors: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Upload className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      default:
        return 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Data Upload</h2>
        <p className="text-slate-600 dark:text-slate-400">Upload customer data files for analysis and model training</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
              dragActive ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : getStatusColor()
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={status === 'processing'}
            />

            <div className="text-center">
              {getStatusIcon()}
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-4 mb-2">
                {status === 'idle' && 'Drop your file here or click to browse'}
                {status === 'processing' && 'Processing file...'}
                {status === 'success' && 'Upload successful!'}
                {status === 'error' && 'Upload failed'}
              </h3>
              
              {status === 'idle' && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Supports CSV and Excel files up to 10MB
                </p>
              )}

              {message && (
                <p className={`text-sm font-medium ${
                  status === 'success' ? 'text-green-600 dark:text-green-400' :
                  status === 'error' ? 'text-red-600 dark:text-red-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                  {message}
                </p>
              )}

              {status !== 'idle' && (
                <button
                  onClick={resetUpload}
                  className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Upload Another File
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-500" />
              File Requirements
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>• CSV or Excel format (.csv, .xlsx, .xls)</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Required columns: customer_id, gender, age, tenure, monthly_charges, churn</li>
              <li>• Optional columns: partner, dependents, phone_service, internet_service, contract, payment_method</li>
              <li>• First row should contain column headers</li>
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {status !== 'idle' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Upload Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Records</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Successfully Imported</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{stats.imported}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Errors</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{stats.errors}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.imported / stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" />
              Data Processing
            </h3>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li>• Automatic data validation and cleaning</li>
              <li>• Missing value detection and handling</li>
              <li>• Duplicate record identification</li>
              <li>• Data type conversion and formatting</li>
              <li>• Model retraining with new data</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Sample Data Format</h3>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-xs font-mono overflow-x-auto">
              <pre>{`customer_id,gender,age,tenure,monthly_charges,churn
7590-VHVEG,Female,1,0,29.85,0
5575-GNVDE,Male,0,34,56.95,0
3668-QPYBK,Male,0,2,53.85,1
7795-CFOCW,Male,0,45,42.30,0
9237-HQITU,Female,0,2,70.70,1`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
