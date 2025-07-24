#!/usr/bin/env python3
import sys
import json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from datetime import datetime, timedelta
import joblib
import os

# Check if model and preprocessor exist
MODEL_PATH = 'attached_assets/model_1753234187394.pkl'
SCALER_PATH = 'attached_assets/df_1753234187393.pkl'
DATA_PATH = 'attached_assets/USA_Housing_1753234187392.csv'

def load_or_train_model():
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        # Load existing model and scaler
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        return model, scaler
    
    # Train new model if files don't exist
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Training data not found at {DATA_PATH}")
    
    # Load and prepare data
    df = pd.read_csv(DATA_PATH)
    
    # Define features
    features = ['Avg. Area Income', 'Avg. Area House Age', 'Avg. Area Number of Rooms', 
                'Avg. Area Number of Bedrooms', 'Area Population']
    target = 'Price'
    
    X = df[features]
    y = df[target]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)
    
    # Save model and scaler
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    
    return model, scaler

def calculate_investment_score(features, predicted_price):
    """Calculate investment potential score (0-100)"""
    income, house_age, rooms, bedrooms, population = features
    
    # Income-to-price ratio (higher income area = better investment)
    income_ratio = min(income / 50000, 2.0)  # Cap at 2.0
    income_score = (income_ratio - 0.5) * 30  # Scale to 0-45
    
    # House age score (newer houses = better, but not too new)
    if house_age < 5:
        age_score = 15
    elif house_age < 15:
        age_score = 25
    elif house_age < 30:
        age_score = 20
    else:
        age_score = 10
    
    # Room density score
    room_density = rooms / bedrooms if bedrooms > 0 else rooms
    density_score = min(room_density * 5, 20)
    
    # Population growth potential
    if population < 10000:
        pop_score = 5
    elif population < 50000:
        pop_score = 15
    elif population < 200000:
        pop_score = 20
    else:
        pop_score = 10
    
    total_score = income_score + age_score + density_score + pop_score
    return max(0, min(100, total_score))

def calculate_appreciation_potential(features, predicted_price):
    """Calculate price appreciation potential (0-100)"""
    income, house_age, rooms, bedrooms, population = features
    
    # Market demand indicators
    demand_score = min((income / 40000) * 20, 30)
    
    # Age depreciation factor
    age_factor = max(0, (50 - house_age) / 50 * 25)
    
    # Space value
    space_value = min((rooms + bedrooms) * 3, 25)
    
    # Population growth indicator
    pop_growth = min(population / 100000 * 20, 20)
    
    appreciation = demand_score + age_factor + space_value + pop_growth
    return max(0, min(100, appreciation))

def calculate_risk_score(features, predicted_price):
    """Calculate investment risk score (0-100, lower is better)"""
    income, house_age, rooms, bedrooms, population = features
    
    # Market volatility indicators
    if income < 30000:
        income_risk = 30
    elif income > 100000:
        income_risk = 10
    else:
        income_risk = 20
    
    # Age risk
    if house_age > 50:
        age_risk = 25
    elif house_age < 5:
        age_risk = 15
    else:
        age_risk = 10
    
    # Population stability
    if population < 5000:
        pop_risk = 25
    elif population > 500000:
        pop_risk = 20
    else:
        pop_risk = 10
    
    # Market saturation
    property_density = (rooms + bedrooms) / max(population / 1000, 1)
    density_risk = min(property_density * 10, 15)
    
    total_risk = income_risk + age_risk + pop_risk + density_risk
    return min(100, total_risk)

def project_price_timeline(features, base_price, years=10):
    """Project price changes over specified timeline"""
    income, house_age, rooms, bedrooms, population = features
    
    projections = []
    current_year = datetime.now().year
    
    # Base annual appreciation rates based on property characteristics
    base_appreciation = 0.03  # 3% base
    
    # Market factors
    income_factor = min(income / 50000, 1.5) * 0.02  # Income boost
    age_depreciation = max(0, (house_age - 20) / 100) * 0.01  # Age penalty
    location_factor = min(population / 100000, 1.0) * 0.015  # Population boost
    
    annual_rate = base_appreciation + income_factor - age_depreciation + location_factor
    annual_rate = max(0.01, min(0.08, annual_rate))  # Clamp between 1-8%
    
    for year_offset in range(1, years + 1):
        # Add market cycle variation
        cycle_factor = 0.01 * np.sin(year_offset * 0.5)  # Market cycles
        year_rate = annual_rate + cycle_factor
        
        # Compound appreciation
        projected_price = base_price * ((1 + year_rate) ** year_offset)
        
        # Confidence decreases with time
        confidence = max(0.5, 0.95 - (year_offset * 0.05))
        
        # Market factors for this year
        market_factors = {
            "base_rate": round(annual_rate * 100, 2),
            "income_boost": round(income_factor * 100, 2),
            "age_penalty": round(age_depreciation * 100, 2),
            "location_boost": round(location_factor * 100, 2),
            "market_cycle": round(cycle_factor * 100, 2)
        }
        
        projections.append({
            "year": current_year + year_offset,
            "projected_price": round(projected_price, 2),
            "confidence_level": round(confidence, 3),
            "market_factors": json.dumps(market_factors)
        })
    
    return projections

def predict_with_scoring(features, timeline_years=10):
    try:
        model, scaler = load_or_train_model()
        
        # Prepare features
        feature_array = np.array([features]).reshape(1, -1)
        feature_scaled = scaler.transform(feature_array)
        
        # Make prediction
        prediction = model.predict(feature_scaled)[0]
        
        # Calculate confidence
        predictions_all_trees = []
        for tree in model.estimators_:
            pred = tree.predict(feature_scaled)[0]
            predictions_all_trees.append(pred)
        
        confidence = 1.0 - (np.std(predictions_all_trees) / np.mean(predictions_all_trees))
        confidence = max(0.0, min(1.0, confidence))
        
        # Calculate scoring metrics
        investment_score = calculate_investment_score(features, prediction)
        appreciation_potential = calculate_appreciation_potential(features, prediction)
        risk_score = calculate_risk_score(features, prediction)
        
        # Generate price projections
        price_projections = project_price_timeline(features, prediction, timeline_years)
        
        return {
            "predicted_price": float(prediction),
            "confidence": float(confidence),
            "investment_score": float(investment_score),
            "appreciation_potential": float(appreciation_potential),
            "risk_score": float(risk_score),
            "price_projections": price_projections
        }
    
    except Exception as e:
        print(f"Error in prediction: {str(e)}", file=sys.stderr)
        return None

def batch_predict(csv_path):
    try:
        model, scaler = load_or_train_model()
        
        # Load batch data
        df = pd.read_csv(csv_path)
        
        # Expected columns in the CSV
        expected_columns = ['Avg. Area Income', 'Avg. Area House Age', 'Avg. Area Number of Rooms', 
                           'Avg. Area Number of Bedrooms', 'Area Population']
        
        # Check if all required columns exist
        missing_columns = [col for col in expected_columns if col not in df.columns]
        if missing_columns:
            return {"error": f"Missing columns: {missing_columns}"}
        
        # Prepare features
        X = df[expected_columns]
        X_scaled = scaler.transform(X)
        
        # Make predictions
        predictions = model.predict(X_scaled)
        
        # Calculate all metrics for each row
        results = []
        for i, row in df.iterrows():
            features = [row[col] for col in expected_columns]
            prediction = predictions[i]
            
            # Calculate confidence
            predictions_all_trees = []
            for tree in model.estimators_:
                pred = tree.predict(X_scaled[i:i+1])[0]
                predictions_all_trees.append(pred)
            
            confidence = 1.0 - (np.std(predictions_all_trees) / np.mean(predictions_all_trees))
            confidence = max(0.0, min(1.0, confidence))
            
            # Calculate scores
            investment_score = calculate_investment_score(features, prediction)
            appreciation_potential = calculate_appreciation_potential(features, prediction)
            risk_score = calculate_risk_score(features, prediction)
            
            result = row.to_dict()
            result.update({
                'Predicted_Price': float(prediction),
                'Confidence': float(confidence),
                'Investment_Score': float(investment_score),
                'Appreciation_Potential': float(appreciation_potential),
                'Risk_Score': float(risk_score)
            })
            results.append(result)
        
        return results
    
    except Exception as e:
        print(f"Error in batch prediction: {str(e)}", file=sys.stderr)
        return {"error": str(e)}

def main():
    if len(sys.argv) < 2:
        print("Usage: python ml-service.py <command> [args]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "predict":
        if len(sys.argv) < 7:
            print("Usage: python ml-service.py predict <income> <age> <rooms> <bedrooms> <population> [timeline_years]")
            sys.exit(1)
        
        features = [float(arg) for arg in sys.argv[2:7]]
        timeline_years = int(sys.argv[7]) if len(sys.argv) > 7 else 10
        
        result = predict_with_scoring(features, timeline_years)
        
        if result is not None:
            print(json.dumps(result))
        else:
            print(json.dumps({"error": "Prediction failed"}))
    
    elif command == "batch":
        if len(sys.argv) != 3:
            print("Usage: python ml-service.py batch <csv_path>")
            sys.exit(1)
        
        csv_path = sys.argv[2]
        results = batch_predict(csv_path)
        print(json.dumps(results, default=str))
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()