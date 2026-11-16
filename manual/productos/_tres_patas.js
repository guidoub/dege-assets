import { cil, perfil, agujero, barra, regaton, allen, idsAllen, lateral, REG, R_CANO } from './_estimado.js?v=b1713398f9';

const R_BARRA = 6;
export const H_AGUJERO = { 1: 110, 3: 190 };   // altura del agujero de cada caño, desde la punta de abajo

export function mesa3(cfg) {
  const { pre, alto } = cfg, off = cfg.off || [0, 0];
  const P = Object.fromEntries(Object.entries(cfg.patas).map(([k, [x, y]]) => [k, [x + off[0], y + off[1]]]));
  const zT = alto - 2.5, z = (k) => REG + H_AGUJERO[k];
  const dir = (k) => { const v = [P[k][0] - P[2][0], P[k][1] - P[2][1]], L = Math.hypot(...v); return [v[0] / L, v[1] / L]; };
  const reg = (k) => regaton(`${pre}.reg.${k}`, P[k]);
  const pata = (k) => cil(`${pre}.cano.${k}`, [...P[k], REG], zT - REG, R_CANO);
  const travesano = (k) => { const [dx, dy] = dir(k), a = P[2], b = P[k];
    return barra(`${pre}.trav.${k}`, [a[0] + dx * R_CANO, a[1] + dy * R_CANO, z(k)], [b[0] - dx * R_CANO, b[1] - dy * R_CANO, z(k)], R_BARRA); };
  const tornA = (k, punta) => { const [dx, dy] = dir(k), a = P[2], b = P[k];
    return punta === 'lejos' ? lateral(`${pre}.A.${k}.lejos`, [b[0] + dx * R_CANO, b[1] + dy * R_CANO, z(k)], [dx, dy, 0])
      : lateral(`${pre}.A.${k}.centro`, [a[0] - dx * R_CANO, a[1] - dy * R_CANO, z(k)], [-dx, -dy, 0]); };
  const idsA = (k, punta) => [`${pre}.A.${k}.${punta}.cana`, `${pre}.A.${k}.${punta}.cabeza`];
  const chapa = () => ({ ...perfil(`${pre}.chapa`, cfg.contorno.map(([x, y]) => [x + off[0], y + off[1]]), zT, 2.5), huecos: [1, 2, 3].map((k) => agujero(...P[k])) });
  const tornB = () => [1, 2, 3].flatMap((k) => allen(`${pre}.B.${k}`, P[k], alto));
  const idsB = () => idsAllen([1, 2, 3].map((k) => `${pre}.B.${k}`));
  const patas = () => [1, 2, 3].flatMap((k) => [reg(k), pata(k)]);
  const estructura = () => [...patas(), travesano(1), travesano(3), ...tornA(1, 'lejos'), ...tornA(1, 'centro'), ...tornA(3, 'lejos'), ...tornA(3, 'centro')];
  const completa = () => [...estructura(), chapa(), ...tornB()];
  return { P, z, dir, reg, pata, travesano, tornA, idsA, chapa, tornB, idsB, patas, estructura, completa };
}
