
const A = 310, RC = 125;                 // óvalo 87 × 25: rectas de ±310 y radio 125
const CHAPA = 2.5, PATA_PL = 12, L_CORTO = 90, L_LARGO = 715, R_CANO = 12.5;
const Z1 = PATA_PL + L_CORTO;            // 102: chapa de abajo
const Z2 = Z1 + CHAPA + L_LARGO;         // 819,5: estante de arriba
const Z3 = Z2 + CHAPA + L_CORTO;         // 912: tapa
const ALTO = Z3 + CHAPA + 3;             // ≈ 92 cm
const RL = 132;
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
const esparragos = (n, z) => K.map((k) => cil(`esp${n}.${k}`, [...PATAS[k], z - 20], 44, 4, 'zinc', { seg: 14 }));
const largos = () => K.map((k) => cil('largo.' + k, [...PATAS[k], Z1 + CHAPA], L_LARGO, R_CANO));
const cortos = () => K.map((k) => cil('corto.' + k, [...PATAS[k], Z2 + CHAPA], L_CORTO, R_CANO));
const tornillos = () => K.flatMap((k) => [
  cil(`T.${k}.cana`, [...PATAS[k], Z3 + CHAPA], 22, 3, 'zinc', { eje: [0, 0, -1], seg: 14 }),
  cil(`T.${k}.cabeza`, [...PATAS[k], Z3 + CHAPA], 3, 7, 'negro', { seg: 24 }),
  cil(`T.${k}.hex`, [...PATAS[k], Z3 + CHAPA + 3], .2, 2.5, 'oscuro', { seg: 6, sinContorno: true, sinAristas: true }),
]);
const nivel1 = () => [...pies(), ...esparragos(1, Z1), chapa('chapa.1', Z1)];
const nivel2 = () => [...nivel1(), ...largos(), ...esparragos(2, Z2), chapa('chapa.2', Z2)];
const recibidor = () => [...nivel2(), ...cortos(), chapa('chapa.3', Z3), ...tornillos()];

const manta = (w = 1250, d = 620, extra = {}) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', ...extra });

const acostado = (id, x, y, largo) => cil(id, [x, y, R_CANO], largo, R_CANO, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1700, 1000, { pos: [0, -30, 0] }),
  ...[0, 1, 2].map((k) => ({ id: 'pz.2.' + k, tipo: 'perfil', puntos: CONT, pos: [-300, 270, k * (CHAPA + .6)], z0: 0, z1: CHAPA, mat: 'chapa' })),
  { id: 'rotulo.2', tipo: 'texto', txt: '2 · CHAPAS ×3', pos: [-300, 440, .3], alto: 44 },
  ...[0, 1, 2, 3].map((k) => acostado('pz.4.' + k, -720, 30 - k * 60, L_LARGO)),
  { id: 'rotulo.4', tipo: 'texto', txt: '4 · CAÑOS 71,5 ×4', pos: [-360, -250, .3], alto: 40 },
  ...Array.from({ length: 8 }, (_, k) => acostado('pz.3.' + k, 220 + (k % 2) * 130, 330 - Math.floor(k / 2) * 60, L_CORTO)),
  { id: 'rotulo.3', tipo: 'texto', txt: '3 · CAÑOS 9 ×8', pos: [330, 60, .3], alto: 40 },
  { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 240, d: 140, r: 24, pos: [480, -260, 0], z0: 0, z1: 22, mat: 'bolsa' },
  { id: 'rotulo.h', tipo: 'texto', txt: 'HERRAJES', pos: [480, -380, .3], alto: 38 },
];
const herrajesPiezas = () => [
  manta(560, 360, { lineas: 0 }),
  ...Array.from({ length: 8 }, (_, i) => cil('h.esp.' + i, [-250 + (i % 2) * 60, -110 + Math.floor(i / 2) * 50, 4], 44, 4, 'zinc', { eje: [1, 0, 0], seg: 14 })),
  ...[0, 1, 2, 3].flatMap((i) => [cil(`h.T.${i}.cana`, [-60 + (i % 2) * 50, -60 + Math.floor(i / 2) * 70, 0], 22, 3, 'zinc', { seg: 14 }), cil(`h.T.${i}.cabeza`, [-60 + (i % 2) * 50, -60 + Math.floor(i / 2) * 70, 22], 3, 7, 'negro', { seg: 24 })]),
  ...[0, 1, 2, 3].map((i) => cil('h.pata.' + i, [70 + (i % 2) * 42, -60 + Math.floor(i / 2) * 70, 0], PATA_PL, 10, 'negro')),
  cil('llave.corto', [210, -50, 3], 26, 3, 'zinc', { eje: [-1, 0, 0], seg: 12 }),
  cil('llave.largo', [210, -50, 3], 82, 3, 'zinc', { eje: [0, 1, 0], seg: 12 }),
  { id: 'rotulo.5', tipo: 'texto', txt: '5', pos: [-215, 145, .3], alto: 32 },
  { id: 'rotulo.1', tipo: 'texto', txt: '1', pos: [-35, 145, .3], alto: 32 },
  { id: 'rotulo.7', tipo: 'texto', txt: '7', pos: [90, 145, .3], alto: 32 },
  { id: 'rotulo.6', tipo: 'texto', txt: '6', pos: [215, 145, .3], alto: 32 },
];

const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const paso = (num, id, titulo, a, piezas, extra = {}) => ({
  num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de 3` },
  vista: { yaw: -20, pitch: 20 }, piezas, mueven: [], resaltar: [], encuadrarTodo: false, ...extra,
});

export default {
  id: 'ch11', version: 1, pasosManual: 3,
  marca: {
    nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022',
    tienda: 'https://dege.com.ar/productos/recibidor1/', instagram: 'https://instagram.com/dege.muebles',
    confeti: ['#1d1d1b', '#ffffff', '#e9e4d6', '#B9654C'],
  },
  materiales: {
    chapa: { color: '#3a3a3a' }, zinc: { color: '#c9ced3' }, negro: { color: '#1a1a1a' }, oscuro: { color: '#0d0d0d' },
    carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 },
  },
  inventario: [{ id: '7', n: 4, label: '7 · Patas plásticas' }, { id: '5', n: 8, label: '5 · Espárragos' }, { id: '1', n: 4, label: '1 · Tornillos Allen' }],
  textos: {
    titulo: 'Armá tu Recibidor CH11 · DEGË Muebles', cabecera: 'Recibidor CH11',
    ladoTitulo: 'Tu recibidor, <em>paso a paso</em>',
    ladoCuerpo: 'Tres chapas ovaladas de 87 × 25 cm y cuatro patas de caño. Seguí los 3 pasos del manual de fábrica y girá el modelo para ver cada unión.',
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá el recibidor para girarlo', girar: 'Arrastrá para girar el recibidor',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>recibidor</em>, paso a paso',
    datos: [['layers', '15 piezas', '+ 16 herrajes'], ['steps', '3 pasos', 'llave Allen incluida'], ['box', '87 × 25 × 92', 'cm · largo, fondo y alto']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: 'Tu recibidor,<br><em>piso por piso</em>', momCuerpo: 'Tres chapas y doce caños. Todo se enrosca a mano; la llave Allen viene en la caja.',
    momTips: [
      ['space', 'Hacé lugar', 'Una manta o el cartón de la caja en el piso'],
      ['kids', 'Separá los caños', '8 cortos de 9 cm y 4 largos de 71,5 cm'],
      ['time', 'Sin apuro', '3 pasos, como en el manual de papel'],
      ['music', 'Y poné música', 'La que te acompañe mientras armás'],
    ],
    momCta: 'Empezar a armar',
    finTitulo: '¡Tu recibidor <em>está listo</em>! 🎉',
    finCuerpo: 'Revisá que apoye firme en sus cuatro patas. Arriba las llaves, en el estante el correo y abajo, las zapatillas.',
    finTip: 'Guardá la llave Allen: cada tanto, repasá los cuatro tornillos de la tapa. ¡Mandanos una foto cuando lo tengas armado!',
    waTexto: '¡Hola DEGË! Estoy armando el Recibidor CH11 y tengo una duda 😊',
    pie: 'DEGË Muebles · Muebles de chapa y caño, de Rosario a todo el país.',
    rvEjemplos: ['Lo armé en un rato 🙌', 'Re claro el paso a paso', 'Entra en el pasillo justo', 'Firme y hermoso'],
  },
  cotas: { w: 87, d: 25, h: 92, unidad: 'cm', caja: [-435, 435, -125, 125, 0, ALTO], lineas: [
    [[435, 0, 0], [-435, 0, 0], [0, 230, 0], 87],
    [[-435, 125, 0], [-435, -125, 0], [-60, 0, 0], 25],
    [[435, 0, 0], [435, 0, Z3 + CHAPA], [50, 0, 0], 92],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -22, pitch: 14 }, piezas: recibidor(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: 3 chapas, 4 caños largos y 8 cortos.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'Observá bien cada pieza antes de encastrarla. Cualquier duda, escribinos.' },
      usa: ['2 · Chapas ×3', '4 · Caños 71,5 cm ×4', '3 · Caños 9 cm ×8'],
      elegir: [
        { m: ['pz.2'], t: 'Son los tres óvalos de 87 × 25 cm, iguales, con cuatro orejas perforadas.' },
        { m: ['pz.4'], t: 'Son los 4 caños largos: van entre la chapa de abajo y el estante de arriba.' },
        { m: ['pz.3'], t: 'Son los 8 caños cortos: 4 son las patas y 4 van entre el estante y la tapa.' },
      ],
      cuenta: { fijo: '15 piezas · 3 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 60 },
      piezas: ordenPiezas(), resaltar: ['pz.2.2'], mueven: [mover('pz.2.2', 160)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 8 espárragos, 4 tornillos Allen, 4 patas plásticas y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'El espárrago es la varilla roscada sin cabeza: une un caño con el siguiente, a través de la chapa.' },
      usa: ['6 · Llave Allen incluida'], check: [[8, '5 · Espárragos'], [4, '1 · Tornillos Allen'], [4, '7 · Patas plásticas'], [1, '6 · Llave Allen']],
      cuenta: { fijo: '16 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajesPiezas(), resaltar: ['llave'], mueven: [mover('llave', 110)],
    },
    paso(1, 'base', 'Patas y chapa de abajo', [
      'Enroscá una pata plástica en un extremo de 4 caños de 9 cm.',
      'En el otro extremo de cada uno, enroscá un espárrago.',
      'Apoyá una chapa haciendo coincidir cada espárrago con su agujero.',
    ], [manta(), ...nivel1()], {
      usa: ['3 · Caños 9 cm ×4', '7 · Patas plásticas ×4', '5 · Espárragos ×4', '2 · Chapa'], hw: { '7': 4, '5': 4 },
      titular: 'Cada espárrago, en su agujero', resaltar: ['chapa.1', 'esp1'], unir: ['pie'],
      mueven: [mover('pata', 50, [0, 0, -1], 0), mover('esp1', 80, [0, 0, 1], .4), mover('chapa.1', 160, [0, 0, 1], .9)],
      vista: { yaw: -20, pitch: 28 },
    }),
    paso(2, 'largos', 'Caños largos y estante', [
      'Enroscá un espárrago en una punta de cada caño de 71,5 cm.',
      'Enroscá esos caños sobre los espárragos de la chapa de abajo.',
      'Apoyá la segunda chapa haciendo coincidir los agujeros.',
    ], [manta(), ...nivel2()], {
      usa: ['4 · Caños 71,5 cm ×4', '5 · Espárragos ×4', '2 · Chapa'], hw: { '5': 4 }, titular: 'A mano, hasta el tope',
      resaltar: ['largo', 'esp2', 'chapa.2'], unir: ['chapa.1'],
      mueven: [mover('largo', 200, [0, 0, 1], 0), mover('esp2', 70, [0, 0, 1], .6), mover('chapa.2', 160, [0, 0, 1], 1)],
    }),
    paso(3, 'tapa', 'Caños cortos y tapa', [
      'Enroscá los 4 caños de 9 cm que quedan sobre los espárragos del estante.',
      'Apoyá la tercera chapa arriba, con cada agujero sobre su caño.',
    ], [manta(), ...recibidor()], {
      usa: ['3 · Caños 9 cm ×4', '2 · Chapa', '1 · Tornillos Allen ×4', '6 · Llave Allen'], hw: { '1': 4 },
      titular: 'La tapa, 9 cm arriba del estante', resaltar: ['corto', 'chapa.3', 'T'], unir: ['chapa.2'],
      subs: { a: ['Enroscá los 4 caños de 9 cm que quedan sobre los espárragos del estante.', 'Apoyá la tercera chapa arriba, con cada agujero sobre su caño.'], b: ['Poné un tornillo Allen en cada agujero.', 'Ajustalos con la llave hasta que queden firmes.'], tip: 'Ajustá en cruz: un tornillo y después el de la punta opuesta. Así la tapa asienta pareja.' },
      mueven: [mover('corto', 120, [0, 0, 1], 0), mover('chapa.3', 160, [0, 0, 1], .5), mover('T', 80, [0, 0, 1], 1)],
      fases: {
        pieza: ['corto.izq', 'corto.centroA', 'corto.centroT', 'corto.der', 'chapa.3'], hw: K.flatMap((k) => [`T.${k}.cana`, `T.${k}.cabeza`, `T.${k}.hex`]), retener: ['T'], ocultarEnA: K.flatMap((k) => [`T.${k}.cana`, `T.${k}.cabeza`, `T.${k}.hex`]),
        ref: 'T.izq', vistaB: { yaw: -40, pitch: 55 }, titularB: 'Un tornillo en cada caño',
        herramienta: { tipo: 'allen', pos: [...PATAS.izq, Z3 + CHAPA + 3] },
      },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -24, pitch: 12 }, piezas: recibidor(), mueven: [] },
  ],
};
