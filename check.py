import requests, json, os
env={}
with open(".env.local") as f:
 for l in f:
  if "=" in l and not l.strip().startswith("#"):
   k,v=l.strip().split("=",1)
   env[k.strip()]=v.strip().strip('"').strip("'")
url=env["NEXT_PUBLIC_SUPABASE_URL"]
key=env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
h={"apikey":key,"Authorization":f"Bearer {key}"}
r=requests.get(f"{url}/rest/v1/listings?is_demo=eq.true&limit=1", headers=h)
print(json.dumps(r.json()[0]["images"], indent=2))
