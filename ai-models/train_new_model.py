# train_new_model.py
import os
import json
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# -------- CONFIG --------
ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT, "demo_dataset")      # put your images here
MODEL_OUT = os.path.join(ROOT, "civic_issue_model_v2.keras")
CLASS_JSON = os.path.join(ROOT, "class_names.json")
IMG_SIZE = (224, 224)
BATCH = 16
EPOCHS = 12
LEARNING_RATE = 1e-4
# ------------------------

# sanity checks
if not os.path.exists(DATA_DIR):
    raise SystemExit(f"Dataset folder not found: {DATA_DIR}")

print("Using dataset:", DATA_DIR)

# data augmentation & generators
train_aug = ImageDataGenerator(
    rescale=1.0/255,
    rotation_range=20,
    width_shift_range=0.12,
    height_shift_range=0.12,
    shear_range=0.12,
    zoom_range=0.15,
    horizontal_flip=True,
    fill_mode="nearest",
    validation_split=0.15
)

train_gen = train_aug.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH,
    class_mode="categorical",
    subset="training",
    shuffle=True
)

val_gen = train_aug.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH,
    class_mode="categorical",
    subset="validation",
    shuffle=False
)

num_classes = len(train_gen.class_indices)
print("Classes:", train_gen.class_indices)

# build model using transfer learning
base = MobileNetV2(include_top=False, input_shape=(IMG_SIZE[0], IMG_SIZE[1], 3), weights="imagenet")
base.trainable = False   # freeze base

model = models.Sequential([
    base,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.4),
    layers.Dense(256, activation="relu"),
    layers.Dropout(0.3),
    layers.Dense(num_classes, activation="softmax")
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

# callbacks
checkpoint = tf.keras.callbacks.ModelCheckpoint(MODEL_OUT, save_best_only=True, monitor="val_accuracy", mode="max")
reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=3, verbose=1)
early_stop = tf.keras.callbacks.EarlyStopping(monitor="val_loss", patience=6, restore_best_weights=True)

# train
history = model.fit(
    train_gen,
    epochs=EPOCHS,
    validation_data=val_gen,
    callbacks=[checkpoint, reduce_lr, early_stop]
)

# Save class names
classes_sorted = {k: v for k, v in train_gen.class_indices.items()}
with open(CLASS_JSON, "w") as f:
    json.dump({"class_names": classes_sorted}, f)

print("✔ Model saved:", MODEL_OUT)
print("✔ Class names saved:", CLASS_JSON)
