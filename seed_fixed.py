import json, requests, random, os, pathlib
env={}
with open(".env.local") as f:
 for l in f:
  if "=" in l and not l.strip().startswith("#"):
   k,v=l.strip().split("=",1)
   env[k.strip()]=v.strip().strip('"').strip("'")
url=env["NEXT_PUBLIC_SUPABASE_URL"]
key=env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
h={"apikey":key,"Authorization":f"Bearer {key}","Content-Type":"application/json"}

# Delete old DEMO
requests.delete(f"{url}/rest/v1/listings?is_demo=eq.true", headers=h)
print("Deleted old DEMO")

# Check what cards you actually have
cards = [f for f in os.listdir("public/demo") if f.endswith("_card.jpg")]
print(f"Found cards: {cards}")

map_file = {
 "Office Space": "office_space_blueprint_card.jpg",
 "Retail": "retail_store_layout_card.jpg",
 "Industrial": "industrial_blueprint_10k_sqft_card.jpg",
 "Warehouse": "warehouse_technical_blueprint_card.jpg", # will create from industrial if missing
 "Medical Office": "medical_clinic_floor_plan_card.jpg",
 "Restaurant": "restaurant_technical_blueprint_card.jpg",
 "Plaza": "plaza_technical_sheet_card.jpg",
}

# Create warehouse from industrial if missing
if not os.path.exists("public/demo/warehouse_technical_blueprint_card.jpg"):
    import shutil
    if os.path.exists("public/demo/industrial_blueprint_10k_sqft_card.jpg"):
        shutil.copy("public/demo/industrial_blueprint_10k_sqft_card.jpg","public/demo/warehouse_technical_blueprint_card.jpg")
        print("Created warehouse card from industrial")

city_map={"Office Space":"Brampton","Retail":"Mississauga","Industrial":"Vaughan","Warehouse":"Caledon","Medical Office":"Brampton","Restaurant":"Toronto","Plaza":"Brampton"}

rows=[]
for cat, fname in map_file.items():
  if not os.path.exists(f"public/demo/{fname}"):
    print(f"Missing {fname}, skipping {cat}")
    continue
  for i in range(1,9):
    rows.append({
      "title": f"{cat} - 10K #{i}",
      "city": city_map[cat],
      "province":"ON","country":"Canada",
      "area":10000,"sqft":10000,"price":random.choice([7500,8500,9500]),
      "description": f"DEMO - Colorful detailed blueprint - {cat}",
      "images": [f"/demo/{fname}"], # each category its own colorful image
      "contact":"Demo","email":"demo@commercial.local",
      "type":cat,"is10k":True,"verified":False,"is_demo":True,
      "address": f"{100+i} {cat} Blvd"
    })

r=requests.post(f"{url}/rest/v1/listings", headers={**h,"Prefer":"return=minimal"}, data=json.dumps(rows))
print(f"Seeded {len(rows)} listings: {r.status_code} - {r.text[:200]}")

# Verify
r=requests.get(f"{url}/rest/v1/listings?is_demo=eq.true&select=type,images", headers=h)
from collections import Counter
c=Counter([x["type"] for x in r.json()])
print(f"Counts: {c}")
for x in r.json()[:3]:
  print(x["type"], x["images"])
