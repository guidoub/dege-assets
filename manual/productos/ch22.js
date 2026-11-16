// CH22 · Mesa ratona gota. ESTIMADO: no hay manual de fábrica en el Drive. Sale de la foto de portada y del plano de la
// ficha (88 × 57 × 34 cm, 3 patas, 2 travesaños). Pasos y herrajes, a confirmar: ver estudio/estimados-notas.md.
import { manta, mover, herrajes, paso as P_, textos, marca, MATS, gota, cil, perfil } from './_estimado.js?v=0c6ddde886';
import { mesa3 } from './_tres_patas.js?v=0c6ddde886';

const TAPA = gota(880, 570);
// dos patas del lado ancho (+X: adelante y atrás) y una en la punta angosta, de la que salen los dos travesaños
const M = mesa3({ pre: 'g', contorno: TAPA, patas: { a: [300, 165], b: [170, -195], c: [-350, 0] }, hub: 'c', alto: 340, zBarra: 70 });
const NA = 4, paso = P_(NA, { yaw: -24, pitch: 22 });

const acostado = (id, x, y, largo, r) => cil(id, [x, y, r], largo, r, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1250, 900),
  { ...perfil('pz.1', TAPA.map(([x, y]) => [x * .7 - 150, y * .7 + 170]), 0, 2.5) },
  { id: 'rotulo.1', tipo: 'texto', txt: '1 · TAPA', pos: [-150, 380, .3], alto: 30 },
  ...[0, 1, 2].map((i) => acostado('pz.2.' + i, 220, -120 + i * 50, 325, 11)),
  { id: 'rotulo.2', tipo: 'texto', txt: '2 · PATAS ×3', pos: [380, -210, .3], alto: 26 },
  ...[0, 1].map((i) => acostado('pz.3.' + i, -480, -150 + i * 40, 560, 6)),
  { id: 'rotulo.3', tipo: 'texto', txt: '3 · TRAVESAÑOS ×2', pos: [-200, -230, .3], alto: 26 },
];

export default {
  id: 'ch22', version: 1, pasosManual: NA, estimado: true,
  marca: marca('https://dege.com.ar/productos/mesa-ratona-gota-b20g3/', ['#3a3a3a', '#ffffff', '#e9e4d6', '#c9ced3']),
  materiales: MATS('#3d3d3d'),
  inventario: [{ id: 'C', n: 3, label: 'C · Regatones' }, { id: 'B', n: 4, label: 'B · Tornillos de travesaños' }, { id: 'A', n: 3, label: 'A · Tornillos Allen' }],
  textos: textos({
    nombre: 'Mesa ratona gota', codigo: 'CH22', cabecera: 'Mesa ratona gota CH22', sust: 'mesa', art: 'la',
    ladoCuerpo: 'Una tapa en forma de gota, tres patas y dos travesaños. Seguí los pasos y girá el modelo para ver cada unión.',
    datos: [['layers', '6 piezas', '+ 10 herrajes'], ['steps', `${NA} pasos`, 'llave Allen incluida'], ['box', '88 × 57 × 34', 'cm · largo, fondo y alto']],
    momTitulo: 'Tu mesa,<br><em>en 15 minutos</em>', momCuerpo: 'Tres patas, dos travesaños y la tapa. La llave Allen viene en la caja.',
    finCuerpo: 'La curva ancha va hacia el sillón y la punta angosta deja pasar.',
  }),
  cotas: { w: 88, d: 57, h: 34, unidad: 'cm', llenar: .66, caja: [-440, 440, -285, 285, 0, 343], lineas: [
    [[440, 285, 0], [-440, 285, 0], [0, 70, 0], 88],
    [[440, 285, 0], [440, -285, 0], [80, 0, 0], 57],
    [[...M.P.c, 0], [...M.P.c, 340], [-130, 0, 0], 34],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -22, pitch: 24 }, piezas: M.completa(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: la tapa, 3 patas y 2 travesaños.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'Los travesaños son los caños finitos y largos.' },
      usa: ['1 · Tapa', '2 · Patas ×3', '3 · Travesaños ×2'],
      elegir: [{ m: ['pz.1'], t: 'Es la tapa en forma de gota, con un agujero para cada pata.' }, { m: ['pz.2'], t: 'Son las 3 patas.' }, { m: ['pz.3'], t: 'Son los 2 travesaños: unen las patas abajo.' }],
      cuenta: { fijo: '6 piezas · 3 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 }, piezas: ordenPiezas(), resaltar: ['pz.1'], mueven: [mover('pz.1', 80)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 3 tornillos Allen, 4 tornillos de travesaños, 3 regatones y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: '' },
      usa: ['Llave Allen incluida'], check: [[3, 'A · Tornillos Allen'], [4, 'B · Tornillos de travesaños'], [3, 'C · Regatones'], [1, 'Llave Allen']],
      cuenta: { fijo: '10 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajes([{ letra: 'A', n: 3, tipo: 'allen' }, { letra: 'B', n: 4, tipo: 'tornillo' }, { letra: 'C', n: 3, tipo: 'regaton' }]), resaltar: ['llave'], mueven: [mover('llave', 90)],
    },
    paso(1, 'regatones', 'Un regatón en cada pata', ['Enroscá un regatón C en una punta de cada pata.'], [manta(), ...M.regatones(), ...M.patas()], {
      usa: ['2 · Patas ×3', 'C · Regatones ×3'], hw: { C: 3 }, titular: 'Hasta el tope', resaltar: ['g.reg'], unir: ['g.pata'],
      mueven: [mover('g.reg', 50, [0, 0, -1], 0)], vista: { yaw: -24, pitch: 26 },
    }),
    paso(2, 'travesanos', 'Los travesaños', [
      'Apoyá los dos travesaños entre la pata de la punta y las otras dos.',
    ], [manta(), ...M.regatones(), ...M.patas(), ...M.barras(), ...M.tornB()], {
      usa: ['3 · Travesaños ×2', 'B · Tornillos ×4', 'Llave Allen'], hw: { B: 4 }, titular: 'Los dos salen de la misma pata', resaltar: ['g.barra', 'g.B'], unir: ['g.pata'],
      subs: { a: ['Apoyá los dos travesaños entre la pata de la punta y las otras dos.'], b: ['Atornillá cada punta con un tornillo B desde afuera de la pata.', 'Ajustalos con la llave Allen, sin forzar.'], tip: 'A confirmar con fábrica: la forma exacta de la unión del travesaño.' },
      mueven: [mover('g.barra', 90, [0, 0, 1], 0), mover('g.B', 40, [0, 0, 1], .5)],
      fases: {
        pieza: ['g.barra'], hw: M.idsB(), retener: ['g.B'], ocultarEnA: M.idsB(),
        ref: 'g.B.a.lejos', vistaB: { yaw: -40, pitch: 14 }, titularB: 'Un tornillo en cada punta',
        herramienta: { tipo: 'allen', pos: (() => { const [dx, dy] = M.dir('a'); return [M.P.a[0] + dx * 14, M.P.a[1] + dy * 14, 70]; })(), eje: [...M.dir('a'), 0] },
      },
    }),
    paso(3, 'tapa', 'La tapa', ['Apoyá la tapa con cada agujero sobre una pata.'], [manta(), ...M.completa()], {
      usa: ['1 · Tapa', 'A · Tornillos Allen ×3', 'Llave Allen'], hw: { A: 3 }, titular: 'La parte ancha, sobre las dos patas', resaltar: ['g.tapa', 'g.A'], unir: ['g.pata'],
      subs: { a: ['Apoyá la tapa con cada agujero sobre una pata.'], b: ['Poné un tornillo Allen A en cada agujero.', 'Ajustalos con la llave hasta que la mesa quede firme.'], tip: 'La punta angosta de la tapa va sobre la pata de la que salen los travesaños.' },
      mueven: [mover('g.tapa', 150, [0, 0, 1], 0), mover('g.A', 70, [0, 0, 1], .6)],
      fases: {
        pieza: ['g.tapa'], hw: M.idsA(), retener: ['g.A'], ocultarEnA: M.idsA(),
        ref: 'g.A.a', vistaB: { yaw: -24, pitch: 56 }, titularB: 'Un tornillo en cada pata',
        herramienta: { tipo: 'allen', pos: [...M.P.a, 343] },
      },
    }),
    paso(4, 'revisar', 'Revisá que esté firme', ['Repasá los 7 tornillos con la llave.', 'Si la mesa se mueve, ajustá un poco más.'], [manta(), ...M.completa()], {
      usa: ['Llave Allen'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['g.A', 'g.B'], vista: { yaw: -34, pitch: 20 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -22, pitch: 20 }, piezas: M.completa(), mueven: [] },
  ],
};
