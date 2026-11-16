// Mesa de 3 patas con 2 travesaños que salen de una misma pata (CH22 gota y las dos mesas del set CH24).
// ESTIMADO: sale de las fotos y el plano de la ficha; ver estudio/estimados-notas.md.
import { cil, perfil, agujero, barra, regaton, allen, idsAllen, lateral, REG, R_CANO } from './_estimado.js?v=0c6ddde886';

const R_BARRA = 6;

// cfg: { pre, contorno, patas: { a: [x, y], b, c }, hub: 'c', alto, zBarra, off: [dx, dy] }
export function mesa3(cfg) {
  const { pre, hub, alto, zBarra } = cfg, off = cfg.off || [0, 0];
  const P = Object.fromEntries(Object.entries(cfg.patas).map(([k, [x, y]]) => [k, [x + off[0], y + off[1]]]));
  const K = Object.keys(P), lejos = K.filter((k) => k !== hub), zT = alto - 2.5;
  const dir = (k) => { const v = [P[k][0] - P[hub][0], P[k][1] - P[hub][1]], L = Math.hypot(...v); return [v[0] / L, v[1] / L]; };
  const regatones = () => K.map((k) => regaton(`${pre}.reg.${k}`, P[k]));
  const patas = () => K.map((k) => cil(`${pre}.pata.${k}`, [...P[k], REG], zT - REG, R_CANO));
  const barras = () => lejos.map((k) => { const [dx, dy] = dir(k), a = P[hub], b = P[k];
    return barra(`${pre}.barra.${k}`, [a[0] + dx * R_CANO, a[1] + dy * R_CANO, zBarra], [b[0] - dx * R_CANO, b[1] - dy * R_CANO, zBarra], R_BARRA); });
  // tornillos B: en la pata lejana entran desde afuera; en la pata central, desde atrás de la pata
  const tornB = () => lejos.flatMap((k) => { const [dx, dy] = dir(k), a = P[hub], b = P[k];
    return [...lateral(`${pre}.B.${k}.lejos`, [b[0] + dx * R_CANO, b[1] + dy * R_CANO, zBarra], [dx, dy, 0]),
      ...lateral(`${pre}.B.${k}.centro`, [a[0] - dx * R_CANO, a[1] - dy * R_CANO, zBarra], [-dx, -dy, 0])]; });
  const idsB = () => lejos.flatMap((k) => [`${pre}.B.${k}.lejos`, `${pre}.B.${k}.centro`]).flatMap((id) => [`${id}.cana`, `${id}.cabeza`]);
  const tapa = () => ({ ...perfil(`${pre}.tapa`, cfg.contorno.map(([x, y]) => [x + off[0], y + off[1]]), zT, 2.5), huecos: K.map((k) => agujero(...P[k])) });
  const tornA = () => K.flatMap((k) => allen(`${pre}.A.${k}`, P[k], alto));
  const idsA = () => idsAllen(K.map((k) => `${pre}.A.${k}`));
  const completa = () => [...regatones(), ...patas(), ...barras(), ...tornB(), tapa(), ...tornA()];
  return { P, K, hub, lejos, zT, dir, regatones, patas, barras, tornB, idsB, tapa, tornA, idsA, completa };
}
