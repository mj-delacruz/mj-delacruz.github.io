/* ===================================================================
   The studio — Mary Jane Dela Cruz
   A Three.js diorama of a graphic-art studio. Her real work hangs on
   the walls, the Graphtec-style plotter cuts shapes on a loop, and four
   hotspots open the panels in site.js:

     monitor desk → about     plotter → services
     wall frames  → work      neon sign → contact

   Every piece of furniture is its own `part`, so the intro can drop
   them in one by one. Coordinates: floor top is y = 0, the back wall
   face is z = WALL_Z, the left wall face is x = WALL_X.
   =================================================================== */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const root = document.documentElement;
const MJ = window.MJ || (window.MJ = {});
const reduced = root.classList.contains('reduced');
const byFile = Object.fromEntries((MJ.WORK || []).map(w => [w.file, w]));

const canvas = document.getElementById('room');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
  root.classList.add('no-webgl');
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

const WALL_Z = -3.4;
const WALL_X = -3.8;

/* ---- palette ----------------------------------------------------------- */
const C = {
  wallBack: '#f8dedc', wallSide: '#f1cfcf', trim: '#fffaf8',
  floor: '#6a1426', grout: '#3a0a14',
  white: '#fbf8f6', ink: '#231d20', coral: '#fd8f96', blush: '#fec7ca', rose: '#7f484b',
  steel: '#b5aeb1', leaf: '#6fa487', vinyl: '#fffdfc'
};
const mats = {};
function mat(color, roughness = 0.75, metalness = 0) {
  const k = color + roughness + metalness;
  return mats[k] || (mats[k] = new THREE.MeshStandardMaterial({ color, roughness, metalness }));
}

/* ---- lights ------------------------------------------------------------ */
scene.add(new THREE.HemisphereLight(0xfff2f0, 0x9c8088, 1.8));
const sun = new THREE.DirectionalLight(0xffecdf, 2.4);
sun.position.set(6, 10, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.02;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xffd9de, 0.5);
fill.position.set(-4, 5, 8);
scene.add(fill);

/* ---- build helpers ------------------------------------------------------
   part() starts a new top-level group; every helper adds to it.          */
const parts = [];
const hot = [];
let cur = scene;

function part(name, from = 'above', hotspot = null) {
  const g = new THREE.Group();
  g.name = name;
  g.userData.from = from;
  g.userData.lift = new THREE.Vector3(0, 0.06, 0);
  if (hotspot) { Object.assign(g.userData, hotspot); hot.push(g); }
  scene.add(g);
  parts.push(g);
  cur = g;
  return g;
}
function add(mesh, x, y, z, o = {}) {
  mesh.position.set(x, y, z);
  if (o.rx) mesh.rotation.x = o.rx;
  if (o.ry) mesh.rotation.y = o.ry;
  if (o.rz) mesh.rotation.z = o.rz;
  mesh.castShadow = o.cast !== false;
  mesh.receiveShadow = true;
  cur.add(mesh);
  return mesh;
}
const box = (w, h, d, m, x, y, z, o) => add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m), x, y, z, o);
const rbox = (w, h, d, r, m, x, y, z, o) => add(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m), x, y, z, o);
const cyl = (rt, rb, h, m, x, y, z, o = {}) => add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, o.seg || 28), m), x, y, z, o);
const sph = (r, m, x, y, z, o) => add(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), m), x, y, z, o);

const loader = new THREE.TextureLoader();
const maxAniso = renderer.capabilities.getMaxAnisotropy();
function loadTex(url, done) {
  loader.load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; done(t); });
}
function canvasTex(w, h, draw) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = maxAniso;
  t.redraw = (...args) => { draw(cv.getContext('2d'), w, h, ...args); t.needsUpdate = true; };
  t.redraw();
  return t;
}

/* ---- room shell -------------------------------------------------------- */
part('floor', 'grow');
// red-wine glossy tiles: a clear-coated slab with grout lines every 0.8
box(8, 0.3, 7.2, new THREE.MeshPhysicalMaterial({ color: C.floor, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06 }), 0, -0.15, 0);
for (let i = 1; i < 10; i++) box(0.014, 0.003, 7.18, mat(C.grout, 0.9), -4 + i * 0.8, 0.0015, 0, { cast: false });
for (let i = 1; i < 9; i++) box(7.98, 0.003, 0.014, mat(C.grout, 0.9), 0, 0.0015, -3.6 + i * 0.8, { cast: false });

part('walls', 'below');
box(8, 3.9, 0.2, mat(C.wallBack, 0.9), 0, 1.95, -3.5);
box(0.2, 3.9, 7.2, mat(C.wallSide, 0.9), -3.9, 1.95, 0);
box(8, 0.14, 0.05, mat(C.trim), 0, 0.07, WALL_Z + 0.025);
box(0.05, 0.14, 7.2, mat(C.trim), WALL_X + 0.025, 0.07, 0);
box(8, 0.08, 0.24, mat(C.trim), 0, 3.9, -3.5);
box(0.24, 0.08, 7.2, mat(C.trim), -3.9, 3.9, 0);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.14 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.3;
ground.receiveShadow = true;
scene.add(ground);

/* ---- framed work: a gallery cluster on the back wall ---------------------
   Columns of mixed sizes laid out around one centre line. The big frames
   open the work panel; `small` ones are decoration and take no clicks.  */
function frame(file, h, x, y, small = false) {
  const w = byFile[file];
  if (!w) return;
  const ph = h, pw = h * (w.w / w.h);
  const g = part('frame:' + file, 'above', small ? null : { hotspot: 'work', work: file, label: w.title });
  g.userData.lift = new THREE.Vector3(0, 0, small ? 0 : 0.08);
  const holder = new THREE.Group();
  holder.position.set(x, y, WALL_Z);
  g.add(holder);
  cur = holder;
  rbox(pw + 0.1, ph + 0.1, 0.04, 0.01, mat('#efe2dc', 0.5), 0, 0, 0.02);
  box(pw + 0.05, ph + 0.05, 0.004, mat(C.white), 0, 0, 0.042, { cast: false });
  const pm = new THREE.MeshStandardMaterial({ color: C.blush, roughness: 0.5, emissive: 0xffffff, emissiveIntensity: 0 });
  add(new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), pm), 0, 0, 0.046, { cast: false });
  loadTex('assets/img/thumbs/' + file + '.jpg', t => {
    pm.map = t; pm.emissiveMap = t; pm.emissiveIntensity = 0.32; pm.color.set(0xffffff); pm.needsUpdate = true;
  });
}

frame('logo-mayong-bago',         0.16, -2.4,  2.74, true);
frame('stickers-ate-tin',         0.19, -2.4,  2.37, true);
frame('logo-hangos',              0.5,  -1.81, 2.71);
frame('logo-racho-architectural', 0.14, -1.81, 2.2,  true);
frame('label-bisaya-brew',        0.74, -1.1,  2.55);
frame('moto-fasthouse-red',       0.32, -0.27, 2.88);
frame('logo-puscc',               0.48, -0.27, 2.29);
frame('promo-coldstart',          0.84,  0.53, 2.55);
frame('menu-sabaw',               0.45,  1.26, 2.78);
frame('campaign-amping-sa-byahe', 0.27,  1.26, 2.23, true);
frame('moto-green-camo',          0.35,  2.06, 2.84);
frame('diecut-santa-fe-set',      0.4,   2.06, 2.28);
frame('menu-pork-chicken',        0.24,  2.79, 3.0,  true);
frame('tarp-birthday-ezekiel',    0.34,  2.79, 2.52);
frame('logo-tigbaw',              0.19,  2.79, 2.07, true);
frame('campaign-one-mandaue',     0.48,  3.43, 2.55);

/* ---- gallery track lights ----------------------------------------------
   A black rail on wall brackets above the gallery with spotlights angled
   down at the frames. Real SpotLights (no shadows) light the frames; the
   room is too bright for their pools to show, so each also gets a painted
   beam: an arched, soft-edged glow added onto the wall behind the frames. */
part('track', 'above');
const TRACK_Y = 3.62, TRACK_Z = WALL_Z + 0.32;
cyl(0.018, 0.018, 6.6, mat(C.ink, 0.4), 0.55, TRACK_Y, TRACK_Z, { rz: Math.PI / 2, seg: 10 });
for (const x of [-2.4, 0.55, 3.5]) box(0.03, 0.03, 0.32, mat(C.ink, 0.4), x, TRACK_Y, WALL_Z + 0.16);
const lensMat = new THREE.MeshBasicMaterial({ color: '#ffd9a3', toneMapped: false });
const beamTex = canvasTex(256, 512, (x, w, h) => {
  x.clearRect(0, 0, w, h);
  const top = 70;
  const g = x.createLinearGradient(0, top, 0, h);
  g.addColorStop(0, 'rgba(255,176,98,0.95)');
  g.addColorStop(0.35, 'rgba(255,176,98,0.55)');
  g.addColorStop(1, 'rgba(255,176,98,0)');
  x.fillStyle = g;
  x.filter = 'blur(10px)';
  x.beginPath();
  x.moveTo(w * 0.5, top - 40);
  x.bezierCurveTo(w * 0.92, top - 30, w * 0.98, h * 0.6, w * 0.96, h);
  x.lineTo(w * 0.04, h);
  x.bezierCurveTo(w * 0.02, h * 0.6, w * 0.08, top - 30, w * 0.5, top - 40);
  x.fill();
});
const beamMat = new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, opacity: 0.62, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
for (const x of [-1.85, -0.25, 1.35, 2.95]) {
  cyl(0.008, 0.008, 0.08, mat(C.ink, 0.4), x, TRACK_Y - 0.04, TRACK_Z, { seg: 6 });
  // the can points from the rail toward the middle of the gallery
  const can = new THREE.Group();
  can.position.set(x, TRACK_Y - 0.1, TRACK_Z);
  can.rotation.x = 0.55;
  cur.add(can);
  const keep = cur;
  cur = can;
  cyl(0.055, 0.05, 0.17, mat(C.ink, 0.35), 0, -0.06, 0, { seg: 20 });
  cyl(0.045, 0.045, 0.004, lensMat, 0, -0.146, 0, { seg: 20, cast: false });
  cur = keep;
  add(new THREE.Mesh(new THREE.PlaneGeometry(1.25, 2.0), beamMat), x, 2.45, WALL_Z + 0.004, { cast: false });
  const spot = new THREE.SpotLight(0xffb36b, 3.4, 4.5, 0.42, 0.85, 2);
  spot.position.set(x, TRACK_Y - 0.18, TRACK_Z - 0.06);
  spot.target.position.set(x, 2.25, WALL_Z);
  cur.add(spot, spot.target);
}

/* ---- design desk (about) ----------------------------------------------- */
part('desk', 'above', { hotspot: 'about', label: 'About me' });
rbox(1.1, 0.08, 2.5, 0.02, mat(C.white, 0.6), -3.22, 1.06, 0.55);
for (const x of [-3.7, -2.74]) for (const z of [-0.62, 1.72]) cyl(0.025, 0.025, 1.02, mat(C.ink, 0.4), x, 0.51, z, { seg: 12 });
rbox(0.9, 0.66, 0.5, 0.03, mat(C.blush, 0.7), -3.3, 0.36, 1.42);
for (let i = 0; i < 2; i++) box(0.02, 0.03, 0.22, mat(C.coral), -2.84, 0.24 + i * 0.3, 1.42);
// monitor
rbox(0.28, 0.02, 0.32, 0.008, mat(C.ink, 0.4), -3.5, 1.11, 0.45);
box(0.04, 0.36, 0.06, mat(C.ink, 0.4), -3.54, 1.29, 0.45);
rbox(0.05, 0.72, 1.26, 0.015, mat(C.ink, 0.4), -3.5, 1.63, 0.45);
const screen = canvasTex(1024, 576, drawScreen);
add(new THREE.Mesh(new THREE.PlaneGeometry(1.18, 0.664), new THREE.MeshBasicMaterial({ map: screen, toneMapped: false })),
    -3.472, 1.63, 0.45, { ry: Math.PI / 2, cast: false });
const screenImg = new Image();
screenImg.onload = () => screen.redraw(screenImg);
screenImg.src = 'assets/img/thumbs/logo-mayong-bago.jpg';
// keyboard, mouse, pen tablet
rbox(0.26, 0.025, 0.75, 0.01, mat(C.white, 0.5), -2.98, 1.115, 0.45);
for (let i = 0; i < 4; i++) box(0.035, 0.006, 0.66, mat('#d9d2d4'), -3.07 + i * 0.06, 1.13, 0.45, { cast: false });
rbox(0.24, 0.006, 0.28, 0.003, mat(C.blush, 0.8), -2.98, 1.103, -0.09, { cast: false });
rbox(0.11, 0.035, 0.065, 0.016, mat(C.ink, 0.4), -2.98, 1.122, -0.09);
rbox(0.26, 0.018, 0.36, 0.012, mat(C.ink, 0.4), -3.15, 1.109, 1.33);
add(new THREE.Mesh(new THREE.PlaneGeometry(0.31, 0.21), new THREE.MeshBasicMaterial({ color: '#2a2427', toneMapped: false })),
    -3.15, 1.1185, 1.33, { rx: -Math.PI / 2, rz: Math.PI / 2, cast: false });
const tabletArt = new THREE.MeshBasicMaterial({ color: '#2a2427', toneMapped: false });
add(new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), tabletArt), -3.15, 1.119, 1.33, { rx: -Math.PI / 2, rz: Math.PI / 2, cast: false });
loadTex('assets/img/thumbs/logo-tigbaw.jpg', t => { tabletArt.map = t; tabletArt.color.set(0xffffff); tabletArt.needsUpdate = true; });
cyl(0.007, 0.007, 0.22, mat(C.coral), -2.97, 1.108, 1.33, { rx: Math.PI / 2, rz: 0.25, seg: 8 });
// lamp, mug, plant
cyl(0.11, 0.12, 0.03, mat(C.ink, 0.4), -3.58, 1.115, -0.45);
cyl(0.014, 0.014, 0.55, mat(C.ink, 0.4), -3.53, 1.38, -0.45, { rz: -0.22, seg: 8 });
const shade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.17, 24, 1, true), new THREE.MeshStandardMaterial({ color: C.coral, side: THREE.DoubleSide, roughness: 0.5 }));
add(shade, -3.43, 1.66, -0.42, { rz: -2.2 });
const lampLight = new THREE.PointLight(0xffd6b0, 0.8, 2.6, 2);
lampLight.position.set(-3.33, 1.55, -0.35);
cur.add(lampLight);
cyl(0.05, 0.045, 0.1, mat(C.coral, 0.4), -3.3, 1.15, -0.15);
cyl(0.1, 0.08, 0.18, mat(C.white, 0.6), -3.55, 1.19, 1.63);
for (let i = 0; i < 6; i++) {
  const a = i * 1.05;
  sph(0.07, mat(C.leaf, 0.8), -3.55 + Math.cos(a) * 0.06, 1.38 + (i % 3) * 0.06, 1.63 + Math.sin(a) * 0.06).scale.set(0.7, 1.8, 0.7);
}

part('chair', 'above');
rbox(0.6, 0.08, 0.6, 0.03, mat(C.coral, 0.7), -2.35, 0.62, 0.45);
rbox(0.08, 0.62, 0.56, 0.03, mat(C.coral, 0.7), -2.02, 1.0, 0.45, { rz: -0.1 });
cyl(0.035, 0.035, 0.5, mat(C.ink, 0.4), -2.35, 0.34, 0.45, { seg: 12 });
for (let i = 0; i < 5; i++) {
  const a = i * Math.PI * 2 / 5;
  box(0.3, 0.035, 0.05, mat(C.ink, 0.4), -2.35 + Math.cos(a) * 0.15, 0.08, 0.45 + Math.sin(a) * 0.15, { ry: -a });
  sph(0.035, mat(C.ink, 0.4), -2.35 + Math.cos(a) * 0.29, 0.035, 0.45 + Math.sin(a) * 0.29);
}

/* ---- neon sign (contact) ----------------------------------------------- */
part('neon', 'above', { hotspot: 'contact', label: 'Work with me' });
cur.userData.lift = new THREE.Vector3(0.06, 0, 0);
rbox(0.03, 0.72, 2.02, 0.03, mat(C.ink, 0.3), -3.785, 2.78, 0.5, { cast: false });
const neonTex = canvasTex(1024, 320, drawNeon);
const neonMat = new THREE.MeshBasicMaterial({ map: neonTex, transparent: true, toneMapped: false, depthWrite: false });
add(new THREE.Mesh(new THREE.PlaneGeometry(1.92, 0.6), neonMat), -3.765, 2.78, 0.5, { ry: Math.PI / 2, cast: false });
const neonLight = new THREE.PointLight(0xfd8f96, 2.2, 3.2, 2);
neonLight.position.set(-3.4, 2.78, 0.5);
cur.add(neonLight);
if (document.fonts) {
  Promise.all([
    document.fonts.load('800 150px "Bricolage Grotesque"'),
    document.fonts.load('600 34px "Martian Mono"')
  ]).then(() => neonTex.redraw()).catch(() => {});
}

/* ---- cutting plotter (services) ---------------------------------------- */
const X0 = 0.4, Z0 = -2.75;
part('plotter', 'above', { hotspot: 'services', label: 'Services' });
for (const s of [-1, 1]) {
  box(0.07, 0.8, 0.07, mat(C.ink, 0.4), X0 + s * 1.3, 0.42, Z0);
  rbox(0.1, 0.05, 0.7, 0.015, mat(C.ink, 0.4), X0 + s * 1.3, 0.025, Z0);
}
cyl(0.022, 0.022, 2.6, mat(C.steel, 0.3, 0.6), X0, 0.3, Z0, { rz: Math.PI / 2, seg: 10 });
rbox(2.6, 0.3, 0.5, 0.04, mat(C.white, 0.45), X0, 0.97, Z0);
for (const s of [-1, 1]) rbox(0.26, 0.42, 0.6, 0.05, mat(C.ink, 0.45), X0 + s * 1.43, 0.99, Z0);
box(2.6, 0.03, 0.01, mat(C.coral), X0, 0.9, Z0 + 0.252, { cast: false });
cyl(0.018, 0.018, 2.6, mat(C.steel, 0.25, 0.7), X0, 1.04, Z0 + 0.27, { rz: Math.PI / 2, seg: 10 });
box(0.14, 0.012, 0.18, new THREE.MeshBasicMaterial({ color: '#2b1c1f' }), X0 + 1.43, 1.207, Z0 + 0.1, { cast: false });
box(0.1, 0.002, 0.05, new THREE.MeshBasicMaterial({ color: C.coral, toneMapped: false }), X0 + 1.43, 1.214, Z0 + 0.08, { cast: false });
// media: the roll behind, the apron in front and the sheet sliding to the floor
cyl(0.1, 0.1, 2.3, mat(C.vinyl, 0.5), X0, 0.62, Z0 - 0.42, { rz: Math.PI / 2 });
cyl(0.03, 0.03, 2.5, mat(C.ink), X0, 0.62, Z0 - 0.42, { rz: Math.PI / 2, seg: 10 });
box(2.2, 0.006, 0.42, mat(C.vinyl, 0.5), X0, 0.83, Z0 + 0.46);
box(2.2, 0.006, 0.6, mat(C.vinyl, 0.5), X0, 0.59, -1.915, { rx: 0.97 });
const carriage = new THREE.Group();
cur.add(carriage);
cur = carriage;
rbox(0.18, 0.2, 0.16, 0.03, mat(C.ink, 0.4), 0, 1.02, Z0 + 0.33);
sph(0.018, new THREE.MeshBasicMaterial({ color: C.coral, toneMapped: false }), 0.06, 1.1, Z0 + 0.41);
cur = scene.getObjectByName('plotter');
const bladeMat = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
const blade = sph(0.014, bladeMat, X0, 0.845, Z0 + 0.46, { cast: false });
const cut = buildCutJob(cur);

/* ---- vinyl rack -------------------------------------------------------- */
part('rack', 'above');
for (const x of [2.6, 3.5]) rbox(0.05, 1.75, 0.5, 0.015, mat(C.white, 0.6), x, 0.875, Z0);
for (let i = 0; i < 4; i++) cyl(0.012, 0.012, 0.92, mat(C.steel, 0.3, 0.6), 3.05, 0.3 + i * 0.4 - 0.11, Z0, { rz: Math.PI / 2, seg: 8 });
const ROLLS = [C.coral, C.ink, C.blush, '#5aa9e6', '#f6c453', '#ffffff', C.rose, '#6fbf8e'];
ROLLS.forEach((c, i) => {
  const lvl = Math.floor(i / 2), side = i % 2 ? 0.12 : -0.12;
  cyl(0.1, 0.1, 0.82, mat(c, c === '#ffffff' ? 0.4 : 0.55), 3.05, 0.3 + lvl * 0.4, Z0 + side, { rz: Math.PI / 2 });
});
// spare rolls propped against the rack's right side panel: each foot
// stands on the floor and its top rests on the panel face (x = 3.525)
part('lean', 'above');
[['#f6c453', 0.12, -2.93], [C.coral, 0.15, -2.75], ['#5aa9e6', 0.13, -2.57]].forEach(([c, tilt, z]) => {
  const L = 1.15, r = 0.085, half = L / 2;
  const topX = 3.525 + r * Math.cos(tilt);
  const x = topX + half * Math.sin(tilt), y = half * Math.cos(tilt) + r * Math.sin(tilt);
  cyl(r, r, L, mat(c, 0.55), x, y, z, { rz: tilt });
});

/* ---- weeding table ----------------------------------------------------- */
// standing height, level with the desk top (y = 1.1)
part('table', 'above');
rbox(1.8, 0.06, 1.0, 0.02, mat(C.white, 0.6), 1.2, 1.07, 0.4);
for (const x of [0.4, 2.0]) for (const z of [0.0, 0.8]) cyl(0.025, 0.025, 1.05, mat(C.ink, 0.4), x, 0.525, z, { seg: 12 });
const matTex = canvasTex(512, 280, drawMat);
add(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.008, 0.8), new THREE.MeshStandardMaterial({ map: matTex, roughness: 0.8 })), 1.2, 1.104, 0.4, { cast: false });
box(0.62, 0.004, 0.42, mat(C.blush, 0.6), 0.95, 1.111, 0.38, { ry: 0.12, cast: false });
for (let i = 0; i < 3; i++) cyl(0.06, 0.06, 0.004, mat([C.coral, C.rose, '#f6c453'][i], 0.5), 0.8 + i * 0.16, 1.115, 0.36 + (i % 2) * 0.08, { cast: false });
for (let i = 0; i < 3; i++) box(0.46, 0.004, 0.32, mat(['#ffffff', '#5aa9e6', C.coral][i], 0.6), 1.62, 1.111 + i * 0.005, 0.62, { ry: -0.08 + i * 0.07, cast: false });
cyl(0.008, 0.008, 0.2, mat(C.steel, 0.3, 0.7), 1.72, 1.116, 0.45, { rx: Math.PI / 2, rz: 1.2, seg: 6 });

/* ---- Mary Jane at the table ---------------------------------------------
   Her VRoid model (MJ_MODEL) stands behind the weeding table, facing the
   room, smoothing a decal down with a squeegee. Both arms are posed with
   two-bone IK (solveArm); the squeegee hand is re-aimed every frame by
   poseMJ and the squeegee is slid under her palm after the skeleton
   updates. A flat palm on a block reads well without finger posing.     */
part('mj', 'above');
const mj = new THREE.Group();
mj.position.set(1.2, 0, -0.36);
cur.add(mj);
const TABLE_TOP = 1.11;
// the decal she's applying, under its clear transfer tape
box(0.56, 0.004, 0.14, mat('#f6c453', 0.6), 1.15, TABLE_TOP + 0.002, 0.06, { cast: false });
box(0.6, 0.002, 0.17, new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2, transparent: true, opacity: 0.35 }), 1.15, TABLE_TOP + 0.005, 0.06, { cast: false });
// the squeegee, its felt edge on the table at the origin
const squeegee = new THREE.Group();
squeegee.visible = false;
mj.add(squeegee);
cur = squeegee;
rbox(0.06, 0.05, 0.12, 0.014, mat(C.coral, 0.5), 0, 0.028, 0);
box(0.014, 0.006, 0.12, mat(C.ink, 0.9), -0.016, 0.003, 0, { cast: false });
cur = scene.getObjectByName('mj');

const MJ_MODEL = 'assets/models/mj.vrm';
const MJ_SCALE = 1.3;
const ELBOW_R = new THREE.Vector3(-1, -0.6, -0.4), ELBOW_L = new THREE.Vector3(1, -0.6, -0.4);
const _dir = new THREE.Vector3(), _bend = new THREE.Vector3(), _elbow = new THREE.Vector3(), _fore = new THREE.Vector3(), _q = new THREE.Quaternion();
const _grip = new THREE.Vector3(), _target = new THREE.Vector3();
const DOWN = new THREE.Vector3(0, -1, 0), _palm = new THREE.Vector3(), _want = new THREE.Vector3(), _twist = new THREE.Quaternion();
const _bx = new THREE.Vector3(), _by = new THREE.Vector3(), _bz = new THREE.Vector3(), _basis = new THREE.Matrix4(), _hand = new THREE.Quaternion();
const FINGERS_R = new THREE.Vector3(0.3, -0.15, 1).normalize(), FINGERS_L = new THREE.Vector3(-0.3, -0.1, 1).normalize();
let avatar = null;

// two-bone arm IK on the VRM's normalized bones: in the rest T-pose every
// normalized bone has an identity rotation, so the model's own space works
// as the upper arm's parent frame. The elbow bends toward `pole`, and the
// forearm is twisted so the palm (facing down in the T-pose) faces the table.
// The hand is then aimed outright: fingers along `fingers`, palm flat down.
function solveArm(arm, target, pole, fingers) {
  const { up, lo, hand, sign, s, a, b, rest } = arm;
  _dir.copy(target).sub(s);
  const d = Math.min(_dir.length(), a + b - 1e-4);
  _dir.normalize();
  const along = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a * a - along * along));
  _bend.copy(pole).addScaledVector(_dir, -pole.dot(_dir)).normalize();
  _elbow.copy(s).addScaledVector(_dir, along).addScaledVector(_bend, h);
  up.quaternion.setFromUnitVectors(rest, _fore.copy(_elbow).sub(s).normalize());
  _q.setFromUnitVectors(rest, _fore.copy(s).addScaledVector(_dir, d).sub(_elbow).normalize());
  _palm.copy(DOWN).applyQuaternion(_q).addScaledVector(_fore, -_palm.dot(_fore)).normalize();
  _want.copy(DOWN).addScaledVector(_fore, -DOWN.dot(_fore)).normalize();
  const turn = Math.acos(THREE.MathUtils.clamp(_palm.dot(_want), -1, 1));
  _twist.setFromAxisAngle(_fore, _palm.cross(_want).dot(_fore) < 0 ? -turn : turn);
  _q.premultiply(_twist);
  lo.quaternion.copy(up.quaternion).invert().multiply(_q);
  // rest hand: fingers along ±x (sign), palm toward -y
  _bx.copy(fingers).multiplyScalar(sign);
  _by.copy(DOWN).addScaledVector(fingers, -DOWN.dot(fingers)).normalize().negate();
  _bz.crossVectors(_bx, _by);
  _hand.setFromRotationMatrix(_basis.makeBasis(_bx, _by, _bz));
  hand.quaternion.copy(_q).invert().multiply(_hand);
}

// u in 0..1 is how far across the decal the squeegee has swept
function poseMJ(u) {
  if (!avatar) return;
  solveArm(avatar.right, _target.set(-0.26 + u * 0.26, TABLE_TOP + 0.07, 0.3), ELBOW_R, FINGERS_R);
  avatar.head.rotation.y = -0.15 + u * 0.12;
}

// the squeegee sits under her knuckles, so her curled fingers wrap its front edge
function placeSqueegee() {
  mj.worldToLocal(avatar.grip.getWorldPosition(_grip));
  squeegee.position.set(_grip.x, TABLE_TOP, _grip.z - 0.02);
}

Promise.all([import('three/addons/loaders/GLTFLoader.js'), import('@pixiv/three-vrm')])
  .then(([{ GLTFLoader }, { VRMLoaderPlugin, VRMUtils }]) => {
    const gl = new GLTFLoader();
    gl.register(p => new VRMLoaderPlugin(p));
    return gl.loadAsync(MJ_MODEL).then(gltf => {
      const vrm = gltf.userData.vrm;
      VRMUtils.rotateVRM0(vrm);
      vrm.scene.scale.setScalar(MJ_SCALE);
      vrm.scene.position.z = 0.08;
      vrm.scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
      mj.add(vrm.scene);
      vrm.update(0);
      mj.updateWorldMatrix(true, true);
      const bone = n => vrm.humanoid.getNormalizedBoneNode(n);
      const at = o => mj.worldToLocal(o.getWorldPosition(new THREE.Vector3()));
      const arm = side => {
        const up = bone(side + 'UpperArm'), lo = bone(side + 'LowerArm');
        const s = at(up), e = at(lo), w = at(bone(side + 'Hand'));
        return {
          up, lo, hand: bone(side + 'Hand'), sign: side === 'right' ? -1 : 1,
          s, a: s.distanceTo(e), b: e.distanceTo(w), rest: e.clone().sub(s).normalize()
        };
      };
      avatar = {
        vrm, head: bone('head'), right: arm('right'), left: arm('left'),
        grip: vrm.humanoid.getRawBoneNode('rightMiddleProximal') || vrm.humanoid.getRawBoneNode('rightHand')
      };
      // fingers curled toward the palm. In the
      // T-pose the right fingers point -x and the left +x, so a curl
      // toward the palm is +z on the right and -z on the left.
      const curl = (side, k) => {
        const sign = side === 'right' ? 1 : -1;
        for (const f of ['Index', 'Middle', 'Ring', 'Little']) {
          ['Proximal', 'Intermediate', 'Distal'].forEach((j, i) => {
            const b = bone(side + f + j);
            if (b) b.rotation.z = sign * k * [1, 1.3, 0.9][i];
          });
        }
        const thumb = bone(side + 'ThumbProximal');
        if (thumb) thumb.rotation.y = sign * k * 0.6;
      };
      curl('right', 0.5);
      curl('left', 0.12);
      bone('neck').rotation.x = 0.2;
      avatar.head.rotation.x = 0.35;
      solveArm(avatar.left, new THREE.Vector3(0.24, TABLE_TOP + 0.035, 0.28), ELBOW_L, FINGERS_L);
      poseMJ(0.5);
      // settle the spring bones (hair, sleeves) on the pose, not the T-pose
      vrm.update(0);
      mj.updateWorldMatrix(true, true);
      vrm.springBoneManager?.reset();
      placeSqueegee();
      squeegee.visible = true;
    });
  })
  .catch(err => console.warn('MJ model not loaded', err));

/* ---- cloud rug and its cat ---------------------------------------------
   A wavy blob rug in concentric tufted bands, pink outside to a cream
   centre. Each band is the same wobbly outline pulled in by `inset`, laid
   flat a hair above the last so they never z-fight.                   */
part('rug', 'grow');
const RUG_X = 0.9, RUG_Z = 0.75, RUG_RX = 1.55, RUG_RZ = 1.3;
const rugOutline = inset => {
  const pts = [];
  for (let i = 0; i < 128; i++) {
    const t = i / 128 * Math.PI * 2;
    const wob = 1 + 0.09 * Math.sin(3 * t + 0.4) + 0.05 * Math.sin(5 * t + 1.3);
    pts.push(new THREE.Vector2((RUG_RX * wob - inset) * Math.cos(t), (RUG_RZ * wob - inset) * Math.sin(t)));
  }
  return new THREE.Shape(pts);
};
add(new THREE.Mesh(new THREE.ExtrudeGeometry(rugOutline(0.03), { depth: 0.006, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.012, bevelSegments: 4, curveSegments: 4 }),
    mat('#f4b3bd', 1)), RUG_X, 0.006, RUG_Z, { rx: -Math.PI / 2, cast: false });
[[0.13, '#fad3d7'], [0.22, '#f4b3bd'], [0.34, '#e8a0ab'], [0.5, '#fbe3e3'], [0.56, '#fbf5ee']].forEach(([inset, c], i) => {
  add(new THREE.Mesh(new THREE.ShapeGeometry(rugOutline(inset), 4), mat(c, 1)), RUG_X, 0.0255 + i * 0.0008, RUG_Z, { rx: -Math.PI / 2, cast: false });
});

// a fluffy white cat lying on the rug in front of the table, facing the room
part('cat', 'above');
const cat = new THREE.Group();
cat.position.set(0.8, 0.026, 1.38);
cat.rotation.y = 0.75;
cur.add(cat);
cur = cat;
const fur = mat('#f7f1ea', 1), furShade = mat('#ece2d6', 1);
sph(0.16, fur, 0, 0.12, -0.06).scale.set(1.05, 0.72, 1.55);
sph(0.13, fur, 0, 0.15, 0.17).scale.set(1.05, 0.95, 0.9);
sph(0.1, fur, 0, 0.08, 0.25).scale.set(1.2, 0.8, 1);
for (const x of [-1, 1]) {
  sph(0.05, fur, x * 0.065, 0.04, 0.3).scale.set(0.95, 0.75, 1.6);
  sph(0.08, fur, x * 0.065, 0.24, 0.3).scale.set(1, 0.85, 0.8);
  add(new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.085, 12), fur), x * 0.065, 0.375, 0.26, { rz: -x * 0.35, cast: false });
  add(new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.05, 10), mat('#f4c6c6', 0.9)), x * 0.063, 0.37, 0.272, { rz: -x * 0.35, cast: false });
  sph(0.017, mat(C.ink, 0.3), x * 0.045, 0.29, 0.378, { cast: false });
}
sph(0.12, fur, 0, 0.28, 0.27);
sph(0.012, mat('#f2a5ad', 0.6), 0, 0.258, 0.39, { cast: false });
// the tail curls round her left side, thinning toward the tip
for (let i = 0; i < 9; i++) {
  const t = i / 8, a = -2.2 + t * 1.5;
  sph(0.065 - t * 0.022, i % 2 ? furShade : fur, -0.06 + Math.cos(a) * 0.24, 0.06, -0.12 + Math.sin(a) * 0.24);
}
cur = scene.getObjectByName('cat');

// a second cat by the mirror: a generated model (Z-up, facing -y in its
// file, 2.88 units tall) stood upright, its pale fur darkened to charcoal
part('mirrorCat', 'above');
const mirrorCat = new THREE.Group();
mirrorCat.position.set(-3.05, 0, -1.6);
mirrorCat.rotation.y = 1.1;
cur.add(mirrorCat);
import('three/addons/loaders/GLTFLoader.js').then(({ GLTFLoader }) => new GLTFLoader().loadAsync('assets/models/cat.glb')).then(gltf => {
  gltf.scene.rotation.x = -Math.PI / 2;
  gltf.scene.scale.setScalar(0.45 / 2.88);
  const c = new THREE.Color();
  gltf.scene.traverse(o => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    // no materials in the file means glTF's fully metallic default, which
    // renders dark and muddy without an environment map: make it matte fur
    o.material.metalness = 0;
    o.material.roughness = 0.9;
    // greys and creams (low saturation, not near-black) are fur; eyes,
    // nose and inner ears keep their colours. Vertex colours are linear,
    // so charcoal on screen means very small values here
    const col = o.geometry.attributes.color;
    if (!col) return;
    for (let i = 0; i < col.count; i++) {
      c.fromBufferAttribute(col, i);
      const hi = Math.max(c.r, c.g, c.b), lo = Math.min(c.r, c.g, c.b);
      if (hi > 0.25 && hi - lo < 0.25 * hi) col.setXYZ(i, 0.022 + c.r * 0.04, 0.019 + c.g * 0.036, 0.019 + c.b * 0.036);
    }
    col.needsUpdate = true;
  });
  mirrorCat.add(gltf.scene);
}).catch(err => console.warn('cat model not loaded', err));

/* ---- mini dirt bike ---------------------------------------------------
   A pit bike wearing one of her decal kits. Built along local +x (front)
   with its left side facing +z, then turned to show that side to camera. */
part('bike', 'above');
const bike = new THREE.Group();
bike.position.set(3.0, 0, 2.0);
bike.rotation.y = Math.PI / 4;
cur.add(bike);
cur = bike;
const kitTex = canvasTex(640, 256, drawKit);
const plateTex = canvasTex(320, 192, drawPlate);
if (document.fonts) document.fonts.load('800 150px "Bricolage Grotesque"').then(() => { kitTex.redraw(); plateTex.redraw(); }).catch(() => {});
// the same print on both sides of a panel whose faces sit at ±z
const decal = (t, w, h, x, y, z) => {
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.4 });
  for (const s of [1, -1]) add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), m), x, y, s * z, { ry: s < 0 ? Math.PI : 0, cast: false });
};
// wheels
for (const x of [-0.4, 0.42]) {
  add(new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.048, 12, 36), mat(C.ink, 0.85)), x, 0.218, 0);
  cyl(0.135, 0.135, 0.03, mat(C.steel, 0.3, 0.6), x, 0.218, 0, { rx: Math.PI / 2, seg: 32 });
  cyl(0.04, 0.04, 0.13, mat(C.ink, 0.4), x, 0.218, 0, { rx: Math.PI / 2, seg: 12 });
}
// engine and exhaust
rbox(0.3, 0.24, 0.18, 0.04, mat(C.ink, 0.45), 0.02, 0.36, 0);
for (let i = 0; i < 3; i++) box(0.2, 0.012, 0.19, mat(C.steel, 0.3, 0.6), 0.04, 0.42 + i * 0.03, 0, { cast: false });
cyl(0.025, 0.025, 0.5, mat(C.steel, 0.25, 0.7), -0.2, 0.52, -0.1, { rz: 1.35, seg: 10 });
cyl(0.045, 0.045, 0.2, mat(C.steel, 0.25, 0.7), -0.46, 0.58, -0.1, { rz: 1.35, seg: 16 });
// swingarm and shock
for (const z of [-0.06, 0.06]) box(0.42, 0.04, 0.025, mat(C.steel, 0.3, 0.6), -0.2, 0.26, z, { rz: 0.2 });
cyl(0.03, 0.03, 0.36, mat(C.coral, 0.4), -0.12, 0.47, 0, { rz: -0.35, seg: 12 });
// frame, forks, bars
cyl(0.02, 0.02, 0.4, mat(C.ink, 0.4), 0.2, 0.57, 0, { rz: -0.52, seg: 10 });
for (const z of [-0.07, 0.07]) cyl(0.022, 0.022, 0.58, mat(C.steel, 0.25, 0.7), 0.36, 0.49, z, { rz: 0.22, seg: 12 });
cyl(0.014, 0.014, 0.46, mat(C.ink, 0.4), 0.28, 0.81, 0, { rx: Math.PI / 2, seg: 10 });
for (const z of [-0.2, 0.2]) cyl(0.02, 0.02, 0.08, mat(C.coral, 0.6), 0.28, 0.81, z, { rx: Math.PI / 2, seg: 10 });
// bodywork: tank shrouds, seat, side plates, fenders, front plate
rbox(0.36, 0.17, 0.22, 0.02, mat(C.coral, 0.4), 0.12, 0.66, 0);
decal(kitTex, 0.3, 0.12, 0.12, 0.66, 0.111);
rbox(0.52, 0.06, 0.16, 0.025, mat(C.ink, 0.7), -0.2, 0.74, 0, { rz: -0.04 });
rbox(0.24, 0.16, 0.17, 0.015, mat(C.white, 0.5), -0.26, 0.6, 0);
decal(plateTex, 0.2, 0.12, -0.26, 0.6, 0.086);
rbox(0.4, 0.025, 0.14, 0.012, mat(C.coral, 0.4), -0.5, 0.7, 0, { rz: -0.14 });
rbox(0.36, 0.025, 0.12, 0.012, mat(C.coral, 0.4), 0.52, 0.47, 0, { rz: 0.12 });
rbox(0.02, 0.15, 0.18, 0.01, mat(C.white, 0.5), 0.4, 0.68, 0, { rz: 0.22 });

cur = scene.getObjectByName('bike');

/* ---- left wall: a backlit wavy mirror and a bird of paradise -----------
   The mirror is frameless: an organic blob outline cut as a thin slab of
   faked glass (pale blue-grey sheen, soft streaks, no real reflection).
   Its warm LED backlight is a blurred copy of the outline painted on a
   plane between glass and wall, plus a faint point light on the wall. */
part('mirror', 'above');
const MIRROR_W = 1.05, MIRROR_H = 2.42, MIRROR_Y = 1.5, MIRROR_Z = -2.06, GLOW_PAD = 0.7;
const blob = (w, h) => {
  const pts = [];
  for (let i = 0; i < 128; i++) {
    const t = i / 128 * Math.PI * 2;
    const x = w / 2 * Math.cos(t) * (1 + 0.1 * Math.sin(3 * t + 0.6)) + 0.08 * Math.sin(4 * Math.sin(t));
    const y = h / 2 * Math.sin(t) * (1 + 0.04 * Math.sin(2 * t + 1.1));
    pts.push(new THREE.Vector2(x, y));
  }
  return pts;
};
const mirrorOutline = blob(MIRROR_W, MIRROR_H);
const mirror = new THREE.Group();
mirror.position.set(WALL_X, MIRROR_Y, MIRROR_Z);
mirror.rotation.y = Math.PI / 2;
cur.add(mirror);
cur = mirror;
const glowTex = canvasTex(512, 1024, (x, w, h) => {
  const sx = w / (MIRROR_W + GLOW_PAD), sy = h / (MIRROR_H + GLOW_PAD);
  x.clearRect(0, 0, w, h);
  x.beginPath();
  mirrorOutline.forEach((p, i) => x[i ? 'lineTo' : 'moveTo'](w / 2 + p.x * sx, h / 2 - p.y * sy));
  x.closePath();
  x.shadowColor = '#ffc77a';
  for (const blur of [70, 35]) { x.shadowBlur = blur; x.fillStyle = '#ffd9a0'; x.fill(); }
});
add(new THREE.Mesh(new THREE.PlaneGeometry(MIRROR_W + GLOW_PAD, MIRROR_H + GLOW_PAD),
    new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })),
    0, 0, 0.004, { cast: false });
const glass = new THREE.MeshStandardMaterial({ color: '#d3dde3', roughness: 0.06, metalness: 0.3, emissive: '#eef6fa', emissiveIntensity: 0.22 });
add(new THREE.Mesh(new THREE.ExtrudeGeometry(new THREE.Shape(mirrorOutline), { depth: 0.012, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 2 }), glass),
    0, 0, 0.03, { cast: false });
const sheen = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.4, depthWrite: false });
for (const [y, w, o] of [[0.32, 0.1, -0.02], [0.22, 0.045, 0.17], [-0.48, 0.07, -0.06]]) {
  add(new THREE.Mesh(new THREE.PlaneGeometry(w, 0.62), sheen), o, y, 0.05, { rz: -0.55, cast: false });
}
const mirrorLight = new THREE.PointLight(0xffc98a, 0.7, 2.2, 2);
mirrorLight.position.set(0, 0, 0.25);
mirror.add(mirrorLight);

// bird of paradise in a round white bowl, in the corner past the mirror
part('paradise', 'above');
const PX = -3.42, PZ = -3.0;
add(new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 20, 0, Math.PI * 2, 0.55, Math.PI - 0.55), mat(C.white, 0.7)), PX, 0.25, PZ).scale.y = 0.95;
cyl(0.225, 0.225, 0.01, mat('#e9e4dd', 0.9), PX, 0.46, PZ, { cast: false });
for (let i = 0; i < 14; i++) sph(0.022, mat(i % 2 ? '#f4f1ec' : '#d9d3cb', 0.9), PX + Math.cos(i * 2.4) * 0.15 * ((i % 4) / 4 + 0.3), 0.47, PZ + Math.sin(i * 2.4) * 0.15 * ((i % 4) / 4 + 0.3), { cast: false });
const leafShape = new THREE.Shape();
leafShape.moveTo(0, 0);
leafShape.bezierCurveTo(0.14, 0.12, 0.14, 0.5, 0, 0.7);
leafShape.bezierCurveTo(-0.14, 0.5, -0.14, 0.12, 0, 0);
const leafGeo = new THREE.ShapeGeometry(leafShape, 12);
const leafMats = ['#3f7d4f', '#4f9160', '#2f6b42'].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, side: THREE.DoubleSide }));
// [stem length, heading around the pot, lean, leaf twist, leaf scale]
[[1.05, 0.2, 0.1, 0.3, 1.1], [0.85, 1.3, 0.28, -0.6, 1.0], [0.7, 2.4, 0.38, 0.9, 0.9], [0.95, 3.4, 0.22, -0.2, 1.05],
 [0.6, 4.4, 0.45, 0.5, 0.85], [0.8, 5.3, 0.3, -0.9, 0.95], [1.2, 2.9, 0.06, 1.4, 1.15]].forEach(([L, heading, lean, twist, k], i) => {
  const stem = new THREE.Group();
  stem.position.set(PX, 0.46, PZ);
  stem.rotation.y = heading;
  cur.add(stem);
  const tip = new THREE.Group();
  tip.rotation.z = -lean;
  stem.add(tip);
  const keep = cur;
  cur = tip;
  cyl(0.012, 0.016, L, mat('#5c8a4a', 0.6), 0, L / 2, 0, { seg: 8 });
  const leaf = add(new THREE.Mesh(leafGeo, leafMats[i % 3]), 0, L - 0.02, 0, { rz: -0.15, ry: twist });
  leaf.scale.setScalar(k);
  cur = keep;
});

part('plants', 'above');
// tall snake plant: flat pointed leaves fanning out of a white pot
cyl(0.19, 0.15, 0.42, mat(C.white, 0.5), -3.42, 0.21, 2.45);
cyl(0.17, 0.17, 0.02, mat('#5a3d33', 0.9), -3.42, 0.41, 2.45, { cast: false });
[[0.95, 0.0, 0.05], [0.8, 1.2, -0.12], [1.05, 2.3, 0.1], [0.7, 3.4, -0.18], [0.88, 4.5, 0.14], [0.62, 5.5, 0.2], [0.75, 0.6, -0.08]].forEach(([h, a, tilt], i) => {
  const leaf = add(new THREE.Mesh(new THREE.ConeGeometry(0.055, h, 4), mat(i % 2 ? '#4f8f6a' : '#6fa487', 0.6)),
    -3.42 + Math.cos(a) * 0.06, 0.42 + h / 2, 2.45 + Math.sin(a) * 0.06, { ry: a, rz: tilt });
  leaf.scale.z = 0.3;
});
// smaller bushy plant in a coral pot
cyl(0.15, 0.12, 0.3, mat(C.coral, 0.6), -3.45, 0.15, 3.1);
for (let i = 0; i < 9; i++) {
  const a = i * 2.4, r = i ? 0.09 : 0;
  sph(0.085, mat(i % 3 ? C.leaf : '#5b9476', 0.8), -3.45 + Math.cos(a) * r, 0.38 + (i % 3) * 0.05, 3.1 + Math.sin(a) * r);
}

/* ---- offcuts on the floor ---------------------------------------------- */
part('offcuts', 'above');
[[C.coral, -0.3, -1.4, 0.4], ['#f6c453', 0.3, -1.25, -0.6], [C.blush, 1.5, -1.45, 1.1], ['#5aa9e6', -0.9, -1.2, 2.0], [C.rose, 2.0, -1.1, 0.2]]
  .forEach(([c, x, z, r]) => box(0.16, 0.003, 0.1, mat(c, 0.6), x, 0.003, z, { ry: r, cast: false }));

/* ===================================================================
   Canvas drawings
   =================================================================== */
function drawScreen(x, w, h, img) {
  x.fillStyle = '#1e1e1e'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#2b2b2b'; x.fillRect(0, 0, w, 26);
  x.fillStyle = '#323232'; x.fillRect(0, 26, w, 30);
  x.fillStyle = '#2b2b2b'; x.fillRect(0, 56, 40, h - 56); x.fillRect(w - 170, 56, 170, h - 56);
  x.fillStyle = '#001e36'; x.fillRect(8, 4, 20, 18);
  x.fillStyle = '#31a8ff'; x.font = '600 12px Helvetica, Arial'; x.fillText('Ps', 11, 17);
  x.fillStyle = '#5a5a5a';
  for (let i = 0; i < 9; i++) x.fillRect(12, 72 + i * 34, 16, 16);
  for (let i = 0; i < 6; i++) { x.fillStyle = i === 1 ? '#3d5a80' : '#383838'; x.fillRect(w - 162, 70 + i * 40, 154, 34); }
  x.fillStyle = '#3a3a3a'; x.fillRect(40, 56, w - 210, h - 56);
  if (img) {
    const aw = w - 250, ah = h - 96, s = Math.min(aw / img.width, ah / img.height);
    const iw = img.width * s, ih = img.height * s;
    x.drawImage(img, 40 + (w - 210 - iw) / 2, 56 + (h - 56 - ih) / 2, iw, ih);
  }
}

function drawNeon(x, w, h) {
  x.clearRect(0, 0, w, h);
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.font = '800 150px "Bricolage Grotesque", Helvetica, sans-serif';
  x.shadowColor = '#fd5f6c';
  x.lineJoin = 'round';
  for (const b of [60, 30, 12]) { x.shadowBlur = b; x.lineWidth = 12; x.strokeStyle = '#fd8f96'; x.strokeText('work with me', w / 2, 130); }
  x.shadowBlur = 6; x.fillStyle = '#fff4f5'; x.fillText('work with me', w / 2, 130);
  x.font = '600 34px "Martian Mono", monospace';
  x.shadowBlur = 16; x.fillStyle = '#fec7ca';
  x.fillText('✦  OPEN FOR WORK  ✦', w / 2, 262);
}

// the shroud decal: a slashed coral-and-ink kit with her initials
function drawKit(x, w, h) {
  x.fillStyle = '#fd8f96'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#231d20';
  for (const [x0, bw] of [[-40, 90], [150, 34], [210, 16]]) {
    x.beginPath(); x.moveTo(x0, h); x.lineTo(x0 + bw, h); x.lineTo(x0 + bw + 110, 0); x.lineTo(x0 + 110, 0); x.fill();
  }
  x.fillStyle = '#fff4f5';
  x.beginPath(); x.moveTo(250, h); x.lineTo(270, h); x.lineTo(380, 0); x.lineTo(360, 0); x.fill();
  x.font = '800 130px "Bricolage Grotesque", Helvetica, sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineWidth = 10; x.strokeStyle = '#231d20'; x.strokeText('MJ', 500, 136);
  x.fillStyle = '#fff4f5'; x.fillText('MJ', 500, 136);
}

function drawPlate(x, w, h) {
  x.fillStyle = '#fbf8f6'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#fd8f96'; x.fillRect(0, h - 26, w, 26);
  x.font = '800 130px "Bricolage Grotesque", Helvetica, sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = '#231d20'; x.fillText('131', w / 2, 86);
}

function drawMat(x, w, h) {
  x.fillStyle = '#3e7f66'; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(255,255,255,.16)'; x.lineWidth = 1;
  for (let i = 0; i <= w; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
  for (let i = 0; i <= h; i += 16) { x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); }
  x.strokeStyle = 'rgba(255,255,255,.38)'; x.lineWidth = 2;
  for (let i = 0; i <= w; i += 80) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
  for (let i = 0; i <= h; i += 80) { x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); }
}

/* ===================================================================
   The cut job: three shapes traced on the apron by the blade. Each
   shape is filled in once its contour closes — a finished sticker.
   =================================================================== */
function buildCutJob(parent) {
  const Y = 0.836, CZ = Z0 + 0.46;
  const v = (cx, px, py) => new THREE.Vector3(cx + px, Y, CZ - py);

  const heart = [], star = [], circle = [];
  for (let i = 0; i <= 64; i++) {
    const t = i / 64 * Math.PI * 2, s = 0.0075;
    heart.push([16 * Math.sin(t) ** 3 * s, (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s + 0.02]);
    circle.push([Math.cos(t) * 0.12, Math.sin(t) * 0.12]);
  }
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.055 : 0.135;
    star.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  const shapes = [
    { cx: X0 - 0.8, pts: heart, color: C.coral },
    { cx: X0,       pts: star, color: '#f6c453' },
    { cx: X0 + 0.8, pts: circle, color: C.rose }
  ];

  const segs = [];
  let prev = new THREE.Vector3(X0 + 1.2, Y, CZ);
  shapes.forEach((s, si) => {
    const p = s.pts.map(([a, b]) => v(s.cx, a, b));
    segs.push({ a: prev, b: p[0], cut: false });
    for (let i = 1; i < p.length; i++) segs.push({ a: p[i - 1], b: p[i], cut: true, shape: si, last: i === p.length - 1 });
    prev = p[p.length - 1];

    const sh = new THREE.Shape(s.pts.map(([a, b]) => new THREE.Vector2(a, b)));
    const m = new THREE.MeshStandardMaterial({ color: s.color, roughness: 0.5, transparent: true, opacity: 0 });
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(sh), m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(s.cx, Y + 0.0005, CZ);
    parent.add(mesh);
    s.fill = m;
  });
  segs.push({ a: prev, b: new THREE.Vector3(X0 + 1.2, Y, CZ), cut: false });

  const cutSegs = segs.filter(s => s.cut);
  const pos = new Float32Array(cutSegs.length * 6);
  cutSegs.forEach((s, i) => { s.a.toArray(pos, i * 6); s.b.toArray(pos, i * 6 + 3); s.index = i; });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setDrawRange(0, 0);
  const lineMat = new THREE.LineBasicMaterial({ color: C.rose, transparent: true });
  const lines = new THREE.LineSegments(geo, lineMat);
  lines.position.y = 0.0012;
  parent.add(lines);

  let len = 0;
  segs.forEach(s => { s.start = len; s.len = s.a.distanceTo(s.b); len += s.len; });
  return { segs, shapes, geo, lineMat, total: len, speed: 0.42, hold: 2.2, fade: 0.6 };
}

const bladePos = new THREE.Vector3();
function runCut(t) {
  const job = cut, run = job.total / job.speed, cycle = run + job.hold + job.fade;
  const k = t % cycle, d = Math.min(k, run) * job.speed;
  let drawn = 0, seg = job.segs[job.segs.length - 1];
  for (const s of job.segs) {
    if (d < s.start + s.len) { seg = s; break; }
    if (s.cut) drawn = s.index + 1;
    if (s.cut && s.last) job.shapes[s.shape].done = true;
  }
  job.shapes.forEach((s, i) => {
    const doneShape = job.segs.some(x => x.cut && x.last && x.shape === i && d >= x.start + x.len);
    s.fill.opacity += ((doneShape ? 0.92 : 0) - s.fill.opacity) * 0.08;
  });
  bladePos.lerpVectors(seg.a, seg.b, seg.len ? (d - seg.start) / seg.len : 1);
  job.geo.setDrawRange(0, drawn * 2);
  const fade = k > run + job.hold ? 1 - (k - run - job.hold) / job.fade : 1;
  job.lineMat.opacity = fade;
  if (fade < 1) job.shapes.forEach(s => { s.fill.opacity = Math.min(s.fill.opacity, fade * 0.92); });
  blade.position.set(bladePos.x, 0.845, bladePos.z);
  bladeMat.color.set(seg.cut && k < run ? '#ffffff' : '#9c8f92');
  carriage.position.x = bladePos.x;
}

/* ===================================================================
   Camera, controls and focus
   =================================================================== */
const HOME = { pos: new THREE.Vector3(9.4, 7.6, 10.2), tgt: new THREE.Vector3(0, 1.35, -0.3) };
const FOCUS = {
  about:   { pos: new THREE.Vector3(1.1, 3.1, 3.4),   tgt: new THREE.Vector3(-3.4, 1.55, 0.45) },
  services:{ pos: new THREE.Vector3(2.0, 4.35, 3.6),  tgt: new THREE.Vector3(0.4, 0.95, -2.5) },
  work:    { pos: new THREE.Vector3(0.55, 2.7, 6.0),  tgt: new THREE.Vector3(0.55, 2.55, -3.4) },
  contact: { pos: new THREE.Vector3(1.0, 2.95, 2.0),  tgt: new THREE.Vector3(-3.8, 2.8, 0.5) }
};
const PINS = {
  about:   { label: 'About me',  at: new THREE.Vector3(-3.45, 2.15, 0.45) },
  services:{ label: 'Services',  at: new THREE.Vector3(X0, 1.5, Z0) },
  work:    { label: 'Portfolio', at: new THREE.Vector3(0.55, 3.3, WALL_Z) },
  contact: { label: 'Contact',   at: new THREE.Vector3(-3.75, 3.32, 0.5) }
};

const controls = new OrbitControls(camera, canvas);
Object.assign(controls, {
  enableDamping: true, dampingFactor: 0.08, enablePan: false,
  minDistance: 5, maxDistance: 24, rotateSpeed: 0.6, zoomSpeed: 0.7,
  minPolarAngle: 0.35, maxPolarAngle: 1.32, minAzimuthAngle: -0.15, maxAzimuthAngle: 1.55
});

// a narrow screen needs the camera further out to fit the room
function fitScale() { const a = camera.aspect; return a < 1 ? Math.min(3, 1.45 / a) : a < 1.35 ? 1.15 : 1; }
function fitted(p, tgt) { return tgt.clone().add(p.clone().sub(tgt).multiplyScalar(fitScale())); }

const look = HOME.tgt.clone();
camera.position.copy(HOME.pos);
controls.target.copy(HOME.tgt);
let userMoved = false;
controls.addEventListener('start', () => { userMoved = true; });

const view = { x: 0, y: 0 };
let tween = null, saved = null;

function flyTo(pos, tgt, ox, oy, done) {
  const dur = reduced ? 0 : 1100;
  controls.enabled = false;
  tween = { p0: camera.position.clone(), t0: look.clone(), x0: view.x, y0: view.y, p1: pos, t1: tgt, x1: ox, y1: oy, start: performance.now(), dur, done };
}

function drawerOffset() {
  const d = document.getElementById('drawer');
  const mobile = innerWidth <= 760;
  return mobile ? [0, (d ? d.offsetHeight : innerHeight * 0.8) * 0.5] : [(d ? d.offsetWidth : 500) * 0.5, 0];
}

function focus(key) {
  const f = FOCUS[key];
  if (!f) return;
  if (!saved) saved = { pos: camera.position.clone(), tgt: controls.target.clone() };
  const [ox, oy] = drawerOffset();
  flyTo(fitted(f.pos, f.tgt), f.tgt.clone(), ox, oy);
}
function unfocus() {
  const back = saved || { pos: fitted(HOME.pos, HOME.tgt), tgt: HOME.tgt.clone() };
  saved = null;
  flyTo(back.pos, back.tgt, 0, 0, () => { controls.target.copy(back.tgt); controls.enabled = true; });
}
window.addEventListener('mj:open', e => focus(e.detail.key));
window.addEventListener('mj:close', unfocus);

function applyView() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (Math.abs(view.x) > 0.5 || Math.abs(view.y) > 0.5) camera.setViewOffset(w, h, view.x, view.y, w, h);
  else camera.clearViewOffset();
}

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  if (!userMoved && !saved && !tween) camera.position.copy(fitted(HOME.pos, HOME.tgt));
  controls.maxDistance = 24 * fitScale();
  applyView();
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);
resize();

/* ===================================================================
   Pointer: hover labels and clicks
   =================================================================== */
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const tip = document.getElementById('tip');
let pointer = null, hovered = null, down = null;

function hotspotOf(obj) {
  while (obj && !obj.userData.hotspot) obj = obj.parent;
  return obj;
}
function pick(cx, cy) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(hot, true)[0];
  return hit ? hotspotOf(hit.object) : null;
}
canvas.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') pointer = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointerleave', () => { pointer = null; });
canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
canvas.addEventListener('pointerup', e => {
  if (!down || !built) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), quick = performance.now() - down.t < 500;
  down = null;
  if (moved > 6 || !quick) return;
  const g = pick(e.clientX, e.clientY);
  if (!g || !MJ.open) return;
  MJ.open(g.userData.hotspot, g.userData.work ? { work: g.userData.work } : undefined);
});

function updateHover() {
  const g = pointer && built && !tween ? pick(pointer.x, pointer.y) : null;
  if (g !== hovered) {
    hovered = g;
    canvas.style.cursor = g ? 'pointer' : '';
    tip.classList.toggle('on', !!g);
    if (g) tip.textContent = g.userData.label;
  }
  if (g) tip.style.transform = `translate(${pointer.x + 16}px, ${pointer.y + 14}px)`;
}

/* ---- pins: HTML buttons pinned to 3D anchors ---------------------------- */
const pinBox = document.getElementById('pins');
const pinEls = {};
Object.entries(PINS).forEach(([key, p]) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'pin';
  b.textContent = p.label;
  b.addEventListener('click', () => MJ.open && MJ.open(key));
  pinBox.appendChild(b);
  pinEls[key] = b;
});
pinBox.classList.add('off');
const proj = new THREE.Vector3();
function updatePins() {
  const off = !built || !!(MJ.current && MJ.current());
  pinBox.classList.toggle('off', off);
  if (off) return;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  for (const key in PINS) {
    proj.copy(PINS[key].at).project(camera);
    const el = pinEls[key];
    el.hidden = proj.z > 1;
    el.style.transform = `translate(${(proj.x + 1) / 2 * w}px, ${(1 - proj.y) / 2 * h}px)`;
  }
}

/* ===================================================================
   Build-in: the walls rise, the floor spreads, furniture drops in.
   =================================================================== */
let built = reduced, buildStart = null;
parts.forEach((g, i) => {
  g.userData.base = g.position.clone();
  g.userData.hk = 0;
  g.userData.delay = g.userData.from === 'grow' && i === 0 ? 0 : 260 + i * 85;
  if (!reduced) g.visible = false;
});
const buildEnd = 260 + parts.length * 85 + 750;
if (reduced) parts.forEach(g => { g.visible = true; });

function startBuild() { if (buildStart == null) buildStart = performance.now(); }
if (MJ.revealed) startBuild();
window.addEventListener('mj:reveal', startBuild);

const outBack = t => { const c = 1.5; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; };
const outCubic = t => 1 - (1 - t) ** 3;
const inOut = t => t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

function updateBuild(now) {
  if (built) return;
  if (buildStart == null) return;
  const el = now - buildStart;
  for (const g of parts) {
    const k = Math.min(1, Math.max(0, (el - g.userData.delay) / 700));
    g.visible = el >= g.userData.delay;
    const from = g.userData.from;
    g.userData.dy = from === 'above' ? (1 - outBack(k)) * 4.5 : from === 'below' ? -(1 - outCubic(k)) * 4.3 : 0;
    if (from === 'grow') { const s = 0.001 + outBack(k) * 0.999; g.scale.set(s, 1, s); }
  }
  if (el > buildEnd) { built = true; parts.forEach(g => { g.userData.dy = 0; g.scale.set(1, 1, 1); }); }
}

/* ===================================================================
   Loop
   =================================================================== */
const clock = new THREE.Clock();
let first = true, cutClock = 0;

function frameLoop() {
  requestAnimationFrame(frameLoop);
  const now = performance.now();
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  updateBuild(now);

  for (const g of parts) {
    const target = g === hovered ? 1 : 0;
    g.userData.hk += (target - g.userData.hk) * 0.18;
    g.position.copy(g.userData.base).addScaledVector(g.userData.lift, g.userData.hk);
    g.position.y += g.userData.dy || 0;
  }

  if (built) {
    if (!reduced) cutClock += dt;
    runCut(reduced ? cut.total / cut.speed : cutClock);
    // slow strokes back and forth across the decal
    if (!reduced) poseMJ(0.5 - 0.5 * Math.cos(t * 1.4));
  }
  if (avatar) { avatar.vrm.update(dt); placeSqueegee(); }
  const flicker = !built || reduced ? 1 : (Math.sin(t * 37) > 0.97 ? 0.75 : 1);
  neonMat.opacity = flicker;
  neonLight.intensity = 2.2 * flicker;

  if (tween) {
    const k = tween.dur ? Math.min(1, (now - tween.start) / tween.dur) : 1, e = inOut(k);
    camera.position.lerpVectors(tween.p0, tween.p1, e);
    look.lerpVectors(tween.t0, tween.t1, e);
    view.x = tween.x0 + (tween.x1 - tween.x0) * e;
    view.y = tween.y0 + (tween.y1 - tween.y0) * e;
    applyView();
    camera.updateProjectionMatrix();
    camera.lookAt(look);
    if (k >= 1) { const d = tween.done; tween = null; if (d) d(); }
  } else if (controls.enabled) {
    controls.update();
    look.copy(controls.target);
  }

  updateHover();
  updatePins();
  renderer.render(scene, camera);

  if (first) { first = false; root.classList.add('room-ready'); root.classList.remove('no-webgl'); }
}
frameLoop();
