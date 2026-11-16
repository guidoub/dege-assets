
const S = 346, T = 15, C = 5.5, P = S + T, H = T / 2;
const LAP = 24, A = 30, W = 5, PUENTE = 4, PROF = 26, MARGEN = 6;
const YF = S / 2 - MARGEN, YT = -(S / 2 - MARGEN - PROF);   // cara de adelante de los conectores de adelante / de atrás
const ORD = ['primer', 'segundo', 'tercer', 'cuarto'];
const ORDF = ['Primera', 'Segunda', 'Tercera'];
const ORDM = ['Primer', 'Segundo', 'Tercer', 'Cuarto'];

const rect = (a, b, c, d) => [Math.min(a, b), Math.max(a, b), Math.min(c, d), Math.max(c, d)];

function unir(rects) {
  const xs = [...new Set(rects.flatMap((r) => [r[0], r[1]]))].sort((a, b) => a - b);
  const zs = [...new Set(rects.flatMap((r) => [r[2], r[3]]))].sort((a, b) => a - b);
  const lleno = (i, j) => {
    if (i < 0 || j < 0 || i >= xs.length - 1 || j >= zs.length - 1) return false;
    const cx = (xs[i] + xs[i + 1]) / 2, cz = (zs[j] + zs[j + 1]) / 2;
    return rects.some((r) => cx > r[0] && cx < r[1] && cz > r[2] && cz < r[3]);
  };
  const sig = new Map(), k = (i, j) => i + ',' + j;
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < zs.length - 1; j++) {
    if (!lleno(i, j)) continue;
    if (!lleno(i, j - 1)) sig.set(k(i, j), [i + 1, j]);
    if (!lleno(i + 1, j)) sig.set(k(i + 1, j), [i + 1, j + 1]);
    if (!lleno(i, j + 1)) sig.set(k(i + 1, j + 1), [i, j + 1]);
    if (!lleno(i - 1, j)) sig.set(k(i, j + 1), [i, j]);
  }
  const inicio = sig.keys().next().value, pts = [];
  let cur = inicio;
  do {
    const [i, j] = cur.split(',').map(Number);
    pts.push([xs[i], zs[j]]);
    const [ni, nj] = sig.get(cur);
    cur = k(ni, nj);
  } while (cur !== inicio && pts.length < 400);
  return pts.filter((p, n) => {
    const a = pts[(n - 1 + pts.length) % pts.length], b = pts[(n + 1) % pts.length];
    return !((a[0] === p[0] && p[0] === b[0]) || (a[1] === p[1] && p[1] === b[1]));
  });
}

const brazos = (J, q) => {
  const ci = [J[0] + q[0] * H, J[1] + q[1] * H];
  return [
    rect(ci[0], ci[0] + q[0] * A, ci[1], ci[1] + q[1] * W),
    rect(ci[0], ci[0] + q[0] * W, ci[1], ci[1] + q[1] * A),
    rect(ci[0] - PUENTE, ci[0] + PUENTE, ci[1] - PUENTE, ci[1] + PUENTE),
  ];
};
const esquina = (J, brazo, exterior) => {
  const rs = [[J[0] - H - (brazo.L ? 0 : C), J[0] + H + (brazo.R ? 0 : C), J[1] - H - (brazo.D ? 0 : C), J[1] + H + (brazo.U ? 0 : C)]];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    if (!exterior(sx, sz)) continue;
    const bx = sx > 0 ? brazo.R : brazo.L, bz = sz > 0 ? brazo.U : brazo.D;
    if (bx) rs.push(rect(J[0] + sx * H, J[0] + sx * (H + LAP), J[1] + sz * H, J[1] + sz * (H + C)));
    if (bz) rs.push(rect(J[0] + sx * H, J[0] + sx * (H + C), J[1] + sz * H, J[1] + sz * (H + LAP)));
    if (bx || bz) rs.push(rect(J[0] + sx * (H - 3), J[0] + sx * (H + C), J[1] + sz * (H - 3), J[1] + sz * (H + C)));
  }
  return rs;
};
const FORMA_SUELTA = unir([...brazos([0, 0], [1, 1]), ...esquina([0, 0], { R: true, U: true, L: false, D: false }, (sx, sz) => !(sx > 0 && sz > 0))]);

const cil = (id, pos, largo, r, mat = 'zinc', extra = {}) => ({ id, tipo: 'cilindro', pos, s0: 0, s1: largo, r, mat, seg: 18, ...extra });
const caja = (id, x0, x1, y0, y1, z0, alto, mat = 'madera') => ({ id, tipo: 'perfil', puntos: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], pos: [0, 0, z0], z0: 0, z1: alto, mat });
const manta = (w, d, extra = {}) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', ...extra });
const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const llave = (x, y) => [
  cil('llave.corto', [x, y, 3], 26, 3, 'zinc', { eje: [-1, 0, 0], seg: 12 }),
  cil('llave.largo', [x, y, 3], 82, 3, 'zinc', { eje: [0, 1, 0], seg: 12 }),
];
const cm = (v) => String(v).replace('.', ',');

export function cumo(cfg) {
  const celdas = cfg.celdas;
  const hay = (i, j) => celdas.some(([a, b]) => a === i && b === j);
  const is = celdas.map((c) => c[0]), js = celdas.map((c) => c[1]);
  const minI = Math.min(...is), maxI = Math.max(...is), maxJ = Math.max(...js);
  const xc = ((minI + maxI) / 2) * P;
  const hayH = (i, m) => hay(i, m - 1) || hay(i, m);      // placa horizontal i en el nivel m
  const hayV = (k, j) => hay(k - 1, j) || hay(k, j);      // placa parada entre las columnas k−1 y k, en el nivel j
  const zH = (m) => C + m * P;
  const jx = (kx) => (kx - 0.5) * P - xc, jz = (m) => zH(m) + H;
  const X0 = (minI - 0.5) * P - H - C - xc, X1 = (maxI + 0.5) * P + H + C - xc, Z1 = zH(maxJ + 1) + T + C;

  const placa = ({ t, a, b, id }) => t === 'h'
    ? caja(id, a * P - S / 2 - xc, a * P + S / 2 - xc, -S / 2, S / 2, zH(b), T)
    : caja(id, jx(a) - H, jx(a) + H, -S / 2, S / 2, zH(b) + T, S);
  const conector = (id, kx, m, q, frente, conEsquina) => {
    const J = [jx(kx), jz(m)];
    const brazo = { R: hayH(kx, m), L: hayH(kx - 1, m), U: hayV(kx, m), D: hayV(kx, m - 1) };
    const exterior = (sx, sz) => !hay(sx > 0 ? kx : kx - 1, sz > 0 ? m : m - 1);
    return { id, tipo: 'perfil', puntos: unir([...brazos(J, q), ...(conEsquina ? esquina(J, brazo, exterior) : [])]),
      pos: [0, frente ? YF : YT, 0], z0: 0, z1: PROF, mat: 'conector', rotacion: [90, 0, 0] };
  };

  const puestas = new Set(), esquinas = new Set(), partes = [];
  let piezas = [];
  celdas.forEach(([i, j], n) => {
    for (const parte of ['a', 'r']) {
      const quiero = parte === 'a' ? [['h', i, j], ['v', i, j], ['v', i + 1, j]] : [['h', i, j + 1]];
      const nuevas = [];
      for (const [t, a, b] of quiero) {
        const id = `p${t}.${a}_${b}`;
        if (!puestas.has(id)) { puestas.add(id); nuevas.push({ t, a, b, id }); }
      }
      const esq = parte === 'a' ? [['i', i, j, [1, 1]], ['d', i + 1, j, [-1, 1]]] : [['i', i, j + 1, [1, -1]], ['d', i + 1, j + 1, [-1, -1]]];
      const pref = `c${n}${parte}`, cons = [];
      for (const [lado, kx, m, q] of esq) for (const f of ['f', 't']) {
        const key = `${kx}_${m}_${f}`, primera = !esquinas.has(key);
        esquinas.add(key);
        cons.push(conector(`${pref}.${lado}.${f}.p`, kx, m, q, f === 'f', primera));
      }
      piezas = [...piezas, ...nuevas.map(placa), ...cons];
      partes.push({ n, i, j, parte, nuevas, pref, esq: esq[0], piezas: piezas.slice(), encima: parte === 'r' && hay(i, j + 1),
        baseNueva: nuevas.some((p) => p.t === 'h'), paradas: nuevas.filter((p) => p.t === 'v') });
    }
  });
  const completo = piezas, NP = puestas.size, NC = 8 * celdas.length, NA = partes.length + 2;
  const nEncima = partes.filter((p) => p.encima).length;
  let kEncima = 0;

  const VETAS = 'En madera kiri o atakama, alineá las vetas entre las placas: queda mejor.';
  const AJUSTE_B = ['Girá el tornillo de cada conector como el reloj hasta que las placas queden sujetas.', 'Sin forzar: alcanza con que no se muevan.'];
  const textos = (p, ultima) => {
    const ord = ORD[p.n];
    if (p.parte === 'a') {
      if (p.n === 0) return { titulo: celdas.length > 1 ? 'Primer cubo: base y costados' : 'Base y costados', titular: 'A un dedo del borde',
        a: ['Deslizá 2 conectores en cada costado de una placa, a un dedo del borde.', 'Encastrá una placa parada en cada costado.'],
        tip: 'Los conectores van flojos al principio: así las placas entran sin esfuerzo.' };
      if (!p.baseNueva) return { titulo: `${ORDM[p.n]} cubo: los costados`, titular: 'Dos conectores en cada borde',
        a: ['Deslizá 2 conectores a cada lado de la placa de arriba, a un dedo del borde.', 'Encastrá una placa parada en cada costado.'],
        tip: 'En ese borde quedan 2 conectores juntos: uno de cada cubo.' };
      return { titulo: `${ORDM[p.n]} cubo, al costado`, titular: 'El costado del medio ya está',
        a: ['Apoyá otra placa al lado de la base, con 2 conectores en cada costado.', p.paradas.length === 1 ? 'El costado del medio ya está: encastrá solo la placa parada de afuera.' : 'Encastrá una placa parada en cada costado.'],
        tip: 'Del lado del medio, los conectores de los dos cubos van uno al lado del otro.' };
    }
    if (p.encima) {
      kEncima++;
      return { titulo: nEncima > 1 ? `${ORDF[kEncima - 1]} placa del medio` : 'La placa del medio', titular: 'El piso del cubo de arriba',
        a: ['Deslizá 2 conectores arriba de cada costado, a un dedo del borde.', 'Apoyá una placa encima: es el piso del cubo que va arriba.'],
        tip: 'Esta placa la comparten los dos cubos: no hace falta otra.' };
    }
    return { titulo: ultima ? 'La tapa' : `Tapa del ${ord} cubo`, titular: 'Cerrá el cubo',
      a: ['Deslizá 2 conectores arriba de cada costado, a un dedo del borde.', 'Apoyá una placa encima y encastrala en los conectores.'],
      tip: ultima ? VETAS : 'Ajustá sin forzar: el conector sostiene la placa, no hace falta apretar fuerte.' };
  };

  const VISTA = cfg.vista || { yaw: -26, pitch: 24 };
  const escenaParte = (p, k) => {
    const num = k + 2, tx = textos(p, k === partes.length - 1);
    const ids = p.nuevas.map((x) => x.id);
    const front = [`${p.pref}.i.f`, `${p.pref}.d.f`], back = [`${p.pref}.i.t`, `${p.pref}.d.t`];
    const mueven = [];
    const base = p.nuevas.find((x) => x.t === 'h');
    if (base) mueven.push(mover(base.id, p.parte === 'a' ? 110 : 140, [0, 0, 1], p.parte === 'a' ? 0 : .5));
    const dc = p.parte === 'a' && base ? .4 : 0;
    mueven.push(mover(front, 70, [0, 1, 0], dc), mover(back, 70, [0, -1, 0], dc));
    for (const v of p.paradas) mueven.push(mover(v.id, 140, [v.a === p.i ? -1 : 1, 0, 0], dc + .5));
    const [, kx, m, q] = p.esq, ci = [jx(kx) + q[0] * H, jz(m) + q[1] * H];
    return {
      num, id: `parte-${k}`, grupo: 'Armado', titulo: `${num}. ${tx.titulo}`, titular: tx.titular,
      subs: { a: tx.a, b: AJUSTE_B, tip: tx.tip },
      usa: [...(ids.length ? [`1 · Placa${ids.length > 1 ? 's ×' + ids.length : ''}`] : []), '2 · Conectores ×4', 'A · Llave Allen'],
      hw: { 2: 4 }, cuenta: { fijo: `Paso ${num} de ${NA}` }, vista: VISTA,
      piezas: [manta(Math.max(900, X1 - X0 + 500), 760), ...p.piezas], resaltar: [...ids, p.pref], mueven,
      fases: {
        pieza: [...ids, p.pref], hw: [p.pref], retener: [], ocultarEnA: [],
        ref: `${p.pref}.i.f`, vistaB: { yaw: -14, pitch: 14 }, titularB: 'Ajustá sin forzar',
        herramienta: { tipo: 'allen', pos: [ci[0] + q[0] * 4, YF, ci[1] + q[1] * 4], eje: [q[0] * 0.45, 0.75, q[1] * 0.45] },
      },
    };
  };

  const pilas = Math.ceil(NP / 5), porPila = Array.from({ length: pilas }, (_, k) => Math.floor(NP / pilas) + (k < NP % pilas ? 1 : 0));
  const ordenPiezas = () => {
    const out = [manta(pilas * (S + 70) + 340, S + 260, { pos: [-90, 0, 0] })];
    porPila.forEach((cant, p) => {
      const x = (p - (pilas - 1) / 2) * (S + 70) + 60;
      for (let k = 0; k < cant; k++) out.push(caja(`pz.1.${p}.${k}`, x - S / 2, x + S / 2, -S / 2 + 20, S / 2 + 20, k * (T + .8), T));
    });
    const xb = -((pilas - 1) / 2) * (S + 70) - S / 2 - 120;
    out.push({ id: 'rotulo.1', tipo: 'texto', txt: `1 · PLACAS ×${NP}`, pos: [60, S / 2 + 70, .3], alto: 30 },
      { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 150, d: 120, r: 22, pos: [xb, 30, 0], z0: 0, z1: 22, mat: 'bolsa' },
      { id: 'rotulo.2', tipo: 'texto', txt: `2 · CONECTORES ×${NC}`, pos: [xb, -60, .3], alto: 20 },
      ...llave(xb - 10, 150).map((x) => ({ ...x, id: 'pz.A.' + x.id })),
      { id: 'rotulo.A', tipo: 'texto', txt: 'A · LLAVE', pos: [xb, 250, .3], alto: 20 });
    return out;
  };
  const herrajesPiezas = () => {
    const cols = 8, out = [manta(700, 140 + 75 * Math.ceil(NC / cols), { lineas: 0 })];
    for (let k = 0; k < NC; k++) {
      const x = 205 - (k % cols) * 60, y = -20 + (Math.floor(k / cols) - (Math.ceil(NC / cols) - 1) / 2) * 72;
      out.push({ id: 'h.c.' + k, tipo: 'perfil', puntos: FORMA_SUELTA, pos: [x, y, 0], z0: 0, z1: PROF, mat: 'conector' });
    }
    out.push(...llave(-270, -40), { id: 'rotulo.2', tipo: 'texto', txt: '2', pos: [0, 30 + 36 * Math.ceil(NC / cols), .3], alto: 30 },
      { id: 'rotulo.A', tipo: 'texto', txt: 'A', pos: [-265, 30 + 36 * Math.ceil(NC / cols), .3], alto: 30 });
    return out;
  };
  const PZ = H + C, XS = [90, 30, -30, -90];
  const aflojarPiezas = () => [manta(560, 300, { lineas: 0 }),
    ...XS.map((x, k) => ({ id: 'h.c.' + k, tipo: 'perfil', puntos: FORMA_SUELTA, pos: [x - 10, 13, PZ], z0: 0, z1: PROF, mat: 'conector', rotacion: [90, 0, 0] }))];

  const nombre = cfg.nombre, sust = cfg.sust, art = cfg.art, A_ = art === 'la' ? 'a' : 'o';
  const altoCol = (i) => Math.max(...celdas.filter((c) => c[0] === i).map((c) => c[1]));
  const XH = altoCol(maxI) === maxJ ? X1 : X0, sh = XH === X1 ? 1 : -1;

  return {
    id: cfg.id, codigo: cfg.codigo, version: 1, pasosManual: NA,
    marca: {
      nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022',
      tienda: cfg.tienda, instagram: 'https://instagram.com/dege.muebles',
      confeti: ['#DDB98A', '#ffffff', '#1e1e1e', '#e9e4d6'],
    },
    materiales: {
      madera: { color: '#DDB98A' }, conector: { color: '#232323' }, zinc: { color: '#c9ced3' }, negro: { color: '#1a1a1a' },
      oscuro: { color: '#0d0d0d' }, carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 },
    },
    inventario: [{ id: '2', n: NC, label: '2 · Conectores' }],
    textos: {
      titulo: `Armá tu ${nombre} ${cfg.codigo} · DEGË Muebles`, cabecera: `${cfg.cabecera} ${cfg.codigo}`,
      ladoTitulo: `Tu ${sust}, <em>paso a paso</em>`,
      ladoCuerpo: cfg.ladoCuerpo,
      ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
      teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: `Arrastrá ${art} ${sust} para girarl${A_}`, girar: `Arrastrá para girar ${art} ${sust}`,
      portadaKicker: 'Manual de armado', portadaTitulo: `Armá tu <em>${sust}</em>, paso a paso`,
      datos: [['layers', `${NP} placas`, `+ ${NC} conectores`], ['steps', `${NA} pasos`, 'llave Allen incluida'], ['box', `${cm(cfg.medidas.w)} × ${cm(cfg.medidas.h)}`, 'cm · ancho y alto']],
      retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
      momKicker: 'Antes de arrancar', momTitulo: cfg.momTitulo, momCuerpo: 'Placas iguales y conectores: no hace falta taladro ni tornillos sueltos. La llave Allen viene en la caja.',
      momTips: [
        ['space', 'Hacé lugar', 'Una manta o el cartón de la caja en el piso'],
        ['kids', 'Placas iguales', `Las ${NP} placas son iguales: cualquiera va en cualquier lado`],
        ['time', 'Sin forzar', 'Los conectores se ajustan suave, sin apretar de más'],
        ['music', 'Y poné música', 'La que te acompañe mientras armás'],
      ],
      momCta: 'Empezar a armar',
      finTitulo: `¡Tu ${sust} <em>está list${A_}</em>! 🎉`,
      finCuerpo: cfg.finCuerpo,
      finTip: 'Guardá la llave Allen: si algún día lo querés en otra forma, se desarma igual de fácil. ¡Mandanos una foto cuando lo tengas armado!',
      waTexto: `¡Hola DEGË! Estoy armando ${art === 'la' ? 'la' : 'el'} ${nombre} ${cfg.codigo} y tengo una duda 😊`,
      pie: 'DEGË Muebles · Muebles de chapa y caño, de Rosario a todo el país.',
      rvEjemplos: ['Lo armé en minutos 🙌', 'Re claro el paso a paso', 'Quedó firme y prolijo', 'El color, tal cual la foto'],
    },
    cotas: { w: cfg.medidas.w, d: 34.6, h: cfg.medidas.h, unidad: 'cm', llenar: cfg.llenar ?? .64, caja: [X0, X1, -S / 2, S / 2, 0, Z1], lineas: [
      [[X1, S / 2, 0], [X0, S / 2, 0], [0, 150, 0], cfg.medidas.w],
      [[XH, sh * S / 2, 0], [XH, sh * S / 2, Z1], [sh * 70, 0, 0], cfg.medidas.h],   // del lado derecho de la pantalla, la arista de atrás (la de adelante tapa la cara lateral)
    ] },
    escenas: [
      { id: 'portada', grupo: 'Portada', vista: cfg.vistaPortada || { yaw: -24, pitch: 18 }, piezas: completo, mueven: [] },
      {
        id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
        subs: { a: [`Sacá todo de la caja: ${NP} placas, la bolsa con ${NC} conectores y la llave Allen.`, 'El número es el que vas a ver en cada paso.'], b: [], tip: 'Las placas son todas iguales: no hay arriba ni abajo.' },
        usa: [`1 · Placas ×${NP}`, `2 · Conectores ×${NC}`, 'A · Llave Allen'],
        elegir: [
          { m: ['pz.1'], t: `Son las ${NP} placas de melamina, todas iguales.` },
          { m: ['bolsa'], t: `En la bolsa vienen los ${NC} conectores: ${celdas.length > 1 ? '8 por cubo' : 'uno en cada esquina, adelante y atrás'}.` },
          { m: ['pz.A'], t: 'Es la llave Allen: con ella aflojás y ajustás cada conector.' },
        ],
        cuenta: { fijo: `${NP} placas · ${NC} conectores` }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 },
        piezas: ordenPiezas(), resaltar: [`pz.1.0.${porPila[0] - 1}`], mueven: [mover(`pz.1.0.${porPila[0] - 1}`, 90)],
      },
      {
        id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los conectores', titular: 'Contá antes de armar',
        subs: { a: [`Son ${NC} conectores y la llave Allen.`, 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'Cada conector tiene un tornillo: lo aflojás y lo ajustás con la llave.' },
        usa: ['A · Llave Allen incluida'], check: [[NC, '2 · Conectores'], [1, 'A · Llave Allen']],
        cuenta: { fijo: `${NC} conectores · 1 llave` }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
        piezas: herrajesPiezas(), resaltar: ['llave'], mueven: [mover('llave', 110)],
      },
      {
        num: 1, id: 'aflojar', grupo: 'Armado', titulo: '1. Aflojá los conectores', titular: 'Que se muevan libres',
        subs: { a: ['Con la llave Allen, girá el tornillo de cada conector al revés del reloj.', 'Aflojalo hasta que las piezas del conector se muevan libres.'],
          b: [`Hacelo con los ${NC} antes de empezar: después es más cómodo.`], tip: 'No hace falta sacar el tornillo: alcanza con aflojarlo.' },
        usa: ['2 · Conectores', 'A · Llave Allen'], cuenta: { fijo: `Paso 1 de ${NA}` }, vista: { yaw: -14, pitch: 20 },
        piezas: aflojarPiezas(), resaltar: ['h.c'], mueven: [mover('h.c', 40, [0, 0, 1], 0)], zoom: .5,
        fases: {
          pieza: ['h.c'], hw: ['h.c.0'], retener: [], ocultarEnA: [],
          ref: 'h.c.0', vistaB: { yaw: -14, pitch: 16 }, titularB: 'Al revés del reloj',
          herramienta: { tipo: 'allen', pos: [XS[0] - 10 + H + 4, 13, PZ + H + 4], eje: [0.45, 0.75, 0.45] },
        },
      },
      ...partes.map(escenaParte),
      {
        num: NA, id: 'revisar', grupo: 'Armado', titulo: `${NA}. Revisá que esté firme`, titular: 'Que no se mueva nada',
        subs: { a: [`Repasá los ${NC} conectores con la llave.`, 'Si alguna placa se mueve, ajustá un poco más, sin forzar.'], b: [], tip: VETAS },
        usa: ['A · Llave Allen'], cuenta: { fijo: `Paso ${NA} de ${NA}` }, sinFantasma: true, vista: { yaw: -34, pitch: 18 },
        piezas: [manta(Math.max(900, X1 - X0 + 500), 760), ...completo], resaltar: partes.map((p) => p.pref), mueven: [],
      },
      { id: 'fin', grupo: 'Listo', vista: cfg.vistaPortada || { yaw: -24, pitch: 16 }, piezas: completo, mueven: [] },
    ],
  };
}
