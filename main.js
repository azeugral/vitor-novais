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

  /* ---------- HERO: galeria dourada; cada peça cobre a anterior em tinta (borda molhada, cinza e depois a cor) ---------- */
  var DEST = ['silencio','asa','poseidon','guerreira','fenix','catrina','leao','carneiro'];
  var byS = {}; P.forEach(function (p) { byS[p[0]] = p; });
  var cache = {};
  function carrega(s) {
    if (!cache[s]) {
      cache[s] = new Promise(function (r) {
        var i = new Image();
        i.onload = function () { r(i); }; i.onerror = function () { r(null); };
        i.src = src(s);
      });
    }
    return cache[s];
  }
  DEST.forEach(carrega);

  var RUIDO = 'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}' +
    'float fb(vec2 p){float a=.5,r=0.;for(int k=0;k<5;k++){r+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return r;}';
  var VS = 'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;uv.y=1.-uv.y;gl_Position=vec4(p,0.,1.);}';
  var FS = ['precision highp float;varying vec2 uv;uniform sampler2D A,B;uniform float s;uniform vec2 c0;', RUIDO,
    'const vec3 LUM=vec3(.299,.587,.114);',
    'vec3 cinza(vec3 c){float l=dot(c,LUM);l=smoothstep(-.02,1.03,l);return vec3(pow(l,1.1))*vec3(1.,.985,.96);}',
    'void main(){',
    ' vec3 a=texture2D(A,uv).rgb; vec3 b=texture2D(B,uv).rgb;',
    ' vec2 q=(uv-c0)*vec2(.8,1.); float di=length(q)*2.;',
    ' float r1=pow(clamp(s/4.6,0.,1.),.85)*2.15, r2=pow(clamp((s-1.9)/4.6,0.,1.),.85)*2.15;',
    ' float e1=di+(fb(q*3.6+vec2(2.,7.))-.5)*.42+(fb(q*16.)-.5)*.07;',
    ' float e2=di+(fb(q*3.1+vec2(9.,1.))-.5)*.46+(fb(q*14.+3.)-.5)*.08;',
    ' float m1=(1.-smoothstep(r1-.045,r1,e1))*step(.001,r1);',
    ' float m2=(1.-smoothstep(r2-.07,r2,e2))*step(.001,r2);',
    ' vec3 o=mix(a,cinza(b),m1); o=mix(o,b,m2);',
    ' float viva=step(.001,r1)*(1.-smoothstep(1.85,2.15,r1));',
    ' float rim=exp(-pow((e1-r1+.03)/.028,2.))*viva, bri=exp(-pow((e1-r1+.012)/.006,2.))*viva;',
    ' o*=1.-.5*rim; o+=bri*.1;',
    ' float vc=step(.001,r2)*(1.-smoothstep(1.85,2.15,r2)); float rc=exp(-pow((e2-r2+.04)/.05,2.))*vc;',
    ' o+=(o-vec3(dot(o,LUM)))*.25*rc;',
    ' gl_FragColor=vec4(o,1.);}'].join('\n');
  var VEL = 3.3, FIM = 6.6; // cerca de 2 s até a peça ficar inteira

  function TelaGL(el) {
    var c = document.createElement('canvas'); c.className = 'gl'; c.setAttribute('aria-hidden', 'true');
    var gl = c.getContext('webgl', { antialias: false, alpha: false }) || c.getContext('experimental-webgl');
    if (!gl) return null;
    function sh(t, f) { var o = gl.createShader(t); gl.shaderSource(o, f); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.bindAttribLocation(pr, 0, 'p'); gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    var bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    var uS = gl.getUniformLocation(pr, 's'), uC = gl.getUniformLocation(pr, 'c0');
    gl.uniform1i(gl.getUniformLocation(pr, 'A'), 0); gl.uniform1i(gl.getUniformLocation(pr, 'B'), 1);
    function tex() {
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([10, 9, 7, 255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }
    var tA = tex(), tB = tex(), st = { s: -1, c0: [.5, .5] }, raf = 0;
    el.appendChild(c);
    function desenha() {
      var d = Math.min(2, window.devicePixelRatio || 1), W = Math.max(1, Math.round(el.clientWidth * d)), H = Math.max(1, Math.round(el.clientHeight * d));
      if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
      gl.viewport(0, 0, W, H);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tA);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tB);
      gl.uniform1f(uS, st.s); gl.uniform2f(uC, st.c0[0], st.c0[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    desenha();
    return {
      troca: function (img) {
        var t = tA; tA = tB; tB = t; // a peça que estava vira a de baixo
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tB);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        st.c0 = [.38 + Math.random() * .24, .32 + Math.random() * .3];
        var t0 = performance.now(); cancelAnimationFrame(raf); st.s = 0;
        (function passo(now) {
          st.s = Math.min(FIM, Math.max(0, now - t0) / 1000 * VEL); desenha();
          if (st.s < FIM) raf = requestAnimationFrame(passo);
        })(t0);
      },
      desenha: desenha
    };
  }

  var telas = { c: document.querySelector('.q-centro .tela'), e: document.querySelector('.q-esq .tela'), d: document.querySelector('.q-dir .tela') };
  var G = {}, comGL = true;
  try { ['c', 'e', 'd'].forEach(function (k) { if (telas[k]) { G[k] = TelaGL(telas[k]); if (!G[k]) throw new Error('sem webgl'); } }); }
  catch (er) { comGL = false; document.querySelectorAll('.tela canvas.gl').forEach(function (x) { x.parentNode.removeChild(x); }); }
  if (comGL) {
    document.documentElement.classList.add('tem-gl');
    window.addEventListener('resize', function () { ['c', 'e', 'd'].forEach(function (k) { if (G[k]) G[k].desenha(); }); });
  }

  var placa = document.querySelector('.placa'), pt = document.querySelector('.placa-t'), pe = document.querySelector('.placa-e');
  var idx = 0, n = DEST.length;
  // reserva sem WebGL: máscara de tinta em CSS
  function porCSS(tela, s) {
    var base = tela.querySelector('.base'), topo = tela.querySelector('.topo');
    if (!base.getAttribute('src')) { base.src = src(s); return; }
    topo.classList.remove('entra'); void topo.offsetWidth;
    topo.src = src(s); topo.classList.add('entra');
    setTimeout(function () { base.src = src(s); topo.classList.remove('entra'); topo.removeAttribute('src'); }, 1200);
  }
  function por(k, s, atraso) {
    if (!telas[k]) return;
    carrega(s).then(function (img) {
      if (!img) return;
      setTimeout(function () { if (comGL) G[k].troca(img); else porCSS(telas[k], s); }, atraso || 0);
    });
  }
  function mostra(primeira) {
    var c = DEST[idx], e = DEST[(idx + n - 1) % n], d = DEST[(idx + 1) % n], info = byS[c];
    telas.c.querySelector('.base').alt = 'Tatuagem de Vitor Novais: ' + info[2];
    if (!primeira) {
      placa.classList.add('troca');
      setTimeout(function () { pt.textContent = info[2]; pe.textContent = EST[info[1]]; placa.classList.remove('troca'); }, 420);
    }
    // em onda: o quadro central primeiro, os laterais logo a seguir
    por('c', c, primeira ? 200 : 0); por('e', e, primeira ? 650 : 450); por('d', d, primeira ? 650 : 450);
  }
  mostra(true);
  function avanca() { idx = (idx + 1) % n; mostra(false); }
  var ciclo = setInterval(avanca, 5500);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { clearInterval(ciclo); ciclo = null; }
    else if (!ciclo) ciclo = setInterval(avanca, 5500);
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
