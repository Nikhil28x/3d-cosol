import { a4 as attr, a5 as attr_class, a6 as ensure_array_like, a3 as derived, e as escape_html, a7 as attr_style } from "../../chunks/index.js";
import * as THREE from "three";
const std = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...opts });
({
  /* floors */
  floorExp: std(15133164, { roughness: 0.35, metalness: 0.05 }),
  // polished concrete
  floorWork: std(13219740, { roughness: 0.92 }),
  // warm wood / carpet
  floorCarpet: std(10134440, { roughness: 1 }),
  // work-zone carpet tile
  floorPantry: std(12160611, { roughness: 0.8 }),
  // herringbone timber
  slab: std(2239024, { roughness: 1 }),
  plinth: std(1449251, { roughness: 1 }),
  /* walls */
  wallWhite: std(15659507, { roughness: 0.95 }),
  wallWarm: std(14931651, { roughness: 0.97 }),
  wallAccentRust: std(12544583, { roughness: 0.9 }),
  wallAccentSage: std(9215097, { roughness: 0.9 }),
  ceiling: std(15922422, { roughness: 1 }),
  /* glass partitions / curtain wall */
  glass: new THREE.MeshPhysicalMaterial({
    color: 12576498,
    transmission: 0,
    transparent: true,
    opacity: 0.18,
    roughness: 0.05,
    metalness: 0,
    reflectivity: 0.3,
    side: THREE.DoubleSide
  }),
  glassFrame: std(10134442, { roughness: 0.4, metalness: 0.7 }),
  /* metals / frames */
  alu: std(12370888, { roughness: 0.4, metalness: 0.75 }),
  steelDark: std(2830647, { roughness: 0.5, metalness: 0.6 }),
  chrome: std(14147041, { roughness: 0.2, metalness: 0.9 }),
  /* woods */
  woodLight: std(13081192, { roughness: 0.7 }),
  woodMid: std(10910798, { roughness: 0.72 }),
  woodWarm: std(11566154, { roughness: 0.7 }),
  woodDark: std(7293484, { roughness: 0.7 }),
  /* upholstery */
  fabricGrey: std(9148061, { roughness: 1 }),
  fabricCream: std(14536893, { roughness: 1 }),
  fabricSage: std(9675905, { roughness: 1 }),
  leatherTan: std(11892042, { roughness: 0.6 }),
  fabricNavy: std(3095372, { roughness: 1 }),
  /* plastics / whites */
  whitePlastic: std(15856629, { roughness: 0.5 }),
  offWhite: std(15330285, { roughness: 0.8 }),
  /* tech */
  screen: new THREE.MeshStandardMaterial({
    color: 659478,
    emissive: 664115,
    emissiveIntensity: 0.6,
    roughness: 0.3
  }),
  screenBrand: new THREE.MeshStandardMaterial({
    color: 528409,
    emissive: 44783,
    emissiveIntensity: 0.35,
    roughness: 0.3
  }),
  consoleTop: std(1448736, { roughness: 0.5 }),
  consoleBody: std(2172974, { roughness: 0.6, metalness: 0.2 }),
  ledGreen: new THREE.MeshStandardMaterial({ color: 3791242, emissive: 3791242, emissiveIntensity: 0.8 }),
  /* brand */
  brand: new THREE.MeshStandardMaterial({
    color: 44783,
    roughness: 0.5,
    emissive: 19046,
    emissiveIntensity: 0.2
  }),
  /* greenery */
  planter: std(3359306, { roughness: 0.9 }),
  foliage: std(5077572, { roughness: 1 }),
  foliageLight: std(7314014, { roughness: 1 }),
  /* misc */
  rug: std(13352873, { roughness: 1 }),
  dark: std(1185821, { roughness: 0.8 })
});
const ZONES = {
  arrival: { id: "arrival", name: "Arrival / Client Experience", color: "#f4d8a8", wall: "#e9c388" },
  experience: { id: "experience", name: "Experience Centre", color: "#cdb7e6", wall: "#b9a0d8" },
  work: { id: "work", name: "Operational / Work Zone", color: "#9cc4dd", wall: "#8fb6d2" },
  leadership: { id: "leadership", name: "Leadership Zone", color: "#aed6a6", wall: "#9bc991" },
  collab: { id: "collab", name: "Collaborative Zone", color: "#f0b483", wall: "#e7a06a" },
  focus: { id: "focus", name: "Focus / Privacy", color: "#b07cb0", wall: "#9e679e" },
  wellness: { id: "wellness", name: "Wellness Zone", color: "#d98b86", wall: "#cf736d" },
  support: { id: "support", name: "Support / Utility", color: "#8fd9e0", wall: "#74ccd5" },
  core: { id: "core", name: "Building Core", color: "#b7c0c7", wall: "#9aa6ad" }
};
const SHELL = {
  width: 47.5,
  // X
  depth: 29
};
const ROOMS = [
  /* ===================== ARRIVAL ===================== */
  {
    id: "reception",
    name: "Reception & Brand Gallery",
    short: "Reception",
    zone: "arrival",
    floor: "main",
    x: 16.8,
    z: 0,
    w: 13.4,
    d: 7.2,
    partition: "open",
    furniture: "reception",
    dims: "6.4 × 5.8 m",
    tour: true,
    note: "Curved welcome desk, circular brand video counter (PD-T) and waiting lounge — the first impression for every visitor."
  },
  {
    id: "lounge",
    name: "Reception Lounge",
    short: "Lounge",
    zone: "arrival",
    floor: "main",
    x: 30.2,
    z: 0,
    w: 9,
    d: 7.2,
    partition: "open",
    furniture: "lounge",
    tour: true,
    note: "Hospitality-inspired waiting lounge beside the staircase up to the pantry mezzanine."
  },
  /* ===================== EXPERIENCE CENTRE (west) ===================== */
  {
    id: "podcast",
    name: "Podcast / AV Room",
    short: "Podcast / AV",
    zone: "experience",
    floor: "main",
    x: 0,
    z: 0,
    w: 5,
    d: 4.6,
    partition: "solid",
    furniture: "podcast",
    dims: "5.2 × 3 m",
    tour: true,
    note: "Acoustically treated podcast / AV studio — round table, mics and wall TV."
  },
  {
    id: "demo",
    name: "Customer Experience / Demo Lounge",
    short: "Demo Lounge",
    zone: "experience",
    floor: "main",
    x: 5.2,
    z: 0,
    w: 11.4,
    d: 6.6,
    partition: "glass",
    furniture: "demo-lounge",
    dims: "12.4 × 6.1 m",
    tour: true,
    note: "Transparent iStandees, Pro-Touch circular demo consoles and a discussion table for live product demos."
  },
  {
    id: "conference",
    name: "Conference Room",
    zone: "collab",
    floor: "main",
    x: 0,
    z: 6.9,
    w: 8.7,
    d: 5.4,
    partition: "glass",
    furniture: "conference",
    tag: "20 PAX",
    dims: "8.9 × 5.4 m",
    tour: true,
    note: "Boardroom with a boat-shaped conference table and a digital video wall."
  },
  {
    id: "digital-lab",
    name: "Digital Lab",
    zone: "experience",
    floor: "main",
    x: 9,
    z: 6.9,
    w: 6.3,
    d: 5.4,
    partition: "glass",
    furniture: "digital-lab",
    dims: "6.5 × 5.4 m",
    tour: true,
    note: "Pro-Touch X-Series interactive table behind a folding glass wall, with whiteboard."
  },
  {
    id: "server",
    name: "Server Room",
    zone: "support",
    floor: "main",
    x: 15.5,
    z: 6.9,
    w: 6.1,
    d: 5.4,
    partition: "solid",
    furniture: "server",
    dims: "6.3 × 5.4 m",
    note: "Strengthened floor for server loading — rack rows and cooling."
  },
  {
    id: "dock",
    name: "Digital Operation Centre",
    short: "Digital Ops",
    zone: "work",
    floor: "main",
    x: 0,
    z: 12.6,
    w: 10.2,
    d: 8,
    partition: "glass",
    furniture: "dock",
    dims: "10.2 × 10.6 m",
    tour: true,
    note: "Tiered command floor — rows of Pro-Edge consoles facing a large video wall."
  },
  {
    id: "security",
    name: "Security Operations",
    short: "Security",
    zone: "work",
    floor: "main",
    x: 10.5,
    z: 12.6,
    w: 5,
    d: 7.7,
    partition: "glass",
    furniture: "security",
    dims: "5.1 × 7.9 m",
    tour: true,
    note: "ProTouch Mission-Control consoles facing a wall of CoSol brand screens."
  },
  {
    id: "it",
    name: "IT Team",
    zone: "work",
    floor: "main",
    x: 15.7,
    z: 12.6,
    w: 5,
    d: 3.3,
    partition: "glass",
    furniture: "it",
    dims: "5.1 × 3.35 m",
    note: "IT support pod."
  },
  {
    id: "tac",
    name: "Technical Assistance Centre",
    short: "Tech Assistance",
    zone: "work",
    floor: "main",
    x: 0,
    z: 20.9,
    w: 10.5,
    d: 8.1,
    partition: "glass",
    furniture: "tac",
    dims: "10.6 × 9.1 m",
    tour: true,
    note: "Linear workstation benches with personal lockers and a full window wall."
  },
  /* ---- Exec cabins on the experience/work boundary ---- */
  {
    id: "exe-cabin-1",
    name: "Executive Cabin",
    short: "Exec Cabin",
    zone: "leadership",
    floor: "main",
    x: 16,
    z: 9.6,
    w: 4,
    d: 2.9,
    partition: "glass",
    furniture: "exec-cabin",
    tag: "EXE"
  },
  {
    id: "exe-cabin-2",
    name: "Executive Cabin",
    short: "Exec Cabin",
    zone: "leadership",
    floor: "main",
    x: 16,
    z: 12.7,
    w: 4,
    d: 3,
    partition: "glass",
    furniture: "exec-cabin",
    tag: "EXE"
  },
  /* ===================== SUPPORT / WELLNESS CLUSTER (centre) ============ */
  {
    id: "printer",
    name: "Printer Bay",
    zone: "support",
    floor: "main",
    x: 5,
    z: 20.9,
    w: 3.6,
    d: 2.6,
    partition: "half",
    furniture: "printer",
    note: "Reprographics / printer bay."
  },
  {
    id: "nap-1",
    name: "Nap Room",
    zone: "wellness",
    floor: "main",
    x: 11,
    z: 21,
    w: 2.8,
    d: 3.2,
    partition: "solid",
    furniture: "nap",
    tour: true,
    note: "Quiet wellness pod with a daybed."
  },
  {
    id: "nap-2",
    name: "Nap Room",
    zone: "wellness",
    floor: "main",
    x: 13.9,
    z: 21,
    w: 2.8,
    d: 3.2,
    partition: "solid",
    furniture: "nap"
  },
  {
    id: "ups",
    name: "UPS Room",
    zone: "support",
    floor: "main",
    x: 11,
    z: 24.4,
    w: 3.4,
    d: 3.4,
    partition: "solid",
    furniture: "ups"
  },
  {
    id: "battery",
    name: "Battery Room",
    zone: "support",
    floor: "main",
    x: 14.6,
    z: 24.4,
    w: 3.4,
    d: 3.4,
    partition: "solid",
    furniture: "battery"
  },
  /* ===================== WORKSPACE — COLLAB top band ==================== */
  {
    id: "collab-1",
    name: "Work Lounge / Collab",
    short: "Collab",
    zone: "collab",
    floor: "main",
    x: 20.4,
    z: 9.3,
    w: 4.6,
    d: 3.2,
    partition: "open",
    furniture: "collab",
    tour: true,
    note: "Informal work-lounge with soft seating and a high table."
  },
  {
    id: "phone-top-1",
    name: "Phone Booth · 2 seater",
    short: "Phone Booth",
    zone: "focus",
    floor: "main",
    x: 25.6,
    z: 9.3,
    w: 1.6,
    d: 2.4,
    partition: "solid",
    furniture: "phone-2",
    tag: "2 PAX"
  },
  {
    id: "phone-top-2",
    name: "Phone Booth · 2 seater",
    short: "Phone Booth",
    zone: "focus",
    floor: "main",
    x: 33.2,
    z: 9.3,
    w: 1.6,
    d: 2.4,
    partition: "solid",
    furniture: "phone-2",
    tag: "2 PAX"
  },
  /* ---- phone booths along the bottom of the workstation field ---- */
  {
    id: "phone-bot-1",
    name: "Phone Booth · 1 seater",
    zone: "focus",
    floor: "main",
    x: 22,
    z: 23,
    w: 1.3,
    d: 1.6,
    partition: "solid",
    furniture: "phone-1",
    tag: "1 PAX"
  },
  {
    id: "phone-bot-2",
    name: "Phone Booth · 1 seater",
    zone: "focus",
    floor: "main",
    x: 28,
    z: 23,
    w: 1.3,
    d: 1.6,
    partition: "solid",
    furniture: "phone-1",
    tag: "1 PAX"
  },
  {
    id: "phone-bot-3",
    name: "Phone Booth · 1 seater",
    zone: "focus",
    floor: "main",
    x: 34,
    z: 23,
    w: 1.3,
    d: 1.6,
    partition: "solid",
    furniture: "phone-1",
    tag: "1 PAX"
  },
  /* ===================== WORKSPACE — east meeting / leadership ========= */
  {
    id: "mt-4pax",
    name: "Meeting Room · 4 seater",
    short: "4 PAX Mtg",
    zone: "collab",
    floor: "main",
    x: 39.6,
    z: 0.6,
    w: 3.6,
    d: 3.6,
    partition: "glass",
    furniture: "meeting",
    tag: "4 PAX"
  },
  {
    id: "mt-8pax-top",
    name: "Meeting Room · 8 seater",
    short: "8 PAX Mtg",
    zone: "collab",
    floor: "main",
    x: 43.4,
    z: 0.6,
    w: 4,
    d: 4.4,
    partition: "glass",
    furniture: "meeting",
    tag: "8 PAX",
    tour: true,
    note: "Glass-walled meeting room with city views."
  },
  {
    id: "mt-6pax",
    name: "Meeting Room · 6 seater",
    short: "6 PAX Mtg",
    zone: "collab",
    floor: "main",
    x: 43,
    z: 5.4,
    w: 4.4,
    d: 3.8,
    partition: "glass",
    furniture: "meeting",
    tag: "6 PAX"
  },
  {
    id: "cabin-e1",
    name: "Manager Cabin",
    short: "Cabin",
    zone: "leadership",
    floor: "main",
    x: 43.4,
    z: 9.6,
    w: 4,
    d: 3,
    partition: "glass",
    furniture: "cabin"
  },
  {
    id: "cabin-e2",
    name: "Manager Cabin",
    short: "Cabin",
    zone: "leadership",
    floor: "main",
    x: 43.4,
    z: 12.8,
    w: 4,
    d: 3,
    partition: "glass",
    furniture: "cabin"
  },
  {
    id: "cabin-e3",
    name: "Manager Cabin",
    short: "Cabin",
    zone: "leadership",
    floor: "main",
    x: 43.4,
    z: 16,
    w: 4,
    d: 3,
    partition: "glass",
    furniture: "cabin"
  },
  {
    id: "cabin-e4",
    name: "Manager Cabin",
    short: "Cabin",
    zone: "leadership",
    floor: "main",
    x: 43.4,
    z: 19.2,
    w: 4,
    d: 3,
    partition: "glass",
    furniture: "cabin"
  },
  {
    id: "mt-4pax-e",
    name: "Meeting Room · 4 seater",
    short: "4 PAX Mtg",
    zone: "collab",
    floor: "main",
    x: 43.4,
    z: 22.4,
    w: 4,
    d: 3.4,
    partition: "glass",
    furniture: "meeting",
    tag: "4 PAX"
  },
  /* ---- bottom band: cabins + big meeting room + exec ---- */
  {
    id: "cabin-s1",
    name: "Manager Cabin",
    short: "Cabin",
    zone: "leadership",
    floor: "main",
    x: 19.6,
    z: 25.2,
    w: 3.4,
    d: 3.6,
    partition: "glass",
    furniture: "cabin"
  },
  {
    id: "cabin-s2",
    name: "Manager Cabin",
    short: "Cabin",
    zone: "leadership",
    floor: "main",
    x: 23.1,
    z: 25.2,
    w: 3.4,
    d: 3.6,
    partition: "glass",
    furniture: "cabin"
  },
  {
    id: "mt-8pax-bot",
    name: "Meeting Room · 8 seater",
    short: "8 PAX Mtg",
    zone: "collab",
    floor: "main",
    x: 26.7,
    z: 25.2,
    w: 5.2,
    d: 3.6,
    partition: "glass",
    furniture: "meeting",
    tag: "8 PAX"
  },
  {
    id: "cabin-s3",
    name: "Manager Cabin",
    short: "Cabin",
    zone: "leadership",
    floor: "main",
    x: 32.1,
    z: 25.2,
    w: 3.4,
    d: 3.6,
    partition: "glass",
    furniture: "cabin"
  },
  {
    id: "cabin-s4",
    name: "Manager Cabin",
    short: "Cabin",
    zone: "leadership",
    floor: "main",
    x: 35.6,
    z: 25.2,
    w: 3.4,
    d: 3.6,
    partition: "glass",
    furniture: "cabin"
  },
  {
    id: "exe-cabin-s",
    name: "Executive Cabin",
    short: "Exec Cabin",
    zone: "leadership",
    floor: "main",
    x: 39.1,
    z: 25.2,
    w: 4.4,
    d: 3.6,
    partition: "glass",
    furniture: "exec-cabin",
    tag: "EXE",
    tour: true,
    note: "Corner executive cabin with private meeting setting."
  },
  /* ===================== BUILDING CORE (north spine) =================== */
  {
    id: "core",
    name: "Lift Lobby & Service Core",
    short: "Core",
    zone: "core",
    floor: "main",
    x: 39.6,
    z: 0,
    w: 7.9,
    d: 0,
    // drawn as a thin marker strip; see note
    partition: "open",
    furniture: "empty",
    note: "Passenger + service lifts and main entry (north-east)."
  },
  /* ===================== MEZZANINE — Pantry / Café ==================== */
  {
    id: "pantry",
    name: "Pantry / Café",
    short: "Pantry",
    zone: "arrival",
    floor: "mezzanine",
    x: 30,
    z: 0.5,
    w: 13.5,
    d: 8.6,
    partition: "open",
    furniture: "pantry",
    tag: "45 seats",
    dims: "166.81 m²",
    tour: true,
    note: "Mezzanine pantry & café — counter, island and 45 covers overlooking the floor. Reached by the reception staircase."
  },
  {
    id: "mezz-pod-1",
    name: "Meeting Pod · 4 seater",
    short: "Meeting Pod",
    zone: "collab",
    floor: "mezzanine",
    x: 30.4,
    z: 0.8,
    w: 2.6,
    d: 2.2,
    partition: "glass",
    furniture: "meeting-pod",
    tag: "4 PAX"
  },
  {
    id: "mezz-pod-2",
    name: "Meeting Pod · 4 seater",
    short: "Meeting Pod",
    zone: "collab",
    floor: "mezzanine",
    x: 34.2,
    z: 0.8,
    w: 2.6,
    d: 2.2,
    partition: "glass",
    furniture: "meeting-pod",
    tag: "4 PAX"
  },
  {
    id: "store",
    name: "Store Room",
    zone: "support",
    floor: "mezzanine",
    x: 43.7,
    z: 0.5,
    w: 3.3,
    d: 3.4,
    partition: "solid",
    furniture: "store"
  }
];
const WORKFIELD = {
  x: 20.2,
  z: 11.4,
  w: 22,
  d: 11.2
};
const STAIR = { x: 27.6, z: 0.4, w: 2.2, d: 6 };
const FACTS = {
  totalCarpet: "1,436 m²  /  15,460 ft²"
};
const SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    blurb: "The whole floor — arrival, experience centre, workspace and pantry mezzanine."
  },
  {
    id: "experience",
    label: "Experience Centre",
    blurb: "High-tech, immersive arrival journey: brand gallery, demo lounge, labs and command floors.",
    focus: "reception"
  },
  {
    id: "workspace",
    label: "Workspace",
    blurb: "Warm, hospitality-driven work zone: 60 workstations, cabins, meeting rooms and lounges.",
    focus: "workfield"
  },
  {
    id: "mezzanine",
    label: "Mezzanine",
    blurb: "Pantry & café for 45 with meeting pods, reached by the reception staircase.",
    focus: "pantry"
  }
];
const EXPERIENCE = /* @__PURE__ */ new Set([
  "reception",
  "demo",
  "podcast",
  "digital-lab",
  "conference",
  "server",
  "dock",
  "security",
  "it",
  "tac"
]);
function sectionOf(room) {
  if (room.floor === "mezzanine") return "mezzanine";
  if (EXPERIENCE.has(room.id)) return "experience";
  return "workspace";
}
const UI_ROOMS = ROOMS.filter((r) => r.furniture !== "empty").map((r) => ({
  id: r.id,
  name: r.name,
  short: r.short ?? r.name,
  zone: r.zone,
  zoneName: ZONES[r.zone].name,
  zoneColor: ZONES[r.zone].color,
  tag: r.tag,
  dims: r.dims,
  note: r.note,
  section: sectionOf(r),
  tour: r.tour
}));
UI_ROOMS.push({
  id: "workfield",
  name: "Open Workstations",
  short: "Open Workstations",
  zone: "work",
  zoneName: ZONES.work.name,
  zoneColor: ZONES.work.color,
  tag: "60 desks",
  note: "Central operational zone — sixty 1500×600 workstations in greened clusters with collab spines.",
  section: "workspace",
  tour: false
});
function roomsInSection(s) {
  return UI_ROOMS;
}
function Minimap($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      section = "overview",
      selected = null,
      hovered = null,
      cam = { x: 24, z: 14, rot: 0 }
    } = $$props;
    const W = SHELL.width;
    const D = SHELL.depth;
    const main = ROOMS.filter((r) => r.furniture !== "empty" && r.floor === "main");
    const mezz = ROOMS.filter((r) => r.floor === "mezzanine");
    const inSection = (id) => {
      if (section === "overview") return true;
      const r = ROOMS.find((x) => x.id === id);
      if (id === "workfield") return section === "workspace";
      return r ? sectionOf(r) === section : false;
    };
    const camAngle = derived(() => 90 - cam.rot * 180 / Math.PI);
    $$renderer2.push(`<svg${attr("viewBox", `-0.6 -0.6 ${W + 1.2} ${D + 1.2}`)} class="map svelte-1q4gp9r" role="img" aria-label="Floor plan minimap"><rect x="0" y="0" width="17.4"${attr("height", D)} fill="#1b262e" class="svelte-1q4gp9r"></rect><rect x="17.4" y="0"${attr("width", W - 17.4)}${attr("height", D)} fill="#241f1a" class="svelte-1q4gp9r"></rect><rect x="0" y="0"${attr("width", W)}${attr("height", D)} fill="none" stroke="rgba(255,255,255,.18)" stroke-width="0.12" class="svelte-1q4gp9r"></rect>`);
    if (inSection("workfield")) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<g${attr_class("room svelte-1q4gp9r", void 0, { "dim": section !== "overview" && !inSection("workfield") })} role="button" tabindex="0"><rect${attr("x", WORKFIELD.x)}${attr("y", WORKFIELD.z)}${attr("width", WORKFIELD.w)}${attr("height", WORKFIELD.d)}${attr("fill", ZONES.work.color)}${attr("fill-opacity", selected === "workfield" ? 0.95 : 0.5)}${attr("stroke", selected === "workfield" || hovered === "workfield" ? "#00aeef" : "rgba(0,0,0,.25)")}${attr("stroke-width", selected === "workfield" || hovered === "workfield" ? 0.35 : 0.1)} class="svelte-1q4gp9r"></rect></g>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--><!--[-->`);
    const each_array = ensure_array_like(main);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let r = each_array[$$index];
      $$renderer2.push(`<g${attr_class("room svelte-1q4gp9r", void 0, { "dim": !inSection(r.id) })} role="button" tabindex="0"><rect${attr("x", r.x)}${attr("y", r.z)}${attr("width", r.w)}${attr("height", r.d)}${attr("fill", ZONES[r.zone].color)}${attr("fill-opacity", selected === r.id ? 0.95 : hovered === r.id ? 0.8 : 0.62)}${attr("stroke", selected === r.id || hovered === r.id ? "#00aeef" : "rgba(0,0,0,.3)")}${attr("stroke-width", selected === r.id || hovered === r.id ? 0.35 : 0.08)} class="svelte-1q4gp9r"></rect></g>`);
    }
    $$renderer2.push(`<!--]--><rect${attr("x", STAIR.x)}${attr("y", STAIR.z)}${attr("width", STAIR.w)}${attr("height", STAIR.d)} fill="none" stroke="rgba(255,255,255,.4)" stroke-width="0.1" stroke-dasharray="0.4 0.3" class="svelte-1q4gp9r"></rect><!--[-->`);
    const each_array_1 = ensure_array_like(mezz);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let r = each_array_1[$$index_1];
      $$renderer2.push(`<rect${attr("x", r.x)}${attr("y", r.z)}${attr("width", r.w)}${attr("height", r.d)}${attr("fill", section === "mezzanine" ? ZONES[r.zone].color : "none")}${attr("fill-opacity", section === "mezzanine" ? selected === r.id ? 0.9 : 0.5 : 0)}${attr("stroke", selected === r.id || hovered === r.id ? "#00aeef" : "rgba(255,210,140,.55)")} stroke-width="0.12" stroke-dasharray="0.5 0.35" class="room svelte-1q4gp9r" role="button" tabindex="0"></rect>`);
    }
    $$renderer2.push(`<!--]--><g${attr("transform", `translate(${cam.x} ${cam.z}) rotate(${camAngle()})`)}><polygon points="1.4,0 -0.9,1.0 -0.9,-1.0" fill="#00aeef" stroke="#fff" stroke-width="0.12"></polygon><circle cx="0" cy="0" r="0.45" fill="#00aeef" stroke="#fff" stroke-width="0.12"></circle></g><text x="8.7"${attr("y", D - 0.8)} class="lbl svelte-1q4gp9r">EXPERIENCE</text><text x="32"${attr("y", D - 0.8)} class="lbl svelte-1q4gp9r">WORKSPACE</text></svg>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeSection = "overview";
    let selectedId = null;
    let hoveredId = null;
    let mode = "orbit";
    let labelsOn = true;
    let touring = false;
    let cam = { x: 24, z: 22, rot: 0 };
    const rooms = derived(() => roomsInSection());
    const groups = derived(() => {
      const map = /* @__PURE__ */ new Map();
      for (const r of rooms()) {
        if (!map.has(r.zone)) map.set(r.zone, { name: r.zoneName, color: r.zoneColor, items: [] });
        map.get(r.zone).items.push(r);
      }
      return [...map.values()];
    });
    const selectedRoom = derived(() => null);
    const sectionMeta = derived(() => SECTIONS.find((s) => s.id === activeSection));
    $$renderer2.push(`<main class="svelte-1uha8ag">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <header class="svelte-1uha8ag"><div class="brand svelte-1uha8ag"><div class="logo svelte-1uha8ag">CS</div> <div class="brand-txt svelte-1uha8ag"><strong class="svelte-1uha8ag">Connectivity Solutions</strong> <span class="svelte-1uha8ag">Experience Centre · Bangalore</span></div></div> <nav class="tabs svelte-1uha8ag"><!--[-->`);
    const each_array = ensure_array_like(SECTIONS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let s = each_array[$$index];
      $$renderer2.push(`<button${attr_class("svelte-1uha8ag", void 0, { "active": activeSection === s.id })}>${escape_html(s.label)}</button>`);
    }
    $$renderer2.push(`<!--]--></nav> <div class="head-right svelte-1uha8ag"><button class="ghost svelte-1uha8ag">About / Design</button> <span class="rev svelte-1uha8ag">Rev 03</span></div></header> <aside class="sidebar svelte-1uha8ag"><div class="sec-head svelte-1uha8ag"><h2 class="svelte-1uha8ag">${escape_html(sectionMeta().label)}</h2> <p class="svelte-1uha8ag">${escape_html(sectionMeta().blurb)}</p></div> <div class="room-list svelte-1uha8ag"><!--[-->`);
    const each_array_1 = ensure_array_like(groups());
    for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
      let g = each_array_1[$$index_2];
      $$renderer2.push(`<div class="grp svelte-1uha8ag"><div class="grp-head svelte-1uha8ag"><span class="dot svelte-1uha8ag"${attr_style("", { background: g.color })}></span>${escape_html(g.name)}</div> <!--[-->`);
      const each_array_2 = ensure_array_like(g.items);
      for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
        let r = each_array_2[$$index_1];
        $$renderer2.push(`<button${attr_class("room-item svelte-1uha8ag", void 0, { "active": selectedId === r.id })}><span class="ri-name svelte-1uha8ag">${escape_html(r.short)}</span> `);
        if (r.tag) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="ri-tag svelte-1uha8ag">${escape_html(r.tag)}</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></aside> <div class="minimap-panel svelte-1uha8ag"><div class="mm-title svelte-1uha8ag">FLOOR PLAN</div> `);
    Minimap($$renderer2, {
      section: activeSection,
      selected: selectedId,
      hovered: hoveredId,
      cam
    });
    $$renderer2.push(`<!----> <div class="mm-foot svelte-1uha8ag">${escape_html(FACTS.totalCarpet)}</div></div> <div class="controls svelte-1uha8ag"><div class="seg svelte-1uha8ag"><button${attr_class("svelte-1uha8ag", void 0, { "on": mode === "orbit" })}>◍ Orbit</button> <button${attr_class("svelte-1uha8ag", void 0, { "on": mode === "walk" })}>⤓ Walk</button></div> <button${attr_class("ctrl svelte-1uha8ag", void 0, { "on": labelsOn })} title="Toggle room labels">🏷 Labels</button> <button${attr_class("ctrl svelte-1uha8ag", void 0, { "on": touring })}>${escape_html("▶ Guided Tour")}</button> <button class="ctrl svelte-1uha8ag">⤺ Reset</button></div> `);
    if (selectedRoom()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="roomcard svelte-1uha8ag"><button class="rc-close svelte-1uha8ag" aria-label="Close">✕</button> <span class="rc-zone svelte-1uha8ag"${attr_style("", { background: selectedRoom().zoneColor })}>${escape_html(selectedRoom().zoneName)}</span> <h3 class="svelte-1uha8ag">${escape_html(selectedRoom().name)}</h3> <div class="rc-meta svelte-1uha8ag">`);
      if (selectedRoom().dims) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span>📐 ${escape_html(selectedRoom().dims)}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (selectedRoom().tag) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span>👥 ${escape_html(selectedRoom().tag)}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (selectedRoom().note) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<p class="svelte-1uha8ag">${escape_html(selectedRoom().note)}</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="hint-tip svelte-1uha8ag">Click any room · drag to orbit · scroll to zoom</div></main>`);
  });
}
export {
  _page as default
};
