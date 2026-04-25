# test_new_model.py
import os, json
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image

ROOT = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(ROOT, "civic_issue_model_v2.keras")
CLASS_PATH = os.path.join(ROOT, "class_names.json")
TEST_FOLDER = os.path.join(ROOT, "test_images")   # put test images here
IMG_SIZE = (224, 224)

print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded!")

with open(CLASS_PATH, "r") as f:
    class_map = json.load(f)["class_names"]
# invert the mapping to index->name
inv_map = {v: k for k, v in class_map.items()}

def predict_image(img_path):
    img = image.load_img(img_path, target_size=IMG_SIZE)
    arr = image.img_to_array(img) / 255.0
    arr = np.expand_dims(arr, 0)
    pred = model.predict(arr, verbose=0)[0]
    idx = int(np.argmax(pred))
    label = inv_map[idx]
    return label, float(pred[idx])

if not os.path.exists(TEST_FOLDER):
    print("Test folder not found:", TEST_FOLDER)
    raise SystemExit()

for fname in sorted(os.listdir(TEST_FOLDER)):
    if fname.lower().endswith((".jpg", ".jpeg", ".png")):
        path = os.path.join(TEST_FOLDER, fname)
        label, conf = predict_image(path)
        print(f"{fname:30} -> {label:20} ({conf*100:.2f}%)")
