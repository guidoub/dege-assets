import { manta, mover, herrajes, paso as P_, textos, marca, MATS, cil, caja, regaton, esparrago, allen, idsAllen, lateral, REG, R_CANO } from './_estimado.js?v=40bdf307a1';

const W = 680, D = 300, E = 15, H = 1670;
const P = { fi: [315, 125], fd: [-315, 125], ti: [315, -125], td: [-315, -125] }, K = Object.keys(P), ATRAS = ['ti', 'td'], ADEL = ['fi', 'fd'];
const Z1 = 96, Z2 = Z1 + E + 190, Z3 = Z2 + E + 174, ZJ = 1080, ZTOP = 1600;   // estantes a ≈10, 31 y 49 cm; ganchos a ≈108
const tabla = (id, z) => ({ ...caja(id, -W / 2, W / 2, -D / 2, D / 2, z, E, 'madera'), huecos: K.map((k) => ({ x: P[k][0], y: P[k][1], w: 8.5, d: 8.5, r: 4.25 })) });
const reg = () => K.map((k) => regaton('reg.' + k, P[k]));
const pies = () => K.map((k) => cil('pie.' + k, [...P[k], REG], Z1 - REG, R_CANO));
const esp = (pre, ks, z) => ks.map((k) => esparrago(`${pre}.${k}`, P[k], z));
const canos = (pre, ks, z0, z1) => ks.map((k) => cil(`${pre}.${k}`, [...P[k], z0], z1 - z0, R_CANO));
const gancho = (k) => {
  const [x, y] = P[k], s = Math.sign(x), xt = x + s * 60;
  return [
    caja(`gancho.${k}.base`, Math.min(x, xt), Math.max(x, xt), y - 9, y + 9, ZJ, 2.5),
    caja(`gancho.${k}.punta`, Math.min(xt, xt + s * 3), Math.max(xt, xt + s * 3), y - 8, y + 8, ZJ, 24),
  ];
};
const TY = -125 + R_CANO, ZT0 = ZTOP - 10;
const tablaArriba = () => [
  { id: 'percha.tabla', tipo: 'perfil', puntos: [[-W / 2, 0], [W / 2, 0], [W / 2, 70], [-W / 2, 70]], pos: [0, TY + E, ZT0], z0: 0, z1: E, mat: 'madera', rotacion: [90, 0, 0] },
  ...[-200, 0, 200].map((x, i) => cil('percha.perilla.' + i, [x, TY + E, ZT0 + 35], 22, 11, 'negro', { eje: [0, 1, 0] })),
];
const tornTabla = () => ATRAS.flatMap((k) => lateral('T.' + k, [P[k][0], TY + E, ZT0 + 35], [0, 1, 0]));
const IDS_T = ATRAS.flatMap((k) => [`T.${k}.cana`, `T.${k}.cabeza`]);

const s1 = () => [...reg(), ...pies(), ...esp('esp1', K, Z1)];
const s2 = () => [...s1(), tabla('est1', Z1)];
const s3 = () => [...s2(), ...canos('c1', K, Z1 + E, Z2), ...esp('esp2', K, Z2)];
const s4 = () => [...s3(), tabla('est2', Z2)];
const s5 = () => [...s4(), ...canos('c2', K, Z2 + E, Z3), ...esp('esp3', ATRAS, Z3)];
const s6 = () => [...s5(), tabla('est3', Z3), ...ADEL.flatMap((k) => allen('A.' + k, P[k], Z3 + E))];
const s7 = () => [...s6(), ...canos('col1', ATRAS, Z3 + E, ZJ), ...esp('esp4', ATRAS, ZJ), ...ATRAS.flatMap(gancho), ...canos('col2', ATRAS, ZJ + 2.5, ZTOP)];
const perchero = () => [...s7(), ...tablaArriba(), ...tornTabla()];
const IDS_A = idsAllen(ADEL.map((k) => 'A.' + k));

const NA = 9, paso = P_(NA, { yaw: -26, pitch: 18 });
const acostado = (id, x, y, largo) => cil(id, [x, y, R_CANO], largo, R_CANO, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1500, 1000),
  ...[0, 1, 2].map((i) => ({ ...caja('pz.1.' + i, -W / 2, W / 2, -D / 2, D / 2, 0, E, 'madera'), pos: [-330, 230, i * (E + .5)] })),
  { id: 'rotulo.1', tipo: 'texto', txt: '1 · ESTANTES ×3', pos: [-330, 430, .3], alto: 26 },
  { ...caja('pz.2', -W / 2, W / 2, -35, 35, 0, E, 'madera'), pos: [-330, -40, 0] },
  { id: 'rotulo.2', tipo: 'texto', txt: '2 · TABLA CON PERILLAS', pos: [-330, -110, .3], alto: 22 },
  ...[0, 1, 2, 3].map((i) => acostado('pz.3.' + i, 200, 380 - i * 40, Z1 - REG)),
  ...[0, 1, 2, 3].map((i) => acostado('pz.4.' + i, 200, 200 - i * 40, Z2 - Z1 - E)),
  ...[0, 1, 2, 3].map((i) => acostado('pz.5.' + i, 200, 30 - i * 40, Z3 - Z2 - E)),
  ...[0, 1, 2, 3].map((i) => acostado('pz.6.' + i, -650, -200 - i * 45, i < 2 ? ZJ - Z3 - E : ZTOP - ZJ)),
  { id: 'rotulo.3', tipo: 'texto', txt: '3 · CAÑOS CORTOS', pos: [320, 440, .3], alto: 20 },
  { id: 'rotulo.6', tipo: 'texto', txt: '6 · CAÑOS LARGOS ×4', pos: [-350, -400, .3], alto: 22 },
];

export default {
  id: 'm06', version: 1, pasosManual: NA, estimado: true,
  marca: marca('https://dege.com.ar/productos/perchero-industrial-m06/', ['#C8995B', '#1d1d1b', '#ffffff', '#e9e4d6']),
  materiales: MATS('#232323', { madera: { color: '#C99A5E' } }),
  inventario: [{ id: 'C', n: 4, label: 'C · Regatones' }, { id: 'B', n: 12, label: 'B · Espárragos' }, { id: 'A', n: 2, label: 'A · Tornillos Allen' }, { id: 'D', n: 2, label: 'D · Ganchos' }, { id: 'E', n: 2, label: 'E · Tornillos de la tabla' }],
  textos: textos({
    nombre: 'Perchero industrial', codigo: 'M06', cabecera: 'Perchero industrial M06', sust: 'perchero', art: 'el',
    ladoCuerpo: 'Tres estantes para el calzado, dos columnas de caño con ganchos y una tabla con perillas arriba. Seguí los pasos y girá el modelo.',
    datos: [['layers', '24 piezas', '+ 22 herrajes'], ['steps', `${NA} pasos`, 'llave incluida'], ['box', '68 × 30 × 167', 'cm · ancho, fondo y alto']],
    momTitulo: 'Tu perchero,<br><em>de abajo hacia arriba</em>', momCuerpo: 'Primero los tres estantes, después las columnas y al final la tabla de arriba. La llave viene en la caja.',
    tips: [['space', 'Hacé lugar', 'Una manta o el cartón de la caja: mide 1,67 m'], ['kids', 'Separá los caños', 'Hay cuatro largos distintos: agrupalos antes de empezar'], ['time', 'Sin apuro', 'Seguí los pasos en orden'], ['music', 'Y poné música', 'La que te acompañe mientras armás']],
    finCuerpo: 'Abrigos en las perillas, mochilas en los ganchos y el calzado en los tres estantes.',
    finTip: 'Apoyalo contra la pared y repartí el peso. Cada tanto, repasá los tornillos. ¡Mandanos una foto cuando lo tengas armado!',
  }),
  cotas: { w: 68, d: 30, h: 167, unidad: 'cm', caja: [-W / 2, W / 2, -D / 2, D / 2, 0, H], lineas: [
    [[W / 2, D / 2, 0], [-W / 2, D / 2, 0], [0, 80, 0], 68],
    [[-W / 2, D / 2, 0], [-W / 2, -D / 2, 0], [-70, 0, 0], 30],
    [[W / 2, -D / 2, 0], [W / 2, -D / 2, H], [80, 0, 0], 167],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -24, pitch: 12 }, piezas: perchero(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: 3 estantes, la tabla con perillas y 16 caños.', 'Agrupá los caños por largo.'], b: [], tip: 'A confirmar con fábrica: la cantidad y el largo de cada caño.' },
      usa: ['1 · Estantes ×3', '2 · Tabla con perillas', '3 · Patas ×4', '4 y 5 · Caños entre estantes ×8', '6 · Caños largos ×4'],
      elegir: [{ m: ['pz.1'], t: 'Los 3 estantes, iguales.' }, { m: ['pz.2'], t: 'La tabla de arriba, con las perillas.' }, { m: ['pz.3', 'pz.4', 'pz.5'], t: 'Los caños cortos: patas y entre estantes.' }, { m: ['pz.6'], t: 'Los 4 caños largos: forman las dos columnas.' }],
      cuenta: { fijo: '24 piezas' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 64 }, piezas: ordenPiezas(), resaltar: ['pz.2'], mueven: [mover('pz.2', 60)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 12 espárragos, 2 tornillos Allen, 2 tornillos para la tabla, 2 ganchos, 4 regatones y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: '' },
      usa: ['Llave incluida'], check: [[12, 'B · Espárragos'], [2, 'A · Tornillos Allen'], [2, 'E · Tornillos de la tabla'], [2, 'D · Ganchos'], [4, 'C · Regatones'], [1, 'Llave']],
      cuenta: { fijo: '22 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajes([{ letra: 'B', n: 12, tipo: 'esparrago' }, { letra: 'A', n: 2, tipo: 'allen' }, { letra: 'E', n: 2, tipo: 'tornillo' }, { letra: 'C', n: 4, tipo: 'regaton' }]), resaltar: ['llave'], mueven: [mover('llave', 90)],
    },
    paso(1, 'patas', 'Las patas', ['Enroscá un regatón C en una punta de cada pata y un espárrago B en la otra.'], [manta(), ...s1()], {
      usa: ['3 · Patas ×4', 'C · Regatones ×4', 'B · Espárragos ×4'], hw: { C: 4, B: 4 }, titular: 'Regatón abajo, espárrago arriba', resaltar: ['reg', 'esp1'], unir: ['pie'],
      mueven: [mover('reg', 40, [0, 0, -1], 0), mover('esp1', 70, [0, 0, 1], .5)], vista: { yaw: -24, pitch: 30 },
    }),
    paso(2, 'est1', 'El primer estante', ['Apoyá un estante haciendo coincidir cada espárrago con su agujero.'], [manta(), ...s2()], {
      usa: ['1 · Estante'], titular: 'Cada espárrago, en su agujero', resaltar: ['est1'], unir: ['pie', 'esp1'], mueven: [mover('est1', 120, [0, 0, 1], 0)], vista: { yaw: -24, pitch: 26 },
    }),
    paso(3, 'c1', 'Caños y espárragos', ['Enroscá 4 caños en los espárragos.', 'Arriba de cada uno, enroscá otro espárrago.'], [manta(), ...s3()], {
      usa: ['4 · Caños ×4', 'B · Espárragos ×4'], hw: { B: 4 }, titular: 'Caño y espárrago', resaltar: ['c1', 'esp2'], unir: ['est1'],
      mueven: [mover('c1', 130, [0, 0, 1], 0), mover('esp2', 70, [0, 0, 1], .7)], vista: { yaw: -24, pitch: 22 },
    }),
    paso(4, 'est2', 'El segundo estante', ['Apoyá otro estante sobre los 4 espárragos.'], [manta(), ...s4()], {
      usa: ['1 · Estante'], titular: 'Igual que el primero', resaltar: ['est2'], unir: ['c1', 'esp2'], mueven: [mover('est2', 120, [0, 0, 1], 0)], vista: { yaw: -24, pitch: 22 },
    }),
    paso(5, 'c2', 'Caños y dos espárragos', ['Enroscá los 4 caños siguientes.', 'Solo en los 2 de atrás, enroscá un espárrago arriba.'], [manta(), ...s5()], {
      usa: ['5 · Caños ×4', 'B · Espárragos ×2'], hw: { B: 2 }, titular: 'Los espárragos, solo atrás', resaltar: ['c2', 'esp3'], unir: ['est2'],
      subs: { a: ['Enroscá los 4 caños siguientes.', 'Solo en los 2 de atrás, enroscá un espárrago arriba.'], b: [], tip: 'Los de atrás siguen hacia arriba; los de adelante terminan en el tercer estante.' },
      mueven: [mover('c2', 130, [0, 0, 1], 0), mover('esp3', 70, [0, 0, 1], .7)], vista: { yaw: -24, pitch: 22 },
    }),
    paso(6, 'est3', 'El tercer estante', ['Apoyá el último estante: los espárragos de atrás pasan por sus agujeros.'], [manta(), ...s6()], {
      usa: ['1 · Estante', 'A · Tornillos Allen ×2', 'Llave'], hw: { A: 2 }, titular: 'Adelante, un tornillo en cada caño', resaltar: ['est3', 'A'], unir: ['c2', 'esp3'],
      subs: { a: ['Apoyá el último estante: los espárragos de atrás pasan por sus agujeros.'], b: ['En los dos agujeros de adelante, poné un tornillo Allen A.', 'Ajustalos con la llave.'], tip: '' },
      mueven: [mover('est3', 120, [0, 0, 1], 0), mover('A', 60, [0, 0, 1], .6)],
      fases: { pieza: ['est3'], hw: IDS_A, retener: ['A'], ocultarEnA: IDS_A, ref: 'A.fi', vistaB: { yaw: -24, pitch: 52 }, titularB: 'Un tornillo en cada caño de adelante', herramienta: { tipo: 'allen', pos: [...P.fi, Z3 + E + 3] } },
      vista: { yaw: -24, pitch: 22 },
    }),
    paso(7, 'columnas', 'Las columnas y los ganchos', [
      'Enroscá un caño largo en cada espárrago de atrás.',
      'Arriba, un espárrago y un gancho D con la punta hacia afuera; después, el otro caño largo.',
    ], [manta(), ...s7()], {
      usa: ['6 · Caños largos ×4', 'B · Espárragos ×2', 'D · Ganchos ×2'], hw: { B: 2, D: 2 }, titular: 'El gancho, apretado entre los dos caños', resaltar: ['col1', 'esp4', 'gancho', 'col2'], unir: ['est3'],
      subs: { a: ['Enroscá un caño largo en cada espárrago de atrás.', 'Arriba, un espárrago y un gancho D con la punta hacia afuera; después, el otro caño largo.'], b: [], tip: 'A confirmar con fábrica: en la versión de chapa (CH35) el gancho va así, entre dos caños.' },
      mueven: [mover('col1', 200, [0, 0, 1], 0), mover('esp4', 70, [0, 0, 1], .5), mover('gancho', 80, [0, 0, 1], .8), mover('col2', 220, [0, 0, 1], 1.1)],
      vista: { yaw: -28, pitch: 12 },
    }),
    paso(8, 'tabla', 'La tabla de arriba', ['Apoyá la tabla con perillas delante de las dos columnas, arriba de todo.'], [manta(), ...perchero()], {
      usa: ['2 · Tabla con perillas', 'E · Tornillos ×2', 'Llave'], hw: { E: 2 }, titular: 'Las perillas, hacia adelante', resaltar: ['percha', 'T'], unir: ['col2'],
      subs: { a: ['Apoyá la tabla con perillas delante de las dos columnas, arriba de todo.'], b: ['Poné un tornillo E de frente en cada columna y ajustalo.'], tip: 'Si te cuesta llegar, hacelo entre dos o con un banquito firme.' },
      mueven: [mover('percha', 140, [0, 1, 0], 0), mover('T', 50, [0, 1, 0], .6)],
      fases: { pieza: ['percha'], hw: IDS_T, retener: ['T'], ocultarEnA: IDS_T, ref: 'T.ti', vistaB: { yaw: -20, pitch: 6 }, titularB: 'Un tornillo en cada columna', herramienta: { tipo: 'allen', pos: [P.ti[0], TY + E + 5, ZT0 + 35], eje: [0, 1, 0] } },
      vista: { yaw: -26, pitch: 10 },
    }),
    paso(9, 'revisar', 'Revisá que esté firme', ['Repasá los tornillos con la llave.', 'Si algo se mueve, ajustalo un poco más.'], [manta(), ...perchero()], {
      usa: ['Llave'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['A', 'T'], vista: { yaw: -34, pitch: 12 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -24, pitch: 12 }, piezas: perchero(), mueven: [] },
  ],
};
