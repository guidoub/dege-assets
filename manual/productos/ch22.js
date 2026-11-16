import { manta, mover, herrajes, paso as P_, textos, marca, MATS, gota, cil, perfil } from './_estimado.js?v=40bdf307a1';
import { mesa3 } from './_tres_patas.js?v=40bdf307a1';

const TAPA = gota(880, 570);
const M = mesa3({ pre: 'g', contorno: TAPA, patas: { 1: [300, 165], 2: [-350, 0], 3: [170, -195] }, alto: 340 });
const NA = 7, paso = P_(NA, { yaw: -24, pitch: 22 });
const herramientaA = (k, punta) => { const [dx, dy] = M.dir(k), b = punta === 'lejos' ? M.P[k] : M.P[2], s = punta === 'lejos' ? 1 : -1;
  return { tipo: 'phillips', pos: [b[0] + s * dx * (11 + 3), b[1] + s * dy * (11 + 3), M.z(k)], eje: [s * dx, s * dy, 0] }; };

const acostado = (id, x, y, largo, r) => cil(id, [x, y, r], largo, r, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1300, 920),
  perfil('pz.5', TAPA.map(([x, y]) => [x * .7 - 170, y * .7 + 180]), 0, 2.5),
  { id: 'rotulo.5', tipo: 'texto', txt: '5 · CHAPA', pos: [-170, 400, .3], alto: 30 },
  acostado('pz.1', 230, 200, 325, 11), { id: 'rotulo.1', tipo: 'texto', txt: '1 · CAÑO', pos: [395, 250, .3], alto: 24 },
  acostado('pz.2', 230, 110, 325, 11), { id: 'rotulo.2', tipo: 'texto', txt: '2 · CAÑO', pos: [395, 160, .3], alto: 24 },
  acostado('pz.3', 230, 20, 325, 11), { id: 'rotulo.3', tipo: 'texto', txt: '3 · CAÑO', pos: [395, 70, .3], alto: 24 },
  ...[0, 1].map((i) => acostado('pz.4.' + i, -500, -170 + i * 40, 560, 6)),
  { id: 'rotulo.4', tipo: 'texto', txt: '4 · TRAVESAÑOS ×2', pos: [-220, -250, .3], alto: 24 },
];
const IDS_A = (pares) => pares.flatMap(([k, p]) => M.idsA(k, p));

export default {
  id: 'ch22', version: 2, pasosManual: NA,
  marca: marca('https://dege.com.ar/productos/mesa-ratona-gota-b20g3/', ['#3a3a3a', '#ffffff', '#e9e4d6', '#c9ced3']),
  materiales: MATS('#3d3d3d'),
  inventario: [{ id: 'C', n: 3, label: 'C · Regatones' }, { id: 'A', n: 4, label: 'A · Tornillos (Phillips)' }, { id: 'B', n: 3, label: 'B · Tornillos Allen' }],
  herramientas: [{ id: 'D', n: 1, label: 'D · Llave Allen', incluida: true }, { id: 'phillips', n: 1, label: 'Destornillador Phillips', incluida: false }],
  textos: textos({
    nombre: 'Mesa ratona gota', codigo: 'CH22', cabecera: 'Mesa ratona gota CH22', sust: 'mesa', art: 'la',
    ladoCuerpo: 'Una chapa en forma de gota, tres caños y dos travesaños. Seguí los 7 pasos del manual de fábrica y girá el modelo para ver cada unión.',
    datos: [['layers', '6 piezas', '+ 10 herrajes'], ['steps', `${NA} pasos`, 'llave Allen incluida'], ['box', '88 × 57 × 34', 'cm · largo, fondo y alto']],
    momTitulo: 'Tu mesa,<br><em>en 15 minutos</em>', momCuerpo: 'Tres caños, dos travesaños y la chapa. La llave Allen viene en la caja; para los travesaños vas a usar un destornillador Phillips.',
    finCuerpo: 'La curva ancha va hacia el sillón y la punta angosta deja pasar.',
  }),
  cotas: { w: 88, d: 57, h: 34, unidad: 'cm', llenar: .66, caja: [-440, 440, -285, 285, 0, 343], lineas: [
    [[440, 285, 0], [-440, 285, 0], [0, 70, 0], 88],
    [[440, 285, 0], [440, -285, 0], [80, 0, 0], 57],
    [[...M.P[2], 0], [...M.P[2], 340], [-130, 0, 0], 34],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -22, pitch: 24 }, piezas: M.completa(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: la chapa, tres caños y dos travesaños.', 'Mirá los agujeros de cada caño: así sabés cuál es cuál.'], b: [], tip: 'El caño 2 tiene dos agujeros (a 11 y a 19 cm de la punta); el 1 tiene uno a 11 cm y el 3, uno a 19 cm.' },
      usa: ['5 · Chapa', '1 · Caño', '2 · Caño', '3 · Caño', '4 · Travesaños ×2'],
      elegir: [{ m: ['pz.5'], t: 'Es la chapa en forma de gota, con un agujero para cada caño.' }, { m: ['pz.2'], t: 'Es el caño 2: tiene dos agujeros y de él salen los dos travesaños.' }, { m: ['pz.1', 'pz.3'], t: 'Son los caños 1 y 3: cada uno tiene un agujero, a distinta altura.' }, { m: ['pz.4'], t: 'Son los 2 travesaños: unen los caños abajo.' }],
      cuenta: { fijo: '6 piezas · 4 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 }, piezas: ordenPiezas(), resaltar: ['pz.2'], mueven: [mover('pz.2', 80)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 4 tornillos A, 3 tornillos B, 3 regatones C y la llave Allen D.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'Los tornillos A, chiquitos y con cruz, van con un destornillador Phillips: no viene en la caja.' },
      usa: ['D · Llave Allen incluida', 'Destornillador Phillips (no incluido)'], check: [[4, 'A · Tornillos'], [3, 'B · Tornillos Allen'], [3, 'C · Regatones'], [1, 'D · Llave Allen']],
      cuenta: { fijo: '10 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajes([{ letra: 'A', n: 4, tipo: 'tornillo' }, { letra: 'B', n: 3, tipo: 'allen' }, { letra: 'C', n: 3, tipo: 'regaton' }]), resaltar: ['llave'], mueven: [mover('llave', 90)],
    },
    paso(1, 'regatones', 'Un regatón en cada caño', ['Enroscá un regatón C en una punta de los caños 1, 2 y 3.'], [manta(), ...M.patas()], {
      usa: ['1, 2 y 3 · Caños', 'C · Regatones ×3'], hw: { C: 3 }, titular: 'En la punta más cerca de los agujeros', resaltar: ['g.reg'], unir: ['g.cano'],
      subs: { a: ['Enroscá un regatón C en una punta de los caños 1, 2 y 3.'], b: [], tip: 'El regatón va en la punta más cerca de los agujeros. El manual de papel dice "caños A, B y C": son los caños 1, 2 y 3.' },
      mueven: [mover('g.reg', 50, [0, 0, -1], 0)], vista: { yaw: -24, pitch: 26 },
    }),
    paso(2, 'trav-2', 'Un travesaño al caño 2', ['Uní un travesaño 4 al agujero de arriba del caño 2.'], [manta(), M.reg(2), M.pata(2), M.travesano(3), ...M.tornA(3, 'centro')], {
      usa: ['2 · Caño', '4 · Travesaño', 'A · Tornillo', 'Destornillador Phillips'], hw: { A: 1 }, titular: 'El agujero de 19 cm', resaltar: ['g.trav.3', 'g.A.3.centro'], unir: ['g.cano.2'],
      subs: { a: ['Uní un travesaño 4 al agujero de arriba del caño 2.'], b: ['Fijalo con un tornillo A y el destornillador.'], tip: '' },
      mueven: [mover('g.trav.3', 120, [0, 0, 1], 0), mover('g.A.3.centro', 40, [...M.dir(3).map((n) => -n), 0], .5)],
      fases: { pieza: ['g.trav.3'], hw: M.idsA(3, 'centro'), retener: ['g.A.3.centro'], ocultarEnA: M.idsA(3, 'centro'), ref: 'g.A.3.centro', vistaB: { yaw: 70, pitch: 14 }, titularB: 'Un tornillo A', herramienta: herramientaA(3, 'centro') },
      vista: { yaw: 40, pitch: 22 },
    }),
    paso(3, 'trav-1', 'El otro travesaño al caño 1', ['Uní el otro travesaño 4 al caño 1.'], [manta(), M.reg(2), M.pata(2), M.travesano(3), ...M.tornA(3, 'centro'), M.reg(1), M.pata(1), M.travesano(1), ...M.tornA(1, 'lejos')], {
      usa: ['1 · Caño', '4 · Travesaño', 'A · Tornillo'], hw: { A: 1 }, titular: 'El agujero de 11 cm', resaltar: ['g.trav.1', 'g.A.1.lejos'], unir: ['g.cano.1'],
      subs: { a: ['Uní el otro travesaño 4 al caño 1.'], b: ['Fijalo con un tornillo A.'], tip: 'Todavía son dos partes sueltas: en el paso 4 se juntan.' },
      mueven: [mover(['g.reg.1', 'g.cano.1', 'g.trav.1', 'g.A.1.lejos'], 160, [1, 0, 0], 0)],
      fases: { pieza: ['g.trav.1'], hw: M.idsA(1, 'lejos'), retener: ['g.A.1.lejos'], ocultarEnA: M.idsA(1, 'lejos'), ref: 'g.A.1.lejos', vistaB: { yaw: -50, pitch: 14 }, titularB: 'Un tornillo A', herramienta: herramientaA(1, 'lejos') },
      vista: { yaw: -30, pitch: 22 },
    }),
    paso(4, 'unir', 'Uní todo con el caño 3', [
      'Uní la punta libre del travesaño del caño 1 al agujero de abajo del caño 2.',
      'Y la punta libre del otro travesaño, al caño 3.',
    ], [manta(), ...M.estructura()], {
      subs: { a: ['Uní la punta libre del travesaño del caño 1 al agujero de abajo del caño 2.', 'Y la punta libre del otro travesaño, al caño 3.'], b: ['Fijá cada unión con un tornillo A y el destornillador.'], tip: '' },
      usa: ['3 · Caño', 'A · Tornillos ×2'], hw: { A: 2 }, titular: 'Dos tornillos A más', resaltar: ['g.cano.3', 'g.reg.3', 'g.A.1.centro', 'g.A.3.lejos'], unir: ['g.trav.1', 'g.trav.3'],
      mueven: [mover(['g.cano.3', 'g.reg.3'], 160, [...M.dir(3), 0], 0)],
      fases: { pieza: ['g.cano.3', 'g.reg.3'], hw: IDS_A([[1, 'centro'], [3, 'lejos']]), retener: [], ocultarEnA: IDS_A([[1, 'centro'], [3, 'lejos']]), ref: 'g.A.3.lejos', vistaB: { yaw: -100, pitch: 14 }, titularB: 'Un tornillo en cada punta', herramienta: herramientaA(3, 'lejos') },
      vista: { yaw: -24, pitch: 24 },
    }),
    paso(5, 'chapa', 'La chapa', ['Apoyá la chapa 5 alineando sus agujeros con los de los tres caños.'], [manta(), ...M.estructura(), M.chapa()], {
      usa: ['5 · Chapa'], titular: 'La punta angosta, sobre el caño 2', resaltar: ['g.chapa'], unir: ['g.cano'],
      mueven: [mover('g.chapa', 150, [0, 0, 1], 0)],
    }),
    paso(6, 'tornillos', 'Los tornillos B', ['Poné un tornillo B en cada agujero de la chapa.'], [manta(), ...M.completa()], {
      usa: ['B · Tornillos Allen ×3', 'D · Llave Allen'], hw: { B: 3 }, titular: 'Con la llave Allen', resaltar: ['g.B'], unir: ['g.chapa'],
      subs: { a: ['Poné un tornillo B en cada agujero de la chapa.'], b: ['Ajustalos con la llave Allen hasta que la mesa quede firme.'], tip: '' },
      mueven: [mover('g.B', 70, [0, 0, 1], 0)],
      fases: { pieza: ['g.B.1.cabeza'], hw: M.idsB(), retener: ['g.B'], ocultarEnA: M.idsB(), ref: 'g.B.1', vistaB: { yaw: -24, pitch: 56 }, titularB: 'Un tornillo en cada caño', herramienta: { tipo: 'allen', pos: [...M.P[1], 343] } },
    }),
    paso(7, 'revisar', 'Revisá que esté firme', ['Repasá los 7 tornillos.', 'Si la mesa se mueve, ajustá un poco más.'], [manta(), ...M.completa()], {
      usa: ['D · Llave Allen', 'Destornillador Phillips'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['g.A', 'g.B'], vista: { yaw: -34, pitch: 20 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -22, pitch: 20 }, piezas: M.completa(), mueven: [] },
  ],
};
