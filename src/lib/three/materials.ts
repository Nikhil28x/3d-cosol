import * as THREE from 'three';

/* Shared material library. Created once and reused across the scene.
   Two families: cool/minimal (Experience Centre) and warm/hospitality
   (Workspace) — straight from the deck's two mood boards. */

const std = (
	color: number,
	opts: Partial<THREE.MeshStandardMaterialParameters> = {}
): THREE.MeshStandardMaterial =>
	new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.0, ...opts });

export const MAT = {
	/* floors */
	floorExp: std(0xe6e9ec, { roughness: 0.35, metalness: 0.05 }), // polished concrete
	floorWork: std(0xc9b79c, { roughness: 0.92 }), // warm wood / carpet
	floorCarpet: std(0x9aa3a8, { roughness: 1.0 }), // work-zone carpet tile
	floorPantry: std(0xb98e63, { roughness: 0.8 }), // herringbone timber
	slab: std(0x222a30, { roughness: 1.0 }),
	plinth: std(0x161d23, { roughness: 1.0 }),

	/* walls */
	wallWhite: std(0xeef1f3, { roughness: 0.95 }),
	wallWarm: std(0xe3d6c3, { roughness: 0.97 }),
	wallAccentRust: std(0xbf6a47, { roughness: 0.9 }),
	wallAccentSage: std(0x8c9c79, { roughness: 0.9 }),
	ceiling: std(0xf2f4f6, { roughness: 1.0 }),

	/* glass partitions / curtain wall */
	glass: new THREE.MeshPhysicalMaterial({
		color: 0xbfe6f2,
		transmission: 0.0,
		transparent: true,
		opacity: 0.18,
		roughness: 0.05,
		metalness: 0,
		reflectivity: 0.3,
		side: THREE.DoubleSide
	}),
	glassFrame: std(0x9aa3aa, { roughness: 0.4, metalness: 0.7 }),

	/* metals / frames */
	alu: std(0xbcc3c8, { roughness: 0.4, metalness: 0.75 }),
	steelDark: std(0x2b3137, { roughness: 0.5, metalness: 0.6 }),
	chrome: std(0xd7dde1, { roughness: 0.2, metalness: 0.9 }),

	/* woods */
	woodLight: std(0xc79a68, { roughness: 0.7 }),
	woodMid: std(0xa67c4e, { roughness: 0.72 }),
	woodWarm: std(0xb07c4a, { roughness: 0.7 }),
	woodDark: std(0x6f4a2c, { roughness: 0.7 }),

	/* upholstery */
	fabricGrey: std(0x8b969d, { roughness: 1.0 }),
	fabricCream: std(0xddd0bd, { roughness: 1.0 }),
	fabricSage: std(0x93a481, { roughness: 1.0 }),
	leatherTan: std(0xb5754a, { roughness: 0.6 }),
	fabricNavy: std(0x2f3b4c, { roughness: 1.0 }),

	/* plastics / whites */
	whitePlastic: std(0xf1f3f5, { roughness: 0.5 }),
	offWhite: std(0xe9ebed, { roughness: 0.8 }),

	/* tech */
	screen: new THREE.MeshStandardMaterial({
		color: 0x0a1016,
		emissive: 0x0a2233,
		emissiveIntensity: 0.6,
		roughness: 0.3
	}),
	screenBrand: new THREE.MeshStandardMaterial({
		color: 0x081019,
		emissive: 0x00aeef,
		emissiveIntensity: 0.35,
		roughness: 0.3
	}),
	consoleTop: std(0x161b20, { roughness: 0.5 }),
	consoleBody: std(0x21282e, { roughness: 0.6, metalness: 0.2 }),
	ledGreen: new THREE.MeshStandardMaterial({ color: 0x39d98a, emissive: 0x39d98a, emissiveIntensity: 0.8 }),

	/* brand */
	brand: new THREE.MeshStandardMaterial({
		color: 0x00aeef,
		roughness: 0.5,
		emissive: 0x004a66,
		emissiveIntensity: 0.2
	}),

	/* greenery */
	planter: std(0x33424a, { roughness: 0.9 }),
	foliage: std(0x4d7a44, { roughness: 1.0 }),
	foliageLight: std(0x6f9a5e, { roughness: 1.0 }),

	/* misc */
	rug: std(0xcbbfa9, { roughness: 1.0 }),
	dark: std(0x12181d, { roughness: 0.8 })
};

export type MatLib = typeof MAT;
