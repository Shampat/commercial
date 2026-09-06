from PIL import Image, ImageDraw, ImageFont
import os, pathlib, json, requests, random

os.makedirs("public/demo", exist_ok=True)

# Create 1 MASTER image - super minimal, not photographic, zero copyright risk
img = Image.new("RGB", (800,600), (232,232,232))
draw = ImageDraw.Draw(img)
# simple floor
draw.rectangle([(0,400),(800,600)], fill=(210,210,210))
# simple walls
draw.rectangle([(0,0),(800,400)], fill=(240,240,240))
draw.rectangle([(100,80),(700,380)], outline=(200,200,200), width=2)
draw.line([(100,80),(700,80)], fill=(220,220,220), width=20) # ceiling

# Burn only bottom DEMO bar - no top badge
d = ImageDraw.Draw(img, "RGBA")
d.rectangle([(0,572),(800,600)], fill=(0,0,0,200))
try:
    f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 13)
except:
    f = ImageFont.load_default()
d.text((260,578), "DEMO LISTING • Example Only", fill=(255,255,255), font=f)
d.text((280,400), "10,000 SQ FT • COMMERCIAL", fill=(120,120,120), font=f)

img.save("public/demo/master_demo.jpg", "JPEG", quality=85, optimize=True)
print("Created public/demo/master_demo.jpg - ONE image for all")

# Seed all 56 listings with SAME single image
env={}
with open(".env.local") as f:
 for l in f:
  if "=" in l and not l.strip().startswith("#"):
   k,v=l.strip().split("=",1)
   env[k.strip()]=v.strip().strip('"').strip("'")
url=env["NEXT_PUBLIC_SUPABASE_URL"]
key=env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
h={"apikey":key,"Authorization":f"Bearer {key}","Content-Type":"application/json"}

requests.delete(f"{url}/rest/v1/listings?is_demo=eq.true", headers=h)

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
      "description":f"DEMO LISTING - {cat}",
      "images":["/demo/master_demo.jpg"], # ONE image for all - super fast
      "contact":"Demo","email":"demo@commercial.local",
      "type":cat,"is10k":True,"verified":False,"is_demo":True,
      "address": f"{100+i} {cat} Blvd"
    })

r=requests.post(f"{url}/rest/v1/listings", headers={**h,"Prefer":"return=minimal"}, data=json.dumps(rows))
print("Seed:", r.status_code, "56 listings all using master_demo.jpg" if r.status_code in [200,201,204] else r.text[:400])

# Remove top DEMO badge from page.tsx completely
p=pathlib.Path("src/app/page.tsx")
s=p.read_text()
import re
s=re.sub(r'\{\(p as any\)\.is_demo && <div[^>]*>DEMO</div>\}', '', s)
s=re.sub(r'\{p\.title\.includes\("#"\) \|\| \(p as any\)\.is_demo\}', '(p as any).is_demo', s)
p.write_text(s)
print("Removed all CSS DEMO badges - only burned-in bottom remains")
