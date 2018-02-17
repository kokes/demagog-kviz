import random
import json
import glob
import os
import shutil
from collections import defaultdict


# Napřed rozházíme výroky náhodně, stále jako NDJSON.

fns = glob.iglob('../data/raw/*.json')
nhdir = '../data/nahodne/'
shutil.rmtree(nhdir)

os.makedirs(nhdir, exist_ok=True)
tdir = os.path.join(nhdir, '{}.json')

pol = defaultdict(set)

for fn in fns:
    with open(fn) as f:
        for ln in f:
            dt = json.loads(ln)
            pol[dt['strana']].add(dt['autor'])
            tgid = dt['id'] % 100
            with open(tdir.format(tgid), 'a+') as fw:
                fw.write(ln)


# A teď je zpátky načtem, rozházíme mezi sebou (teď jsou řazeni podle autora) a uložíme jako seznam (kvůli klientskému JavaScriptu).

fns = glob.glob(os.path.join(nhdir, '*.json'))
for fn in fns:
    with open(fn) as f:
        dt = [json.loads(j) for j in f]
    
    random.shuffle(dt)

    with open(fn, 'w') as fw:
        json.dump(dt, fw, ensure_ascii=False)


# a konečně uložíme seznam politiků a stran
pol = { j: sorted(list(k)) for j,k in pol.items() }
with open('../data/politici.json', 'w') as fw:
    json.dump(pol, fw, ensure_ascii=False, indent=2)