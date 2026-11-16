
const BASE = 6, ESTANTE = 2, R = 14.5;          // base 300 × 300 × 6, estante de 2 mm, caño Ø29
const L_CANO = 270, L_TOPE = 90;
const zCano = (k) => BASE + k * (L_CANO + ESTANTE);       // inicio del caño k (0..4)
const zEstante = (k) => zCano(k) + L_CANO;               // estante k, encima del caño k
const Z_TOPE = zCano(5), ALTO = Z_TOPE + L_TOPE;          // ≈ 1456
const GIROS = [0, -90, 180, 90, 0];

const cil = (id, pos, largo, r, mat = 'chapa', extra = {}) => ({ id, tipo: 'cilindro', pos, s0: 0, s1: largo, r, mat, seg: 32, ...extra });

function contornoEstante() {
  const W = 260, D = 195, r = 34, y0 = -8, RE = 23, pts = [];
  const arco = (cx, cy, rr, a0, a1, n = 10) => { for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); } };
  const a0 = Math.atan2(y0, -Math.sqrt(RE * RE - y0 * y0)) + 2 * Math.PI, a1 = Math.atan2(y0, Math.sqrt(RE * RE - y0 * y0)) + 2 * Math.PI;
  arco(0, 0, RE, a0, a1, 20);                                            // oreja alrededor del caño
  arco(W / 2 - r, y0 + r, r, -Math.PI / 2, 0);                          // esquina adelante-derecha (local)
  arco(W / 2 - r, y0 + D - r, r, 0, Math.PI / 2);
  arco(-W / 2 + r, y0 + D - r, r, Math.PI / 2, Math.PI);
  arco(-W / 2 + r, y0 + r, r, Math.PI, 1.5 * Math.PI);
  return pts;
}
const CONTORNO = contornoEstante();
const estante = (id, k, giro = GIROS[k]) => ({
  id, tipo: 'perfil', puntos: CONTORNO, pos: [0, 0, zEstante(k)], z0: 0, z1: ESTANTE, mat: 'chapa', rot: giro,
  huecos: [{ x: 0, y: 0, w: 8.5, d: 8.5, r: 4.25 }],
});
const base = () => [{ id: 'base', tipo: 'perfil', forma: 'redondeada', w: 300, d: 300, r: 55, pos: [0, 0, 0], z0: 0, z1: BASE, mat: 'chapa' }];
const cano = (id, k) => [cil(id, [0, 0, zCano(k)], L_CANO, R), ...(k > 0 ? [cil(id + '.aro', [0, 0, zCano(k)], 3, R + .8, 'goma')] : [])];
const tope = () => [cil('tope', [0, 0, Z_TOPE], L_TOPE, R), cil('tope.aro', [0, 0, Z_TOPE], 3, R + .8, 'goma'), cil('tope.tapa', [0, 0, ALTO - .5], .6, R - 3, 'oscuro', { sinContorno: true, sinAristas: true })];
const esparrago = (k) => [cil('05.' + k, [0, 0, zEstante(k) - 25], 52, 4, 'zinc', { seg: 14 })];
const tornillo06 = () => [
  cil('06.cana', [0, 0, 0], 16, 3, 'zinc', { seg: 14 }),
  cil('06.cabeza', [0, 0, -.2], .4, 5.5, 'zinc', { seg: 20 }),
];

function torre(n) {
  const ps = [...base(), ...tornillo06(), ...cano('cano.0', 0)];
  for (let k = 0; k < 5; k++) {
    if (n >= 2 + 2 * k) ps.push(...esparrago(k), estante('estante.' + k, k));
    if (n >= 3 + 2 * k) ps.push(...(k < 4 ? cano('cano.' + (k + 1), k + 1) : tope()));
  }
  return ps;
}
const completa = () => torre(11);

const manta = (w = 700, d = 600, extra = {}) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', ...extra });

const acostado = (id, x, y, largo) => cil(id, [x, y, R], largo, R, 'chapa', { eje: [1, 0, 0] });
const ordenPiezas = () => [
  manta(1150, 880, { pos: [0, -10, 0] }),
  { id: 'pz.03', tipo: 'perfil', forma: 'redondeada', w: 300, d: 300, r: 55, pos: [-340, 180, 0], z0: 0, z1: BASE, mat: 'chapa' },
  { id: 'rotulo.03', tipo: 'texto', txt: '4 · BASE', pos: [-340, 365, .3], alto: 34 },
  ...[0, 1, 2, 3, 4].map((k) => ({ id: 'pz.01.' + k, tipo: 'perfil', puntos: CONTORNO, pos: [-340, -250, k * (ESTANTE + .6)], z0: 0, z1: ESTANTE, mat: 'chapa', rot: 0 })),
  { id: 'rotulo.01', tipo: 'texto', txt: '2 · ESTANTES ×5', pos: [-340, -340, .3], alto: 30 },
  ...[0, 1, 2, 3, 4].map((k) => acostado('pz.02.' + k, 40, 260 - k * 60, L_CANO)),
  { id: 'rotulo.02', tipo: 'texto', txt: '3 · CAÑOS GRANDES ×5', pos: [175, 340, .3], alto: 30 },
  acostado('pz.04', 40, -110, L_TOPE),
  { id: 'rotulo.04', tipo: 'texto', txt: '1 · CAÑO CHICO', pos: [85, -165, .3], alto: 26 },
  { id: 'bolsa', tipo: 'perfil', forma: 'redondeada', w: 170, d: 110, r: 22, pos: [380, -260, 0], z0: 0, z1: 20, mat: 'bolsa' },
  { id: 'rotulo.h', tipo: 'texto', txt: 'HERRAJES', pos: [380, -345, .3], alto: 26 },
];
const herrajesPiezas = () => [
  manta(420, 300, { lineas: 0 }),
  ...[0, 1, 2, 3, 4].map((k) => cil('h.05.' + k, [-150, -80 + k * 40, 4], 52, 4, 'zinc', { eje: [1, 0, 0], seg: 14 })),
  cil('h.06.cana', [100, 0, 0], 16, 3, 'zinc', { seg: 14 }),
  cil('h.06.cabeza', [100, 0, 16], 3, 5.5, 'zinc', { seg: 20 }),
  { id: 'rotulo.05', tipo: 'texto', txt: 'A', pos: [-125, 125, .3], alto: 30 },
  { id: 'rotulo.06', tipo: 'texto', txt: 'B', pos: [100, 125, .3], alto: 30 },
];

const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
const paso = (num, id, titulo, a, piezas, extra = {}) => ({
  num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de 7` },
  vista: { yaw: -28, pitch: 22 }, piezas, mueven: [], resaltar: [], encuadrarTodo: false, ...extra,
});
const ORDINAL = ['primer', 'segundo', 'tercer', 'cuarto', 'quinto'];
const TIP_ESP = 'El manual de papel dice "coincidir la perforación con el regatón": es el espárrago A, la varilla roscada.';
const pasoEstante = (k, num, titulo) => paso(num, 'estante-' + (k + 1), titulo || `Espárrago y ${ORDINAL[k]} estante`, [
  'Enroscá un espárrago A en la punta de arriba del caño, hasta la mitad.',
  'Pasá el estante 2 por el espárrago, con la oreja apoyada sobre el caño.',
], torre(2 + 2 * k), {
  usa: ['A · Espárrago', '2 · Estante'], hw: { A: 1 }, titular: k === 0 ? 'La oreja, sobre el caño' : 'Elegí hacia dónde mira',
  cuenta: { fijo: `Estante ${k + 1} de 5` }, resaltar: ['05.' + k, 'estante.' + k], unir: [k === 0 ? 'cano.0' : 'cano.' + k],
  mueven: [mover('05.' + k, 70, [0, 0, 1], 0), mover('estante.' + k, 140, [0, 0, 1], .5)],
  zoom: .55, sinFantasma: k > 1,
  subs: { a: ['Enroscá un espárrago A en la punta de arriba del caño, hasta la mitad.', 'Pasá el estante 2 por el espárrago, con la oreja apoyada sobre el caño.'], b: [], tip: k === 0 ? 'Podés girar cada estante hacia donde quieras: queda fijo cuando enroscás el caño de arriba. ' + TIP_ESP : k === 4 ? TIP_ESP : '' },
});
const pasoCano = (k, num) => paso(num, 'cano-' + (k + 2), k < 4 ? `Enroscá el ${ORDINAL[k + 1]} caño grande` : 'El caño chico', [
  k < 4 ? 'Enroscá un caño grande 3 sobre el espárrago, a mano.' : 'Enroscá el caño chico 1 sobre el último espárrago.',
  'Girá hasta que el estante quede apretado y firme.',
], torre(3 + 2 * k), {
  usa: [k < 4 ? '3 · Caño grande' : '1 · Caño chico'], titular: 'A mano, hasta el tope', cuenta: { fijo: `Caño ${k + 2} de 6` },
  resaltar: [k < 4 ? 'cano.' + (k + 1) : 'tope'], unir: ['estante.' + k], zoom: .45, sinFantasma: k > 1,
  mueven: [mover(k < 4 ? 'cano.' + (k + 1) : 'tope', 160, [0, 0, 1], 0)],
});
const pasoRepetir = (k) => paso(4, 'repetir-' + k, `Repetí: estante ${k + 1} y caño`, [
  'Igual que en los pasos 2 y 3: espárrago A, estante 2 y caño grande 3.',
], torre(3 + 2 * k), {
  usa: ['A · Espárrago', '2 · Estante', '3 · Caño grande'], hw: { A: 1 }, titular: 'Igual que los pasos 2 y 3',
  cuenta: { fijo: `Estante ${k + 1} de 5` }, resaltar: ['05.' + k, 'estante.' + k, 'cano.' + (k + 1)], unir: ['cano.' + k],
  mueven: [mover('05.' + k, 70, [0, 0, 1], 0), mover('estante.' + k, 140, [0, 0, 1], .4), mover('cano.' + (k + 1), 160, [0, 0, 1], .9)],
  zoom: .45, sinFantasma: true,
});

export default {
  id: 'ch21', version: 1, pasosManual: 7,
  marca: {
    nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022',
    tienda: 'https://dege.com.ar/productos/estanteria-totem-ch21-wwvhf/', instagram: 'https://instagram.com/dege.muebles',
    confeti: ['#77773F', '#ffffff', '#e9e4d6', '#1d1d1b'],
  },
  materiales: {
    chapa: { color: '#77773F' }, zinc: { color: '#c9ced3' }, goma: { color: '#1f1f1f' }, oscuro: { color: '#232323' },
    carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 },
  },
  inventario: [{ id: 'A', n: 5, label: 'A · Espárragos' }, { id: 'B', n: 1, label: 'B · Tornillo de la base' }],
  textos: {
    titulo: 'Armá tu Estantería Totem CH21 · DEGË Muebles', cabecera: 'Estantería Totem CH21',
    ladoTitulo: 'Tu estantería Totem, <em>paso a paso</em>',
    ladoCuerpo: 'Una base, seis caños y cinco estantes que se enroscan uno sobre otro. Seguí los pasos del manual de fábrica y girá el modelo para ver cada unión.',
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá la estantería para girarla', girar: 'Arrastrá para girar la estantería',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>estantería Totem</em>, paso a paso',
    datos: [['layers', '12 piezas', '+ 6 herrajes'], ['person', '1 persona', 'alcanza'], ['box', '30 × 30 × 145', 'cm · base y alto']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: 'Tu Totem,<br><em>caño sobre caño</em>', momCuerpo: 'Todo se enrosca a mano. Solo vas a usar un destornillador para el tornillo de la base.',
    momTips: [
      ['space', 'Hacé lugar', 'La vas a armar parada: dejá espacio arriba'],
      ['kids', 'Separá los caños', '5 caños de 27 cm y 1 corto de 9 cm'],
      ['time', 'Sin apuro', 'Es el mismo paso repetido cinco veces'],
      ['music', 'Y poné música', 'La que te acompañe mientras armás'],
    ],
    momCta: 'Empezar a armar',
    finTitulo: '¡Tu Totem <em>está lista</em>! 🎉',
    finCuerpo: 'Revisá que todos los caños estén enroscados hasta el tope. Ahora sí: libros, plantas y velas, cada uno en su estante.',
    finTip: 'Cargá más peso en los estantes de abajo. Si un estante gira, aflojá el caño de arriba, acomodalo y volvé a enroscar.',
    waTexto: '¡Hola DEGË! Estoy armando la Estantería Totem CH21 y tengo una duda 😊',
    pie: 'DEGË Muebles · Muebles de chapa y caño, de Rosario a todo el país.',
    rvEjemplos: ['La armé en un rato 🙌', 'Re claro el paso a paso', 'Ocupa nada y entra todo', 'Firme y hermosa'],
  },
  cotas: { w: 30, d: 30, h: 145, unidad: 'cm', caja: [-150, 150, -150, 150, 0, ALTO], lineas: [
    [[150, 150, 0], [-150, 150, 0], [0, 110, 0], 30],
    [[-150, 150, 0], [-150, -150, 0], [-110, 0, 0], 30],
    [[0, 0, 0], [0, 0, ALTO], [260, 0, 0], 145],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -26, pitch: 14 }, piezas: completa(), mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: la base, 5 estantes, 5 caños largos y 1 corto.', 'El número es el que vas a ver en cada paso.'], b: [], tip: '¿Falta algo o llegó una pieza golpeada? Sacale una foto y escribinos antes de seguir.' },
      usa: ['4 · Base', '2 · Estantes ×5', '3 · Caños grandes ×5', '1 · Caño chico'],
      elegir: [
        { m: ['pz.03'], t: 'Es la base 4, cuadrada y gruesa, de 30 × 30 cm: va en el piso.' },
        { m: ['pz.01'], t: 'Son los 5 estantes 2, de 26 × 19,5 cm, con una oreja perforada en un lado.' },
        { m: ['pz.02'], t: 'Son los 5 caños grandes 3, iguales: van entre estante y estante.' },
        { m: ['pz.04'], t: 'Es el caño chico 1, de 9 cm: va arriba de todo.' },
      ],
      cuenta: { fijo: '12 piezas · 4 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 62 },
      piezas: ordenPiezas(), resaltar: ['pz.03'], mueven: [mover('pz.03', 120)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de armar',
      subs: { a: ['Son 5 espárragos A y 1 tornillo B.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'El espárrago es la varilla roscada sin cabeza: une un caño con el siguiente, a través del estante.' },
      usa: ['Destornillador Phillips (no incluido)'], check: [[5, 'A · Espárragos'], [1, 'B · Tornillo']],
      cuenta: { fijo: '6 herrajes' }, encuadrarTodo: true, vista: { yaw: -8, pitch: 55 },
      piezas: herrajesPiezas(), resaltar: ['h.06'], mueven: [mover(['h.06.cana', 'h.06.cabeza'], 60)],
    },
    paso(1, 'base', 'La base y el primer caño', [
      'Apoyá un caño grande 3 sobre el agujero del centro de la base 4.',
      'Desde abajo de la base, fijalo con el tornillo B y el destornillador.',
    ], torre(1), {
      usa: ['4 · Base', '3 · Caño grande', 'B · Tornillo', 'Destornillador Phillips'], hw: { B: 1 }, titular: 'El tornillo, desde abajo',
      resaltar: ['cano.0', '06'], unir: ['base'],
      subs: { a: ['Apoyá un caño grande 3 sobre el agujero del centro de la base 4.', 'Desde abajo de la base, fijalo con el tornillo B y el destornillador.'], b: [], tip: 'Inclinala con cuidado o apoyá la base en el borde de la mesa para llegar al tornillo.' },
      mueven: [mover('cano.0', 160, [0, 0, 1], 0), mover('06', 60, [0, 0, -1], .6)],
      vista: { yaw: -28, pitch: -26 },
    }),
    pasoEstante(0, 2), pasoCano(0, 3),
    pasoRepetir(1), pasoRepetir(2), pasoRepetir(3),
    pasoEstante(4, 5, 'El último estante'), pasoCano(4, 6),
    paso(7, 'ajustar', 'Revisá que esté firme', [
      'Repasá cada caño: enroscalo hasta que el estante de abajo no gire.',
      'Revisá que la estantería quede derecha y firme.',
    ], completa(), {
      usa: ['A mano'], titular: 'Que ningún estante gire', sinFantasma: true, resaltar: ['estante'],
      mueven: [mover('estante', 10, [0, 0, 1], 0)], vista: { yaw: -26, pitch: 14 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -26, pitch: 12 }, piezas: completa(), mueven: [] },
  ],
};
