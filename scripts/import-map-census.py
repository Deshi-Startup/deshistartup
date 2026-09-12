"""Extract checked BBS cells from pdftotext -layout files; offline extraction.
Usage: python3 scripts/import-map-census.py census.txt hies.txt
"""
import hashlib, json, os, re, sys
from datetime import datetime, timezone
from pathlib import Path
root=Path(__file__).resolve().parents[1]
retrieved=os.environ.get('MAPS_RETRIEVED_AT', datetime.now(timezone.utc).date().isoformat())
assert re.fullmatch(r'\d{4}-\d{2}-\d{2}', retrieved), 'MAPS_RETRIEVED_AT must use YYYY-MM-DD'
raw=Path(sys.argv[1]).read_bytes(); pages=raw.decode().split('\f')
regions=json.loads((root/'data/maps/regions.json').read_text())['regions']
def key(s): return re.sub('[^a-z]', '', s.lower()).replace('chittagong','chattogram').replace('comilla','cumilla').replace('barisal','barishal').replace('jessore','jashore').replace('bogra','bogura').replace('chapainawabganj','nawabganj').replace('jhenaidah','jhenaidaha').replace('kishoregonj','kishoreganj').replace('narayangonj','narayanganj').replace('netrokona','netrakona').replace('chapainababganj','nawabganj').replace('panchagarh','panchagar')
def table(first,last):
 rows={}
 for p in range(first,last+1):
  page=re.sub(r'Mymensingh\s*\n\s*([\d. ]+)\nDivision', r'Mymensingh Division \1', pages[p-1])
  page=re.sub(r'Mymensingh +([\d. ]+)\nDivision', r'Mymensingh Division \1', page)
  for line in page.splitlines():
   if first==404 and '15 Years and above' in line: return rows
   m=re.match(r'^\s*([A-Za-z][A-Za-z’\' .-]+?)\s+(\d.*)$',line)
   if m and re.fullmatch(r'[\d.\s]+',m[2]): rows[key(m[1])]=(list(map(float,m[2].split())),p)
 return rows
specs={'density':(191,192,-1),'population':(199,200,0),'urbanPopulation':(199,200,8),'literacy':(313,314,0),'students':(317,318,None),'internet':(404,405,0),'financial':(407,408,0),'mobileBanking':(409,410,0)}
tables={k:table(a,b) for k,(a,b,i) in specs.items()}
out={}
for r in regions:
 row={}
 for metric,(a,b,col) in specs.items():
  name=r['name']['en']+(' Division' if r['level']=='division' else '')
  assert key(name) in tables[metric], (metric,name,list(tables[metric]))
  cells,p=tables[metric][key(name)]
  row[metric]=sum(cells[:2]) if col is None else cells[col]
  row[metric+'Page']=p
 row['urban']=round(100*row['urbanPopulation']/row['population'],4)
 row['urbanPage']=row['populationPage']
 out[r['id']]=row
hraw=Path(sys.argv[2]).read_bytes();hpages=hraw.decode().split('\f')
for line in hpages[71].splitlines():
 m=re.search(r'\b(Barishal|Chattogram|Dhaka|Khulna|Mymensingh|Rajshahi|Rangpur|Sylhet)\s+([\d,]+)\s+([\d,]+)',line)
 if m:
  match=next((r for r in regions if r['level']=='division' and key(r['name']['en'])==key(m[1])),None)
  if match: out[match['id']].update(income=int(m[2].replace(',','')),consumption=int(m[3].replace(',','')),incomePage=72,consumptionPage=72)
assert sum(out[r['id']]['population'] for r in regions if r['level']=='district')==165158616
assert sum(out[r['id']]['students'] for r in regions if r['level']=='district')==41518866
assert out['division-dhaka']['income']==42696 and out['division-dhaka']['consumption']==37935
assert all('income' in out[r['id']] for r in regions if r['level']=='division')
result={'observation':2022,'retrieved':retrieved,'censusPublication':'2023-11; revised 2024-01','hiesPublication':'2023-12-14','inputSHA256':{'census':hashlib.sha256(raw).hexdigest(),'hies':hashlib.sha256(hraw).hexdigest()},'regions':out}
(root/'data/maps/census.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('Extracted all 72 regions and 8 division household means; national totals reconcile.')
