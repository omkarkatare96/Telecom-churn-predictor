# Telecom Churn Prediction App

A full-stack application for predicting telecom customer churn using machine learning.

## Project Structure

```
telecom-churn-app/
├── backend/                 # Python Flask API
│   ├── app.py              # Main Flask application
│   ├── main.py             # ML model training
│   ├── run_app.py          # Application runner
│   ├── requirements.txt    # Python dependencies
│   ├── churn_model.pkl     # Trained ML model
│   └── telecom_churn(in).csv # Dataset
├── frontend/               # React + TypeScript + Tailwind
│   ├── src/                # React source code
│   ├── package.json        # Node.js dependencies
│   ├── vite.config.ts      # Vite configuration
│   └── tailwind.config.js  # Tailwind CSS config
├── package.json            # Root package.json for scripts
└── README.md               # This file
```

## Development Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py  # Train the model
python run_app.py  # Start the API server
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Production Setup
```bash
# Build frontend
cd frontend
npm run build

# Start backend (serves frontend in production)
cd backend
python run_app.py
```

## API Endpoints

- `GET /health` - Health check
- `POST /predict` - Make churn prediction
- `GET /model_info` - Get model information
- `GET /sample_input` - Get sample input format

## Features

- **ML Model**: Trained Random Forest classifier for churn prediction
- **Real-time Dashboard**: Customer analytics and insights
- **Prediction Interface**: Interactive form for churn prediction
- **Data Visualization**: Charts and graphs for data analysis
- **Responsive Design**: Modern UI with dark/light theme support
