
const A = 265, RC = 135;                 // óvalo 80 × 27: rectas de ±265 y radio 135
const CHAPA = 2.5, PATA_PL = 12, L_CORTO = 90, L_LARGO = 325, R_CANO = 12.5;
const NIV = 5;                           // 5 chapas, 33 cm entre estantes
const ZC = Array.from({ length: NIV }, (_, i) => PATA_PL + L_CORTO + i * (CHAPA + L_LARGO));  // 102, 429,5, 757, 1084,5, 1412
const ZTOP = ZC[NIV - 1];
const ALTO = ZTOP + CHAPA + 3;           // ≈ 142 cm
const RL = 142;
const PATAS = {
  izq: [A + RL, 0],          // punta izquierda (en pantalla)
  centroA: [0, RL],          // medio, adelante
  centroT: [0, -RL],         // medio, atrás: alineada con la de adelante
  der: [-(A + RL), 0],       // punta derecha
};
const K = Object.keys(PATAS);

const cil = (id, pos, largo, r, mat = 'chapa', extra = {}) => ({ id, tipo: 'cilindro', pos, s0: 0, s1: largo, r, mat, seg: 28, ...extra });

function contorno() {
  const pts = [], n = 100, RE = 19;
  const lado = (x0, x1, y, ny) => { for (let i = 0; i <= n; i++) pts.push([[x0 + (x1 - x0) * i / n, y], [0, ny]]); };
  const curva = (cx, a0, a1) => { for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([[cx + RC * Math.cos(a), RC * Math.sin(a)], [Math.cos(a), Math.sin(a)]]); } };
  lado(-A, A, -RC, -1); curva(A, -Math.PI / 2, Math.PI / 2); lado(A, -A, RC, 1); curva(-A, Math.PI / 2, 1.5 * Math.PI);
  return pts.map(([[x, y], [nx, ny]]) => {
    let px = x, py = y;
    for (const [lx, ly] of Object.values(PATAS)) {
      const dx = px - lx, dy = py - ly, u = dx * nx + dy * ny, s = -dx * ny + dy * nx;
      if (Math.abs(s) < RE) { const k = Math.sqrt(RE * RE - s * s) - u; if (k > 0) { px += nx * k; py += ny * k; } }
    }
    return [px, py];
  });
}
const CONT = contorno();
const chapa = (id, z) => ({ id, tipo: 'perfil', puntos: CONT, pos: [0, 0, z], z0: 0, z1: CHAPA, mat: 'chapa',
  huecos: Object.values(PATAS).map(([x, y]) => ({ x, y, w: 8.5, d: 8.5, r: 4.25 })) });

const pies = () => K.flatMap((k) => [cil('pata.' + k, [...PATAS[k], 0], PATA_PL, 10, 'negro'), cil('pie.' + k, [...PATAS[k], PATA_PL], L_CORTO, R_CANO)]);
const esparragos = (n) => K.map((k) => cil(`esp${n}.${k}`, [...PATAS[k], ZC[n] - 20], 44, 4, 'zinc', { seg: 14 }));
const canos = (n) => K.map((k) => cil(`cano${n}.${k}`, [...PATAS[k], ZC[n] + CHAPA], L_LARGO, R_CANO));
const tornillos = () => K.flatMap((k) => [
  cil(`T.${k}.cana`, [...PATAS[k], ZTOP + CHAPA], 22, 3, 'zinc', { eje: [0, 0, -1], seg: 14 }),
  cil(`T.${k}.cabeza`, [...PATAS[k], ZTOP + CHAPA], 3, 7, 'negro', { seg: 24 }),
  cil(`T.${k}.hex`, [...PATAS[k], ZTOP + CHAPA + 3], .2, 2.5, 'oscuro', { seg: 6, sinContorno: true, sinAristas: true }),
]);
function hasta(n, { canosArriba = false } = {}) {
  const ps = [...pies()];
  for (let i = 0; i <= n; i++) {
    if (i > 0) ps.push(...canos(i - 1));
    if (i < NIV - 1) ps.push(...esparragos(i));
    ps.push(chapa('chapa.' + i, ZC[i]));
  }
  if (canosArriba && n < NIV - 1) ps.push(...canos(n));
  if (n === NIV - 1) ps.push(...tornillos());
  return ps;
}
const biblioteca = () => hasta(NIV - 1);

const manta = (w = 1200, d = 640, extra = {}) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', ...extra });

const acostado = (id, x, y, largo) => cil(id, [x, y, R_CANO], largo, R_CANO, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1700, 1080, { pos: [0, -30, 0] }),
  ...[0, 1, 2, 3, 4].map((k) => ({ id: 'pz.2.' + k, tipo: 'perfil', puntos: CONT, pos: [-330, 270, k * (CHAPA + .6)], z0: 0, z1: CHAPA, mat: 'chapa' })),
  { id: 'rotulo.2', tipo: 'texto', txt: '1 · CHAPAS ×5', pos: [-330, 460, .3], alto: 44 },
  ...Array.from({ length: 16 }, (_, k) => acostado('pz.3.' + k, -760 + (k % 2) * 380, 10 - Math.floor(k / 2) * 52, L_LARGO)),
  { id: 'rotulo.3', tipo: 'texto', txt: '2 · CAÑOS GRANDES ×16', pos: [-380, -440, .3], alto: 40 },
  ...[0, 1, 2, 3].map((k) => acostado('pz.5.' + k, 220 + (k % 2) * 130, 330 - Math.floor(k / 2) * 60, L_CORTO)),
  { id: 'rotulo.5', tipo: 'texto', txt: '3 · CAÑOS CHICOS ×4', pos: [330, 160, .3], alto: 40 },
  { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 240, d: 140, r: 24, pos: [460, -200, 0], z0: 0, z1: 22, mat: 'bolsa' },
  { id: 'rotulo.h', tipo: 'texto', txt: 'HERRAJES', pos: [460, -320, .3], alto: 38 },
];
const herrajesPiezas = () => [
  manta(600, 420, { lineas: 0 }),
  ...Array.from({ length: 16 }, (_, i) => cil('h.esp.' + i, [-270 + (i % 2) * 60, -160 + Math.floor(i / 2) * 42, 4], 44, 4, 'zinc', { eje: [1, 0, 0], seg: 14 })),
  ...[0, 1, 2, 3].flatMap((i) => [cil(`h.T.${i}.cana`, [-60 + (i % 2) * 50, -60 + Math.floor(i / 2) * 70, 0], 22, 3, 'zinc', { seg: 14 }), cil(`h.T.${i}.cabeza`, [-60 + (i % 2) * 50, -60 + Math.floor(i / 2) * 70, 22], 3, 7, 'negro', { seg: 24 })]),
  ...[0, 1, 2, 3].map((i) => cil('h.pata.' + i, [70 + (i % 2) * 42, -60 + Math.floor(i / 2) * 70, 0], PATA_PL, 10, 'negro')),
  cil('llave.corto', [220, -50, 3], 26, 3, 'zinc', { eje: [-1, 0, 0], seg: 12 }),
  cil('llave.largo', [220, -50, 3], 82, 3, 'zinc', { eje: [0, 1, 0], seg: 12 }),
  { id: 'rotulo.4', tipo: 'texto', txt: 'B', pos: [-235, 185, .3], alto: 32 },
  { id: 'rotulo.1', tipo: 'texto', txt: 'A', pos: [-35, 185, .3], alto: 32 },
  { id: 'rotulo.7', tipo: 'texto', txt: 'C', pos: [90, 185, .3], alto: 32 },
  { id: 'rotulo.6', tipo: 'texto', txt: 'D', pos: [225, 185, .3], alto: 32 },
];

const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const paso = (num, id, titulo, a, piezas, extra = {}) => ({
  num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de 7` },
  vista: { yaw: -22, pitch: 18 }, piezas, mueven: [], resaltar: [], encuadrarTodo: false, ...extra,
});
const tramo = (n, num) => paso(num, 'tramo-' + n, `Estante ${n + 1} y cuatro caños`, [
  'Enroscá un espárrago B arriba de cada caño grande.',
  'Apoyá la chapa siguiente y enroscá otros cuatro caños grandes 2.',
], [manta(), ...hasta(n, { canosArriba: true })], {
  usa: ['B · Espárragos ×4', '1 · Chapa', '2 · Caños grandes ×4'], hw: { B: 4 },
  titular: num === 4 ? 'Espárrago, chapa y caños' : 'Igual que el paso 4', cuenta: { fijo: `Estante ${n + 1} de 5` },
  resaltar: [`esp${n}`, `chapa.${n}`, `cano${n}`], unir: [`cano${n - 1}`],
  subs: { a: ['Enroscá un espárrago B arriba de cada caño grande.', 'Apoyá la chapa siguiente y enroscá otros cuatro caños grandes 2.'], b: [], tip: num === 4 ? 'El manual de papel no nombra los espárragos en este paso, pero van: uno arriba de cada caño, antes de la chapa.' : 'El paso 5 del manual es repetir el 4 dos veces más.' },
  mueven: [mover(`esp${n}`, 70, [0, 0, 1], 0), mover(`chapa.${n}`, 160, [0, 0, 1], .5), mover(`cano${n}`, 180, [0, 0, 1], 1)],
  zoom: n > 1 ? .45 : 0, sinFantasma: n > 1,
});

export default {
  id: 'ch10', version: 1, pasosManual: 7,
  marca: {
    nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022',
    tienda: 'https://dege.com.ar/productos/biblioteca/', instagram: 'https://instagram.com/dege.muebles',
    confeti: ['#E4DCCB', '#1d1d1b', '#e9e4d6', '#B9654C'],
  },
  materiales: {
    chapa: { color: '#E4DCCB' }, zinc: { color: '#c9ced3' }, negro: { color: '#242424' }, oscuro: { color: '#111111' },
    carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 },
  },
  inventario: [{ id: 'C', n: 4, label: 'C · Regatones' }, { id: 'B', n: 16, label: 'B · Espárragos' }, { id: 'A', n: 4, label: 'A · Tornillos Allen' }],
  textos: {
    titulo: 'Armá tu Biblioteca CH10 · DEGË Muebles', cabecera: 'Biblioteca CH10',
    ladoTitulo: 'Tu biblioteca, <em>paso a paso</em>',
    ladoCuerpo: 'Cinco estantes ovalados de 80 × 27 cm y cuatro columnas de caño. Seguí los 7 pasos del manual de fábrica y girá el modelo para ver cada unión.',
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá la biblioteca para girarla', girar: 'Arrastrá para girar la biblioteca',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>biblioteca</em>, paso a paso',
    datos: [['layers', '25 piezas', '+ 24 herrajes'], ['steps', '7 pasos', 'el 5 se hace 2 veces'], ['box', '80 × 27 × 142', 'cm · ancho, fondo y alto']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: 'Tu biblioteca,<br><em>estante por estante</em>', momCuerpo: 'Es el mismo paso repetido cuatro veces. Todo se enrosca a mano; la llave Allen viene en la caja.',
    momTips: [
      ['space', 'Hacé lugar', 'La vas a armar parada: dejá espacio arriba'],
      ['kids', 'Separá los caños', '4 chicos de 9 cm y 16 grandes de 32,5 cm'],
      ['time', 'Mejor de a dos', 'A partir del tercer estante, una mano ayuda'],
      ['music', 'Y poné música', 'La que te acompañe mientras armás'],
    ],
    momCta: 'Empezar a armar',
    finTitulo: '¡Tu biblioteca <em>está lista</em>! 🎉',
    finCuerpo: 'Revisá que apoye firme en sus cuatro patas. Los libros más pesados, en los estantes de abajo.',
    finTip: 'Si la vas a cargar mucho, apoyala contra la pared. Guardá la llave Allen para repasar los tornillos de arriba.',
    waTexto: '¡Hola DEGË! Estoy armando la Biblioteca CH10 y tengo una duda 😊',
    pie: 'DEGË Muebles · Muebles de chapa y caño, de Rosario a todo el país.',
    rvEjemplos: ['La armé en un rato 🙌', 'Re claro el paso a paso', 'Entran todos mis libros', 'Firme y hermosa'],
  },
  cotas: { w: 80, d: 27, h: 142, unidad: 'cm', caja: [-400, 400, -135, 135, 0, ALTO], lineas: [
    [[400, 0, 0], [-400, 0, 0], [0, 230, 0], 80],
    [[-400, 135, 0], [-400, -135, 0], [-60, 0, 0], 27],
    [[400, 0, 0], [400, 0, ZTOP + CHAPA], [60, 0, 0], 142],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -22, pitch: 12 }, piezas: biblioteca(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: 5 chapas, 16 caños grandes y 4 chicos.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'Observá bien cada pieza antes de encastrarla. Cualquier duda, escribinos.' },
      usa: ['1 · Chapas ×5', '2 · Caños grandes ×16', '3 · Caños chicos ×4'],
      elegir: [
        { m: ['pz.2'], t: 'Son los cinco óvalos de 80 × 27 cm, iguales, con cuatro orejas perforadas.' },
        { m: ['pz.3'], t: 'Son los 16 caños grandes: 4 entre cada par de estantes.' },
        { m: ['pz.5'], t: 'Son los 4 caños chicos: las patas, debajo del estante de abajo.' },
      ],
      cuenta: { fijo: '25 piezas · 3 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 60 },
      piezas: ordenPiezas(), resaltar: ['pz.2.4'], mueven: [mover('pz.2.4', 160)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 16 espárragos, 4 tornillos Allen, 4 regatones y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'El espárrago es la varilla roscada sin cabeza: une un caño con el siguiente, a través del estante.' },
      usa: ['D · Llave Allen incluida'], check: [[16, 'B · Espárragos'], [4, 'A · Tornillos Allen'], [4, 'C · Regatones'], [1, 'D · Llave Allen']],
      cuenta: { fijo: '24 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajesPiezas(), resaltar: ['llave'], mueven: [mover('llave', 110)],
    },
    paso(1, 'regatones', 'Regatón y espárrago', [
      'Enroscá un regatón C y un espárrago B en los cuatro caños chicos 3.',
    ], [manta(), ...pies(), ...esparragos(0)], {
      usa: ['3 · Caños chicos ×4', 'C · Regatones ×4', 'B · Espárragos ×4'], hw: { C: 4, B: 4 },
      titular: 'Regatón abajo, espárrago arriba', resaltar: ['pata', 'esp0'], unir: ['pie'],
      mueven: [mover('pata', 50, [0, 0, -1], 0), mover('esp0', 80, [0, 0, 1], .4)],
      vista: { yaw: -20, pitch: 30 },
    }),
    paso(2, 'chapa', 'Los caños chicos, en la chapa', [
      'Apoyá una chapa 1 haciendo coincidir cada espárrago con su agujero.',
    ], [manta(), ...hasta(0)], {
      usa: ['1 · Chapa'], titular: 'Cada espárrago, en su agujero', resaltar: ['chapa.0'], unir: ['pie', 'esp0'],
      mueven: [mover('chapa.0', 160, [0, 0, 1], 0)], vista: { yaw: -20, pitch: 28 },
    }),
    paso(3, 'canos', 'Cuatro caños grandes', [
      'Enroscá los cuatro caños grandes 2 en los espárragos, a mano.',
    ], [manta(), ...hasta(0, { canosArriba: true })], {
      usa: ['2 · Caños grandes ×4'], titular: 'A mano, hasta el tope', cuenta: { de: 'cano0.', n: 4, txt: 'Caño', fin: '4 caños en su lugar' },
      resaltar: ['cano0'], unir: ['chapa.0', 'esp0'],
      mueven: K.map((k, i) => mover('cano0.' + k, 170, [0, 0, 1], i * .3)),
    }),
    tramo(1, 4), tramo(2, 5), tramo(3, 5),
    paso(6, 'tapa', 'El último estante y los tornillos', [
      'Apoyá la chapa que queda sobre los cuatro caños.',
    ], [manta(), ...biblioteca()], {
      usa: ['1 · Chapa', 'A · Tornillos Allen ×4', 'D · Llave Allen'], hw: { A: 4 },
      titular: 'Cada agujero, sobre su caño', resaltar: ['chapa.4', 'T'], unir: ['cano3'], sinFantasma: true,
      subs: { a: ['Apoyá la chapa que queda sobre los cuatro caños.'], b: ['Poné un tornillo A en cada agujero.', 'Ajustalos con la llave Allen hasta que queden firmes.'], tip: 'Ajustá en cruz: un tornillo y después el de la punta opuesta. Así el estante asienta parejo.' },
      mueven: [mover('chapa.4', 160, [0, 0, 1], 0), mover('T', 80, [0, 0, 1], .6)],
      fases: {
        pieza: ['chapa.4'], hw: K.flatMap((k) => [`T.${k}.cana`, `T.${k}.cabeza`, `T.${k}.hex`]), retener: ['T'], ocultarEnA: K.flatMap((k) => [`T.${k}.cana`, `T.${k}.cabeza`, `T.${k}.hex`]),
        ref: 'T.izq', vistaB: { yaw: -40, pitch: 55 }, titularB: 'Un tornillo en cada caño',
        herramienta: { tipo: 'allen', pos: [...PATAS.izq, ZTOP + CHAPA + 3] },
      },
    }),
    paso(7, 'revisar', 'Revisá que esté firme', [
      'Repasá los cuatro tornillos con la llave.',
      'Si la biblioteca se mueve, ajustá un poco más.',
    ], [manta(), ...biblioteca()], {
      usa: ['D · Llave Allen'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['T'],
      subs: { a: ['Repasá los cuatro tornillos con la llave.', 'Si la biblioteca se mueve, ajustá un poco más.'], b: [], tip: 'El manual de papel numera este paso como 5: es el 7, el último.' },
      vista: { yaw: -26, pitch: 12 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -24, pitch: 10 }, piezas: biblioteca(), mueven: [] },
  ],
};
