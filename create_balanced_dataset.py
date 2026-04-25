import os
import random
import shutil

SOURCE = "./dataset/archive/civic-issue-dataset/images"
TARGET = "./dataset/balanced_small"

# Target limits per class
LIMITS = {
    "potholes": 300,
    "garbage": 150,
    "road_normal": 150,
    "open_manhole": 150,
    "streetlight_bad": 100,
    "streetlight_good": 80
}

os.makedirs(TARGET, exist_ok=True)

for cls, limit in LIMITS.items():
    src = os.path.join(SOURCE, cls)
    dst = os.path.join(TARGET, cls)
    os.makedirs(dst, exist_ok=True)

    all_imgs = os.listdir(src)
    random.shuffle(all_imgs)

    selected = all_imgs[:limit]

    for img in selected:
        shutil.copy(os.path.join(src, img), os.path.join(dst, img))

    print(f"Copied {len(selected)} images → {dst}")

print("\n✅ Small balanced dataset created at:", TARGET)
