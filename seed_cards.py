import json, requests, random
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
print("Deleted old DEMO")

map_file = {
 "Office Space": "office_space_blueprint_card.jpg",
 "Retail": "retail_store_layout_card.jpg",
 "Industrial": "industrial_blueprint_10k_sqft_card.jpg",
 "Warehouse": "warehouse_technical_blueprint_card.jpg",
 "Medical Office": "medical_clinic_floor_plan_card.jpg",
 "Restaurant": "restaurant_technical_blueprint_card.jpg",
 "Plaza": "plaza_technical_sheet_card.jpg",
}
city_map={"Office Space":"Brampton","Retail":"Mississauga","Industrial":"Vaughan","Warehouse":"Caledon","Medical Office":"Brampton","Restaurant":"Toronto","Plaza":"Brampton"}

rows=[]
for cat, fname in map_file.items():
  for i in range(1,9):
    rows.append({
      "title": f"{cat} - 10K #{i}",
      "city": city_map[cat],
      "province":"ON","country":"Canada",
      "area":10000,"sqft":10000,"price":random.choice([7500,8500,9500]),
      "description": f"DEMO LISTING - Colorful detailed blueprint - {cat}",
      "images": [f"/demo/{fname}"],
      "contact":"Demo","email":"demo@commercial.local",
      "type":cat,"is10k":True,"verified":False,"is_demo":True,
      "address": f"{100+i} {cat} Blvd"
    })

r=requests.post(f"{url}/rest/v1/listings", headers={**h,"Prefer":"return=minimal"}, data=json.dumps(rows))
print(f"Seeded {len(rows)} listings: {r.status_code}")
