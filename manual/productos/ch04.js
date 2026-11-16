
const R = 180, RP = 170;                 // chapa Ø36, centro de cada pata sobre la oreja
const CHAPA = 2.5, PATA_PL = 12, L_CORTO = 90, L_LARGO = 325, R_CANO = 11;
const Z1 = PATA_PL + L_CORTO;            // 102: chapa de abajo
const Z2 = Z1 + CHAPA + L_LARGO;         // 429,5: chapa del medio
const Z3 = Z2 + CHAPA + L_LARGO;         // 757: chapa de arriba
const ALTO = Z3 + CHAPA + 3;             // ≈ 76 cm (la ficha dice 77)
const ANG = { A: 30, B: 150, C: 270 };   // A adelante-izquierda (en pantalla), B adelante-derecha, C atrás
const P = Object.fromEntries(Object.entries(ANG).map(([k, a]) => [k, [RP * Math.cos(a * Math.PI / 180), RP * Math.sin(a * Math.PI / 180)]]));
const K = Object.keys(P);

const cil = (id, pos, largo, r, mat = 'chapa', extra = {}) => ({ id, tipo: 'cilindro', pos, s0: 0, s1: largo, r, mat, seg: 28, ...extra });

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
const CONT = contorno();
const chapa = (id, z) => ({ id, tipo: 'perfil', puntos: CONT, pos: [0, 0, z], z0: 0, z1: CHAPA, mat: 'chapa',
  huecos: Object.values(P).map(([x, y]) => ({ x, y, w: 8.5, d: 8.5, r: 4.25 })) });

const pies = () => K.flatMap((k) => [cil('pata.' + k, [...P[k], 0], PATA_PL, 9.5, 'negro'), cil('pie.' + k, [...P[k], PATA_PL], L_CORTO, R_CANO)]);
const esparragos = (pre, z) => K.map((k) => cil(pre + '.' + k, [...P[k], z - 20], 44, 4, 'zinc', { seg: 14 }));
const canos = (pre, z) => K.map((k) => cil(pre + '.' + k, [...P[k], z + CHAPA], L_LARGO, R_CANO));
const tornillos = () => K.flatMap((k) => [
  cil(`T.${k}.cana`, [...P[k], Z3 + CHAPA], 22, 3, 'zinc', { eje: [0, 0, -1], seg: 14 }),
  cil(`T.${k}.cabeza`, [...P[k], Z3 + CHAPA], 3, 7, 'negro', { seg: 24 }),
  cil(`T.${k}.hex`, [...P[k], Z3 + CHAPA + 3], .2, 2.5, 'oscuro', { seg: 6, sinContorno: true, sinAristas: true }),
]);
const base = () => [...pies(), ...esparragos('esp', Z1), chapa('chapa.abajo', Z1)];
const piso1 = () => [...base(), ...canos('cano', Z1)];
const medio = () => [...piso1(), ...esparragos('esp2', Z2), chapa('chapa.medio', Z2)];
const piso2 = () => [...medio(), ...canos('cano2', Z2)];
const mesa = () => [...piso2(), chapa('chapa.arriba', Z3), ...tornillos()];

const manta = (w = 820, d = 760, extra = {}) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', ...extra });

const acostado = (id, x, y, largo) => cil(id, [x, y, R_CANO], largo, R_CANO, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1120, 860, { pos: [40, -30, 0] }),
  ...[0, 1, 2].map((k) => ({ id: 'pz.2.' + k, tipo: 'perfil', puntos: CONT, pos: [-280, 40, k * (CHAPA + .6)], z0: 0, z1: CHAPA, mat: 'chapa' })),
  { id: 'rotulo.2', tipo: 'texto', txt: '1 · CHAPAS ×3', pos: [-280, 280, .3], alto: 36 },
  ...[0, 1, 2, 3, 4, 5].map((k) => acostado('pz.3.' + k, 20, -300 + k * 50, L_LARGO)),
  { id: 'rotulo.3', tipo: 'texto', txt: '2 · CAÑOS LARGOS ×6', pos: [180, -370, .3], alto: 32 },
  ...[0, 1, 2].map((k) => acostado('pz.6.' + k, 20 + k * 120, 110, L_CORTO)),
  { id: 'rotulo.6', tipo: 'texto', txt: '3 · CAÑOS CORTOS ×3', pos: [140, 180, .3], alto: 32 },
  { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 170, d: 110, r: 22, pos: [470, -150, 0], z0: 0, z1: 20, mat: 'bolsa' },
  { id: 'rotulo.h', tipo: 'texto', txt: 'HERRAJES', pos: [470, -60, .3], alto: 28 },
];
const herrajesPiezas = () => [
  manta(540, 320, { lineas: 0 }),
  ...[0, 1, 2, 3, 4, 5].map((i) => cil('h.esp.' + i, [-235 + Math.floor(i / 3) * 60, -60 + (i % 3) * 45, 4], 44, 4, 'zinc', { eje: [1, 0, 0], seg: 14 })),
  ...[0, 1, 2].flatMap((i) => [cil(`h.T.${i}.cana`, [-50 + (i % 2) * 50, -50 + Math.floor(i / 2) * 70, 0], 22, 3, 'zinc', { seg: 14 }), cil(`h.T.${i}.cabeza`, [-50 + (i % 2) * 50, -50 + Math.floor(i / 2) * 70, 22], 3, 7, 'negro', { seg: 24 })]),
  ...[0, 1, 2].map((i) => cil('h.pata.' + i, [80 + (i % 2) * 42, -50 + Math.floor(i / 2) * 70, 0], PATA_PL, 9.5, 'negro')),
  cil('llave.corto', [200, -40, 3], 26, 3, 'zinc', { eje: [-1, 0, 0], seg: 12 }),
  cil('llave.largo', [200, -40, 3], 82, 3, 'zinc', { eje: [0, 1, 0], seg: 12 }),
  { id: 'rotulo.4', tipo: 'texto', txt: 'B', pos: [-180, 120, .3], alto: 30 },
  { id: 'rotulo.1', tipo: 'texto', txt: 'A', pos: [-25, 120, .3], alto: 30 },
  { id: 'rotulo.7', tipo: 'texto', txt: 'C', pos: [100, 120, .3], alto: 30 },
  { id: 'rotulo.5', tipo: 'texto', txt: 'D', pos: [205, 120, .3], alto: 30 },
];

const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const paso = (num, id, titulo, a, piezas, extra = {}) => ({
  num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de 7` },
  vista: { yaw: -18, pitch: 22 }, piezas, mueven: [], resaltar: [], encuadrarTodo: false, ...extra,
});
const HW_T = K.flatMap((k) => [`T.${k}.cana`, `T.${k}.cabeza`, `T.${k}.hex`]);

export default {
  id: 'ch04', version: 1, pasosManual: 7,
  marca: {
    nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022',
    tienda: 'https://dege.com.ar/productos/mesa-auxiliar-3-pisos/', instagram: 'https://instagram.com/dege.muebles',
    confeti: ['#E3B21E', '#ffffff', '#e9e4d6', '#1d1d1b'],
  },
  materiales: {
    chapa: { color: '#E3B21E' }, zinc: { color: '#c9ced3' }, negro: { color: '#242424' }, oscuro: { color: '#111111' },
    carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 },
  },
  inventario: [{ id: 'C', n: 3, label: 'C · Regatones' }, { id: 'B', n: 6, label: 'B · Espárragos' }, { id: 'A', n: 3, label: 'A · Tornillos Allen' }],
  textos: {
    titulo: 'Armá tu Mesa auxiliar 3 pisos CH04 · DEGË Muebles', cabecera: 'Mesa 3 pisos CH04',
    ladoTitulo: 'Tu mesa de 3 pisos, <em>paso a paso</em>',
    ladoCuerpo: 'Tres chapas redondas de 36 cm, una cada 33 cm, sobre tres patas de caño. Seguí los 7 pasos del manual de fábrica y girá el modelo para ver cada unión.',
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá la mesa para girarla', girar: 'Arrastrá para girar la mesa',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>mesa de 3 pisos</em>, paso a paso',
    datos: [['layers', '12 piezas', '+ 12 herrajes'], ['steps', '7 pasos', 'llave Allen incluida'], ['box', 'Ø36 × 77', 'cm · diámetro y alto']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: 'Tu mesa,<br><em>en 15 minutos</em>', momCuerpo: 'Tres chapas y tres columnas de caño. Todo se enrosca a mano; la llave Allen viene en la caja.',
    momTips: [
      ['space', 'Hacé lugar', 'Una manta o el cartón de la caja en el piso'],
      ['kids', 'Separá los caños', '3 cortos de 9 cm y 6 largos de 32,5 cm'],
      ['time', 'Sin apuro', '7 pasos, como en el manual de papel'],
      ['music', 'Y poné música', 'La que te acompañe mientras armás'],
    ],
    momCta: 'Empezar a armar',
    finTitulo: '¡Tu mesa <em>está lista</em>! 🎉',
    finCuerpo: 'Revisá que apoye firme en sus tres patas. Arriba una lámpara, al medio una planta y abajo libros o velas.',
    finTip: 'Guardá la llave Allen: cada tanto, repasá los tres tornillos de arriba. ¡Mandanos una foto cuando la tengas armada!',
    waTexto: '¡Hola DEGË! Estoy armando la Mesa auxiliar 3 pisos CH04 y tengo una duda 😊',
    pie: 'DEGË Muebles · Muebles de chapa y caño, de Rosario a todo el país.',
    rvEjemplos: ['La armé en 15 minutos 🙌', 'Re claro el paso a paso', 'Quedó firme y hermosa', 'El color, tal cual la foto'],
  },
  cotas: { w: 36, d: 36, h: 77, unidad: 'cm', caja: [-R, R, -R, R, 0, ALTO], lineas: [
    [[R, 0, 0], [-R, 0, 0], [0, 260, 0], 36],
    [[...P.A, 0], [...P.A, Z3 + CHAPA], [130, 0, 0], 77],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -14, pitch: 18 }, piezas: mesa(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: 3 chapas, 6 caños largos y 3 cortos.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'Observá bien cada pieza antes de encastrarla. Cualquier duda, escribinos.' },
      usa: ['1 · Chapas ×3', '2 · Caños largos ×6', '3 · Caños cortos ×3'],
      elegir: [
        { m: ['pz.2'], t: 'Son los tres discos de 36 cm, iguales, con tres orejas perforadas.' },
        { m: ['pz.3'], t: 'Son los 6 caños largos: 3 van entre la chapa de abajo y la del medio, y 3 entre la del medio y la de arriba.' },
        { m: ['pz.6'], t: 'Son los 3 caños cortos: las patas.' },
      ],
      cuenta: { fijo: '12 piezas · 3 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 },
      piezas: ordenPiezas(), resaltar: ['pz.2.2'], mueven: [mover('pz.2.2', 140)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 6 espárragos, 3 tornillos Allen, 3 regatones y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'El espárrago es la varilla roscada sin cabeza: une un caño con el de arriba, a través de la chapa. Usás 3 en el paso 1 y 3 en el paso 4.' },
      usa: ['D · Llave Allen incluida'], check: [[6, 'B · Espárragos'], [3, 'A · Tornillos Allen'], [3, 'C · Regatones'], [1, 'D · Llave Allen']],
      cuenta: { fijo: '12 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajesPiezas(), resaltar: ['llave'], mueven: [mover('llave', 110)],
    },
    paso(1, 'regatones', 'Regatón y espárrago', [
      'Enroscá un regatón C en una punta de cada caño corto 3.',
      'En la otra punta, enroscá un espárrago B hasta la mitad.',
    ], [manta(), ...pies(), ...esparragos('esp', Z1)], {
      usa: ['3 · Caños cortos ×3', 'C · Regatones ×3', 'B · Espárragos ×3'], hw: { C: 3, B: 3 },
      titular: 'Regatón abajo, espárrago arriba', resaltar: ['pata', 'esp'], unir: ['pie'],
      mueven: [mover('pata', 50, [0, 0, -1], 0), mover('esp', 80, [0, 0, 1], .4)],
      vista: { yaw: -18, pitch: 30 },
    }),
    paso(2, 'chapa', 'Los caños cortos, en la chapa', [
      'Apoyá una chapa 1 haciendo coincidir cada espárrago con su agujero.',
    ], [manta(), ...base()], {
      usa: ['1 · Chapa'], titular: 'Cada espárrago, en su agujero', resaltar: ['chapa.abajo'], unir: ['pie', 'esp'],
      mueven: [mover('chapa.abajo', 150, [0, 0, 1], 0)], vista: { yaw: -18, pitch: 30 },
    }),
    paso(3, 'canos', 'Tres caños largos', [
      'Enroscá un caño largo 2 en cada espárrago, a mano.',
      'La chapa queda apretada entre los dos caños.',
    ], [manta(), ...piso1()], {
      usa: ['2 · Caños largos ×3'], titular: 'A mano, hasta el tope', cuenta: { de: 'cano.', n: 3, txt: 'Caño', fin: '3 caños en su lugar' },
      resaltar: ['cano'], unir: ['chapa.abajo', 'esp'],
      mueven: K.map((k, i) => mover('cano.' + k, 160, [0, 0, 1], i * .3)),
    }),
    paso(4, 'esp2', 'Un espárrago en cada caño', [
      'Enroscá un espárrago B arriba de cada caño largo, hasta la mitad.',
    ], [manta(), ...piso1(), ...esparragos('esp2', Z2)], {
      usa: ['B · Espárragos ×3'], hw: { B: 3 }, titular: 'Antes de la segunda chapa', resaltar: ['esp2'], unir: ['cano'],
      subs: { a: ['Enroscá un espárrago B arriba de cada caño largo, hasta la mitad.'], b: [], tip: 'En el manual de papel este paso es el 5, pero va acá: sin los espárragos, la segunda chapa no se puede apoyar.' },
      mueven: [mover('esp2', 70, [0, 0, 1], 0)], zoom: .4, vista: { yaw: -18, pitch: 26 },
    }),
    paso(5, 'medio', 'Segunda chapa y tres caños largos', [
      'Apoyá la segunda chapa haciendo coincidir cada espárrago con su agujero.',
      'Enroscá los otros tres caños largos 2 en los espárragos.',
    ], [manta(), ...piso2()], {
      usa: ['1 · Chapa', '2 · Caños largos ×3'], titular: 'Igual que con la primera chapa', resaltar: ['chapa.medio', 'cano2'], unir: ['cano', 'esp2'],
      subs: { a: ['Apoyá la segunda chapa haciendo coincidir cada espárrago con su agujero.', 'Enroscá los otros tres caños largos 2 en los espárragos.'], b: [], tip: 'En el manual de papel este paso es el 4.' },
      mueven: [mover('chapa.medio', 150, [0, 0, 1], 0), ...K.map((k, i) => mover('cano2.' + k, 160, [0, 0, 1], .6 + i * .3))],
      vista: { yaw: -18, pitch: 24 },
    }),
    paso(6, 'tapa', 'Tercera chapa y tornillos', [
      'Alineá cada caño con los agujeros de la tercera chapa.',
    ], [manta(), ...mesa()], {
      usa: ['1 · Chapa', 'A · Tornillos Allen ×3', 'D · Llave Allen'], hw: { A: 3 },
      titular: 'Cada agujero, sobre su caño', resaltar: ['chapa.arriba', 'T'], unir: ['cano2'],
      subs: { a: ['Alineá cada caño con los agujeros de la tercera chapa.'], b: ['Poné un tornillo A en cada agujero.', 'Ajustalos con la llave Allen hasta que la mesa quede firme.'], tip: 'Si queda un poco torcida, aflojá, enderezá las columnas y volvé a ajustar.' },
      mueven: [mover('chapa.arriba', 160, [0, 0, 1], 0), mover('T', 80, [0, 0, 1], .6)],
      fases: {
        pieza: ['chapa.arriba'], hw: HW_T, retener: ['T'], ocultarEnA: HW_T,
        ref: 'T.A', vistaB: { yaw: -20, pitch: 58 }, titularB: 'Un tornillo en cada caño',
        herramienta: { tipo: 'allen', pos: [...P.A, Z3 + CHAPA + 3] },
      },
    }),
    paso(7, 'revisar', 'Revisá que esté firme', [
      'Repasá los tres tornillos con la llave.',
      'Si la mesa se mueve, ajustá un poco más.',
    ], [manta(), ...mesa()], {
      usa: ['D · Llave Allen'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['T'], vista: { yaw: -26, pitch: 16 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -18, pitch: 20 }, piezas: mesa(), mueven: [] },
  ],
};
