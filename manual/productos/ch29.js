const APOYOS = [['curva', -122.5, 0], ['adelante', -25, 97.5], ['atras', -25, -97.5]];
const FIELTROS = [[122.5, 97.5], [122.5, -97.5], [-94, 69], [-94, -69]];
const cilindro = (id, pos, s1, r, mat = 'chapa', eje = [0, 0, 1]) => ({ id, tipo: 'cilindro', pos, eje, s0: 0, s1, r, mat });
const placa = (id, pos, w, d, h, mat = 'chapa', forma = 'redondeada') => ({ id, tipo: 'perfil', forma, pos, w, d, r: 0, z0: 0, z1: h, mat });
const tapa = () => [placa('tapa', [20, 0, 647], 400, 270, 3, 'chapa', 'estadio'),
  ...APOYOS.map(([n, x, y]) => cilindro('tapa.saliente.' + n, [x, y, 647], 12, 3, 'zinc', [0, 0, -1]))];
const canos = () => APOYOS.map(([n, x, y]) => cilindro('cano.' + n, [x, y, 8], 639, 11));
const base = (marcas = false) => [
  { ...placa('base', [0, 0, 3], 300, 250, 5, 'chapa', 'u'), banda: 55 },
  ...(marcas ? APOYOS.flatMap(([n, x, y]) => [
    cilindro('base.avellanado.' + n, [x, y, 2.85], .15, 6, 'bisel'),
    cilindro('base.agujero.' + n, [x, y, 2.7], .15, 3, 'oscuro'),
  ]) : []),
];
const tornillos = () => APOYOS.flatMap(([n, x, y]) => [
  cilindro('A.' + n + '.cana', [x, y, 3], 16, 2.5, 'zinc'),
  cilindro('A.' + n + '.cabeza', [x, y, 2.8], .2, 5.5, 'zinc'),
  placa('A.' + n + '.cruz.x', [x, y, 2.65], 7, 1.2, .15, 'oscuro'),
  placa('A.' + n + '.cruz.y', [x, y, 2.65], 1.2, 7, .15, 'oscuro'),
]);
const felpas = () => FIELTROS.map(([x, y], i) => cilindro('felpa.' + i, [x, y, 0], 3, 9, 'fieltro'));
const mesa = (conFelpas = true) => [...tapa(), ...canos(), ...base(), ...tornillos(), ...(conFelpas ? felpas() : [])];
const bocaAbajo = ps => ps.map(p => ({ ...p, pos: [-p.pos[0], p.pos[1], 650 - p.pos[2]], eje: (p.eje || [0, 0, 1]).map((v, i) => i === 1 ? v : -v) }));
const manta = { id: 'manta', tipo: 'manta', w: 650, d: 510, mat: 'carton' };
const mover = (p, recorrido = 80, demora = 0) => ({ nombre: p, p, recorrido, demora });
const paso = (id, titulo, a, piezas, extra = {}) => ({ id, grupo: 'Armado', titulo, subs: { a, b: [], tip: '' }, usa: [], titular: titulo, vista: { yaw: -20, pitch: 30 }, piezas, resaltar: [], mueven: [], encuadrarTodo: true, ...extra });

export default {
  id: 'ch29', version: 1,
  marca: { nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022', tienda: 'https://dege.com.ar/', instagram: 'https://instagram.com/dege.muebles', confeti: ['#B0552F', '#ffffff', '#e9e4d6'] },
  materiales: { chapa: { color: '#B0552F' }, zinc: { color: '#c9ced3' }, fieltro: { color: '#383635' }, oscuro: { color: '#292725' }, bisel: { color: '#793b20' }, carton: { color: '#e8d3b2' }, senal: { color: '#ff6a3d' } },
  inventario: [{ id: 'A', n: 3, label: 'A · Tornillos Phillips' }, { id: 'felpa', n: 4, label: 'Felpas de fieltro' }],
  textos: {
    titulo: 'Armá tu Mesa de arrime CH29 · DEGË Muebles', cabecera: 'Mesa de arrime CH29',
    ladoTitulo: 'Tu CH29, <em>paso a paso</em>', ladoCuerpo: 'Una tapa, tres caños y una base: tu mesa de arrime se arma en minutos. Girá el modelo para ver cada unión.', ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá la mesa para girarla', girar: 'Arrastrá para girar la mesa',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>Mesa de arrime CH29</em>',
    datos: [['layers', '5 piezas', '3 tornillos y 4 felpas'], ['check', '4 pasos', 'más las felpas'], ['space', '40 × 27 × 65', 'cm · largo, ancho y alto']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso', momKicker: 'Antes de arrancar', momTitulo: 'Tu CH29,<br><em>en minutos</em>', momCuerpo: 'Contá las piezas y prepará un lugar cómodo.',
    momTips: [['space', 'Protegé la tapa', 'Trabajá sobre una manta o cartón.'], ['kids', 'Contá las piezas', '1 tapa · 3 caños · 1 base · 3 tornillos A · 4 felpas.'], ['time', 'Prepará el Phillips', 'Necesitás un destornillador Phillips: no viene incluido.']],
    momCta: 'Empezar a armar', finTitulo: '¡Tu CH29 <em>está lista</em>!', finCuerpo: 'Ya tenés tu mueble armado. Revisá que apoye firme y disfrutá tu mesa de arrime.', finTip: 'Guardá el manual para repasar los ajustes cuando haga falta.',
    waTexto: '¡Hola DEGË! Estoy armando la Mesa de arrime CH29 y tengo una duda.', pie: 'DEGË Muebles · De Rosario a todo el país.', rvEjemplos: ['La armé en minutos', 'Re claro el paso a paso', 'Ya tengo mi CH29 lista'],
  },
  cotas: { w: 40, d: 27, h: 65, unidad: 'cm', caja: [-180, 220, -135, 135, 0, 650], lineas: [
    [[-180, 0, 650], [220, 0, 650], [0, -200, 0], 40],
    [[-45, 135, 650], [-45, -135, 650], [-190, 0, 0], 27],
    [[220, 0, 0], [220, 0, 650], [70, 0, 0], 65],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: 22, pitch: 18 }, piezas: mesa(), mueven: [] },
    paso('canos', '1. Enroscá los caños', ['Apoyá la tapa 1 boca abajo, sobre una manta.', 'Enroscá cada caño 2 en un saliente de la tapa, girándolo a mano.', 'Repetí con los tres caños hasta que queden firmes.'], [manta, ...bocaAbajo([...tapa(), ...canos()]),
      ...APOYOS.map(([n, x, y]) => ({ id: 'giro.' + n, tipo: 'giro', pos: [-x, y, 540], r0: 19, r1: 38, desde: -150, hasta: 128, mat: 'senal', sinContorno: true })),
    ], { usa: ['1 · Chapa superior ×1', '2 · Caños ×3'], cuenta: { de: 'cano.', n: 3, txt: 'Caño', fin: '3 caños en su lugar' }, resaltar: ['cano'], unir: ['tapa'], mueven: APOYOS.map(([n], i) => mover('cano.' + n, 95, i * .35)) }),
    paso('base', '2. Acomodá la base', ['Hacé coincidir las tres perforaciones de la base 3 con los caños.', 'El lado avellanado queda hacia arriba: es donde entra la cabeza del tornillo.'], [manta, ...bocaAbajo([...tapa(), ...canos(), ...base(true)])], { usa: ['3 · Chapa inferior ×1'], cuenta: { fijo: 'Paso 2 de 5' }, titular: 'El avellanado, hacia arriba', resaltar: ['base'], unir: ['cano'], mueven: [mover('base', 100)], vista: { yaw: -20, pitch: 46 } }),
    paso('tornillos', '3. Ajustá los tornillos', ['Colocá un tornillo A en cada perforación de la base.', 'Ajustá los tres con el destornillador Phillips, uniendo la base con los caños.'], [manta, ...bocaAbajo(mesa(false))], { usa: ['A · Tornillos ×3', 'Destornillador Phillips (no incluido)'], cuenta: { fijo: 'Paso 3 de 5 · A ×3' }, hw: { A: 3 }, resaltar: ['A'], unir: ['base', 'cano'], mueven: APOYOS.map(([n], i) => mover('A.' + n, 65, i * .3)), vista: { yaw: -20, pitch: 50 } }),
    paso('felpas', '4. Pegá las felpas', ['Con la mesa todavía boca abajo, pegá las cuatro felpas debajo de la base.', 'Van dos en las puntas y dos en la curva, sin tapar los tornillos.', 'Ya vienen en la caja: ayudan a que apoye estable y no raye el piso.'], [manta, ...bocaAbajo(mesa())], { grupo: 'Extra', usa: ['Felpas de fieltro ×4'], cuenta: { fijo: 'Paso 4 de 5 · 4 felpas' }, hw: { felpa: 4 }, resaltar: ['felpa'], mueven: FIELTROS.map((_, i) => mover('felpa.' + i, 55, i * .2)), vista: { yaw: -20, pitch: 54 } }),
    paso('revisar', '5. Revisá y dala vuelta', ['Verificá que los tres caños y los tres tornillos estén bien ajustados.', 'Dala vuelta y apoyala en el piso: tiene que quedar firme.', '¡Listo! Ya tenés tu mueble armado.'], mesa(), { cuenta: { fijo: 'Paso 5 de 5' }, sinFantasma: true, vista: { yaw: 22, pitch: 18 }, mueven: [mover('*', 45)] }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: 22, pitch: 18 }, piezas: mesa(), mueven: [] },
  ],
};
