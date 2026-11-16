
const E = 170;              // media medida exterior en X (34 cm)
const ALTO = 340;           // 34 cm
const PROF = 310;           // 31 cm de profundidad
const T = 2;                // espesor de la esquina
const R = 8;                // caño Ø16 (medido en la foto negra: 17 px contra 368 px de ancho)
const P = 31;               // paso entre caños de una misma cara
const HOLGURA = 1;
const C = 2 * R + T + HOLGURA;                          // 19: lado del hueco de la arista
const XE = E - C;                                       // 151: puntas de los caños del techo/piso (ala parada)
const L_CANO = 2 * XE;                                  // 302: los 40 caños son iguales (también los del costado)
const X_COST = E - R;                                   // 162: eje de los caños del costado
const Z_TECHO = ALTO - R, Z_PISO = R;                   // ejes de los caños del techo y del piso
const ZH = ALTO - C;                                    // 321: cara de abajo del ala que sale hacia afuera (arriba)
const YA = Array.from({ length: 10 }, (_, k) => -PROF / 2 + R + P * k);  // techo y piso
const YB = YA.map((y) => y + P / 2);                                      // costados (medio paso corridos)
const LADOS = [['izq', 1], ['der', -1]];  // nombre visto desde adelante (con la cámara de frente, +X queda a la izquierda)
const NIVELES = [['arriba', 1], ['abajo', -1]];
const zN = (sz, z) => (sz > 0 ? z : ALTO - z); // espeja alturas para la esquina/caño de abajo

const cil = (id, pos, largo, r, mat = 'chapa', extra = {}) => ({ id, tipo: 'cilindro', pos, s0: 0, s1: largo, r, mat, seg: 24, ...extra });

const canosH = (nivel, sz) => YA.map((y, k) => cil(`c.${nivel}.${k}`, [-XE, y, sz > 0 ? Z_TECHO : Z_PISO], L_CANO, R, 'chapa', { eje: [1, 0, 0] }));
const canosV = (lado, sx) => YB.map((y, k) => cil(`c.${lado}.${k}`, [sx * X_COST, y, C], L_CANO, R));

const F = 6, RT = 7.5, BC = R + T + HOLGURA;   // ancho del lomo de cada ala, radio de la lengüeta, distancia del lomo al eje del caño
function alaContorno(centros) {
  const pts = [[-PROF / 2, 0], [PROF / 2, 0], [PROF / 2, F]];
  for (const a of [...centros].sort((m, n) => n - m)) {
    pts.push([a + RT, F]);
    for (let i = 0; i <= 14; i++) { const t = (Math.PI * i) / 14; pts.push([a + RT * Math.cos(t), BC + RT * Math.sin(t)]); }
    pts.push([a - RT, F]);
  }
  pts.push([-PROF / 2, F]);
  return pts;
}
const HUECO = 4.2;
function esquina(nivel, sz, lado, sx) {
  const id = `e.${nivel}.${lado}`;
  const v = alaContorno(YA).map(([a, b]) => [-zN(sz, ZH + b), a]);
  const xV = sx > 0 ? XE : -XE - T;
  const h = alaContorno(YB).map(([a, b]) => [sx * (XE + b), a]);
  const zH = sz > 0 ? ZH : ALTO - ZH - T;
  return [
    { id: id + '.v', tipo: 'perfil', puntos: v, pos: [xV, 0, 0], eje: [1, 0, 0], z0: 0, z1: T, mat: 'chapa',
      huecos: YA.map((y) => ({ x: -zN(sz, ZH + BC), y, w: HUECO, d: HUECO, r: HUECO / 2 })) },
    { id: id + '.h', tipo: 'perfil', puntos: sx > 0 ? h : [...h].reverse(), pos: [0, 0, zH], z0: 0, z1: T, mat: 'chapa',
      huecos: YB.map((y) => ({ x: sx * (XE + BC), y, w: HUECO, d: HUECO, r: HUECO / 2 })) },
  ];
}

const tornillo = (id, pos, haciaAfuera) => [
  cil(id + '.cabeza', pos, 2.4, 4, 'zinc', { eje: haciaAfuera, seg: 14 }),
  cil(id + '.cana', pos, 14, 2, 'zinc', { eje: haciaAfuera.map((n) => -n), seg: 8, sinContorno: true, sinAristas: true }),
];
const tornillosH = (nivel, sz, lado, sx) => YA.map((y, k) => tornillo(`A.${nivel}.${lado}.${k}`, [sx * (XE + T), y, sz > 0 ? Z_TECHO : Z_PISO], [sx, 0, 0])).flat();
const tornillosV = (lado, sx, nivel, sz) => YB.map((y, k) => tornillo(`A.${lado}.${nivel}.${k}`, [sx * X_COST, y, sz > 0 ? ZH + T : ALTO - ZH - T], [0, 0, sz])).flat();

const paso1 = () => [...canosH('arriba', 1), ...esquina('arriba', 1, 'der', -1), ...tornillosH('arriba', 1, 'der', -1)];
const paso2 = () => [...paso1(), ...canosV('der', -1), ...tornillosV('der', -1, 'arriba', 1)];
const paso3 = () => [...paso2(), ...esquina('arriba', 1, 'izq', 1), ...tornillosH('arriba', 1, 'izq', 1), ...canosV('izq', 1), ...tornillosV('izq', 1, 'arriba', 1)];
const paso4 = () => [...paso3(), ...LADOS.flatMap(([l, sx]) => [...esquina('abajo', -1, l, sx), ...tornillosV(l, sx, 'abajo', -1)])];
const cubo = () => [...paso4(), ...canosH('abajo', -1), ...LADOS.flatMap(([l, sx]) => tornillosH('abajo', -1, l, sx))];

const manta = (w = 760, d = 640, extra = {}) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', ...extra });

function ordenPiezas() {
  const grupo = (g) => Array.from({ length: 10 }, (_, k) => cil(`pz.1.${g}.${k}`, [g % 2 ? -100 : -460, -250 + Math.floor(g / 2) * 270 + k * 24, R], L_CANO, R, 'chapa', { eje: [1, 0, 0] }));
  const esq = (k) => esquina('arriba', 1, 'izq', 1).map((p) => ({
    ...p, id: p.id.replace('e.arriba.izq', 'pz.2.' + k),
    pos: [p.pos[0] - E + 330 + k * 42, p.pos[1] - 110, p.pos[2] - ZH],
  }));
  return [
    manta(1060, 860, { pos: [60, 10, 0] }),
    ...[0, 1, 2, 3].flatMap((g) => grupo(g)),
    { id: 'rotulo.1', tipo: 'texto', txt: '1 · CAÑOS ×40', pos: [-110, 350, .3], alto: 46 },
    ...[0, 1, 2, 3].flatMap(esq),
    { id: 'rotulo.2', tipo: 'texto', txt: '2 · ESQUINAS ×4', pos: [390, 90, .3], alto: 40 },
    { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 200, d: 130, r: 24, pos: [390, 250, 0], z0: 0, z1: 22, mat: 'bolsa' },
    { id: 'rotulo.A', tipo: 'texto', txt: 'A · TORNILLOS ×80', pos: [390, 360, .3], alto: 36 },
  ];
}
const herrajesPiezas = () => [
  manta(520, 340, { lineas: 0 }),
  ...Array.from({ length: 20 }, (_, i) => tornillo(`h.A.${i}`, [-150 + (i % 10) * 34, -40 + Math.floor(i / 10) * 60, 14], [0, 0, 1])).flat(),
  { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 150, d: 90, r: 20, pos: [150, 80, 0], z0: 0, z1: 20, mat: 'bolsa' },
  { id: 'rotulo.A', tipo: 'texto', txt: 'A ×80', pos: [-20, 120, .3], alto: 40 },
];

const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const paso = (num, id, titulo, a, piezas, extra = {}) => ({
  num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de 6` },
  vista: { yaw: -29, pitch: 34 }, piezas, mueven: [], resaltar: [], encuadrarTodo: false, ...extra,
});
const TIP_TOPE = 'No empujes el tornillo hacia adentro del caño: apoyá el caño en la esquina y recién ahí enroscá. Si el tope se hunde, el caño no se puede usar.';

export default {
  id: 'ch32', version: 1, pasosManual: 6,
  marca: {
    nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022',
    tienda: 'https://dege.com.ar/productos/ch32cubo/', instagram: 'https://instagram.com/dege.muebles',
    confeti: ['#3a3a3a', '#ffffff', '#e9e4d6', '#c9ced3'],
  },
  materiales: {
    chapa: { color: '#454545' }, zinc: { color: '#aeb3b8' }, carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 },
  },
  inventario: [{ id: 'A', n: 80, label: 'A · Tornillos' }],
  textos: {
    titulo: 'Armá tu Cubo modular CH32 · DEGË Muebles', cabecera: 'Cubo modular CH32',
    ladoTitulo: 'Tu cubo modular, <em>paso a paso</em>',
    ladoCuerpo: 'Cuatro caras de diez caños unidas por cuatro esquinas. Seguí los 6 pasos del manual de fábrica y girá el modelo para ver cómo se intercalan los caños en cada esquina.',
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá el cubo para girarlo', girar: 'Arrastrá para girar el cubo',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>cubo modular</em>, paso a paso',
    datos: [['layers', '44 piezas', '40 caños y 4 esquinas'], ['screw', '80 tornillos', 'con destornillador Phillips'], ['box', '34 × 34 × 31', 'cm · ancho, alto y fondo']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: 'Tu cubo,<br><em>caño por caño</em>', momCuerpo: 'Son muchos tornillos iguales: con un destornillador Phillips y paciencia, sale perfecto.',
    momTips: [
      ['space', 'Hacé lugar', 'Una manta o el cartón de la caja en el piso'],
      ['kids', 'Tornillos a mano', 'Son 80: dejalos en un platito'],
      ['time', 'Sin apretar de más', 'Primero todos flojos, al final ajustás'],
      ['music', 'Y poné música', 'La que te acompañe mientras armás'],
    ],
    momCta: 'Empezar a armar',
    finTitulo: '¡Tu cubo <em>está listo</em>! 🎉',
    finCuerpo: 'Ya tenés tu cubo armado. Usalo solo o apilá varios para armar una torre, un rack o una mesa de luz.',
    finTip: 'Si al apoyarlo baila un poco, aflojá los tornillos de una esquina, acomodá el cubo en el piso y volvé a ajustar.',
    waTexto: '¡Hola DEGË! Estoy armando el Cubo modular CH32 y tengo una duda 😊',
    pie: 'DEGË Muebles · Muebles de chapa y caño, de Rosario a todo el país.',
    rvEjemplos: ['Quedó re prolijo 🙌', 'Re claro el paso a paso', 'Ya voy por el segundo cubo', 'Firme y liviano'],
  },
  cotas: { w: 34, d: 31, h: 34, unidad: 'cm', caja: [-E, E, -PROF / 2, PROF / 2, 0, ALTO], lineas: [
    [[E, PROF / 2, 0], [-E, PROF / 2, 0], [0, 90, 0], 34],
    [[-E, PROF / 2, 0], [-E, -PROF / 2, 0], [-90, 0, 0], 31],
    [[E, PROF / 2, 0], [E, PROF / 2, ALTO], [70, 0, 0], 34],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -29, pitch: 37 }, piezas: cubo(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: 40 caños, 4 esquinas y la bolsa de tornillos.', 'Separá los caños en 4 grupos de 10: uno por cara.'], b: [], tip: '¿Falta algo o llegó una pieza golpeada? Sacale una foto y escribinos antes de seguir.' },
      usa: ['1 · Caños ×40', '2 · Esquinas ×4'],
      elegir: [
        { m: ['pz.1'], t: 'Son los 40 caños iguales: 10 por cara. Cada punta tiene un tope con un agujero para el tornillo.' },
        { m: ['pz.2'], t: 'Son los 4 ángulos en L con lengüetas redondas agujereadas: van en las 4 aristas del cubo, con la L hacia afuera.' },
      ],
      cuenta: { fijo: '44 piezas · 2 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 60 },
      piezas: ordenPiezas(), resaltar: ['pz.2.0'], mueven: [mover('pz.2.0', 120)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los tornillos', titular: 'Contá antes de armar',
      subs: { a: ['En la bolsa vienen 80 tornillos A, todos iguales.', 'Van 2 por caño: uno en cada punta.'], b: [], tip: 'Vas a usar un destornillador Phillips: no viene en la caja.' },
      usa: ['A · Tornillos ×80', 'Destornillador Phillips (no incluido)'], check: [[80, 'A · Tornillos']],
      cuenta: { fijo: '80 tornillos · 2 por caño' }, encuadrarTodo: true, vista: { yaw: -8, pitch: 50 },
      piezas: herrajesPiezas(), resaltar: ['h.A.0'], mueven: [mover('h.A.0', 60)],
    },
    paso(1, 'primera-cara', 'Primera cara y esquina', [
      'Tomá 10 caños y una esquina.',
      'Apoyá cada caño contra su lengüeta de la esquina, con la L hacia afuera.',
    ], [manta(900, 700, { pos: [0, 0, 0] }), ...paso1().map((p) => ({ ...p, pos: [p.pos[0], p.pos[1], p.pos[2] - (Z_TECHO - R)] }))], {
      usa: ['1 · Caños ×10', '2 · Esquina', 'A · Tornillos ×10'], hw: { A: 10 }, titular: 'La L, hacia afuera',
      resaltar: ['e.arriba.der', 'A.arriba.der'], unir: ['c.arriba'], enfoque: .1,
      subs: { a: ['Tomá 10 caños y una esquina.', 'Apoyá cada caño contra su lengüeta de la esquina, con la L hacia afuera.'], b: ['Recién ahí, enroscá un tornillo A en cada caño.', 'Girá sin empujar hacia adentro.'], tip: TIP_TOPE },
      mueven: [mover('e.arriba.der', 140, [-1, 0, 0], 0), mover('A.arriba.der', 70, [-1, 0, 0], 0)],
      fases: {
        pieza: ['e.arriba.der'], hw: ['A.arriba.der'], retener: ['A.arriba.der'], ocultarEnA: ['A.arriba.der'],
        ref: 'A.arriba.der.9', vistaB: { yaw: -62, pitch: 18 }, titularB: 'Enroscá sin empujar',
        herramienta: { tipo: 'phillips', pos: [-(XE + T + 3), YA[9], R], eje: [-1, 0, 0] },
      },
      vista: { yaw: -29, pitch: 37 },
    }),
    paso(2, 'costado', 'Primer costado', [
      'Colocá 10 caños en la misma esquina, apuntando hacia abajo.',
      'Cada uno va debajo de una lengüeta del ala que sale hacia afuera, intercalado con los caños de arriba.',
      'Atornillá cada uno desde arriba con un tornillo A.',
    ], [manta(900, 700), ...paso2()], {
      usa: ['1 · Caños ×10', 'A · Tornillos ×10'], hw: { A: 10 }, titular: 'Hacia abajo, intercalados',
      resaltar: ['c.der', 'A.der.arriba'], unir: ['e.arriba.der'],
      mueven: [mover('c.der', 160, [0, 0, -1], 0), mover('A.der.arriba', 70, [0, 0, 1], .7)],
      vista: { yaw: -29, pitch: 30 },
    }),
    paso(3, 'otro-lado', 'Repetí del otro lado', [
      'Poné la segunda esquina en la otra punta de los caños de arriba y atornillalos.',
      'Colocá 10 caños más hacia abajo y atornillalos: ya tenés tres caras.',
    ], [manta(900, 700), ...paso3()], {
      usa: ['2 · Esquina', '1 · Caños ×10', 'A · Tornillos ×20'], hw: { A: 20 }, titular: 'Tres caras listas',
      resaltar: ['e.arriba.izq', 'A.arriba.izq', 'c.izq', 'A.izq.arriba'], unir: ['c.arriba'],
      mueven: [mover(['e.arriba.izq', 'A.arriba.izq'], 140, [1, 0, 0], 0), mover(['c.izq', 'A.izq.arriba'], 160, [0, 0, -1], .8)],
      vista: { yaw: -29, pitch: 30 },
    }),
    paso(4, 'esquinas-abajo', 'Esquinas de abajo', [
      'Colocá las dos esquinas que quedan en las puntas de abajo de los costados.',
      'Atornillá los 20 caños desde abajo.',
    ], paso4().map((p) => ({ ...p, pos: [p.pos[0], p.pos[1], p.pos[2] + 120] })), {
      usa: ['2 · Esquinas ×2', 'A · Tornillos ×20'], hw: { A: 20 }, titular: 'Desde abajo, uno por caño',
      resaltar: ['e.abajo', 'A.izq.abajo', 'A.der.abajo'], unir: ['c.izq', 'c.der'],
      mueven: [mover('e.abajo', 120, [0, 0, -1], 0), mover(['A.izq.abajo', 'A.der.abajo'], 60, [0, 0, -1], .6)],
      vista: { yaw: -29, pitch: 18 },
    }),
    paso(5, 'piso', 'Cerrá el piso', [
      'Colocá los últimos 10 caños entre las dos esquinas de abajo.',
      'Atornillalos de los dos lados: son 20 tornillos.',
    ], [manta(900, 700), ...cubo()], {
      usa: ['1 · Caños ×10', 'A · Tornillos ×20'], hw: { A: 20 }, titular: 'La cuarta cara',
      resaltar: ['c.abajo', 'A.abajo'], unir: ['e.abajo'],
      mueven: [mover('c.abajo', 180, [0, 1, 0], 0), mover('A.abajo.izq', 60, [1, 0, 0], .8), mover('A.abajo.der', 60, [-1, 0, 0], .8)],
      vista: { yaw: -29, pitch: 37 },
    }),
    paso(6, 'ajustar', 'Ajustá todo', [
      'Con el cubo apoyado en el piso, repasá los 80 tornillos con el destornillador.',
      'Ajustalos bien, sin pasarte de rosca.',
    ], [manta(900, 700), ...cubo()], {
      usa: ['Destornillador Phillips'], titular: 'Ajustá bien todos', sinFantasma: true, resaltar: ['A'],
      mueven: [mover('A', 4, [0, 0, 1], 0)], vista: { yaw: -29, pitch: 37 },
      subs: { a: ['Con el cubo apoyado en el piso, repasá los 80 tornillos con el destornillador.', 'Ajustalos bien, sin pasarte de rosca.'], b: [], tip: 'Si vas a apilar cubos, ajustá cada uno antes de ponerle otro encima.' },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -29, pitch: 35 }, piezas: cubo(), mueven: [] },
  ],
};
