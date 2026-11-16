import { manta, mover, herrajes, paso as P_, textos, marca, MATS, cil, caja } from './_estimado.js?v=b1713398f9';

const W = 450, D = 300, E = 15, H = 660, ZT = H - E, R = 11;
const XS = [205, -205], YS = [-115, -55];                  // dos caños por lado, del lado de atrás
const PLA = 3;                                              // planchuela soldada arriba de cada par de caños
const base = () => [
  ...XS.map((x, i) => caja('base.pie.' + i, x - 18, x + 18, -150, 250, 0, 6)),
  caja('base.travesano', -205, 205, -150, -114, 0, 6),
];
const canos = () => XS.flatMap((x, i) => YS.map((y, j) => cil(`cano.${i}${j}`, [x, y, 6], ZT - PLA - 6, R)));
const planchuelas = () => XS.map((x, i) => caja('plancha.' + i, x - 18, x + 18, -140, 20, ZT - PLA, PLA));
const tapa = () => caja('tapa', -W / 2, W / 2, -D / 2, D / 2, ZT, E, 'madera');
const tornA = () => XS.flatMap((x, i) => YS.flatMap((y, j) => [cil(`A.${i}${j}.cana`, [x, y, 0], 18, 3, 'zinc', { seg: 14 }), cil(`A.${i}${j}.cabeza`, [x, y, 0], 3, 7, 'negro', { eje: [0, 0, -1], seg: 24 })]));
const tornB = () => XS.flatMap((x, i) => [-85, 5].flatMap((y, j) => [cil(`B.${i}${j}.cana`, [x, y, ZT - PLA], 14, 2.2, 'zinc', { seg: 12 }), cil(`B.${i}${j}.cabeza`, [x, y, ZT - PLA], 2.4, 5, 'zinc', { eje: [0, 0, -1], seg: 20 })]));
const ids = (pre, partes = ['cana', 'cabeza']) => XS.flatMap((_, i) => [0, 1].flatMap((j) => partes.map((p) => `${pre}.${i}${j}.${p}`)));
const estructura = () => [...base(), ...canos(), ...planchuelas(), ...tornA()];
const mesa = () => [...estructura(), tapa(), ...tornB()];

const NA = 3, paso = P_(NA, { yaw: -32, pitch: 18 });
const ordenPiezas = () => [
  manta(1150, 800),
  { ...caja('pz.1', -W / 2, W / 2, -D / 2, D / 2, 0, E, 'madera'), pos: [-260, 100, 0] },
  { id: 'rotulo.1', tipo: 'texto', txt: '1 · TAPA', pos: [-260, 290, .3], alto: 26 },
  ...base().map((p) => ({ ...p, id: 'pz.2.' + p.id.split('.').slice(1).join('_'), pos: [230, 40, 0] })),
  { id: 'rotulo.2', tipo: 'texto', txt: '2 · BASE', pos: [230, 330, .3], alto: 26 },
  ...[0, 1].map((i) => ({ id: 'pz.3.' + i, tipo: 'perfil', puntos: [[-310, -20], [310, -20], [310, 20], [-310, 20]], pos: [-20, -250 - i * 70, 0], z0: 0, z1: 22, mat: 'chapa' })),
  { id: 'rotulo.3', tipo: 'texto', txt: '3 · PATAS DOBLES ×2', pos: [-20, -370, .3], alto: 22 },
];

export default {
  id: 'm02', version: 1, pasosManual: NA, estimado: true,
  marca: marca('https://dege.com.ar/productos/mesa-de-arrime-m02/', ['#C8995B', '#1d1d1b', '#ffffff', '#e9e4d6']),
  materiales: MATS('#232323', { madera: { color: '#C99A5E' } }),
  inventario: [{ id: 'A', n: 4, label: 'A · Tornillos Allen' }, { id: 'B', n: 4, label: 'B · Tornillos para madera' }],
  textos: textos({
    nombre: 'Mesa de arrime', codigo: 'M02', cabecera: 'Mesa de arrime M02', sust: 'mesa', art: 'la',
    ladoCuerpo: 'Una base que entra debajo del sillón, dos patas dobles de caño y la tapa de melamina. Seguí los pasos y girá el modelo.',
    datos: [['layers', '4 piezas', '+ 8 tornillos'], ['steps', `${NA} pasos`, 'llave y destornillador'], ['box', '45 × 30 × 66', 'cm · tapa y alto']],
    momTitulo: 'Tu mesa,<br><em>en 10 minutos</em>', momCuerpo: 'Primero la estructura y después la tapa. La llave Allen viene en la caja; para la tapa vas a usar un destornillador Phillips.',
    finCuerpo: 'Metela debajo del sillón: la tapa queda arriba, justo donde apoyás la taza o la compu.',
  }),
  cotas: { w: 45, d: 30, h: 66, unidad: 'cm', llenar: .7, caja: [-W / 2, W / 2, -D / 2, 250, 0, H], lineas: [
    [[W / 2, D / 2, H], [-W / 2, D / 2, H], [0, 0, 70], 45],
    [[-W / 2, D / 2, H], [-W / 2, -D / 2, H], [-70, 0, 0], 30],
    [[W / 2, -D / 2, 0], [W / 2, -D / 2, H], [80, 0, 0], 66],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -30, pitch: 18 }, piezas: mesa(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: la tapa, la base y las 2 patas dobles.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'A confirmar con fábrica: si los caños vienen sueltos o soldados de a dos.' },
      usa: ['1 · Tapa', '2 · Base', '3 · Patas dobles ×2'],
      elegir: [{ m: ['pz.1'], t: 'Es la tapa de melamina.' }, { m: ['pz.2'], t: 'Es la base: entra debajo del sillón.' }, { m: ['pz.3'], t: 'Las 2 patas dobles: dos caños con la planchuela arriba.' }],
      cuenta: { fijo: '4 piezas · 3 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 }, piezas: ordenPiezas(), resaltar: ['pz.1'], mueven: [mover('pz.1', 70)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los tornillos', titular: 'Contá antes de armar',
      subs: { a: ['Son 4 tornillos Allen A para la base y 4 tornillos B para la tapa.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'Los tornillos B van con un destornillador Phillips: no viene en la caja.' },
      usa: ['Llave Allen incluida', 'Destornillador Phillips (no incluido)'], check: [[4, 'A · Tornillos Allen'], [4, 'B · Tornillos para madera'], [1, 'Llave Allen']],
      cuenta: { fijo: '8 tornillos · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajes([{ letra: 'A', n: 4, tipo: 'allen' }, { letra: 'B', n: 4, tipo: 'tornillo' }]), resaltar: ['llave'], mueven: [mover('llave', 90)],
    },
    paso(1, 'estructura', 'Las patas a la base', ['Apoyá cada pata doble sobre su lado de la base, con la planchuela arriba.'], [...estructura()], {   // sin manta: la segunda parte se ve desde abajo
      usa: ['2 · Base', '3 · Patas dobles ×2', 'A · Tornillos Allen ×4', 'Llave Allen'], hw: { A: 4 }, titular: 'Los caños, del lado del travesaño', resaltar: ['cano', 'plancha', 'A'], unir: ['base'],
      subs: { a: ['Apoyá cada pata doble sobre su lado de la base, con la planchuela arriba.'], b: ['Desde abajo de la base, poné un tornillo Allen A en cada caño.', 'Ajustalos con la llave.'], tip: 'Los caños van atrás, donde está el travesaño; la parte larga de la base entra debajo del sillón.' },
      mueven: [mover(['cano', 'plancha'], 160, [0, 0, 1], 0), mover('A', 50, [0, 0, -1], .6)],
      fases: { pieza: ['cano', 'plancha'], hw: ids('A'), retener: ['A'], ocultarEnA: ids('A'), ref: 'A.00', vistaB: { yaw: -30, pitch: -28 }, titularB: 'Desde abajo, uno por caño', herramienta: { tipo: 'allen', pos: [XS[0], YS[0], -3], eje: [0, 0, -1] } },
    }),
    paso(2, 'tapa', 'La tapa', ['Apoyá la tapa sobre las dos planchuelas, centrada.'], [...mesa()], {
      usa: ['1 · Tapa', 'B · Tornillos ×4', 'Destornillador Phillips'], hw: { B: 4 }, titular: 'Centrada sobre las planchuelas', resaltar: ['tapa', 'B'], unir: ['plancha'],
      subs: { a: ['Apoyá la tapa sobre las dos planchuelas, centrada.'], b: ['Desde abajo de cada planchuela, poné 2 tornillos B en la tapa.', 'Ajustalos con el destornillador, sin pasarte.'], tip: 'Si te resulta más cómodo, apoyá la tapa boca abajo sobre la manta y atornillá la estructura dada vuelta.' },
      mueven: [mover('tapa', 140, [0, 0, 1], 0), mover('B', 40, [0, 0, -1], .6)],
      fases: { pieza: ['tapa'], hw: ids('B'), retener: ['B'], ocultarEnA: ids('B'), ref: 'B.00', vistaB: { yaw: -40, pitch: -22 }, titularB: 'Dos tornillos por planchuela', herramienta: { tipo: 'phillips', pos: [XS[0], -85, ZT - PLA - 2.4], eje: [0, 0, -1] } },
    }),
    paso(3, 'revisar', 'Revisá que esté firme', ['Repasá los 8 tornillos.', 'Si la mesa se mueve, ajustá un poco más.'], [manta(), ...mesa()], {
      usa: ['Llave Allen', 'Destornillador Phillips'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['A', 'B'], vista: { yaw: -40, pitch: 16 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -30, pitch: 16 }, piezas: mesa(), mueven: [] },
  ],
};
