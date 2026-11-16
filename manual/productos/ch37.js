
const H = 660;                         // alto total
const TAPA = 3, BASE = 5;
const XC = 85, R_CANO = 12.5;
const CANOS = [[XC + 31, 0], [XC - 31, 0]];
const TOPES = [[175, -92], [175, 92], [-150, -92], [-150, 92]];

const cil = (id, pos, largo, r, mat = 'chapa', extra = {}) => ({ id, tipo: 'cilindro', pos, s0: 0, s1: largo, r, mat, seg: 28, ...extra });
const placa = (id, pos, w, d, h, r, extra = {}) => ({ id, tipo: 'perfil', forma: 'redondeada', pos, w, d, r, z0: 0, z1: h, mat: 'chapa', ...extra });

const tapa = () => [
  placa('tapa', [0, 0, H - TAPA], 500, 300, TAPA, 85, { huecos: [{ x: 205, y: 0, w: 26, d: 95, r: 13 }] }),
  ...CANOS.map(([x, y], i) => cil('tapa.saliente.' + i, [x, y, H - TAPA], 14, 4, 'zinc', { eje: [0, 0, -1], seg: 14 })),
];
const canos = () => CANOS.map(([x, y], i) => cil('cano.' + i, [x, y, BASE], H - TAPA - BASE, R_CANO));
const base = (marcas = false) => [
  placa('base', [17.5, 0, 0], 370, 250, BASE, 60),
  ...TOPES.map(([x, y], i) => cil('base.tope.' + i, [x, y, -1.5], 1.5, 9, 'negro', { seg: 20 })),
  ...(marcas ? CANOS.map(([x, y], i) => cil('base.agujero.' + i, [x, y, -.2], .2, 3.5, 'oscuro', { sinContorno: true, sinAristas: true })) : []),
];
const tornillos = () => CANOS.flatMap(([x, y], i) => [
  cil(`A.${i}.cana`, [x, y, -.5], 16, 3, 'zinc', { seg: 14 }),
  cil(`A.${i}.cabeza`, [x, y, -.7], .4, 5.5, 'zinc', { seg: 20 }),
]);
const mesa = () => [...tapa(), ...canos(), ...base(), ...tornillos()];
const bocaAbajo = (ps) => ps.map((p) => ({ ...p, pos: [-p.pos[0], p.pos[1], H - p.pos[2]], eje: (p.eje || [0, 0, 1]).map((v, i) => (i === 1 ? v : -v)), rotacion: p.tipo === 'perfil' ? [0, 180, 0] : p.rotacion }));
const voltear = (ps) => bocaAbajo(ps).map((p) => (p.tipo === 'perfil' ? { ...p, eje: undefined, pos: [p.pos[0], p.pos[1], p.pos[2]] } : p));

const manta = (w = 760, d = 560) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', pos: [0, 0, 0] });

const ordenPiezas = () => [
  { ...manta(1260, 760), pos: [30, 0, 0] },
  placa('pz.1', [-280, 130, 0], 500, 300, TAPA, 85, { huecos: [{ x: 205, y: 0, w: 26, d: 95, r: 13 }] }),
  { id: 'rotulo.1', tipo: 'texto', txt: '1 · TAPA', pos: [-280, 330, .3], alto: 40 },
  placa('pz.3', [-290, -200, 0], 370, 250, BASE, 60),
  { id: 'rotulo.3', tipo: 'texto', txt: '3 · BASE', pos: [-290, -360, .3], alto: 40 },
  ...[0, 1].map((k) => cil('pz.2.' + k, [70, 150 - k * 70, R_CANO], H - TAPA - BASE, R_CANO, 'chapa', { eje: [1, 0, 0] })),
  { id: 'rotulo.2', tipo: 'texto', txt: '2 · CAÑOS ×2', pos: [390, 20, .3], alto: 36 },
  { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 160, d: 100, r: 22, pos: [380, -230, 0], z0: 0, z1: 18, mat: 'bolsa' },
  { id: 'rotulo.A', tipo: 'texto', txt: 'A · TORNILLOS ×2', pos: [380, -320, .3], alto: 28 },
];

const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const paso = (num, id, titulo, a, piezas, extra = {}) => ({
  num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de 4` },
  vista: { yaw: -28, pitch: 30 }, piezas, mueven: [], resaltar: [], encuadrarTodo: true, ...extra,
});

export default {
  id: 'ch37', version: 1, pasosManual: 4,
  marca: {
    nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022',
    tienda: 'https://dege.com.ar/productos/mesa-de-arrime-xl/', instagram: 'https://instagram.com/dege.muebles',
    confeti: ['#77773F', '#ffffff', '#e9e4d6', '#1d1d1b'],
  },
  materiales: {
    senal: { color: '#ff6a3d' }, chapa: { color: '#77773F' }, zinc: { color: '#c9ced3' }, negro: { color: '#242424' }, oscuro: { color: '#111111' },
    carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 },
  },
  inventario: [{ id: 'A', n: 2, label: 'A · Tornillos Phillips' }],
  textos: {
    titulo: 'Armá tu Mesa de arrime XL CH37 · DEGË Muebles', cabecera: 'Mesa de arrime XL',
    ladoTitulo: 'Tu mesa de arrime XL, <em>paso a paso</em>',
    ladoCuerpo: 'Una tapa de 50 × 30 cm, dos caños y una base que se mete debajo del sillón. Seguí los pasos del manual de fábrica y girá el modelo para ver cada unión.',
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá la mesa para girarla', girar: 'Arrastrá para girar la mesa',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>mesa de arrime XL</em>, paso a paso',
    datos: [['layers', '4 piezas', '+ 2 tornillos'], ['steps', '4 pasos', 'en 5 minutos'], ['box', '50 × 30 × 66', 'cm · tapa y alto']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: 'Tu mesa XL,<br><em>en 5 minutos</em>', momCuerpo: 'Se arma boca abajo. Vas a necesitar un destornillador Phillips (no viene en la caja).',
    momTips: [
      ['space', 'Protegé la tapa', 'Trabajá sobre una manta o el cartón de la caja'],
      ['kids', 'Contá las piezas', '1 tapa · 2 caños · 1 base · 2 tornillos'],
      ['time', 'Destornillador a mano', 'Un Phillips mediano: no viene incluido'],
      ['music', 'Y poné música', 'La que te acompañe mientras armás'],
    ],
    momCta: 'Empezar a armar',
    finTitulo: '¡Tu mesa XL <em>está lista</em>! 🎉',
    finCuerpo: 'Metela debajo del sillón o al lado de la cama: la tapa queda arriba, a mano. La manija te sirve para llevarla.',
    finTip: 'Si en algún momento la notás floja, enroscá de nuevo los caños en la tapa y repasá los dos tornillos de la base.',
    waTexto: '¡Hola DEGË! Estoy armando la Mesa de arrime XL CH37 y tengo una duda 😊',
    pie: 'DEGË Muebles · Muebles de chapa y caño, de Rosario a todo el país.',
    rvEjemplos: ['La armé en 5 minutos 🙌', 'Re claro el paso a paso', 'Entra la notebook perfecto', 'Firme y hermosa'],
  },
  cotas: { w: 50, d: 30, h: 66, unidad: 'cm', caja: [-250, 250, -150, 150, 0, H], lineas: [
    [[250, 150, H], [-250, 150, H], [0, 120, 0], 50],
    [[-250, 150, H], [-250, -150, H], [-110, 0, 0], 30],
    [[202, 0, 0], [202, 0, H], [110, 0, 0], 66],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -30, pitch: 16 }, piezas: mesa(), mueven: [], encuadrarTodo: false },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: la tapa, la base, 2 caños y 2 tornillos.', 'El número es el que vas a ver en cada paso.'], b: [], tip: '¿Falta algo o llegó una pieza golpeada? Sacale una foto y escribinos antes de seguir.' },
      usa: ['1 · Tapa', '2 · Caños ×2', '3 · Base', 'A · Tornillos ×2'],
      elegir: [
        { m: ['pz.1'], t: 'Es la chapa grande de 50 × 30 cm, con la manija calada en una punta.' },
        { m: ['pz.2'], t: 'Son los 2 caños iguales: van juntos, uno al lado del otro.' },
        { m: ['pz.3'], t: 'Es la chapa gruesa de 37 × 25 cm, con 2 agujeros y 4 topes de goma.' },
      ],
      cuenta: { fijo: '4 piezas + 2 tornillos' }, vista: { yaw: -6, pitch: 62 },
      piezas: ordenPiezas(), resaltar: ['pz.1'], mueven: [mover('pz.1', 120)],
    },
    paso(1, 'canos', 'Enroscá los caños en la tapa', [
      'Apoyá la tapa boca abajo, sobre una manta.',
      'Enroscá cada caño en un saliente de la tapa, a mano.',
    ], [manta(), ...voltear([...tapa(), ...canos()]),
      ...CANOS.map(([x, y], i) => ({ id: 'giro.' + i, tipo: 'giro', pos: [-x, y, 420 + i * 60], r0: 19, r1: 28, desde: -150, hasta: 128, mat: 'senal', sinContorno: true }))], {
      usa: ['1 · Tapa', '2 · Caños ×2'], titular: 'Ajustalos fuerte', cuenta: { de: 'cano.', n: 2, txt: 'Caño', fin: '2 caños en su lugar' },
      resaltar: ['cano'], unir: ['tapa'],
      subs: { a: ['Apoyá la tapa boca abajo, sobre una manta.', 'Enroscá cada caño en un saliente de la tapa, a mano.'], b: [], tip: 'Ajustalos fuerte: así la tapa y la base quedan bien alineadas.' },
      mueven: [0, 1].map((i) => mover('cano.' + i, 120, [0, 0, 1], i * .4)),
    }),
    paso(2, 'base', 'Apoyá la base', [
      'Apoyá la base sobre los caños, haciendo coincidir sus dos agujeros.',
      'Los topes de goma quedan hacia arriba.',
    ], [manta(), ...voltear([...tapa(), ...canos(), ...base(true)])], {
      usa: ['3 · Base'], titular: '¡Los topes, hacia arriba!', alerta: true, resaltar: ['base'], unir: ['cano'],
      subs: { a: ['Apoyá la base sobre los caños, haciendo coincidir sus dos agujeros.', 'Los topes de goma quedan hacia arriba.'], b: [], tip: 'Los topes son los que después tocan el piso: si quedan para abajo, la base está al revés.' },
      mueven: [mover('base', 140, [0, 0, 1], 0)], vista: { yaw: -28, pitch: 40 },
    }),
    paso(3, 'tornillos', 'Atornillá la base', [
      'Con un destornillador Phillips, colocá los dos tornillos A.',
    ], [manta(), ...voltear(mesa())], {
      usa: ['A · Tornillos ×2', 'Destornillador Phillips (no incluido)'], hw: { A: 2 }, titular: 'Uní la base con los caños',
      resaltar: ['A'], unir: ['base', 'cano'],
      subs: { a: ['Con un destornillador Phillips, colocá los dos tornillos A.'], b: ['Ajustalos hasta que la base quede firme contra los caños.'], tip: 'Los tornillos quedan al ras de la base: no sobresalen del lado del piso.' },
      mueven: [mover('A', 60, [0, 0, 1], 0)],
      fases: {
        pieza: ['base'], hw: ['A.0.cana', 'A.0.cabeza', 'A.1.cana', 'A.1.cabeza'], retener: ['A'], ocultarEnA: ['A.0.cana', 'A.0.cabeza', 'A.1.cana', 'A.1.cabeza'],
        ref: 'A.1', vistaB: { yaw: -28, pitch: 50 }, titularB: 'Con el destornillador',
        herramienta: { tipo: 'phillips', pos: [-CANOS[1][0], CANOS[1][1], H + .7], eje: [0, 0, 1] },
      },
      vista: { yaw: -28, pitch: 40 },
    }),
    paso(4, 'revisar', 'Revisá y dala vuelta', [
      'Verificá que los caños y los tornillos estén bien ajustados.',
      'Dala vuelta y apoyala en el piso.',
    ], mesa(), {
      titular: 'Listo, a usarla', sinFantasma: true, vista: { yaw: -30, pitch: 16 }, encuadrarTodo: false,
      subs: { a: ['Verificá que los caños y los tornillos estén bien ajustados.', 'Dala vuelta y apoyala en el piso.'], b: [], tip: 'En el manual de papel este paso figura como "5": no falta ninguno, el 4 no existe.' },
      mueven: [mover('*', 40, [0, 0, 1], 0)],
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -32, pitch: 14 }, piezas: mesa(), mueven: [] },
  ],
};
