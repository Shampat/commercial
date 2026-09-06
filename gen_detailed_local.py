from PIL import Image, ImageDraw, ImageFont
import os, pathlib, json, requests, random, shutil

os.makedirs("public/demo", exist_ok=True)

def get_font(sz):
    for fp in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf","/usr/share/fonts/TTF/DejaVuSans.ttf"]:
        if os.path.exists(fp):
            try: return ImageFont.truetype(fp, sz)
            except: pass
    return ImageFont.load_default()

# --- Generate 7 detailed hypothetical drawings (not copy of your refs) ---
categories = {
 "office": {"label":"OFFICE • 10K • MODERN PLAN", "accent":(37,99,235), "zones":[(152,152,298,248)]},
 "retail": {"label":"RETAIL • 10K • STORE LAYOUT", "accent":(22,163,74), "zones":[(302,152,448,248)]},
 "industrial": {"label":"INDUSTRIAL • 10K • HEAVY DUTY", "accent":(202,138,4), "zones":[(452,152,648,248)]},
 "warehouse": {"label":"WAREHOUSE • 10K • PRE-ENG STEEL", "accent":(220,38,38), "zones":[(152,252,298,338)]},
 "medical": {"label":"MEDICAL • 10K • CLINIC LAYOUT", "accent":(13,148,136), "zones":[(302,252,448,338)]},
 "restaurant": {"label":"RESTAURANT • 10K • KITCHEN PLAN", "accent":(234,88,12), "zones":[(452,252,648,338)]},
 "plaza": {"label":"PLAZA • 10K • MULTI-UNIT", "accent":(124,58,237), "zones":[(152,342,648,418)]},
}

for cat, cfg in categories.items():
    accent = cfg["accent"]
    img = Image.new("RGB", (900,650), (248,248,250))
    draw = ImageDraw.Draw(img, "RGBA")

    # blueprint dot grid
    for x in range(0,900,20):
        for y in range(50,550,20):
            draw.ellipse([(x,y),(x+1.5,y+1.5)], fill=(210,210,220))

    # Title bars - single DEMO bottom only as you wanted
    draw.rectangle([(0,0),(900,42)], fill=(30,30,35))
    draw.rectangle([(0,600),(900,650)], fill=(0,0,0,230))

    # Main building box - detailed
    draw.rectangle([(120,80),(780,520)], outline=(60,60,70), width=2)
    # mezzanine/top strip
    draw.rectangle([(120,80),(780,115)], fill=(240,240,243), outline=(60,60,70), width=1)

    # Internal grid - steel frame style like your first reference
    draw.line([(280,80),(280,520)], fill=(160,160,170), width=1)
    draw.line([(450,80),(450,520)], fill=(160,160,170), width=1)
    draw.line([(620,80),(620,520)], fill=(160,160,170), width=1)
    draw.line([(120,180),(780,180)], fill=(160,160,170), width=1)
    draw.line([(120,300),(780,300)], fill=(160,160,170), width=1)
    draw.line([(120,420),(780,420)], fill=(160,160,170), width=1)

    # Accent zone
    for (x1,y1,x2,y2) in cfg["zones"]:
        draw.rectangle([(x1,y1),(x2,y2)], fill=(*accent,35), outline=accent, width=2)

    # Steel detail markers (like your first screenshot - small callouts)
    for cx, cy in [(150,100),(400,100),(650,100)]:
        draw.rectangle([(cx,92),(cx+40,108)], outline=accent, width=1)
        draw.line([(cx+20,108),(cx+20,125)], fill=accent, width=1)

    # Dimension lines bottom like your ref
    draw.line([(120,545),(780,545)], fill=(100,100,110), width=1)
    for xx in [120,280,450,620,780]:
        draw.line([(xx,540),(xx,550)], fill=(100,100,110), width=1)

    # Parking layout like second reference - around building
    # Top parking
    for px in range(140,760,38):
        draw.rectangle([(px,60),(px+28,75)], outline=(150,150,160), width=1, fill=(230,230,235))
    # Side
    for py in range(120,400,32):
        draw.rectangle([(800,py),(815,py+22)], outline=(150,150,160), width=1)

    # Text
    f18 = get_font(16)
    f11 = get_font(11)
    f10 = get_font(10)
    draw.text((14,12), cfg["label"], fill=(255,255,255), font=f18)
    draw.text((740,14), "DEMO", fill=(160,160,160), font=f11)
    draw.text((280,608), "DEMO LISTING • Example Only • 10K SQ FT • Detailed Blueprint (Hypothetical)", fill=(255,255,255), font=f11)
    draw.text((260,548), "100' x 100' = 10,000 SQ FT • PRE-ENGINEERED METAL BUILDING • PARKING: 42 STALLS", fill=(80,80,90), font=f10)

    # Small detail notes like your first image
    draw.text((125,88), "W24x68 RAFTER", fill=(90,90,100), font=f10)
    draw.text((285,88), "W24x76 COLUMN", fill=(90,90,100), font=f10)
    draw.text((455,88), "16 GA PURLIN @24\" O.C.", fill=(90,90,100), font=f10)

    out = f"public/demo/{cat}_blueprint_demo.jpg"
    img.save(out, "JPEG", quality=88, optimize=True)
    print(f"Created {out} {os.path.getsize(out)//1024}KB")

print("All 7 detailed blueprints in public/demo/")

# Seed Supabase 8 per category
env={}
with open(".env.local") as f:
 for l in f:
  if "=" in l and not l.strip().startswith("#"):
   k,v=l.strip().split("=",1)
   env[k.strip()]=v.strip().strip('"').strip("'")
url=env.get("NEXT_PUBLIC_SUPABASE_URL")
key=env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
if not url:
    print("No Supabase env - images created locally only")
    exit(0)
h={"apikey":key,"Authorization":f"Bearer {key}","Content-Type":"application/json"}
import requests
try:
    requests.delete(f"{url}/rest/v1/listings?is_demo=eq.true", headers=h, timeout=10)
    print("Deleted old DEMO")
except Exception as e:
    print(e)

cats_full=["Office Space","Retail","Industrial","Warehouse","Medical Office","Restaurant","Plaza"]
city_map={"Office Space":"Brampton","Retail":"Mississauga","Industrial":"Vaughan","Warehouse":"Caledon","Medical Office":"Brampton","Restaurant":"Toronto","Plaza":"Brampton"}
rows=[]
for cat in cats_full:
  base=cat.split()[0].lower()
  if "medical" in cat.lower(): base="medical"
  for i in range(1,9):
    rows.append({
      "title": f"{cat} - 10K #{i}",
      "city": city_map[cat],
      "province":"ON","country":"Canada",
      "area":10000,"sqft":10000,"price":random.choice([7500,8500,9500]),
      "description":f"DEMO LISTING - Detailed blueprint",
      "images":[f"/demo/{base}_blueprint_demo.jpg"],
      "contact":"Demo","email":"demo@commercial.local",
      "type":cat,"is10k":True,"verified":False,"is_demo":True,
      "address": f"{100+i} {cat} Blvd"
    })
r=requests.post(f"{url}/rest/v1/listings", headers={**h,"Prefer":"return=minimal"}, data=json.dumps(rows))
print("Seed:", r.status_code, "56 listings" if r.status_code in [200,201,204] else r.text[:400])
