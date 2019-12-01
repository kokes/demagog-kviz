function wipeElement(el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

async function loadData() {
	while (true) {
		const nid = Math.floor(Math.random()*256);
		if (have.has(nid)) {
			continue;
		}

		if (document.getElementById('nacitani')) {
			document.getElementById('nacitani').remove();
		}
		
		return fetch(`data/nahodne/${nid}.json`)
			.then((x) => x.json())
			.then(data => {
				have.add(nid);
				return data;
			})

		break;
	}
}

const onlyTrueUntrue = () => document.getElementById('jen-pravda-nepravda').checked;
const showAuthors = () => document.getElementById('ukaz-autora').checked;
// const justSomeone = () => document.getElementById('jen-vyroky-od').checked;

async function showStatement() {
	if (stmts.length < 15) {
		stmts.push(...await loadData());
	}
	const st = stmts.pop();

	if (onlyTrueUntrue() && (st.hodnoceni === 'zavádějící' || st.hodnoceni === 'neověřitelné')) {
		return showStatement();
	}

	// if (justSomeone() && (st.autor !== document.getElementById('jen-osoba').value)) {
	// 	return showStatement();
	// }

	// preskocit videne vyroky
	if (seen.has(st['id'])) {
		return showStatement();
	}
	seen.add(st['id']);
	localStorage.setItem('seen', Array.from(seen));

	if (document.getElementById('vyrok-obsah')) {
		document.getElementById('vyrok-obsah').remove();
	}

	const tg = document.getElementById('vyrok');

	const vr = document.createElement('div');
	vr.setAttribute('id', 'vyrok-obsah');

	if (showAuthors()) {
		const aut = document.createElement('h3');
		aut.innerText = `${st['autor']} (${st['strana']})`;
		vr.appendChild(aut);
	}

	const porad = document.createElement('div');
	porad.setAttribute('id', 'porad');
	
	let lnk = null;
	if (st['porad']['url']) {
		lnk = document.createElement('a');
		lnk.innerText = st['porad']['medium'];
		lnk.setAttribute('href', st['porad']['url']);	
	} else {
		lnk = document.createElement('span');
		lnk.innerText = st['porad']['medium'];
	}
	
	porad.innerHTML = `<strong>Zdroj: </strong>`;
	porad.appendChild(lnk);

	const datum = document.createElement('div');
	datum.innerHTML = `<br /><strong>Datum:</strong> ${st['porad']['datum']}`;

	porad.appendChild(datum);
	

	vr.appendChild(porad);

	const txt = document.createElement('div');
	txt.setAttribute('id', 'vyrok-text');
	txt.innerHTML = `<strong>Výrok</strong>:<br /> ${st['vyrok']}`;
	vr.appendChild(txt);
	
	vr.appendChild(function() {
		let p = document.createElement('p');
		const link = `https://demagog.cz/vyrok/${st.id}`
		p.innerHTML = `<small><a href='${link}'>Odkaz na výrok na Demagog.cz</a></small>`;
		return p;
	}());

	let tl = document.createElement('div');
	tl.setAttribute('id', 'tlacitka');

	for (let el of ['pravda', 'nepravda', 'zavádějící', 'neověřitelné']) {
		if (onlyTrueUntrue() && !(el === 'pravda' || el === 'nepravda')) {
			continue;
		}

		tl.appendChild(function() {
			let btn = document.createElement('button');
			btn.innerText = el;
			btn.value = (st['hodnoceni'] === el) ? 'spravne' : 'spatne';
			btn.setAttribute('id', `btn-${el.slice(0, 3)}`);
			btn.addEventListener('click', function(e) {
				if (st['hodnoceni'] === el) {
					e.target.className = 'spravne';
				} else {
					document.querySelector('div#tlacitka button[value=spravne]').className = 'spravne';
					e.target.className = 'spatne';
				}
				
				vr.appendChild(function() {
					if (document.getElementById('oduvodneni')) {
						document.getElementById('oduvodneni').remove();
					}
					let expl = document.createElement('div');
					expl.setAttribute('id', 'oduvodneni');
					expl.innerHTML = st.oduvodneni;
					return expl;
				}());
			});
			return btn;
		}());
	}
	
	vr.appendChild(tl);
	vr.appendChild(function() {
		let btn = document.createElement('button');
		btn.setAttribute('id', 'btn-dalsi');
		btn.innerText = 'Další/přeskočit';
		btn.addEventListener('click', (e) => showStatement());
		return btn;
	}());
	
	tg.appendChild(vr);
}

// ----------

let stmts = [];
let have = new Set(); // what datasets we've downloaded
showStatement();

let seen = new Set();
let ls = localStorage.getItem('seen');
if (ls) {
	seen = new Set(ls.split(','))
}

document.addEventListener('keypress', function(e) {
	const kmp = {
		112: 'btn-pra',
		110: 'btn-nep',
		117: 'btn-neo',
		122: 'btn-zav',
		100: 'btn-dalsi'

	};

	if (kmp[e.keyCode] !== undefined) {
		document.getElementById(kmp[e.keyCode]).click();
	}
});

// fetch('data/politici.json')
// 	.then((x) => x.json())
// 	.then(data => {
// 		const tg = document.getElementById('jen-strana');
// 		const tgo = document.getElementById('jen-osoba');
// 		for (let el of Object.keys(data).sort()) {
// 			tg.appendChild(function() {
// 				let op = document.createElement('option');
// 				op.innerText = el;
// 				return op;
// 			}());
// 		}

// 		tg.addEventListener('change', function(e) {
// 			wipeElement(tgo);
// 			for (let el of data[e.target.value]) {
// 				tgo.appendChild(function() {
// 					let op = document.createElement('option');
// 					op.innerText = el;
// 					return op;
// 				}());
// 			}
// 		})

// 		var event = new Event('change');
// 		tg.dispatchEvent(event);
// 	})

