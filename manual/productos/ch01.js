// CH01 · Mesita auxiliar Matera.
// Fuentes: "Manual de armado Mesa Matera CH01.pdf" (Drive › Manuales de armado, 4 p.), ficha de medidas de la web
// (Ø36 cm, 52 cm de alto con la manija, manija de 9 cm) y fotos de la ficha. mm · Z arriba · piso z = 0 · adelante = +Y.
// Ver estudio/ch01-notas.md.

const R = 180;              // chapa Ø36
const RP = 170;             // centro de cada pata: sobre la oreja del borde
const R_CANO = 11;          // caño Ø22
const CHAPA = 2.5, PATA_PL = 12, L_PATA = 415, L_MANIJA = 90;
const Z_CHAPA = PATA_PL + L_PATA;                   // 427: chapa apoyada sobre los caños
const Z_MANIJA = Z_CHAPA + CHAPA;                   // la manija arranca arriba de la chapa
const ALTO = Z_MANIJA + L_MANIJA + 3;               // ≈ 52 cm con la tapita
// Patas a 120°: la de la manija atrás (apenas a la derecha, como en la ficha de medidas) y las otras dos adelante.
// Con la cámara de frente, +X queda a la izquierda.
const ANG = { M: 280, A: 160, B: 40 };
const P = Object.fromEntries(Object.entries(ANG).map(([k, a]) => [k, [RP * Math.cos(a * Math.PI / 180), RP * Math.sin(a * Math.PI / 180)]]));

const cil = (id, pos, largo, r, mat = 'chapa', extra = {}) => ({ id, tipo: 'cilindro', pos, s0: 0, s1: largo, r, mat, seg: 28, ...extra });

// Chapa redonda con tres orejas chicas (donde van los agujeros), como en el dibujo del manual.
function contorno() {
  const pts = [], RE = 16, n = 300, angs = Object.values(ANG).map((a) => a * Math.PI / 180);
  for (let k = 0; k < n; k++) {
    const t = (k / n) * 2 * Math.PI;
    let r = R;
    for (const a of angs) {
      const f = Math.atan2(Math.sin(t - a), Math.cos(t - a)), s = RP * Math.sin(f);
      if (Math.abs(s) <= RE) r = Math.max(r, RP * Math.cos(f) + Math.sqrt(RE * RE - s * s));
    }
    pts.push([r * Math.cos(t), r * Math.sin(t)]);
  }
  return pts;
}
const chapa = () => [{ id: 'chapa', tipo: 'perfil', puntos: contorno(), pos: [0, 0, Z_CHAPA], z0: 0, z1: CHAPA, mat: 'chapa',
  huecos: Object.values(P).map(([x, y]) => ({ x, y, w: 8.5, d: 8.5, r: 4.25 })) }];

const pata = (k) => [cil('pata.' + k, [...P[k], 0], PATA_PL, 9.5, 'negro'), cil('cano.' + k, [...P[k], PATA_PL], L_PATA, R_CANO)];
const esparrago = () => [cil('esparrago', [...P.M, Z_CHAPA - 22], 46, 4, 'zinc', { seg: 14 })];
const manija = () => [
  cil('manija', [...P.M, Z_MANIJA], L_MANIJA, R_CANO),
  cil('manija.aro', [...P.M, Z_MANIJA], 2.5, R_CANO + .7, 'negro'),
  cil('manija.tapa', [...P.M, Z_MANIJA + L_MANIJA], 3, R_CANO - .3, 'negro'),
];
// Tornillo Allen de cabeza plana y ancha (como el del manual), desde arriba de la chapa al caño.
const tornillo = (k) => [
  cil(`T.${k}.cana`, [...P[k], Z_MANIJA], 22, 3, 'zinc', { eje: [0, 0, -1], seg: 14 }),
  cil(`T.${k}.cabeza`, [...P[k], Z_MANIJA], 3, 7, 'negro', { seg: 24 }),
  cil(`T.${k}.hex`, [...P[k], Z_MANIJA + 3], .2, 2.5, 'oscuro', { seg: 6, sinContorno: true, sinAristas: true }),
];
const mesa = () => [...['M', 'A', 'B'].flatMap(pata), ...esparrago(), ...chapa(), ...manija(), ...tornillo('A'), ...tornillo('B')];

const manta = (w = 820, d = 760, extra = {}) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', ...extra });

// ── «Ordená las piezas» ──
const acostado = (id, x, y, largo, r = R_CANO) => cil(id, [x, y, r], largo, r, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1100, 760, { pos: [40, -20, 0] }),
  { id: 'pz.3', tipo: 'perfil', puntos: contorno(), pos: [-270, 30, 0], z0: 0, z1: CHAPA, mat: 'chapa' },
  { id: 'rotulo.3', tipo: 'texto', txt: '3 · CHAPA', pos: [-270, 270, .3], alto: 36 },
  ...[0, 1, 2].map((k) => acostado('pz.5.' + k, 0, -150 + k * 60, L_PATA)),
  { id: 'rotulo.5', tipo: 'texto', txt: '5 · CAÑOS 41,5 ×3', pos: [210, -230, .3], alto: 32 },
  acostado('pz.1', 0, 110, L_MANIJA),
  { id: 'rotulo.1', tipo: 'texto', txt: '1 · CAÑO 9', pos: [45, 175, .3], alto: 32 },
  { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 170, d: 110, r: 22, pos: [330, 130, 0], z0: 0, z1: 20, mat: 'bolsa' },
  { id: 'rotulo.h', tipo: 'texto', txt: 'HERRAJES', pos: [330, 220, .3], alto: 28 },
];
const herrajesPiezas = () => [
  manta(460, 300, { lineas: 0 }),
  cil('h.esp', [-170, -20, 4], 46, 4, 'zinc', { eje: [1, 0, 0], seg: 14 }),
  ...[0, 1].flatMap((i) => [cil(`h.T.${i}.cana`, [-40 + i * 60, -20, 0], 22, 3, 'zinc', { seg: 14 }), cil(`h.T.${i}.cabeza`, [-40 + i * 60, -20, 22], 3, 7, 'negro', { seg: 24 })]),
  ...[0, 1, 2].map((i) => cil('h.pata.' + i, [110 + (i % 2) * 40, -50 + Math.floor(i / 2) * 50 + (i === 2 ? 10 : 0), 0], PATA_PL, 9.5, 'negro')),
  cil('llave.corto', [190, -40, 3], 26, 3, 'zinc', { eje: [-1, 0, 0], seg: 12 }),
  cil('llave.largo', [190, -40, 3], 82, 3, 'zinc', { eje: [0, 1, 0], seg: 12 }),
  { id: 'rotulo.2', tipo: 'texto', txt: '2', pos: [-150, 100, .3], alto: 30 },
  { id: 'rotulo.4', tipo: 'texto', txt: '4', pos: [-10, 100, .3], alto: 30 },
  { id: 'rotulo.6', tipo: 'texto', txt: '6', pos: [125, 100, .3], alto: 30 },
  { id: 'rotulo.7', tipo: 'texto', txt: '7', pos: [195, 100, .3], alto: 30 },
];

const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const paso = (num, id, titulo, a, piezas, extra = {}) => ({
  num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de 3` },
  vista: { yaw: -24, pitch: 22 }, piezas, mueven: [], resaltar: [], encuadrarTodo: false, ...extra,
});

export default {
  id: 'ch01', version: 1, pasosManual: 3,
  marca: {
    nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022',
    tienda: 'https://dege.com.ar/productos/mesita-auxiliar-matera/', instagram: 'https://instagram.com/dege.muebles',
    confeti: ['#C4643E', '#ffffff', '#e9e4d6', '#1d1d1b'],
  },
  materiales: {
    chapa: { color: '#C4643E' }, zinc: { color: '#c9ced3' }, negro: { color: '#242424' }, oscuro: { color: '#111111' },
    carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 },
  },
  inventario: [{ id: '6', n: 3, label: '6 · Patas plásticas' }, { id: '2', n: 1, label: '2 · Espárrago' }, { id: '4', n: 2, label: '4 · Tornillos Allen' }],
  textos: {
    titulo: 'Armá tu Mesita Matera CH01 · DEGË Muebles', cabecera: 'Mesita Matera CH01',
    ladoTitulo: 'Tu mesita Matera, <em>paso a paso</em>',
    ladoCuerpo: 'Una chapa redonda, tres patas y la manija para llevarla con una mano. Seguí los 3 pasos del manual de fábrica y girá el modelo para ver cada unión.',
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá la mesita para girarla', girar: 'Arrastrá para girar la mesita',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>mesita Matera</em>, paso a paso',
    datos: [['layers', '5 piezas', '+ 6 herrajes'], ['steps', '3 pasos', 'llave Allen incluida'], ['box', 'Ø36 × 52', 'cm · diámetro y alto']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: 'Tu Matera,<br><em>en 5 minutos</em>', momCuerpo: 'Tres patas, una chapa y la manija. La llave Allen viene en la caja.',
    momTips: [
      ['space', 'Hacé lugar', 'Una manta o el cartón de la caja en el piso'],
      ['kids', 'Separá los caños', '3 largos de 41,5 cm y 1 corto de 9 cm'],
      ['time', 'Sin apuro', '3 pasos y listo'],
      ['music', 'Y poné música', 'La que te acompañe mientras armás'],
    ],
    momCta: 'Empezar a armar',
    finTitulo: '¡Tu Matera <em>está lista</em>! 🎉',
    finCuerpo: 'Revisá que apoye firme en sus tres patas. La manija te sirve para llevarla de un lado a otro, con el mate encima.',
    finTip: 'Guardá la llave Allen: cada tanto, repasá los dos tornillos de arriba. ¡Mandanos una foto cuando la tengas armada!',
    waTexto: '¡Hola DEGË! Estoy armando la Mesita Matera CH01 y tengo una duda 😊',
    pie: 'DEGË Muebles · Muebles de chapa y caño, de Rosario a todo el país.',
    rvEjemplos: ['La armé en 5 minutos 🙌', 'Re claro el paso a paso', 'La llevo a todos lados', 'Firme y hermosa'],
  },
  cotas: { w: 36, d: 36, h: 52, unidad: 'cm', caja: [-R, R, -R, R, 0, ALTO], lineas: [
    [[R, 0, Z_MANIJA], [-R, 0, Z_MANIJA], [0, 240, 0], 36],
    [[...P.M, 0], [...P.M, ALTO], [-200, 0, 0], 52],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -22, pitch: 20 }, piezas: mesa(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: la chapa, 3 caños largos y 1 corto.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'Observá bien cada pieza antes de encastrarla. Cualquier duda, escribinos.' },
      usa: ['3 · Chapa', '5 · Caños 41,5 cm ×3', '1 · Caño 9 cm'],
      elegir: [
        { m: ['pz.3'], t: 'Es el disco de 36 cm con tres agujeros en el borde.' },
        { m: ['pz.5'], t: 'Son las 3 patas de 41,5 cm.' },
        { m: ['pz.1'], t: 'Es el caño corto de 9 cm: la manija que va arriba.' },
      ],
      cuenta: { fijo: '5 piezas · 3 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 },
      piezas: ordenPiezas(), resaltar: ['pz.1'], mueven: [mover('pz.1', 120)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 1 espárrago, 2 tornillos Allen, 3 patas plásticas y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'El espárrago es la varilla roscada sin cabeza: une una pata con la manija, a través de la chapa.' },
      usa: ['7 · Llave Allen incluida'], check: [[1, '2 · Espárrago'], [2, '4 · Tornillos Allen'], [3, '6 · Patas plásticas'], [1, '7 · Llave Allen']],
      cuenta: { fijo: '6 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 58 },
      piezas: herrajesPiezas(), resaltar: ['llave'], mueven: [mover('llave', 110)],
    },
    paso(1, 'manija', 'Primera pata y manija', [
      'Enroscá una pata plástica en un extremo de cada caño de 41,5 cm.',
      'En uno de esos caños, enroscá el espárrago del otro lado.',
      'Pasalo por un agujero de la chapa y, por arriba, enroscá el caño de 9 cm.',
    ], [manta(), ...pata('M'), ...esparrago(), ...chapa(), ...manija()], {
      usa: ['6 · Patas plásticas ×3', '2 · Espárrago', '3 · Chapa', '1 · Caño 9 cm'], hw: { '6': 3, '2': 1 },
      titular: 'La manija, arriba de la chapa', resaltar: ['pata.M', 'esparrago', 'chapa', 'manija'], unir: ['cano.M'],
      subs: { a: ['Enroscá una pata plástica en un extremo de cada caño de 41,5 cm.', 'En uno de esos caños, enroscá el espárrago del otro lado.', 'Pasalo por un agujero de la chapa y, por arriba, enroscá el caño de 9 cm.'], b: [], tip: 'Por ahora la chapa queda apoyada en una sola pata: sostenela mientras enroscás la manija.' },
      mueven: [mover('pata.M', 50, [0, 0, -1], 0), mover('esparrago', 70, [0, 0, 1], .4), mover('chapa', 120, [0, 0, 1], .8), mover(['manija', 'manija.aro', 'manija.tapa'], 160, [0, 0, 1], 1.2)],
      vista: { yaw: -24, pitch: 24 },
    }),
    paso(2, 'patas', 'Las otras dos patas', [
      'Ubicá los dos caños que quedan debajo de los otros dos agujeros.',
      'Pasá un tornillo Allen por cada agujero desde arriba, sin apretar.',
    ], [manta(), ...mesa()], {
      usa: ['5 · Caños ×2', '4 · Tornillos Allen ×2'], hw: { '4': 2 },
      titular: 'Agujero sobre caño', resaltar: ['cano.A', 'cano.B', 'pata.A', 'pata.B', 'T.A', 'T.B'], unir: ['chapa'],
      mueven: [mover(['cano.A', 'pata.A'], 140, [0, 0, -1], 0), mover(['cano.B', 'pata.B'], 140, [0, 0, -1], .3), mover(['T.A', 'T.B'], 80, [0, 0, 1], .8)],
      vista: { yaw: -30, pitch: 22 },
    }),
    paso(3, 'ajustar', 'Ajustá con la llave', [
      'Ajustá los dos tornillos con la llave Allen.',
    ], [manta(), ...mesa()], {
      usa: ['7 · Llave Allen'], titular: 'Que quede firme', sinFantasma: true, resaltar: ['T'],
      subs: { a: ['Ajustá los dos tornillos con la llave Allen.'], b: ['Apretalos hasta que la mesita quede firme.', 'Revisá que apoye bien en sus tres patas.'], tip: 'Si queda un poco torcida, aflojá, enderezá las patas y volvé a ajustar.' },
      mueven: [mover('T', 6, [0, 0, 1], 0)],
      fases: {
        pieza: ['T.A.cabeza', 'T.B.cabeza'], hw: ['T.A.cabeza', 'T.A.hex', 'T.B.cabeza'], retener: ['T'], ocultarEnA: [],
        ref: 'T.A', vistaB: { yaw: -24, pitch: 58 }, titularB: 'Con la llave Allen',
        herramienta: { tipo: 'allen', pos: [...P.A, Z_MANIJA + 3] },
      },
      vista: { yaw: -24, pitch: 22 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -22, pitch: 16 }, piezas: mesa(), mueven: [] },
  ],
};
