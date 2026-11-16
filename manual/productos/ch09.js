
const A = 495, RC = 155;                 // óvalo 130 × 31: rectas de ±495 y radio 155
const CHAPA = 2.5, PATA_PL = 12, L_PIE = 90, L_CANO = 325, R_CANO = 12.5;
const Z1 = PATA_PL + L_PIE;              // 102: chapa de abajo
const Z2 = Z1 + CHAPA + L_CANO;          // 429,5: chapa del medio
const Z3 = Z2 + CHAPA + L_CANO;          // 757: chapa de arriba
const ALTO = Z3 + CHAPA + 3;             // ≈ 76 cm
const XL = 215, RL = 162;
const PATAS = {
  izq: [A + RL, 0], der: [-A - RL, 0],
  fi: [XL, RL], fd: [-XL, RL], ti: [XL, -RL], td: [-XL, -RL],
};
const K = Object.keys(PATAS);

const cil = (id, pos, largo, r, mat = 'chapa', extra = {}) => ({ id, tipo: 'cilindro', pos, s0: 0, s1: largo, r, mat, seg: 28, ...extra });

function contorno() {
  const pts = [], n = 110, RE = 19;
  const lado = (x0, x1, y, ny) => { for (let i = 0; i <= n; i++) pts.push([[x0 + (x1 - x0) * i / n, y], [0, ny]]); };
  const curva = (cx, a0, a1) => { for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([[cx + RC * Math.cos(a), RC * Math.sin(a)], [Math.cos(a), Math.sin(a)]]); } };
  lado(-A, A, -RC, -1); curva(A, -Math.PI / 2, Math.PI / 2); lado(A, -A, RC, 1); curva(-A, Math.PI / 2, 1.5 * Math.PI);
  return pts.map(([[x, y], [nx, ny]]) => {
    let px = x, py = y;
    for (const [lx, ly] of Object.values(PATAS)) {
      const dx = px - lx, dy = py - ly, u = dx * nx + dy * ny, s = -dx * ny + dy * nx;
      if (Math.abs(s) < RE) { const k = Math.sqrt(RE * RE - s * s) - u; if (k > 0) { px += nx * k; py += ny * k; } }
    }
    return [px, py];
  });
}
const CONT = contorno();
const chapa = (id, z) => ({ id, tipo: 'perfil', puntos: CONT, pos: [0, 0, z], z0: 0, z1: CHAPA, mat: 'chapa',
  huecos: Object.values(PATAS).map(([x, y]) => ({ x, y, w: 8.5, d: 8.5, r: 4.25 })) });

const pies = () => K.flatMap((k) => [cil('pata.' + k, [...PATAS[k], 0], PATA_PL, 10, 'negro'), cil('pie.' + k, [...PATAS[k], PATA_PL], L_PIE, R_CANO)]);
const esparragos = (n, z) => K.map((k) => cil(`esp${n}.${k}`, [...PATAS[k], z - 20], 44, 4, 'zinc', { seg: 14 }));
const canos = (n, z) => K.map((k) => cil(`cano${n}.${k}`, [...PATAS[k], z + CHAPA], L_CANO, R_CANO));
const tornillos = () => K.flatMap((k) => [
  cil(`T.${k}.cana`, [...PATAS[k], Z3 + CHAPA], 22, 3, 'zinc', { eje: [0, 0, -1], seg: 14 }),
  cil(`T.${k}.cabeza`, [...PATAS[k], Z3 + CHAPA], 3, 7, 'negro', { seg: 24 }),
  cil(`T.${k}.hex`, [...PATAS[k], Z3 + CHAPA + 3], .2, 2.5, 'oscuro', { seg: 6, sinContorno: true, sinAristas: true }),
]);
const nivel1 = () => [...pies(), ...esparragos(1, Z1), chapa('chapa.1', Z1)];
const nivel2 = () => [...nivel1(), ...canos(1, Z1), ...esparragos(2, Z2), chapa('chapa.2', Z2)];
const rack = () => [...nivel2(), ...canos(2, Z2), chapa('chapa.3', Z3), ...tornillos()];

const manta = (w = 1800, d = 760, extra = {}) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', ...extra });

const acostado = (id, x, y, largo) => cil(id, [x, y, R_CANO], largo, R_CANO, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(2000, 1240, { pos: [0, -40, 0] }),
  ...[0, 1, 2].map((k) => ({ id: 'pz.2.' + k, tipo: 'perfil', puntos: CONT, pos: [0, 330, k * (CHAPA + .6)], z0: 0, z1: CHAPA, mat: 'chapa' })),
  { id: 'rotulo.2', tipo: 'texto', txt: '1 · CHAPAS ×3', pos: [0, 540, .3], alto: 48 },
  ...Array.from({ length: 12 }, (_, k) => acostado('pz.3.' + k, -900 + (k % 2) * 380, 40 - Math.floor(k / 2) * 55, L_CANO)),
  { id: 'rotulo.3', tipo: 'texto', txt: '2 · CAÑOS GRANDES ×12', pos: [-520, -340, .3], alto: 40 },
  ...Array.from({ length: 6 }, (_, k) => acostado('pz.5.' + k, 80 + (k % 3) * 130, 40 - Math.floor(k / 3) * 60, L_PIE)),
  { id: 'rotulo.5', tipo: 'texto', txt: '3 · CAÑOS CHICOS ×6', pos: [270, -110, .3], alto: 40 },
  { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 260, d: 150, r: 26, pos: [700, -40, 0], z0: 0, z1: 24, mat: 'bolsa' },
  { id: 'rotulo.h', tipo: 'texto', txt: 'HERRAJES', pos: [700, -170, .3], alto: 40 },
];
const herrajesPiezas = () => [
  manta(620, 380, { lineas: 0 }),
  ...Array.from({ length: 12 }, (_, i) => cil('h.esp.' + i, [-270 + (i % 2) * 60, -120 + Math.floor(i / 2) * 42, 4], 44, 4, 'zinc', { eje: [1, 0, 0], seg: 14 })),
  ...Array.from({ length: 6 }, (_, i) => [cil(`h.T.${i}.cana`, [-60 + (i % 2) * 50, -90 + Math.floor(i / 2) * 70, 0], 22, 3, 'zinc', { seg: 14 }), cil(`h.T.${i}.cabeza`, [-60 + (i % 2) * 50, -90 + Math.floor(i / 2) * 70, 22], 3, 7, 'negro', { seg: 24 })]).flat(),
  ...Array.from({ length: 6 }, (_, i) => cil('h.pata.' + i, [80 + (i % 2) * 42, -90 + Math.floor(i / 2) * 70, 0], PATA_PL, 10, 'negro')),
  cil('llave.corto', [240, -60, 3], 26, 3, 'zinc', { eje: [-1, 0, 0], seg: 12 }),
  cil('llave.largo', [240, -60, 3], 82, 3, 'zinc', { eje: [0, 1, 0], seg: 12 }),
  { id: 'rotulo.4', tipo: 'texto', txt: 'B', pos: [-220, 160, .3], alto: 32 },
  { id: 'rotulo.1', tipo: 'texto', txt: 'A', pos: [-35, 160, .3], alto: 32 },
  { id: 'rotulo.7', tipo: 'texto', txt: 'C', pos: [100, 160, .3], alto: 32 },
  { id: 'rotulo.6', tipo: 'texto', txt: 'D', pos: [245, 160, .3], alto: 32 },
];

const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const paso = (num, id, titulo, a, piezas, extra = {}) => ({
  num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de 8` },
  vista: { yaw: -20, pitch: 22 }, piezas, mueven: [], resaltar: [], encuadrarTodo: false, ...extra,
});

export default {
  id: 'ch09', version: 1, pasosManual: 8,
  marca: {
    nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022',
    tienda: 'https://dege.com.ar/productos/rack-de-tv-ch09/', instagram: 'https://instagram.com/dege.muebles',
    confeti: ['#B9654C', '#ffffff', '#e9e4d6', '#1d1d1b'],
  },
  materiales: {
    chapa: { color: '#B9654C' }, zinc: { color: '#c9ced3' }, negro: { color: '#242424' }, oscuro: { color: '#111111' },
    carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 },
  },
  inventario: [{ id: 'C', n: 6, label: 'C · Regatones' }, { id: 'B', n: 12, label: 'B · Espárragos' }, { id: 'A', n: 6, label: 'A · Tornillos Allen' }],
  textos: {
    titulo: 'Armá tu Estantería baja CH09 · DEGË Muebles', cabecera: 'Estantería baja CH09',
    ladoTitulo: 'Tu estantería baja, <em>paso a paso</em>',
    ladoCuerpo: 'Tres chapas ovaladas de 130 × 31 cm y seis patas de caño. Seguí los 8 pasos del manual de fábrica y girá el modelo para ver cada unión.',
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá la estantería para girarla', girar: 'Arrastrá para girar la estantería',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>estantería baja</em>, paso a paso',
    datos: [['layers', '21 piezas', '+ 24 herrajes'], ['steps', '8 pasos', 'llave Allen incluida'], ['box', '130 × 31 × 76', 'cm · largo, fondo y alto']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: 'Tu estantería,<br><em>piso por piso</em>', momCuerpo: 'Son tres chapas y dieciocho caños. Todo se enrosca a mano; la llave Allen viene en la caja.',
    momTips: [
      ['space', 'Hacé lugar', 'Mide 1,30 m: dejá espacio en el piso'],
      ['kids', 'Separá los caños', '6 cortos de 9 cm y 12 largos de 32,5 cm'],
      ['time', 'Mejor de a dos', 'Para apoyar las chapas largas sin que se tuerzan'],
      ['music', 'Y poné música', 'La que te acompañe mientras armás'],
    ],
    momCta: 'Empezar a armar',
    finTitulo: '¡Tu estantería <em>está lista</em>! 🎉',
    finCuerpo: 'Revisá que apoye firme en sus seis patas. Arriba, la tele o lo que quieras mostrar; abajo, libros, plantas y cajas.',
    finTip: 'Guardá la llave Allen: cada tanto, repasá los seis tornillos de arriba. ¡Mandanos una foto cuando la tengas armada!',
    waTexto: '¡Hola DEGË! Estoy armando la Estantería baja CH09 y tengo una duda 😊',
    pie: 'DEGË Muebles · Muebles de chapa y caño, de Rosario a todo el país.',
    rvEjemplos: ['La armé en un rato 🙌', 'Re claro el paso a paso', 'Firme con la tele encima', 'El color, tal cual la foto'],
  },
  cotas: { w: 130, d: 31, h: 76, unidad: 'cm', caja: [-650, 650, -155, 155, 0, ALTO], lineas: [
    [[650, 0, 0], [-650, 0, 0], [0, 260, 0], 130],
    [[-650, 155, 0], [-650, -155, 0], [-70, 0, 0], 31],
    [[650, 0, 0], [650, 0, Z3 + CHAPA], [60, 0, 0], 76],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -20, pitch: 16 }, piezas: rack(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: 3 chapas, 12 caños largos y 6 cortos.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'Observá bien cada pieza antes de encastrarla. Cualquier duda, escribinos.' },
      usa: ['1 · Chapas ×3', '2 · Caños grandes ×12', '3 · Caños chicos ×6'],
      elegir: [
        { m: ['pz.2'], t: 'Son los tres óvalos de 130 × 31 cm, iguales, con seis orejas perforadas.' },
        { m: ['pz.3'], t: 'Son los 12 caños largos: 6 entre cada par de chapas.' },
        { m: ['pz.5'], t: 'Son los 6 caños cortos: las patas, debajo de la chapa de abajo.' },
      ],
      cuenta: { fijo: '21 piezas · 3 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 60 },
      piezas: ordenPiezas(), resaltar: ['pz.2.2'], mueven: [mover('pz.2.2', 160)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 12 espárragos, 6 tornillos Allen, 6 regatones y la llave.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'El espárrago es la varilla roscada sin cabeza: une un caño con el siguiente, a través de la chapa.' },
      usa: ['D · Llave Allen incluida'], check: [[12, 'B · Espárragos'], [6, 'A · Tornillos Allen'], [6, 'C · Regatones'], [1, 'D · Llave Allen']],
      cuenta: { fijo: '24 herrajes · 1 llave' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajesPiezas(), resaltar: ['llave'], mueven: [mover('llave', 110)],
    },
    paso(1, 'regatones', 'Regatón y espárrago', [
      'Enroscá un regatón C y un espárrago B en los seis caños chicos 3.',
    ], [manta(), ...pies(), ...esparragos(1, Z1)], {
      usa: ['3 · Caños chicos ×6', 'C · Regatones ×6', 'B · Espárragos ×6'], hw: { C: 6, B: 6 },
      titular: 'Regatón abajo, espárrago arriba', resaltar: ['pata', 'esp1'], unir: ['pie'],
      mueven: [mover('pata', 50, [0, 0, -1], 0), mover('esp1', 80, [0, 0, 1], .4)],
      vista: { yaw: -18, pitch: 30 },
    }),
    paso(2, 'chapa', 'Los caños chicos, en la chapa', [
      'Apoyá una chapa 1 haciendo coincidir los 6 espárragos con sus agujeros.',
    ], [manta(), ...nivel1()], {
      usa: ['1 · Chapa'], titular: 'Cada espárrago, en su agujero', resaltar: ['chapa.1'], unir: ['pie', 'esp1'],
      mueven: [mover('chapa.1', 160, [0, 0, 1], 0)], vista: { yaw: -18, pitch: 28 },
    }),
    paso(3, 'canos1', 'Seis caños grandes', [
      'Enroscá seis caños grandes 2 en los espárragos, a mano.',
    ], [manta(), ...nivel1(), ...canos(1, Z1)], {
      usa: ['2 · Caños grandes ×6'], titular: 'A mano, hasta el tope', cuenta: { de: 'cano1.', n: 6, txt: 'Caño', fin: '6 caños en su lugar' },
      resaltar: ['cano1'], unir: ['chapa.1', 'esp1'],
      subs: { a: ['Enroscá seis caños grandes 2 en los espárragos, a mano.'], b: [], tip: 'Si una chapa larga se tuerce, enroscá primero los caños de las puntas y después los del medio.' },
      mueven: K.map((k, i) => mover('cano1.' + k, 170, [0, 0, 1], i * .2)),
    }),
    paso(4, 'esp2', 'Seis espárragos', [
      'Enroscá un espárrago B arriba de cada caño grande, hasta la mitad.',
    ], [manta(), ...nivel1(), ...canos(1, Z1), ...esparragos(2, Z2)], {
      usa: ['B · Espárragos ×6'], hw: { B: 6 }, titular: 'Uno en cada caño', resaltar: ['esp2'], unir: ['cano1'],
      mueven: [mover('esp2', 70, [0, 0, 1], 0)], zoom: .35,
    }),
    paso(5, 'chapa2', 'La chapa del medio', [
      'Apoyá una chapa 1 sobre los caños grandes, alineando sus agujeros con los espárragos.',
    ], [manta(), ...nivel2()], {
      usa: ['1 · Chapa'], titular: 'Cada agujero, en su espárrago', resaltar: ['chapa.2'], unir: ['cano1', 'esp2'],
      mueven: [mover('chapa.2', 160, [0, 0, 1], 0)],
    }),
    paso(6, 'canos2', 'Los últimos seis caños', [
      'Enroscá los otros seis caños grandes 2 en los espárragos.',
    ], [manta(), ...nivel2(), ...canos(2, Z2)], {
      usa: ['2 · Caños grandes ×6'], titular: 'Seis caños más', cuenta: { de: 'cano2.', n: 6, txt: 'Caño', fin: '6 caños en su lugar' },
      resaltar: ['cano2'], unir: ['chapa.2'],
      subs: { a: ['Enroscá los otros seis caños grandes 2 en los espárragos.'], b: [], tip: 'El manual de papel dice "caños cortos 3" en este paso: son los caños grandes 2 (los cortos ya están abajo, de patas).' },
      mueven: K.map((k, i) => mover('cano2.' + k, 170, [0, 0, 1], i * .2)),
    }),
    paso(7, 'tapa', 'Última chapa y tornillos', [
      'Apoyá la última chapa sobre los caños grandes.',
    ], [manta(), ...rack()], {
      usa: ['1 · Chapa', 'A · Tornillos Allen ×6', 'D · Llave Allen'], hw: { A: 6 },
      titular: 'Cada agujero, sobre su caño', resaltar: ['chapa.3', 'T'], unir: ['cano2'],
      subs: { a: ['Apoyá la última chapa sobre los caños grandes.'], b: ['Poné un tornillo A en cada agujero.', 'Ajustalos con la llave Allen.'], tip: 'Ajustá primero las puntas y después los del medio: así la chapa asienta pareja.' },
      mueven: [mover('chapa.3', 180, [0, 0, 1], 0), mover('T', 80, [0, 0, 1], .6)],
      fases: {
        pieza: ['chapa.3'], hw: K.flatMap((k) => [`T.${k}.cana`, `T.${k}.cabeza`, `T.${k}.hex`]), retener: ['T'], ocultarEnA: K.flatMap((k) => [`T.${k}.cana`, `T.${k}.cabeza`, `T.${k}.hex`]),
        ref: 'T.izq', vistaB: { yaw: -40, pitch: 55 }, titularB: 'Un tornillo en cada caño',
        herramienta: { tipo: 'allen', pos: [...PATAS.izq, Z3 + CHAPA + 3] },
      },
    }),
    paso(8, 'revisar', 'Revisá que esté firme', [
      'Repasá los seis tornillos con la llave.',
      'Si el piso es desparejo, girá los regatones hasta que no baile.',
    ], [manta(), ...rack()], {
      usa: ['D · Llave Allen'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['T', 'pata'],
      subs: { a: ['Repasá los seis tornillos con la llave.', 'Si el piso es desparejo, girá los regatones hasta que no baile.'], b: [], tip: 'Los regatones se enroscan más o menos: así ajustás la altura de cada pata.' },
      vista: { yaw: -28, pitch: 16 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -24, pitch: 14 }, piezas: rack(), mueven: [] },
  ],
};
