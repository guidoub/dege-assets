
const XL = 285, YL = 135;                // centro de cada pata (a 1,5 cm de los bordes de la tapa)
const TAPA_W = 600, TAPA_D = 300, CHAPA = 2.5, R_CANO = 11, L_CANO = 155, REG = 12;
const ESP_ANG = 2, ALA = 25, OREJA = 12.5;   // ángulo: chapa de 2 mm, ala vertical de 25 mm, orejas de Ø25
const Z_ANG = REG + L_CANO;              // 167: apoyo del ángulo sobre la pata de abajo
const Z_TAPA = Z_ANG + ESP_ANG + L_CANO; // 324: apoyo de la tapa
const ALTO = Z_TAPA + CHAPA + 3;         // ≈ 33 cm con la cabeza del tornillo
const XV = XL - OREJA;                   // 272,5: cara de afuera del ala vertical
const YV = 118;                          // el ala vertical termina antes de las orejas
const R_BARRA = 6.5, XB = XV - ESP_ANG;  // barras Ø13, de cara interna a cara interna (≈ 54 cm)
const Z_BARRA = Z_ANG - ALA / 2;         // centro de las barras, a media ala
const YB = [105, 35, -35, -105];         // 4 barras repartidas en el fondo (0 = la de adelante)
const DZ_PISO = -(Z_ANG - ALA + ESP_ANG); // para armar el bastidor apoyado en el piso (paso 1)

const PATAS = { nf: [-XL, YL], pf: [XL, YL], nb: [-XL, -YL], pb: [XL, -YL] }; // n = −X (derecha en pantalla), f = adelante
const K = Object.keys(PATAS);
const LADOS = { n: -1, p: 1 };

const cil = (id, pos, largo, r, mat = 'chapa', extra = {}) => ({ id, tipo: 'cilindro', pos, s0: 0, s1: largo, r, mat, seg: 28, ...extra });
const caja = (id, x0, x1, y0, y1, z0, alto, mat = 'chapa') => ({ id, tipo: 'perfil', puntos: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], pos: [0, 0, z0], z0: 0, z1: alto, mat });

function alaArriba(sx) {
  const pts = [], n = 24, cx = sx * XL;
  for (let k = 0; k <= n; k++) { const a = Math.PI * k / n; pts.push([cx + OREJA * Math.cos(a), YL + OREJA * Math.sin(a)]); }
  for (let k = 0; k <= n; k++) { const a = Math.PI + Math.PI * k / n; pts.push([cx + OREJA * Math.cos(a), -YL + OREJA * Math.sin(a)]); }
  return pts;
}
const angulo = (s, dz = 0) => {
  const sx = LADOS[s], x0 = sx > 0 ? XV - ESP_ANG : -XV, x1 = sx > 0 ? XV : -XV + ESP_ANG;
  return [
    { id: `ang.${s}.arriba`, tipo: 'perfil', puntos: alaArriba(sx), pos: [0, 0, Z_ANG + dz], z0: 0, z1: ESP_ANG, mat: 'chapa',
      huecos: [YL, -YL].map((y) => ({ x: sx * XL, y, w: 8.5, d: 8.5, r: 4.25 })) },
    caja(`ang.${s}.ala`, x0, x1, -YV, YV, Z_ANG - ALA + ESP_ANG + dz, ALA - ESP_ANG),
  ];
};
const barras = (dz = 0) => YB.map((y, i) => cil('barra.' + i, [-XB, y, Z_BARRA + dz], 2 * XB, R_BARRA, 'chapa', { eje: [1, 0, 0] }));
const tornillosB = (dz = 0) => Object.entries(LADOS).flatMap(([s, sx]) => YB.flatMap((y, i) => [
  cil(`B.${s}.${i}.cana`, [sx * XV, y, Z_BARRA + dz], 14, 2.2, 'zinc', { eje: [-sx, 0, 0], seg: 12 }),
  cil(`B.${s}.${i}.cabeza`, [sx * XV, y, Z_BARRA + dz], 2.5, 5, 'zinc', { eje: [sx, 0, 0], seg: 20 }),
]));
const bastidor = (dz = 0) => [...angulo('n', dz), ...angulo('p', dz), ...barras(dz), ...tornillosB(dz)];

const regatones = () => K.map((k) => cil('reg.' + k, [...PATAS[k], 0], REG, 10, 'negro'));
const pies = () => K.map((k) => cil('pie.' + k, [...PATAS[k], REG], L_CANO, R_CANO));
const esparragos = () => K.map((k) => cil('esp.' + k, [...PATAS[k], Z_ANG - 20], 44, 4, 'zinc', { seg: 14 }));
const canos = () => K.map((k) => cil('cano.' + k, [...PATAS[k], Z_ANG + ESP_ANG], L_CANO, R_CANO));
const tapa = () => ({ id: 'tapa', tipo: 'perfil', forma: 'redondeada', w: TAPA_W, d: TAPA_D, r: 10, pos: [0, 0, Z_TAPA], z0: 0, z1: CHAPA, mat: 'chapa',
  huecos: K.map((k) => ({ x: PATAS[k][0], y: PATAS[k][1], w: 8.5, d: 8.5, r: 4.25 })) });
const tornillosA = () => K.flatMap((k) => [
  cil(`A.${k}.cana`, [...PATAS[k], Z_TAPA + CHAPA], 22, 3, 'zinc', { eje: [0, 0, -1], seg: 14 }),
  cil(`A.${k}.cabeza`, [...PATAS[k], Z_TAPA + CHAPA], 3, 7, 'negro', { seg: 24 }),
  cil(`A.${k}.hex`, [...PATAS[k], Z_TAPA + CHAPA + 3], .2, 2.5, 'oscuro', { seg: 6, sinContorno: true, sinAristas: true }),
]);
const patas = () => [...regatones(), ...pies(), ...esparragos()];
const abajo = () => [...patas(), ...bastidor()];
const conCanos = () => [...abajo(), ...canos()];
const zapatero = () => [...conCanos(), tapa(), ...tornillosA()];
const HW_A = K.flatMap((k) => [`A.${k}.cana`, `A.${k}.cabeza`, `A.${k}.hex`]);
const HW_B = Object.keys(LADOS).flatMap((s) => YB.flatMap((y, i) => [`B.${s}.${i}.cana`, `B.${s}.${i}.cabeza`]));

const manta = (w = 980, d = 720, extra = {}) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', ...extra });

const acostado = (id, x, y, largo, r = R_CANO) => cil(id, [x, y, r], largo, r, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1240, 860, { pos: [60, 0, 0] }),
  { id: 'pz.1', tipo: 'perfil', forma: 'redondeada', w: TAPA_W, d: TAPA_D, r: 10, pos: [-200, 200, 0], z0: 0, z1: CHAPA, mat: 'chapa' },
  { id: 'rotulo.1', tipo: 'texto', txt: '1 · CHAPA SUPERIOR', pos: [-200, 385, .3], alto: 32 },
  ...YB.map((y, i) => acostado('pz.3.' + i, -380, -90 - i * 50, 2 * XB, R_BARRA)),
  { id: 'rotulo.3', tipo: 'texto', txt: '3 · CAÑOS LARGOS ×4', pos: [-110, -320, .3], alto: 30 },
  ...['n', 'p'].flatMap((s, j) => angulo(s, -(Z_ANG - ALA + ESP_ANG)).map((p) => ({ ...p, id: `pz.2.${j}.${p.id.split('.')[2]}`,
    pos: [p.pos[0] + (s === 'n' ? XL + 300 : -XL + 360), p.pos[1] - 150, p.pos[2]] }))),
  { id: 'rotulo.2', tipo: 'texto', txt: '2 · ÁNGULOS ×2', pos: [330, -330, .3], alto: 30 },
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((k) => acostado('pz.4.' + k, 200 + (k % 2) * 190, 90 + Math.floor(k / 2) * 55, L_CANO)),
  { id: 'rotulo.4', tipo: 'texto', txt: '4 · CAÑOS CORTOS ×8', pos: [370, 340, .3], alto: 30 },
  { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 150, d: 110, r: 22, pos: [560, -120, 0], z0: 0, z1: 20, mat: 'bolsa' },
  { id: 'rotulo.h', tipo: 'texto', txt: 'HERRAJES', pos: [560, -30, .3], alto: 26 },
];
const herrajesPiezas = () => [
  manta(660, 340, { lineas: 0 }),
  ...[0, 1, 2, 3].flatMap((i) => [cil(`h.A.${i}.cana`, [-250 + (i % 2) * 48, -50 + Math.floor(i / 2) * 70, 0], 22, 3, 'zinc', { seg: 14 }), cil(`h.A.${i}.cabeza`, [-250 + (i % 2) * 48, -50 + Math.floor(i / 2) * 70, 22], 3, 7, 'negro', { seg: 24 })]),
  ...[0, 1, 2, 3, 4, 5, 6, 7].flatMap((i) => [cil(`h.B.${i}.cana`, [-130 + (i % 4) * 30, -45 + Math.floor(i / 4) * 70, 0], 14, 2.2, 'zinc', { seg: 12 }), cil(`h.B.${i}.cabeza`, [-130 + (i % 4) * 30, -45 + Math.floor(i / 4) * 70, 14], 2.5, 5, 'zinc', { seg: 20 })]),
  ...[0, 1, 2, 3].map((i) => cil('h.C.' + i, [30, -70 + i * 40, 4], 44, 4, 'zinc', { eje: [1, 0, 0], seg: 14 })),
  ...[0, 1, 2, 3].map((i) => cil('h.D.' + i, [140 + (i % 2) * 42, -50 + Math.floor(i / 2) * 70, 0], REG, 10, 'negro')),
  cil('llave.corto', [250, -40, 3], 26, 3, 'zinc', { eje: [-1, 0, 0], seg: 12 }),
  cil('llave.largo', [250, -40, 3], 82, 3, 'zinc', { eje: [0, 1, 0], seg: 12 }),
  { id: 'rotulo.A', tipo: 'texto', txt: 'A', pos: [-226, 120, .3], alto: 30 },
  { id: 'rotulo.B', tipo: 'texto', txt: 'B', pos: [-85, 120, .3], alto: 30 },
  { id: 'rotulo.C', tipo: 'texto', txt: 'C', pos: [52, 120, .3], alto: 30 },
  { id: 'rotulo.D', tipo: 'texto', txt: 'D', pos: [161, 120, .3], alto: 30 },
  { id: 'rotulo.E', tipo: 'texto', txt: 'E', pos: [255, 120, .3], alto: 30 },
];

const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const paso = (num, id, titulo, a, piezas, extra = {}) => ({
  num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de 6` },
  vista: { yaw: -24, pitch: 24 }, piezas, mueven: [], resaltar: [], encuadrarTodo: false, ...extra,
});

export default {
  id: 'ch36', version: 1, pasosManual: 6,
  marca: {
    nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022',
    tienda: 'https://dege.com.ar/productos/zapatero-de-entrada/', instagram: 'https://instagram.com/dege.muebles',
    confeti: ['#3a3a3a', '#ffffff', '#e9e4d6', '#c9ced3'],
  },
  materiales: {
    chapa: { color: '#3a3a3a' }, zinc: { color: '#c9ced3' }, negro: { color: '#1a1a1a' }, oscuro: { color: '#0d0d0d' },
    carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 },
  },
  inventario: [{ id: 'B', n: 8, label: 'B · Tornillos Phillips' }, { id: 'D', n: 4, label: 'D · Regatones' }, { id: 'C', n: 4, label: 'C · Espárragos' }, { id: 'A', n: 4, label: 'A · Tornillos Allen' }],
  textos: {
    titulo: 'Armá tu Zapatero de entrada CH36 · DEGË Muebles', cabecera: 'Zapatero CH36',
    ladoTitulo: 'Tu zapatero, <em>paso a paso</em>',
    ladoCuerpo: 'Una tapa de 60 × 30 cm, cuatro patas de caño y un estante de barras para los zapatos. Seguí los 6 pasos del manual de fábrica y girá el modelo para ver cada unión.',
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá el zapatero para girarlo', girar: 'Arrastrá para girar el zapatero',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>zapatero</em>, paso a paso',
    datos: [['layers', '15 piezas', '+ 20 herrajes'], ['steps', '6 pasos', 'llave Allen incluida'], ['box', '60 × 30 × 33', 'cm · largo, fondo y alto']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: 'Tu zapatero,<br><em>en 20 minutos</em>', momCuerpo: 'Primero el estante de barras, después las patas y al final la tapa. Vas a necesitar un destornillador Phillips: no viene en la caja.',
    momTips: [
      ['space', 'Hacé lugar', 'Una manta o el cartón de la caja en el piso'],
      ['kids', 'Separá los caños', '4 largos para el estante y 8 cortos para las patas'],
      ['time', 'Sin apuro', '6 pasos, como en el manual de papel'],
      ['music', 'Y poné música', 'La que te acompañe mientras armás'],
    ],
    momCta: 'Empezar a armar',
    finTitulo: '¡Tu zapatero <em>está listo</em>! 🎉',
    finCuerpo: 'Abajo y sobre las barras entran hasta 6 pares. Arriba, las llaves y lo que dejás al entrar.',
    finTip: 'Guardá la llave Allen: cada tanto, repasá los cuatro tornillos de arriba. ¡Mandanos una foto cuando lo tengas armado!',
    waTexto: '¡Hola DEGË! Estoy armando el Zapatero de entrada CH36 y tengo una duda 😊',
    pie: 'DEGË Muebles · Muebles de chapa y caño, de Rosario a todo el país.',
    rvEjemplos: ['Lo armé en 20 minutos 🙌', 'Re claro el paso a paso', 'Quedó firme y prolijo', 'El color, tal cual la foto'],
  },
  cotas: { w: 60, d: 30, h: 33, unidad: 'cm', llenar: .6, caja: [-TAPA_W / 2, TAPA_W / 2, -TAPA_D / 2, TAPA_D / 2, 0, ALTO], lineas: [
    [[TAPA_W / 2, TAPA_D / 2, 0], [-TAPA_W / 2, TAPA_D / 2, 0], [0, 140, 0], 60],
    [[-TAPA_W / 2, TAPA_D / 2, 0], [-TAPA_W / 2, -TAPA_D / 2, 0], [-70, 0, 0], 30],
    [[TAPA_W / 2, TAPA_D / 2, 0], [TAPA_W / 2, TAPA_D / 2, Z_TAPA + CHAPA], [60, 0, 0], 33],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -16, pitch: 20 }, piezas: zapatero(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: la chapa, 2 ángulos, 4 caños largos y 8 cortos.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'Los 8 caños cortos son iguales: 4 van abajo y 4 arriba del estante.' },
      usa: ['1 · Chapa superior', '2 · Ángulos ×2', '3 · Caños largos ×4', '4 · Caños cortos ×8'],
      elegir: [
        { m: ['pz.1'], t: 'Es la tapa de 60 × 30 cm, con un agujero en cada esquina.' },
        { m: ['pz.2'], t: 'Son los 2 ángulos: van a los costados y sostienen las barras del estante.' },
        { m: ['pz.3'], t: 'Son los 4 caños largos: las barras donde apoyan los zapatos.' },
        { m: ['pz.4'], t: 'Son los 8 caños cortos: cada pata lleva uno abajo y uno arriba.' },
      ],
      cuenta: { fijo: '15 piezas · 4 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 },
      piezas: ordenPiezas(), resaltar: ['pz.1'], mueven: [mover('pz.1', 120)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 4 tornillos Allen, 8 tornillos Phillips, 4 espárragos, 4 regatones y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'Los tornillos B son los chiquitos con cabeza en cruz: van con un destornillador Phillips, que no viene en la caja.' },
      usa: ['E · Llave Allen incluida', 'Destornillador Phillips (no incluido)'], check: [[4, 'A · Tornillos Allen'], [8, 'B · Tornillos Phillips'], [4, 'C · Espárragos'], [4, 'D · Regatones'], [1, 'E · Llave Allen']],
      cuenta: { fijo: '20 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajesPiezas(), resaltar: ['llave'], mueven: [mover('llave', 110)],
    },
    paso(1, 'estante', 'Ángulos y barras', [
      'Apoyá los 4 caños largos en el piso, paralelos.',
      'Poné un ángulo en cada punta, con las orejas arriba y el ala hacia las barras.',
    ], [manta(), ...bastidor(DZ_PISO)], {
      usa: ['2 · Ángulos ×2', '3 · Caños largos ×4', 'B · Tornillos ×8', 'Destornillador Phillips'], hw: { B: 8 },
      titular: 'Las orejas, hacia arriba', resaltar: ['ang', 'B'], unir: ['barra'],
      subs: { a: ['Apoyá los 4 caños largos en el piso, paralelos.', 'Poné un ángulo en cada punta, con las orejas arriba y el ala hacia las barras.'], b: ['Atornillá cada caño al ángulo con un tornillo B.', 'Son 4 de cada lado: ajustalos con el destornillador Phillips.'], tip: '¡Atención! Verificá la posición de los ángulos antes de atornillar: las orejas con agujero van arriba y hacia afuera.' },
      mueven: [mover('ang.n', 140, [-1, 0, 0], 0), mover('ang.p', 140, [1, 0, 0], .3), mover('B.n', 50, [-1, 0, 0], .8), mover('B.p', 50, [1, 0, 0], .8)],
      fases: {
        pieza: ['ang'], hw: HW_B, retener: ['B'], ocultarEnA: HW_B,
        ref: 'B.n.0', vistaB: { yaw: -62, pitch: 18 }, titularB: 'Un tornillo en cada caño',
        herramienta: { tipo: 'phillips', pos: [-XV - 2.5, YB[0], Z_BARRA + DZ_PISO], eje: [-1, 0, 0] },
      },
      vista: { yaw: -30, pitch: 34 },
    }),
    paso(2, 'patas', 'Regatones y espárragos', [
      'Enroscá un regatón D en una punta de 4 caños cortos.',
      'En la otra punta de cada uno, enroscá un espárrago C hasta la mitad.',
    ], [manta(), ...patas()], {
      usa: ['4 · Caños cortos ×4', 'D · Regatones ×4', 'C · Espárragos ×4'], hw: { D: 4, C: 4 },
      titular: 'Una pata en cada esquina', resaltar: ['reg', 'esp'], unir: ['pie'],
      subs: { a: ['Enroscá un regatón D en una punta de 4 caños cortos.', 'En la otra punta de cada uno, enroscá un espárrago C hasta la mitad.'], b: [], tip: 'El manual de papel dice "los dos caños": son los cuatro, uno por pata.' },
      mueven: [mover('reg', 50, [0, 0, -1], 0), mover('esp', 80, [0, 0, 1], .5)],
      vista: { yaw: -24, pitch: 28 },
    }),
    paso(3, 'apoyar', 'El estante sobre las patas', [
      'Bajá el estante sobre las 4 patas.',
      'Cada espárrago pasa por el agujero de una oreja.',
    ], [manta(), ...abajo()], {
      usa: ['Estante del paso 1'], titular: 'Cada espárrago, en su oreja', resaltar: ['ang', 'barra', 'B'], unir: ['pie', 'esp'],
      mueven: [mover(['ang', 'barra', 'B'], 150, [0, 0, 1], 0)],
      vista: { yaw: -24, pitch: 30 },
    }),
    paso(4, 'canos', 'Los caños de arriba', [
      'Enroscá los otros 4 caños cortos en los espárragos, a mano.',
      'La oreja del ángulo queda apretada entre los dos caños.',
    ], [manta(), ...conCanos()], {
      usa: ['4 · Caños cortos ×4'], titular: 'A mano, hasta el tope', cuenta: { de: 'cano.', n: 4, txt: 'Caño', fin: '4 caños en su lugar' },
      resaltar: ['cano'], unir: ['ang', 'esp'],
      mueven: K.map((k, i) => mover('cano.' + k, 140, [0, 0, 1], i * .3)),
    }),
    paso(5, 'tapa', 'Chapa superior y tornillos', [
      'Apoyá la chapa superior con cada agujero sobre un caño.',
    ], [manta(), ...zapatero()], {
      usa: ['1 · Chapa superior', 'A · Tornillos Allen ×4', 'E · Llave Allen'], hw: { A: 4 },
      titular: 'Cada agujero, sobre su caño', resaltar: ['tapa', 'A'], unir: ['cano'],
      subs: { a: ['Apoyá la chapa superior con cada agujero sobre un caño.'], b: ['Poné un tornillo A en cada agujero.', 'Ajustalos con la llave Allen hasta que la tapa quede firme.'], tip: 'Primero enroscá los 4 a mano y recién después ajustalos con la llave.' },
      mueven: [mover('tapa', 150, [0, 0, 1], 0), mover('A', 80, [0, 0, 1], .6)],
      fases: {
        pieza: ['tapa'], hw: HW_A, retener: ['A'], ocultarEnA: HW_A,
        ref: 'A.nf', vistaB: { yaw: -26, pitch: 56 }, titularB: 'Un tornillo en cada caño',
        herramienta: { tipo: 'allen', pos: [...PATAS.nf, Z_TAPA + CHAPA + 3] },
      },
    }),
    paso(6, 'ajuste', 'Revisá que todo esté firme', [
      'Repasá los 8 tornillos de las barras y los 4 de arriba.',
      'Si algo se mueve, ajustalo un poco más.',
    ], [manta(), ...zapatero()], {
      usa: ['Destornillador Phillips', 'E · Llave Allen'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['A', 'B'],
      subs: { a: ['Repasá los 8 tornillos de las barras y los 4 de arriba.', 'Si algo se mueve, ajustalo un poco más.'], b: [], tip: 'Ajustá firme, sin pasarte de rosca: la chapa no necesita fuerza.' },
      vista: { yaw: -40, pitch: 22 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -24, pitch: 18 }, piezas: zapatero(), mueven: [] },
  ],
};
