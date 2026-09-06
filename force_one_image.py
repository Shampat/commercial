import requests, json, pathlib

# 1. Ensure master image exists locally
from PIL import Image, ImageDraw, ImageFont
import os
os.makedirs("public/demo", exist_ok=True)
img = Image.new("RGB", (800,600), (235,235,235))
draw = ImageDraw.Draw(img)
draw.rectangle([(0,380),(800,600)], fill=(210,210,210))
draw.rectangle([(80,60),(720,380)], outline=(190,190,190), width=2)
draw.rectangle([(0,0),(800,40)], fill=(45,45,45))
d = ImageDraw.Draw(img, "RGBA")
d.rectangle([(0,570),(800,600)], fill=(0,0,0,220))
try:
    f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
except:
    f = ImageFont.load_default()
d.text((10,10), "Commercial • 10,000 SQ FT", fill=(255,255,255), font=f)
d.text((240,576), "DEMO LISTING • Example Only", fill=(255,255,255), font=f)
img.save("public/demo/master_demo.jpg", "JPEG", quality=82, optimize=True)
print("Created public/demo/master_demo.jpg")

# 2. Update Supabase - set ALL listings images to single local file
env={}
with open(".env.local") as f:
 for l in f:
  if "=" in l and not l.strip().startswith("#"):
   k,v=l.strip().split("=",1)
   env[k.strip()]=v.strip().strip('"').strip("'")
url=env["NEXT_PUBLIC_SUPABASE_URL"]
key=env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
h={"apikey":key,"Authorization":f"Bearer {key}","Content-Type":"application/json"}

# Delete ALL then reseed clean with ONE image
requests.delete(f"{url}/rest/v1/listings?is_demo=eq.true", headers=h)
requests.delete(f"{url}/rest/v1/listings?title=like.*10K%*", headers=h) # clean any old 10K
print("Deleted old")

import random
cats=["Office Space","Retail","Industrial","Warehouse","Medical Office","Restaurant","Plaza"]
city_map={"Office Space":"Brampton","Retail":"Mississauga","Industrial":"Vaughan","Warehouse":"Caledon","Medical Office":"Brampton","Restaurant":"Toronto","Plaza":"Brampton"}
rows=[]
for cat in cats:
  for i in range(1,9):
    rows.append({
      "title": f"{cat} - 10K #{i}",
      "city": city_map[cat],
      "province":"ON","country":"Canada",
      "area":10000,"sqft":10000,"price":random.choice([7500,8500,9500]),
      "description":f"DEMO LISTING",
      "images":["/demo/master_demo.jpg"], # <-- ONE image, not unsplash
      "contact":"Demo","email":"demo@commercial.local",
      "type":cat,"is10k":True,"verified":False,"is_demo":True,
      "address": f"{100+i} {cat} Blvd"
    })

r=requests.post(f"{url}/rest/v1/listings", headers={**h,"Prefer":"return=minimal"}, data=json.dumps(rows))
print("Seed status:", r.status_code)
if r.status_code not in [200,201,204]:
    print(r.text[:1000])

# 3. Clean page.tsx - remove any Unsplash fallback and top DEMO badge
p=pathlib.Path("src/app/page.tsx")
s=p.read_text()
# Remove any Unsplash URL fallback
s=s.replace("'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'", "'/demo/master_demo.jpg'")
s=s.replace('"https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"', '"/demo/master_demo.jpg"')
import re
s=re.sub(r'\{\([^}]*is_demo[^}]*\) && <div[^>]*>DEMO</div>\}', '', s)
s=re.sub(r'\{p\.title\.includes\("#"\)[^}]*\}', '(p as any).is_demo', s)
p.write_text(s)
print("Cleaned page.tsx - now only /demo/master_demo.jpg")
