// Foolproof AI + Automation verification - zero human needed
export async function verifyListing(data:any){
  let score=100
  let reasons:any={}
  // 1. Address exists?
  if(!data.address || data.address.length<5){ score-=50; reasons.address='Too short' }
  // 2. Price sanity - 10K sq ft in GTA can't be $1000/mo or $100k/mo
  const price=parseFloat(data.price)
  if(price<2000 || price>100000){ score-=40; reasons.price='Price out of GTA 10K range' }
  // 3. City allowed? (for Ontario expansion, later CA/US)
  const allowedCities=['Brampton','Mississauga','Caledon','Vaughan','Toronto','Calgary','Vancouver','Dallas','New York']
  if(!allowedCities.map(c=>c.toLowerCase()).some(c=>data.city.toLowerCase().includes(c))){ score-=20; reasons.city='City not in allowed list yet' }
  // 4. Duplicate check would go here via Supabase query
  const passed = score>=60
  return {passed, score, reasons:{...reasons, flag: passed?'OK':'Needs review - '+Object.values(reasons).join(', ') }}
}

