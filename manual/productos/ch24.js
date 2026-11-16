// CH24 · Set de mesas ratonas: la mesa gota (igual a la CH22) + una mesa circular Ø49 × 44, las dos de 3 patas con
// 2 travesaños. ESTIMADO: no hay manual de fábrica en el Drive; sale de la foto y de las dos fichas de medidas.
// Ver estudio/estimados-notas.md.
import { manta, mover, herrajes, paso as P_, textos, marca, MATS, gota, circulo, cil, perfil } from './_estimado.js?v=0c6ddde886';
import { mesa3 } from './_tres_patas.js?v=0c6ddde886';

const GOTA = gota(880, 570), CIRC = circulo(245);
const ANG = (a) => [205 * Math.cos(a * Math.PI / 180), 205 * Math.sin(a * Math.PI / 180)];
const G = mesa3({ pre: 'g', contorno: GOTA, patas: { a: [300, 165], b: [170, -195], c: [-350, 0] }, hub: 'c', alto: 340, zBarra: 70, off: [150, 70] });
const C = mesa3({ pre: 'c', contorno: CIRC, patas: { a: ANG(90), b: ANG(210), c: ANG(330) }, hub: 'a', alto: 440, zBarra: 90, off: [-360, -150] });
const NA = 6, paso = P_(NA, { yaw: -24, pitch: 22 });
const set = () => [...G.completa(), ...C.completa()];

const acostado = (id, x, y, largo, r) => cil(id, [x, y, r], largo, r, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1400, 980),
  perfil('pz.1', GOTA.map(([x, y]) => [x * .6 - 330, y * .6 + 220]), 0, 2.5),
  perfil('pz.2', CIRC.map(([x, y]) => [x * .7 + 330, y * .7 + 230]), 0, 2.5),
  { id: 'rotulo.1', tipo: 'texto', txt: '1 · TAPA GOTA', pos: [-330, 420, .3], alto: 26 },
  { id: 'rotulo.2', tipo: 'texto', txt: '2 · TAPA REDONDA', pos: [330, 420, .3], alto: 26 },
  ...[0, 1, 2].map((i) => acostado('pz.3.' + i, -600, -40 - i * 45, 325, 11)),
  { id: 'rotulo.3', tipo: 'texto', txt: '3 · PATAS BAJAS ×3', pos: [-440, -200, .3], alto: 22 },
  ...[0, 1, 2].map((i) => acostado('pz.4.' + i, 60, -40 - i * 45, 425, 11)),
  { id: 'rotulo.4', tipo: 'texto', txt: '4 · PATAS ALTAS ×3', pos: [270, -200, .3], alto: 22 },
  ...[0, 1, 2, 3].map((i) => acostado('pz.5.' + i, -400, -260 - i * 30, 520, 6)),
  { id: 'rotulo.5', tipo: 'texto', txt: '5 · TRAVESAÑOS ×4', pos: [-140, -400, .3], alto: 22 },
];
const fasesBarras = (M, ref) => ({
  pieza: [`${M === G ? 'g' : 'c'}.barra`], hw: M.idsB(), retener: [`${M === G ? 'g' : 'c'}.B`], ocultarEnA: M.idsB(),
  ref, vistaB: { yaw: -40, pitch: 14 }, titularB: 'Un tornillo en cada punta',
  herramienta: { tipo: 'allen', pos: (() => { const k = M.lejos[0], [dx, dy] = M.dir(k); return [M.P[k][0] + dx * 14, M.P[k][1] + dy * 14, M === G ? 70 : 90]; })(), eje: [...M.dir(M.lejos[0]), 0] },
});
const fasesTapa = (M, pre, alto) => ({
  pieza: [`${pre}.tapa`], hw: M.idsA(), retener: [`${pre}.A`], ocultarEnA: M.idsA(),
  ref: `${pre}.A.${M.lejos[0]}`, vistaB: { yaw: -24, pitch: 56 }, titularB: 'Un tornillo en cada pata',
  herramienta: { tipo: 'allen', pos: [...M.P[M.lejos[0]], alto + 3] },
});
const B_TXT = ['Atornillá cada punta con un tornillo B desde afuera de la pata.', 'Ajustalos con la llave Allen, sin forzar.'];
const A_TXT = ['Poné un tornillo Allen A en cada agujero.', 'Ajustalos con la llave hasta que la mesa quede firme.'];

export default {
  id: 'ch24', version: 1, pasosManual: NA, estimado: true,
  marca: marca('https://dege.com.ar/productos/set-de-mesas-ratonas-cwhvi/', ['#2e2e2e', '#ffffff', '#e9e4d6', '#c9ced3']),
  materiales: MATS('#2f2f2f'),
  inventario: [{ id: 'C', n: 6, label: 'C · Regatones' }, { id: 'B', n: 8, label: 'B · Tornillos de travesaños' }, { id: 'A', n: 6, label: 'A · Tornillos Allen' }],
  textos: textos({
    nombre: 'Set de mesas ratonas', codigo: 'CH24', cabecera: 'Set de mesas ratonas CH24', sust: 'set', art: 'el',
    ladoCuerpo: 'Dos mesas que se encastran: la gota de 34 cm de alto y la redonda de 44. Seguí los pasos y girá el modelo para ver cada unión.',
    datos: [['layers', '12 piezas', '+ 20 herrajes'], ['steps', `${NA} pasos`, 'llave Allen incluida'], ['box', '88 × 57 · Ø49', 'cm · gota y redonda']],
    momTitulo: 'Tus dos mesas,<br><em>una por una</em>', momCuerpo: 'Primero la gota y después la redonda: se arman igual. Separá las patas bajas de las altas antes de empezar.',
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
      subs: { a: ['Sacá todo de la caja: 2 tapas, 3 patas bajas, 3 altas y 4 travesaños.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'Las patas bajas son para la gota; las altas, para la redonda.' },
      usa: ['1 · Tapa gota', '2 · Tapa redonda', '3 · Patas bajas ×3', '4 · Patas altas ×3', '5 · Travesaños ×4'],
      elegir: [{ m: ['pz.1'], t: 'Es la tapa de la mesa gota.' }, { m: ['pz.2'], t: 'Es la tapa de la mesa redonda.' }, { m: ['pz.3'], t: 'Las 3 patas bajas: van en la gota.' }, { m: ['pz.4'], t: 'Las 3 patas altas: van en la redonda.' }, { m: ['pz.5'], t: 'Los 4 travesaños: 2 por mesa.' }],
      cuenta: { fijo: '12 piezas · 5 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 }, piezas: ordenPiezas(), resaltar: ['pz.1'], mueven: [mover('pz.1', 80)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 6 tornillos Allen, 8 tornillos de travesaños, 6 regatones y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: '' },
      usa: ['Llave Allen incluida'], check: [[6, 'A · Tornillos Allen'], [8, 'B · Tornillos de travesaños'], [6, 'C · Regatones'], [1, 'Llave Allen']],
      cuenta: { fijo: '20 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajes([{ letra: 'A', n: 6, tipo: 'allen' }, { letra: 'B', n: 8, tipo: 'tornillo' }, { letra: 'C', n: 6, tipo: 'regaton' }]), resaltar: ['llave'], mueven: [mover('llave', 90)],
    },
    paso(1, 'regatones', 'Un regatón en cada pata', ['Enroscá un regatón C en una punta de cada una de las 6 patas.'], [manta(1300, 900), ...G.regatones(), ...G.patas(), ...C.regatones(), ...C.patas()], {
      usa: ['3 · Patas bajas ×3', '4 · Patas altas ×3', 'C · Regatones ×6'], hw: { C: 6 }, titular: 'Hasta el tope', resaltar: ['g.reg', 'c.reg'], unir: ['g.pata', 'c.pata'],
      mueven: [mover(['g.reg', 'c.reg'], 50, [0, 0, -1], 0)],
    }),
    paso(2, 'gota-barras', 'Gota: los travesaños', ['Uní las 3 patas bajas con 2 travesaños que salen de la misma pata.'], [manta(1300, 900), ...G.regatones(), ...G.patas(), ...G.barras(), ...G.tornB()], {
      usa: ['5 · Travesaños ×2', 'B · Tornillos ×4', 'Llave Allen'], hw: { B: 4 }, titular: 'Los dos salen de la misma pata', resaltar: ['g.barra', 'g.B'], unir: ['g.pata'],
      subs: { a: ['Uní las 3 patas bajas con 2 travesaños que salen de la misma pata.'], b: B_TXT, tip: 'A confirmar con fábrica: la forma exacta de la unión del travesaño.' },
      mueven: [mover('g.barra', 90, [0, 0, 1], 0), mover('g.B', 40, [0, 0, 1], .5)], fases: fasesBarras(G, `g.B.${G.lejos[0]}.lejos`),
    }),
    paso(3, 'gota-tapa', 'Gota: la tapa', ['Apoyá la tapa gota con cada agujero sobre una pata.'], [manta(1300, 900), ...G.completa()], {
      usa: ['1 · Tapa gota', 'A · Tornillos Allen ×3'], hw: { A: 3 }, titular: 'La punta angosta, sobre la pata de los travesaños', resaltar: ['g.tapa', 'g.A'], unir: ['g.pata'],
      subs: { a: ['Apoyá la tapa gota con cada agujero sobre una pata.'], b: A_TXT, tip: '' },
      mueven: [mover('g.tapa', 150, [0, 0, 1], 0), mover('g.A', 70, [0, 0, 1], .6)], fases: fasesTapa(G, 'g', 340),
    }),
    paso(4, 'redonda-barras', 'Redonda: los travesaños', ['Uní las 3 patas altas con los otros 2 travesaños, igual que en la gota.'], [manta(1300, 900), ...G.completa(), ...C.regatones(), ...C.patas(), ...C.barras(), ...C.tornB()], {
      usa: ['5 · Travesaños ×2', 'B · Tornillos ×4'], hw: { B: 4 }, titular: 'Igual que en la gota', resaltar: ['c.barra', 'c.B'], unir: ['c.pata'],
      subs: { a: ['Uní las 3 patas altas con los otros 2 travesaños, igual que en la gota.'], b: B_TXT, tip: '' },
      mueven: [mover('c.barra', 90, [0, 0, 1], 0), mover('c.B', 40, [0, 0, 1], .5)], fases: fasesBarras(C, `c.B.${C.lejos[0]}.lejos`),
    }),
    paso(5, 'redonda-tapa', 'Redonda: la tapa', ['Apoyá la tapa redonda con cada agujero sobre una pata.'], [manta(1300, 900), ...set()], {
      usa: ['2 · Tapa redonda', 'A · Tornillos Allen ×3'], hw: { A: 3 }, titular: 'Un tornillo en cada pata', resaltar: ['c.tapa', 'c.A'], unir: ['c.pata'],
      subs: { a: ['Apoyá la tapa redonda con cada agujero sobre una pata.'], b: A_TXT, tip: '' },
      mueven: [mover('c.tapa', 150, [0, 0, 1], 0), mover('c.A', 70, [0, 0, 1], .6)], fases: fasesTapa(C, 'c', 440),
    }),
    paso(6, 'revisar', 'Revisá que estén firmes', ['Repasá los 14 tornillos con la llave.', 'Si alguna mesa se mueve, ajustá un poco más.'], [manta(1300, 900), ...set()], {
      usa: ['Llave Allen'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['g.A', 'g.B', 'c.A', 'c.B'], vista: { yaw: -34, pitch: 20 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -24, pitch: 20 }, piezas: set(), mueven: [] },
  ],
};
