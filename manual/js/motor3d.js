// Motor 3D del manual de armado DEGË.
// Arma cada escena a partir de piezas paramétricas (cilindros, perfiles extruidos, textos sobre superficies)
// y las dibuja con look de ilustración técnica: color plano por bandas (toon) + contorno oscuro + aristas.
// Unidades: milímetros. Eje Z hacia arriba; el piso es z = 0. Adelante = +Y, derecha = +X.
import * as THREE from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);
const Z = new THREE.Vector3(0, 0, 1);
const RAD = Math.PI / 180;

// ── materiales: bandas de luz (como las 4 bandas del original) ──
const BANDAS = (() => {
  const v = [150, 196, 228, 255];
  const d = new Uint8Array(v.length * 4);
  v.forEach((x, i) => d.set([x, x, x, 255], i * 4));
  const t = new THREE.DataTexture(d, v.length, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
})();

const CONTORNO_VS = `
uniform float uPx; uniform vec2 uRes;
void main(){
  vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * normal);
  vec2 d = n.xy; float l = length(d);
  d = l > 1e-4 ? d / l : vec2(0.0);
  clip.xy += d * uPx * 2.0 / uRes * clip.w;
  // Un poco detrás de la superficie: en chapas finas, triángulos del casco que se dan vuelta al inflarse
  // quedaban a la misma profundidad que la cara y dibujaban rayas oscuras sobre ella.
  // Mínimo 10 mm; si el mueble se ve chico (muchos mm por píxel) el retroceso crece con la escala:
  // con 10 mm fijos, las chapas con agujeros mostraban puntitos en la portada y el cierre (CH04).
  float mmPx = 2.0 / (projectionMatrix[0][0] * uRes.x);
  float atras = max(10.0, 6.0 * uPx * mmPx);
  clip.z += atras * (-projectionMatrix[2][2]) * clip.w;   // cámara ortográfica: −P22 = 2 / (far − near)
  gl_Position = clip;
}`;
const CONTORNO_FS = `uniform vec3 uColor; uniform float uOpacity; void main(){ gl_FragColor = vec4(uColor, uOpacity); }`;

function matContorno(res, px, color, opacity) {
  return new THREE.ShaderMaterial({
    uniforms: { uPx: { value: px }, uRes: { value: res }, uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity } },
    vertexShader: CONTORNO_VS,
    fragmentShader: CONTORNO_FS,
    side: THREE.BackSide,
    transparent: opacity < 1,
    depthWrite: opacity >= 1,
  });
}

// ── formas 2D ──
function formaEstadio(w, d) {
  const r = d / 2, a = w / 2 - r, s = new THREE.Shape();
  s.moveTo(-a, -r);
  s.lineTo(a, -r);
  s.absarc(a, 0, r, -Math.PI / 2, Math.PI / 2, false);
  s.lineTo(-a, r);
  s.absarc(-a, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);
  return s;
}
// Herradura plana: curva hacia -X, abertura hacia +X, puntas redondeadas.
function formaU(w, d, banda) {
  const r = d / 2, ri = r - banda, cx = -w / 2 + r;
  const punta = w / 2 - banda / 2, s = new THREE.Shape();
  s.moveTo(punta, -r);
  s.lineTo(cx, -r);
  s.absarc(cx, 0, r, -Math.PI / 2, -3 * Math.PI / 2, true);
  s.lineTo(punta, r);
  s.absarc(punta, r - banda / 2, banda / 2, Math.PI / 2, -Math.PI / 2, true);
  s.lineTo(cx, ri);
  s.absarc(cx, 0, ri, Math.PI / 2, 3 * Math.PI / 2, false);
  s.lineTo(punta, -ri);
  s.absarc(punta, -r + banda / 2, banda / 2, Math.PI / 2, -Math.PI / 2, true);
  s.closePath();
  return s;
}
function formaRedondeada(w, d, r) {
  r = Math.min(r, w / 2, d / 2);
  const x = -w / 2, y = -d / 2, s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d);
  s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
// flecha de giro: arco de corona + punta
function formaGiro(r0, r1, desde, hasta) {
  const s = new THREE.Shape(), a0 = desde * RAD, a1 = hasta * RAD;
  s.absarc(0, 0, r1, a0, a1, false);
  s.absarc(0, 0, r0, a1, a0, true);
  s.closePath();
  // punta al principio del arco, apuntando en sentido horario
  const rm = (r0 + r1) / 2, ex = Math.cos(a0), ey = Math.sin(a0), tx = Math.sin(a0), ty = -Math.cos(a0);
  const p = new THREE.Shape();
  const w = (r1 - r0) * 1.35, L = (r1 - r0) * 2.2;
  p.moveTo(ex * (rm - w), ey * (rm - w));
  p.lineTo(ex * (rm + w), ey * (rm + w));
  p.lineTo(ex * rm + tx * L, ey * rm + ty * L);
  p.closePath();
  return [s, p];
}

// ── texto/insignia pintado sobre una superficie ──
function texturaTexto(txt, o) {
  const fs = 64, pad = 18, c = document.createElement("canvas"), g = c.getContext("2d");
  const font = (o.peso || 700) + " " + fs + "px 'DM Sans', Arial, sans-serif";
  g.font = font;
  const tw = g.measureText(txt).width;
  const ins = o.insignia;
  c.width = Math.ceil(ins ? Math.max(tw, fs) + pad * 2.6 : tw + pad * 2);
  c.height = Math.ceil(ins ? c.width * (o.aspecto || 0.62) : fs + pad * 2);
  g.font = font;
  g.textAlign = "center";
  g.textBaseline = "middle";
  if (ins) {
    g.fillStyle = o.fondo || "#151515";
    g.beginPath();
    g.ellipse(c.width / 2, c.height / 2, c.width / 2 - 2, c.height / 2 - 2, 0, 0, Math.PI * 2);
    g.fill();
  }
  if (o.espaciado) g.letterSpacing = o.espaciado + "px";
  g.fillStyle = o.color || "#2d2a24";
  g.fillText(txt, c.width / 2, c.height / 2 + 3);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return { t, ar: c.width / c.height };
}

// manta / cartón del piso: líneas suaves
function texturaManta(w, d, lineas, divisiones) {
  const k = 1024 / Math.max(w, d), c = document.createElement("canvas");
  c.width = Math.round(w * k); c.height = Math.round(d * k);
  const g = c.getContext("2d");
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = "rgba(90,70,40,.16)"; g.lineWidth = 2;
  const n = lineas ?? Math.round(w / 110);
  for (let i = 1; i < n; i++) { const x = (c.width * i) / n + Math.sin(i * 7.3) * 6; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + c.width * 0.012, c.height); g.stroke(); }
  if (divisiones) {
    g.strokeStyle = "rgba(90,70,40,.35)"; g.lineWidth = 3;
    for (const xx of divisiones) { const x = (xx / w + 0.5) * c.width; g.beginPath(); g.moveTo(x, c.height * 0.08); g.lineTo(x, c.height * 0.92); g.stroke(); }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ── geometría de cada tipo de pieza (en coordenadas locales de la pieza) ──
function geometria(p) {
  switch (p.tipo) {
    case "cilindro": {
      const L = p.s1 - p.s0, g = new THREE.CylinderGeometry(p.r, p.r, L, p.seg || 36, 1, false);
      g.rotateX(Math.PI / 2);
      g.translate(0, 0, p.s0 + L / 2);
      return g;
    }
    case "perfil": {
      const shape = p.puntos ? new THREE.Shape(p.puntos.map(([x, y]) => new THREE.Vector2(x, y)))
        : p.forma === "estadio" ? formaEstadio(p.w, p.d)
        : p.forma === "u" ? formaU(p.w, p.d, p.banda ?? 55)
        : formaRedondeada(p.w, p.d, p.r ?? 0);
      // Calados reales, en el plano local del perfil (manijas, canaletas y agujeros).
      for (const h of p.huecos || []) {
        const contorno = formaRedondeada(h.w, h.d, h.r ?? 0);
        const puntos = contorno.getPoints(28).map(v => v.add(new THREE.Vector2(h.x || 0, h.y || 0)));
        shape.holes.push(new THREE.Path(puntos));
      }
      const g = new THREE.ExtrudeGeometry(shape, { depth: p.z1 - p.z0, bevelEnabled: false, curveSegments: 28 });
      g.translate(0, 0, p.z0);
      g.userData.contorno = { shape, z0: p.z0, z1: p.z1 };
      return g;
    }
    case "giro": {
      const g = new THREE.ExtrudeGeometry(formaGiro(p.r0, p.r1, p.desde, p.hasta), { depth: 1.6, bevelEnabled: false, curveSegments: 20 });
      g.translate(0, 0, -0.8);
      return g;
    }
  }
  return null;
}

// Las formas con arcos dejan triángulos de área ~0 (un arco que arranca justo en el punto final de una recta).
// Su normal es indefinida y EdgesGeometry los dibuja como aristas: diagonales sueltas cruzando caras planas.
// Para las aristas se usa una copia sin esos triángulos (la malla visible no cambia).
function sinDegenerados(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo.clone(), pos = g.attributes.position, keep = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), ab = new THREE.Vector3(), ac = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); c.fromBufferAttribute(pos, i + 2);
    const area2 = ab.subVectors(b, a).cross(ac.subVectors(c, a)).length();
    const lado = Math.max(a.distanceTo(b), b.distanceTo(c), c.distanceTo(a));
    if (area2 > 1e-6 && area2 / (lado * lado) > 1e-5) for (let k = 0; k < 3; k++) keep.push(pos.getX(i + k), pos.getY(i + k), pos.getZ(i + k));
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(keep, 3));
  return out;
}

// Aristas de un perfil extruido sacadas del contorno (no de los triángulos): borde de arriba, borde de abajo
// y verticales sólo en las esquinas vivas. Los "puentes" que la triangulación tiende entre un agujero y el
// borde, o los triángulos de área cero de los arcos, no pueden aparecer como líneas sueltas sobre la chapa.
function aristasPerfil({ shape, z0, z1 }) {
  const { shape: externo, holes } = shape.extractPoints(28), seg = [];
  for (let lazo of [externo, ...holes]) {
    lazo = lazo.filter((v, i, a) => v.distanceTo(a[(i + a.length - 1) % a.length]) > 1e-4);
    const n = lazo.length;
    for (let i = 0; i < n; i++) {
      const a = lazo[i], b = lazo[(i + 1) % n], prev = lazo[(i + n - 1) % n];
      seg.push(a.x, a.y, z0, b.x, b.y, z0, a.x, a.y, z1, b.x, b.y, z1);
      const d1 = a.clone().sub(prev).normalize(), d2 = b.clone().sub(a).normalize();
      if (Math.acos(Math.max(-1, Math.min(1, d1.dot(d2)))) > 28 * RAD) seg.push(a.x, a.y, z0, a.x, a.y, z1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(seg, 3));
  return g;
}

export class Motor {
  constructor(canvas, producto) {
    this.P = producto;
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, stencil: true });
    this.renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 20000);
    this.cam.up.set(0, 0, 1);
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.55));
    const sol = new THREE.DirectionalLight(0xffffff, 2.1);
    sol.position.set(-0.55, 0.75, 1.1);
    this.sol = sol;
    this.scene.add(sol, sol.target);
    this.res = new THREE.Vector2(1, 1);
    this.escenas = [];
    this.actual = -1;
    this.mats = {};
    this.right = new THREE.Vector3();
    this.upv = new THREE.Vector3();
    this.dir = new THREE.Vector3();
    this._v = new THREE.Vector3();
  }

  material(nombre) {
    if (this.mats[nombre]) return this.mats[nombre];
    const def = this.P.materiales[nombre] || { acero: { color: "#cfd3d6" }, mango: { color: "#d9472b" }, senal: { color: "#ff6a3d" } }[nombre] || { color: "#999999" };
    const m = new THREE.MeshToonMaterial({ color: new THREE.Color(def.color), gradientMap: BANDAS, transparent: !!def.opacidad, opacity: def.opacidad ?? 1 });
    m.userData.base = { opacity: def.opacidad ?? 1, transparent: !!def.opacidad };
    return (this.mats[nombre] = m);
  }

  // construye (una vez) el grupo 3D de la escena i
  construir(i) {
    if (this.escenas[i]) return this.escenas[i];
    const S = this.P.escenas[i], grupo = new THREE.Group(), nodos = new Map();
    const lista = [...(S.piezas || [])];
    for (const p of lista) {
      const nodo = this.pieza(p);
      if (!nodo) continue;
      grupo.add(nodo);
      nodos.set(p.id, nodo);
    }
    // herramienta del segundo tiempo (llave Allen que gira sobre el tornillo) + flecha de giro
    let herramienta = null, flecha = null;
    const H = S.fases && S.fases.herramienta;
    if (H) {
      herramienta = new THREE.Group();
      herramienta.position.set(...H.pos);
      const piv = new THREE.Group();
      herramienta.add(piv);
      // H.tipo: "allen" (llave en L, por defecto) o "phillips" (destornillador: vástago + mango, en el eje del tornillo).
      const partes = H.tipo === "phillips"
        ? [this.pieza({ id: "llave3d.vastago", tipo: "cilindro", pos: [0, 0, 0], s0: 0.4, s1: 75, r: 2.6, mat: "acero", seg: 16 }),
           this.pieza({ id: "llave3d.mango", tipo: "cilindro", pos: [0, 0, 0], s0: 75, s1: 170, r: 13, mat: "mango", seg: 20 })]
        : [this.pieza({ id: "llave3d.corto", tipo: "cilindro", pos: [0, 0, 0], s0: 0.4, s1: 26, r: 3, mat: "acero" }),
           this.pieza({ id: "llave3d.largo", tipo: "cilindro", pos: [0, 0, 23], eje: [0.8, -0.6, 0], s0: 3.2, s1: 82, r: 3, mat: "acero" })];
      piv.add(...partes);
      herramienta.userData.piv = piv;
      herramienta.userData.partes = partes;
      grupo.add(herramienta);
      // H.eje (opcional): dirección del tornillo hacia afuera. Por defecto, vertical (cabeza hacia arriba).
      const ejeH = new THREE.Vector3(...(H.eje || [0, 0, 1])).normalize();
      herramienta.quaternion.setFromUnitVectors(Z, ejeH);
      flecha = this.pieza({ id: "giro3d", tipo: "giro", pos: [H.pos[0] + ejeH.x * 14, H.pos[1] + ejeH.y * 14, H.pos[2] + ejeH.z * 14], eje: H.eje, r0: 13.5, r1: 18.5, desde: -150, hasta: 128, mat: "senal", sinContorno: true });
      grupo.add(flecha);
    }
    grupo.visible = false;
    this.scene.add(grupo);
    return (this.escenas[i] = { grupo, nodos, herramienta, flecha });
  }

  pieza(p) {
    const nodo = new THREE.Group();
    nodo.userData = { id: p.id, def: p, mallas: [], contornos: [], brillos: [] };
    const cuerpo = new THREE.Group();
    nodo.add(cuerpo);
    if (p.pos) cuerpo.position.set(p.pos[0], p.pos[1], p.pos[2] || 0);
    if (p.eje) cuerpo.quaternion.setFromUnitVectors(Z, new THREE.Vector3(...p.eje).normalize());
    // textos e insignias: por defecto se leen desde adelante (la cámara mira desde +Y)
    const rot = p.rot ?? (p.tipo === "texto" || p.tipo === "insignia" ? 180 : 0);
    if (rot) cuerpo.rotation.z = rot * RAD;
    // Rotación rígida adicional en ejes globales, también para perfiles orientados.
    if (p.rotacion) cuerpo.quaternion.premultiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...p.rotacion.map(a => a * RAD))));

    if (p.tipo === "texto" || p.tipo === "insignia") {
      const { t, ar } = texturaTexto(p.txt, { insignia: p.tipo === "insignia", color: p.color || (p.tipo === "insignia" ? "#ffffff" : "#3a3328"), fondo: p.fondo, espaciado: p.espaciado, aspecto: p.aspecto });
      const h = p.alto || 20, geo = new THREE.PlaneGeometry(h * ar, h);
      const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
      const malla = new THREE.Mesh(geo, m);
      malla.renderOrder = 2;
      cuerpo.add(malla);
      nodo.userData.mallas.push(malla);
      nodo.userData.decal = true;
      // Los nombres de las piezas (tipo "texto") se dibujan como etiquetas de pantalla (app.js → rotulos): pintados
      // sobre la manta se achicaban con el zoom y en el celular no se leían. La malla queda solo para ubicarlos.
      if (p.tipo === "texto") { malla.visible = false; nodo.userData.rotulo = p.txt; }
      return nodo;
    }
    if (p.tipo === "manta") {
      const base = new THREE.Mesh(new THREE.ExtrudeGeometry(formaRedondeada(p.w, p.d, p.r ?? 18), { depth: p.alto ?? 12, bevelEnabled: false, curveSegments: 10 }), this.material(p.mat || "carton"));
      base.position.z = -(p.alto ?? 12);
      const tapa = new THREE.Mesh(new THREE.ShapeGeometry(formaRedondeada(p.w - 2, p.d - 2, p.r ?? 18), 10), new THREE.MeshBasicMaterial({ map: texturaManta(p.w, p.d, p.lineas, p.divisiones), color: new THREE.Color(this.P.materiales[p.mat || "carton"].color), polygonOffset: true, polygonOffsetFactor: 1 }));
      // UV del ShapeGeometry = coordenadas en mm → normalizar a 0..1
      const uv = tapa.geometry.attributes.uv;
      for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) / p.w + 0.5, uv.getY(k) / p.d + 0.5);
      tapa.position.z = 0.05;
      cuerpo.add(base, tapa);
      nodo.userData.mallas.push(base);
      this.contorno(base, nodo, 1.1);
      nodo.userData.manta = true;
      return nodo;
    }
    const geo = geometria(p);
    if (!geo) return null;
    const malla = new THREE.Mesh(geo, this.material(p.mat));
    cuerpo.add(malla);
    nodo.userData.mallas.push(malla);
    // aristas marcadas (bordes de tapas, cantos de los caños)
    if (!p.sinAristas) {
      const ar = new THREE.LineSegments(geo.userData.contorno ? aristasPerfil(geo.userData.contorno) : new THREE.EdgesGeometry(sinDegenerados(geo), 28), new THREE.LineBasicMaterial({ color: 0x2c2b27, transparent: true, opacity: 0.55 }));
      cuerpo.add(ar);
      nodo.userData.aristas = ar;
    }
    if (!p.sinContorno) this.contorno(malla, nodo, p.grosor || 1.15);
    return nodo;
  }

  // contorno (casco invertido con normales suaves) + dos cascos de brillo naranja para resaltar
  contorno(malla, nodo, px) {
    let g = malla.geometry.clone();
    g.deleteAttribute("normal"); g.deleteAttribute("uv");
    g = mergeVertices(g, 0.01);
    g.computeVertexNormals();
    const c = new THREE.Mesh(g, matContorno(this.res, px, "#2a2925", 1));
    c.renderOrder = -1;
    malla.parent.add(c);
    c.position.copy(malla.position);
    nodo.userData.contornos.push(c);
    for (const [k, [w, o]] of [[9, 0.16], [4.5, 0.42]].entries()) {
      // Cada capa del brillo se pinta una sola vez por píxel (stencil): sin esto, los triángulos del casco
      // que se pisan suman transparencia y el halo sale con manchas en escalón.
      const mb = matContorno(this.res, w, "#ff8a4c", o), bit = 1 << k;
      Object.assign(mb, { stencilWrite: true, stencilRef: bit, stencilFuncMask: bit, stencilWriteMask: bit, stencilFunc: THREE.NotEqualStencilFunc, stencilZPass: THREE.ReplaceStencilOp });
      const b = new THREE.Mesh(g, mb);
      b.visible = false;
      b.renderOrder = 1;
      malla.parent.add(b);
      b.position.copy(malla.position);
      nodo.userData.brillos.push(b);
    }
  }

  mostrar(i) {
    this.construir(i);
    if (this.actual !== i) {
      this.escenas.forEach((e, j) => e && (e.grupo.visible = j === i));
      this.actual = i;
    }
    return this.escenas[i];
  }

  // movimientos: cada pieza cuyo id empieza con m.p se desplaza v mm en la dirección m.dir
  pose(i, valores, movers) {
    const E = this.escenas[i];
    if (!E) return;
    for (const nodo of E.nodos.values()) nodo.position.set(0, 0, 0);
    for (const m of movers) {
      let v = valores[m.nombre] || 0;
      // Trayecto opcional [progreso, desplazamiento mm]. Conserva el reloj,
      // la pausa/repetición y la pose final de la interfaz existente.
      if (m.trayecto) {
        const t = Math.max(0, Math.min(1, 1 - v / m.recorrido));
        const j = m.trayecto.findIndex(([at]) => at >= t);
        const b = m.trayecto[j < 0 ? m.trayecto.length - 1 : j];
        const a = m.trayecto[Math.max(0, j - 1)];
        const k = a[0] === b[0] ? 0 : (t - a[0]) / (b[0] - a[0]);
        v = a[1] + (b[1] - a[1]) * k;
      }
      if (!v) continue;
      const d = m.dir || [0, 0, 1], pre = [].concat(m.p);
      for (const [id, nodo] of E.nodos) if (pre.some((p) => p === "*" ? !nodo.userData.manta : id === p || id.startsWith(p + "."))) nodo.position.set(d[0] * v, d[1] * v, d[2] * v);
    }
  }

  herramienta(i, on, angulo, flecha) {
    const E = this.escenas[i];
    if (!E || !E.herramienta) return;
    E.herramienta.visible = on;
    E.herramienta.userData.piv.rotation.z = -angulo * RAD;
    E.flecha.visible = flecha;
  }

  // estado visual de cada pieza: oculta, fantasma (translúcida), resaltada (brillo naranja), atenuada
  estado(i, fn) {
    const E = this.escenas[i];
    if (!E) return;
    for (const [id, nodo] of E.nodos) {
      const st = fn(id, nodo.userData) || {};
      nodo.visible = !st.oculta;
      const U = nodo.userData;
      const op = st.opacidad ?? 1;
      U.op = op;
      for (const m of U.mallas) {
        if (U.decal) { m.material.opacity = op; continue; }
        if (U.manta) continue;
        const mat = m.material;
        if (op < 1) {
          if (!m.userData.propio) { m.material = mat.clone(); m.userData.propio = true; }
          m.material.transparent = true; m.material.opacity = op; m.material.depthWrite = op > 0.6;
        } else if (m.userData.propio) {
          m.material.transparent = m.material.userData.base?.transparent || false; m.material.opacity = m.material.userData.base?.opacity ?? 1; m.material.depthWrite = true;
        }
      }
      for (const c of U.contornos) { c.visible = op > 0.6; }
      if (U.aristas) U.aristas.material.opacity = 0.55 * op;
      for (const b of U.brillos) b.visible = !!st.brillo;
      if (st.brillo) for (const b of U.brillos) b.material.uniforms.uOpacity.value = (b === U.brillos[0] ? 0.16 : 0.42) * st.brillo;
    }
  }

  // cámara: yaw/pitch en grados (yaw 0 = de frente, negativo = se ve también el lateral derecho)
  orientar(yaw, pitch) {
    const a = yaw * RAD, e = Math.max(-80, Math.min(80, pitch)) * RAD;
    this.dir.set(Math.sin(a) * Math.cos(e), Math.cos(a) * Math.cos(e), Math.sin(e));
    this.cam.position.copy(this.dir).multiplyScalar(6000);
    this.cam.lookAt(0, 0, 0);
    this.cam.updateMatrixWorld();
    this.right.setFromMatrixColumn(this.cam.matrixWorld, 0);
    this.upv.setFromMatrixColumn(this.cam.matrixWorld, 1);
    // la luz acompaña a la cámara (siempre ilumina desde arriba a la izquierda del encuadre)
    this.sol.position.copy(this.dir).multiplyScalar(0.6).addScaledVector(this.right, -0.55).addScaledVector(Z, 0.9);
  }

  proyectar(p) {
    const v = this._v.set(p[0], p[1], p[2]);
    return [v.dot(this.right), v.dot(this.upv)];
  }

  // caja en el plano de la cámara (mm) de las piezas que cumplen el filtro
  caja(i, filtro) {
    const E = this.escenas[i], B = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    if (!E) return B;
    E.grupo.updateMatrixWorld(true);
    const v = this._v;
    const sumar = (nodo) => {
      for (const m of nodo.userData.mallas) {
        const pos = m.geometry.attributes.position, mw = m.matrixWorld, paso = pos.count > 400 ? 3 : 1;
        for (let k = 0; k < pos.count; k += paso) {
          v.fromBufferAttribute(pos, k).applyMatrix4(mw);
          const x = v.dot(this.right), y = v.dot(this.upv);
          if (x < B.x0) B.x0 = x; if (x > B.x1) B.x1 = x; if (y < B.y0) B.y0 = y; if (y > B.y1) B.y1 = y;
        }
      }
    };
    for (const [id, nodo] of E.nodos) if (nodo.visible && filtro(id, nodo.userData)) sumar(nodo);
    if (E.herramienta && E.herramienta.visible && filtro("llave3d", {})) for (const n of E.herramienta.userData.partes) sumar(n);
    return B;
  }

  // etiquetas de las piezas de la escena i: texto y posición en el plano de la cámara (mm)
  rotulos(i) {
    const E = this.escenas[i], out = [];
    if (!E) return out;
    E.grupo.updateMatrixWorld(true);
    for (const [id, nodo] of E.nodos) {
      const U = nodo.userData;
      if (!U.rotulo) continue;
      U.mallas[0].getWorldPosition(this._v);
      out.push({ id, txt: U.rotulo, x: this._v.dot(this.right), y: this._v.dot(this.upv), op: nodo.visible ? (U.op ?? 1) : 0 });
    }
    return out;
  }

  tamano(w, h) {
    this.renderer.setSize(w, h, false);
    this.res.set(w, h);
  }

  dibujar(vista) {
    const c = this.cam;
    c.left = vista.cx - vista.w / 2; c.right = vista.cx + vista.w / 2;
    c.top = vista.cy + vista.h / 2; c.bottom = vista.cy - vista.h / 2;
    c.updateProjectionMatrix();
    this.renderer.render(this.scene, c);
  }
}
