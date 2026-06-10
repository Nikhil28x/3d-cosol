# CoSol Experience Centre — 3D Walkthrough

An interactive **Three.js** reconstruction of the *Connectivity Solutions Experience Centre, Bangalore*
floor plan (Purva Zentech · Concept Design Rev 03). The whole 1,436 m² floor — arrival, experience
centre, open workspace and pantry mezzanine — is rebuilt to scale so you can experience the layout,
walk through it, and inspect every room.

Built on the same stack as the [`cosol-lab`](https://github.com/Nikhil28x/cosol-lab) reference:
**SvelteKit + TypeScript + Vite**, with **Three.js** driving the walkthrough.

## Run it

```bash
pnpm install
pnpm dev        # http://localhost:5180
pnpm build      # production build
pnpm check      # type-check (0 errors)
```

## What you can do

- **Tabs** — `Overview · Experience Centre · Workspace · Mezzanine` reframe the camera onto each
  chapter of the building and filter the room directory, exactly like the deck's chapters.
- **Orbit (dollhouse)** — drag to orbit, scroll to zoom, click any room to fly to it.
- **Walk mode** — first-person pointer-lock walkthrough: `W A S D` to move, `Shift` to sprint,
  mouse to look, `Esc` to exit.
- **Guided Tour** — auto-flies through the 13 headline spaces.
- **Room directory + minimap** — click a room in the sidebar or on the live floor-plan minimap
  (with camera marker) to navigate; an info card shows real dimensions and the design intent.
- **About / Design** — area schedule, zoning legend and the design narrative.

## How the floor plan is modelled

Everything is data-driven from one source of truth:

| File | Role |
|------|------|
| `src/lib/data/planData.ts` | Every room — position, size (metres), zone, furniture kind, real dimensions from the deck. Footprint, workstation field, stair, mezzanine, guided-tour order, area facts. |
| `src/lib/data/sections.ts` | Tab → room grouping and zone metadata for the UI. |
| `src/lib/three/materials.ts` | Two material families — cool/minimal (Experience Centre) and warm/hospitality (Workspace) — matching the deck's mood boards. |
| `src/lib/three/furniture.ts` | Parametric furniture factory (reception desk, demo consoles, command floor, conference, pantry, cabins, phone booths, pods…) + an instanced 60-desk open-plan field. |
| `src/lib/three/buildFloor.ts` | Assembles the shell, glazing, zoned floors, partitions (glass / solid / half) with doorways, labels, mezzanine deck, stair and city context. |
| `src/lib/three/SceneManager.ts` | Renderer, lighting + shadows, orbit & pointer-lock controls, easing camera fly-to, room picking. |

### Spaces reconstructed (from the deck)

**Experience Centre** — Reception & Brand Gallery, Customer Experience / Demo Lounge, Podcast / AV
Room, Digital Lab, Conference Room, Server Room, Digital Operation Centre, Security Operations,
IT Team, Technical Assistance Centre.

**Workspace** — Reception Lounge, 60 open workstations, Collab / work lounges, phone booths
(1 & 2-seat), meeting rooms (4/6/8-seat), manager & executive cabins, nap rooms, printer bay,
UPS / battery / server utilities.

**Mezzanine** — Pantry / Café (45 covers), meeting pods, store room, reached by the reception stair.

> Geometry is reconstructed from a concept presentation (not a dimensioned CAD set): stated room
> dimensions and the zoning diagram are honoured; minor wall positions are interpreted to produce a
> coherent, walkable plan.
