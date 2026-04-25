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

inv_map = {v: k for k, v in class_map.items()}


@app.route("/")
def home():
    return "AI Model is Running 🚀"


@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    img = image.load_img(BytesIO(file.read()), target_size=IMG_SIZE)

    arr = image.img_to_array(img) / 255.0
    arr = np.expand_dims(arr, axis=0)

    pred = model.predict(arr, verbose=0)[0]
    idx = int(np.argmax(pred))

    return jsonify({
        "prediction": inv_map[idx],
        "confidence": float(pred[idx])
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # important for Render
    app.run(host="0.0.0.0", port=port)