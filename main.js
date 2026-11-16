(function () {
  var EST = { bg: 'Black & Grey', blackwork: 'Blackwork', sketch: 'Sketch', fine: 'Fine Line' };
  // slug, estilo, título (títulos das legendas do Vitor)
  var P = [
    ['silencio','bg','Lótus, borboleta e silêncio'],['asa','bg','Asa e nuvens'],['poseidon','sketch','Poseidon'],
    ['guerreira','bg','Guerreira'],['fenix','fine','Fénix'],['catrina','bg','Catrina'],
    ['leao','bg','Leão'],['carneiro','bg','Carneiro'],['dados','bg','One life, one chance'],
    ['cruz-luz','bg','Cruz e luz'],['ornamental','blackwork','Ornamental'],['medusa','fine','Medusa'],
    ['rosas-anca','bg','Rosas'],['borboleta-lua','blackwork','Borboleta e lua'],['street-life','bg','Street Life'],
    ['gato','fine','Gato e flores'],['relogio','bg','Relógio'],['leao-sketch','sketch','Leão'],
    ['familia','bg','Família'],['arvore-sol','blackwork','Árvore e sol'],['anjo','sketch','Anjo'],
    ['ancora-louros','bg','Fuzileiros'],['rosas-braco','bg','Duas rosas'],['capacete','sketch','Capacete e geometria'],
    ['sol-lotus','fine','Sol e lótus'],['trash','sketch','Sketch'],['coroa','bg','Coroa'],
    ['borboleta-rosa','blackwork','Rosa e borboleta'],['aguia','blackwork','Águia'],['mae','fine','Mãe'],
    ['bulldog','bg','Bulldog francês'],['cruz-terco','bg','Cruz e terço'],['retrato','bg','Retrato'],
    ['pai-filho','sketch','Pai e filho'],['lirio','fine','Lírio'],['mandala-mao','blackwork','Mandala'],
    ['punhal-rosa','bg','Punhal e rosa'],['tio-patinhas','bg','Cartola'],['familia-costas','bg','Família'],
    ['serpente','bg','Serpente e punhal'],['rosas-coxa','bg','Rosas'],['borboleta','blackwork','Borboleta'],
    ['rosa-mao','bg','Rosa na mão'],['rosas-manga','bg','Rosas e serpente'],['ancora','bg','Âncora'],
    ['passaro','fine','Pássaro']
  ];
  var src = function (s) { return 'img/pecas/' + s + '.webp'; };

  /* ---------- HERO: galeria dourada, tinta a espalhar ---------- */
  var DEST = ['silencio','asa','poseidon','guerreira','fenix','catrina','leao','carneiro'];
  var byS = {}; P.forEach(function (p) { byS[p[0]] = p; });
  // pré-carrega tudo o que o hero usa
  DEST.forEach(function (s) { var i = new Image(); i.src = src(s); });
  var telas = {
    c: document.querySelector('.q-centro .tela'),
    e: document.querySelector('.q-esq .tela'),
    d: document.querySelector('.q-dir .tela')
  };
  var placa = document.querySelector('.placa'), pt = document.querySelector('.placa-t'), pe = document.querySelector('.placa-e');
  var idx = 0, n = DEST.length;
  function por(tela, s, alt) {
    if (!tela) return;
    var base = tela.querySelector('.base'), topo = tela.querySelector('.topo');
    if (!base.getAttribute('src')) { base.src = src(s); return; }
    topo.classList.remove('entra'); void topo.offsetWidth;
    topo.src = src(s); if (alt) topo.alt = alt;
    topo.classList.add('entra');
    setTimeout(function () { base.src = src(s); if (alt) base.alt = alt; topo.classList.remove('entra'); topo.removeAttribute('src'); }, 1200);
  }
  function mostra(primeira) {
    var c = DEST[idx], e = DEST[(idx + n - 1) % n], d = DEST[(idx + 1) % n];
    var info = byS[c];
    if (!primeira) {
      placa.classList.add('troca');
      setTimeout(function () { pt.textContent = info[2]; pe.textContent = EST[info[1]]; placa.classList.remove('troca'); }, 420);
    }
    por(telas.c, c, 'Tatuagem de Vitor Novais: ' + info[2]);
    por(telas.e, e); por(telas.d, d);
  }
  ['c', 'e', 'd'].forEach(function (k, j) {
    if (!telas[k]) return;
    var s = [DEST[0], DEST[n - 1], DEST[1]][j];
    if (k === 'c') { // a peça central entra com a tinta logo ao abrir
      var b = telas.c.querySelector('.base');
      b.removeAttribute('src');
      setTimeout(function () { b.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; por(telas.c, s, 'Tatuagem de Vitor Novais: ' + byS[s][2]); }, 250);
    } else telas[k].querySelector('.base').src = src(s);
  });
  var ciclo = setInterval(function () { idx = (idx + 1) % n; mostra(false); }, 5000);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { clearInterval(ciclo); ciclo = null; }
    else if (!ciclo) { ciclo = setInterval(function () { idx = (idx + 1) % n; mostra(false); }, 5000); }
  });

  /* ---------- PORTFÓLIO ---------- */
  var grelha = document.getElementById('grelha'), mais = document.getElementById('mais');
  var filtro = 'todos', limite = 24, lista = [];
  function desenha() {
    lista = P.filter(function (p) { return filtro === 'todos' || p[1] === filtro; });
    grelha.innerHTML = '';
    lista.slice(0, limite).forEach(function (p, i) {
      var f = document.createElement('figure'); f.className = 'peca'; f.tabIndex = 0;
      f.setAttribute('role', 'button'); f.setAttribute('aria-label', 'Ampliar: ' + p[2]);
      f.innerHTML = '<div class="pt"><img src="' + src(p[0]) + '" alt="' + p[2] + ', ' + EST[p[1]] + ', tatuagem de Vitor Novais" draggable="false"></div><figcaption>' + p[2] + '</figcaption>';
      f.addEventListener('click', function () { abre(i); });
      f.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abre(i); } });
      grelha.appendChild(f);
    });
    mais.parentNode.hidden = lista.length <= limite;
  }
  document.querySelectorAll('.filtros button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.filtros button').forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
      b.setAttribute('aria-selected', 'true'); filtro = b.dataset.f; limite = 24; desenha();
    });
  });
  mais.addEventListener('click', function () { limite += 24; desenha(); });
  desenha();

  /* ---------- LIGHTBOX ---------- */
  var lb = document.getElementById('lb'), li = document.getElementById('lb-img'), lt = document.getElementById('lb-t'), le = document.getElementById('lb-e'), atual = 0;
  function abre(i) { atual = i; poe(); lb.hidden = false; document.body.style.overflow = 'hidden'; document.getElementById('lb-x').focus(); }
  function poe() { var p = lista[atual]; li.src = src(p[0]); li.alt = p[2]; lt.textContent = p[2]; le.textContent = EST[p[1]]; }
  function fecha() { lb.hidden = true; document.body.style.overflow = ''; }
  document.getElementById('lb-x').addEventListener('click', fecha);
  document.getElementById('lb-ant').addEventListener('click', function () { atual = (atual + lista.length - 1) % lista.length; poe(); });
  document.getElementById('lb-seg').addEventListener('click', function () { atual = (atual + 1) % lista.length; poe(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) fecha(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') fecha();
    if (e.key === 'ArrowLeft') document.getElementById('lb-ant').click();
    if (e.key === 'ArrowRight') document.getElementById('lb-seg').click();
  });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) document.getElementById(dx < 0 ? 'lb-seg' : 'lb-ant').click(); tx = null; });
  document.getElementById('lb-quero').addEventListener('click', function () {
    var p = lista[atual];
    fecha();
    var ideia = document.getElementById('f-ideia');
    ideia.value = 'Gostei da peça "' + p[2] + '" (' + EST[p[1]] + ') do portefólio. Quero algo neste estilo.';
    var r = document.querySelector('input[name="estilo"][value="' + EST[p[1]] + '"]'); if (r) r.checked = true;
    document.getElementById('form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- PEDIDO → WHATSAPP ---------- */
  var NUM = '351923374359';
  var form = document.getElementById('form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(form), nome = (fd.get('nome') || '').trim();
    var erro = document.getElementById('f-erro');
    if (!nome) { erro.hidden = false; document.getElementById('f-nome').focus(); return; }
    erro.hidden = true;
    var L = ['Olá, Vitor! Sou *' + nome + '* e quero um orçamento.', '',
      '*Estilo:* ' + fd.get('estilo'),
      '*Cobertura:* ' + fd.get('cobertura'),
      '*Local:* ' + ((fd.get('local') || '').trim() || 'a definir'),
      '*Tamanho:* ' + fd.get('tamanho'),
      '*Disponibilidade:* ' + fd.get('disp')];
    var ideia = (fd.get('ideia') || '').trim();
    if (ideia) L.push('*Ideia:* ' + ideia);
    L.push('', '(pedido enviado pelo site)');
    window.open('https://wa.me/' + NUM + '?text=' + encodeURIComponent(L.join('\n')), '_blank', 'noopener');
  });
  document.getElementById('f-nome').addEventListener('input', function () { document.getElementById('f-erro').hidden = true; });

  /* ---------- entrada suave ao rolar ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('ok'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.sec-cab, .hist, .vitor-corpo, .linhas li, .estudio-corpo, .passos li, .form').forEach(function (el) { el.classList.add('revela'); io.observe(el); });
  }
})();
