
export const cil = (id, pos, largo, r, mat = 'chapa', extra = {}) => ({ id, tipo: 'cilindro', pos, s0: 0, s1: largo, r, mat, seg: 24, ...extra });
export const caja = (id, x0, x1, y0, y1, z0, alto, mat = 'chapa') => ({ id, tipo: 'perfil', puntos: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], pos: [0, 0, z0], z0: 0, z1: alto, mat });
export const perfil = (id, puntos, z0, alto, mat = 'chapa', extra = {}) => ({ id, tipo: 'perfil', puntos, pos: [0, 0, z0], z0: 0, z1: alto, mat, ...extra });
export const manta = (w = 900, d = 760, extra = {}) => ({ id: 'manta', tipo: 'manta', w, d, r: 22, mat: 'carton', ...extra });
export const mover = (p, recorrido = 120, dir = [0, 0, 1], demora = 0) => ({ nombre: [].concat(p).join('+'), p, recorrido, dir, demora });
export const agujero = (x, y, d = 8.5) => ({ x, y, w: d, d, r: d / 2 });

export function barra(id, a, b, r, mat = 'chapa') {
  const v = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...v);
  return cil(id, a, L, r, mat, { eje: v.map((n) => n / L) });
}

export function circulo(r, cx = 0, cy = 0, n = 72) { return Array.from({ length: n }, (_, k) => { const a = 2 * Math.PI * k / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }); }
export function estadio(w, d, n = 24) {   // óvalo de lados rectos (w a lo largo de X)
  const r = d / 2, a = w / 2 - r, pts = [];
  for (let k = 0; k <= n; k++) { const t = -Math.PI / 2 + Math.PI * k / n; pts.push([a + r * Math.cos(t), r * Math.sin(t)]); }
  for (let k = 0; k <= n; k++) { const t = Math.PI / 2 + Math.PI * k / n; pts.push([-a + r * Math.cos(t), r * Math.sin(t)]); }
  return pts;
}
export function gota(w, d, n = 96) {      // tapa orgánica: más ancha del lado +X, se afina hacia −X
  const raw = Array.from({ length: n }, (_, k) => { const t = 2 * Math.PI * k / n; return [Math.cos(t), Math.sin(t) * (1 + 0.28 * Math.cos(t)) + 0.06 * Math.sin(2 * t)]; });
  const ys = raw.map((p) => p[1]), sy = d / (Math.max(...ys) - Math.min(...ys)), cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  return raw.map(([x, y]) => [x * w / 2, (y - cy) * sy]);
}
export function dentroDe(pts, x, y) {      // punto dentro de un contorno (para chequear patas)
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; }
  return c;
}

export const REG = 12, R_CANO = 11;
export const regaton = (id, [x, y], z = 0) => cil(id, [x, y, z], REG, 9.5, 'negro');
export const esparrago = (id, [x, y], z) => cil(id, [x, y, z - 20], 44, 4, 'zinc', { seg: 14 });
export const allen = (id, [x, y], z) => [
  cil(`${id}.cana`, [x, y, z], 22, 3, 'zinc', { eje: [0, 0, -1], seg: 14 }),
  cil(`${id}.cabeza`, [x, y, z], 3, 7, 'negro', { seg: 24 }),
  cil(`${id}.hex`, [x, y, z + 3], .2, 2.5, 'oscuro', { seg: 6, sinContorno: true, sinAristas: true }),
];
export const idsAllen = (ids) => ids.flatMap((id) => [`${id}.cana`, `${id}.cabeza`, `${id}.hex`]);
export const lateral = (id, pos, dir) => [
  cil(`${id}.cana`, pos, 16, 2.5, 'zinc', { eje: dir.map((n) => -n), seg: 12 }),
  cil(`${id}.cabeza`, pos, 2.6, 5.5, 'negro', { eje: dir, seg: 20 }),
];
export const llave = (x, y) => [
  cil('llave.corto', [x, y, 3], 26, 3, 'zinc', { eje: [-1, 0, 0], seg: 12 }),
  cil('llave.largo', [x, y, 3], 82, 3, 'zinc', { eje: [0, 1, 0], seg: 12 }),
];

export function herrajes(grupos, conLlave = true) {
  const out = [manta(Math.max(520, 150 * grupos.length + 220), 320, { lineas: 0 })];
  const x0 = -((grupos.length - (conLlave ? 0 : 1)) * 150) / 2;
  grupos.forEach(({ letra, n, tipo }, g) => {
    const cx = x0 + g * 150;
    for (let i = 0; i < n; i++) {
      const x = cx - 40 + (i % 3) * 40, y = -60 + Math.floor(i / 3) * 50, id = `h.${letra}.${i}`;
      if (tipo === 'esparrago') out.push(cil(id, [x, y, 4], 44, 4, 'zinc', { eje: [1, 0, 0], seg: 14 }));
      else if (tipo === 'regaton') out.push(cil(id, [x, y, 0], REG, 9.5, 'negro'));
      else if (tipo === 'tarugo') out.push(cil(id, [x, y, 3.6], 30, 3.6, 'tarugo', { eje: [0, 1, 0] }));
      else out.push(cil(id + '.cana', [x, y, 0], tipo === 'tornillo' ? 16 : 22, tipo === 'tornillo' ? 2.5 : 3, 'zinc', { seg: 14 }), cil(id + '.cabeza', [x, y, tipo === 'tornillo' ? 16 : 22], 3, tipo === 'tornillo' ? 5.5 : 7, 'negro', { seg: 24 }));
    }
    out.push({ id: 'rotulo.' + letra, tipo: 'texto', txt: letra, pos: [cx, 110, .3], alto: 30 });
  });
  if (conLlave) { const xl = x0 + grupos.length * 150; out.push(...llave(xl, -40), { id: 'rotulo.llave', tipo: 'texto', txt: 'LLAVE', pos: [xl, 110, .3], alto: 22 }); }
  return out;
}

export function paso(NA, vistaBase) {
  return (num, id, titulo, a, piezas, extra = {}) => ({
    num, id, grupo: 'Armado', titulo: `${num}. ${titulo}`, titular: titulo,
    subs: { a, b: [], tip: '' }, usa: [], cuenta: { fijo: `Paso ${num} de ${NA}` },
    vista: vistaBase, piezas, mueven: [], resaltar: [], encuadrarTodo: false, ...extra,
  });
}

export function textos(cfg) {
  const A = cfg.art === 'la' ? 'a' : 'o';
  return {
    titulo: `Armá tu ${cfg.nombre} ${cfg.codigo} · DEGË Muebles`, cabecera: cfg.cabecera,
    ladoTitulo: `Tu ${cfg.sust}, <em>paso a paso</em>`, ladoCuerpo: cfg.ladoCuerpo,
    ladoNota: 'Abrilo desde el celu y tenelo al lado mientras armás.',
    teclaSig: 'Siguiente paso', teclaAnt: 'Paso anterior', teclaGirar: `Arrastrá ${cfg.art} ${cfg.sust} para girarl${A}`, girar: `Arrastrá para girar ${cfg.art} ${cfg.sust}`,
    portadaKicker: 'Manual de armado', portadaTitulo: `Armá tu <em>${cfg.sust}</em>, paso a paso`,
    datos: cfg.datos, retomarA: '¿Ya habías empezado?', retomarB: 'Seguí en el paso',
    momKicker: 'Antes de arrancar', momTitulo: cfg.momTitulo, momCuerpo: cfg.momCuerpo,
    momTips: cfg.tips || [
      ['space', 'Hacé lugar', 'Una manta o el cartón de la caja en el piso'],
      ['kids', 'Separá las piezas', 'Agrupá caños, tablas y herrajes antes de empezar'],
      ['time', 'Sin apuro', 'Seguí los pasos en orden'],
      ['music', 'Y poné música', 'La que te acompañe mientras armás'],
    ],
    momCta: 'Empezar a armar',
    finTitulo: `¡Tu ${cfg.sust} <em>está list${A}</em>! 🎉`, finCuerpo: cfg.finCuerpo,
    finTip: cfg.finTip || 'Guardá la llave: cada tanto, repasá los tornillos. ¡Mandanos una foto cuando lo tengas armado!',
    waTexto: `¡Hola DEGË! Estoy armando ${cfg.art} ${cfg.nombre} ${cfg.codigo} y tengo una duda 😊`,
    pie: 'DEGË Muebles · Muebles de chapa y caño, de Rosario a todo el país.',
    rvEjemplos: ['Lo armé en minutos 🙌', 'Re claro el paso a paso', 'Quedó firme y prolijo', 'El color, tal cual la foto'],
  };
}
export const marca = (tienda, confeti) => ({ nombre: 'DEGË Muebles', logo: 'assets/logo-dege.png', whatsapp: '5493413349022', tienda, instagram: 'https://instagram.com/dege.muebles', confeti });
export const MATS = (chapa, extra = {}) => ({
  chapa: { color: chapa }, zinc: { color: '#c9ced3' }, negro: { color: '#1f1f1f' }, oscuro: { color: '#0d0d0d' },
  tarugo: { color: '#ece6d6' }, pared: { color: '#efede8' }, marca: { color: '#4a4a4a' },
  carton: { color: '#e8d3b2' }, bolsa: { color: '#eef5f6', opacidad: .92 }, ...extra,
});
