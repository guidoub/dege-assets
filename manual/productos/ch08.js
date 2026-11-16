
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
const tornillos = () => K.flatMap((k) => [
  cil(`T.${k}.cana`, [...PATAS[k], Z_ARRIBA + CHAPA], 22, 3, 'zinc', { eje: [0, 0, -1], seg: 14 }),
  cil(`T.${k}.cabeza`, [...PATAS[k], Z_ARRIBA + CHAPA], 3, 7, 'negro', { seg: 24 }),
  cil(`T.${k}.hex`, [...PATAS[k], Z_ARRIBA + CHAPA + 3], .2, 2.5, 'oscuro', { seg: 6, sinContorno: true, sinAristas: true }),
]);
const base = () => [...pies(), ...esparragos(), chapa('chapa.abajo', Z_ABAJO)];
const mesa = () => [...base(), ...canos(), chapa('chapa.arriba', Z_ARRIBA), ...tornillos()];

const manta = (w = 1250, d = 820, extra = {}) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', ...extra });

const acostado = (id, x, y, largo) => cil(id, [x, y, R_CANO], largo, R_CANO, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1500, 980, { pos: [0, -10, 0] }),
  { id: 'pz.2.0', tipo: 'perfil', puntos: CONT, pos: [-290, 170, 0], z0: 0, z1: CHAPA, mat: 'chapa' },
  { id: 'pz.2.1', tipo: 'perfil', puntos: CONT, pos: [-290, 170, CHAPA + .6], z0: 0, z1: CHAPA, mat: 'chapa' },
  { id: 'rotulo.2', tipo: 'texto', txt: '1 · CHAPAS ×2', pos: [-290, 420, .3], alto: 40 },
  ...[0, 1, 2, 3].map((k) => acostado('pz.3.' + k, 150, 340 - k * 60, L_CANO)),
  { id: 'rotulo.3', tipo: 'texto', txt: '2 · CAÑOS GRANDES ×4', pos: [280, 420, .3], alto: 34 },
  ...[0, 1, 2, 3].map((k) => acostado('pz.5.' + k, 150, 60 - k * 55, L_PIE)),
  { id: 'rotulo.5', tipo: 'texto', txt: '3 · CAÑOS CHICOS ×4', pos: [195, -180, .3], alto: 34 },
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
  { id: 'rotulo.4', tipo: 'texto', txt: 'B', pos: [-210, 125, .3], alto: 30 },
  { id: 'rotulo.1', tipo: 'texto', txt: 'A', pos: [-45, 125, .3], alto: 30 },
  { id: 'rotulo.7', tipo: 'texto', txt: 'C', pos: [90, 125, .3], alto: 30 },
  { id: 'rotulo.6', tipo: 'texto', txt: 'D', pos: [215, 125, .3], alto: 30 },
];

const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const paso = (num, id, titulo, a, piezas, extra = {}) => ({
  num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de 5` },
  vista: { yaw: -22, pitch: 22 }, piezas, mueven: [], resaltar: [], encuadrarTodo: false, ...extra,
});

export default {
  id: 'ch08', version: 1, pasosManual: 5,
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
  inventario: [{ id: 'C', n: 4, label: 'C · Regatones' }, { id: 'B', n: 4, label: 'B · Espárragos' }, { id: 'A', n: 4, label: 'A · Tornillos Allen' }],
  textos: {
    titulo: 'Armá tu Mesa Ratona CH08 · DEGË Muebles', cabecera: 'Mesa Ratona CH08',
    ladoTitulo: 'Tu mesa ratona, <em>paso a paso</em>',
    ladoCuerpo: 'Dos chapas ovaladas de 80 × 40 cm y cuatro patas de caño. Seguí los 5 pasos del manual de fábrica y girá el modelo para ver cada unión.',
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá la mesa para girarla', girar: 'Arrastrá para girar la mesa',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>mesa ratona</em>, paso a paso',
    datos: [['layers', '10 piezas', '+ 12 herrajes'], ['steps', '5 pasos', 'llave Allen incluida'], ['box', '80 × 40 × 37', 'cm · largo, fondo y alto']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: 'Tu mesa ratona,<br><em>en 10 minutos</em>', momCuerpo: 'Dos chapas y cuatro patas: se arma en un rato y la llave viene en la caja.',
    momTips: [
      ['space', 'Hacé lugar', 'Una manta o un cartón en el piso'],
      ['kids', 'Separá los caños', '4 cortos de 9 cm y 4 largos de 26,5 cm'],
      ['time', 'Sin apuro', '5 pasos, como en el manual de papel'],
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
      usa: ['1 · Chapas ×2', '2 · Caños grandes ×4', '3 · Caños chicos ×4'],
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
      subs: { a: ['Son 4 espárragos, 4 tornillos Allen, 4 regatones y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'El espárrago es la varilla roscada sin cabeza: une la pata corta con el caño largo, a través de la chapa.' },
      usa: ['D · Llave Allen incluida'], check: [[4, 'B · Espárragos'], [4, 'A · Tornillos Allen'], [4, 'C · Regatones'], [1, 'D · Llave Allen']],
      cuenta: { fijo: '12 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajesPiezas(), resaltar: ['llave'], mueven: [mover('llave', 110)],
    },
    paso(1, 'regatones', 'Regatón y espárrago', [
      'Enroscá un regatón C en una punta de cada caño chico 3.',
      'En la otra punta, enroscá un espárrago B hasta la mitad.',
    ], [manta(), ...pies(), ...esparragos()], {
      usa: ['3 · Caños chicos ×4', 'C · Regatones ×4', 'B · Espárragos ×4'], hw: { C: 4, B: 4 },
      titular: 'Regatón abajo, espárrago arriba', resaltar: ['pata', 'esp'], unir: ['pie'],
      mueven: [mover('pata', 50, [0, 0, -1], 0), mover('esp', 80, [0, 0, 1], .4)],
      vista: { yaw: -22, pitch: 30 },
    }),
    paso(2, 'chapa', 'Los caños chicos, en la chapa', [
      'Apoyá una chapa 1 haciendo coincidir cada espárrago con su agujero.',
    ], [manta(), ...base()], {
      usa: ['1 · Chapa'], titular: 'Cada espárrago, en su agujero', resaltar: ['chapa.abajo'], unir: ['pie', 'esp'],
      mueven: [mover('chapa.abajo', 160, [0, 0, 1], 0)], vista: { yaw: -22, pitch: 28 },
    }),
    paso(3, 'canos', 'Los caños grandes', [
      'Enroscá un caño grande 2 en cada espárrago, a mano.',
      'La chapa queda apretada entre los dos caños.',
    ], [manta(), ...base(), ...canos()], {
      usa: ['2 · Caños grandes ×4'], titular: 'A mano, hasta el tope', cuenta: { de: 'cano.', n: 4, txt: 'Caño', fin: '4 caños en su lugar' },
      resaltar: ['cano'], unir: ['chapa.abajo', 'esp'],
      mueven: K.map((k, i) => mover('cano.' + k, 170, [0, 0, 1], i * .3)),
      vista: { yaw: -22, pitch: 22 },
    }),
    paso(4, 'tapa', 'Segunda chapa y tornillos', [
      'Apoyá la segunda chapa sobre los cuatro caños, con cada agujero sobre su caño.',
    ], [manta(), ...mesa()], {
      usa: ['1 · Chapa', 'A · Tornillos Allen ×4', 'D · Llave Allen'], hw: { A: 4 },
      titular: 'Cada agujero, sobre su caño', resaltar: ['chapa.arriba', 'T'], unir: ['cano'],
      subs: { a: ['Apoyá la segunda chapa sobre los cuatro caños, con cada agujero sobre su caño.'], b: ['Poné un tornillo A en cada agujero.', 'Ajustalos con la llave Allen hasta que queden firmes.'], tip: 'Ajustá en cruz: un tornillo y después el de la punta opuesta. Así la tapa asienta pareja.' },
      mueven: [mover('chapa.arriba', 180, [0, 0, 1], 0), mover('T', 80, [0, 0, 1], .6)],
      fases: {
        pieza: ['chapa.arriba'], hw: K.flatMap((k) => [`T.${k}.cana`, `T.${k}.cabeza`, `T.${k}.hex`]), retener: ['T'], ocultarEnA: K.flatMap((k) => [`T.${k}.cana`, `T.${k}.cabeza`, `T.${k}.hex`]),
        ref: 'T.izq', vistaB: { yaw: -40, pitch: 55 }, titularB: 'Un tornillo en cada caño',
        herramienta: { tipo: 'allen', pos: [...PATAS.izq, Z_ARRIBA + CHAPA + 3] },
      },
      vista: { yaw: -22, pitch: 26 },
    }),
    paso(5, 'revisar', 'Revisá que esté firme', [
      'Repasá los cuatro tornillos con la llave.',
      'Si la mesa se mueve, ajustá un poco más.',
    ], [manta(), ...mesa()], {
      usa: ['D · Llave Allen'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['T'], vista: { yaw: -30, pitch: 18 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -26, pitch: 16 }, piezas: mesa(), mueven: [] },
  ],
};
