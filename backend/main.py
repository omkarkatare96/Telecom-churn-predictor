"""
Telecom Customer Churn Prediction System
========================================

This script implements a complete machine learning pipeline for predicting
telecom customer churn using the Orange Telecom dataset.

Author: AI Assistant
Date: 2024
"""

# Import necessary libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, classification_report
from sklearn.feature_selection import SelectKBest, f_classif
import pickle
import warnings
warnings.filterwarnings('ignore')

# Set random seed for reproducibility
np.random.seed(42)

def load_and_explore_data(file_path):
    """
    Load the dataset and perform initial exploration
    """
    print("=" * 60)
    print("STEP 1: LOADING AND EXPLORING THE DATASET")
    print("=" * 60)
    
    # Load the dataset
    df = pd.read_csv(file_path)
    
    print(f"Dataset shape: {df.shape}")
    print(f"Number of features: {df.shape[1]}")
    print(f"Number of samples: {df.shape[0]}")
    
    # Display basic info
    print("\nDataset Info:")
    print(df.info())
    
    # Display first few rows
    print("\nFirst 5 rows:")
    print(df.head())
    
    # Check for missing values
    print("\nMissing values per column:")
    missing_values = df.isnull().sum()
    print(missing_values[missing_values > 0])
    
    # Check data types
    print("\nData types:")
    print(df.dtypes)
    
    # Check target variable distribution
    print(f"\nTarget variable (churn) distribution:")
    print(df['churn'].value_counts())
    print(f"Churn rate: {df['churn'].mean():.2%}")
    
    return df

def clean_data(df):
    """
    Clean the dataset by handling missing values and invalid data
    """
    print("\n" + "=" * 60)
    print("STEP 2: CLEANING THE DATA")
    print("=" * 60)
    
    # Create a copy of the dataframe
    df_clean = df.copy()
    
    # Check for negative values in numeric columns
    numeric_columns = df_clean.select_dtypes(include=[np.number]).columns
    print("Checking for negative values in numeric columns:")
    for col in numeric_columns:
        negative_count = (df_clean[col] < 0).sum()
        if negative_count > 0:
            print(f"  {col}: {negative_count} negative values")
            # Replace negative values with 0 for usage-related columns
            if col in ['data_used', 'calls_made', 'sms_sent']:
                df_clean[col] = df_clean[col].clip(lower=0)
                print(f"    -> Replaced negative values with 0")
    
    # Handle missing values
    print("\nHandling missing values:")
    missing_before = df_clean.isnull().sum().sum()
    print(f"Missing values before cleaning: {missing_before}")
    
    # Fill missing values
    # For numeric columns, fill with median
    numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df_clean[col].isnull().sum() > 0:
            df_clean[col].fillna(df_clean[col].median(), inplace=True)
    
    # For categorical columns, fill with mode
    categorical_cols = df_clean.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        if df_clean[col].isnull().sum() > 0:
            df_clean[col].fillna(df_clean[col].mode()[0], inplace=True)
    
    missing_after = df_clean.isnull().sum().sum()
    print(f"Missing values after cleaning: {missing_after}")
    
    # Check for any remaining issues
    print(f"\nData quality check:")
    print(f"  - No missing values: {df_clean.isnull().sum().sum() == 0}")
    print(f"  - No infinite values: {np.isinf(df_clean.select_dtypes(include=[np.number])).sum().sum() == 0}")
    
    return df_clean

def encode_categorical_features(df):
    """
    Encode categorical variables for machine learning
    """
    print("\n" + "=" * 60)
    print("STEP 3: ENCODING CATEGORICAL FEATURES")
    print("=" * 60)
    
    df_encoded = df.copy()
    
    # Identify categorical columns
    categorical_columns = df_encoded.select_dtypes(include=['object']).columns.tolist()
    print(f"Categorical columns to encode: {categorical_columns}")
    
    # Initialize label encoders
    label_encoders = {}
    
    # Encode each categorical column
    for col in categorical_columns:
        if col != 'customer_id':  # Skip customer_id as it's not useful for prediction
            le = LabelEncoder()
            df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
            label_encoders[col] = le
            print(f"  {col}: {len(le.classes_)} unique values")
    
    print(f"\nEncoded dataset shape: {df_encoded.shape}")
    print("First few rows after encoding:")
    print(df_encoded.head())
    
    return df_encoded, label_encoders

def feature_selection_and_preparation(df):
    """
    Perform feature selection and prepare train/test data
    """
    print("\n" + "=" * 60)
    print("STEP 4: FEATURE SELECTION AND DATA PREPARATION")
    print("=" * 60)
    
    # Separate features and target
    X = df.drop(['churn', 'customer_id'], axis=1)  # Remove target and ID columns
    y = df['churn']
    
    print(f"Feature matrix shape: {X.shape}")
    print(f"Target vector shape: {y.shape}")
    
    # Feature selection using SelectKBest
    print("\nPerforming feature selection...")
    selector = SelectKBest(score_func=f_classif, k=10)  # Select top 10 features
    X_selected = selector.fit_transform(X, y)
    
    # Get selected feature names
    selected_features = X.columns[selector.get_support()].tolist()
    print(f"Selected features: {selected_features}")
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X_selected, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print(f"\nTraining set shape: {X_train_scaled.shape}")
    print(f"Test set shape: {X_test_scaled.shape}")
    print(f"Training set churn rate: {y_train.mean():.2%}")
    print(f"Test set churn rate: {y_test.mean():.2%}")
    
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, selected_features

def train_models(X_train, X_test, y_train, y_test):
    """
    Train and evaluate multiple classification models
    """
    print("\n" + "=" * 60)
    print("STEP 5: TRAINING AND EVALUATING MODELS")
    print("=" * 60)
    
    # Initialize models
    models = {
        'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
        'Random Forest': RandomForestClassifier(random_state=42, n_estimators=100)
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"\nTraining {name}...")
        
        # Train the model
        model.fit(X_train, y_train)
        
        # Make predictions
        y_pred = model.predict(X_test)
        y_pred_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else None
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_pred_proba) if y_pred_proba is not None else None
        
        # Store results
        results[name] = {
            'model': model,
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'roc_auc': roc_auc,
            'predictions': y_pred,
            'probabilities': y_pred_proba
        }
        
        # Print results
        print(f"  Accuracy: {accuracy:.4f}")
        print(f"  Precision: {precision:.4f}")
        print(f"  Recall: {recall:.4f}")
        print(f"  F1-Score: {f1:.4f}")
        if roc_auc:
            print(f"  ROC AUC: {roc_auc:.4f}")
    
    return results

def create_visualizations(results, y_test):
    """
    Create visualizations for model evaluation
    """
    print("\n" + "=" * 60)
    print("STEP 6: CREATING VISUALIZATIONS")
    print("=" * 60)
    
    # Set up the plotting style
    plt.style.use('default')
    sns.set_palette("husl")
    
    # Create a figure with subplots
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    fig.suptitle('Model Performance Comparison', fontsize=16, fontweight='bold')
    
    # 1. Model comparison bar chart
    model_names = list(results.keys())
    metrics = ['accuracy', 'precision', 'recall', 'f1']
    
    x = np.arange(len(model_names))
    width = 0.2
    
    for i, metric in enumerate(metrics):
        values = [results[name][metric] for name in model_names]
        axes[0, 0].bar(x + i*width, values, width, label=metric.title())
    
    axes[0, 0].set_xlabel('Models')
    axes[0, 0].set_ylabel('Score')
    axes[0, 0].set_title('Model Performance Metrics')
    axes[0, 0].set_xticks(x + width * 1.5)
    axes[0, 0].set_xticklabels(model_names)
    axes[0, 0].legend()
    axes[0, 0].grid(True, alpha=0.3)
    
    # 2. Confusion matrices
    for i, (name, result) in enumerate(results.items()):
        cm = confusion_matrix(y_test, result['predictions'])
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[0, 1] if i == 0 else axes[1, 0])
        if i == 0:
            axes[0, 1].set_title(f'{name} - Confusion Matrix')
        else:
            axes[1, 0].set_title(f'{name} - Confusion Matrix')
    
    # 3. ROC Curves (if probabilities available)
    from sklearn.metrics import roc_curve
    for name, result in results.items():
        if result['probabilities'] is not None:
            fpr, tpr, _ = roc_curve(y_test, result['probabilities'])
            axes[1, 1].plot(fpr, tpr, label=f'{name} (AUC = {result["roc_auc"]:.3f})')
    
    axes[1, 1].plot([0, 1], [0, 1], 'k--', label='Random Classifier')
    axes[1, 1].set_xlabel('False Positive Rate')
    axes[1, 1].set_ylabel('True Positive Rate')
    axes[1, 1].set_title('ROC Curves')
    axes[1, 1].legend()
    axes[1, 1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('model_performance.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    print("Visualizations saved as 'model_performance.png'")

def save_model_and_preprocessors(best_model, scaler, selected_features, label_encoders):
    """
    Save the best model and preprocessing objects
    """
    print("\n" + "=" * 60)
    print("STEP 7: SAVING MODEL AND PREPROCESSORS")
    print("=" * 60)
    
    # Create a dictionary with all necessary objects
    model_package = {
        'model': best_model,
        'scaler': scaler,
        'selected_features': selected_features,
        'label_encoders': label_encoders
    }
    
    # Save the model package
    with open('churn_model.pkl', 'wb') as f:
        pickle.dump(model_package, f)
    
    print("Model and preprocessors saved as 'churn_model.pkl'")
    print("Package includes:")
    print("  - Trained model")
    print("  - Feature scaler")
    print("  - Selected features list")
    print("  - Label encoders for categorical variables")

def main():
    """
    Main function to run the complete pipeline
    """
    print("TELECOM CUSTOMER CHURN PREDICTION SYSTEM")
    print("=" * 60)
    
    # Step 1: Load and explore data
    df = load_and_explore_data('telecom_churn(in).csv')
    
    # Step 2: Clean data
    df_clean = clean_data(df)
    
    # Step 3: Encode categorical features
    df_encoded, label_encoders = encode_categorical_features(df_clean)
    
    # Step 4: Feature selection and preparation
    X_train, X_test, y_train, y_test, scaler, selected_features = feature_selection_and_preparation(df_encoded)
    
    # Step 5: Train models
    results = train_models(X_train, X_test, y_train, y_test)
    
    # Step 6: Create visualizations
    create_visualizations(results, y_test)
    
    # Step 7: Select best model and save
    best_model_name = max(results.keys(), key=lambda x: results[x]['f1'])
    best_model = results[best_model_name]['model']
    
    print(f"\nBest model: {best_model_name}")
    print(f"Best F1-Score: {results[best_model_name]['f1']:.4f}")
    
    save_model_and_preprocessors(best_model, scaler, selected_features, label_encoders)
    
    # Print final summary
    print("\n" + "=" * 60)
    print("FINAL SUMMARY")
    print("=" * 60)
    print("✅ Dataset loaded and explored")
    print("✅ Data cleaned and preprocessed")
    print("✅ Categorical features encoded")
    print("✅ Features selected and scaled")
    print("✅ Models trained and evaluated")
    print("✅ Visualizations created")
    print("✅ Best model saved")
    print("\nNext steps:")
    print("1. Review the model performance")
    print("2. Create Flask/FastAPI backend")
    print("3. Build frontend interface")

if __name__ == "__main__":
    main()
