// CH08 · Mesa Ratona (la de la web, "mesa-ratona2").
// Fuentes: "Manual de armado Mesa Ratona CH08.pdf" (Drive › Manuales de armado, 4 p.), ficha de la web (80 × 40 × 37 cm)
// y fotos de la ficha. mm · Z arriba · piso z = 0 · adelante = +Y (con la cámara de frente, +X queda a la izquierda).
// Ver estudio/ch08-notas.md. Reemplaza a productos/mesa-ratona.js (esa era la demo estimada de Armalo).
//
// Las 4 patas NO van en las esquinas: van alternadas (fotos de la ficha y dibujo del manual): una en cada punta curva y
// dos cerca del medio, una adelante y otra atrás, con simetría de media vuelta.

const A = 200, RC = 200;            // óvalo 80 × 40: rectas de ±200 y radio 200
const CHAPA = 2.5, PATA_PL = 12, L_PIE = 90, L_CANO = 265, R_CANO = 12.5;
const Z_ABAJO = PATA_PL + L_PIE;                     // 102
const Z_ARRIBA = Z_ABAJO + CHAPA + L_CANO;           // 369,5
const ALTO = Z_ARRIBA + CHAPA + 3;                   // ≈ 37,5 cm
const TH = 155 * Math.PI / 180, RL = 207;            // patas de las puntas: sobre la curva, apenas hacia un lado
const PATAS = {
  izq: [A + RL * Math.cos(Math.PI - TH), RL * Math.sin(Math.PI - TH)],        // punta izquierda (en pantalla), adelante
  centroA: [-70, RL],                                                          // medio, adelante
  centroT: [70, -RL],                                                          // medio, atrás
  der: [-(A + RL * Math.cos(Math.PI - TH)), -RL * Math.sin(Math.PI - TH)],     // punta derecha, atrás
};
const K = Object.keys(PATAS);

const cil = (id, pos, largo, r, mat = 'chapa', extra = {}) => ({ id, tipo: 'cilindro', pos, s0: 0, s1: largo, r, mat, seg: 28, ...extra });

// Óvalo con una oreja chica en cada pata (unión del óvalo con un círculo alrededor del agujero).
function contorno() {
  const pts = [], n = 90, RE = 19;
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

const pies = () => K.flatMap((k) => [cil('pata.' + k, [...PATAS[k], 0], PATA_PL, 10, 'negro'), cil('pie.' + k, [...PATAS[k], PATA_PL], L_PIE, R_CANO)]);
const esparragos = () => K.map((k) => cil('esp.' + k, [...PATAS[k], Z_ABAJO - 20], 44, 4, 'zinc', { seg: 14 }));
const canos = () => K.map((k) => cil('cano.' + k, [...PATAS[k], Z_ABAJO + CHAPA], L_CANO, R_CANO));
// Tornillo Allen de cabeza plana y ancha, desde arriba de la chapa al caño.
const tornillos = () => K.flatMap((k) => [
  cil(`T.${k}.cana`, [...PATAS[k], Z_ARRIBA + CHAPA], 22, 3, 'zinc', { eje: [0, 0, -1], seg: 14 }),
  cil(`T.${k}.cabeza`, [...PATAS[k], Z_ARRIBA + CHAPA], 3, 7, 'negro', { seg: 24 }),
  cil(`T.${k}.hex`, [...PATAS[k], Z_ARRIBA + CHAPA + 3], .2, 2.5, 'oscuro', { seg: 6, sinContorno: true, sinAristas: true }),
]);
const base = () => [...pies(), ...esparragos(), chapa('chapa.abajo', Z_ABAJO)];
const mesa = () => [...base(), ...canos(), chapa('chapa.arriba', Z_ARRIBA), ...tornillos()];

const manta = (w = 1250, d = 820, extra = {}) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', ...extra });

// ── «Ordená las piezas» ──
const acostado = (id, x, y, largo) => cil(id, [x, y, R_CANO], largo, R_CANO, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1500, 980, { pos: [0, -10, 0] }),
  { id: 'pz.2.0', tipo: 'perfil', puntos: CONT, pos: [-290, 170, 0], z0: 0, z1: CHAPA, mat: 'chapa' },
  { id: 'pz.2.1', tipo: 'perfil', puntos: CONT, pos: [-290, 170, CHAPA + .6], z0: 0, z1: CHAPA, mat: 'chapa' },
  { id: 'rotulo.2', tipo: 'texto', txt: '2 · CHAPAS ×2', pos: [-290, 420, .3], alto: 40 },
  ...[0, 1, 2, 3].map((k) => acostado('pz.3.' + k, 150, 340 - k * 60, L_CANO)),
  { id: 'rotulo.3', tipo: 'texto', txt: '3 · CAÑOS 26,5 ×4', pos: [280, 420, .3], alto: 34 },
  ...[0, 1, 2, 3].map((k) => acostado('pz.5.' + k, 150, 60 - k * 55, L_PIE)),
  { id: 'rotulo.5', tipo: 'texto', txt: '5 · CAÑOS 9 ×4', pos: [195, -180, .3], alto: 34 },
  { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 220, d: 130, r: 24, pos: [-290, -280, 0], z0: 0, z1: 22, mat: 'bolsa' },
  { id: 'rotulo.h', tipo: 'texto', txt: 'HERRAJES', pos: [-290, -390, .3], alto: 32 },
];
const herrajesPiezas = () => [
  manta(560, 340, { lineas: 0 }),
  ...[0, 1, 2, 3].map((i) => cil('h.esp.' + i, [-230, -75 + i * 45, 4], 44, 4, 'zinc', { eje: [1, 0, 0], seg: 14 })),
  ...[0, 1, 2, 3].flatMap((i) => [cil(`h.T.${i}.cana`, [-70 + (i % 2) * 50, -60 + Math.floor(i / 2) * 70, 0], 22, 3, 'zinc', { seg: 14 }), cil(`h.T.${i}.cabeza`, [-70 + (i % 2) * 50, -60 + Math.floor(i / 2) * 70, 22], 3, 7, 'negro', { seg: 24 })]),
  ...[0, 1, 2, 3].map((i) => cil('h.pata.' + i, [70 + (i % 2) * 42, -60 + Math.floor(i / 2) * 70, 0], PATA_PL, 10, 'negro')),
  cil('llave.corto', [210, -50, 3], 26, 3, 'zinc', { eje: [-1, 0, 0], seg: 12 }),
  cil('llave.largo', [210, -50, 3], 82, 3, 'zinc', { eje: [0, 1, 0], seg: 12 }),
  { id: 'rotulo.4', tipo: 'texto', txt: '4', pos: [-210, 125, .3], alto: 30 },
  { id: 'rotulo.1', tipo: 'texto', txt: '1', pos: [-45, 125, .3], alto: 30 },
  { id: 'rotulo.7', tipo: 'texto', txt: '7', pos: [90, 125, .3], alto: 30 },
  { id: 'rotulo.6', tipo: 'texto', txt: '6', pos: [215, 125, .3], alto: 30 },
];

const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const paso = (num, id, titulo, a, piezas, extra = {}) => ({
  num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de 3` },
  vista: { yaw: -22, pitch: 22 }, piezas, mueven: [], resaltar: [], encuadrarTodo: false, ...extra,
});

export default {
  id: 'ch08', version: 1, pasosManual: 3,
  marca: {
    nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022',
    tienda: 'https://dege.com.ar/productos/mesa-ratona2/', instagram: 'https://instagram.com/dege.muebles',
    ventaCruzada: { url: 'https://dege.com.ar/productos/rack-de-tv-ch09/', img: 'assets/xsell-ch09.jpg', titulo: 'Estantería baja CH09', sub: 'De chapa y caño, en los mismos colores: va de rack de TV al lado de tu mesa' },
    confeti: ['#B9654C', '#ffffff', '#e9e4d6', '#1d1d1b'],
  },
  materiales: {
    chapa: { color: '#B9654C' }, zinc: { color: '#c9ced3' }, negro: { color: '#242424' }, oscuro: { color: '#111111' },
    carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 },
  },
  inventario: [{ id: '7', n: 4, label: '7 · Patas plásticas' }, { id: '4', n: 4, label: '4 · Espárragos' }, { id: '1', n: 4, label: '1 · Tornillos Allen' }],
  textos: {
    titulo: 'Armá tu Mesa Ratona CH08 · DEGË Muebles', cabecera: 'Mesa Ratona CH08',
    ladoTitulo: 'Tu mesa ratona, <em>paso a paso</em>',
    ladoCuerpo: 'Dos chapas ovaladas de 80 × 40 cm y cuatro patas de caño. Seguí los 3 pasos del manual de fábrica y girá el modelo para ver cada unión.',
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá la mesa para girarla', girar: 'Arrastrá para girar la mesa',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>mesa ratona</em>, paso a paso',
    datos: [['layers', '10 piezas', '+ 12 herrajes'], ['steps', '3 pasos', 'llave Allen incluida'], ['box', '80 × 40 × 37', 'cm · largo, fondo y alto']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: 'Tu mesa ratona,<br><em>en 10 minutos</em>', momCuerpo: 'Dos chapas y cuatro patas: se arma en un rato y la llave viene en la caja.',
    momTips: [
      ['space', 'Hacé lugar', 'Una manta o un cartón en el piso'],
      ['kids', 'Separá los caños', '4 cortos de 9 cm y 4 largos de 26,5 cm'],
      ['time', 'Sin apuro', '3 pasos de armado'],
      ['music', 'Y poné música', 'La que te acompañe mientras armás'],
    ],
    momCta: 'Empezar a armar',
    finTitulo: '¡Tu mesa ratona <em>está lista</em>! 🎉',
    finCuerpo: 'Fijate que apoye firme en sus cuatro patas. Arriba lo que querés tener a mano; abajo, los libros y lo del día a día.',
    finTip: 'Guardá la llave Allen: cada tanto, repasá los cuatro tornillos de la tapa. ¡Mandanos una foto cuando la tengas armada!',
    waTexto: '¡Hola DEGË! Estoy armando la Mesa Ratona CH08 y tengo una duda 😊',
    pie: 'DEGË Muebles · Muebles de chapa y caño, de Rosario a todo el país.',
    rvEjemplos: ['La armé en un rato 🙌', 'Re claro el paso a paso', 'Quedó firme y hermosa', 'El color, tal cual la foto'],
  },
  cotas: { w: 80, d: 40, h: 37, unidad: 'cm', caja: [-400, 400, -200, 200, 0, ALTO], lineas: [
    [[400, 0, 0], [-400, 0, 0], [0, 290, 0], 80],
    [[-400, 200, 0], [-400, -200, 0], [-60, 0, 0], 40],
    [[400, 0, 0], [400, 0, Z_ARRIBA + CHAPA], [40, 0, 0], 37],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -18, pitch: 18 }, piezas: mesa(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: 2 chapas, 4 caños largos y 4 cortos.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'Observá bien cada pieza antes de encastrarla. Cualquier duda, escribinos.' },
      usa: ['2 · Chapas ×2', '3 · Caños 26,5 cm ×4', '5 · Caños 9 cm ×4'],
      elegir: [
        { m: ['pz.2'], t: 'Son los dos óvalos de 80 × 40 cm, iguales, con un agujero en cada oreja.' },
        { m: ['pz.3'], t: 'Son los 4 caños largos: van entre la chapa de abajo y la de arriba.' },
        { m: ['pz.5'], t: 'Son los 4 caños cortos: las patas, debajo de la chapa de abajo.' },
      ],
      cuenta: { fijo: '10 piezas · 3 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 },
      piezas: ordenPiezas(), resaltar: ['pz.2.1'], mueven: [mover('pz.2.1', 160)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 4 espárragos, 4 tornillos Allen, 4 patas plásticas y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'El espárrago es la varilla roscada sin cabeza: une la pata corta con el caño largo, a través de la chapa.' },
      usa: ['6 · Llave Allen incluida'], check: [[4, '4 · Espárragos'], [4, '1 · Tornillos Allen'], [4, '7 · Patas plásticas'], [1, '6 · Llave Allen']],
      cuenta: { fijo: '12 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajesPiezas(), resaltar: ['llave'], mueven: [mover('llave', 110)],
    },
    paso(1, 'base', 'Patas y chapa de abajo', [
      'Enroscá una pata plástica en un extremo de cada caño de 9 cm.',
      'En el otro extremo de cada uno, enroscá un espárrago.',
      'Apoyá una chapa haciendo coincidir cada espárrago con su agujero.',
    ], [manta(), ...base()], {
      usa: ['5 · Caños 9 cm ×4', '7 · Patas plásticas ×4', '4 · Espárragos ×4', '2 · Chapa'], hw: { '7': 4, '4': 4 },
      titular: 'Cada espárrago, en su agujero', resaltar: ['chapa.abajo', 'esp'], unir: ['pie'],
      mueven: [mover('pata', 50, [0, 0, -1], 0), mover('esp', 80, [0, 0, 1], .4), mover('chapa.abajo', 160, [0, 0, 1], .9)],
      vista: { yaw: -22, pitch: 28 },
    }),
    paso(2, 'canos', 'Enroscá los caños largos', [
      'Enroscá un caño de 26,5 cm en cada espárrago, a mano.',
      'La chapa queda apretada entre la pata y el caño.',
    ], [manta(), ...base(), ...canos()], {
      usa: ['3 · Caños 26,5 cm ×4'], titular: 'A mano, hasta el tope', cuenta: { de: 'cano.', n: 4, txt: 'Caño', fin: '4 caños en su lugar' },
      resaltar: ['cano'], unir: ['chapa.abajo', 'esp'],
      subs: { a: ['Enroscá un caño de 26,5 cm en cada espárrago, a mano.', 'La chapa queda apretada entre la pata y el caño.'], b: [], tip: 'El manual de papel dice "32,5 cm" en este paso: son los caños de 26,5, los únicos largos que vienen.' },
      mueven: K.map((k, i) => mover('cano.' + k, 170, [0, 0, 1], i * .3)),
      vista: { yaw: -22, pitch: 22 },
    }),
    paso(3, 'tapa', 'Chapa de arriba y tornillos', [
      'Apoyá la segunda chapa sobre los cuatro caños, con cada agujero sobre su caño.',
    ], [manta(), ...mesa()], {
      usa: ['2 · Chapa', '1 · Tornillos Allen ×4', '6 · Llave Allen'], hw: { '1': 4 },
      titular: 'Cada agujero, sobre su caño', resaltar: ['chapa.arriba', 'T'], unir: ['cano'],
      subs: { a: ['Apoyá la segunda chapa sobre los cuatro caños, con cada agujero sobre su caño.'], b: ['Poné un tornillo Allen en cada agujero.', 'Ajustalos con la llave hasta que queden firmes.'], tip: 'Ajustá en cruz: un tornillo y después el de la punta opuesta. Así la tapa asienta pareja.' },
      mueven: [mover('chapa.arriba', 180, [0, 0, 1], 0), mover('T', 80, [0, 0, 1], .6)],
      fases: {
        pieza: ['chapa.arriba'], hw: K.flatMap((k) => [`T.${k}.cana`, `T.${k}.cabeza`, `T.${k}.hex`]), retener: ['T'], ocultarEnA: K.flatMap((k) => [`T.${k}.cana`, `T.${k}.cabeza`, `T.${k}.hex`]),
        ref: 'T.izq', vistaB: { yaw: -40, pitch: 55 }, titularB: 'Un tornillo en cada caño',
        herramienta: { tipo: 'allen', pos: [...PATAS.izq, Z_ARRIBA + CHAPA + 3] },
      },
      vista: { yaw: -22, pitch: 26 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -26, pitch: 16 }, piezas: mesa(), mueven: [] },
  ],
};
