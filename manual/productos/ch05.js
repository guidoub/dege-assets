import { manta, mover, herrajes, paso as P_, textos, marca, MATS, cil, caja } from './_estimado.js?v=40bdf307a1';

const W = 800, H = 800, D = 165, T = 2, XR = 180, RW = 40;   // rieles a ±18 cm del centro, de 4 cm de ancho
const ZS = [110, 400, 690];                                    // altura de los 3 estantes (se pueden cambiar de ranura)
const FIJ = [[XR, 760], [XR, 60], [-XR, 760], [-XR, 60]];       // perforaciones para amurar (arriba y abajo de cada riel)
const XZ = [90, 0, 0];

const arcos = (pts, cu, cv, r, a0, a1, n = 6) => { for (let k = 0; k <= n; k++) { const a = (a0 + (a1 - a0) * k / n) * Math.PI / 180; pts.push([cu + r * Math.cos(a), cv + r * Math.sin(a)]); } };
const rr = (u0, u1, v0, v1, r) => { const p = []; arcos(p, u1 - r, v0 + r, r, -90, 0); arcos(p, u1 - r, v1 - r, r, 0, 90); arcos(p, u0 + r, v1 - r, r, 90, 180); arcos(p, u0 + r, v0 + r, r, 180, 270); return p; };
const ranuras = (x) => Array.from({ length: 13 }, (_, i) => ({ x, y: 115 + i * 48, w: 22, d: 4, r: 2 })).filter((h) => Math.abs(h.y - 760) > 25 && Math.abs(h.y - 60) > 25);
const riel = (s) => ({ id: 'riel.' + (s > 0 ? 'i' : 'd'), tipo: 'perfil', puntos: rr(s * XR - RW / 2, s * XR + RW / 2, 0, H, 4), pos: [0, T, 0], z0: 0, z1: T, mat: 'chapa', rotacion: XZ,
  huecos: [...ranuras(s * XR), ...FIJ.filter(([x]) => Math.sign(x) === s).map(([x, z]) => ({ x, y: z, w: 6, d: 6, r: 3 }))] });
const rieles = () => [riel(1), riel(-1)];
const estante = (i, z, dy = 0) => [
  caja(`est${i}.piso`, -W / 2, W / 2, T * 2 + dy, T * 2 + D + dy, z, T),
  { id: `est${i}.frente`, tipo: 'perfil', puntos: rr(-W / 2, W / 2, 0, 18, 2), pos: [0, T * 2 + D + dy, z], z0: 0, z1: T, mat: 'chapa', rotacion: XZ },
  { id: `est${i}.atras`, tipo: 'perfil', puntos: rr(-W / 2, W / 2, 0, 22, 2), pos: [0, T * 3 + dy, z], z0: 0, z1: T, mat: 'chapa', rotacion: XZ },
];
const estantes = () => ZS.flatMap((z, i) => estante(i, z));

const pared = () => ({ id: 'pared', tipo: 'perfil', puntos: [[-560, -120], [560, -120], [560, 920], [-560, 920]], pos: [0, 0, 0], z0: 0, z1: 20, mat: 'pared', rotacion: XZ });
const cruz = (id, x, z) => ({ id, tipo: 'perfil', pos: [0, .4, 0], z0: 0, z1: .3, mat: 'marca', rotacion: XZ,
  puntos: [[x - 1.5, z - 11], [x + 1.5, z - 11], [x + 1.5, z - 1.5], [x + 11, z - 1.5], [x + 11, z + 1.5], [x + 1.5, z + 1.5], [x + 1.5, z + 11], [x - 1.5, z + 11], [x - 1.5, z + 1.5], [x - 11, z + 1.5], [x - 11, z - 1.5], [x - 1.5, z - 1.5]] });
const marcas = () => FIJ.map(([x, z], k) => cruz('marca.' + k, x, z));
const agujeros = () => FIJ.map(([x, z], k) => cil('agujero.' + k, [x, .5, z], .6, 3.2, 'oscuro', { eje: [0, 1, 0], sinContorno: true, sinAristas: true }));
const tarugos = () => FIJ.flatMap(([x, z], k) => [cil(`B.${k}.cuerpo`, [x, 0, z], 30, 3.6, 'tarugo', { eje: [0, -1, 0] }), cil(`B.${k}.ala`, [x, 0, z], .3, 4.5, 'tarugo', { eje: [0, 1, 0] })]);
const tornillos = () => FIJ.flatMap(([x, z], k) => [cil(`A.${k}.cana`, [x, T * 2, z], 34, 2, 'zinc', { eje: [0, -1, 0] }), cil(`A.${k}.cabeza`, [x, T * 2, z], 2.4, 4.6, 'zinc', { eje: [0, 1, 0] })]);
const HW_A = FIJ.flatMap((_, k) => [`A.${k}.cana`, `A.${k}.cabeza`]);
const completa = () => [pared(), ...tarugos(), ...rieles(), ...tornillos(), ...estantes()];

const NA = 6, paso = P_(NA, { yaw: -24, pitch: 10 });
const ordenPiezas = () => [
  manta(1150, 760),
  ...[0, 1, 2].flatMap((i) => estante('x', 0).map((p) => ({ ...p, id: `pz.1.${i}.${p.id.split('.')[1]}`, pos: [p.pos[0] + 120, p.pos[1] - 330 + i * 190, p.pos[2] + i * 0] }))),
  { id: 'rotulo.1', tipo: 'texto', txt: '1 · ESTANTES ×3', pos: [120, 300, .3], alto: 28 },
  ...[1, -1].map((s, i) => ({ ...riel(s), id: 'pz.2.' + i, pos: [-430 + i * 70 - s * XR, 0, 0], rotacion: undefined, puntos: rr(-RW / 2 + s * XR, RW / 2 + s * XR, -H / 2, H / 2, 4), huecos: undefined })),
  { id: 'rotulo.2', tipo: 'texto', txt: '2 · RIELES ×2', pos: [-395, -440, .3], alto: 24 },
];

export default {
  id: 'ch05', version: 1, pasosManual: NA, estimado: true,
  marca: marca('https://dege.com.ar/productos/estanteria-flotante-fm0hd/', ['#A7AC94', '#ffffff', '#e9e4d6', '#3a3a3a']),
  materiales: MATS('#A9AE97'),
  inventario: [{ id: 'B', n: 4, label: 'B · Tarugos n° 6' }, { id: 'A', n: 4, label: 'A · Tornillos' }],
  herramientas: [{ id: 'taladro', n: 1, label: 'Taladro con mecha n° 6', incluida: false }, { id: 'phillips', n: 1, label: 'Destornillador Phillips', incluida: false }],
  textos: textos({
    nombre: 'Estantería flotante', codigo: 'CH05', cabecera: 'Estantería flotante CH05', sust: 'estantería', art: 'la',
    ladoCuerpo: 'Dos rieles ranurados en la pared y tres estantes que se enganchan a la altura que quieras. Seguí los pasos y girá el modelo.',
    datos: [['layers', '5 piezas', '+ 8 herrajes'], ['steps', `${NA} pasos`, 'taladro y destornillador'], ['box', '80 × 80', 'cm · ancho y alto']],
    momTitulo: 'Tu estantería,<br><em>en la pared</em>', momCuerpo: 'Primero los dos rieles, después los estantes. Vas a necesitar un taladro con mecha n° 6, un destornillador y un nivel.',
    tips: [['space', 'Elegí la pared', 'Que no pasen caños ni cables por donde vas a agujerear'], ['kids', 'Usá un nivel', 'Los dos rieles tienen que quedar a la misma altura'], ['time', 'Sin apuro', 'Seguí los pasos en orden'], ['music', 'Y poné música', 'La que te acompañe mientras armás']],
    finCuerpo: 'Plantas, libros y lo que quieras mostrar. Los estantes se pueden cambiar de ranura cuando quieras.',
    finTip: 'Antes de cargarla, tirá suave de cada estante: tiene que quedar firme. ¡Mandanos una foto cuando la tengas armada!',
  }),
  cotas: { w: 80, d: 16.5, h: 80, unidad: 'cm', caja: [-W / 2, W / 2, 0, D + 6, 0, H], lineas: [
    [[W / 2, 2, H], [-W / 2, 2, H], [0, 0, 70], 80],
    [[-W / 2, 0, ZS[0]], [-W / 2, D + 6, ZS[0]], [-70, 0, 0], 16.5],
    [[XR + 30, 2, 0], [XR + 30, 2, H], [260, 0, 0], 80],
  ] },
  escenas: [
    { id: 'portada', grupo: 'Portada', vista: { yaw: -22, pitch: 12 }, piezas: [...rieles(), ...estantes()], mueven: [] },
    {
      id: 'orden', grupo: 'Antes de empezar', titulo: 'Ordená las piezas', titular: 'Revisá que estén todas',
      subs: { a: ['Sacá todo de la caja: 3 estantes y 2 rieles.', 'El número es el que vas a ver en cada paso.'], b: [], tip: 'Los rieles son las tiras largas con ranuras.' },
      usa: ['1 · Estantes ×3', '2 · Rieles ×2'],
      elegir: [{ m: ['pz.1'], t: 'Son los 3 estantes, iguales.' }, { m: ['pz.2'], t: 'Son los 2 rieles: van atornillados a la pared.' }],
      cuenta: { fijo: '5 piezas · 2 tipos' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 64 }, piezas: ordenPiezas(), resaltar: ['pz.2'], mueven: [mover('pz.2', 60)],
    },
    {
      id: 'herrajes', grupo: 'Antes de empezar', titulo: 'Contá los herrajes', titular: 'Contá antes de empezar',
      subs: { a: ['Son 4 tornillos A y 4 tarugos B.', 'Tocá cada grupo a medida que lo contás.'], b: [], tip: 'El taladro y el destornillador no vienen en la caja.' },
      usa: ['Taladro con mecha n° 6 (no incluido)', 'Destornillador (no incluido)'], check: [[4, 'A · Tornillos'], [4, 'B · Tarugos n° 6']],
      cuenta: { fijo: '8 herrajes' }, encuadrarTodo: true, vista: { yaw: -6, pitch: 56 },
      piezas: herrajes([{ letra: 'A', n: 4, tipo: 'tornillo' }, { letra: 'B', n: 4, tipo: 'tarugo' }], false), resaltar: ['h.A'], mueven: [mover('h.A', 60)],
    },
    paso(1, 'marcar', 'Presentá los rieles y marcá', [
      'Apoyá un estante en la pared con un nivel arriba: te marca dónde van los rieles.',
      'Presentá cada riel, derecho, y marcá sus dos perforaciones.',
    ], [pared(), ...rieles(), ...marcas()], {
      usa: ['2 · Rieles', 'Nivel y lápiz'], titular: 'Los dos rieles a la misma altura', resaltar: ['marca'], unir: ['pared'], encuadrarTodo: true,
      subs: { a: ['Apoyá un estante en la pared con un nivel arriba: te marca dónde van los rieles.', 'Presentá cada riel, derecho, y marcá sus dos perforaciones.'], b: [], tip: 'Entre riel y riel quedan 36 cm (a confirmar con fábrica).' },
      mueven: [mover('riel', 100, [0, 1, 0], 0)],
    }),
    paso(2, 'agujerear', 'Agujereá la pared', ['Sacá los rieles y agujereá en cada marca con una mecha n° 6.'], [pared(), ...marcas(), ...agujeros()], {
      usa: ['Taladro con mecha n° 6'], titular: 'Mecha n° 6 en cada marca', resaltar: ['agujero'], sinFantasma: true, encuadrarTodo: true,
      subs: { a: ['Sacá los rieles y agujereá en cada marca con una mecha n° 6.'], b: [], tip: 'Revisá que por ahí no pasen caños ni cables.' },
      mueven: [mover('agujero', 30, [0, 1, 0], 0)],
    }),
    paso(3, 'tarugos', 'Los tarugos', ['Meté un tarugo B en cada agujero, hasta que quede al ras.'], [pared(), ...agujeros(), ...tarugos()], {
      usa: ['B · Tarugos ×4'], hw: { B: 4 }, titular: 'Al ras de la pared', resaltar: ['B'], sinFantasma: true, encuadrarTodo: true,
      mueven: [mover('B', 70, [0, 1, 0], 0)],
    }),
    paso(4, 'rieles', 'Atornillá los rieles', ['Apoyá cada riel con sus perforaciones sobre los tarugos.'], [pared(), ...tarugos(), ...rieles(), ...tornillos()], {
      usa: ['2 · Rieles', 'A · Tornillos ×4', 'Destornillador'], hw: { A: 4 }, titular: 'Dos tornillos por riel', resaltar: ['riel', 'A'], sinFantasma: true, encuadrarTodo: true,
      subs: { a: ['Apoyá cada riel con sus perforaciones sobre los tarugos.'], b: ['Poné un tornillo A en cada perforación y ajustalo hasta que el riel quede firme.'], tip: '' },
      mueven: [mover('riel', 120, [0, 1, 0], 0), mover('A', 60, [0, 1, 0], .6)],
      fases: { pieza: ['riel'], hw: HW_A, retener: ['A'], ocultarEnA: HW_A, ref: 'A.0', vistaB: { yaw: -16, pitch: 8 }, titularB: 'Un tornillo en cada perforación', herramienta: { tipo: 'phillips', pos: [FIJ[0][0], T * 2 + 2.4, FIJ[0][1]], eje: [0, 1, 0] } },
    }),
    paso(5, 'estantes', 'Enganchá los estantes', [
      'Inclinado, meté la pestaña de atrás de un estante en las ranuras de los dos rieles.',
      'Bajalo hasta que quede derecho y trabado. Repetí con los otros dos.',
    ], completa(), {
      usa: ['1 · Estantes ×3'], titular: 'Inclinado, y después lo bajás', resaltar: ['est0', 'est1', 'est2'], unir: ['riel'], encuadrarTodo: true,
      cuenta: { de: 'est', n: 3, txt: 'Estante', fin: '3 estantes en su lugar' },
      subs: { a: ['Inclinado, meté la pestaña de atrás de un estante en las ranuras de los dos rieles.', 'Bajalo hasta que quede derecho y trabado. Repetí con los otros dos.'], b: [], tip: 'Usá la misma ranura en los dos rieles para que el estante quede derecho.' },
      mueven: ZS.map((z, i) => mover(`est${i}`, 120, [0, 1, 0], i * .4)),
    }),
    paso(6, 'revisar', 'Revisá que esté firme', ['Tirá suave de cada estante: no se tiene que soltar.', 'Si un riel se mueve, ajustá sus tornillos.'], completa(), {
      usa: ['Destornillador'], titular: 'Que no se mueva nada', sinFantasma: true, resaltar: ['A'], encuadrarTodo: true, vista: { yaw: -34, pitch: 14 },
    }),
    { id: 'fin', grupo: 'Listo', vista: { yaw: -22, pitch: 12 }, piezas: completa(), mueven: [] },
  ],
};
