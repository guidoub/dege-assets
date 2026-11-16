
const R = 140;                 // radio de cada chapa (Ø 28 cm)
const RP = 143;                // centro de la pata: sobre la oreja, apenas afuera del borde
const R_CANO = 11;             // caño Ø 22
const CHAPA = 2.5;
const PATA_PL = 12;            // regatón
const Z_ABAJO = PATA_PL + 90;                  // 102: chapa de abajo, sobre los pies de 9 cm
const Z_MEDIO = PATA_PL + 361;                 // 373: chapa del medio, sobre el caño de 36,1
const Z_ARRIBA = Z_ABAJO + CHAPA + 536;        // 640,5: chapa de arriba, sobre el caño de 53,6
const ALTO = Z_ARRIBA + CHAPA + 3.5;           // ≈ 646 con la cabeza del tornillo

const H_TRI = 2 * RP * Math.sqrt(3) / 2;
const P = { A: [RP, -H_TRI / 3], C: [-RP, -H_TRI / 3], B: [0, 2 * H_TRI / 3] };
const medio = (u, v) => [(P[u][0] + P[v][0]) / 2, (P[u][1] + P[v][1]) / 2];

const cil = (id, pos, s1, r, mat = 'chapa', extra = {}) => ({ id, tipo: 'cilindro', pos, s0: 0, s1, r, mat, seg: 28, ...extra });

function contorno(orejas) {
  const pts = [], RE = 15, n = 240;
  for (let k = 0; k < n; k++) {
    const t = (k / n) * 2 * Math.PI;
    let r = R;
    for (const a of orejas) {
      const f = Math.atan2(Math.sin(t - a), Math.cos(t - a)), s = RP * Math.sin(f);
      if (Math.abs(s) <= RE) r = Math.max(r, RP * Math.cos(f) + Math.sqrt(RE * RE - s * s));
    }
    pts.push([r * Math.cos(t), r * Math.sin(t)]);
  }
  return pts;
}
function chapaLibre(id, [x, y, z], a, mat = 'chapa') {
  const ang = [a, a + Math.PI];
  return {
    id, tipo: 'perfil', puntos: contorno(ang), pos: [x, y, z], z0: 0, z1: CHAPA, mat,
    huecos: ang.map((t) => ({ x: RP * Math.cos(t), y: RP * Math.sin(t), w: 9, d: 9, r: 4.5 })),
  };
}
const chapa = (id, u, v, z) => { const [x, y] = medio(u, v); return chapaLibre(id, [x, y, z], Math.atan2(P[u][1] - y, P[u][0] - x)); };

const pataPlastica = (id, [x, y], z = 0) => [cil(id, [x, y, z], PATA_PL, 9.5, 'negro')];
const esparrago = (id, [x, y], zUnion) => [cil(id, [x, y, zUnion - 15], 30, 4, 'zinc', { seg: 16 })];
const tornillo = (id, [x, y], z) => [
  cil(id + '.cana', [x, y, z], 18, 3, 'zinc', { eje: [0, 0, -1], seg: 16 }),
  cil(id + '.cabeza', [x, y, z], 3.5, 6.5, 'negro', { seg: 24 }),
  cil(id + '.hexagono', [x, y, z + 3.5], .2, 2.4, 'oscuro', { seg: 6, sinContorno: true, sinAristas: true }),
];

const pies = () => ['A', 'B'].flatMap((k) => [...pataPlastica('pata.' + k, P[k]), cil('cano9.' + k, [...P[k], PATA_PL], 90, R_CANO)]);
const espAbajo = () => ['A', 'B'].flatMap((k) => esparrago('esp.' + k, P[k], Z_ABAJO));
const chapaAbajo = () => [chapa('chapa.abajo', 'A', 'B', Z_ABAJO)];
const canosBase = () => [
  cil('cano536', [...P.A, Z_ABAJO + CHAPA], 536, R_CANO),
  cil('cano265.B', [...P.B, Z_ABAJO + CHAPA], Z_MEDIO - Z_ABAJO - CHAPA, R_CANO),
];
const pataC = () => [...pataPlastica('pata.C', P.C), cil('cano361', [...P.C, PATA_PL], 361, R_CANO), ...esparrago('esp.C', P.C, Z_MEDIO)];
const chapaMedio = () => [chapa('chapa.medio', 'B', 'C', Z_MEDIO)];
const tornilloMedio = () => tornillo('T.B', P.B, Z_MEDIO + CHAPA);
const canoArriba = () => [cil('cano265.C', [...P.C, Z_MEDIO + CHAPA], 265, R_CANO)];
const chapaArriba = () => [chapa('chapa.arriba', 'A', 'C', Z_ARRIBA)];
const tornillosArriba = () => ['A', 'C'].flatMap((k) => tornillo('T.' + k, P[k], Z_ARRIBA + CHAPA));

const paso1 = () => [...pies(), ...espAbajo(), ...chapaAbajo()];
const paso2 = () => [...paso1(), ...canosBase()];
const paso3 = () => [...paso2(), ...chapaMedio(), ...tornilloMedio(), ...pataC()];
const mesita = () => [...paso3(), ...canoArriba(), ...chapaArriba(), ...tornillosArriba()];

const manta = (w = 760, d = 700, extra = {}) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', pos: [0, 10, 0], ...extra });

const acostado = (id, x, y, largo) => cil(id, [x, y, R_CANO], largo, R_CANO, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1060, 700, { pos: [10, -10, 0] }),
  ...[0, 1, 2].map((i) => chapaLibre('pz.chapa.' + i, [-330, 40, i * (CHAPA + .6)], 0)),
  { id: 'rotulo.chapa', tipo: 'texto', txt: '5 · CHAPAS ×3', pos: [-330, 245, .3], alto: 40 },
  acostado('pz.c536', -110, -250, 536),
  { id: 'rotulo.c536', tipo: 'texto', txt: '4 · 53 CM', pos: [480, -250, .3], alto: 40 },
  acostado('pz.c361', -110, -170, 361),
  { id: 'rotulo.c361', tipo: 'texto', txt: '3 · 36 CM', pos: [305, -170, .3], alto: 40 },
  acostado('pz.c265.0', -110, -90, 265),
  acostado('pz.c265.1', -110, -35, 265),
  { id: 'rotulo.c265', tipo: 'texto', txt: '2 · 26 CM ×2', pos: [255, -62, .3], alto: 40 },
  acostado('pz.c9.0', -110, 60, 90),
  acostado('pz.c9.1', -110, 115, 90),
  { id: 'rotulo.c9', tipo: 'texto', txt: '1 · 9 CM ×2', pos: [40, 88, .3], alto: 40 },
  { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 230, d: 140, r: 26, pos: [270, 180, 0], z0: 0, z1: 22, mat: 'bolsa' },
  { id: 'rotulo.bolsa', tipo: 'texto', txt: 'HERRAJES', pos: [270, 290, .3], alto: 34 },
];

const herrajesPiezas = () => [
  manta(500, 330, { lineas: 0, pos: [0, 15, 0] }),
  ...[0, 1, 2].flatMap((i) => tornillo('h.T.' + i, [-190, -70 + i * 60], 3)).map((p) => p.id.endsWith('.cana') ? { ...p, eje: [1, 0, 0], pos: [p.pos[0], p.pos[1], 6.5] } : p.id.endsWith('.cabeza') ? { ...p, eje: [-1, 0, 0], pos: [p.pos[0], p.pos[1], 6.5] } : null).filter(Boolean),
  ...[0, 1, 2].map((i) => cil('h.esp.' + i, [-80, -70 + i * 60, 4], 30, 4, 'zinc', { eje: [1, 0, 0], seg: 16 })),
  ...[0, 1, 2].map((i) => cil('h.pata.' + i, [62, -70 + i * 60, 0], PATA_PL, 9.5, 'negro')),
  cil('llave.corto', [185, -50, 3], 26, 3, 'zinc', { eje: [-1, 0, 0], seg: 12 }),
  cil('llave.largo', [185, -50, 3], 82, 3, 'zinc', { eje: [0, 1, 0], seg: 12 }),
  { id: 'rotulo.T', tipo: 'texto', txt: 'A', pos: [-185, 140, .3], alto: 24 },
  { id: 'rotulo.E', tipo: 'texto', txt: 'B', pos: [-65, 140, .3], alto: 24 },
  { id: 'rotulo.P', tipo: 'texto', txt: 'C', pos: [62, 140, .3], alto: 24 },
  { id: 'rotulo.L', tipo: 'texto', txt: 'D', pos: [190, 140, .3], alto: 24 },
];

const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const afuera = (k) => { const [x, y] = P[k], l = Math.hypot(x, y); return [.97 * x / l, .97 * y / l, -.22]; };
const paso = (num, id, titulo, a, piezas, extra = {}) => ({
  num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de 9` },
  vista: { yaw: -28, pitch: 24 }, piezas, mueven: [], resaltar: [], encuadrarTodo: false, ...extra,
});

export default {
  id: 'ch07', version: 1, pasosManual: 9,
  marca: {
    nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022',
    tienda: 'https://dege.com.ar/productos/mesita-de-luz-3-pisos/', instagram: 'https://instagram.com/dege.muebles',
    confeti: ['#B0552F', '#ffffff', '#e9e4d6', '#1d1d1b'],
  },
  materiales: {
    chapa: { color: '#B0552F' }, zinc: { color: '#c9ced3' }, negro: { color: '#242424' }, oscuro: { color: '#111111' },
    carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 }, senal: { color: '#ff6a3d' },
  },
  inventario: [{ id: 'C', n: 3, label: 'C · Regatones' }, { id: 'B', n: 3, label: 'B · Espárragos' }, { id: 'A', n: 3, label: 'A · Tornillos Allen' }],
  textos: {
    titulo: 'Armá tu Mesita de luz 3 pisos · DEGË Muebles', cabecera: 'Mesita 3 pisos',
    ladoTitulo: 'Tu mesita de 3 pisos, <em>paso a paso</em>',
    ladoCuerpo: 'Tres chapas de 28 cm a tres alturas, sobre tres patas de caño. Seguí los 9 pasos del manual de fábrica y girá el modelo para ver cada unión.',
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá la mesita para girarla', girar: 'Arrastrá para girar la mesita',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>mesita de 3 pisos</em>, paso a paso',
    datos: [['layers', '9 piezas', '+ 9 herrajes'], ['person', '1 persona', 'alcanza'], ['clock', '10 minutos', 'llave incluida']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: 'Tu mesita,<br><em>en 10 minutos</em>', momCuerpo: 'Tres chapas, seis caños y una llave Allen: no necesitás otra herramienta.',
    momTips: [
      ['space', 'Hacé lugar', 'Una manta o un cartón en el piso'],
      ['kids', 'Separá los caños', 'Son de 4 largos: 53 · 36 · 26 · 9 cm'],
      ['time', 'Sin apuro', '9 pasos, como en el manual de papel'],
      ['music', 'Y poné música', 'La que te acompañe mientras armás'],
    ],
    momCta: 'Empezar a armar',
    finTitulo: '¡Tu mesita <em>está lista</em>! 🎉',
    finCuerpo: 'Revisá que apoye firme en sus tres patas. Ahora sí: plantas, libros o la lámpara, cada cosa en su piso.',
    finTip: 'Guardá la llave Allen: cada tanto, repasá los tres tornillos de arriba. ¡Mandanos una foto cuando la tengas armada!',
    waTexto: '¡Hola DEGË! Estoy armando la Mesita de 3 pisos (CH07) y tengo una duda 😊',
    pie: 'DEGË Muebles · Muebles de chapa y caño, de Rosario a todo el país.',
    rvEjemplos: ['La armé en 10 minutos 🙌', 'Re claro el paso a paso', 'Quedó firme y hermosa', 'El color, tal cual la foto'],
  },
  cotas: { w: 28, d: 0, h: 65, unidad: 'cm', caja: [-283, 283, -223, 223, 0, ALTO], lineas: [
    [[-R, P.A[1], Z_ARRIBA + CHAPA], [R, P.A[1], Z_ARRIBA + CHAPA], [0, -175, 0], 28],
    [[P.A[0], P.A[1], 0], [P.A[0], P.A[1], ALTO], [Math.sign(P.A[0]) * 150, 0, 0], 65],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -24, pitch: 18 }, piezas: mesita(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Separá los caños por largo',
      subs: { a: ['Sacá todo de la caja y separá los caños por largo: son 4 medidas distintas.', 'Las tres chapas son iguales: cualquiera va en cualquier piso.'], b: [], tip: 'Si te confundís de caño, la mesita queda torcida: medilos antes de empezar.' },
      usa: ['5 · Chapas ×3', '4 · Caño 53 cm', '3 · Caño 36 cm', '2 · Caños 26 cm ×2', '1 · Caños 9 cm ×2'],
      elegir: [
        { m: ['pz.chapa'], t: 'Son las tres chapas 5, de 28 cm, con dos orejas perforadas cada una. Son iguales entre sí.' },
        { m: ['pz.c536'], t: 'Es el caño 4, el más largo (53 cm): va de la chapa de abajo a la de arriba.' },
        { m: ['pz.c361'], t: 'Es el caño 3, de 36 cm: va del piso a la chapa del medio.' },
        { m: ['pz.c265'], t: 'Son los dos caños 2, de 26 cm: unen las chapas entre sí.' },
        { m: ['pz.c9'], t: 'Son los dos caños 1, cortitos, de 9 cm: los pies de la chapa de abajo.' },
      ],
      cuenta: { fijo: '9 piezas · 4 largos de caño' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 },
      piezas: ordenPiezas(), resaltar: ['pz.chapa.2'], mueven: [mover('pz.chapa.2', 160)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Abrí la bolsa sobre la manta.', 'Son 3 tornillos Allen, 3 espárragos, 3 regatones y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'El espárrago es la varilla roscada sin cabeza: une dos caños a través de la chapa.' },
      usa: ['D · Llave Allen incluida'], check: [[3, 'A · Tornillos Allen'], [3, 'B · Espárragos'], [3, 'C · Regatones'], [1, 'D · Llave Allen']],
      cuenta: { fijo: '9 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 },
      piezas: herrajesPiezas(), resaltar: ['llave'], mueven: [mover('llave', 110)],
    },
    paso(1, 'regatones', 'Regatón y espárrago', [
      'Enroscá un regatón C y un espárrago B en los dos caños 1, de 9 cm.',
    ], [manta(), ...pies(), ...espAbajo()], {
      usa: ['1 · Caños 9 cm ×2', 'C · Regatones ×2', 'B · Espárragos ×2'], hw: { C: 2, B: 2 },
      titular: 'Regatón abajo, espárrago arriba', resaltar: ['pata', 'esp'], unir: ['cano9'],
      mueven: [mover('pata', 50, [0, 0, -1], 0), mover('esp', 80, [0, 0, 1], .4)], vista: { yaw: 55, pitch: 26 },
    }),
    paso(2, 'chapa', 'Los caños 1, en la chapa', [
      'Apoyá una chapa 5 haciendo coincidir los dos espárragos con sus agujeros.',
    ], [manta(), ...paso1()], {
      usa: ['5 · Chapa'], titular: 'Cada espárrago, en su agujero', resaltar: ['chapa.abajo'], unir: ['cano9', 'esp'],
      mueven: [mover('chapa.abajo', 150, [0, 0, 1], 0)], vista: { yaw: 55, pitch: 26 },
    }),
    paso(3, 'canos', 'Un caño 2 y el caño 4', [
      'Enroscá un caño 2 (26 cm) en uno de los espárragos.',
      'En el otro, enroscá el caño 4 (53 cm).',
    ], [manta(), ...paso2(),
      ...['A', 'B'].map((k) => ({ id: 'giro.' + k, tipo: 'giro', pos: [...P[k], Z_ABAJO + 60], r0: 19, r1: 30, desde: -150, hasta: 128, mat: 'senal', sinContorno: true }))], {
      usa: ['2 · Caño 26 cm', '4 · Caño 53 cm'], titular: 'A mano, hasta el tope', cuenta: { de: 'cano', n: 2, txt: 'Caño', fin: '2 caños en su lugar' },
      resaltar: ['cano536', 'cano265.B'], unir: ['chapa.abajo', 'esp', 'giro'], vista: { yaw: 55, pitch: 24 },
      mueven: [mover('cano265.B', 150, [0, 0, 1], 0), mover('cano536', 150, [0, 0, 1], .4)],
      subs: { a: ['Enroscá un caño 2 (26 cm) en uno de los espárragos.', 'En el otro, enroscá el caño 4 (53 cm).'], b: [], tip: 'Da igual en cuál va cada uno: la mesita se arma igual de los dos lados.' },
    }),
    paso(4, 'medio', 'La segunda chapa', [
      'Apoyá una segunda chapa sobre el caño 2.',
    ], [manta(), ...paso2(), ...chapaMedio(), ...tornilloMedio()], {
      usa: ['5 · Chapa', 'A · Tornillo Allen', 'D · Llave Allen'], hw: { A: 1 },
      titular: 'Sobre el caño corto', resaltar: ['chapa.medio', 'T.B'], unir: ['cano265.B'],
      subs: { a: ['Apoyá una segunda chapa sobre el caño 2.'], b: ['Poné un tornillo A y ajustalo con la llave Allen.'], tip: 'La chapa queda apoyada solo de un lado: la otra pata llega en el paso 6.' },
      mueven: [mover('chapa.medio', 150, [0, 0, 1], 0), mover('T.B', 90, [0, 0, 1], .5)],
      fases: {
        pieza: ['chapa.medio'], hw: ['T.B.cana', 'T.B.cabeza', 'T.B.hexagono'], retener: ['T.B'], ocultarEnA: ['T.B.cana', 'T.B.cabeza', 'T.B.hexagono'],
        ref: 'T.B', vistaB: { yaw: 20, pitch: 52 }, titularB: 'Un tornillo, con la llave',
        herramienta: { tipo: 'allen', pos: [...P.B, Z_MEDIO + CHAPA + 3.5] },
      },
      vista: { yaw: 15, pitch: 24 },
    }),
    paso(5, 'pata-c', 'El caño 3', [
      'Aparte, enroscá un regatón C y un espárrago B en el caño 3 (36 cm).',
    ], [manta(), ...paso2(), ...chapaMedio(), ...tornilloMedio(), ...pataC().map((q) => ({ ...q, pos: q.pos.map((n, i) => n + (i < 2 ? afuera('C')[i] * 190 : 0)) }))], {
      usa: ['3 · Caño 36 cm', 'C · Regatón', 'B · Espárrago'], hw: { C: 1, B: 1 },
      titular: 'Será la tercera pata', resaltar: ['cano361', 'pata.C', 'esp.C'], unir: [],
      mueven: [mover('pata.C', 40, [0, 0, -1], 0), mover('esp.C', 60, [0, 0, 1], .3)],
      vista: { yaw: 15, pitch: 22 },
    }),
    paso(6, 'tercera-pata', 'La tercera pata', [
      'Colocá el caño 3 por debajo de la segunda chapa: el espárrago pasa por el agujero libre.',
    ], [manta(), ...paso3()], {
      usa: ['3 · Caño 36 cm'], titular: 'Ya tenés las tres patas', resaltar: ['cano361', 'pata.C', 'esp.C'], unir: ['chapa.medio'],
      mueven: [mover(['cano361', 'pata.C', 'esp.C'], 190, afuera('C'), 0)], vista: { yaw: 15, pitch: 24 },
    }),
    paso(7, 'cano-arriba', 'El otro caño 2', [
      'Enroscá el caño 2 que queda en el espárrago de la segunda chapa.',
    ], [manta(), ...paso3(), ...canoArriba()], {
      usa: ['2 · Caño 26 cm'], titular: 'A mano, hasta el tope', resaltar: ['cano265.C'], unir: ['chapa.medio', 'esp.C'],
      mueven: [mover('cano265.C', 150, [0, 0, 1], 0)], vista: { yaw: -10, pitch: 26 },
    }),
    paso(8, 'arriba', 'La tercera chapa', [
      'Apoyá la tercera chapa sobre el caño 2 y el caño 4.',
    ], [manta(), ...mesita()], {
      usa: ['5 · Chapa', 'A · Tornillos Allen ×2', 'D · Llave Allen'], hw: { A: 2 },
      titular: 'Cada agujero, sobre su caño', resaltar: ['chapa.arriba', 'T.A', 'T.C'], unir: ['cano536', 'cano265.C'],
      subs: { a: ['Apoyá la tercera chapa sobre el caño 2 y el caño 4.'], b: ['Poné los dos tornillos A.', 'Ajustalos con la llave Allen.'], tip: 'El manual de papel numera este paso como 6 (y el siguiente como 5): son el 8 y el 9.' },
      mueven: [mover('chapa.arriba', 160, [0, 0, 1], 0), mover(['T.A', 'T.C'], 90, [0, 0, 1], .5)],
      fases: {
        pieza: ['chapa.arriba'], hw: ['T.A.cana', 'T.A.cabeza', 'T.A.hexagono', 'T.C.cana', 'T.C.cabeza', 'T.C.hexagono'], retener: ['T.A+T.C'], ocultarEnA: ['T.A.cana', 'T.A.cabeza', 'T.A.hexagono', 'T.C.cana', 'T.C.cabeza', 'T.C.hexagono'],
        ref: 'T.A', vistaB: { yaw: -24, pitch: 58 }, titularB: 'Dos tornillos, con la llave',
        herramienta: { tipo: 'allen', pos: [...P.A, Z_ARRIBA + CHAPA + 3.5] },
      },
      vista: { yaw: -10, pitch: 28 },
    }),
    paso(9, 'revisar', 'Revisá que esté firme', [
      'Repasá los tres tornillos con la llave.',
      'Revisá que la mesita apoye firme en sus tres patas.',
    ], [manta(), ...mesita()], {
      usa: ['D · Llave Allen'], titular: 'Que no se mueva nada', resaltar: ['T'], sinFantasma: true,
      subs: { a: ['Repasá los tres tornillos con la llave.', 'Revisá que la mesita apoye firme en sus tres patas.'], b: [], tip: 'Si queda un poco torcida, aflojá, enderezá los caños y volvé a ajustar.' },
      vista: { yaw: -24, pitch: 22 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -30, pitch: 16 }, piezas: mesita(), mueven: [] },
  ],
};
