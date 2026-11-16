import { manta, mover, herrajes, paso as P_, textos, marca, MATS, estadio, circulo, cil, perfil, agujero, regaton, esparrago, allen, idsAllen, REG, R_CANO } from './_estimado.js?v=3c7a40cf6b';

const CH = 2, L_PIE = 90, L_CANO = 265;
const Z1 = REG + L_PIE, Z2 = Z1 + CH + L_CANO, Z3 = Z2 + CH + L_CANO;   // chapa de abajo, del medio y redonda
const OVALO = estadio(600, 280), DISCO = circulo(140, -160, 0);
const P = { i: [230, 0], f: [-170, 70], t: [-170, -70] };
const ALTAS = ['f', 't'], K = Object.keys(P);

const reg = () => K.map((k) => regaton('reg.' + k, P[k]));
const pies = () => K.map((k) => cil('pie.' + k, [...P[k], REG], L_PIE, R_CANO));
const esp1 = () => K.map((k) => esparrago('esp1.' + k, P[k], Z1));
const chapaOval = (id, z) => ({ ...perfil(id, OVALO, z, CH), huecos: K.map((k) => agujero(...P[k])) });
const canos = () => K.map((k) => cil('cano.' + k, [...P[k], Z1 + CH], L_CANO, R_CANO));
const esp2 = () => ALTAS.map((k) => esparrago('esp2.' + k, P[k], Z2));
const tornMedio = () => allen('T.i', P.i, Z2 + CH);
const altos = () => ALTAS.map((k) => cil('alto.' + k, [...P[k], Z2 + CH], L_CANO, R_CANO));
const redonda = () => ({ ...perfil('redonda', DISCO, Z3, CH), huecos: ALTAS.map((k) => agujero(...P[k])) });
const tornArriba = () => ALTAS.flatMap((k) => allen('T.' + k, P[k], Z3 + CH));
const s1 = () => [...reg(), ...pies(), ...esp1()];
const s2 = () => [...s1(), chapaOval('oval1', Z1)];
const s3 = () => [...s2(), ...canos()];
const s4 = () => [...s3(), ...esp2()];
const s5 = () => [...s4(), chapaOval('oval2', Z2)];
const s6 = () => [...s5(), ...tornMedio()];
const s7 = () => [...s6(), ...altos()];
const mesa = () => [...s7(), redonda(), ...tornArriba()];
const ID_T_ARRIBA = idsAllen(['T.f', 'T.t']), ID_T_MEDIO = idsAllen(['T.i']);

const NA = 9, paso = P_(NA, { yaw: -24, pitch: 20 });
const acostado = (id, x, y, largo) => cil(id, [x, y, R_CANO], largo, R_CANO, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1250, 860),
  perfil('pz.02.0', OVALO.map(([x, y]) => [x - 250, y + 190]), 0, CH), perfil('pz.02.1', OVALO.map(([x, y]) => [x - 250, y + 190]), CH + .6, CH),
  { id: 'rotulo.02', tipo: 'texto', txt: '02 · CHAPAS OVALADAS ×2', pos: [-250, 370, .3], alto: 26 },
  perfil('pz.01', circulo(140, 380, 200), 0, CH), { id: 'rotulo.01', tipo: 'texto', txt: '01 · CHAPA REDONDA', pos: [380, 380, .3], alto: 26 },
  ...[0, 1, 2].map((i) => acostado('pz.04.' + i, -520, -60 - i * 45, L_PIE)),
  { id: 'rotulo.04', tipo: 'texto', txt: '04 · CAÑOS 90 MM ×3', pos: [-470, -230, .3], alto: 22 },
  ...[0, 1, 2, 3, 4].map((i) => acostado('pz.03.' + i, -260 + Math.floor(i / 3) * 300, -60 - (i % 3) * 45, L_CANO)),
  { id: 'rotulo.03', tipo: 'texto', txt: '03 · CAÑOS 265 MM ×5', pos: [40, -230, .3], alto: 22 },
];

export default {
  id: 'ch33', version: 2, pasosManual: NA,
  marca: marca('https://dege.com.ar/productos/mesa-sillon-1lwv2/', ['#C66036', '#ffffff', '#e9e4d6', '#1d1d1b']),
  materiales: MATS('#C3633D'),
  inventario: [{ id: '06', n: 3, label: '06 · Regatones' }, { id: '07', n: 5, label: '07 · Espárragos' }, { id: '05', n: 3, label: '05 · Tornillos' }],
  textos: textos({
    nombre: 'Mesa lateral 3 niveles', codigo: 'CH33', cabecera: 'Mesa lateral CH33', sust: 'mesa', art: 'la',
    ladoCuerpo: 'Dos chapas ovaladas y una redonda arriba, sobre caños de 26,5 cm. Seguí los 9 pasos del manual de fábrica y girá el modelo para ver cada unión.',
    datos: [['layers', '11 piezas', '+ 11 herrajes'], ['steps', `${NA} pasos`, 'llave Allen incluida'], ['box', '60 × 28 × 65', 'cm · largo, fondo y alto']],
    momTitulo: 'Tu mesa,<br><em>nivel por nivel</em>', momCuerpo: 'Se arma de abajo hacia arriba, todo enroscado a mano. La llave Allen viene en la caja.',
    tips: [['space', 'Hacé lugar', 'Una manta o el cartón de la caja en el piso'], ['kids', 'Separá los caños', '3 cortos de 9 cm y 5 largos de 26,5 cm'], ['time', 'Sin apuro', '9 pasos, como en el manual de papel'], ['music', 'Y poné música', 'La que te acompañe mientras armás']],
    finCuerpo: 'Arriba, la planta o la lámpara; en las dos chapas ovaladas, libros y lo que quieras tener a mano.',
  }),
  cotas: { w: 60, d: 28, h: 65, unidad: 'cm', caja: [-300, 300, -140, 140, 0, Z3 + CH], lineas: [
    [[300, 140, 0], [-300, 140, 0], [0, 80, 0], 60],
    [[300, 140, 0], [300, -140, 0], [70, 0, 0], 28],
    [[-300, 0, 0], [-300, 0, Z3 + CH], [-70, 0, 0], 65],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -26, pitch: 16 }, piezas: mesa(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: 2 chapas ovaladas, la redonda, 3 caños cortos y 5 largos.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'Los 5 caños largos son iguales (265 mm): cualquiera va en cualquier lado.' },
      usa: ['01 · Chapa redonda', '02 · Chapas ovaladas ×2', '03 · Caños 265 mm ×5', '04 · Caños 90 mm ×3'],
      elegir: [{ m: ['pz.01'], t: 'Es la chapa redonda de arriba.' }, { m: ['pz.02'], t: 'Son las 2 chapas ovaladas, iguales.' }, { m: ['pz.03'], t: 'Los 5 caños de 265 mm: van entre las chapas.' }, { m: ['pz.04'], t: 'Los 3 caños de 90 mm: las patas.' }],
      cuenta: { fijo: '11 piezas · 4 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 }, piezas: ordenPiezas(), resaltar: ['pz.01'], mueven: [mover('pz.01', 80)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los vínculos', titular: 'Contá antes de armar',
      subs: { a: ['Son 3 tornillos 05, 3 regatones 06, 5 espárragos 07 y la llave 08.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'El espárrago 07 es la varilla roscada sin cabeza: une dos caños a través de la chapa.' },
      usa: ['08 · Llave Allen incluida'], check: [[3, '05 · Tornillos'], [3, '06 · Regatones'], [5, '07 · Espárragos'], [1, '08 · Llave Allen']],
      cuenta: { fijo: '11 vínculos · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajes([{ letra: '05', n: 3, tipo: 'allen' }, { letra: '06', n: 3, tipo: 'regaton' }, { letra: '07', n: 5, tipo: 'esparrago' }]), resaltar: ['llave'], mueven: [mover('llave', 90)],
    },
    paso(1, 'patas', 'Regatón y espárrago', ['Enroscá un regatón 06 en una punta de cada caño 04 (90 mm).', 'En la otra punta, enroscá un espárrago 07.'], [manta(), ...s1()], {
      usa: ['04 · Caños 90 mm ×3', '06 · Regatones ×3', '07 · Espárragos ×3'], hw: { '06': 3, '07': 3 }, titular: 'Regatón abajo, espárrago arriba', resaltar: ['reg', 'esp1'], unir: ['pie'],
      mueven: [mover('reg', 40, [0, 0, -1], 0), mover('esp1', 70, [0, 0, 1], .5)], vista: { yaw: -24, pitch: 28 },
    }),
    paso(2, 'oval1', 'La primera chapa ovalada', ['Apoyá una chapa ovalada 02 haciendo coincidir cada espárrago con su agujero.'], [manta(), ...s2()], {
      usa: ['02 · Chapa ovalada'], titular: 'Cada espárrago, en su agujero', resaltar: ['oval1'], unir: ['pie', 'esp1'],
      subs: { a: ['Apoyá una chapa ovalada 02 haciendo coincidir cada espárrago con su agujero.'], b: [], tip: 'El caño solo va en una punta de la chapa; los dos juntos, en la otra.' },
      mueven: [mover('oval1', 120, [0, 0, 1], 0)], vista: { yaw: -24, pitch: 26 },
    }),
    paso(3, 'canos', 'Tres caños de 265 mm', ['Enroscá un caño 03 en cada espárrago, a mano.'], [manta(), ...s3()], {
      usa: ['03 · Caños 265 mm ×3'], titular: 'A mano, hasta el tope', cuenta: { de: 'cano.', n: 3, txt: 'Caño', fin: '3 caños en su lugar' }, resaltar: ['cano'], unir: ['oval1', 'esp1'],
      mueven: K.map((k, i) => mover('cano.' + k, 150, [0, 0, 1], i * .3)),
    }),
    paso(4, 'esp2', 'Dos espárragos', ['Enroscá un espárrago 07 arriba de los dos caños que están juntos.'], [manta(), ...s4()], {
      usa: ['07 · Espárragos ×2'], hw: { '07': 2 }, titular: 'Solo en los dos caños juntos', resaltar: ['esp2'], unir: ['cano'],
      subs: { a: ['Enroscá un espárrago 07 arriba de los dos caños que están juntos.'], b: [], tip: 'Esos dos caños siguen hacia arriba, hasta la chapa redonda.' },
      mueven: [mover('esp2', 70, [0, 0, 1], 0)], zoom: .4,
    }),
    paso(5, 'oval2', 'La segunda chapa ovalada', ['Apoyá la otra chapa ovalada 02, con sus agujeros sobre los espárragos.'], [manta(), ...s5()], {
      usa: ['02 · Chapa ovalada'], titular: 'Cada agujero, en su espárrago', resaltar: ['oval2'], unir: ['cano', 'esp2'],
      mueven: [mover('oval2', 130, [0, 0, 1], 0)],
    }),
    paso(6, 'tornillo-medio', 'Un tornillo en el agujero libre', ['En el agujero que quedó libre, sobre el caño solo, poné un tornillo 05.'], [manta(), ...s6()], {
      usa: ['05 · Tornillo', '08 · Llave Allen'], hw: { '05': 1 }, titular: 'Sobre el caño solo', resaltar: ['T.i'], unir: ['oval2'],
      subs: { a: ['En el agujero que quedó libre, sobre el caño solo, poné un tornillo 05.'], b: ['Ajustalo con la llave Allen.'], tip: '' },
      mueven: [mover('T.i', 60, [0, 0, 1], 0)],
      fases: { pieza: ['T.i.cabeza'], hw: ID_T_MEDIO, retener: ['T.i'], ocultarEnA: ID_T_MEDIO, ref: 'T.i', vistaB: { yaw: -20, pitch: 50 }, titularB: 'Con la llave Allen', herramienta: { tipo: 'allen', pos: [...P.i, Z2 + CH + 3] } },
    }),
    paso(7, 'altos', 'Los dos caños de arriba', ['Enroscá los dos caños 03 que quedan en los espárragos.'], [manta(), ...s7()], {
      usa: ['03 · Caños 265 mm ×2'], titular: 'A mano, hasta el tope', resaltar: ['alto'], unir: ['oval2', 'esp2'],
      mueven: [mover('alto', 150, [0, 0, 1], 0)], vista: { yaw: -26, pitch: 16 },
    }),
    paso(8, 'redonda', 'La chapa redonda', ['Apoyá la chapa redonda 01 sobre los dos caños, con los agujeros alineados.'], [manta(), ...mesa()], {
      usa: ['01 · Chapa redonda', '05 · Tornillos ×2', '08 · Llave Allen'], hw: { '05': 2 }, titular: 'Arriba de todo', resaltar: ['redonda', 'T.f', 'T.t'], unir: ['alto'],
      subs: { a: ['Apoyá la chapa redonda 01 sobre los dos caños, con los agujeros alineados.'], b: ['Fijala con dos tornillos 05 y la llave Allen.'], tip: '' },
      mueven: [mover('redonda', 120, [0, 0, 1], 0), mover(['T.f', 'T.t'], 60, [0, 0, 1], .6)],
      fases: { pieza: ['redonda'], hw: ID_T_ARRIBA, retener: ['T.f+T.t'], ocultarEnA: ID_T_ARRIBA, ref: 'T.f', vistaB: { yaw: -30, pitch: 50 }, titularB: 'Un tornillo en cada caño', herramienta: { tipo: 'allen', pos: [...P.f, Z3 + CH + 3] } },
      vista: { yaw: -26, pitch: 16 },
    }),
    paso(9, 'revisar', 'Ajustá bien todo', ['Repasá los 3 tornillos con la llave.', 'Si algo se mueve, ajustalo un poco más.'], [manta(), ...mesa()], {
      usa: ['08 · Llave Allen'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['T'],
      subs: { a: ['Repasá los 3 tornillos con la llave.', 'Si algo se mueve, ajustalo un poco más.'], b: [], tip: 'El manual de papel numera este último paso como 7 (y repite el 7 antes): es el 9.' },
      vista: { yaw: -34, pitch: 18 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -26, pitch: 14 }, piezas: mesa(), mueven: [] },
  ],
};
