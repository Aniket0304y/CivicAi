import os
import json
import tensorflow as tf
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.preprocessing import image
from io import BytesIO

app = Flask(__name__)
CORS(app)

ROOT = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(ROOT, "civic_issue_model_v2.keras")
CLASS_PATH = os.path.join(ROOT, "class_names.json")
IMG_SIZE = (224, 224)

print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded!")

with open(CLASS_PATH, "r") as f:
    class_map = json.load(f)["class_names"]

# Invert {"garbage":0} → {0:"garbage"}
inv_map = {v: k for k, v in class_map.items()}


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    # Load image from uploaded file
    img = image.load_img(BytesIO(file.read()), target_size=IMG_SIZE)

    # Preprocess
    arr = image.img_to_array(img) / 255.0
    arr = np.expand_dims(arr, axis=0)

    # Predict
    pred = model.predict(arr, verbose=0)[0]
    idx = int(np.argmax(pred))

    return jsonify({
        "prediction": inv_map[idx],
        "confidence": float(pred[idx])
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)
