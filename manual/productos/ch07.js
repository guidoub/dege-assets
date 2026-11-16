// CH07 · Mesita de luz / Mesita irregular 3 pisos.
// Fuentes: "Manual de armado Mesa 3 pisos irreg CH07.pdf" (Drive, p1–p5), ficha técnica (28 × 65 cm) y fotos de la ficha.
// mm · Z arriba · piso z = 0 · adelante = +Y. Ver estudio/ch07-notas.md (qué es real y qué es estimado).
//
// Geometría (de las fotos): las 3 patas forman un triángulo equilátero. Cada chapa (Ø 280) tiene dos orejas
// opuestas por el diámetro y se apoya entre dos patas: arriba A–C, en el medio B–C, abajo A–B.
//   Pata A: pie de 9 cm + caño de 53,6 (chapa de abajo → chapa de arriba)
//   Pata B: pie de 9 cm + caño de 26,5 (chapa de abajo → chapa del medio)
//   Pata C: caño de 36,1 desde el piso + caño de 26,5 (chapa del medio → chapa de arriba)

const R = 140;                 // radio de cada chapa (Ø 28 cm)
const RP = 143;                // centro de la pata: sobre la oreja, apenas afuera del borde
const R_CANO = 11;             // caño Ø 22
const CHAPA = 2.5;
const PATA_PL = 12;            // pata plástica
const Z_ABAJO = PATA_PL + 90;                  // 102: chapa de abajo, sobre los pies de 9 cm
const Z_MEDIO = PATA_PL + 361;                 // 373: chapa del medio, sobre el caño de 36,1
const Z_ARRIBA = Z_ABAJO + CHAPA + 536;        // 640,5: chapa de arriba, sobre el caño de 53,6
const ALTO = Z_ARRIBA + CHAPA + 3.5;           // ≈ 646 con la cabeza del tornillo

// Patas: triángulo equilátero de lado 2·RP, centrado en el origen (A y C atrás, B adelante).
const H_TRI = 2 * RP * Math.sqrt(3) / 2;
// +X se ve a la izquierda con la cámara de frente: A queda a la izquierda de la foto, como en la ficha.
const P = { A: [RP, -H_TRI / 3], C: [-RP, -H_TRI / 3], B: [0, 2 * H_TRI / 3] };
const medio = (u, v) => [(P[u][0] + P[v][0]) / 2, (P[u][1] + P[v][1]) / 2];

const cil = (id, pos, s1, r, mat = 'chapa', extra = {}) => ({ id, tipo: 'cilindro', pos, s0: 0, s1, r, mat, seg: 28, ...extra });

// Chapa redonda con dos orejas (unión de círculo + dos lóbulos), con el agujero de cada oreja.
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
// Chapa suelta: orejas en el ángulo a y en a + 180°.
function chapaLibre(id, [x, y, z], a, mat = 'chapa') {
  const ang = [a, a + Math.PI];
  return {
    id, tipo: 'perfil', puntos: contorno(ang), pos: [x, y, z], z0: 0, z1: CHAPA, mat,
    huecos: ang.map((t) => ({ x: RP * Math.cos(t), y: RP * Math.sin(t), w: 9, d: 9, r: 4.5 })),
  };
}
// Chapa montada entre las patas u y v (centrada en el lado del triángulo).
const chapa = (id, u, v, z) => { const [x, y] = medio(u, v); return chapaLibre(id, [x, y, z], Math.atan2(P[u][1] - y, P[u][0] - x)); };

const pataPlastica = (id, [x, y], z = 0) => [cil(id, [x, y, z], PATA_PL, 9.5, 'negro')];
const esparrago = (id, [x, y], zUnion) => [cil(id, [x, y, zUnion - 15], 30, 4, 'zinc', { seg: 16 })];
const tornillo = (id, [x, y], z) => [
  cil(id + '.cana', [x, y, z], 18, 3, 'zinc', { eje: [0, 0, -1], seg: 16 }),
  cil(id + '.cabeza', [x, y, z], 3.5, 6.5, 'negro', { seg: 24 }),
  cil(id + '.hexagono', [x, y, z + 3.5], .2, 2.4, 'oscuro', { seg: 6, sinContorno: true, sinAristas: true }),
];

// ── conjuntos ──
const pies = () => ['A', 'B'].flatMap((k) => [...pataPlastica('pata.' + k, P[k]), cil('cano9.' + k, [...P[k], PATA_PL], 90, R_CANO)]);
const espAbajo = () => ['A', 'B'].flatMap((k) => esparrago('esp.' + k, P[k], Z_ABAJO));
const chapaAbajo = () => [chapa('chapa.abajo', 'A', 'B', Z_ABAJO)];
const canosBase = () => [
  cil('cano536', [...P.A, Z_ABAJO + CHAPA], 536, R_CANO),
  // 26,5 cm de catálogo: se dibuja hasta la chapa del medio (3,5 mm más) para que no quede una luz.
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

// ── «Ordená las piezas»: todo sobre la manta, agrupado ──
const acostado = (id, x, y, largo) => cil(id, [x, y, R_CANO], largo, R_CANO, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1060, 700, { pos: [10, -10, 0] }),
  // las tres chapas apiladas
  ...[0, 1, 2].map((i) => chapaLibre('pz.chapa.' + i, [-330, 40, i * (CHAPA + .6)], 0)),
  { id: 'rotulo.chapa', tipo: 'texto', txt: 'CHAPAS ×3', pos: [-330, 245, .3], alto: 40 },
  acostado('pz.c536', -110, -250, 536),
  { id: 'rotulo.c536', tipo: 'texto', txt: '53,6', pos: [480, -250, .3], alto: 40 },
  acostado('pz.c361', -110, -170, 361),
  { id: 'rotulo.c361', tipo: 'texto', txt: '36,1', pos: [305, -170, .3], alto: 40 },
  acostado('pz.c265.0', -110, -90, 265),
  acostado('pz.c265.1', -110, -35, 265),
  { id: 'rotulo.c265', tipo: 'texto', txt: '26,5 ×2', pos: [255, -62, .3], alto: 40 },
  acostado('pz.c9.0', -110, 60, 90),
  acostado('pz.c9.1', -110, 115, 90),
  { id: 'rotulo.c9', tipo: 'texto', txt: '9 ×2', pos: [40, 88, .3], alto: 40 },
  { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 230, d: 140, r: 26, pos: [270, 180, 0], z0: 0, z1: 22, mat: 'bolsa' },
  { id: 'rotulo.bolsa', tipo: 'texto', txt: 'HERRAJES', pos: [270, 290, .3], alto: 34 },
];

// ── «Contá los herrajes» ──
const herrajesPiezas = () => [
  manta(500, 330, { lineas: 0, pos: [0, 15, 0] }),
  ...[0, 1, 2].flatMap((i) => tornillo('h.T.' + i, [-190, -70 + i * 60], 3)).map((p) => p.id.endsWith('.cana') ? { ...p, eje: [1, 0, 0], pos: [p.pos[0], p.pos[1], 6.5] } : p.id.endsWith('.cabeza') ? { ...p, eje: [-1, 0, 0], pos: [p.pos[0], p.pos[1], 6.5] } : null).filter(Boolean),
  ...[0, 1, 2].map((i) => cil('h.esp.' + i, [-80, -70 + i * 60, 4], 30, 4, 'zinc', { eje: [1, 0, 0], seg: 16 })),
  ...[0, 1, 2].map((i) => cil('h.pata.' + i, [62, -70 + i * 60, 0], PATA_PL, 9.5, 'negro')),
  cil('llave.corto', [185, -50, 3], 26, 3, 'zinc', { eje: [-1, 0, 0], seg: 12 }),
  cil('llave.largo', [185, -50, 3], 82, 3, 'zinc', { eje: [0, 1, 0], seg: 12 }),
  { id: 'rotulo.T', tipo: 'texto', txt: 'TORNILLOS', pos: [-185, 140, .3], alto: 24 },
  { id: 'rotulo.E', tipo: 'texto', txt: 'ESPÁRRAGOS', pos: [-65, 140, .3], alto: 24 },
  { id: 'rotulo.P', tipo: 'texto', txt: 'PATAS', pos: [62, 140, .3], alto: 24 },
  { id: 'rotulo.L', tipo: 'texto', txt: 'LLAVE', pos: [190, 140, .3], alto: 24 },
];

const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const afuera = (k) => { const [x, y] = P[k], l = Math.hypot(x, y); return [.97 * x / l, .97 * y / l, -.22]; };
const paso = (num, id, titulo, a, piezas, extra = {}) => ({
  num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de 5` },
  vista: { yaw: -28, pitch: 24 }, piezas, mueven: [], resaltar: [], encuadrarTodo: false, ...extra,
});

export default {
  id: 'ch07', version: 1, pasosManual: 5,
  marca: {
    nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022',
    tienda: 'https://dege.com.ar/productos/mesita-de-luz-3-pisos/', instagram: 'https://instagram.com/dege.muebles',
    confeti: ['#B0552F', '#ffffff', '#e9e4d6', '#1d1d1b'],
  },
  materiales: {
    chapa: { color: '#B0552F' }, zinc: { color: '#c9ced3' }, negro: { color: '#242424' }, oscuro: { color: '#111111' },
    carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 }, senal: { color: '#ff6a3d' },
  },
  inventario: [
    { id: 'P', n: 3, label: 'Patas' },
    { id: 'E', n: 3, label: 'Espárragos' },
    { id: 'T', n: 3, label: 'Tornillos' },
  ],
  textos: {
    titulo: 'Armá tu Mesita de luz 3 pisos · DEGË Muebles', cabecera: 'Mesita 3 pisos',
    ladoTitulo: 'Tu mesita de 3 pisos, <em>paso a paso</em>',
    ladoCuerpo: 'Tres chapas de 28 cm a tres alturas, sobre tres patas de caño. Seguí los 5 pasos del manual de fábrica y girá el modelo para ver cada unión.',
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá la mesita para girarla', girar: 'Arrastrá para girar la mesita',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>mesita de 3 pisos</em>, paso a paso',
    datos: [['layers', '9 piezas', '+ 9 herrajes'], ['person', '1 persona', 'alcanza'], ['clock', '10 minutos', 'llave incluida']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: 'Tu mesita,<br><em>en 10 minutos</em>', momCuerpo: 'Tres chapas, seis caños y una llave Allen: no necesitás otra herramienta.',
    momTips: [
      ['space', 'Hacé lugar', 'Una manta o un cartón en el piso'],
      ['kids', 'Separá los caños', 'Son de 4 largos: 53,6 · 36,1 · 26,5 · 9 cm'],
      ['time', 'Sin apuro', '5 pasos, como en el manual de papel'],
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
  // Ø de cada chapa (28 cm) sobre la de arriba y alto total (65 cm), según la ficha técnica.
  cotas: { w: 28, d: 0, h: 65, unidad: 'cm', caja: [-283, 283, -223, 223, 0, ALTO], lineas: [
    [[-R, P.A[1], Z_ARRIBA + CHAPA], [R, P.A[1], Z_ARRIBA + CHAPA], [0, -175, 0], 28],
    [[P.A[0], P.A[1], 0], [P.A[0], P.A[1], ALTO], [Math.sign(P.A[0]) * 150, 0, 0], 65],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -24, pitch: 18 }, piezas: mesita(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Separá los caños por largo',
      subs: { a: ['Sacá todo de la caja y separá los caños por largo: son 4 medidas distintas.', 'Las tres chapas son iguales: cualquiera va en cualquier piso.'], b: [], tip: 'Si te confundís de caño, la mesita queda torcida: medilos antes de empezar.' },
      usa: ['1 · Chapas ×3', '4 · Caño 53,6 cm', '5 · Caño 36,1 cm', '3 · Caños 26,5 cm ×2', '7 · Caños 9 cm ×2'],
      elegir: [
        { m: ['pz.chapa'], t: 'Son los tres discos de chapa de 28 cm, con dos orejas perforadas cada uno. Son iguales entre sí.' },
        { m: ['pz.c536'], t: 'Es el caño más largo (53,6 cm): va de la chapa de abajo a la de arriba.' },
        { m: ['pz.c361'], t: 'Es el caño de 36,1 cm: va del piso a la chapa del medio.' },
        { m: ['pz.c265'], t: 'Son los dos caños iguales de 26,5 cm: unen las chapas entre sí.' },
        { m: ['pz.c9'], t: 'Son los dos caños cortitos de 9 cm: los pies de la chapa de abajo.' },
      ],
      cuenta: { fijo: '9 piezas · 4 largos de caño' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 },
      piezas: ordenPiezas(), resaltar: ['pz.chapa.2'], mueven: [mover('pz.chapa.2', 160)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Abrí la bolsa sobre la manta.', 'Son 3 tornillos Allen, 3 espárragos, 3 patas plásticas y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'El espárrago es la varilla roscada sin cabeza: une dos caños a través de la chapa.' },
      usa: ['8 · Llave Allen incluida'], check: [[3, '2 · Tornillos Allen'], [3, '6 · Espárragos'], [3, '9 · Patas plásticas'], [1, '8 · Llave Allen']],
      cuenta: { fijo: '9 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 },
      piezas: herrajesPiezas(), resaltar: ['llave'], mueven: [mover('llave', 110)],
    },
    paso(1, 'base', 'Armá la base', [
      'Enroscá una pata plástica en un extremo de cada caño de 9 cm.',
      'En el otro extremo, enroscá un espárrago.',
      'Apoyá una chapa haciendo coincidir los espárragos con sus agujeros.',
    ], [manta(), ...paso1()], {
      usa: ['7 · Caños 9 cm ×2', '9 · Patas plásticas ×2', '6 · Espárragos ×2', '1 · Chapa'], hw: { P: 2, E: 2 },
      titular: 'Cada espárrago, en su agujero', resaltar: ['chapa.abajo', 'esp'], unir: ['cano9', 'pata'],
      mueven: [mover('cano9', 70, [0, 0, 1], 0), mover('esp', 90, [0, 0, 1], .5), mover('chapa.abajo', 150, [0, 0, 1], 1)],
      // de costado a la línea A–B: los dos pies se ven separados
      vista: { yaw: 55, pitch: 26 },
    }),
    paso(2, 'canos', 'Enroscá los dos caños', [
      'Enroscá el caño de 26,5 cm en uno de los espárragos.',
      'En el otro, enroscá el caño de 53,6 cm.',
      'La chapa queda apretada entre los pies y los caños.',
    ], [manta(), ...paso2(),
      ...['A', 'B'].map((k) => ({ id: 'giro.' + k, tipo: 'giro', pos: [...P[k], Z_ABAJO + 60], r0: 19, r1: 30, desde: -150, hasta: 128, mat: 'senal', sinContorno: true }))], {
      usa: ['3 · Caño 26,5 cm', '4 · Caño 53,6 cm'], titular: 'A mano, hasta el tope', cuenta: { de: 'cano', n: 2, txt: 'Caño', fin: '2 caños en su lugar' },
      resaltar: ['cano536', 'cano265.B'], unir: ['chapa.abajo', 'esp', 'giro'], vista: { yaw: 55, pitch: 24 },
      mueven: [mover('cano265.B', 150, [0, 0, 1], 0), mover('cano536', 150, [0, 0, 1], .4)],
      subs: { a: ['Enroscá el caño de 26,5 cm en uno de los espárragos.', 'En el otro, enroscá el caño de 53,6 cm.'], b: [], tip: 'Da igual en cuál va cada uno: la mesita se arma igual de los dos lados.' },
    }),
    paso(3, 'medio', 'Segunda chapa y tercera pata', [
      'Apoyá la segunda chapa sobre el caño de 26,5 y poné un tornillo Allen, sin apretar.',
      'Enroscá un espárrago y una pata plástica en el caño de 36,1 cm.',
      'Pasá el espárrago por el otro agujero de la chapa: ya tenés las 3 patas.',
    ], [manta(), ...paso3()], {
      usa: ['1 · Chapa', '2 · Tornillo Allen', '5 · Caño 36,1 cm', '6 · Espárrago', '9 · Pata plástica'], hw: { T: 1, E: 1, P: 1 },
      titular: 'La pata de 36,1, del otro lado', resaltar: ['chapa.medio', 'T.B', 'cano361', 'pata.C', 'esp.C'], unir: ['cano265.B'],
      mueven: [mover('chapa.medio', 150, [0, 0, 1], 0), mover('T.B', 90, [0, 0, 1], .5), mover(['cano361', 'pata.C', 'esp.C'], 190, afuera('C'), 1)],
      vista: { yaw: 15, pitch: 24 },
    }),
    paso(4, 'arriba', 'Poné la chapa de arriba', [
      'Enroscá el último caño de 26,5 cm sobre el espárrago de la chapa del medio.',
      'Apoyá la tercera chapa sobre ese caño y el de 53,6 cm.',
      'Hacé coincidir los agujeros y poné los 2 tornillos Allen.',
    ], [manta(), ...mesita()], {
      usa: ['3 · Caño 26,5 cm', '1 · Chapa', '2 · Tornillos Allen ×2'], hw: { T: 2 },
      titular: 'Cada agujero, sobre su caño', resaltar: ['cano265.C', 'chapa.arriba', 'T.A', 'T.C'], unir: ['cano536', 'chapa.medio'],
      mueven: [mover('cano265.C', 150, [0, 0, 1], 0), mover('chapa.arriba', 160, [0, 0, 1], .5), mover(['T.A', 'T.C'], 90, [0, 0, 1], 1)],
      vista: { yaw: -10, pitch: 28 },
    }),
    paso(5, 'ajustar', 'Ajustá los tres tornillos', [
      'Con la llave Allen, ajustá los tres tornillos.',
    ], [manta(), ...mesita()], {
      usa: ['8 · Llave Allen'], titular: 'Con la llave Allen', resaltar: ['T'], sinFantasma: true,
      subs: { a: ['Con la llave Allen, ajustá los tres tornillos.'], b: ['Apretalos bien, sin forzar la rosca.', 'Revisá que la mesita apoye firme en sus tres patas.'], tip: 'Si queda un poco torcida, aflojá, enderezá los caños y volvé a ajustar.' },
      mueven: [mover('T', 6, [0, 0, 1], 0)],
      fases: {
        pieza: ['T.A.cabeza', 'T.C.cabeza', 'T.B.cabeza'], hw: ['T.A.cabeza', 'T.A.hexagono', 'T.C.cabeza', 'T.B.cabeza'],
        retener: ['T'], ocultarEnA: [], ref: 'T.A', vistaB: { yaw: -24, pitch: 58 }, titularB: 'Bien ajustados',
        herramienta: { tipo: 'allen', pos: [...P.A, Z_ARRIBA + CHAPA + 3.5] },
      },
      vista: { yaw: -24, pitch: 24 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -30, pitch: 16 }, piezas: mesita(), mueven: [] },
  ],
};
