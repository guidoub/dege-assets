// CH33 · Mesa lateral 3 niveles. ESTIMADO: no hay manual de fábrica en el Drive. Sale de la foto de portada y del plano
// de la ficha (60 × 28 × 65 cm; estante de abajo a 9 cm, 27 cm entre los dos estantes ovalados, disco de Ø28 arriba).
// Herrajes del sistema de la línea (regatón, espárrago, tornillo Allen). Ver estudio/estimados-notas.md.
import { manta, mover, herrajes, paso as P_, textos, marca, MATS, estadio, circulo, cil, perfil, agujero, regaton, esparrago, allen, idsAllen, REG, R_CANO } from './_estimado.js?v=0c6ddde886';

const CH = 2.5, Z1 = 90, Z2 = Z1 + CH + 270, Z3 = 650 - CH;   // estante de abajo, del medio y disco de arriba
const OVALO = estadio(600, 280), DISCO = circulo(140, -160, 0);
// una pata del lado izquierdo (+X) que llega al estante del medio y dos del lado del disco que llegan arriba
const P = { i: [230, 0], f: [-170, 70], t: [-170, -70] };
const ALTAS = ['f', 't'], K = Object.keys(P);

const reg = () => K.map((k) => regaton('reg.' + k, P[k]));
const pies = () => K.map((k) => cil('pie.' + k, [...P[k], REG], Z1 - REG, R_CANO));
const esp1 = () => K.map((k) => esparrago('esp1.' + k, P[k], Z1));
const estante = (id, z) => ({ ...perfil(id, OVALO, z, CH), huecos: K.map((k) => agujero(...P[k])) });
const canos = () => K.map((k) => cil('cano.' + k, [...P[k], Z1 + CH], 270, R_CANO));
const esp2 = () => ALTAS.map((k) => esparrago('esp2.' + k, P[k], Z2));
const tornMedio = () => allen('A.i', P.i, Z2 + CH);
const altos = () => ALTAS.map((k) => cil('alto.' + k, [...P[k], Z2 + CH], Z3 - Z2 - CH, R_CANO));
const disco = () => ({ ...perfil('disco', DISCO, Z3, CH), huecos: ALTAS.map((k) => agujero(...P[k])) });
const tornArriba = () => ALTAS.flatMap((k) => allen('A.' + k, P[k], Z3 + CH));
const s1 = () => [...reg(), ...pies(), ...esp1()];
const s2 = () => [...s1(), estante('estante1', Z1)];
const s3 = () => [...s2(), ...canos()];
const s4 = () => [...s3(), ...esp2(), estante('estante2', Z2), ...tornMedio()];
const mesa = () => [...s4(), ...altos(), disco(), ...tornArriba()];
const ID_A_ARRIBA = idsAllen(['A.f', 'A.t']), ID_A_MEDIO = idsAllen(['A.i']);

const NA = 6, paso = P_(NA, { yaw: -24, pitch: 20 });
const acostado = (id, x, y, largo) => cil(id, [x, y, R_CANO], largo, R_CANO, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1250, 860),
  perfil('pz.1.0', OVALO.map(([x, y]) => [x - 250, y + 190]), 0, CH), perfil('pz.1.1', OVALO.map(([x, y]) => [x - 250, y + 190]), CH + .6, CH),
  { id: 'rotulo.1', tipo: 'texto', txt: '1 · ESTANTES ×2', pos: [-250, 370, .3], alto: 26 },
  perfil('pz.2', circulo(140, 380, 200), 0, CH), { id: 'rotulo.2', tipo: 'texto', txt: '2 · DISCO', pos: [380, 380, .3], alto: 26 },
  ...[0, 1, 2].map((i) => acostado('pz.3.' + i, -520, -60 - i * 45, Z1 - REG)),
  { id: 'rotulo.3', tipo: 'texto', txt: '3 · PATAS ×3', pos: [-480, -230, .3], alto: 22 },
  ...[0, 1, 2].map((i) => acostado('pz.4.' + i, -300, -60 - i * 45, 270)),
  { id: 'rotulo.4', tipo: 'texto', txt: '4 · CAÑOS 27 ×3', pos: [-170, -230, .3], alto: 22 },
  ...[0, 1].map((i) => acostado('pz.5.' + i, 80, -60 - i * 45, Z3 - Z2 - CH)),
  { id: 'rotulo.5', tipo: 'texto', txt: '5 · CAÑOS 28 ×2', pos: [220, -230, .3], alto: 22 },
];

export default {
  id: 'ch33', version: 1, pasosManual: NA, estimado: true,
  marca: marca('https://dege.com.ar/productos/mesa-sillon-1lwv2/', ['#C66036', '#ffffff', '#e9e4d6', '#1d1d1b']),
  materiales: MATS('#C3633D'),
  inventario: [{ id: 'C', n: 3, label: 'C · Regatones' }, { id: 'B', n: 5, label: 'B · Espárragos' }, { id: 'A', n: 3, label: 'A · Tornillos Allen' }],
  textos: textos({
    nombre: 'Mesa lateral 3 niveles', codigo: 'CH33', cabecera: 'Mesa lateral CH33', sust: 'mesa', art: 'la',
    ladoCuerpo: 'Dos estantes ovalados y un disco arriba, sobre tres patas de caño. Seguí los pasos y girá el modelo para ver cada unión.',
    datos: [['layers', '10 piezas', '+ 11 herrajes'], ['steps', `${NA} pasos`, 'llave Allen incluida'], ['box', '60 × 28 × 65', 'cm · largo, fondo y alto']],
    momTitulo: 'Tu mesa,<br><em>nivel por nivel</em>', momCuerpo: 'Se arma de abajo hacia arriba, todo enroscado a mano. La llave Allen viene en la caja.',
    tips: [['space', 'Hacé lugar', 'Una manta o el cartón de la caja en el piso'], ['kids', 'Separá los caños', '3 patas cortas, 3 caños de 27 y 2 de 28'], ['time', 'Sin apuro', 'Seguí los pasos en orden'], ['music', 'Y poné música', 'La que te acompañe mientras armás']],
    finCuerpo: 'Arriba, la planta o la lámpara; en los dos estantes, libros y lo que quieras tener a mano.',
  }),
  cotas: { w: 60, d: 28, h: 65, unidad: 'cm', caja: [-300, 300, -140, 140, 0, 650], lineas: [
    [[300, 140, 0], [-300, 140, 0], [0, 80, 0], 60],
    [[300, 140, 0], [300, -140, 0], [70, 0, 0], 28],
    [[-300, -0, 0], [-300, 0, 650], [-70, 0, 0], 65],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -26, pitch: 16 }, piezas: mesa(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: 2 estantes, el disco, 3 patas cortas y 5 caños.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'Los caños de 27 y de 28 se parecen mucho: separalos antes de empezar.' },
      usa: ['1 · Estantes ×2', '2 · Disco', '3 · Patas ×3', '4 · Caños 27 cm ×3', '5 · Caños 28 cm ×2'],
      elegir: [{ m: ['pz.1'], t: 'Son los 2 estantes ovalados, iguales.' }, { m: ['pz.2'], t: 'Es el disco de arriba.' }, { m: ['pz.3'], t: 'Las 3 patas cortas.' }, { m: ['pz.4'], t: 'Los 3 caños que van entre los estantes.' }, { m: ['pz.5'], t: 'Los 2 caños que llegan al disco.' }],
      cuenta: { fijo: '10 piezas · 5 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 }, piezas: ordenPiezas(), resaltar: ['pz.2'], mueven: [mover('pz.2', 80)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 3 tornillos Allen, 5 espárragos, 3 regatones y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'El espárrago es la varilla roscada sin cabeza: une dos caños a través del estante.' },
      usa: ['Llave Allen incluida'], check: [[3, 'A · Tornillos Allen'], [5, 'B · Espárragos'], [3, 'C · Regatones'], [1, 'Llave Allen']],
      cuenta: { fijo: '11 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajes([{ letra: 'A', n: 3, tipo: 'allen' }, { letra: 'B', n: 5, tipo: 'esparrago' }, { letra: 'C', n: 3, tipo: 'regaton' }]), resaltar: ['llave'], mueven: [mover('llave', 90)],
    },
    paso(1, 'patas', 'Las patas', ['Enroscá un regatón C en una punta de cada pata corta.', 'En la otra punta, enroscá un espárrago B hasta la mitad.'], [manta(), ...s1()], {
      usa: ['3 · Patas ×3', 'C · Regatones ×3', 'B · Espárragos ×3'], hw: { C: 3, B: 3 }, titular: 'Regatón abajo, espárrago arriba', resaltar: ['reg', 'esp1'], unir: ['pie'],
      mueven: [mover('reg', 40, [0, 0, -1], 0), mover('esp1', 70, [0, 0, 1], .5)], vista: { yaw: -24, pitch: 28 },
    }),
    paso(2, 'estante1', 'El estante de abajo', ['Apoyá un estante haciendo coincidir cada espárrago con su agujero.'], [manta(), ...s2()], {
      usa: ['1 · Estante'], titular: 'Cada espárrago, en su agujero', resaltar: ['estante1'], unir: ['pie', 'esp1'],
      subs: { a: ['Apoyá un estante haciendo coincidir cada espárrago con su agujero.'], b: [], tip: 'La pata sola va en una punta del estante; las dos juntas, en la otra.' },
      mueven: [mover('estante1', 130, [0, 0, 1], 0)], vista: { yaw: -24, pitch: 26 },
    }),
    paso(3, 'canos', 'Los caños de 27', ['Enroscá un caño de 27 cm en cada espárrago, a mano.'], [manta(), ...s3()], {
      usa: ['4 · Caños 27 cm ×3'], titular: 'A mano, hasta el tope', cuenta: { de: 'cano.', n: 3, txt: 'Caño', fin: '3 caños en su lugar' }, resaltar: ['cano'], unir: ['estante1', 'esp1'],
      mueven: K.map((k, i) => mover('cano.' + k, 150, [0, 0, 1], i * .3)),
    }),
    paso(4, 'estante2', 'El estante del medio', [
      'Enroscá un espárrago B arriba de los 2 caños que están juntos.',
      'Apoyá el otro estante sobre los 3 caños.',
    ], [manta(), ...s4()], {
      usa: ['B · Espárragos ×2', '1 · Estante', 'A · Tornillo Allen'], hw: { B: 2, A: 1 }, titular: 'Espárragos solo en los dos caños juntos', resaltar: ['esp2', 'estante2', 'A.i'], unir: ['cano'],
      subs: { a: ['Enroscá un espárrago B arriba de los 2 caños que están juntos.', 'Apoyá el otro estante sobre los 3 caños.'], b: ['En el caño solo, poné un tornillo Allen A y ajustalo con la llave.'], tip: 'Los caños juntos siguen hacia arriba hasta el disco; el caño solo termina en este estante.' },
      mueven: [mover('esp2', 70, [0, 0, 1], 0), mover('estante2', 130, [0, 0, 1], .5), mover('A.i', 60, [0, 0, 1], 1)],
      fases: { pieza: ['esp2', 'estante2'], hw: ID_A_MEDIO, retener: ['A.i'], ocultarEnA: ID_A_MEDIO, ref: 'A.i', vistaB: { yaw: -20, pitch: 50 }, titularB: 'Un tornillo en el caño solo', herramienta: { tipo: 'allen', pos: [...P.i, Z2 + CH + 3] } },
    }),
    paso(5, 'disco', 'Los caños altos y el disco', [
      'Enroscá los 2 caños de 28 cm en los espárragos.',
      'Apoyá el disco sobre los dos caños.',
    ], [manta(), ...mesa()], {
      usa: ['5 · Caños 28 cm ×2', '2 · Disco', 'A · Tornillos Allen ×2'], hw: { A: 2 }, titular: 'El disco, sobre los dos caños', resaltar: ['alto', 'disco', 'A.f', 'A.t'], unir: ['estante2'],
      subs: { a: ['Enroscá los 2 caños de 28 cm en los espárragos.', 'Apoyá el disco sobre los dos caños.'], b: ['Poné un tornillo Allen A en cada agujero del disco.', 'Ajustalos con la llave.'], tip: '' },
      mueven: [mover('alto', 150, [0, 0, 1], 0), mover('disco', 120, [0, 0, 1], .6), mover(['A.f', 'A.t'], 60, [0, 0, 1], 1)],
      fases: { pieza: ['alto', 'disco'], hw: ID_A_ARRIBA, retener: ['A.f', 'A.t'], ocultarEnA: ID_A_ARRIBA, ref: 'A.f', vistaB: { yaw: -30, pitch: 50 }, titularB: 'Un tornillo en cada caño', herramienta: { tipo: 'allen', pos: [...P.f, Z3 + CH + 3] } },
      vista: { yaw: -26, pitch: 16 },
    }),
    paso(6, 'revisar', 'Revisá que esté firme', ['Repasá los 3 tornillos con la llave.', 'Si algo se mueve, ajustalo un poco más.'], [manta(), ...mesa()], {
      usa: ['Llave Allen'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['A'], vista: { yaw: -34, pitch: 18 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -26, pitch: 14 }, piezas: mesa(), mueven: [] },
  ],
};
