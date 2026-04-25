#!/usr/bin/env python
"""Quick test script to POST images to Flask /predict endpoint."""
import requests
import sys
import time

def predict_image(img_path):
    """Send image to Flask /predict and return response."""
    url = "http://127.0.0.1:5001/predict"
    try:
        print(f"\n📤 Predicting: {img_path}")
        start = time.time()
        with open(img_path, 'rb') as fh:
            files = {'file': (img_path.split('\\')[-1], fh, 'image/png')}
            r = requests.post(url, files=files, timeout=30)
        elapsed = time.time() - start
        
        print(f"⏱️  Response time: {elapsed:.2f}s")
        print(f"📊 Status code: {r.status_code}")
        
        if r.status_code == 200:
            data = r.json()
            print(f"✅ Prediction: {data.get('prediction', 'N/A')}")
            print(f"   Confidence: {data.get('confidence', 'N/A')}")
            return data
        else:
            print(f"❌ Error: {r.text}")
            return None
    except Exception as e:
        print(f"❌ Exception: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_predict.py <image_path> [image_path2] ...")
        sys.exit(1)
    
    for img_path in sys.argv[1:]:
        predict_image(img_path)
