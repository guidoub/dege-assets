// CH38 · manual de fábrica p1–p9, ficha y caja. Ver estudio/ch38-notas.md.
// mm; Z arriba, +Y adelante. Dimensiones internas ilustrativas, no de fabricación.
const H = 640, MIN = 570, MAX = 700, Z_C = 440;
const LADOS = [['izq', -1], ['der', 1]];
const APOYOS = [[-118, -118], [118, -118], [-118, 118], [118, 118]];
const placa = (id, pos, w, d, h, mat = 'metal', extra = {}) => ({ id, tipo: 'perfil', forma: 'redondeada', pos, w, d, r: 0, z0: 0, z1: h, mat, ...extra });
const cilindro = (id, pos, eje, largo, r, mat = 'zinc', extra = {}) => ({ id, tipo: 'cilindro', pos, eje, s0: 0, s1: largo, r, mat, ...extra });
const agujero = (x, y, diametro = 6) => ({ x, y, w: diametro, d: diametro, r: diametro / 2 });
const poligono = (id, pos, puntos, h, mat = 'metal', extra = {}) => placa(id, pos, 1, 1, h, mat, { puntos, ...extra });
// Mariposa del manual (C): cruz de cuatro lóbulos con puntas redondeadas, no una "+" de cantos vivos.
const trebol = (largo = 22, ancho = 7.5, n = 10) => {
  const pts = [];
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2, c = Math.cos(a), s = Math.sin(a), rot = ([x, y]) => [x * c - y * s, x * s + y * c];
    const arco = Array.from({ length: n + 1 }, (_, i) => { const t = -Math.PI / 2 + Math.PI * i / n; return [largo - ancho + ancho * Math.cos(t), ancho * Math.sin(t)]; });
    pts.push(rot([ancho, -ancho]), ...arco.map(rot));
  }
  return pts;
};
const hexagono = r => Array.from({ length: 6 }, (_, i) => [r * Math.cos(i * Math.PI / 3), r * Math.sin(i * Math.PI / 3)]);
const mover = (p, recorrido = 80, dir = [0, 0, 1], demora = 0, extra = {}) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora, ...extra });
const cruz = (id, pos, eje, tam = 7) => [
  placa(id + '.cruz.x', pos, tam, 1.2, .2, 'oscuro', { eje, sinContorno: true, sinAristas: true }),
  placa(id + '.cruz.y', pos, 1.2, tam, .2, 'oscuro', { eje, sinContorno: true, sinAristas: true }),
];

const tapa = (h = H) => [
  placa('tapa', [0, -110, h - 3], 490, 300, 3, 'metal', { r: 24, huecos: [{ x: 0, y: 125, w: 90, d: 25, r: 12.5 }] }),
  // Soporte solidario a la tapa que recibe el perfil U, visible en p4–p5.
  ...LADOS.map(([n, s]) => placa('tapa.soporte.' + n, [s < 0 ? -30 : 27, 0, h - 28], 50, 46, 3, 'metal', { eje: [1, 0, 0], huecos: [agujero(2, 0)] })),
  placa('tapa.soporte.frente', [0, 23, h - 53], 60, 3, 50),
  ...LADOS.map(([n, s]) => poligono('tapa.refuerzo.' + n, [s * 30, 0, h - 3], [[0, -95], [0, -23], [45, -23]], 3, 'metal', { eje: [1, 0, 0] })),
];
const corredera = (h = H) => [
  // Frente con canaleta pasante; laterales separados dejan la U abierta hacia -Y.
  placa('corredera.frente', [0, 20, h - 153], 54, 300, 3, 'metal', { eje: [0, 1, 0], r: 4,
    huecos: [{ x: 0, y: 42, w: 8, d: 148, r: 4 }] }),
  ...LADOS.map(([n, s]) => placa('corredera.' + n, [s < 0 ? -27 : 24, -1.5, h - 153], 300, 43, 3, 'metal', { eje: [1, 0, 0], r: 4, huecos: [agujero(-123, 1.5)] })),
];
const fijacionTapa = (h = H) => LADOS.flatMap(([n, s]) => [
  cilindro('A.' + n + '.cana', [s * 30, 0, h - 30], [-s, 0, 0], 14, 2.5),
  cilindro('A.' + n + '.cabeza', [s * 30, 0, h - 30], [s, 0, 0], 3, 5),
  ...cruz('A.' + n, [s * 33.1, 0, h - 30], [s, 0, 0]),
  poligono('B.' + n, [s * 23.8, 0, h - 30], hexagono(5.5), 4, 'zinc', { eje: [-s, 0, 0], huecos: [agujero(0, 0, 5)] }),
]);
const guia = () => [
  // Tubo rectangular hueco 44 ×36, con perforaciones hacia la canaleta (+Y).
  placa('guia.frente', [0, 16, 238], 44, 464, 2, 'metal', { eje: [0, 1, 0], huecos: [agujero(0, 238 - Z_C), agujero(0, 238 - 456)] }),
  placa('guia.atras', [0, -18, 6], 44, 2, 464),
  ...LADOS.map(([n, s]) => placa('guia.' + n, [s * 21, 0, 6], 2, 32, 464)),
  // Puente inferior solidario al tubo: recibe los dos D, sin sumar otra pieza de inventario.
  placa('guia.anclaje', [0, 0, 6], 40, 32, 4, 'metal', { huecos: [agujero(-12, 0, 5), agujero(12, 0, 5)] }),
];
const mariposa = () => [
  cilindro('C.esparrago', [0, 29, Z_C], [0, -1, 0], 18, 3),
  cilindro('C.centro', [0, 23, Z_C], [0, 1, 0], 10, 8, 'negro'),
  poligono('C.perilla', [0, 33, Z_C], trebol(), 5, 'negro', { eje: [0, 1, 0] }),
];
const base = (conFelpas = false) => [
  placa('base', [0, 0, 2], 300, 300, 4, 'metal', { r: 22, huecos: [agujero(-12, 0, 5), agujero(12, 0, 5)] }),
  ...APOYOS.map(([x, y], i) => cilindro('base.topetina.' + i, [x, y, conFelpas ? .8 : 0], [0, 0, 1], conFelpas ? 1.2 : 2, 12, 'negro')),
];
const tornillosBase = () => [-12, 12].flatMap((x, i) => [
  cilindro('D.' + i + '.cana', [x, 0, 2], [0, 0, 1], 14, 2.5),
  // Cabeza al ras; el cono fresado se simplifica dentro del espesor de la base.
  cilindro('D.' + i + '.cabeza', [x, 0, 1.85], [0, 0, 1], .2, 5),
  ...cruz('D.' + i, [x, 0, 1.8], [0, 0, -1]),
]);
const felpas = () => APOYOS.map(([x, y], i) => cilindro('felpa.' + i, [x, y, 0], [0, 0, 1], .8, 12, 'fieltro'));
const superior = (h = H) => [...tapa(h), ...corredera(h), ...fijacionTapa(h)];
const mesa = (h = H, conFelpas = false) => [...superior(h), ...guia(), ...mariposa(), ...base(conFelpas), ...tornillosBase(), ...(conFelpas ? felpas() : [])];
// Giro rígido de 180° sobre Y. La cara superior queda apoyada en z=0.
// rotacion compone el giro con eje: conserva también las caras perforadas.
const bocaAbajo = ps => ps.map(p => ({ ...p, pos: [-p.pos[0], p.pos[1], H - p.pos[2]], rotacion: [0, 180, 0] }));
const manta = { id: 'manta', tipo: 'manta', pos: [0, -70, 0], w: 620, d: 520, mat: 'carton' };
const paso = (n, id, titulo, a, piezas, extra = {}) => ({
  id, grupo: 'Armado', titulo: `${n}. ${titulo}`, titular: titulo,
  subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${n} de 8` },
  vista: { yaw: -38, pitch: 28 }, piezas, mueven: [], resaltar: [], encuadrarTodo: true, ...extra,
});

export default {
  id: 'ch38', version: 1,
  marca: { nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022', tienda: 'https://dege.com.ar/', instagram: 'https://instagram.com/dege.muebles', confeti: ['#B0552F', '#ffffff', '#e9e4d6'] },
  materiales: { metal: { color: '#B0552F' }, zinc: { color: '#c9ced3' }, negro: { color: '#242424' }, oscuro: { color: '#292725' }, fieltro: { color: '#383635' }, carton: { color: '#e8d3b2' } },
  // La interfaz descuenta consumibles. La herramienta E y las 4 piezas se documentan aparte.
  inventario: [{ id: 'A', n: 2, label: 'A · Tornillos Phillips' }, { id: 'B', n: 2, label: 'B · Tuercas' }, { id: 'C', n: 1, label: 'C · Mariposa' }, { id: 'D', n: 2, label: 'D · Tornillos fresados Phillips' }],
  piezasInventario: [{ id: '1', n: 1, label: 'Chapa superior' }, { id: '2', n: 1, label: 'Corredera' }, { id: '3', n: 1, label: 'Guía' }, { id: '4', n: 1, label: 'Base' }],
  herramientas: [{ id: 'E', n: 1, label: 'Llave hexagonal', incluida: true }, { id: 'phillips', n: 1, label: 'Destornillador Phillips', incluida: false }],
  textos: {
    titulo: 'Armá tu Mesa de arrime regulable · DEGË Muebles', cabecera: 'Mesa regulable',
    ladoTitulo: 'Tu mesa regulable, <em>paso a paso</em>', ladoCuerpo: 'Armá tu mesa de arrime regulable con los pasos de fábrica. Girá el modelo para ver cada unión y aprendé a ajustar la altura.', ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá la mesa para girarla', girar: 'Arrastrá para girar la mesa',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>mesa regulable</em>',
    datos: [['layers', '4 piezas', '7 herrajes · llave incluida'], ['check', '6 pasos', '+ felpitas y regulación'], ['space', '49 × 30 cm', 'altura de 57 a 70 cm']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso', momKicker: 'Antes de arrancar', momTitulo: 'Tu mesa regulable,<br><em>paso a paso</em>', momCuerpo: 'Contá las piezas y prepará un lugar cómodo.',
    momTips: [
      ['space', 'Protegé el metal', 'Trabajá sobre una manta, con la tapa boca abajo.'],
      ['kids', 'Contá las piezas', '1 tapa · 1 corredera · 1 guía · 1 base. A ×2 · B ×2 · C ×1 · D ×2.'],
      ['time', 'Prepará las herramientas', 'Destornillador Phillips: no incluido. La llave hexagonal E viene en la caja.'],
      ['space', 'Buscá las felpitas', 'Son un regalo hasta agotar stock. Si vinieron, las pegás debajo de la base.'],
    ],
    momCta: 'Empezar a armar', finTitulo: '¡Tu mesa <em>está lista</em>!', finCuerpo: 'Ya tenés tu mueble armado. La subís o la bajás hasta tu altura, sin herramientas.', finTip: 'Sostené la tapa al aflojar la mariposa y ajustala antes de soltarla. Guardá la llave hexagonal.',
    waTexto: '¡Hola DEGË! Estoy armando la Mesa de arrime regulable y tengo una duda.', pie: 'DEGË Muebles · De Rosario a todo el país.', rvEjemplos: ['Ya tengo mi mesa lista', 'Me sirvió ver cada unión', 'Re fácil regular la altura'],
  },
  // La portada muestra 64 cm; el rango de 57–70 figura en los textos y el extra.
  // 49 × 30 es la TAPA: esas cotas van a la altura de la tapa (no en el piso, donde la base mide 30 × 30).
  // Tapa: x ±245, y −260…40, esquinas r24 → rectas hasta ±221 / −236…16. Desplazamientos paralelos al piso.
  cotas: { w: 49, d: 30, h: 64, unidad: 'cm', caja: [-245, 245, -260, 40, 0, H], lineas: [
    [[-245, -236, H], [245, -236, H], [0, -95, 0], 49],
    [[221, 40, H], [221, -260, H], [95, 0, 0], 30],
    [[-221, 40, 0], [-221, 40, H], [-70, 0, 0], 64],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -35, pitch: 22 }, piezas: mesa(), mueven: [] },
    paso(1, 'encastrar', 'Encastrá la corredera', ['Apoyá la tapa de metal 1 boca abajo, sobre una manta.', 'Encastrá la corredera 2 en el soporte de la tapa, debajo de la manija.'], [manta, ...bocaAbajo([...tapa(), ...corredera()])], {
      usa: ['1 · Tapa de metal ×1', '2 · Corredera ×1'], unir: ['tapa'], resaltar: ['corredera'], mueven: [mover('corredera', 110)], vista: { yaw: -38, pitch: 38 },
      elegir: [{ m: ['tapa'], t: 'Es la tapa con manija y soporte por debajo.' }, { m: ['corredera'], t: 'Es el perfil en U con la canaleta larga.' }],
    }),
    paso(2, 'fijar', 'Fijá la unión', ['Colocá los dos tornillos A con sus dos tuercas B.', 'Sostené cada tuerca con la llave hexagonal E y ajustá el tornillo con el Phillips.'], [manta, ...bocaAbajo(superior())], {
      usa: ['A · Tornillos ×2', 'B · Tuercas ×2', 'E · Llave hexagonal incluida', 'Destornillador Phillips (no incluido)'], hw: { A: 2, B: 2 },
      unir: ['tapa.soporte', 'corredera'], resaltar: ['A', 'B'], enfoque: .3,
      mueven: LADOS.flatMap(([n, s], i) => [mover('A.' + n, 65, [-s, 0, 0], i * .4), mover('B.' + n, 22, [s, 0, 0], i * .4)]), vista: { yaw: 42, pitch: 30 },
    }),
    paso(3, 'guia', 'Encastrá la guía', ['Con la tapa todavía boca abajo, deslizá la guía 3 dentro de la corredera 2.', 'Las perforaciones de la guía miran hacia la canaleta, del lado de la manija.'], [manta, ...bocaAbajo([...superior(), ...guia()])], {
      usa: ['3 · Guía ×1'], titular: 'Los agujeros, hacia la canaleta', unir: ['corredera'], resaltar: ['guia'], mueven: [mover('guia', 180)],
    }),
    paso(4, 'mariposa', 'Colocá la mariposa', ['Pasá el espárrago de la mariposa C por la canaleta y la perforación de la guía.', 'Enroscala a mano hasta que la unión quede firme.'], [manta, ...bocaAbajo([...superior(), ...guia(), ...mariposa()])], {
      usa: ['C · Mariposa ×1'], hw: { C: 1 }, unir: ['corredera', 'guia'], resaltar: ['C'], enfoque: .3, mueven: [mover('C', 75, [0, 1, 0])],
    }),
    paso(5, 'base', 'Atornillá la base', ['Sin dar vuelta la mesa, apoyá la base 4 sobre la guía 3.', '¡Atención! Las topetinas quedan hacia arriba, como en la imagen.', 'Colocá los dos tornillos D y ajustalos con el Phillips.'], [manta, ...bocaAbajo(mesa())], {
      usa: ['4 · Base ×1', 'D · Tornillos ×2', 'Destornillador Phillips (no incluido)'], hw: { D: 2 }, unir: ['guia'], resaltar: ['base', 'D'],
      mueven: [mover('base', 90), mover('D', 150, [0, 0, 1], .7)], vista: { yaw: -38, pitch: 48 },
    }),
    // Extra entre los pasos 5 y 6 de fábrica para aprovechar la base boca arriba.
    paso(6, 'felpas', 'Pegá las felpitas', ['Si vinieron felpitas, sacales el protector y pegalas sobre los apoyos de la base.', 'La mesa sigue boca abajo: esa cara va contra el piso.', 'Son un regalo hasta agotar stock. Si no vinieron, seguí al próximo paso.'], [manta, ...bocaAbajo(mesa(H, true))], {
      grupo: 'Extra', usa: ['Felpitas de fieltro (si vinieron en la caja)'], resaltar: ['felpa'], mueven: APOYOS.map((_, i) => mover('felpa.' + i, 45, [0, 0, 1], i * .2)), vista: { yaw: -38, pitch: 52 },
    }),
    paso(7, 'revisar', 'Revisá y dala vuelta', ['Verificá que los tornillos, las tuercas y la mariposa estén bien ajustados.', 'Dala vuelta y apoyala en el piso: tiene que quedar firme.', '¡Listo! Ya tenés tu mueble armado.'], mesa(), {
      sinFantasma: true, vista: { yaw: -35, pitch: 22 },
    }),
    paso(8, 'altura', 'Regulá la altura', ['Sostené la tapa y aflojá un poco la mariposa.', 'La subís o la bajás hasta tu altura, sin herramientas.', 'Elegí entre 57 y 70 cm y ajustá la mariposa antes de soltar la tapa.'], mesa(MIN), {
      grupo: 'Extra', titular: 'De 57 a 70 cm, sin herramientas', cuenta: { fijo: 'Paso 8 de 8 · regulación continua' },
      usa: ['C · Mariposa · ajuste a mano'], resaltar: ['C'], sinFantasma: true, vista: { yaw: -35, pitch: 22 },
      // Sólo suben tapa, corredera y sus A/B. La guía, la base y C quedan a la misma altura.
      // C afloja 6 mm antes de subir y vuelve a ajustar al terminar de bajar.
      mueven: [
        mover(['tapa', 'corredera', 'A', 'B'], MAX - MIN, [0, 0, 1], 0, { trayecto: [[0, 0], [.3, 0], [.6, 30], [.8, 70], [.9, MAX - MIN], [.95, MAX - MIN], [.975, 85], [.988, 40], [.994, 0], [1, 0]] }),
        mover('C', MAX - MIN, [0, 1, 0], 0, { trayecto: [[0, 0], [.25, 6], [.994, 6], [1, 0]] }),
      ],
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -35, pitch: 22 }, piezas: mesa(), mueven: [] },
  ],
};
