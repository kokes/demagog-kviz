from urllib.request import urlopen
from urllib.parse import urljoin, quote_plus
import lxml.html
from lxml import etree
import os
import unidecode
import json
import re
import time

burl = 'https://demagog.cz/vypis-recniku'


tdir = '../data/raw/'
os.makedirs(tdir, exist_ok=True)


mp = {
    'true': 'pravda',
    'untrue': 'nepravda',
    'unverifiable': 'neověřitelné',
    'misleading': 'zavádějící'
}


with urlopen(burl) as uf:
    ht = lxml.html.parse(uf).getroot()

# odkazy na stranky s politickymi stranami
strany = ht.cssselect('a[href^="/vypis-recniku/"]')

for el in strany:
    sn = el.text
    print(sn)
    sns = re.sub('\W+', '_', unidecode.unidecode(sn.lower())).strip('_')
    tfn = os.path.join(tdir, sns + '.json')
    if os.path.isfile(tfn):
        continue

    fw = open(tfn, 'w')

    str_url = urljoin(burl, el.attrib['href'])
    with urlopen(str_url) as uf:
        htp = lxml.html.parse(uf).getroot()

    politici = htp.cssselect('a[href^="/politici"]')

    for pp in politici:
        jmeno = pp.find('p').text
        print('\t', jmeno)
        urlp = urljoin(str_url, pp.attrib['href'])

        while True:
            time.sleep(3)
            with urlopen(urlp) as uf:
                htpv = lxml.html.parse(uf).getroot()

            for vyr in htpv.cssselect('article.s-speaker-statement'):
                q = etree.tostring(vyr.cssselect('p.quote')[0], encoding='unicode').strip()
                href = urljoin(urlp, vyr.cssselect('a.permalink')[0].attrib['href'])
                ex = etree.tostring(vyr.cssselect('div.explanation')[0], encoding='unicode')
                tf = [j for j in vyr.cssselect('p.veracity')[0].attrib['class'].split() if j != 'veracity']
                assert len(tf) == 1

                obj = {
                    'autor': jmeno,
                    'strana': sn,
                    'vyrok': q,
                    'oduvodneni': ex,
                    'hodnoceni': mp[tf[0]],
                    'odkaz': href
                }
                json.dump(obj, fw, ensure_ascii=False)
                fw.write('\n')

            fw.flush()
            pg = htpv.cssselect('nav.pagination span.next a')

            if len(pg) == 0:
                break

            urlp = urljoin(urlp, pg[0].attrib['href'])

    fw.close()
