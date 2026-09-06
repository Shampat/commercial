from PIL import Image
import os
for f in os.listdir("public/demo"):
    if f.endswith(".webp"):
        path = f"public/demo/{f}"
        img = Image.open(path)
        img = img.convert("RGB")
        img.thumbnail((900,700))
        out = path.replace(".webp","_card.jpg")
        if not os.path.exists(out):
            img.save(out, "JPEG", quality=75, optimize=True)
            print(f"{f} -> {out} {os.path.getsize(out)//1024}KB")
        else:
            print(f"exists {out} {os.path.getsize(out)//1024}KB")
