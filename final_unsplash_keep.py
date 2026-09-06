import pathlib, re
p=pathlib.Path("src/app/page.tsx")
s=p.read_text()
# Ensure 4 per row
s=s.replace('grid-cols-1 md:grid-cols-2 lg:grid-cols-3','grid-cols-1 md:grid-cols-2 lg:grid-cols-4')
# Remove top DEMO badge, keep only bottom
s=re.sub(r'\{\(p as any\)\.is_demo && <div className="absolute top-[^>]*>DEMO</div>\}', '', s)
s=re.sub(r'\{\([^}]*title\.includes\("#"\)[^}]*\) && <div[^>]*>DEMO</div>\}', '', s)
p.write_text(s)
print("Kept Unsplash detailed images, 4 per row, bottom DEMO only")
