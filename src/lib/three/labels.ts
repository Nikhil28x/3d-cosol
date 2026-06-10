import * as THREE from 'three';

/* Canvas-based floating text labels for rooms. Cheap and crisp. */

export function makeLabel(
	text: string,
	opts: { sub?: string; color?: string; scale?: number } = {}
): THREE.Sprite {
	const color = opts.color ?? '#ffffff';
	const scale = opts.scale ?? 1;
	const dpr = 2;
	const padX = 26;
	const fontMain = 38;
	const fontSub = 26;
	const c = document.createElement('canvas');
	const ctx = c.getContext('2d')!;
	ctx.font = `700 ${fontMain}px Inter, system-ui, sans-serif`;
	const w1 = ctx.measureText(text).width;
	let w2 = 0;
	if (opts.sub) {
		ctx.font = `500 ${fontSub}px Inter, system-ui, sans-serif`;
		w2 = ctx.measureText(opts.sub).width;
	}
	const textW = Math.max(w1, w2);
	const W = Math.ceil(textW + padX * 2);
	const H = opts.sub ? 112 : 70;
	c.width = W * dpr;
	c.height = H * dpr;
	ctx.scale(dpr, dpr);

	// pill background
	const r = 14;
	ctx.fillStyle = 'rgba(10,16,21,0.72)';
	roundRect(ctx, 0, 0, W, H, r);
	ctx.fill();
	ctx.strokeStyle = 'rgba(255,255,255,0.16)';
	ctx.lineWidth = 1.5;
	roundRect(ctx, 0.75, 0.75, W - 1.5, H - 1.5, r);
	ctx.stroke();

	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.fillStyle = color;
	ctx.font = `700 ${fontMain}px Inter, system-ui, sans-serif`;
	ctx.fillText(text, W / 2, opts.sub ? 36 : H / 2);
	if (opts.sub) {
		ctx.fillStyle = 'rgba(220,232,240,0.8)';
		ctx.font = `500 ${fontSub}px Inter, system-ui, sans-serif`;
		ctx.fillText(opts.sub, W / 2, 80);
	}

	const tex = new THREE.CanvasTexture(c);
	tex.anisotropy = 4;
	tex.colorSpace = THREE.SRGBColorSpace;
	const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true });
	const sp = new THREE.Sprite(mat);
	const worldH = 0.42 * scale;
	sp.scale.set((W / H) * worldH, worldH, 1);
	sp.renderOrder = 10;
	return sp;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + w, y, x + w, y + h, r);
	ctx.arcTo(x + w, y + h, x, y + h, r);
	ctx.arcTo(x, y + h, x, y, r);
	ctx.arcTo(x, y, x + w, y, r);
	ctx.closePath();
}
