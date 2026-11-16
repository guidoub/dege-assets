import { manta, mover, herrajes, paso as P_, textos, marca, MATS, cil, caja, regaton, esparrago, allen, idsAllen, REG, R_CANO } from './_estimado.js?v=d78344297c';

const W = 680, D = 300, E = 15, H = 1670;
const P = { fi: [315, 125], fd: [-315, 125], ti: [315, -125], td: [-315, -125] }, K = Object.keys(P);
const POSTE = 'ti', CORTAS = ['fi', 'fd', 'td'];
const Z1 = 96, Z2 = 451, ZJ = 1100, ZTOP = H - 30;
const tabla = (id, z) => ({ ...caja(id, -W / 2, W / 2, -D / 2, D / 2, z, E, 'madera'), huecos: K.map((k) => ({ x: P[k][0], y: P[k][1], w: 8.5, d: 8.5, r: 4.25 })) });
const reg = () => K.map((k) => regaton('reg.' + k, P[k]));
const pies = () => K.map((k) => cil('pie.' + k, [...P[k], REG], Z1 - REG, R_CANO));
const esp1 = () => K.map((k) => esparrago('esp1.' + k, P[k], Z1));
const canos = () => K.map((k) => cil('cano.' + k, [...P[k], Z1 + E], Z2 - Z1 - E, R_CANO));
const espPoste = (id, z) => esparrago(id, P[POSTE], z);
const [PX, PY] = P[POSTE];
const GANCHOS = [[1580, [1, 0]], [1405, [0, -1]], [1246, [0, 1]], [1080, [-1, 0]]];
const gancho = (k) => { const [z, [dx, dy]] = GANCHOS[k], id = 'gancho.' + (k + 1), x0 = PX + dx * R_CANO, y0 = PY + dy * R_CANO;
  return [cil(id + '.brazo', [x0, y0, z], 62, 3.5, 'chapa', { eje: [dx, dy, 0], seg: 14 }),
    cil(id + '.punta', [x0 + dx * 60, y0 + dy * 60, z - 2], 26, 3.5, 'chapa', { eje: [dx * .45, dy * .45, 1], seg: 14 })]; };
const ganchos = () => [0, 1, 2, 3].flatMap(gancho);
const s1 = () => [...reg(), ...pies(), ...esp1()];
const s2 = () => [...s1(), tabla('est1', Z1)];
const s3 = () => [...s2(), ...canos(), espPoste('esp2', Z2)];
const s4 = () => [...s3(), tabla('est2', Z2), ...CORTAS.flatMap((k) => allen('A.' + k, P[k], Z2 + E))];
const s5 = () => [...s4(), cil('poste1', [PX, PY, Z2 + E], ZJ - Z2 - E, R_CANO), espPoste('esp3', ZJ), cil('poste2', [PX, PY, ZJ], H - ZJ, R_CANO)];
const perchero = () => [...s5(), ...ganchos()];
const IDS_A = idsAllen(CORTAS.map((k) => 'A.' + k));

const NA = 7, paso = P_(NA, { yaw: -26, pitch: 16 });
const acostado = (id, x, y, largo) => cil(id, [x, y, R_CANO], largo, R_CANO, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1400, 960),
  ...[0, 1].map((i) => ({ ...caja('pz.1.' + i, -W / 2, W / 2, -D / 2, D / 2, 0, E, 'madera'), pos: [-300, 220, i * (E + .5)] })),
  { id: 'rotulo.1', tipo: 'texto', txt: '1 · ESTANTES ×2', pos: [-300, 420, .3], alto: 26 },
  ...[0, 1, 2, 3].map((i) => acostado('pz.2.' + i, 160, 380 - i * 40, Z1 - REG)),
  { id: 'rotulo.2', tipo: 'texto', txt: '2 · PATAS ×4', pos: [230, 440, .3], alto: 20 },
  ...[0, 1, 2, 3].map((i) => acostado('pz.3.' + i, 160, 180 - i * 40, Z2 - Z1 - E)),
  { id: 'rotulo.3', tipo: 'texto', txt: '3 · CAÑOS ×4', pos: [330, 230, .3], alto: 20 },
  acostado('pz.4.0', -620, -130, ZJ - Z2 - E), acostado('pz.4.1', -620, -180, H - ZJ),
  { id: 'rotulo.4', tipo: 'texto', txt: '4 · CAÑOS DEL POSTE ×2', pos: [-330, -260, .3], alto: 20 },
];

export default {
  id: 'm05', version: 1, pasosManual: NA, estimado: true,
  marca: marca('https://dege.com.ar/productos/perchero-industrial-m05/', ['#C8995B', '#1d1d1b', '#ffffff', '#e9e4d6']),
  materiales: MATS('#232323', { madera: { color: '#C99A5E' } }),
  inventario: [{ id: 'C', n: 4, label: 'C · Regatones' }, { id: 'B', n: 6, label: 'B · Espárragos' }, { id: 'A', n: 3, label: 'A · Tornillos Allen' }, { id: 'D', n: 4, label: 'D · Ganchos' }],
  textos: textos({
    nombre: 'Perchero industrial con banco', codigo: 'M05', cabecera: 'Perchero con banco M05', sust: 'perchero', art: 'el',
    ladoCuerpo: 'Un banco de dos niveles y un poste con ganchos atrás. Seguí los pasos y girá el modelo para ver cada unión.',
    datos: [['layers', '12 piezas', '+ 17 herrajes'], ['steps', `${NA} pasos`, 'llave incluida'], ['box', '68 × 30 × 167', 'cm · ancho, fondo y alto']],
    momTitulo: 'Tu perchero,<br><em>de abajo hacia arriba</em>', momCuerpo: 'Primero el banco y después el poste con los ganchos. La llave viene en la caja.',
    finCuerpo: 'Sentate a ponerte las zapatillas, colgá el abrigo en el poste y dejá el calzado abajo.',
    finTip: 'Apoyalo contra la pared. Cada tanto, repasá los tornillos. ¡Mandanos una foto cuando lo tengas armado!',
  }),
  cotas: { w: 68, d: 30, h: 167, unidad: 'cm', caja: [-W / 2, W / 2, -D / 2, D / 2, 0, H], lineas: [
    [[W / 2, D / 2, 0], [-W / 2, D / 2, 0], [0, 80, 0], 68],
    [[-W / 2, D / 2, 0], [-W / 2, -D / 2, 0], [-70, 0, 0], 30],
    [[-W / 2, -D / 2, 0], [-W / 2, -D / 2, H], [-90, 0, 0], 167],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -24, pitch: 12 }, piezas: perchero(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: 2 estantes, 4 patas, 4 caños y los 2 caños del poste.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'A confirmar con fábrica: la cantidad y el largo de cada caño.' },
      usa: ['1 · Estantes ×2', '2 · Patas ×4', '3 · Caños ×4', '4 · Caños del poste ×2'],
      elegir: [{ m: ['pz.1'], t: 'Los 2 estantes del banco.' }, { m: ['pz.2'], t: 'Las 4 patas cortas.' }, { m: ['pz.3'], t: 'Los 4 caños entre los estantes.' }, { m: ['pz.4'], t: 'Los 2 caños largos del poste.' }],
      cuenta: { fijo: '12 piezas · 4 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 64 }, piezas: ordenPiezas(), resaltar: ['pz.4'], mueven: [mover('pz.4', 60)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 6 espárragos, 3 tornillos Allen, 4 ganchos, 4 regatones y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'Los 4 ganchos son iguales: van en el poste, al final.' },
      usa: ['Llave incluida'], check: [[6, 'B · Espárragos'], [3, 'A · Tornillos Allen'], [4, 'D · Ganchos'], [4, 'C · Regatones'], [1, 'Llave']],
      cuenta: { fijo: '17 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajes([{ letra: 'B', n: 6, tipo: 'esparrago' }, { letra: 'A', n: 3, tipo: 'allen' }, { letra: 'C', n: 4, tipo: 'regaton' }]), resaltar: ['llave'], mueven: [mover('llave', 90)],
    },
    paso(1, 'patas', 'Las patas', ['Enroscá un regatón C en una punta de cada pata y un espárrago B en la otra.'], [manta(), ...s1()], {
      usa: ['2 · Patas ×4', 'C · Regatones ×4', 'B · Espárragos ×4'], hw: { C: 4, B: 4 }, titular: 'Regatón abajo, espárrago arriba', resaltar: ['reg', 'esp1'], unir: ['pie'],
      mueven: [mover('reg', 40, [0, 0, -1], 0), mover('esp1', 70, [0, 0, 1], .5)], vista: { yaw: -24, pitch: 30 },
    }),
    paso(2, 'est1', 'El estante de abajo', ['Apoyá un estante haciendo coincidir cada espárrago con su agujero.'], [manta(), ...s2()], {
      usa: ['1 · Estante'], titular: 'Cada espárrago, en su agujero', resaltar: ['est1'], unir: ['pie', 'esp1'], mueven: [mover('est1', 120, [0, 0, 1], 0)], vista: { yaw: -24, pitch: 26 },
    }),
    paso(3, 'canos', 'Los caños', ['Enroscá un caño en cada espárrago.', 'En el caño de atrás a la izquierda, enroscá un espárrago arriba: ahí va el poste.'], [manta(), ...s3()], {
      usa: ['3 · Caños ×4', 'B · Espárrago'], hw: { B: 1 }, titular: 'El espárrago, solo en el del poste', resaltar: ['cano', 'esp2'], unir: ['est1'],
      mueven: [mover('cano', 130, [0, 0, 1], 0), mover('esp2', 70, [0, 0, 1], .7)], vista: { yaw: -24, pitch: 24 },
    }),
    paso(4, 'est2', 'El asiento', ['Apoyá el otro estante: el espárrago del poste pasa por su agujero.'], [manta(), ...s4()], {
      usa: ['1 · Estante', 'A · Tornillos Allen ×3', 'Llave'], hw: { A: 3 }, titular: 'Tres tornillos, uno por caño', resaltar: ['est2', 'A'], unir: ['cano', 'esp2'],
      subs: { a: ['Apoyá el otro estante: el espárrago del poste pasa por su agujero.'], b: ['En los otros tres agujeros, poné un tornillo Allen A.', 'Ajustalos con la llave.'], tip: '' },
      mueven: [mover('est2', 120, [0, 0, 1], 0), mover('A', 60, [0, 0, 1], .6)],
      fases: { pieza: ['est2'], hw: IDS_A, retener: ['A'], ocultarEnA: IDS_A, ref: 'A.fi', vistaB: { yaw: -24, pitch: 52 }, titularB: 'Un tornillo en cada caño', herramienta: { tipo: 'allen', pos: [...P.fi, Z2 + E + 3] } },
      vista: { yaw: -24, pitch: 24 },
    }),
    paso(5, 'poste', 'El poste', [
      'Enroscá el primer caño del poste en el espárrago.',
      'Arriba, otro espárrago y el segundo caño del poste.',
    ], [manta(), ...s5()], {
      usa: ['4 · Caños del poste ×2', 'B · Espárrago'], hw: { B: 1 }, titular: 'Dos caños, uno arriba del otro', resaltar: ['poste1', 'esp3', 'poste2'], unir: ['est2'],
      subs: { a: ['Enroscá el primer caño del poste en el espárrago.', 'Arriba, otro espárrago y el segundo caño del poste.'], b: [], tip: 'Ajustá a mano hasta que los caños queden bien juntos.' },
      mueven: [mover('poste1', 200, [0, 0, 1], 0), mover('esp3', 70, [0, 0, 1], .5), mover('poste2', 220, [0, 0, 1], .9)],
      vista: { yaw: -26, pitch: 12 },
    }),
    paso(6, 'ganchos', 'Los ganchos', ['Enroscá un gancho D en cada agujero del poste.'], [manta(), ...perchero()], {
      usa: ['D · Ganchos ×4'], hw: { D: 4 }, titular: 'Cada uno hacia un lado', resaltar: ['gancho'], unir: ['poste2'],
      subs: { a: ['Enroscá un gancho D en cada agujero del poste.', 'Girálos hasta que la punta quede hacia arriba.'], b: [], tip: 'A confirmar con fábrica: cómo se fijan los ganchos al poste.' },
      mueven: [0, 1, 2, 3].map((k) => mover('gancho.' + (k + 1), 70, [...GANCHOS[k][1], 0], k * .3)),
      vista: { yaw: -26, pitch: 12 },
    }),
    paso(7, 'revisar', 'Revisá que esté firme', ['Repasá los 3 tornillos con la llave.', 'Si algo se mueve, ajustalo un poco más.'], [manta(), ...perchero()], {
      usa: ['Llave'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['A'], vista: { yaw: -34, pitch: 12 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -24, pitch: 12 }, piezas: perchero(), mueven: [] },
  ],
};
