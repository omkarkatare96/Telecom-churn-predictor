# Telecom Churn App - Setup Instructions

## Quick Start

### Prerequisites
- Python 3.8+ with pip
- Node.js 16+ with npm
- Git (optional)

### 1. Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm run install:all

# Or install separately:
npm run install:backend  # Installs Python dependencies
npm run install:frontend # Installs Node.js dependencies
```

### 2. Train the Machine Learning Model

```bash
# Train the model with the dataset
npm run train:model
# or
cd backend && python main.py
```

### 3. Development Mode

```bash
# Start both backend and frontend in development mode
npm run dev

# Or start them separately:
npm run dev:backend  # Starts Flask API on port 5000
npm run dev:frontend # Starts React app on port 3000
```

### 4. Production Mode

```bash
# Build the frontend first
npm run build

# Start production server (serves both API and frontend)
npm start
# or
cd backend && python serve_frontend.py
```

## Project Structure

```
telecom-churn-app/
├── backend/                 # Python Flask API
│   ├── app.py              # Main Flask application
│   ├── main.py             # ML model training
│   ├── run_app.py          # Development server
│   ├── serve_frontend.py   # Production server
│   ├── requirements.txt    # Python dependencies
│   ├── churn_model.pkl     # Trained ML model
│   └── telecom_churn(in).csv # Dataset
├── frontend/               # React + TypeScript + Tailwind
│   ├── src/                # React source code
│   ├── package.json        # Node.js dependencies
│   ├── vite.config.ts      # Vite configuration with proxy
│   └── dist/               # Built frontend (after npm run build)
├── package.json            # Root package.json for scripts
└── README.md               # This file
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/predict` - Make churn prediction
- `GET /api/model_info` - Get model information
- `GET /api/sample_input` - Get sample input format

## Development URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## Production URL

- Full App: http://localhost:5000 (serves both frontend and API)

## Troubleshooting

### Backend Issues
- Ensure Python 3.8+ is installed
- Check if `churn_model.pkl` exists in backend directory
- Verify all Python dependencies are installed: `pip install -r backend/requirements.txt`

### Frontend Issues
- Ensure Node.js 16+ is installed
- Clear node_modules and reinstall: `rm -rf frontend/node_modules && npm run install:frontend`
- Check if backend is running on port 5000

### CORS Issues
- The frontend is configured with a proxy to the backend
- In development, frontend runs on port 3000 and proxies API calls to port 5000
- In production, both are served from port 5000

### Model Training Issues
- Ensure the dataset file `telecom_churn(in).csv` exists in the backend directory
- Check Python dependencies for ML libraries (scikit-learn, pandas, etc.)

## Features

- **ML Model**: Trained Random Forest classifier for churn prediction
- **Real-time Dashboard**: Customer analytics and insights
- **Prediction Interface**: Interactive form for churn prediction
- **Data Visualization**: Charts and graphs for data analysis
- **Responsive Design**: Modern UI with dark/light theme support
- **AI Insights**: Chat interface for data insights
- **Data Upload**: File upload for new datasets
