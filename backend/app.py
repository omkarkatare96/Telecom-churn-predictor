"""
Flask API for Telecom Customer Churn Prediction
==============================================

This Flask application provides a REST API endpoint for predicting
telecom customer churn using the trained machine learning model.

Author: AI Assistant
Date: 2024
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import logging
from datetime import datetime
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Global variables to store the model and preprocessors
model_package = None

@app.route('/', methods=['GET'])
def welcome():
    """
    Welcome endpoint for the API
    """
    return jsonify({
        "message": "Welcome to the Orange Telecom Churn Prediction API",
        "status": "success"
    })

def load_model():
    """
    Load the trained model and preprocessing objects
    """
    global model_package
    try:
        model_path = os.path.join(os.path.dirname(__file__), 'churn_model.pkl')
        with open(model_path, 'rb') as f:
            model_package = pickle.load(f)
        logger.info("Model loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

def preprocess_input(data):
    """
    Preprocess input data to match the model's expected format
    """
    try:
        # Create a DataFrame from the input data
        df = pd.DataFrame([data])
        
        # Apply label encoding to categorical variables
        for col, encoder in model_package['label_encoders'].items():
            if col in df.columns:
                # Handle unseen categories by using the most frequent class
                df[col] = df[col].astype(str)
                df[col] = df[col].map(lambda x: encoder.transform([x])[0] if x in encoder.classes_ else 0)
        
        # Select only the features used in training
        X = df[model_package['selected_features']]
        
        # Scale the features
        X_scaled = model_package['scaler'].transform(X)
        
        return X_scaled
    except Exception as e:
        logger.error(f"Error preprocessing input: {str(e)}")
        raise e

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': model_package is not None
    })

@app.route('/api/predict', methods=['POST'])
def predict_churn():
    """
    Predict customer churn based on input features
    """
    try:
        # Check if model is loaded
        if model_package is None:
            return jsonify({
                'error': 'Model not loaded',
                'status': 'error'
            }), 500
        
        # Get input data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No input data provided',
                'status': 'error'
            }), 400
        
        # Validate required fields
        required_fields = [
            'telecom_partner', 'gender', 'age', 'state', 'city', 'pincode',
            'date_of_registration', 'num_dependents', 'estimated_salary',
            'calls_made', 'sms_sent', 'data_used'
        ]
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {missing_fields}',
                'status': 'error'
            }), 400
        
        # Preprocess the input data
        X_processed = preprocess_input(data)
        
        # Make prediction
        prediction = model_package['model'].predict(X_processed)[0]
        probability = model_package['model'].predict_proba(X_processed)[0]
        
        # Prepare response
        response = {
            'prediction': int(prediction),
            'churn_probability': float(probability[1]),  # Probability of churn
            'no_churn_probability': float(probability[0]),  # Probability of no churn
            'prediction_text': 'Customer will churn' if prediction == 1 else 'Customer will not churn',
            'confidence': float(max(probability)),
            'timestamp': datetime.now().isoformat(),
            'status': 'success'
        }
        
        logger.info(f"Prediction made: {response['prediction_text']} (confidence: {response['confidence']:.3f})")
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        return jsonify({
            'error': f'Prediction failed: {str(e)}',
            'status': 'error'
        }), 500

@app.route('/api/model_info', methods=['GET'])
def model_info():
    """
    Get information about the loaded model
    """
    if model_package is None:
        return jsonify({
            'error': 'Model not loaded',
            'status': 'error'
        }), 500
    
    return jsonify({
        'model_type': type(model_package['model']).__name__,
        'selected_features': model_package['selected_features'],
        'feature_count': len(model_package['selected_features']),
        'categorical_columns': list(model_package['label_encoders'].keys()),
        'status': 'success'
    })

@app.route('/api/sample_input', methods=['GET'])
def sample_input():
    """
    Get a sample input format for testing
    """
    sample = {
        'telecom_partner': 'Reliance Jio',
        'gender': 'F',
        'age': 35,
        'state': 'Karnataka',
        'city': 'Bangalore',
        'pincode': 560001,
        'date_of_registration': '1/1/2020',
        'num_dependents': 2,
        'estimated_salary': 75000,
        'calls_made': 50,
        'sms_sent': 30,
        'data_used': 5000
    }
    
    return jsonify({
        'sample_input': sample,
        'description': 'Use this format for POST requests to /api/predict',
        'status': 'success'
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'status': 'error'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Internal server error',
        'status': 'error'
    }), 500

def main():
    """
    Main function to run the Flask app
    """
    print("Starting Telecom Churn Prediction API...")
    
    # Load the model
    if not load_model():
        print("Failed to load model. Please ensure churn_model.pkl exists.")
        return
    
    print("Model loaded successfully!")
    print("Available endpoints:")
    print("  GET  /health - Health check")
    print("  POST /api/predict - Make churn prediction")
    print("  GET  /api/model_info - Get model information")
    print("  GET  /api/sample_input - Get sample input format")
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    main()