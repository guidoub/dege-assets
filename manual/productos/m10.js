const caja = (id, pos, w, d, h, mat = 'ocre') => ({ id, tipo: 'perfil', forma: 'redondeada', r: 0, pos, w, d, z0: 0, z1: h, mat });
const tubo = (id, pos, eje, largo, r, mat = 'ocre') => ({ id, tipo: 'cilindro', pos, eje, s0: 0, s1: largo, r, mat, seg: 20 });
const mover = (p, recorrido = 100, dir = [0, 0, 1], demora = 0) => ({ nombre: Array.isArray(p) ? p.join('+') : p, p, recorrido, dir, demora });
const trasladar = (ps, v) => ps.map(p => ({ ...p, pos: p.pos.map((n, i) => n + v[i]) }));
const acostar = (ps, signo) => ps.map(p => {
  const giro = ([x, y, z]) => [signo * z, y, -signo * x];
  const q = giro(p.pos);
  return { ...p, pos: [q[0] - signo * 600, q[1], q[2] + 450], eje: giro(p.eje || [0, 0, 1]) };
});
const tornillo = (id, pos, eje, largo, radio = 6) => [
  tubo(id + '.cana', pos, eje, largo, 2.5, 'zinc'),
  tubo(id + '.cabeza', pos, eje.map(n => -n), 3, radio, 'zinc'),
];
const lados = [['izq', -439], ['der', 439]]; // centro de los caños: 90 cm de ancho exterior (439+13 = 452)
const estante = (cual) => [caja('estante.' + cual, [0, -9, cual === 'abajo' ? 330 : 492], 850, 230, 18, 'kiri')];
const paneles = () => [
  ...lados.map(([n, x]) => caja('lateral.' + n, [Math.sign(x) * 416, -9, 348], 18, 230, 144, 'kiri')),
  caja('fondo', [0, -118, 348], 530, 12, 144, 'kiri'),
];
const puntosA = [[-416, -87], [-416, 70], [416, -87], [416, 70], [-220, -118], [0, -118], [220, -118]];
const tarugos = (cual) => puntosA.map(([x, y], i) => tubo(`A.${cual}.${i}`, [x, y, cual === 'abajo' ? 340 : 500], [0, 0, cual === 'abajo' ? 1 : -1], 22, 4, 'tarugo'));
const modulo = () => [...estante('abajo'), ...paneles(), ...estante('arriba')];
const pie = (n, x) => [caja('pie.' + n, [x, 57, 75], 38, 480, 30), ...[-184, 298].map((y, i) => caja(`pie.${n}.tapa.${i}`, [x, y, 75], 39, 3, 30, 'negro'))];
const ruedas = (n, x) => [265, -151].flatMap((y, i) => {
  const id = `${i === 0 ? 'H' : 'G'}.${n}`;
  return [caja(id + '.placa', [x, y, 71], 44, 44, 4, 'zinc'), tubo(id + '.giro', [x, y, 51], [0, 0, 1], 20, 8, 'zinc'),
    ...[-13, 13].map((dx, j) => caja(id + '.horquilla.' + j, [x + dx, y, 27], 4, 30, 30, 'zinc')),
    tubo(id + '.rueda', [x - 10, y, 27.5], [1, 0, 0], 20, 27.5, 'rueda'),
    tubo(id + '.eje', [x - 16, y, 27.5], [1, 0, 0], 32, 5, 'zinc'),
    ...(i === 0 ? [caja(id + '.freno', [x, y + 20, 48], 24, 26, 5, 'zinc')] : [])];
});
const C = (n, x) => [265, -151].flatMap((y, i) => [-15, 15].flatMap((dx, j) => [-15, 15].flatMap((dy, k) => tornillo(`C.${n}.${i}.${j}.${k}`, [x + dx, y + dy, 71], [0, 0, 1], 14, 4))));
const soporte = (n, x) => [
  ...[-27, 27].flatMap((y, i) => [tubo(`soporte.${n}.tubo.${i}`, [x, y, 105], [0, 0, 1], 1105, 13), tubo(`soporte.${n}.tapa.${i}`, [x, y, 1207], [0, 0, 1], 3, 12, 'negro')]),
  ...[366, 474].map((z, i) => caja(`soporte.${n}.chapita.${i}`, [x - Math.sign(x) * 11, 0, z], 8, 40, 24)),
];
const D = (n, x) => [-27, 27].flatMap((y, i) => tornillo(`D.${n}.${i}`, [x, y, 75], [0, 0, 1], 44, 8));
const B = (n, x) => [378, 486].flatMap((z, i) => tornillo(`B.${n}.${i}`, [x + Math.sign(x) * 13, 0, z], [-Math.sign(x), 0, 0], 48));
const conjunto = (n, x) => [...pie(n, x), ...ruedas(n, x), ...C(n, x), ...soporte(n, x), ...D(n, x)];
const estructura = () => [...modulo(), ...lados.flatMap(([n, x]) => [...conjunto(n, x), ...B(n, x)])];
const grandes = () => [1189, 937].map((z, i) => tubo('grande.' + i, [-426, 27, z], [1, 0, 0], 852, 9.5));
const E = () => lados.flatMap(([n, x]) => [1189, 937].flatMap((z, i) => tornillo(`E.${n}.${i}`, [x + Math.sign(x) * 13, 27, z], [-Math.sign(x), 0, 0], 28, 8)));
const chico = () => [tubo('chico', [-420, -108, 90], [1, 0, 0], 840, 8.5)];
const F = () => lados.flatMap(([n, x]) => tornillo('F.' + n, [x + Math.sign(x) * 19, -108, 90], [-Math.sign(x), 0, 0], 58));
const soportesTV = () => [-170, 170].flatMap((x, i) => {
  const id = 'tv.soporte.' + i;
  return [...[-14, 14].map((dx, j) => caja(id + '.borde.' + j, [x + dx, 42, 912], 14, 4, 420, 'zinc')),
    ...Array.from({ length: 9 }, (_, j) => caja(id + '.puente.' + j, [x, 42, 912 + j * 50], 14, 4, 20, 'zinc')),
    ...[937, 1189].flatMap((z, j) => [caja(id + '.gancho.' + j + '.alto', [x, 30, z + 10], 4, 28, 6, 'zinc'), caja(id + '.gancho.' + j + '.retorno', [x, 16, z - 8], 4, 4, 24, 'zinc')])];
});
const tele = () => [caja('tv.pantalla', [0, 66, 800], 1000, 42, 560, 'negro'), caja('tv.frente', [0, 88, 810], 980, 2, 540, 'pantalla')];
const tornillosTV = () => [-170, 170].flatMap((x, i) => [982, 1232].flatMap((z, j) => tornillo(`tv.tornillo.${i}.${j}`, [x, 34, z], [0, 1, 0], 14)));
const rack = () => [...estructura(), ...grandes(), ...E(), ...chico(), ...F()];
const completo = () => [...rack(), ...soportesTV(), ...tele(), ...tornillosTV()];
const cables = () => Array.from({ length: 24 }, (_, i) => {
  const a = i * Math.PI / 12, b = (i + 1) * Math.PI / 12;
  const p = [-170 + 35 * Math.cos(a), 6, 1060 + 95 * Math.sin(a)];
  const d = [35 * (Math.cos(b) - Math.cos(a)), 0, 95 * (Math.sin(b) - Math.sin(a))];
  const l = Math.hypot(...d);
  return tubo('cable.' + i, p, d.map(n => n / l), l, 3, 'negro');
});
const paso = (n, titulo, a, piezas, resaltar, mueven, extra = {}) => ({
  id: 'paso-' + n, grupo: 'Armado', titulo: `${n}. ${titulo}`, subs: { a, b: [], tip: '' },
  usa: [], titular: titulo, cuenta: { fijo: `Paso ${n} de 13` }, vista: { yaw: -30, pitch: 20 },
  piezas, resaltar, mueven, encuadrarTodo: true, ...extra,
});

export default {
  id: 'm10', version: 1,
  marca: { nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022', tienda: 'https://dege.com.ar/', instagram: 'https://instagram.com/dege.muebles', confeti: ['#C99A30', '#DCC093', '#ffffff', '#808879'] },
  materiales: { ocre: { color: '#C99A30' }, kiri: { color: '#DCC093' }, zinc: { color: '#c9ced3' }, negro: { color: '#28292b' }, rueda: { color: '#85898b' }, tarugo: { color: '#bb9464' }, pantalla: { color: '#536773' } },
  inventario: [['A', 14, 'Tarugos'], ['B', 4, 'Tornillos Allen largos'], ['C', 16, 'Tornillos de ruedas'], ['D', 4, 'Tornillos de pies'], ['E', 4, 'Tornillos de caños grandes'], ['F', 2, 'Tornillos de caño chico'], ['G', 2, 'Ruedas sin freno'], ['H', 2, 'Ruedas con freno']].map(([id, n, label]) => ({ id, n, label: `${id} · ${label}` })),
  textos: {
    titulo: 'Armá tu Rack de TV M10 · DEGË Muebles', cabecera: 'Rack de TV M10',
    ladoTitulo: 'Armá tu M10, <em>paso a paso</em>', ladoCuerpo: 'Manual interactivo del rack de TV móvil M10. Girá el modelo para ver cada unión y seguí los pasos de fábrica.', ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: 'Arrastrá el rack para girarlo', girar: 'Arrastrá para girar el rack',
    portadaKicker: 'Manual de armado', portadaTitulo: 'Armá tu <em>Rack de TV M10</em>, paso a paso',
    datos: [['layers', '14 piezas', 'más herrajes'], ['check', '12 pasos', 'del manual de fábrica'], ['space', '90 × 121 × 48', 'cm · ancho, alto y base']],
    retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso', momKicker: 'Antes de arrancar', momTitulo: 'Tu M10,<br><em>paso a paso</em>', momCuerpo: 'Revisá las piezas y los herrajes antes de empezar.',
    momTips: [['space', 'Protegé las piezas', 'Trabajá sobre una manta o cartón.'], ['kids', 'Contá los herrajes', 'A ×14 · B ×4 · C ×16 · D ×4 · E ×4 · F ×2 · G ×2 · H ×2 · I ×1.'], ['time', 'Prepará las herramientas', 'Llave Allen I incluida y destornillador para C y F.'], ['space', 'Revisá tu TV', 'Sus 4 tornillos no vienen incluidos. Consultá el manual del televisor.']],
    momCta: 'Empezar a armar', finTitulo: '¡Tu <em>Rack de TV M10</em> está armado!', finCuerpo: 'Revisá las uniones, el enganche de ambos soportes y el apoyo de las cuatro ruedas. Los cables pueden quedar ocultos detrás de la TV.', finTip: 'Guardá la llave Allen y el manual para repasar los ajustes cuando haga falta.',
    waTexto: '¡Hola DEGË! Estoy armando el Rack de TV M10 y tengo una duda.', pie: 'DEGË Muebles · De Rosario a todo el país.', rvEjemplos: ['El paso a paso se entiende', 'Ya tengo mi M10 armado', 'Me sirvió girar el modelo'],
  },
  cotas: { w: 90, d: 48, h: 121, unidad: 'cm', caja: [-450, 450, -183, 297, 0, 1210] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -30, pitch: 16 }, piezas: [...rack(), ...soportesTV()], mueven: [] },
    paso(1, 'Poné los tarugos', ['Colocá 7 tarugos A en cada estante 1.', 'Los dos estantes llevan 14 tarugos en total.'], [...trasladar([...estante('abajo'), ...tarugos('abajo')], [0, -170, -330]), ...trasladar([...estante('abajo'), ...tarugos('abajo')].map(p => ({ ...p, id: p.id.replace('abajo', 'arriba') })), [0, 170, -330])], ['A'], [mover('A', 70)], { hw: { A: 14 }, usa: ['1 · Estantes ×2', 'A · Tarugos ×14'], vista: { yaw: -15, pitch: 55 } }),
    paso(2, 'Sumá los laterales y el fondo', ['Apoyá un estante 1 con los tarugos hacia arriba.', 'Encastrá los dos laterales 2 y el fondo 3.'], trasladar([...estante('abajo'), ...tarugos('abajo'), ...paneles()], [0, 0, -330]), ['lateral', 'fondo'], [mover('lateral', 130), mover('fondo', 130, [0, 0, 1], .35)], { usa: ['2 · Laterales ×2', '3 · Fondo ×1'], unir: ['estante', 'A'], vista: { yaw: -30, pitch: 35 } }),
    paso(3, 'Cerrá el módulo', ['Dá vuelta el segundo estante: los tarugos miran hacia abajo.', 'Encastralo y verificá que todas las uniones queden firmes.'], trasladar([...modulo(), ...tarugos('arriba')], [0, 0, -330]), ['estante.arriba', 'A.arriba'], [mover(['estante.arriba', 'A.arriba'], 160)], { usa: ['1 · Segundo estante'], unir: ['lateral', 'fondo'], vista: { yaw: -30, pitch: 35 } }),
    paso(4, 'Atornillá las ruedas', ['Colocá una rueda G y una H en cada pie 5.', 'Usá 4 tornillos C por rueda: 16 en total.', 'Las ruedas con freno van adelante, en el extremo largo de ambos pies.'], lados.flatMap(([n, x]) => [...pie(n, x), ...ruedas(n, x), ...C(n, x)]), ['G', 'H', 'C'], [mover('G', 80, [0, 0, -1]), mover('H', 80, [0, 0, -1]), mover('C', 120, [0, 0, -1], .5)], { usa: ['5 · Pies ×2', 'G ×2 · H ×2', 'C · Tornillos ×16'], hw: { C: 16, G: 2, H: 2 }, unir: ['pie'], vista: { yaw: -30, pitch: -25 } }),
    paso(5, 'Uní un pie al soporte lateral', ['Uní el soporte lateral 4 con un pie 5.', 'Ajustá los dos tornillos D desde abajo con la llave Allen I.'], conjunto('der', 439), ['soporte.der', 'D.der'], [mover('soporte.der', 140), mover('D.der', 80, [0, 0, -1], .5)], { usa: ['4 · Soporte lateral', 'D · Tornillos ×2', 'I · Llave Allen'], hw: { D: 2 }, unir: ['pie.der'], vista: { yaw: -35, pitch: 10 } }),
    paso(6, 'Armá el conjunto opuesto', ['Repetí con el otro pie, el soporte 4 y dos tornillos D.', 'Las chapitas de los dos soportes apuntan hacia lados opuestos: hacia adentro del rack.'], lados.flatMap(([n, x]) => conjunto(n, x)), ['soporte.izq', 'D.izq', 'soporte.der.chapita'], [mover('soporte.izq', 140), mover('D.izq', 80, [0, 0, -1], .5)], { usa: ['4 · Segundo soporte', 'D · Tornillos ×2', 'I · Llave Allen'], hw: { D: 2 } }),
    paso(7, 'Fijá el primer lateral', ['Poné el módulo de estantes en posición vertical, sobre un lateral.', 'Colocá un conjunto metálico con las chapitas hacia abajo y fijalo con dos tornillos B.', 'El fondo 3 y el extremo corto del pie 5 quedan del mismo lado: atrás.'], acostar([...modulo(), ...conjunto('der', 439), ...B('der', 439)], -1), ['soporte.der', 'B.der'], [mover(['pie.der', 'G.der', 'H.der', 'C.der', 'D.der', 'soporte.der'], 130), mover('B.der', 180, [0, 0, 1], .4)], { usa: ['B · Tornillos ×2', 'I · Llave Allen'], hw: { B: 2 }, unir: ['lateral.der'], vista: { yaw: -25, pitch: 28 } }),
    paso(8, 'Giralo y fijá el otro lateral', ['Rotá el conjunto: el lateral ya colocado queda hacia abajo.', 'Atornillá el segundo conjunto con los dos tornillos B restantes.'], acostar(estructura(), 1), ['soporte.izq', 'B.izq'], [mover(['pie.izq', 'G.izq', 'H.izq', 'C.izq', 'D.izq', 'soporte.izq'], 130), mover('B.izq', 180, [0, 0, 1], .4)], { usa: ['B · Tornillos ×2', 'I · Llave Allen'], hw: { B: 2 }, unir: ['lateral.izq'], vista: { yaw: -25, pitch: 28 } }),
    paso(9, 'Colocá los caños grandes', ['Apoyá el mueble sobre sus ruedas.', 'Uní los dos caños grandes 6 a los soportes laterales 4 con los cuatro tornillos E.', 'Asegurá los tornillos firmemente con la llave Allen I.'], [...estructura(), ...grandes(), ...E()], ['grande', 'E'], [mover('grande', 100, [0, 1, 0]), mover('E.izq', 80, [-1, 0, 0], .5), mover('E.der', 80, [1, 0, 0], .5)], { usa: ['6 · Caños grandes ×2', 'E · Tornillos ×4', 'I · Llave Allen'], hw: { E: 4 }, unir: ['soporte'] }),
    paso(10, 'Uní el caño chico atrás', ['Ubicá el caño chico 7 entre los pies, en la parte trasera inferior.', 'Fijalo con un tornillo F en cada extremo.'], rack(), ['chico', 'F'], [mover('chico', 130, [0, -1, 0]), mover('F.izq', 80, [-1, 0, 0], .5), mover('F.der', 80, [1, 0, 0], .5)], { usa: ['7 · Caño chico', 'F · Tornillos ×2'], hw: { F: 2 }, unir: ['pie'], vista: { yaw: 145, pitch: 24 } }),
    paso(11, 'Fijá los soportes a la TV', ['Colocá los soportes 8 detrás de la TV, con las muescas hacia abajo.', 'El televisor queda sujeto en cuatro puntos. Revisá el ajuste.', 'Los tornillos de la TV NO vienen incluidos.'], [...tele(), ...soportesTV(), ...tornillosTV()], ['tv.soporte', 'tv.tornillo'], [mover('tv.soporte', 100, [0, -1, 0]), mover('tv.tornillo', 150, [0, -1, 0], .5)], { usa: ['8 · Soportes TV ×2', '4 tornillos compatibles con tu TV (no incluidos)'], vista: { yaw: 155, pitch: 15 }, subs: { a: ['Fijá los soportes 8 a la TV con las muescas hacia abajo.', 'La TV debe quedar tomada de cuatro puntos.', 'Los tornillos de la TV NO vienen incluidos.'], b: [], tip: 'Fábrica recomienda M6 × 12 a 14 mm. Confirmá el diámetro y largo en el manual de tu TV antes de usarlos.' } }),
    paso(12, 'Colgá la TV', ['Enganchá las muescas de ambos soportes 8 en los dos caños grandes 6.', 'Según las muescas que uses, la TV queda más alta o más baja.', 'Verificá el enganche de ambos lados antes de soltarla.'], completo(), ['tv.soporte'], [mover('tv', 160)], { usa: ['8 · Soportes TV', '6 · Caños grandes'], unir: ['grande'], vista: { yaw: 145, pitch: 18 } }),
    paso(13, 'Ordená los cables', ['Usá el soporte para colgar y ocultar los cables detrás de la TV.', 'Ya tenés tu Rack de TV armado.'], [...completo(), ...cables()], ['cable'], [mover('cable', 70, [0, -1, 0])], { sinFantasma: true, vista: { yaw: 155, pitch: 18 } }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -30, pitch: 15 }, piezas: [...completo(), ...cables()], mueven: [] },
  ],
};
