"""
Startup script for the Telecom Churn Prediction Flask API
========================================================

This script starts the Flask application with proper configuration.

Author: AI Assistant
Date: 2024
"""

import os
import sys
from app import app, load_model

def main():
    """
    Main function to start the Flask application
    """
    print("=" * 60)
    print("TELECOM CHURN PREDICTION API")
    print("=" * 60)
    
    # Check if model file exists
    if not os.path.exists('churn_model.pkl'):
        print("❌ Error: churn_model.pkl not found!")
        print("Please run main.py first to train and save the model.")
        sys.exit(1)
    
    # Load the model
    print("🔄 Loading machine learning model...")
    if not load_model():
        print("❌ Error: Failed to load the model!")
        sys.exit(1)
    
    print("✅ Model loaded successfully!")
    print("\n🚀 Starting Flask API server...")
    print("📍 API will be available at: http://localhost:5000")
    print("🌐 Frontend will be available at: http://localhost:3000")
    print("\n📋 Available endpoints:")
    print("   GET  /health - Health check")
    print("   POST /api/predict - Make churn prediction")
    print("   GET  /api/model_info - Get model information")
    print("   GET  /api/sample_input - Get sample input format")
    print("\n💡 To test the API:")
    print("   1. Start the frontend: cd ../frontend && npm run dev")
    print("   2. Open http://localhost:3000 in your browser")
    print("   3. Fill in the customer details")
    print("   4. Click 'Predict Churn'")
    print("\n🛑 Press Ctrl+C to stop the server")
    print("=" * 60)
    
    # Start the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    main()
