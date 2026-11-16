// CH31 · Rack de TV móvil.
// Fuentes: "Manual de Armado CH31 - V4.pdf" (carpeta RACK TV MÓVIL CH31 del Drive, 12 p.), ficha de medidas de la web
// (90 × 52 × 122 cm, estante de 21 cm, largueros a 80 cm entre postes) y fotos de la ficha (frente, packshot y trasera).
// mm · Z arriba · piso z = 0 · adelante (+Y) = lado de la tele. Ver estudio/ch31-notas.md.
//
// Estructura (de la foto trasera y el manual): cada poste son 2 patas enfrentadas (espalda con espalda); arriba son
// rectas y abajo se abren hacia adelante y hacia atrás, con una rueda en cada punta. Los 2 largueros van ADELANTE de
// los postes, abulonados con 05 + 06 que atraviesan larguero y patas. Los soportes de TV cuelgan de los largueros
// con ganchos que pasan por arriba. El estante va entre las 4 patas, debajo del quiebre.

const XP = 410;               // centro de cada poste (90 cm de larguero, 80 cm entre postes)
const PW = 40;                // ancho de pata (X)
const Z_TOP = 1220, Z_BEND = 440;
const Z_PIE = 104, Y_PIE = 228; // placa de la rueda: su borde superior y su distancia al centro (52 cm de base)
const ZL = [1180, 830];       // centros de los largueros (35 cm entre sí)
const ZS = 380;               // estante (cara superior ≈ 38 cm)
const BX = 160;               // soportes de TV (32 cm entre sí)
const LADOS = [['der', -1], ['izq', 1]]; // nombre visto desde adelante (con la cámara de frente, +X queda a la izquierda)
const FRENTE = [['frente', 1], ['atras', -1]];

const cil = (id, pos, largo, r, mat = 'zinc', extra = {}) => ({ id, tipo: 'cilindro', pos, s0: 0, s1: largo, r, mat, seg: 24, ...extra });
const caja = (id, pos, w, d, h, mat = 'chapa', extra = {}) => ({ id, tipo: 'perfil', forma: 'redondeada', r: 0, pos, w, d, z0: 0, z1: h, mat, ...extra });
// Placa en el plano YZ (perfil extruido en X): puntos en [y, z] absolutos.
const placaYZ = (id, x, pts, espesor = 3, mat = 'chapa') => ({ id, tipo: 'perfil', puntos: pts.map(([y, z]) => [-z, y]), pos: [x, 0, 0], eje: [1, 0, 0], z0: 0, z1: espesor, mat });

// ── piezas ──
// Pata: tramo recto (arriba) + tramo inclinado + placa para la rueda. lado = +1 adelante, -1 atrás.
function pata(id, x, lado) {
  const yc = lado * 10, P2 = [x, lado * Y_PIE, Z_PIE];
  const dy = yc - P2[1], dz = Z_BEND - Z_PIE, L = Math.hypot(dy, dz);
  return [
    caja(id, [x, yc, Z_BEND], PW, 20, Z_TOP - Z_BEND),
    { id: id + '.baja', tipo: 'perfil', forma: 'redondeada', r: 0, w: PW, d: 20, pos: P2, eje: [0, dy / L, dz / L], z0: 0, z1: L + 10, mat: 'chapa' },
    caja(id + '.pie', [x, lado * Y_PIE, Z_PIE - 4], 48, 56, 4),
  ];
}
// Rueda giratoria: placa, giro, horquilla, rueda Ø64 y, si corresponde, el pedal de freno (hacia afuera).
function rueda(id, x, y, freno, zt = Z_PIE - 4, afuera = 1) {
  const zc = zt - 68;
  return [
    caja(id + '.placa', [x, y, zt - 4], 44, 44, 4, 'zinc'),
    cil(id + '.giro', [x, y, zt - 16], 12, 9),
    ...[-1, 1].map((s) => caja(id + '.horq.' + (s < 0 ? 'a' : 'b'), [x + s * 13.5, y, zc - 4], 3, 30, zt - 16 - (zc - 4))),
    cil(id + '.rueda', [x - 10, y, zc], 20, 32, 'rueda', { eje: [1, 0, 0], seg: 32 }),
    cil(id + '.eje', [x - 15, y, zc], 30, 4, 'zinc', { eje: [1, 0, 0], seg: 12 }),
    ...(freno ? [caja(id + '.freno', [x, y + afuera * 26, zc + 22], 22, 24, 4, 'negro')] : []),
  ];
}
// Tornillo 07 vertical (cabeza arriba) + tuerca 08 debajo de la placa de la rueda.
const tornillosRueda = (k, x, y) => [[-14, -14], [14, 14]].flatMap(([dx, dy], i) => [
  cil(`07.${k}.${i}.cana`, [x + dx, y + dy, Z_PIE - 18], 18, 2.5),
  cil(`07.${k}.${i}.cabeza`, [x + dx, y + dy, Z_PIE], 3, 5, 'zinc'),
  cil(`08.${k}.${i}`, [x + dx, y + dy, Z_PIE - 13], 4, 5, 'zinc', { seg: 6 }),
]);
const patasConRueda = (lista, xs = XP) => lista.flatMap(([n, sx]) => FRENTE.flatMap(([f, sy]) => {
  const x = sx * xs, k = `${n}.${f}`;
  return [...pata(`pata.${k}`, x, sy), ...rueda(`${sy > 0 ? '10' : '11'}.${k}`, x, sy * Y_PIE, sy > 0, Z_PIE - 4, sy), ...tornillosRueda(`r.${k}`, x, sy * Y_PIE)];
}));
const larguero = (k) => [caja('larguero.' + k, [0, 30, ZL[k] - 20], 900, 20, 40)];
// Perno 05: cabeza Allen atrás (se ajusta con la tele colgada) y tuerca 06 adelante, sobre el larguero.
const perno = (n, sx, k) => {
  const x = sx * XP, z = ZL[k], id = `05.${n}.${k}`;
  return [
    cil(id + '.cana', [x, -20, z], 62, 3.5, 'zinc', { eje: [0, 1, 0], seg: 16 }),
    cil(id + '.cabeza', [x, -20, z], 5, 9, 'negro', { eje: [0, -1, 0] }),
    cil(id + '.hex', [x, -25, z], .2, 3.2, 'oscuro', { eje: [0, -1, 0], seg: 6, sinContorno: true, sinAristas: true }),
    cil(`06.${n}.${k}`, [x, 40, z], 5, 8, 'zinc', { eje: [0, 1, 0], seg: 6 }),
  ];
};
// Paso 6: un 07 + 08 por poste, en las perforaciones de abajo, justo antes del quiebre.
const Z_JUNTA = 475;
const junta = (n, sx) => [
  cil(`07.j.${n}.cana`, [sx * XP, -20, Z_JUNTA], 44, 2.5, 'zinc', { eje: [0, 1, 0], seg: 12 }),
  cil(`07.j.${n}.cabeza`, [sx * XP, -20, Z_JUNTA], 3, 5, 'zinc', { eje: [0, -1, 0] }),
  cil(`08.j.${n}`, [sx * XP, 20, Z_JUNTA], 4, 5, 'zinc', { eje: [0, 1, 0], seg: 6 }),
];
// Estante: chapa de 21 cm con alas en las puntas (se atornillan a las patas) y labios adelante y atrás.
const Y_EST = 10 + (Z_BEND - 350) * (Y_PIE - 10) / (Z_BEND - Z_PIE); // centro de la pata a la altura del tornillo
const estante = () => [
  caja('estante', [0, 0, ZS], 776, 210, 2.5),
  ...LADOS.map(([n, s]) => caja('estante.ala.' + n, [s * 386.5, 0, ZS - 60], 3, 210, 60)),
  ...[1, -1].map((s) => caja('estante.labio.' + (s > 0 ? 'f' : 't'), [0, s * 103.5, ZS - 15], 770, 3, 15)),
];
const tornillosEstante = () => LADOS.flatMap(([n, s]) => [1, -1].flatMap((sy) => {
  const id = `07.e.${n}.${sy > 0 ? 'f' : 't'}`, y = sy * Y_EST;
  return [
    cil(id + '.cana', [s * 385, y, 350], 52, 2.5, 'zinc', { eje: [s, 0, 0], seg: 12 }),
    cil(id + '.cabeza', [s * 385, y, 350], 3, 5, 'zinc', { eje: [-s, 0, 0] }),
    cil(`08.e.${n}.${sy > 0 ? 'f' : 't'}`, [s * 430, y, 350], 4, 5, 'zinc', { eje: [s, 0, 0], seg: 6 }),
  ];
}));
// Soporte de TV: planchuela con ranuras + alas laterales con un gancho por larguero.
const Z_SOP = 695, H_SOP = 560;
function soporteTV(id, bx) {
  const huecos = Array.from({ length: 10 }, (_, k) => ({ x: 0, y: -225 + k * 50, w: 7, d: 18, r: 3.5 }));
  const gancho = (zl) => [[44, zl - 45], [44, zl + 32], [15, zl + 32], [15, zl + 2], [19, zl + 2], [19, zl + 21], [41, zl + 21], [41, zl - 45]];
  return [
    { id: id + '.barra', tipo: 'perfil', forma: 'redondeada', r: 2, w: 40, d: H_SOP, pos: [bx, 47, Z_SOP + H_SOP / 2], eje: [0, -1, 0], z0: 0, z1: 3, mat: 'chapa', huecos },
    ...[-1, 1].flatMap((s) => {
      const x = bx + s * 20 - (s > 0 ? 3 : 0), k = s < 0 ? 'a' : 'b';
      return [
        placaYZ(`${id}.ala.${k}`, x, [[41, Z_SOP], [44, Z_SOP], [44, Z_SOP + H_SOP], [41, Z_SOP + H_SOP]]),
        ...ZL.map((zl, i) => placaYZ(`${id}.gancho.${k}.${i}`, x, gancho(zl))),
      ];
    }),
  ];
}
const soportes = () => [...soporteTV('04.der', -BX), ...soporteTV('04.izq', BX)];
// Tele de referencia (55"), altura 1. Los 4 tornillos de la tele NO vienen incluidos.
const Z_TV = 650;
const tele = () => [caja('tv', [0, 74.5, Z_TV], 1230, 55, 710, 'tv'), caja('tv.pantalla', [0, 102.5, Z_TV + 16], 1200, 1, 678, 'pantalla', { sinContorno: true })];
const tornillosTV = () => [-BX, BX].flatMap((x, i) => [850, 1150].flatMap((z, j) => [
  cil(`tvt.${i}.${j}.cana`, [x, 44, z], 14, 3, 'zinc', { eje: [0, 1, 0], seg: 12 }),
  cil(`tvt.${i}.${j}.cabeza`, [x, 44, z], 3, 6.5, 'negro', { eje: [0, -1, 0] }),
]));
// Accesorios (anexo del manual): portacontrol (14) y pasacable (13), colgados atrás del larguero de abajo.
function accesorios() {
  const z = ZL[1], xc = -250, xp = 300;
  return [
    caja('14.dorso', [xc, 17.5, z - 95], 90, 3, 118, 'chapa'),
    caja('14.gancho', [xc, 30, z + 21], 40, 27, 3, 'chapa'),
    caja('14.gancho.punta', [xc, 42, z + 8], 40, 3, 13, 'chapa'),
    { ...caja('14.tapa', [xc, -14, z + 20], 90, 62, 3), huecos: [{ x: 0, y: -2, w: 62, d: 38, r: 4 }] },
    caja('14.base', [xc, -14, z - 95], 90, 62, 3),
    caja('14.frente', [xc, -43.5, z - 95], 90, 3, 38),
    ...[-1, 1].map((s) => caja('14.lado.' + (s < 0 ? 'a' : 'b'), [xc + s * 43.5, -14, z - 95], 3, 62, 38)),
    { ...caja('13.placa', [xp, 17.5, z - 50], 80, 3, 60), huecos: [] },
    caja('13.gancho', [xp, 30, z + 21], 36, 27, 3, 'chapa'),
    caja('13.gancho.punta', [xp, 42, z + 8], 36, 3, 13, 'chapa'),
    caja('13.ala', [xp, 1, z - 50], 50, 30, 3, 'chapa'),
  ];
}

// ── conjuntos por paso ──
const estructura = () => [...patasConRueda(LADOS), ...larguero(0), ...larguero(1), ...LADOS.flatMap(([n, s]) => [...perno(n, s, 0), ...perno(n, s, 1)])];
const conJunta = () => [...estructura(), ...LADOS.flatMap(([n, s]) => junta(n, s))];
const rack = () => [...conJunta(), ...estante(), ...tornillosEstante()];
const completo = () => [...rack(), ...soportes(), ...tele(), ...tornillosTV()];

const manta = (w = 1500, d = 1000, extra = {}) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', ...extra });

// ── «Ordená las piezas» ──
// Giro rígido de 90° sobre Y: lo vertical queda acostado a lo largo de X.
const acostar = (ps, [tx, ty, tz]) => ps.map((p) => ({ ...p, pos: [p.pos[2] + tx, p.pos[1] + ty, -p.pos[0] + tz], rotacion: [0, 90, 0] }));
function ordenPiezas() {
  const patas = [[0, 1, 40], [1, 1, 100], [2, -1, -40], [3, -1, -100]].flatMap(([i, lado, ty]) => acostar(pata('pz.01.' + i, 0, lado), [-660, ty, 24]));
  return [
    manta(1500, 1800, { pos: [0, -150, 0] }),
    ...patas,
    { id: 'rotulo.01', tipo: 'texto', txt: '01 · PATAS ×4', pos: [0, -386, .3], alto: 56 },
    ...[0, 1].map((i) => caja('pz.02.' + i, [0, 440 + i * 70, 0], 900, 40, 20)),
    { id: 'rotulo.02', tipo: 'texto', txt: '02 · LARGUEROS ×2', pos: [0, 600, .3], alto: 56 },
    ...estante().map((p) => ({ ...p, pos: [p.pos[0], p.pos[1] - 560, p.pos[2] - ZS + 60] })),
    { id: 'rotulo.03', tipo: 'texto', txt: '03 · ESTANTE', pos: [0, -720, .3], alto: 56 },
    ...[0, 1].map((i) => ({ id: 'pz.04.' + i, tipo: 'perfil', forma: 'redondeada', r: 2, w: 560, d: 40, pos: [-380 + i * 0, -800 - i * 70, 0], z0: 0, z1: 3, mat: 'chapa' })),
    { id: 'rotulo.04', tipo: 'texto', txt: '04 · SOPORTES TV ×2', pos: [-380, -930, .3], alto: 56 },
    { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 300, d: 180, r: 26, pos: [370, -850, 0], z0: 0, z1: 26, mat: 'bolsa' },
    { id: 'rotulo.h', tipo: 'texto', txt: 'HERRAJES', pos: [370, -980, .3], alto: 56 },
  ];
}

// ── «Contá los herrajes» ──
function herrajesPiezas() {
  const filas = (n, f) => Array.from({ length: n }, (_, i) => f(i));
  return [
    manta(860, 470, { lineas: 0, pos: [0, 0, 0] }),
    ...filas(4, (i) => [
      cil(`h.05.${i}.cana`, [-370, -75 + i * 50, 9], 52, 3.5, 'zinc', { eje: [1, 0, 0], seg: 16 }),
      cil(`h.05.${i}.cabeza`, [-370, -75 + i * 50, 9], 5, 9, 'negro', { eje: [-1, 0, 0] }),
    ]).flat(),
    ...filas(4, (i) => cil(`h.06.${i}`, [-250, -75 + i * 50, 0], 5, 8, 'zinc', { seg: 6 })),
    ...filas(14, (i) => [
      cil(`h.07.${i}.cana`, [-175 + (i % 2) * 32, -120 + Math.floor(i / 2) * 40, 0], 14, 2.5),
      cil(`h.07.${i}.cabeza`, [-175 + (i % 2) * 32, -120 + Math.floor(i / 2) * 40, 14], 3, 5),
    ]).flat(),
    ...filas(14, (i) => cil(`h.08.${i}`, [-80 + (i % 2) * 30, -120 + Math.floor(i / 2) * 40, 0], 4, 5, 'zinc', { seg: 6 })),
    ...rueda('h.10.0', 30, -70, true, 100, 1), ...rueda('h.10.1', 30, 60, true, 100, 1),
    ...rueda('h.11.0', 150, -70, false, 100), ...rueda('h.11.1', 150, 60, false, 100),
    cil('llave.corto', [300, -40, 3], 26, 3, 'zinc', { eje: [-1, 0, 0], seg: 12 }),
    cil('llave.largo', [300, -40, 3], 82, 3, 'zinc', { eje: [0, 1, 0], seg: 12 }),
    { id: 'rotulo.05', tipo: 'texto', txt: '05 · 06', pos: [-310, 170, .3], alto: 34 },
    { id: 'rotulo.07', tipo: 'texto', txt: '07 · 08', pos: [-115, 170, .3], alto: 34 },
    { id: 'rotulo.10', tipo: 'texto', txt: 'RUEDAS', pos: [90, 170, .3], alto: 34 },
    { id: 'rotulo.09', tipo: 'texto', txt: 'LLAVE', pos: [305, 170, .3], alto: 34 },
  ];
}

const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const paso = (num, id, titulo, a, piezas, extra = {}) => ({
  num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de 10` },
  vista: { yaw: -30, pitch: 18 }, piezas, mueven: [], resaltar: [], encuadrarTodo: false, ...extra,
});
const pasoRuedas = (num, id, lista, freno) => {
  const cod = freno ? '10' : '11', f = freno ? 'frente' : 'atras', sy = freno ? 1 : -1;
  const piezas = [manta(900, 900, { pos: [0, sy * 120, 0] }), ...LADOS.flatMap(([n, sx]) => {
    const x = sx * 170, k = `${n}.${f}`;
    return [...pata(`pata.${k}`, x, sy), ...rueda(`${cod}.${k}`, x, sy * Y_PIE, freno, Z_PIE - 4, sy), ...tornillosRueda(`r.${k}`, x, sy * Y_PIE)];
  })];
  return paso(num, id, freno ? 'Ruedas con freno' : 'Ruedas sin freno', lista, piezas, {
    usa: ['01 · Patas ×2', `${cod} · Ruedas ${freno ? 'con' : 'sin'} freno ×2`, '07 · Tornillos ×4', '08 · Tuercas ×4'],
    hw: { [cod]: 2, '07': 4, '08': 4 }, titular: freno ? 'Las del freno van adelante' : 'Las sin freno van atrás',
    cuenta: { fijo: '2 ruedas · 4 tornillos' }, resaltar: [cod, '07', '08'], unir: ['pata'],
    mueven: [mover(cod, 110, [0, 0, -1], 0), mover('07', 70, [0, 0, 1], .6), mover('08', 60, [0, 0, -1], .9)],
    zoom: .7, vista: { yaw: freno ? -38 : 142, pitch: 14 },
  });
};

export default {
  id: 'ch31', version: 1, pasosManual: 10,
  marca: {
    nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022',
    tienda: 'https://dege.com.ar/productos/rack-de-tv-movil-ch31-16zw5/', instagram: 'https://instagram.com/dege.muebles',
    confeti: ['#C99A30', '#ffffff', '#e9e4d6', '#1d1d1b'],
  },
  materiales: {
    chapa: { color: '#C99A30' }, zinc: { color: '#c9ced3' }, negro: { color: '#242424' }, oscuro: { color: '#111111' },
    rueda: { color: '#6b7075' }, tv: { color: '#1b1b1c' }, pantalla: { color: '#2a3038' },
    carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 }, senal: { color: '#ff6a3d' },
  },
  inventario: [
    { id: '05', n: 4, label: '05 · Tornillos Allen' }, { id: '06', n: 4, label: '06 · Tuercas grandes' },
    { id: '07', n: 14, label: '07 · Tornillos chicos' }, { id: '08', n: 14, label: '08 · Tuercas chicas' },
    { id: '10', n: 2, label: '10 · Ruedas con freno' }, { id: '11', n: 2, label: '11 · Ruedas sin freno' },
  ],
  textos: {
    titulo: 'Armá tu Rack de TV móvil CH31 · DEGË Muebles', cabecera: 'Rack de TV CH31',
    ladoTitulo: 'Tu rack de TV móvil, <em>paso a paso</em>',
    ladoCuerpo: 'Cuatro patas con ruedas, dos largueros, un estante y los soportes para la tele. Seguí los 10 pasos del manual de fábrica y girá el modelo para ver cada unión.',
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá el rack para girarlo', girar: 'Arrastrá para girar el rack',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>rack de TV móvil</em>, paso a paso',
    datos: [['layers', '9 piezas', '+ 40 herrajes'], ['steps', '10 pasos', 'como el manual de papel'], ['box', '90 × 52 × 122', 'cm · ancho, base y alto']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: 'Tu rack,<br><em>sin estrés</em>', momCuerpo: 'Llave Allen incluida. Para los tornillos chicos vas a usar un destornillador.',
    momTips: [
      ['space', 'Hacé lugar', 'Una manta grande o el cartón de la caja en el piso'],
      ['kids', 'Separá los herrajes', 'Tornillos y tuercas de 2 tamaños, y 4 ruedas'],
      ['time', 'Para la tele, de a dos', 'Colgarla es más fácil y seguro con alguien que ayude'],
      ['music', 'Y poné música', 'La que te acompañe mientras armás'],
    ],
    momCta: 'Empezar a armar',
    finTitulo: '¡Tu rack <em>está listo</em>! 🎉',
    finCuerpo: 'Trabá las ruedas con freno de adelante cuando lo dejes en su lugar. Para moverlo, destrabalas y empujá desde la estructura, no desde la tele.',
    finTip: 'Guardá la llave Allen: cada tanto, repasá los cuatro tornillos de los largueros. ¡Mandanos una foto cuando lo tengas armado!',
    waTexto: '¡Hola DEGË! Estoy armando el Rack de TV móvil CH31 y tengo una duda 😊',
    pie: 'DEGË Muebles · Muebles de chapa y caño, de Rosario a todo el país.',
    rvEjemplos: ['Lo armé en un rato 🙌', 'Re claro el paso a paso', 'Quedó firme, con la tele y todo', 'Lo muevo por toda la casa'],
  },
  cotas: { w: 90, d: 52, h: 122, unidad: 'cm', caja: [-450, 450, -260, 260, 0, Z_TOP], lineas: [
    [[450, 40, Z_TOP - 20], [-450, 40, Z_TOP - 20], [0, 160, 0], 90],
    [[-430, 260, 0], [-430, -260, 0], [-150, 0, 0], 52],
    [[430, 0, 0], [430, 0, Z_TOP], [150, 0, 0], 122],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -30, pitch: 14 }, piezas: [...rack(), ...soportes()], mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja y separá las piezas por número.', 'El número es el que vas a ver en cada paso.'], b: [], tip: '¿Falta algo o llegó una pieza golpeada? Sacale una foto y escribinos antes de seguir.' },
      usa: ['01 · Patas ×4', '02 · Largueros ×2', '03 · Estante', '04 · Soportes TV ×2'],
      elegir: [
        { m: ['pz.01'], t: 'Son las 4 patas: rectas arriba y dobladas abajo, con una placa para la rueda en la punta.' },
        { m: ['pz.02'], t: 'Son los 2 caños horizontales de 90 cm: de ahí cuelga la tele.' },
        { m: ['pz.03', 'estante'], t: 'Es la bandeja de 21 cm de fondo que va abajo, entre las patas.' },
        { m: ['pz.04'], t: 'Son las 2 planchuelas con ranuras y ganchos: se atornillan a la tele.' },
      ],
      cuenta: { fijo: '9 piezas · 4 tipos' }, encuadrarTodo: true, vista: { yaw: -4, pitch: 64 },
      piezas: ordenPiezas(), resaltar: ['estante'], mueven: [mover('estante', 140)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Abrí la bolsa sobre la manta y separá los herrajes por número.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'Los tornillos chicos (07) y sus tuercas (08) son 14 de cada uno: dejalos en un platito.' },
      usa: ['09 · Llave Allen incluida', 'Destornillador (no viene en la caja)'],
      check: [[4, '05 · Tornillos Allen'], [4, '06 · Tuercas grandes'], [14, '07 · Tornillos chicos'], [14, '08 · Tuercas chicas'], [2, '10 · Ruedas con freno'], [2, '11 · Ruedas sin freno'], [1, '09 · Llave Allen']],
      cuenta: { fijo: '40 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 46 },
      piezas: herrajesPiezas(), resaltar: ['llave'], mueven: [mover('llave', 110)],
    },
    pasoRuedas(1, 'ruedas-freno', ['Tomá 2 patas y poné una rueda con freno (10) en la placa de cada una.', 'El orden es: tornillo 07, pata, rueda y tuerca 08.', 'Son 2 tornillos por rueda.'], true),
    pasoRuedas(2, 'ruedas', ['Repetí con las otras 2 patas, ahora con las ruedas sin freno (11).', 'Mismo orden: tornillo 07, pata, rueda y tuerca 08.'], false),
    paso(3, 'larguero', 'Primer poste y larguero', [
      'Enfrentá dos patas, espalda con espalda, para que coincidan sus agujeros.',
      'Apoyá el larguero adelante, haciendo coincidir su agujero con el de las patas.',
    ], [manta(), ...patasConRueda([LADOS[0]]), ...larguero(0), ...perno('der', -1, 0)], {
      usa: ['01 · Patas ×2', '02 · Larguero', '05 · Tornillo Allen', '06 · Tuerca'], hw: { '05': 1, '06': 1 },
      titular: 'El larguero va adelante', resaltar: ['larguero.0', '05.der.0', '06.der.0'], unir: ['pata.der'],
      subs: { a: ['Enfrentá dos patas, espalda con espalda, para que coincidan sus agujeros.', 'La del freno va adelante y la sin freno, atrás.', 'Apoyá el larguero adelante, con su agujero sobre el de las patas.'], b: ['Pasá el tornillo 05 desde atrás y poné la tuerca 06 adelante.', 'Ajustalo con la llave Allen.'], tip: 'Adelante es el lado de la tele: ahí van el larguero y las ruedas con freno.' },
      mueven: [mover('larguero.0', 260, [1, 0, 0], 0), mover('05.der.0', 90, [0, -1, 0], 0), mover('06.der.0', 60, [0, 1, 0], .3)],
      fases: {
        pieza: ['larguero.0'], hw: ['05.der.0.cana', '05.der.0.cabeza', '05.der.0.hex', '06.der.0'], retener: ['05.der.0', '06.der.0'],
        ocultarEnA: ['05.der.0', '06.der.0'], ref: '05.der.0', vistaB: { yaw: -150, pitch: 18 }, titularB: 'Tornillo desde atrás',
        herramienta: { tipo: 'allen', pos: [-XP, -25, ZL[0]], eje: [0, -1, 0] },
      },
      vista: { yaw: -40, pitch: 16 },
    }),
    paso(4, 'segundo-poste', 'Segundo poste', [
      'Repetí con las 2 patas que quedan, del otro lado del larguero.',
      'Tornillo 05 desde atrás, tuerca 06 adelante y ajustá con la llave Allen.',
    ], [manta(), ...patasConRueda(LADOS), ...larguero(0), ...perno('der', -1, 0), ...perno('izq', 1, 0)], {
      usa: ['01 · Patas ×2', '05 · Tornillo Allen', '06 · Tuerca'], hw: { '05': 1, '06': 1 },
      titular: 'Igual que el primero', resaltar: ['pata.izq', '10.izq', '11.izq', '07.r.izq', '08.r.izq', '05.izq.0', '06.izq.0'], unir: ['larguero.0'],
      mueven: [mover(['pata.izq', '10.izq', '11.izq', '07.r.izq', '08.r.izq'], 220, [1, 0, 0], 0), mover('05.izq.0', 90, [0, -1, 0], .6), mover('06.izq.0', 60, [0, 1, 0], .9)],
      vista: { yaw: -26, pitch: 16 },
    }),
    paso(5, 'larguero-2', 'Larguero de abajo', [
      'Igual que en los pasos 3 y 4, poné el segundo larguero adelante de los postes.',
      'Un tornillo 05 y una tuerca 06 de cada lado, y ajustá con la llave Allen.',
    ], [manta(), ...estructura()], {
      usa: ['02 · Larguero', '05 · Tornillos Allen ×2', '06 · Tuercas ×2'], hw: { '05': 2, '06': 2 },
      titular: '35 cm debajo del primero', resaltar: ['larguero.1', '05.der.1', '05.izq.1', '06.der.1', '06.izq.1'], unir: ['pata'],
      mueven: [mover('larguero.1', 220, [0, 1, 0], 0), mover(['05.der.1', '05.izq.1'], 90, [0, -1, 0], .6), mover(['06.der.1', '06.izq.1'], 60, [0, 1, 0], .9)],
      vista: { yaw: -26, pitch: 16 },
    }),
    paso(6, 'juntas', 'Uní las patas abajo', [
      'Poné un tornillo 07 y una tuerca 08 en el agujero de abajo de cada poste.',
      'Va justo arriba de donde las patas se abren.',
    ], [manta(), ...conJunta()], {
      usa: ['07 · Tornillos ×2', '08 · Tuercas ×2', 'Destornillador'], hw: { '07': 2, '08': 2 },
      titular: 'Donde se abren las patas', resaltar: ['07.j', '08.j'], unir: ['pata'], zoom: .85,
      mueven: [mover('07.j', 80, [0, -1, 0], 0), mover('08.j', 60, [0, 1, 0], .4)],
      vista: { yaw: -58, pitch: 14 },
    }),
    paso(7, 'estante', 'Colocá el estante', [
      'Ubicá el estante entre las patas, con sus alas contra las patas.',
      'Hacé coincidir los agujeros y fijalo con 4 tornillos 07 y 4 tuercas 08.',
    ], [manta(), ...rack()], {
      usa: ['03 · Estante', '07 · Tornillos ×4', '08 · Tuercas ×4', 'Destornillador'], hw: { '07': 4, '08': 4 },
      titular: 'Dos tornillos por lado', resaltar: ['estante', '07.e', '08.e'], unir: ['pata'], zoom: .6,
      mueven: [mover('estante', 160, [0, 0, 1], 0), mover('07.e', 60, [0, 0, 1], .7), mover('08.e', 50, [0, 0, 1], .9)],
      vista: { yaw: -32, pitch: 30 },
    }),
    paso(8, 'soportes', 'Atornillá los soportes a la tele', [
      'Con la tele apoyada sobre algo blando, atornillá los 2 soportes 04 en su parte de atrás.',
      'Los ganchos van para arriba, mirando hacia afuera de la tele.',
      'Según qué agujeros uses, la tele queda más alta o más baja: es la altura 1.',
    ], [...tele(), ...soportes(), ...tornillosTV()], {
      usa: ['04 · Soportes TV ×2', '4 tornillos de la tele (no incluidos)'],
      titular: 'Los tornillos de la tele no vienen', cuenta: { fijo: 'Recomendados: M6 × 12 o 14 mm' }, alerta: true,
      resaltar: ['04', 'tvt'], unir: ['tv'],
      subs: { a: ['Con la tele apoyada sobre algo blando, atornillá los 2 soportes 04 en su parte de atrás.', 'Los ganchos van arriba y hacia afuera de la tele.', 'Según qué agujeros uses, la tele queda más alta o más baja: es la altura 1.'], b: [], tip: 'Los tornillos dependen de cada tele y no vienen incluidos. Fábrica recomienda M6 × 12 o 14 mm: confirmalo en el manual de tu tele.' },
      mueven: [mover('04', 160, [0, -1, 0], 0), mover('tvt', 110, [0, -1, 0], .6)],
      vista: { yaw: 148, pitch: 16 },
    }),
    paso(9, 'colgar', 'Colgá la tele', [
      'Entre dos, levantá la tele y enganchá los soportes en los largueros.',
      'Cada soporte tiene varios ganchos: el que elijas define la altura 2.',
      'Verificá que los dos lados quedaron enganchados antes de soltarla.',
    ], [manta(), ...completo()], {
      usa: ['Tele con los soportes 04'], dos: true, titular: 'Enganchá en los dos largueros',
      resaltar: ['04'], unir: ['larguero'],
      mueven: [mover(['tv', '04', 'tvt'], 140, [0, 0, 1], 0)],
      vista: { yaw: -152, pitch: 16 },
    }),
    paso(10, 'ajustar', 'Ajustá todo', [
      'Con la llave Allen, repasá los 4 tornillos de los largueros.',
    ], [manta(), ...completo()], {
      usa: ['09 · Llave Allen', 'Destornillador'], titular: 'Ajustá bien todo', sinFantasma: true, resaltar: ['05'],
      subs: { a: ['Con la llave Allen, repasá los 4 tornillos de los largueros.'], b: ['Las cabezas quedan atrás: se ajustan con la tele colgada.', 'Repasá también los tornillos chicos con el destornillador.'], tip: 'Trabá las ruedas con freno de adelante cuando el rack esté en su lugar.' },
      mueven: [mover('05', 6, [0, -1, 0], 0)],
      fases: {
        pieza: ['05.der.0.cabeza', '05.izq.0.cabeza', '05.der.1.cabeza', '05.izq.1.cabeza'], hw: ['05.izq.1.cabeza', '05.izq.1.hex'],
        retener: ['05'], ocultarEnA: [], ref: '05.izq.1', vistaB: { yaw: 150, pitch: 18 }, titularB: 'Desde atrás, con la llave',
        herramienta: { tipo: 'allen', pos: [XP, -25, ZL[1]], eje: [0, -1, 0] },
      },
      vista: { yaw: 150, pitch: 16 },
    }),
    {
      id: 'accesorios', grupo: 'Extra', titulo: 'Accesorios: control y cables', titular: 'Opcional: control y cables',
      subs: { a: ['El portacontrol (14) y el pasacable (13) se cuelgan atrás de un larguero.', 'Elegí la ranura, apoyalos y engancharlos en el larguero.'], b: [], tip: 'El portacontrol trae una chapita: doblala un poco para que encastre en la ranura.' },
      usa: ['14 · Portacontrol', '13 · Pasacable'], cuenta: { fijo: 'Anexo del manual' },
      vista: { yaw: 155, pitch: 20 }, piezas: [manta(), ...completo(), ...accesorios()],
      resaltar: ['14', '13'], unir: ['larguero'], zoom: .5, mueven: [mover('14', 120, [0, -1, 0], 0), mover('13', 120, [0, -1, 0], .5)], encuadrarTodo: false,
    },
    { id: 'fin', grupo: 'Listo', vista: { yaw: -28, pitch: 12 }, piezas: [...completo(), ...accesorios()], mueven: [] },
  ],
};
