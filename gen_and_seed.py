from PIL import Image, ImageDraw, ImageFont
import os, json, random, pathlib, requests

# 1. Create 56 DEMO-burned images locally in public/demo
os.makedirs("public/demo", exist_ok=True)
os.makedirs("scripts", exist_ok=True)

font_path=None
for fp in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf","/usr/share/fonts/TTF/DejaVuSans.ttf","/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"]:
    if os.path.exists(fp):
        font_path=fp
        break

palettes={
    "office": [(228,228,228),(210,210,200)],
    "retail": [(235,235,235),(220,220,215)],
    "industrial": [(200,200,200),(180,180,180)],
    "warehouse": [(210,210,210),(190,190,190)],
    "medical": [(240,240,240),(225,225,225)],
    "restaurant": [(225,225,220),(210,210,205)],
    "plaza": [(230,230,230),(215,215,210)]
}

cats=["office","retail","industrial","warehouse","medical","restaurant","plaza"]
for cat in cats:
    base_color, floor_color = palettes[cat]
    for i in range(1,9):
        img = Image.new("RGB", (800,600), base_color)
        draw = ImageDraw.Draw(img)
        draw.rectangle([(0,380),(800,600)], fill=floor_color)
        for y in range(20,350,35):
            draw.line([(0,y),(800,y)], fill=(255,255,255), width=1)
        draw.rectangle([(0,0),(120,600)], fill=(int(base_color[0]*0.9), int(base_color[1]*0.9), int(base_color[2]*0.9)))
        draw.rectangle([(680,0),(800,600)], fill=(int(base_color[0]*0.85), int(base_color[1]*0.85), int(base_color[2]*0.85)))
        draw.rectangle([(200+ i*3,150),(600+ i*2,380)], outline=(180,180,180), width=2)
        d = ImageDraw.Draw(img, "RGBA")
        d.rectangle([(10,10),(110,38)], fill=(0,0,0,210))
        d.rectangle([(0,572),(800,600)], fill=(0,0,0,190))
        try:
            f = ImageFont.truetype(font_path, 18) if font_path else ImageFont.load_default()
            fs = ImageFont.truetype(font_path, 13) if font_path else ImageFont.load_default()
        except:
            f = ImageFont.load_default()
            fs = f
        d.text((22,14), "DEMO", fill=(255,255,255), font=f)
        d.text((255,577), "DEMO LISTING • Example Only", fill=(255,255,255), font=fs)
        d.text((20,545), f"{cat.upper()} • 10K #{i}", fill=(60,60,60), font=fs)
        img.save(f"public/demo/{cat}_{i}_demo.jpg", "JPEG", quality=85, optimize=True)

print(f"Created {len(list(pathlib.Path('public/demo').glob('*.jpg')))} images in public/demo/")

# 2. Create seed script
env={}
with open(".env.local") as f:
 for l in f:
  if "=" in l and not l.strip().startswith("#"):
   k,v=l.strip().split("=",1)
   env[k.strip()]=v.strip().strip('"').strip("'")
url=env.get("NEXT_PUBLIC_SUPABASE_URL")
key=env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
if not url:
    print("Missing.env.local")
    exit(1)
h={"apikey":key,"Authorization":f"Bearer {key}","Content-Type":"application/json"}
# delete old demo
try:
    r=requests.delete(f"{url}/rest/v1/listings?is_demo=eq.true", headers=h, timeout=10)
    print("Deleted old DEMO:", r.status_code)
except Exception as e:
    print("Delete error", e)

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
      "description":f"DEMO LISTING - {cat} Example - 10,000 SQ FT",
      "images":[f"/demo/{base}_{i}_demo.jpg"],
      "contact":"Demo","email":"demo@commercial.local",
      "type":cat,"is10k":True,"verified":False,"is_demo":True,
      "address": f"{100+i} {cat} Blvd"
    })

r=requests.post(f"{url}/rest/v1/listings", headers={**h,"Prefer":"return=minimal"}, data=json.dumps(rows))
print("Seed:", r.status_code, "Seeded 56 (8 per cat)" if r.status_code in [200,201,204] else r.text[:500])

# 3. Fix grid to 4 per row
p=pathlib.Path("src/app/page.tsx")
if p.exists():
    s=p.read_text()
    s=s.replace('grid-cols-1 md:grid-cols-2 lg:grid-cols-3','grid-cols-1 md:grid-cols-2 lg:grid-cols-4')
    s=s.replace('<span className="font-bold">AkalHomes</span>','<span className="font-bold">Commercial</span>')
    s=s.replace('PRODUCTION','Spaces • GTA West')
    # ensure DEMO fallback via title containing #
    if "(p.title.includes('#')" not in s:
        s=s.replace('(p as any).is_demo','(p.title.includes("#") || (p as any).is_demo)')
    p.write_text(s)
    print("Fixed page.tsx to 4 per row")
