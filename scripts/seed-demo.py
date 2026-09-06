import requests, random, json
env={}
with open(".env.local") as f:
  for l in f:
    if "=" in l and not l.strip().startswith("#"):
      k,v=l.strip().split("=",1)
      env[k.strip()]=v.strip().strip('"').strip("'")
url=env["NEXT_PUBLIC_SUPABASE_URL"]
key=env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
h={"apikey":key,"Authorization":f"Bearer {key}","Content-Type":"application/json"}
# delete old demo
requests.delete(f"{url}/rest/v1/listings?is_demo=eq.true", headers=h)
print("Deleted old DEMO")

imgs=[
 ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
 ["https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800"],
 ["https://images.unsplash.com/photo-1497366811353-26e6f6d2fa42?w=800"],
 ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"],
 ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800"]
]
cities=["Brampton","Mississauga","Vaughan","Toronto"]
rows=[]
for i in range(70):
  rows.append({
    "title": f"Brampton Gateway 10K #{i+1}",
    "city": random.choice(cities),
    "province": "ON",
    "country": "Canada",
    "area": 10000,
    "sqft": 10000,
    "price": 8500,
    "description": "DEMO LISTING - Example Only. Real listing will show here.",
    "images": random.choice(imgs),
    "contact": "Demo",
    "email": "demo@commercial.local",
    "type": "Office",
    "is10k": True,
    "verified": False,
    "is_demo": True,
    "address": f"{100+i} Gateway Blvd"
  })

r=requests.post(f"{url}/rest/v1/listings", headers={**h,"Prefer":"return=minimal"}, data=json.dumps(rows))
print(r.status_code, r.text[:1000])
if r.status_code in [200,201,204]:
  print("✅ 70 DEMO LISTING • Example Only SEEDED")
