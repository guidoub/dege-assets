import { manta, mover, herrajes, paso as P_, textos, marca, MATS, gota, circulo, cil, perfil } from './_estimado.js?v=40bdf307a1';
import { mesa3 } from './_tres_patas.js?v=40bdf307a1';

const GOTA = gota(880, 570), CIRC = circulo(245);
const ANG = (a) => [205 * Math.cos(a * Math.PI / 180), 205 * Math.sin(a * Math.PI / 180)];
const G = mesa3({ pre: 'g', contorno: GOTA, patas: { 1: [300, 165], 2: [-350, 0], 3: [170, -195] }, alto: 340, off: [150, 70] });
const C = mesa3({ pre: 'c', contorno: CIRC, patas: { 1: ANG(210), 2: ANG(90), 3: ANG(330) }, alto: 440, off: [-360, -150] });
const NA = 8, paso = P_(NA, { yaw: -24, pitch: 22 });
const set = () => [...G.completa(), ...C.completa()];
const herrA = (M, k, punta) => { const [dx, dy] = M.dir(k), b = punta === 'lejos' ? M.P[k] : M.P[2], s = punta === 'lejos' ? 1 : -1;
  return { tipo: 'phillips', pos: [b[0] + s * dx * 14, b[1] + s * dy * 14, M.z(k)], eje: [s * dx, s * dy, 0] }; };

const acostado = (id, x, y, largo, r) => cil(id, [x, y, r], largo, r, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1400, 980),
  perfil('pz.g5', GOTA.map(([x, y]) => [x * .6 - 330, y * .6 + 220]), 0, 2.5),
  perfil('pz.c5', CIRC.map(([x, y]) => [x * .7 + 330, y * .7 + 230]), 0, 2.5),
  { id: 'rotulo.g5', tipo: 'texto', txt: '5 · CHAPA GOTA', pos: [-330, 420, .3], alto: 26 },
  { id: 'rotulo.c5', tipo: 'texto', txt: '5 · CHAPA REDONDA', pos: [330, 420, .3], alto: 26 },
  ...[0, 1, 2].map((i) => acostado('pz.g.' + i, -600, -40 - i * 45, 325, 11)),
  { id: 'rotulo.g', tipo: 'texto', txt: '1, 2, 3 · CAÑOS BAJOS', pos: [-440, -200, .3], alto: 22 },
  ...[0, 1, 2].map((i) => acostado('pz.c.' + i, 60, -40 - i * 45, 425, 11)),
  { id: 'rotulo.c', tipo: 'texto', txt: '1, 2, 3 · CAÑOS ALTOS', pos: [270, -200, .3], alto: 22 },
  ...[0, 1, 2, 3].map((i) => acostado('pz.4.' + i, -400, -260 - i * 30, 520, 6)),
  { id: 'rotulo.4', tipo: 'texto', txt: '4 · TRAVESAÑOS ×4', pos: [-140, -400, .3], alto: 22 },
];
const ids = (M, pares) => pares.flatMap(([k, p]) => M.idsA(k, p));
const fasesChapa = (M, pre, alto) => ({
  pieza: [`${pre}.chapa`], hw: M.idsB(), retener: [`${pre}.B`], ocultarEnA: M.idsB(),
  ref: `${pre}.B.1`, vistaB: { yaw: -24, pitch: 56 }, titularB: 'Un tornillo B en cada caño',
  herramienta: { tipo: 'allen', pos: [...M.P[1], alto + 3] },
});
const B_TXT = ['Poné un tornillo B en cada agujero de la chapa.', 'Ajustalos con la llave Allen hasta que la mesa quede firme.'];

export default {
  id: 'ch24', version: 2, pasosManual: NA,
  marca: marca('https://dege.com.ar/productos/set-de-mesas-ratonas-cwhvi/', ['#2e2e2e', '#ffffff', '#e9e4d6', '#c9ced3']),
  materiales: MATS('#2f2f2f'),
  inventario: [{ id: 'C', n: 6, label: 'C · Regatones' }, { id: 'A', n: 8, label: 'A · Tornillos (Phillips)' }, { id: 'B', n: 6, label: 'B · Tornillos Allen' }],
  herramientas: [{ id: 'D', n: 1, label: 'D · Llave Allen', incluida: true }, { id: 'phillips', n: 1, label: 'Destornillador Phillips', incluida: false }],
  textos: textos({
    nombre: 'Set de mesas ratonas', codigo: 'CH24', cabecera: 'Set de mesas ratonas CH24', sust: 'set', art: 'el',
    ladoCuerpo: 'Dos mesas que se encastran: la gota (CH22) de 34 cm de alto y la redonda (CH23) de 44. Se arman igual: seguí los pasos y girá el modelo.',
    datos: [['layers', '12 piezas', '+ 20 herrajes'], ['steps', `${NA} pasos`, 'llave Allen incluida'], ['box', '88 × 57 · Ø49', 'cm · gota y redonda']],
    momTitulo: 'Tus dos mesas,<br><em>una por una</em>', momCuerpo: 'Primero la gota y después la redonda: se arman igual. Separá los caños bajos de los altos y tené a mano un destornillador Phillips.',
    finCuerpo: 'La redonda, más alta, se mete por arriba de la gota: juntas o separadas, como te quede mejor.',
  }),
  cotas: { w: 88, d: 57, h: 44, unidad: 'cm', llenar: .62, caja: [-605, 590, -395, 355, 0, 443], lineas: [
    [[590, 355, 0], [-150 - 440 + 300, 355, 0], [0, 70, 0], 88],
    [[-605, -150, 0], [-605, -150, 440], [-70, 0, 0], 44],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -24, pitch: 24 }, piezas: set(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: 2 chapas, 3 caños bajos, 3 altos y 4 travesaños.', 'Los caños bajos son de la gota; los altos, de la redonda.'], b: [], tip: 'En cada mesa, el caño 2 tiene dos agujeros; el 1 tiene uno a 11 cm de la punta y el 3, uno a 19 cm.' },
      usa: ['5 · Chapa gota', '5 · Chapa redonda', '1, 2, 3 · Caños bajos', '1, 2, 3 · Caños altos', '4 · Travesaños ×4'],
      elegir: [{ m: ['pz.g5'], t: 'Es la chapa de la mesa gota.' }, { m: ['pz.c5'], t: 'Es la chapa de la mesa redonda.' }, { m: ['pz.g'], t: 'Los 3 caños bajos: van en la gota.' }, { m: ['pz.c'], t: 'Los 3 caños altos: van en la redonda.' }, { m: ['pz.4'], t: 'Los 4 travesaños: 2 por mesa.' }],
      cuenta: { fijo: '12 piezas · 5 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 }, piezas: ordenPiezas(), resaltar: ['pz.g5'], mueven: [mover('pz.g5', 80)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 8 tornillos A, 6 tornillos B, 6 regatones C y la llave Allen D.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'Los tornillos A, chiquitos y con cruz, van con un destornillador Phillips: no viene en la caja.' },
      usa: ['D · Llave Allen incluida', 'Destornillador Phillips (no incluido)'], check: [[8, 'A · Tornillos'], [6, 'B · Tornillos Allen'], [6, 'C · Regatones'], [1, 'D · Llave Allen']],
      cuenta: { fijo: '20 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajes([{ letra: 'A', n: 8, tipo: 'tornillo' }, { letra: 'B', n: 6, tipo: 'allen' }, { letra: 'C', n: 6, tipo: 'regaton' }]), resaltar: ['llave'], mueven: [mover('llave', 90)],
    },
    paso(1, 'regatones', 'Un regatón en cada caño', ['Enroscá un regatón C en una punta de los 6 caños.'], [manta(1300, 900), ...G.patas(), ...C.patas()], {
      usa: ['Caños ×6', 'C · Regatones ×6'], hw: { C: 6 }, titular: 'En la punta más cerca de los agujeros', resaltar: ['g.reg', 'c.reg'], unir: ['g.cano', 'c.cano'],
      mueven: [mover(['g.reg', 'c.reg'], 50, [0, 0, -1], 0)],
    }),
    paso(2, 'gota-2', 'Gota: un travesaño al caño 2', ['Uní un travesaño 4 al agujero de arriba del caño 2 bajo.'], [manta(1300, 900), G.reg(2), G.pata(2), G.travesano(3), ...G.tornA(3, 'centro'), ...C.patas()], {
      usa: ['2 · Caño bajo', '4 · Travesaño', 'A · Tornillo', 'Destornillador Phillips'], hw: { A: 1 }, titular: 'El agujero de 19 cm', resaltar: ['g.trav.3', 'g.A.3.centro'], unir: ['g.cano.2'],
      subs: { a: ['Uní un travesaño 4 al agujero de arriba del caño 2 bajo.'], b: ['Fijalo con un tornillo A y el destornillador.'], tip: '' },
      mueven: [mover('g.trav.3', 120, [0, 0, 1], 0)],
      fases: { pieza: ['g.trav.3'], hw: G.idsA(3, 'centro'), retener: [], ocultarEnA: G.idsA(3, 'centro'), ref: 'g.A.3.centro', vistaB: { yaw: 70, pitch: 14 }, titularB: 'Un tornillo A', herramienta: herrA(G, 3, 'centro') },
    }),
    paso(3, 'gota-1', 'Gota: el otro travesaño al caño 1', ['Uní el otro travesaño 4 al caño 1.'], [manta(1300, 900), G.reg(2), G.pata(2), G.travesano(3), ...G.tornA(3, 'centro'), G.reg(1), G.pata(1), G.travesano(1), ...G.tornA(1, 'lejos'), ...C.patas()], {
      subs: { a: ['Uní el otro travesaño 4 al caño 1.'], b: ['Fijalo con un tornillo A.'], tip: 'Todavía son dos partes sueltas: en el paso 4 se juntan.' },
      usa: ['1 · Caño bajo', '4 · Travesaño', 'A · Tornillo'], hw: { A: 1 }, titular: 'El agujero de 11 cm', resaltar: ['g.trav.1', 'g.A.1.lejos'], unir: ['g.cano.1'],
      mueven: [mover(['g.reg.1', 'g.cano.1', 'g.trav.1', 'g.A.1.lejos'], 160, [1, 0, 0], 0)],
      fases: { pieza: ['g.trav.1'], hw: G.idsA(1, 'lejos'), retener: [], ocultarEnA: G.idsA(1, 'lejos'), ref: 'g.A.1.lejos', vistaB: { yaw: -50, pitch: 14 }, titularB: 'Un tornillo A', herramienta: herrA(G, 1, 'lejos') },
    }),
    paso(4, 'gota-3', 'Gota: uní todo con el caño 3', ['Uní las puntas libres de los travesaños: una al caño 2 y la otra al caño 3.'], [manta(1300, 900), ...G.estructura(), ...C.patas()], {
      subs: { a: ['Uní las puntas libres de los travesaños: una al caño 2 y la otra al caño 3.'], b: ['Fijá cada unión con un tornillo A y el destornillador.'], tip: '' },
      usa: ['3 · Caño bajo', 'A · Tornillos ×2'], hw: { A: 2 }, titular: 'Dos tornillos A más', resaltar: ['g.cano.3', 'g.reg.3', 'g.A.1.centro', 'g.A.3.lejos'], unir: ['g.trav'],
      mueven: [mover(['g.cano.3', 'g.reg.3'], 160, [...G.dir(3), 0], 0)],
      fases: { pieza: ['g.cano.3', 'g.reg.3'], hw: ids(G, [[1, 'centro'], [3, 'lejos']]), retener: [], ocultarEnA: ids(G, [[1, 'centro'], [3, 'lejos']]), ref: 'g.A.3.lejos', vistaB: { yaw: -100, pitch: 14 }, titularB: 'Un tornillo en cada punta', herramienta: herrA(G, 3, 'lejos') },
    }),
    paso(5, 'gota-chapa', 'Gota: la chapa', ['Apoyá la chapa gota alineando sus agujeros con los de los caños.'], [manta(1300, 900), ...G.completa(), ...C.patas()], {
      usa: ['5 · Chapa gota', 'B · Tornillos Allen ×3', 'D · Llave Allen'], hw: { B: 3 }, titular: 'La punta angosta, sobre el caño 2', resaltar: ['g.chapa', 'g.B'], unir: ['g.cano'],
      subs: { a: ['Apoyá la chapa gota alineando sus agujeros con los de los caños.'], b: B_TXT, tip: '' },
      mueven: [mover('g.chapa', 150, [0, 0, 1], 0), mover('g.B', 70, [0, 0, 1], .6)], fases: fasesChapa(G, 'g', 340),
    }),
    paso(6, 'redonda-trav', 'Redonda: los travesaños', ['Igual que en la gota: un travesaño al caño 2, el otro al caño 1, y uní todo con el caño 3.'], [manta(1300, 900), ...G.completa(), ...C.estructura()], {
      usa: ['1, 2, 3 · Caños altos', '4 · Travesaños ×2', 'A · Tornillos ×4'], hw: { A: 4 }, titular: 'Igual que en la gota', resaltar: ['c.trav', 'c.A'], unir: ['c.cano'],
      subs: { a: ['Igual que en la gota: un travesaño al caño 2, el otro al caño 1, y uní todo con el caño 3.'], b: ['Cuatro tornillos A en total.'], tip: 'Es el manual de la mesa redonda CH23: los pasos 2 a 4 son los mismos que en la gota.' },
      mueven: [mover('c.trav', 120, [0, 0, 1], 0)],
      fases: { pieza: ['c.trav'], hw: ids(C, [[1, 'lejos'], [1, 'centro'], [3, 'lejos'], [3, 'centro']]), retener: [], ocultarEnA: ids(C, [[1, 'lejos'], [1, 'centro'], [3, 'lejos'], [3, 'centro']]), ref: 'c.A.3.lejos', vistaB: { yaw: -60, pitch: 14 }, titularB: 'Un tornillo A en cada punta', herramienta: herrA(C, 3, 'lejos') },
    }),
    paso(7, 'redonda-chapa', 'Redonda: la chapa', ['Apoyá la chapa redonda alineando sus agujeros con los de los caños.'], [manta(1300, 900), ...set()], {
      usa: ['5 · Chapa redonda', 'B · Tornillos Allen ×3'], hw: { B: 3 }, titular: 'Un tornillo B en cada caño', resaltar: ['c.chapa', 'c.B'], unir: ['c.cano'],
      subs: { a: ['Apoyá la chapa redonda alineando sus agujeros con los de los caños.'], b: B_TXT, tip: '' },
      mueven: [mover('c.chapa', 150, [0, 0, 1], 0), mover('c.B', 70, [0, 0, 1], .6)], fases: fasesChapa(C, 'c', 440),
    }),
    paso(8, 'revisar', 'Revisá que estén firmes', ['Repasá los 14 tornillos.', 'Si alguna mesa se mueve, ajustá un poco más.'], [manta(1300, 900), ...set()], {
      usa: ['D · Llave Allen', 'Destornillador Phillips'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['g.A', 'g.B', 'c.A', 'c.B'], vista: { yaw: -34, pitch: 20 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -24, pitch: 20 }, piezas: set(), mueven: [] },
  ],
};
