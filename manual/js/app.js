// Manual de armado DEGË · interfaz
// Carga el producto (?p=mesa-ratona por defecto), arma las escenas con el motor 3D y maneja todo el recorrido:
// portada → «Antes de arrancar» → pasos (con dos tiempos cuando hay herrajes) → cierre → reseña.
import { Motor } from "./motor3d.js?v=b05813be06";
import { IC, GRUPO_IC } from "./iconos.js?v=b05813be06";

const qs = new URLSearchParams(location.search);
const ID = (qs.get("p") || "ch29").replace(/[^a-z0-9-]/g, "");
const P = (await import(`../productos/${ID}.js?v=b05813be06`)).default;
const T = P.textos, S = P.escenas, N = S.length, LAST = N - 1, STEPS = N - 2;
const KEY = "dege:manual:" + P.id;
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (q, el = document) => el.querySelector(q);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
const ses = { get(k) { try { return sessionStorage.getItem(k); } catch { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch {} } };
const coincide = (lista, id) => !!lista && lista.some((p) => p === "*" || id === p || id.startsWith(p + "."));
const follow = (a, b, dt, s) => b + (a - b) * Math.exp(-dt / s);

// medición: no manda nada por defecto. Para medir, definir window.MANUAL_MEDIR = (evento, datos) => {…} antes de cargar.
const yaMedido = new Set();
function medir(ev, datos, cadaVez) {
  if (!cadaVez) { if (yaMedido.has(ev)) return; yaMedido.add(ev); }
  try { window.MANUAL_MEDIR && window.MANUAL_MEDIR(ev, { producto: P.id, ...datos }); } catch {}
  dispatchEvent(new CustomEvent("manual:evento", { detail: { evento: ev, producto: P.id, ...datos } }));
}

// ── selector de producto para el equipo ──
// Se muestra cuando el manual se abre directo (no dentro del modal de la ficha). Con ?solo se oculta (p. ej. el QR de la caja).
const enMarco = (() => { try { return window.self !== window.top; } catch { return true; } })();
if (!enMarco && !qs.has("solo")) {
  fetch("productos/indice.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : [])).then((lista) => {
    if (!lista.length) return;
    const opciones = lista.map((p) => '<option value="' + p.id + '"' + (p.id === ID ? " selected" : "") + ">" + p.codigo + " · " + p.nombre + "</option>").join("")
      + (lista.some((p) => p.id === ID) ? "" : '<option value="' + ID + '" selected>' + ID.toUpperCase() + "</option>");
    document.querySelectorAll("[data-elegir]").forEach((el, i) => {
      el.innerHTML = '<label for="elegir-' + i + '">Ver otro producto</label><span class="caja"><select id="elegir-' + i + '" aria-label="Elegí el producto">' + opciones + "</select></span><small>" + lista.length + " manuales listos</small>";
      el.hidden = false;
      el.querySelector("select").addEventListener("change", (e) => {
        const u = new URL(location.href);
        u.search = "?p=" + e.target.value;
        location.href = u.toString();
      });
    });
  }).catch(() => {});
}

// ── textos fijos del HTML ──
document.title = T.titulo;
document.querySelectorAll("[data-t]").forEach((e) => (e.innerHTML = T[e.dataset.t] || ""));
document.querySelectorAll("[data-logo]").forEach((e) => (e.src = P.marca.logo));
$("[data-open]").innerHTML = IC.list;
$("[data-close]").innerHTML = IC.close;
$("[data-hwic]").innerHTML = IC.screw;
$("[data-hint]").innerHTML = IC.hand + "<span>" + esc(T.girar) + "</span>";

const story = $(".story"), stageEl = $("[data-stage]"), card = $("[data-card]"), sheetEl = $("[data-sheet]");
const titEl = $("[data-tit]"), titT = $("[data-titt]"), cntEl = $("[data-cnt]"), hint = $("[data-hint]");
const pauseBtn = $("[data-pause]"), bigBtn = $("[data-big]");
const hwBtn = $("[data-hw]"), hwBd = $("[data-hwbd]"), hwLbl = $("[data-hwl]"), hwChip = $("[data-hwchip]"), hwPanel = $("[data-hwpanel]"), stgEl = $("[data-stg]");
const ctSvg = $("[data-cotas]");
$("[data-bars]").innerHTML = S.map(() => "<i><b></b></i>").join("");
const bars = [...document.querySelectorAll("[data-bars] i")];

// ── motor ──
const motor = new Motor($("[data-canvas]"), P);
S.forEach((_, i) => motor.construir(i));

let cur = 0, dir = 1, fase = null, mv = {}, clock = 0, raf = 0, last = 0, spin = 0, drag = null;
let paused = false, loopT = 0, big = store.get(KEY + ":big") === "1", focusBox = null, freeCam = false, refitUntil = 0;
let toolOn = false, toolT0 = 0, faseT = 0, faseT2 = 0, hlOn = false, hlT = 0, pickSet = null;
const target = { yaw: S[0].vista.yaw, pitch: S[0].vista.pitch }, drawn = { ...target };
const view = { cx: 0, cy: 0, w: 1, h: 1, ready: false };
story.classList.toggle("big", big);
bigBtn.innerHTML = big ? IC.collapse : IC.expand;
pauseBtn.innerHTML = IC.pause;

// ── movimientos de cada paso ──
function startMovers(i) {
  mv = {};
  const F = S[i].fases;
  fase = F && !still ? "A" : null;
  toolOn = false; clearTimeout(faseT); clearTimeout(faseT2);
  for (const m of S[i].mueven) mv[m.nombre] = { travel: m.recorrido, delay: m.demora ?? 0, v: still ? 0 : m.recorrido, hold: fase === "A" && F.retener.includes(m.nombre) };
  clock = 0;
}
// segundo tiempo: la cámara viaja al tornillo, bajan los herrajes y aparece la llave
function enterB() {
  if (fase !== "A") return;
  fase = "B";
  for (const m of Object.values(mv)) if (m.hold) { m.hold = false; m.delay = 0; m.t0 = clock + 0.35; }
  const F = S[cur].fases;
  if (F.vistaB) { target.yaw = F.vistaB.yaw; target.pitch = F.vistaB.pitch; freeCam = false; }
  measureFocus();
  showTit(); highlight(); playSubs(subsFor(cur, "B"));
  const at = cur;
  faseT = setTimeout(() => {
    if (fase !== "B" || cur !== at) return;
    toolOn = true; toolT0 = performance.now(); run();
    faseT2 = setTimeout(() => { if (cur === at && fase === "B") restartFase(); }, 3400);
  }, 1300);
  run();
}
function restartFase() {
  if (paused || drag || document.visibilityState === "hidden") { faseT2 = setTimeout(() => cur && fase === "B" && restartFase(), 1200); return; }
  startMovers(cur);
  target.yaw = S[cur].vista.yaw; target.pitch = S[cur].vista.pitch; freeCam = false;
  measureFocus(); showTit(); highlight(); playSubs(subsFor(cur, fase)); run();
}
// la llave gira ~75° apretando, se suelta y vuelve
function toolAngle() {
  const t = ((performance.now() - toolT0) / 1000) % 1.6;
  if (t < 1.05) { const k = t / 1.05; return 75 * k * k * (3 - 2 * k); }
  if (t < 1.25) return 75;
  const k = (t - 1.25) / 0.35; return 75 * (1 - k * k * (3 - 2 * k));
}

// ── titular y contador sobre el 3D ──
let cntTxt = null;
function showTit() {
  const s = S[cur];
  titT.textContent = fase === "B" ? s.fases.titularB : s.titular || "";
  cntTxt = null; count();
  titEl.classList.remove("pop"); void titEl.offsetWidth; if (!still) titEl.classList.add("pop");
}
function count() {
  const k = S[cur].cuenta;
  let t = "";
  if (fase === "A" && k && k.fijo) t = "";
  else if (k && k.fijo) t = k.fijo;
  else if (k && k.de) {
    const ms = Object.entries(mv).filter(([n]) => n.startsWith(k.de));
    const done = ms.filter(([, m]) => m.v <= m.travel * 0.12).length;
    t = done >= k.n ? k.fin || k.txt + " " + k.n + " de " + k.n : k.txt + " " + Math.min(k.n, done + 1) + " de " + k.n;
  }
  if (t !== cntTxt) { cntTxt = t; cntEl.textContent = t; }
}

// ── subtítulos: una frase por vez ──
let subT = 0, subL = [], subI = 0;
function subsFor(i, ph) {
  const s = S[i].subs;
  if (!s || i === 0 || i === LAST) return [];
  const tip = s.tip ? [{ t: s.tip, tip: true }] : [], m = (l) => l.map((t) => ({ t }));
  if (ph === "A") return m(s.a);
  if (ph === "B") return [...m(s.b), ...tip];
  return [...m(s.a), ...m(s.b), ...tip];
}
function playSubs(list) { clearTimeout(subT); subL = list; subI = 0; showSub(); }
function showSub() {
  const el = card.querySelector("[data-sub]");
  if (!el) return;
  if (!subL.length) { el.innerHTML = ""; return; }
  const it = subL[subI % subL.length];
  el.classList.remove("in"); void el.offsetWidth;
  el.innerHTML = (it.tip ? IC.tip : "") + "<span>" + esc(it.t) + "</span>";
  el.classList.toggle("tip", !!it.tip);
  el.classList.add("in");
  const dur = Math.min(7000, Math.max(2600, it.t.length * 52));
  subT = setTimeout(() => { if (fase === "A" && subI >= subL.length - 1) return; subI++; showSub(); }, dur);
}

// ── resaltado (brillo naranja que se apaga solo) ──
function resaltados() {
  const s = S[cur];
  return fase === "A" ? s.fases.pieza : fase === "B" ? s.fases.hw : s.resaltar || [];
}
function highlight() {
  clearTimeout(hlT);
  hlOn = resaltados().length > 0;
  const maxD = Math.max(0, ...S[cur].mueven.map((m) => m.demora ?? 0));
  hlT = setTimeout(() => { hlOn = false; run(); }, (1.9 + maxD * 1.2) * 1000 + 900);
}
// qué ve cada pieza en este cuadro: oculta, fantasma (translúcida), brillo
function estadoDe(id, u) {
  const s = S[cur], F = s.fases;
  const st = {};
  if (F && fase === "A" && coincide(F.ocultarEnA, id)) st.oculta = true;
  if (u.manta) return st;
  const hl = resaltados();
  if (hlOn && coincide(hl, id)) st.brillo = 0.75 + 0.25 * Math.sin(performance.now() / 260);
  if (pickSet) {
    if (coincide(pickSet, id)) st.brillo = 1;
    else if (!id.startsWith("rotulo") && !id.startsWith("bolsa")) st.opacidad = 0.45;
  } else if (s.grupo === "Armado" && !s.sinFantasma && (s.resaltar || []).length && !coincide(s.resaltar, id) && !coincide(s.unir, id) && !(F && coincide(F.hw, id))) {
    st.opacidad = 0.38; // fantasma: lo ya armado queda translúcido para que se vea la pieza nueva
  }
  return st;
}

// ── primer plano: la cámara se acerca a la unión (o al tornillo en el segundo tiempo) ──
function zeroPose() {
  const zero = {};
  for (const n in mv) zero[n] = 0;
  motor.orientar(target.yaw, target.pitch);
  motor.pose(cur, zero, S[cur].mueven);
  motor.estado(cur, (id, u) => estadoDe(id, u));
}
const vacia = (B) => !(B.x1 > B.x0);
function measureFocus() {
  focusBox = null;
  const s = S[cur];
  zeroPose();
  const Full = motor.caja(cur, (id, u) => !u.manta || s.encuadrarTodo);
  if (fase) {
    const F = s.fases;
    if (fase === "A") { const M = motor.caja(cur, (id) => coincide(F.pieza, id)); if (!vacia(M)) focusBox = { ...M, f: Math.min(s.enfoque || 0.3, 0.3), full: Full }; return; }
    const B = motor.caja(cur, (id) => id.startsWith(F.ref + "."));
    if (!vacia(B)) focusBox = { ...B, f: 0.95, mf: 0.3, joint: true, tight: true, full: Full };
    return;
  }
  // s.zoom (0–1): acercamiento a las piezas resaltadas, sin buscar la unión (s.enfoque sí la busca y se acerca mucho más).
  if (!(s.resaltar || []).length || !(s.enfoque || s.zoom)) return;
  const M = motor.caja(cur, (id) => coincide(s.resaltar, id));
  if (vacia(M)) return;
  let box = M, joint = false;
  if (s.unir && !s.zoom) {
    // unión: donde la caja de cada pieza nueva se cruza con la de lo ya armado
    const J = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    const E = motor.escenas[cur], nuevas = [], fijas = [];
    for (const id of E.nodos.keys()) { if (coincide(s.resaltar, id)) nuevas.push(id); else if (coincide(s.unir, id)) fijas.push(id); }
    const cajas = (ids) => ids.map((id) => motor.caja(cur, (x) => x === id)).filter((b) => !vacia(b));
    const cn = cajas(nuevas), cf = cajas(fijas);
    for (const a of cn) for (const b of cf) {
      const x0 = Math.max(a.x0, b.x0), x1 = Math.min(a.x1, b.x1), y0 = Math.max(a.y0, b.y0), y1 = Math.min(a.y1, b.y1);
      if (x1 > x0 && y1 > y0) { J.x0 = Math.min(J.x0, x0); J.y0 = Math.min(J.y0, y0); J.x1 = Math.max(J.x1, x1); J.y1 = Math.max(J.y1, y1); }
    }
    if (!vacia(J)) { box = J; joint = true; }
  }
  focusBox = { ...box, f: s.zoom || s.enfoque, joint, tight: joint, full: Full };
}

// ── pintado de cada cuadro ──
function paint(dt) {
  const s = S[cur];
  const vals = {};
  for (const n in mv) vals[n] = mv[n].v;
  motor.mostrar(cur);
  motor.orientar(drawn.yaw, drawn.pitch);
  motor.pose(cur, vals, s.mueven);
  motor.estado(cur, (id, u) => estadoDe(id, u));
  if (s.fases) motor.herramienta(cur, fase === "B" && toolOn, toolOn ? toolAngle() : 0, fase === "B" && toolOn);
  let { x0, y0, x1, y1 } = motor.caja(cur, (id, u) => !u.manta || s.encuadrarTodo);
  const R = stageEl.getBoundingClientRect();
  if (!R.width || !R.height) return;
  const tb = titT.textContent && cur > 0 && cur < LAST ? titEl.getBoundingClientRect() : null;
  const hb = cur > 0 && cur < LAST ? hwBtn.getBoundingClientRect() : null;
  const top = tb && tb.height ? Math.max(14, tb.bottom - R.top + 8) : 14;
  const bottom = hb && hb.height ? Math.max(44, R.bottom - hb.top + 6) : 44;
  const aw = R.width, ah = Math.max(80, R.height - top - bottom);
  const ff = focusBox ? (big ? Math.min(0.97, focusBox.f + 0.45) : focusBox.f) : 0;
  if (x1 > x0 && ff > 0 && !freeCam) {
    ({ x0, y0, x1, y1 } = focusBox.full);
    const F = focusBox, mf = F.mf ? (big ? F.mf * 0.8 : F.mf) : F.joint ? (big ? 0.07 : 0.09) : F.tight ? (big ? 0.12 : 0.16) : 0.3;
    const fw = Math.max(F.x1 - F.x0, (x1 - x0) * mf), fh = Math.max(F.y1 - F.y0, (y1 - y0) * mf);
    const fcx = (F.x0 + F.x1) / 2, fcy = (F.y0 + F.y1) / 2, lerp = (a, b) => a + (b - a) * ff;
    [x0, x1, y0, y1] = [lerp(x0, fcx - fw / 2), lerp(x1, fcx + fw / 2), lerp(y0, fcy - fh / 2), lerp(y1, fcy + fh / 2)];
  }
  if (x1 > x0) {
    const bw = x1 - x0, bh = y1 - y0;
    const fill = cur === 0 && P.cotas ? (P.cotas.llenar ?? 0.72) : cur === 0 || cur === LAST ? 0.86 : 0.9; // muebles anchos: cotas.llenar más bajo deja lugar a los textos
    const k = Math.max(bw / (aw * fill), bh / (ah * fill)); // mm por píxel
    const goal = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 + ((top - bottom) / 2) * k, w: R.width * k, h: R.height * k };
    for (const g in goal) view[g] = view.ready && dt ? follow(view[g], goal[g], dt, fase === "B" ? 0.6 : 0.35) : goal[g];
    view.ready = true;
  }
  if (motor._w !== R.width || motor._h !== R.height) { motor.tamano(R.width, R.height); motor._w = R.width; motor._h = R.height; }
  motor.dibujar(view);
  cotasPaint(R);
  rotulosPaint(R);
}
// ── nombres de las piezas: etiquetas de tamaño fijo en pantalla, siempre legibles ──
// Si en una escena se pisan, pasan a mostrar solo el número («5»), como el manual de papel; el nombre completo
// queda en la lista de piezas de abajo. Lo que siga encimado se corre un poco hacia arriba o hacia abajo.
const rotEl = document.createElement("div"), rotPool = new Map(), rotMide = document.createElement("canvas").getContext("2d");
rotEl.className = "rotulos";
rotEl.setAttribute("aria-hidden", "true");
stageEl.appendChild(rotEl);
let rotCorto = { escena: -1, ancho: 0, on: false };
const rotTexto = (txt, corto) => (corto && txt.includes(" · ") ? txt.split(" · ")[0] : txt);
function rotCaja(txt) {
  rotMide.font = (txt.length <= 2 ? 13 : 11.5) + "px 'DM Sans', Arial, sans-serif";
  rotMide.font = "800 " + rotMide.font;
  const w = rotMide.measureText(txt).width + txt.length * 0.4 + (txt.length <= 2 ? 14 : 16);
  return [Math.max(txt.length <= 2 ? 24 : 0, w), txt.length <= 2 ? 23 : 21.5];
}
function rotAcomodar(items, corto, R) {
  const puestos = [];
  let choques = 0;
  for (const it of items) {
    const [w, h] = rotCaja(rotTexto(it.r.txt, corto));
    let x = Math.min(Math.max(it.x, w / 2 + 4), R.width - w / 2 - 4), y = it.y, ok = false;
    for (const d of [0, -1, 1, -2, 2]) {
      const yy = it.y + d * (h + 3);
      if (!puestos.some((b) => Math.abs(b.x - x) < (b.w + w) / 2 + 3 && Math.abs(b.y - yy) < (b.h + h) / 2 + 2)) { y = yy; ok = true; break; }
    }
    if (!ok) choques++;
    if (it.r.op > 0.05) puestos.push({ x, y, w, h });
    it.px = x; it.py = y;
  }
  return choques;
}
function rotulosPaint(R) {
  const k = view.w / R.width, vistos = new Set();
  const items = motor.rotulos(cur).map((r) => ({ r, x: (r.x - (view.cx - view.w / 2)) / k, y: (view.cy + view.h / 2 - r.y) / k }));
  if (rotCorto.escena !== cur || Math.abs(rotCorto.ancho - R.width) > 40) rotCorto = { escena: cur, ancho: R.width, on: false };
  // una vez que una escena pasa a números, se queda así (evita que titile mientras la cámara se acomoda)
  if (!rotCorto.on && rotAcomodar(items, false, R) > 0) rotCorto.on = true;
  if (rotCorto.on) rotAcomodar(items, true, R);
  for (const it of items) {
    const r = it.r, txt = rotTexto(r.txt, rotCorto.on);
    let el = rotPool.get(r.id);
    if (!el) { el = document.createElement("span"); rotEl.appendChild(el); rotPool.set(r.id, el); }
    if (el.textContent !== txt) { el.textContent = txt; el.classList.toggle("letra", txt.length <= 2); }
    el.style.transform = "translate(" + it.px.toFixed(1) + "px," + it.py.toFixed(1) + "px) translate(-50%,-50%)";
    el.style.opacity = String(r.op < 0.6 ? r.op * 0.6 : r.op);
    vistos.add(r.id);
  }
  for (const [id, el] of rotPool) if (!vistos.has(id)) el.style.opacity = "0";
}
function tick(now) {
  const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
  last = now;
  clock += dt;
  if (spin && !drag) target.yaw += dt * 9;
  let moving = !!drag || !!spin || hlOn || !!pickSet;
  for (const k in target) { drawn[k] = follow(drawn[k], target[k], dt, drag ? 0.06 : 0.35); if (Math.abs(drawn[k] - target[k]) > 0.05) moving = true; }
  for (const n in mv) {
    const m = mv[n];
    if (!m.hold && clock > (m.t0 ?? 0.45) + m.delay * 1.2) m.v = follow(m.v, 0, dt, focusBox && focusBox.joint ? 0.5 : 0.34);
    if (m.hold) continue;
    if (m.v > 0.3) moving = true; else m.v = 0;
  }
  if (now < refitUntil) moving = true;
  if (fase === "B") moving = true;
  if (ctClock(now)) moving = true;
  count();
  paint(dt);
  raf = moving ? requestAnimationFrame(tick) : 0;
  if (!raf) { last = 0; scheduleLoop(); }
}
// al terminar, la animación del paso vuelve a empezar sola
function scheduleLoop() {
  clearTimeout(loopT);
  if (paused || still || cur === 0 || cur === LAST || !S[cur].mueven.length) return;
  const at = cur;
  if (fase === "A") { loopT = setTimeout(() => { if (!paused && cur === at && fase === "A") enterB(); }, 550); return; }
  if (fase === "B") return;
  loopT = setTimeout(() => { if (!paused && !drag && cur === at && document.visibilityState !== "hidden") { startMovers(cur); highlight(); run(); } else if (cur === at) scheduleLoop(); }, 1600);
}
function run() { if (!raf) raf = requestAnimationFrame(tick); }
addEventListener("resize", () => { view.ready = false; run(); updMore(); });

// ── herrajes ──
const INV = P.inventario || [];
function hwState(i) {
  const used = {};
  for (let j = 1; j < i; j++) for (const k in S[j].hw || {}) used[k] = (used[k] || 0) + S[j].hw[k];
  const now = i < LAST ? S[i].hw || {} : {};
  return INV.map((h) => ({ ...h, left: Math.max(0, h.n - (used[h.id] || 0)), now: now[h.id] || 0 }));
}
const hwTotal = INV.reduce((a, h) => a + h.n, 0);
const hwLeftAt = (i) => hwState(i).reduce((a, h) => a + h.left, 0);
const hwFirstDrop = (() => { for (let i = 1; i < LAST; i++) if (hwLeftAt(i) < hwTotal) return i; return -1; })();
function renderStg() {
  const s = S[cur], on = cur > 0 && cur < LAST;
  stgEl.innerHTML = on ? "<span>" + (GRUPO_IC[s.grupo] || "") + "<span>" + esc(s.grupo) + "</span></span>" + (s.dos ? "<span>" + IC.people + "<span>Mejor de a dos</span></span>" : "") : "";
  stgEl.classList.toggle("on", on);
}
function renderHw() {
  const st = hwState(cur), using = st.filter((h) => h.now), left = st.reduce((a, h) => a + h.left, 0);
  hwBtn.hidden = !INV.length;
  hwBd.textContent = left;
  const lbl = cur > 0 && cur < LAST ? (left === hwTotal && S[cur].grupo === S[1].grupo ? hwTotal + " herrajes" : cur === hwFirstDrop ? "Quedan " + left : "") : "";
  hwLbl.textContent = lbl;
  hwBtn.classList.toggle("lbl", !!lbl);
  hwBtn.setAttribute("aria-label", "Quedan " + left + " herrajes. Ver los herrajes que quedan");
  const usa = using.length > 0 && cur > 0 && cur < LAST;
  hwBtn.classList.toggle("use", usa);
  // varios herrajes en el mismo paso: se separan con «+»; si no entran en la píldora, quedan solo la letra y la cantidad
  // (los nombres completos siguen en las fichas de abajo)
  const chipTxt = (corto) => using.map((h) => { const [c, n = ""] = h.label.split(" · "); return esc(corto || !n ? c : c + " · " + n.split(" ")[0]) + " ×" + h.now; }).join(" + ");
  const chipIc = IC.screw.replace("<svg", '<svg style="width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;flex:0 0 15px"');
  hwChip.innerHTML = usa ? chipIc + "<span>" + chipTxt(false) + "</span>" : "";
  hwChip.classList.toggle("on", usa);
  if (usa && using.length > 1 && hwChip.scrollWidth > hwChip.clientWidth + 1) hwChip.innerHTML = chipIc + "<span>" + chipTxt(true) + "</span>";
  stgEl.classList.toggle("mini", usa);
  hwPanel.innerHTML = "<h4>Herrajes</h4>" + st.map((h) => {
    const cls = h.now ? "now" : !h.left ? "done" : "";
    return '<div class="hwrow ' + cls + '"><span>' + esc(h.label) + "</span><b>" + (h.left ? h.left + " quedan" : "✓ listos") + '</b><i><span style="width:' + Math.round((h.left / h.n) * 100) + '%"></span></i>' + (h.now ? "<small>" + h.now + " en este paso</small>" : "") + "</div>";
  }).join("");
}
function openHw(on) { hwPanel.classList.toggle("on", on); hwBtn.setAttribute("aria-expanded", String(on)); }

// ── tocar una pieza de la lista la ilumina arriba ──
function pickPart(j) {
  const s = S[cur], btns = [...card.querySelectorAll("[data-pick]")], info = card.querySelector("[data-pickinfo]");
  const on = j != null && btns[j] && btns[j].getAttribute("aria-pressed") !== "true";
  btns.forEach((b, k) => b.setAttribute("aria-pressed", String(on && k === j)));
  pickSet = on ? s.elegir[j].m : null;
  if (info) { if (on) { info.className = "pickinfo"; info.innerHTML = "<b>Cómo la reconocés:</b> " + esc(s.elegir[j].t); } else { info.className = "pickhint"; info.textContent = ""; } }
  medir("pieza", { valor: on ? s.usa[j] : null }, true);
  run(); updMore();
}

// ── tarjeta inferior ──
const mas = () => '<button class="mas" data-mas tabindex="-1" aria-hidden="true">Más' + IC.more + "</button>";
function nav() {
  const prev = cur === 0 ? "" : '<button class="btn sec" data-prev aria-label="Paso anterior">' + IC.prev + "</button>";
  return '<div class="nav">' + mas() + prev + '<button class="btn pri" data-next>' + (cur === 0 ? "Empezar" : "Siguiente") + IC.next + "</button></div>";
}
function resumeHtml() {
  const saved = Number(store.get(KEY) || 0);
  return saved > 0 && saved < LAST ? '<p class="resume">' + esc(T.retomarA) + ' <button data-go="' + saved + '">' + esc(T.retomarB) + " " + (P.pasosManual ? (S[saved].num ?? saved) : saved) + "</button></p>" : "";
}
function renderCard(noAnim) {
  const s = S[cur], B = P.marca;
  let h = "";
  if (big && cur > 0 && cur < LAST) {
    h = "<h2>" + esc(s.titulo) + '</h2><button class="more" data-big>Ver instrucciones' + IC.more + "</button>" + nav();
  } else if (cur === 0) {
    h = '<div class="cover"><div class="kicker">' + esc(T.portadaKicker) + "</div><h2>" + T.portadaTitulo + '</h2><div class="facts">' +
      T.datos.map(([ic, b, t]) => "<div><i>" + (IC[ic] || "") + "</i><b>" + esc(b) + "</b><span>" + esc(t) + "</span></div>").join("") + "</div>" + nav() + resumeHtml() + "</div>";
  } else if (cur === LAST) {
    const wa = B.whatsapp ? "https://wa.me/" + B.whatsapp + "?text=" + encodeURIComponent(T.waTexto) : "";
    const X = B.ventaCruzada;
    h = "<h2>" + T.finTitulo + "</h2><p>" + esc(T.finCuerpo) + '</p><div class="tip">' + IC.tip + "<span>" + esc(T.finTip) + "</span></div>" +
      (X ? '<a class="xsell" href="' + X.url + '" target="_blank" rel="noopener" data-xsell>' + (X.img ? '<img src="' + X.img + '" alt="">' : "") + "<div><b>" + esc(X.titulo) + "</b><span>" + esc(X.sub) + "</span></div>" + IC.next + "</a>" : "") +
      '<div class="done-ctas">' + mas() + '<button class="btn pri" data-rvopen>' + IC.opinion + "Dejá tu opinión</button>" +
      (wa ? '<a class="btn ghost" data-help href="' + wa + '" target="_blank" rel="noopener">' + IC.wa + "¿Tenés dudas? Escribinos</a>" : "") +
      '<div class="row"><button class="btn sec" data-prev aria-label="Paso anterior">' + IC.prev + '</button><button class="btn ghost" data-restart>' + IC.replay + "Ver de nuevo</button></div></div>" +
      '<p class="legal">' + esc(T.pie) + (B.instagram ? '<a href="' + B.instagram + '" target="_blank" rel="noopener" aria-label="Instagram de DEGË">' + IC.ig + "</a>" : "") + "</p>";
  } else {
    h = "<h2>" + esc(s.titulo) + "</h2>" + (s.subs ? '<p class="sub" data-sub aria-hidden="true"></p><p class="vh">' + esc([...s.subs.a, ...s.subs.b].join(" ")) + (s.subs.tip ? " " + esc(s.subs.tip) : "") + "</p>" : "");
    if (s.check) {
      h += '<ul class="check">' + s.check.map(([n, t], j) => '<li><button aria-pressed="false" data-ck="' + j + '"><b>' + n + "</b><span>" + esc(t) + '</span><span class="bx">' + IC.check + "</span></button></li>").join("") + '</ul><p class="allok" data-allok>Tocá cada grupo a medida que lo contás.</p>';
    } else if (s.usa.length && s.elegir) {
      h += '<ul class="uses" aria-label="Vas a usar">' + s.usa.map((u, j) => '<li class="usebtn" role="button" tabindex="0" aria-pressed="false" data-pick="' + j + '">' + esc(u) + "</li>").join("") + '</ul><p class="pickhint" data-pickinfo></p>';
    } else if (s.usa.length) {
      h += '<ul class="uses" aria-label="Vas a usar">' + s.usa.map((u) => "<li>" + esc(u) + "</li>").join("") + "</ul>";
    }
    h += nav();
  }
  // la tarjeta anterior sale como «fantasma» hacia el lado del avance
  sheetEl.querySelectorAll(".card-ghost").forEach((g) => g.remove());
  if (!noAnim && !still && card.childElementCount) {
    const g = card.cloneNode(true), top = card.offsetTop - sheetEl.scrollTop;
    g.querySelectorAll(".nav, .done-ctas").forEach((x) => x.remove());
    [g, ...g.querySelectorAll("*")].forEach((x) => { for (const a of [...x.attributes]) if (a.name.startsWith("data-") || a.name === "id") x.removeAttribute(a.name); });
    g.className = "card card-ghost" + (dir > 0 ? "" : " back"); g.setAttribute("aria-hidden", "true");
    g.style.cssText = "top:" + top + "px;left:" + card.offsetLeft + "px;width:" + card.offsetWidth + "px;max-height:" + Math.max(0, sheetEl.clientHeight - top) + "px;overflow:hidden";
    sheetEl.appendChild(g); setTimeout(() => g.remove(), 260);
  }
  card.innerHTML = h;
  playSubs(subsFor(cur, fase));
  card.className = "card" + (noAnim ? "" : dir > 0 ? " anim-in" : " anim-back");
  if (!noAnim) sheetEl.scrollTop = 0;
  updMore(); requestAnimationFrame(updMore); setTimeout(updMore, 420);
  const nb = card.querySelector("[data-next]");
  if (nb) setTimeout(() => nb.classList.add("nudge"), 4500);
}
// la hoja tiene más contenido abajo: degradé + «Más»
function updMore() {
  const k = sheetEl.scrollHeight - sheetEl.clientHeight;
  story.classList.toggle("has-more", k > 8 && sheetEl.scrollTop < k - 4);
}
sheetEl.addEventListener("scroll", updMore, { passive: true });
if (document.fonts) document.fonts.ready.then(() => { updMore(); view.ready = false; run(); });

// ── cambio de paso ──
let hinted = store.get(KEY + ":hint") === "1", hintT = 0;
function setStep(i, opt = {}) {
  i = Math.max(0, Math.min(LAST, i));
  if (cur === 0 && i > 0) view.ready = false;
  dir = i >= cur ? 1 : -1;
  cur = i;
  const s = S[cur];
  target.yaw = s.vista.yaw; target.pitch = s.vista.pitch;
  story.dataset.kind = cur === 0 ? "cover" : cur === LAST ? "done" : "step";
  const dur = Math.max(1.4, 0.6 + Math.max(0, ...s.mueven.map((m) => m.demora ?? 0)) * 1.2 + 1.3);
  bars.forEach((b, j) => { b.className = j < cur ? "done" : j === cur ? "on" : ""; });
  bars[cur].style.setProperty("--dur", dur + "s");
  // Con P.pasosManual, la cabecera sigue la numeración del manual de papel (s.num); los pasos previos dicen su etapa.
  $("[data-headsub]").textContent = cur && cur < LAST ? (P.pasosManual ? (s.num ? "Paso " + s.num + " de " + P.pasosManual : s.grupo) : "Paso " + cur + " de " + STEPS) : cur ? "¡Terminaste!" : "";
  clearTimeout(loopT);
  freeCam = false; pickSet = null;
  startMovers(cur);
  showTit();
  highlight();
  measureFocus();
  if (focusBox) { Object.assign(drawn, target); view.ready = false; }
  renderStg(); renderHw(); openHw(false); renderCard();
  spin = cur === LAST && !still ? 1 : 0;
  cotasEnter(cur);
  if (cur > 0) { store.set(KEY, String(cur === LAST ? 0 : cur)); medir("paso", { paso: cur, total: STEPS }); }
  if (cur === LAST) medir("fin");
  clearTimeout(confT); stopConfetti();
  if (cur === LAST) confT = setTimeout(confetti, 350);
  clearTimeout(rvT);
  if (cur !== LAST && rv.classList.contains("on")) hideReview();
  if (cur === LAST && !rvShown) rvT = setTimeout(() => { if (cur === LAST && !rvShown) { medir("opinion_auto"); showReview(); } }, 2000);
  clearTimeout(hintT);
  if (cur !== 1) hint.classList.add("off");
  else if (!hinted) hintT = setTimeout(() => { if (cur === 1 && !hinted) hint.classList.remove("off"); }, 600);
  if (opt.haptic && navigator.vibrate) try { navigator.vibrate(8); } catch {}
  run();
}
function goNext() { if (cur === 0) { medir("empezar"); showMoment(); } else if (cur < LAST) setStep(cur + 1, { haptic: true }); }

// ── «Antes de arrancar» ──
const mom = $("[data-mom]");
const MOM_IC = { space: IC.m_space, kids: IC.m_kids, time: IC.m_time, music: IC.m_music };
mom.innerHTML = '<div class="mom-hd"><span class="mom-heart">' + IC.heart + '</span><p class="kick">' + esc(T.momKicker) + "</p></div><h3>" + T.momTitulo + '</h3><p class="mbody">' + esc(T.momCuerpo) + '</p><ul class="mtips">' +
  T.momTips.map(([ic, b, t]) => '<li class="mt' + (ic === "music" ? " music" : "") + '"><span class="mt-ic">' + (MOM_IC[ic] || "") + '</span><span class="mt-tx"><b>' + esc(b) + "</b><span>" + esc(t) + "</span></span>" + (ic === "music" && P.marca.spotify ? '<a class="sp" href="' + P.marca.spotify + '" target="_blank" rel="noopener" data-mtsp>' + IC.playS + "Abrir Spotify</a>" : "") + "</li>").join("") +
  '</ul><div class="mom-cta"><button class="btn pri" data-momgo>' + esc(T.momCta) + IC.next + "</button></div>";
const mtEls = [...mom.querySelectorAll(".mt")], momCta = mom.querySelector(".mom-cta");
let seqT = [];
function showMoment() {
  mom.scrollTop = 0;
  mom.classList.remove("in"); void mom.offsetWidth;
  mom.classList.add("on", "in");
  momSeq(false);
  setTimeout(() => mom.focus({ preventScroll: true }), 400);
}
function hideMoment() { seqT.forEach(clearTimeout); seqT = []; mom.classList.remove("on", "in"); }
function momSeq(skip) {
  seqT.forEach(clearTimeout); seqT = [];
  const end = () => { momCta.classList.add("in"); mom.classList.add("seq-done"); };
  if (skip || still) { mtEls.forEach((e) => e.classList.add("in")); end(); return; }
  mom.classList.remove("seq-done"); momCta.classList.remove("in"); mtEls.forEach((e) => e.classList.remove("in"));
  mtEls.forEach((e, k) => seqT.push(setTimeout(() => e.classList.add("in"), 450 + k * 760)));
  seqT.push(setTimeout(end, 450 + mtEls.length * 760 - 150));
}
mom.addEventListener("pointerdown", (e) => { if (!mom.classList.contains("seq-done") && !e.target.closest("a, button")) momSeq(true); });
function armar() { medir("armar"); hideMoment(); setStep(1, { haptic: true }); }

// ── reseña ──
const rv = $("[data-rv]");
rv.innerHTML = '<button class="ib x" data-rvclose aria-label="Cerrar">' + IC.close + "</button>" +
  '<div class="rv-step" data-rvstep="resena"><div class="rv-cards"><div class="rc back b1"><i></i><i></i><i style="width:60%"></i></div><div class="rc back b2"><i></i><i></i><i style="width:70%"></i></div>' +
  '<div class="rc front"><div class="rc-h">' + IC.star + 'Tu opinión</div><div class="deco">' + "<span>" + IC.star + "</span>".repeat(1) + ("<span>" + IC.star + "</span>").repeat(4) + '</div><div class="type" data-type></div></div></div>' +
  '<div class="rv-txt"><h3>El próximo cliente<br>te va a <em>leer</em> 🖤</h3><p>Antes de comprar, todos leemos opiniones. Contá cómo te fue y ayudalo a elegir.</p></div>' +
  '<div class="rv-ctas"><a class="btn pri" data-rvgo href="' + (P.marca.tienda || "#") + '" target="_blank" rel="noopener">Dejar mi opinión</a><button class="later" data-rvclose>Ahora no</button></div></div>' +
  '<div class="rv-step" data-rvstep="gracias" hidden><div class="rv-cards"><div class="rc front" style="align-items:center;top:40px"><span class="heart" style="position:static;transform:none;box-shadow:none">' + IC.heart + '</span><b>¡Gracias por contarlo!</b></div></div>' +
  '<div class="rv-txt"><h3>¡Gracias por<br><em>ayudarnos</em>! 🖤</h3><p>Seguinos en Instagram y mirá cómo otros armaron su living.</p></div>' +
  '<div class="rv-ctas"><a class="btn pri" href="' + (P.marca.instagram || "#") + '" target="_blank" rel="noopener">' + IC.ig + "Seguinos en Instagram</a><button class=\"later\" data-rvclose>Cerrar</button></div></div>";
const typeEl = rv.querySelector("[data-type]");
let rvT = 0, rvShown = ses.get(KEY + ":rv") === "1", typer = 0, fills = [];
function rvStep(n) { rv.querySelectorAll("[data-rvstep]").forEach((s) => (s.hidden = s.dataset.rvstep !== n)); }
function typeLoop() {
  clearTimeout(typer);
  const ex = T.rvEjemplos;
  if (still) { typeEl.textContent = ex[0]; return; }
  let k = 0, c = 0, back = false;
  (function t() {
    const s = ex[k];
    if (!back) { c++; typeEl.textContent = s.slice(0, c); if (c === s.length) { back = true; typer = setTimeout(t, 1500); return; } }
    else { c--; typeEl.textContent = s.slice(0, c); if (c === 0) { back = false; k = (k + 1) % ex.length; } }
    typer = setTimeout(t, back ? 28 : 55);
  })();
}
function showReview() {
  rvShown = true;
  rvStep("resena");
  const stars = [...rv.querySelectorAll(".deco span")];
  fills.forEach(clearTimeout); fills = [];
  stars.forEach((st, i) => { st.classList.remove("on", "pop"); fills.push(setTimeout(() => st.classList.add("on", "pop"), still ? 0 : 700 + i * 150)); });
  typeEl.textContent = "";
  rv.classList.add("on");
  typeLoop();
  setTimeout(() => rv.focus({ preventScroll: true }), 450);
}
function hideReview() { rv.classList.remove("on"); clearTimeout(typer); fills.forEach(clearTimeout); }
rv.addEventListener("click", (e) => {
  if (e.target.closest("[data-rvclose]")) hideReview();
  else if (e.target.closest("[data-rvgo]")) { medir("opinion", { valor: "tienda" }, true); ses.set(KEY + ":rv", "1"); clearTimeout(typer); setTimeout(() => rvStep("gracias"), 1000); }
});

// ── índice ──
function renderIndex() {
  const grupos = [];
  S.slice(1, -1).forEach((s, j) => { const i = j + 1; let g = grupos.find((x) => x.n === s.grupo); if (!g) grupos.push((g = { n: s.grupo, l: [] })); g.l.push(i); });
  $("[data-indexlist]").innerHTML = grupos.map((g) => '<li class="g">' + esc(g.n) + "</li>" + g.l.map((i) => '<li><button data-go="' + i + '"><span class="n">' + (P.pasosManual ? (S[i].num ?? "·") : i) + "</span>" + esc(S[i].titulo) + "</button></li>").join("")).join("");
}
renderIndex();
function openIndex(on) {
  $("[data-index]").classList.toggle("on", on); $("[data-scrim]").classList.toggle("on", on);
  if (on) document.querySelectorAll("[data-index] [data-go]").forEach((b) => { const j = Number(b.dataset.go); b.classList.toggle("done", j < cur); b.classList.toggle("cur", j === cur); });
}
$("[data-scrim]").addEventListener("click", () => openIndex(false));

// ── pausa y modo grande ──
function setPaused(p) {
  paused = p;
  pauseBtn.setAttribute("aria-pressed", String(p));
  pauseBtn.setAttribute("aria-label", p ? "Reproducir la animación" : "Pausar la animación");
  pauseBtn.innerHTML = p ? IC.play : IC.pause;
  clearTimeout(loopT);
  if (!p) { startMovers(cur); showTit(); highlight(); run(); }
}
function setBig(b) {
  big = b;
  story.classList.toggle("big", b);
  bigBtn.setAttribute("aria-pressed", String(b));
  bigBtn.innerHTML = b ? IC.collapse : IC.expand;
  store.set(KEY + ":big", b ? "1" : "0");
  renderCard(true);
  refitUntil = performance.now() + 700;
  run();
}

// ── gestos: arrastrar el 3D lo gira (tocarlo no cambia de paso) ──
stageEl.addEventListener("pointerdown", (e) => {
  if (hwPanel.classList.contains("on")) openHw(false);
  drag = { x: e.clientX, y: e.clientY, yaw: target.yaw, pitch: target.pitch, moved: false };
  stageEl.setPointerCapture(e.pointerId);
  if (ct.on) { ct.on = false; ctSvg.classList.remove("on"); }
  run();
});
stageEl.addEventListener("pointermove", (e) => {
  if (!drag) return;
  const w = stageEl.getBoundingClientRect().width;
  if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) { drag.moved = true; medir("girar"); }
  if (!drag.moved) return;
  spin = 0; freeCam = true;
  target.yaw = drag.yaw - ((e.clientX - drag.x) / w) * 240;
  target.pitch = Math.max(-10, Math.min(75, drag.pitch + ((e.clientY - drag.y) / w) * 160));
  if (!hinted) { hinted = true; store.set(KEY + ":hint", "1"); hint.classList.add("off"); }
  run();
});
const soltar = () => { drag = null; run(); };
stageEl.addEventListener("pointerup", soltar);
stageEl.addEventListener("pointercancel", soltar);

// ── botones ──
story.addEventListener("click", (e) => {
  const b = e.target.closest("button,[data-go],[data-pick],a");
  if (!b) return;
  if (b.matches("[data-help]")) medir("ayuda", { valor: "whatsapp" }, true);
  else if (b.matches("[data-xsell]")) medir("xsell", { valor: b.href }, true);
  else if (b.matches("[data-mtsp]")) medir("musica");
  if (b.matches("[data-next]")) goNext();
  else if (b.matches("[data-momgo]")) armar();
  else if (b.matches("[data-mas]")) sheetEl.scrollBy({ top: Math.round(sheetEl.clientHeight * 0.6), behavior: still ? "auto" : "smooth" });
  else if (b.matches("[data-rvopen]")) { clearTimeout(rvT); medir("opinion", { valor: "pantalla" }, true); showReview(); }
  else if (b.matches("[data-prev]")) setStep(cur - 1, { haptic: true });
  else if (b.matches("[data-restart]")) setStep(0);
  else if (b.matches("[data-pause]")) setPaused(!paused);
  else if (b.matches("[data-big]")) { if (!big) medir("zoom"); setBig(!big); }
  else if (b.matches("[data-hw]")) openHw(!hwPanel.classList.contains("on"));
  else if (b.matches("[data-pick]")) pickPart(Number(b.dataset.pick));
  else if (b.matches("[data-open]")) { medir("indice"); openIndex(true); }
  else if (b.matches("[data-close]")) openIndex(false);
  else if (b.matches("[data-go]")) { openIndex(false); setStep(Number(b.dataset.go)); }
  else if (b.matches("[data-ck]")) {
    b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
    const all = [...card.querySelectorAll("[data-ck]")], n = all.filter((x) => x.getAttribute("aria-pressed") === "true").length;
    card.querySelector("[data-allok]").textContent = n === all.length ? "¡Está todo! Ya podés empezar a armar ✨" : "Tocá cada grupo a medida que lo contás.";
    if (n === all.length) medir("herrajes_ok");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.target.closest && e.target.closest("[data-pick]") && (e.key === "Enter" || e.key === " ")) { pickPart(Number(e.target.dataset.pick)); e.preventDefault(); return; }
  if (mom.classList.contains("on")) {
    if ((e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest("a, [data-momgo]")) return;
    if (e.key === "Enter" || e.key === "ArrowRight" || e.key === " ") { armar(); e.preventDefault(); } else if (e.key === "Escape") { hideMoment(); e.preventDefault(); }
    return;
  }
  if (rv.classList.contains("on")) { if (e.key === "Escape") { hideReview(); e.preventDefault(); } return; }
  if (e.key === "ArrowRight" || e.key === " ") goNext();
  else if (e.key === "ArrowLeft") setStep(cur - 1);
  else if (e.key === "Escape") { openIndex(false); openHw(false); }
  else return;
  e.preventDefault();
});

// ── confeti ──
let confT = 0, confRaf = 0;
function confetti() {
  if (still) return;
  const cv = $("[data-confetti]"), r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = r.width * dpr; cv.height = r.height * dpr;
  const g = cv.getContext("2d"); g.scale(dpr, dpr);
  const cols = P.marca.confeti;
  const Pt = Array.from({ length: 90 }, () => ({ x: r.width / 2 + (Math.random() - 0.5) * 60, y: r.height * 0.45, vx: (Math.random() - 0.5) * 9, vy: -6 - Math.random() * 8, s: 5 + Math.random() * 6, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.3, c: cols[(Math.random() * cols.length) | 0] }));
  let t0 = 0;
  cancelAnimationFrame(confRaf);
  (function f(t) {
    t0 ||= t; const el = (t - t0) / 1000;
    g.clearRect(0, 0, r.width, r.height);
    for (const p of Pt) { p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.a += p.va; g.save(); g.globalAlpha = Math.max(0, 1 - el / 2.6); g.translate(p.x, p.y); g.rotate(p.a); g.fillStyle = p.c; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); }
    if (el < 2.6) confRaf = requestAnimationFrame(f); else { confRaf = 0; g.clearRect(0, 0, r.width, r.height); }
  })(0);
}
function stopConfetti() { cancelAnimationFrame(confRaf); confRaf = 0; const cv = $("[data-confetti]"); cv.width = 0; }

// ── cotas de la portada: crecen desde el medio, cuentan y se quedan ──
const CT = P.cotas || null, CT_AT = [0.3, 0.55, 0.8], CT_DIM = 0.9;
const ct = { on: false, t0: 0, t: 0, els: null };
const ctEase = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const ctOut = (x) => 1 - Math.pow(1 - x, 3);
const ctCl = (x) => Math.max(0, Math.min(1, x));
function cotasEnter(i) {
  if (!CT) return;
  if (i !== 0) { ct.on = false; ctSvg.style.transition = "none"; ctSvg.classList.remove("on"); void ctSvg.getBoundingClientRect(); ctSvg.style.transition = ""; return; }
  ct.on = true; ct.t0 = performance.now(); ct.t = 0;
  ctSvg.classList.add("on");
}
function ctClock(now) { if (!ct.on) return false; ct.t = (now - ct.t0) / 1000; return ct.t < CT_AT[2] + CT_DIM + 0.2; }
function cotasPaint(R) {
  if (!CT || cur !== 0 || !ct.on) return;
  if (freeCam) { ct.on = false; ctSvg.classList.remove("on"); return; }
  const ns = "http://www.w3.org/2000/svg";
  ctSvg.setAttribute("viewBox", "0 0 " + R.width + " " + R.height);
  if (!ct.els) ct.els = [0, 1, 2].map(() => { const e = document.createElementNS(ns, "path"), d = document.createElementNS(ns, "path"), t = document.createElementNS(ns, "text"); e.setAttribute("class", "ext"); d.setAttribute("class", "dim"); ctSvg.append(e, d, t); return [e, d, t]; });
  const k = view.w / R.width;
  const Pp = (p) => { const [x, y] = motor.proyectar(p); return [(x - (view.cx - view.w / 2)) / k, (view.cy + view.h / 2 - y) / k]; };
  const [x0, x1, y0, y1, z0, z1] = CT.caja, S1 = CT.lado ?? -1; // lateral que se ve (-1 = izquierdo)
  const off = Math.max(x1 - x0, z1 - z0) * 0.08, Xs = S1 > 0 ? x1 : x0;
  const mid = Pp([(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2]);
  const t = still ? 1e9 : ct.t;
  // CT.lineas (opcional, por producto): [desde, hasta, desplazamiento, valor] en mm, con los puntos sobre el mueble real
  // y desplazamientos paralelos al piso: así las líneas auxiliares no quedan flotando en diagonal.
  const L = CT.lineas || [
    [[x1, y1, z0], [x0, y1, z0], [0, off, -off * 0.55], CT.w],
    [[Xs, y1, z0], [Xs, y0, z0], [S1 * off, 0, -off * 0.55], CT.d],
    [[Xs, y0, z0], [Xs, y0, z1], [S1 * off, -off * 0.35, 0], CT.h],
  ];
  L.forEach(([a, b, o, val], i) => {
    const [e, d, tx] = ct.els[i];
    const kk = ctEase(ctCl((t - CT_AT[i]) / CT_DIM));
    const a0 = Pp(a), b0 = Pp(b), a1 = Pp([a[0] + o[0], a[1] + o[1], a[2] + o[2]]), b1 = Pp([b[0] + o[0], b[1] + o[1], b[2] + o[2]]);
    const mx = (a1[0] + b1[0]) / 2, my = (a1[1] + b1[1]) / 2;
    const ax = mx + (a1[0] - mx) * kk, ay = my + (a1[1] - my) * kk, bx = mx + (b1[0] - mx) * kk, by = my + (b1[1] - my) * kk;
    const dx = b1[0] - a1[0], dy = b1[1] - a1[1], len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, h = 6.5;
    const hs = ctCl((kk - 0.85) / 0.15);
    const head = (x, y, sg) => "M" + (x + sg * ux * h + uy * h * 0.5) + " " + (y + sg * uy * h - ux * h * 0.5) + "L" + x + " " + y + "L" + (x + sg * ux * h - uy * h * 0.5) + " " + (y + sg * uy * h + ux * h * 0.5);
    const ext = (p0, p1) => { const ex = p1[0] - p0[0], ey = p1[1] - p0[1], el = Math.hypot(ex, ey) || 1, g = Math.min(3, el * 0.3); return "M" + (p0[0] + (ex / el) * g) + " " + (p0[1] + (ey / el) * g) + "L" + (p1[0] + (ex / el) * 4) + " " + (p1[1] + (ey / el) * 4); };
    e.setAttribute("d", ext(a0, a1) + ext(b0, b1));
    e.style.opacity = String(ctCl(kk * 1.4) * 0.5);
    d.style.opacity = kk > 0.02 ? "1" : "0";
    d.setAttribute("d", "M" + ax + " " + ay + "L" + bx + " " + by + (hs > 0 ? head(ax, ay, hs) + head(bx, by, -hs) : ""));
    let nx = -uy, ny = ux;
    if (nx * (mx - mid[0]) + ny * (my - mid[1]) < 0) { nx = -nx; ny = -ny; }
    const tw = tx.getComputedTextLength ? tx.getComputedTextLength() : 40, gap = 7 + (Math.abs(nx) * tw) / 2 + Math.abs(ny) * 7;
    tx.setAttribute("x", String(mx + nx * gap));
    tx.setAttribute("y", String(my + ny * gap));
    tx.style.opacity = String(ctCl((kk - 0.1) / 0.3));
    const v = Number(val) * ctOut(ctCl((kk - 0.1) / 0.9)), entero = Number.isInteger(Number(val));
    const label = (entero ? String(Math.round(v)) : (Math.round(v * 10) / 10).toFixed(1).replace(".", ",")) + " " + (CT.unidad || "cm");
    if (tx.textContent !== label) tx.textContent = label;
  });
}

// ── arranque ──
window.__manual = { setStep, showMoment, hideMoment, showReview, hideReview, enterB: () => { for (const n in mv) if (!mv[n].hold) mv[n].v = 0; enterB(); }, motor };
setStep(Number(qs.get("paso")) || 0);
