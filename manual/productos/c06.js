import { manta, mover, herrajes, paso as P_, textos, marca, MATS, cil, caja, regaton, esparrago, allen, idsAllen, REG, R_CANO } from './_estimado.js?v=3c7a40cf6b';

const W = 670, D = 450, E = 15, Z1 = 72, Z2 = 345;             // tablas de 15 mm (MDP); estante a 7,2 cm, tapa a 34,5
const P = { a: [300, 190], b: [-300, 190], c: [300, -190], d: [-300, -190] }, K = Object.keys(P);
const tabla = (id, z) => ({ ...caja(id, -W / 2, W / 2, -D / 2, D / 2, z, E, 'madera'), huecos: K.map((k) => ({ x: P[k][0], y: P[k][1], w: 8.5, d: 8.5, r: 4.25 })) });
const reg = () => K.map((k) => regaton('reg.' + k, P[k]));
const pies = () => K.map((k) => cil('pie.' + k, [...P[k], REG], Z1 - REG, R_CANO));
const esp = () => K.map((k) => esparrago('esp.' + k, P[k], Z1));
const canos = () => K.map((k) => cil('cano.' + k, [...P[k], Z1 + E], Z2 - Z1 - E, R_CANO));
const tornA = () => K.flatMap((k) => allen('A.' + k, P[k], Z2 + E));
const IDS_A = idsAllen(K.map((k) => 'A.' + k));
const s1 = () => [...reg(), ...pies(), ...esp()];
const s2 = () => [...s1(), tabla('estante', Z1)];
const s3 = () => [...s2(), ...canos()];
const mesa = () => [...s3(), tabla('tapa', Z2), ...tornA()];

const NA = 5, paso = P_(NA, { yaw: -24, pitch: 22 });
const acostado = (id, x, y, largo) => cil(id, [x, y, R_CANO], largo, R_CANO, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1250, 860),
  { ...caja('pz.1', -W / 2, W / 2, -D / 2, D / 2, 0, E, 'madera'), pos: [-250, 120, 0] }, { ...caja('pz.2', -W / 2, W / 2, -D / 2, D / 2, 0, E, 'madera'), pos: [-250, 120, E + .5] },
  { id: 'rotulo.1', tipo: 'texto', txt: '1 · TAPA Y ESTANTE', pos: [-250, 380, .3], alto: 26 },
  ...[0, 1, 2, 3].map((i) => acostado('pz.3.' + i, 230, 260 - i * 45, Z1 - REG)),
  { id: 'rotulo.3', tipo: 'texto', txt: '3 · PATAS ×4', pos: [270, 330, .3], alto: 22 },
  ...[0, 1, 2, 3].map((i) => acostado('pz.4.' + i, 150, -10 - i * 45, Z2 - Z1 - E)),
  { id: 'rotulo.4', tipo: 'texto', txt: '4 · CAÑOS ×4', pos: [280, -200, .3], alto: 22 },
];

export default {
  id: 'c06', codigo: 'C06', version: 1, pasosManual: NA, estimado: true,
  marca: marca('https://dege.com.ar/productos/mesa-ratona-industrial1/', ['#C8995B', '#1d1d1b', '#ffffff', '#e9e4d6']),
  materiales: MATS('#232323', { madera: { color: '#C99A5E' } }),
  inventario: [{ id: 'C', n: 4, label: 'C · Regatones' }, { id: 'B', n: 4, label: 'B · Espárragos' }, { id: 'A', n: 4, label: 'A · Tornillos Allen' }],
  textos: textos({
    nombre: 'Mesa ratona industrial', codigo: 'C06', cabecera: 'Mesa ratona industrial C06', sust: 'mesa', art: 'la',
    ladoCuerpo: 'Dos tablas de melamina y cuatro patas de caño. La C07, de 90 × 60, se arma igual. Seguí los pasos y girá el modelo.',
    datos: [['layers', '10 piezas', '+ 12 herrajes'], ['steps', `${NA} pasos`, 'llave Allen incluida'], ['box', '67 × 45 × 36', 'cm · la C07 mide 90 × 60']],
    momTitulo: 'Tu mesa,<br><em>en 15 minutos</em>', momCuerpo: 'Se arma de abajo hacia arriba, todo enroscado a mano. La llave Allen viene en la caja.',
    finCuerpo: 'Arriba lo de todos los días; abajo, revistas, canastos o una planta.',
  }),
  cotas: { w: 67, d: 45, h: 36, unidad: 'cm', caja: [-W / 2, W / 2, -D / 2, D / 2, 0, Z2 + E + 3], lineas: [
    [[W / 2, D / 2, 0], [-W / 2, D / 2, 0], [0, 80, 0], 67],
    [[W / 2, D / 2, 0], [W / 2, -D / 2, 0], [70, 0, 0], 45],
    [[-W / 2, -D / 2, 0], [-W / 2, -D / 2, Z2 + E], [-80, 0, 0], 36],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -22, pitch: 20 }, piezas: mesa(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: 2 tablas, 4 patas cortas y 4 caños.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'Las dos tablas son iguales: cualquiera puede ser la tapa.' },
      usa: ['1 · Tablas ×2', '3 · Patas ×4', '4 · Caños ×4'],
      elegir: [{ m: ['pz.1', 'pz.2'], t: 'Las 2 tablas de melamina: el estante y la tapa.' }, { m: ['pz.3'], t: 'Las 4 patas cortas.' }, { m: ['pz.4'], t: 'Los 4 caños que van entre las tablas.' }],
      cuenta: { fijo: '10 piezas · 3 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 }, piezas: ordenPiezas(), resaltar: ['pz.2'], mueven: [mover('pz.2', 70)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 4 tornillos Allen, 4 espárragos, 4 regatones y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: '' },
      usa: ['Llave Allen incluida'], check: [[4, 'A · Tornillos Allen'], [4, 'B · Espárragos'], [4, 'C · Regatones'], [1, 'Llave Allen']],
      cuenta: { fijo: '12 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajes([{ letra: 'A', n: 4, tipo: 'allen' }, { letra: 'B', n: 4, tipo: 'esparrago' }, { letra: 'C', n: 4, tipo: 'regaton' }]), resaltar: ['llave'], mueven: [mover('llave', 90)],
    },
    paso(1, 'patas', 'Las patas', ['Enroscá un regatón C en una punta de cada pata.', 'En la otra punta, enroscá un espárrago B hasta la mitad.'], [manta(), ...s1()], {
      usa: ['3 · Patas ×4', 'C · Regatones ×4', 'B · Espárragos ×4'], hw: { C: 4, B: 4 }, titular: 'Regatón abajo, espárrago arriba', resaltar: ['reg', 'esp'], unir: ['pie'],
      mueven: [mover('reg', 40, [0, 0, -1], 0), mover('esp', 70, [0, 0, 1], .5)], vista: { yaw: -24, pitch: 30 },
    }),
    paso(2, 'estante', 'El estante', ['Apoyá una tabla haciendo coincidir cada espárrago con su agujero.'], [manta(), ...s2()], {
      usa: ['1 · Tabla'], titular: 'Cada espárrago, en su agujero', resaltar: ['estante'], unir: ['pie', 'esp'],
      mueven: [mover('estante', 120, [0, 0, 1], 0)],
    }),
    paso(3, 'canos', 'Los caños', ['Enroscá un caño en cada espárrago, a mano.', 'El estante queda apretado entre la pata y el caño.'], [manta(), ...s3()], {
      usa: ['4 · Caños ×4'], titular: 'A mano, hasta el tope', cuenta: { de: 'cano.', n: 4, txt: 'Caño', fin: '4 caños en su lugar' }, resaltar: ['cano'], unir: ['estante', 'esp'],
      mueven: K.map((k, i) => mover('cano.' + k, 140, [0, 0, 1], i * .3)),
    }),
    paso(4, 'tapa', 'La tapa', ['Apoyá la otra tabla con cada agujero sobre un caño.'], [manta(), ...mesa()], {
      usa: ['1 · Tabla', 'A · Tornillos Allen ×4', 'Llave Allen'], hw: { A: 4 }, titular: 'Cada agujero, sobre su caño', resaltar: ['tapa', 'A'], unir: ['cano'],
      subs: { a: ['Apoyá la otra tabla con cada agujero sobre un caño.'], b: ['Poné un tornillo Allen A en cada agujero.', 'Ajustalos con la llave hasta que la mesa quede firme.'], tip: 'Ajustá sin forzar: la melamina se puede marcar.' },
      mueven: [mover('tapa', 140, [0, 0, 1], 0), mover('A', 70, [0, 0, 1], .6)],
      fases: { pieza: ['tapa'], hw: IDS_A, retener: ['A'], ocultarEnA: IDS_A, ref: 'A.a', vistaB: { yaw: -24, pitch: 56 }, titularB: 'Un tornillo en cada esquina', herramienta: { tipo: 'allen', pos: [...P.a, Z2 + E + 3] } },
    }),
    paso(5, 'revisar', 'Revisá que esté firme', ['Repasá los 4 tornillos con la llave.', 'Si la mesa se mueve, ajustá un poco más.'], [manta(), ...mesa()], {
      usa: ['Llave Allen'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['A'], vista: { yaw: -34, pitch: 20 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -22, pitch: 18 }, piezas: mesa(), mueven: [] },
  ],
};
