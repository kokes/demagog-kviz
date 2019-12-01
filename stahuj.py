import json
import os
import tempfile
from collections import defaultdict
from urllib.request import urlopen, Request
from urllib.parse import urlencode

graphql_query = '''
{
  statements(limit: 100, offset: $offset) {
    id
    content
    assessment {
      id
      explanationHtml
      veracity {
        id
        name
      }
    }
    source {
      id
      sourceUrl
      medium {
        id
        name
      }
      releasedAt
    }
    speaker {
      id
      firstName
      lastName
      memberships {
        id
        body {
          id
          name
        }
      }
    }
  }
}
'''

if __name__ == '__main__':
    url = 'https://demagog.cz/graphql'
    tmpdir = tempfile.TemporaryDirectory()
    tdir = 'data/nahodne'

    autori = defaultdict(set)

    nbuckets = 256

    offset = 0
    while True:
        query = {'query': graphql_query.replace('$offset', str(offset))}
        data = urlencode(query).encode()
        r = Request(url, data=data)
        r.add_header('User-Agent', 'https://github.com/kokes/demagog-kviz')
        rh = urlopen(r)

        resp = json.load(rh)
        statements = resp['data']['statements']
        if len(statements) == 0:
            break

        for statement in statements:
            fnid = int(statement['id']) % nbuckets
            tfn = os.path.join(tmpdir.name, f'{fnid}.json')

            with open(tfn, 'a+', encoding='utf8') as fw:
                json.dump(statement, fw, ensure_ascii=False)
                fw.write('\n')

        offset += len(statements)

    for bc in range(nbuckets):
        tfn = os.path.join(tmpdir.name, f'{bc}.json')
        stmts = []
        with open(tfn) as f:
            for ln in f:
                statement = json.loads(ln)
                if not statement['assessment']['veracity']:
                    print('vyrok', statement['id'], 'nema hodnoceni')
                    continue

                autor = '{} {}'.format(
                    statement['speaker']['firstName'], statement['speaker']['lastName'])
                strana = ', '.join([mm['body']['name']
                                    for mm in statement['speaker']['memberships']])
                autori[strana].add(autor)
                reformatted = {
                    'id': statement['id'],
                    'autor': autor,
                    'strana': strana,
                    'vyrok': statement['content'],
                    'oduvodneni': statement['assessment']['explanationHtml'],
                    'hodnoceni': statement['assessment']['veracity']['name'],
                    'porad': {
                        'datum': statement['source']['releasedAt'],
                        'medium': statement['source']['medium']['name'],
                        'url': statement['source']['sourceUrl'],
                    },
                }
                stmts.append(reformatted)

        stmts.sort(key=lambda x: int(x['id']))

        tfn = os.path.join(tdir, f'{bc}.json')
        with open(tfn, 'w', encoding='utf8') as fw:
            json.dump(stmts, fw, indent=2, ensure_ascii=False)

    autori = {k: sorted(list(v)) for k, v in autori.items()}
    with open('data/politici.json', 'w', encoding='utf8') as fw:
        json.dump(autori, fw, indent=2, ensure_ascii=False)
