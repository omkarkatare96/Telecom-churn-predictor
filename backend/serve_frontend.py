"""
Production server that serves both the Flask API and the React frontend
"""

import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from app import app as api_app, load_model

# Initialize Flask app for production
app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
CORS(app)

# Load the ML model
load_model()

# API routes from the main app
app.register_blueprint(api_app, url_prefix='/api')

@app.route('/')
def serve_frontend():
    """Serve the React frontend"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from the React build"""
    return send_from_directory(app.static_folder, path)

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': '2024-01-01T00:00:00Z',
        'model_loaded': True
    })

if __name__ == '__main__':
    print("=" * 60)
    print("TELECOM CHURN PREDICTION APP - PRODUCTION MODE")
    print("=" * 60)
    print("🚀 Starting production server...")
    print("📍 App will be available at: http://localhost:5000")
    print("🌐 Frontend served from: /")
    print("🔗 API endpoints available at: /api/*")
    print("\n📋 Available endpoints:")
    print("   GET  /health - Health check")
    print("   POST /api/predict - Make churn prediction")
    print("   GET  /api/model_info - Get model information")
    print("   GET  /api/sample_input - Get sample input format")
    print("\n🛑 Press Ctrl+C to stop the server")
    print("=" * 60)
    
    app.run(debug=False, host='0.0.0.0', port=5000)
