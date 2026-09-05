import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

# The fixed feature contract matching live_detector.py
FEATURES = [
    'MI_dir_L5_weight',
    'H_L5_weight',
    'HH_L5_weight',
    'HpHp_L5_weight',
    'HH_L5_mean',
    'HH_L5_std',
    'HH_jit_L5_mean',
    'HH_jit_L5_variance',
    'HpHp_L5_mean',
    'HpHp_L5_std'
]

def load_data(data_dir):
    """
    Loads all 11 CSV files from data_dir, assigns labels and attack types,
    combines them into a single dataframe, shuffles, and reports class balance.
    """
    print(f"Loading CSV files from {data_dir}...")
    dfs = []
    
    # List of expected files for Device 1
    files_info = [
        ('1.benign.csv', 0, 'benign'),
        ('1.gafgyt.combo.csv', 1, 'gafgyt.combo'),
        ('1.gafgyt.junk.csv', 1, 'gafgyt.junk'),
        ('1.gafgyt.scan.csv', 1, 'gafgyt.scan'),
        ('1.gafgyt.tcp.csv', 1, 'gafgyt.tcp'),
        ('1.gafgyt.udp.csv', 1, 'gafgyt.udp'),
        ('1.mirai.ack.csv', 1, 'mirai.ack'),
        ('1.mirai.scan.csv', 1, 'mirai.scan'),
        ('1.mirai.syn.csv', 1, 'mirai.syn'),
        ('1.mirai.udp.csv', 1, 'mirai.udp'),
        ('1.mirai.udpplain.csv', 1, 'mirai.udpplain'),
    ]
    
    for filename, label, attack_type in files_info:
        file_path = os.path.join(data_dir, filename)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Required dataset file not found: {file_path}")
            
        print(f"  Reading {filename}...")
        # Optimize memory usage by reading only target features to speed up loading
        # (Though we load all features to perform complete Step 2 feature reduction as required)
        df_file = pd.read_csv(file_path)
        
        # Add labels
        df_file['label'] = label
        df_file['attack_type'] = attack_type
        df_file['source_file'] = filename
        
        dfs.append(df_file)
        
    # Combine dataframes
    df = pd.concat(dfs, ignore_index=True)
    
    # Initial shuffle of the combined dataset
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Report class balance
    total = len(df)
    benign_count = len(df[df['label'] == 0])
    attack_count = len(df[df['label'] == 1])
    print("\n=== Dataset Summary ===")
    print(f"Total Rows:     {total:,}")
    print(f"Benign (0):     {benign_count:,} ({benign_count/total*100:.2f}%)")
    print(f"Attack (1):     {attack_count:,} ({attack_count/total*100:.2f}%)")
    
    # Report attack-type breakdown
    print("\nAttack Type Breakdown:")
    breakdown = df['attack_type'].value_counts()
    for name, count in breakdown.items():
        print(f"  {name:<20}: {count:,} ({count/total*100:.2f}%)")
        
    return df

def reduce_features(df):
    """
    Filters the dataframe to keep only the selected 10 features plus the target columns.
    """
    print(f"\nReducing feature set from {len(df.columns) - 3} columns to {len(FEATURES)} columns...")
    
    # Ensure all required features exist in the dataframe
    missing_features = [f for f in FEATURES if f not in df.columns]
    if missing_features:
        raise ValueError(f"Missing expected features in CSV header: {missing_features}")
        
    keep_cols = FEATURES + ['label', 'attack_type', 'source_file']
    df_reduced = df[keep_cols].copy()
    return df_reduced

def split_data(df, train_ratio=0.8):
    """
    Splits the data temporally per source file:
      - First 80% rows of each file go to train
      - Last 20% rows of each file go to test
    This prevents temporal data leakage from overlapping sliding windows.
    """
    print(f"\nSplitting data temporally per file source ({int(train_ratio*100)}/{int((1-train_ratio)*100)})...")
    train_list = []
    test_list = []
    
    # Group by source file to split each file chronologically
    # Note: groupby preserves the original dataframe's row order per group
    for file_name, group in df.groupby('source_file'):
        split_idx = int(len(group) * train_ratio)
        
        train_slice = group.iloc[:split_idx]
        test_slice = group.iloc[split_idx:]
        
        train_list.append(train_slice)
        test_list.append(test_slice)
        
    train_df = pd.concat(train_list, ignore_index=True)
    test_df = pd.concat(test_list, ignore_index=True)
    
    # Shuffle train and test independently to break temporal ordering for Random Forest training
    train_df = train_df.sample(frac=1, random_state=42).reset_index(drop=True)
    test_df = test_df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Print splits information
    print(f"Train set shape: {train_df.shape}")
    print(f"Test set shape:  {test_df.shape}")
    
    # Check split stratification
    train_label_pct = train_df['label'].mean() * 100
    test_label_pct = test_df['label'].mean() * 100
    print(f"Train Attack Ratio: {train_label_pct:.2f}%")
    print(f"Test Attack Ratio:  {test_label_pct:.2f}%")
    
    return train_df, test_df

def train_model(X_train, y_train):
    """
    Trains a RandomForestClassifier. Max depth is limited to prevent overfitting 
    and optimize for low-latency live prediction on Raspberry Pi.
    """
    print("\nTraining RandomForestClassifier...")
    # max_depth=10 selected to ensure shallow, fast-executing trees for IoT deployment
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    print("Training complete.")
    return model

def evaluate_model(model, X_test, y_test, features):
    """
    Computes accuracy, precision, recall, F1, confusion matrix, and feature importances.
    Flags potential data leakage if accuracy > 99.5%.
    """
    print("\nEvaluating model on test set...")
    y_pred = model.predict(X_test)
    
    # Calculate performance metrics
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)
    
    print("\n=== Evaluation Metrics ===")
    print(f"Accuracy:  {acc:.6f}")
    print(f"Precision: {prec:.6f}")
    print(f"Recall:    {rec:.6f}")
    print(f"F1-Score:  {f1:.6f}")
    
    print("\nConfusion Matrix:")
    print(cm)
    
    # Print sorted feature importances
    importances = model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    
    print("\n=== Feature Importances ===")
    for idx in sorted_idx:
        print(f"  {features[idx]:<25}: {importances[idx]:.6f}")
        
    # Sanity check for data leakage
    if acc > 0.995:
        print("\n" + "!" * 60)
        print("WARNING: Model Accuracy is > 99.5%!")
        print("This may indicate severe data leakage. Please investigate:")
        print("  - Overlapping sliding windows between train and test sets.")
        print("  - Features that proxy the labels.")
        print("  - Data leakage from identical/duplicate packets across files.")
        print("!" * 60 + "\n")
        
    return acc, prec, rec, f1, cm

def save_artifacts(model, features, model_path, features_path):
    """
    Saves the trained model and features list to joblib files.
    """
    print(f"\nSaving model to {model_path}...")
    joblib.dump(model, model_path)
    
    print(f"Saving live feature names list to {features_path}...")
    joblib.dump(features, features_path)
    print("Artifacts saved successfully.")

if __name__ == "__main__":
    # Define dataset directory and output paths
    data_dir = r"c:\Users\sreed\Downloads\archive\botnet_device1"
    model_output = "botnet_rf_model_live.joblib"
    features_output = "live_feature_names.joblib"
    
    # Step 1: Load and Label
    df = load_data(data_dir)
    
    # Step 2: Feature Reduction
    df_reduced = reduce_features(df)
    
    # Step 3: Train/Test Split
    train_df, test_df = split_data(df_reduced, train_ratio=0.8)
    
    # Separate features and labels
    X_train = train_df[FEATURES]
    y_train = train_df['label']
    
    X_test = test_df[FEATURES]
    y_test = test_df['label']
    
    # Step 4: Train
    model = train_model(X_train, y_train)
    
    # Step 5: Evaluate
    evaluate_model(model, X_test, y_test, FEATURES)
    
    # Step 6: Save Artifacts
    save_artifacts(model, FEATURES, model_output, features_output)
