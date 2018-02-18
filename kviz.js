function wipeElement(el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

function loadData(callback) {
	while (true) {
		const nid = Math.floor(Math.random()*100);
		if (have.has(nid)) {
			continue;
		}
		
		fetch(`data/nahodne/${nid}.json`)
			.then((x) => x.json())
			.then(data => {
				stmts = stmts.concat(data);
				console.log(`mame ${stmts.length}`);
				console.log(`nahrano ${data.length} vyroku`);
				have.add(nid);
				if (callback) {
					callback();
				}
			})

		if (document.getElementById('nacitani')) {
			document.getElementById('nacitani').remove();
		}

		break;
	}
}

const onlyTrueUntrue = () => document.getElementById('jen-pravda-nepravda').checked;
const showAuthors = () => document.getElementById('ukaz-autora').checked;
// const justSomeone = () => document.getElementById('jen-vyroky-od').checked;

function showStatement() {
	const st = stmts[0];
	stmts = stmts.slice(1);

	if (stmts.length === 0) {
		console.log('dosly otazky'); // TODO: renderuj
		return;
	}

	if (stmts.length < 15) { return loadData(showStatement); }

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

	const txt = document.createElement('div');
	txt.innerHTML = st['vyrok'];
	vr.appendChild(txt);
	
	vr.appendChild(function() {
		let p = document.createElement('p');
		p.innerHTML = `<small><a href='${st.odkaz}'>Odkaz na výrok na Demagog.cz</a></small>`;
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
loadData(showStatement);

let seen = new Set();
let ls = localStorage.getItem('seen');
if (ls) {
	seen = new Set(ls.split(',').map((x) => parseInt(x, 10)))
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

