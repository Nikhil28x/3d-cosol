<script lang="ts">
	import { base } from '$app/paths';
	import DeviceIcon from '$lib/components/DeviceIcon.svelte';
	import { DEVICE_CATEGORIES, DEVICE_STATS } from '$lib/data/devices';

	let query = $state('');
	let activeCat = $state<'all' | string>('all');

	const q = $derived(query.trim().toLowerCase());

	// Filter by category chip + free-text search across name/vendor/role/where.
	const sections = $derived(
		DEVICE_CATEGORIES.map((cat) => ({
			...cat,
			devices: cat.devices.filter((d) => {
				if (activeCat !== 'all' && cat.id !== activeCat) return false;
				if (!q) return true;
				return (
					d.name.toLowerCase().includes(q) ||
					d.vendor.toLowerCase().includes(q) ||
					d.role.toLowerCase().includes(q) ||
					d.whatItIs.toLowerCase().includes(q) ||
					d.where.toLowerCase().includes(q)
				);
			})
		})).filter((c) => c.devices.length > 0)
	);

	const shown = $derived(sections.reduce((n, c) => n + c.devices.length, 0));
</script>

<svelte:head>
	<title>Device Stack · CoSol AI Innovation Lab</title>
</svelte:head>

<main>
	<!-- ============ HEADER ============ -->
	<header>
		<a class="brand" href="{base}/explore">
			<div class="logo">CS</div>
			<div class="brand-txt">
				<strong>CoSol AI Innovation Lab</strong>
				<span>Device Stack &amp; Office Design Reference</span>
			</div>
		</a>
		<nav class="topnav">
			<a href="{base}/">Walkthrough</a>
			<a href="{base}/explore">Floor plan</a>
			<a class="on" href="{base}/devices" aria-current="page">Devices</a>
		</nav>
	</header>

	<div class="scroll">
		<!-- ============ HERO ============ -->
		<section class="hero">
			<span class="kicker">Section 1 · Device Stack &amp; Workspace Roles</span>
			<h1>The technology that makes the<br /><em>experience</em> tangible</h1>
			<p class="lede">
				Twenty device families wired across the floor — every screen, sensor, robot and rack, with
				what it is and the role it plays in the workspace.
			</p>
			<div class="stats">
				<div><b>{DEVICE_STATS.families}</b><span>Device families</span></div>
				<div><b>{DEVICE_STATS.endpoints}</b><span>Endpoints</span></div>
				<div><b>{DEVICE_STATS.bom}</b><span>Device BOM</span></div>
				<div><b>{DEVICE_STATS.bomShare}</b><span>of {DEVICE_STATS.fitout} fit-out</span></div>
			</div>
		</section>

		<!-- ============ FILTER BAR ============ -->
		<div class="filterbar">
			<div class="chips">
				<button class:on={activeCat === 'all'} onclick={() => (activeCat = 'all')}>All</button>
				{#each DEVICE_CATEGORIES as cat (cat.id)}
					<button class:on={activeCat === cat.id} onclick={() => (activeCat = cat.id)}>
						{cat.label.split(',')[0].split(' & ')[0]}
					</button>
				{/each}
			</div>
			<div class="search">
				<span aria-hidden="true">⌕</span>
				<input type="text" placeholder="Search device, vendor, room…" bind:value={query} />
				{#if query}
					<button class="clear" onclick={() => (query = '')} aria-label="Clear search">✕</button>
				{/if}
			</div>
		</div>

		<!-- ============ CATEGORIES ============ -->
		{#if sections.length === 0}
			<p class="empty">No devices match “{query}”.</p>
		{/if}

		{#each sections as cat (cat.id)}
			<section class="cat">
				<div class="cat-head">
					<h2>{cat.label}</h2>
					<span class="cat-count">{cat.devices.length}</span>
				</div>
				<p class="cat-blurb">{cat.blurb}</p>

				<div class="grid">
					{#each cat.devices as d (d.id)}
						<article class="card" style="--acc:{d.accent ?? 'var(--cs-cyan)'}">
							<DeviceIcon icon={d.icon} accent={d.accent ?? 'var(--cs-cyan)'} />
							<div class="body">
								<div class="card-top">
									<span class="vendor">{d.vendor}</span>
									<span class="count">{d.count}</span>
								</div>
								<h3>{d.name}</h3>
								<p class="what">{d.whatItIs}</p>
								<div class="role">
									<span class="role-label">Workspace role</span>
									<p>{d.role}</p>
								</div>
								<div class="where"><span aria-hidden="true">📍</span>{d.where}</div>
							</div>
						</article>
					{/each}
				</div>
			</section>
		{/each}

		<footer class="foot">
			<span>COSOL AI Innovation Lab · Device Stack &amp; Office Design Reference</span>
			<div class="foot-links">
				<a href="{base}/explore">▦ Floor plan</a>
				<a href="{base}/">▶ Walkthrough</a>
			</div>
		</footer>
	</div>
</main>

<style>
	main {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		font-family: var(--font);
		background:
			radial-gradient(1200px 600px at 80% -10%, rgba(0, 174, 239, 0.12), transparent 60%),
			radial-gradient(900px 500px at -10% 10%, rgba(176, 124, 255, 0.08), transparent 55%),
			var(--bg);
	}

	/* ---------------- header ---------------- */
	header {
		flex: none;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 clamp(14px, 3vw, 34px);
		border-bottom: 1px solid var(--border);
		background: rgba(8, 14, 19, 0.72);
		backdrop-filter: blur(14px);
		z-index: 20;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 11px;
		text-decoration: none;
		color: var(--text);
	}
	.logo {
		width: 38px;
		height: 38px;
		border-radius: 9px;
		background: var(--cs-cyan);
		color: #00141b;
		font-weight: 800;
		display: grid;
		place-items: center;
		font-size: 16px;
		letter-spacing: -0.5px;
		box-shadow: 0 6px 18px -4px rgba(0, 174, 239, 0.6);
	}
	.brand-txt {
		display: flex;
		flex-direction: column;
		line-height: 1.18;
	}
	.brand-txt strong {
		font-size: 14px;
		font-weight: 700;
	}
	.brand-txt span {
		font-size: 11.5px;
		color: var(--text-dim);
	}
	.topnav {
		display: flex;
		gap: 4px;
		background: rgba(20, 30, 38, 0.7);
		padding: 5px;
		border-radius: 11px;
		border: 1px solid var(--border);
	}
	.topnav a {
		padding: 8px 15px;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		color: var(--text-dim);
		text-decoration: none;
		transition: all 0.16s;
		white-space: nowrap;
	}
	.topnav a:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.06);
	}
	.topnav a.on {
		background: var(--cs-cyan);
		color: #00141b;
	}

	/* ---------------- scroll body ---------------- */
	.scroll {
		flex: 1;
		overflow-y: auto;
		padding: 0 clamp(14px, 3vw, 34px) 40px;
	}

	/* ---------------- hero ---------------- */
	.hero {
		max-width: 1180px;
		margin: 0 auto;
		padding: clamp(34px, 6vw, 64px) 0 26px;
		text-align: center;
	}
	.kicker {
		display: inline-block;
		font-size: 12px;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--cs-cyan);
		margin-bottom: 16px;
	}
	.hero h1 {
		font-size: clamp(30px, 5.4vw, 58px);
		line-height: 1.04;
		font-weight: 800;
		letter-spacing: -0.02em;
		margin: 0 auto 16px;
		max-width: 16ch;
	}
	.hero h1 em {
		font-style: normal;
		color: var(--cs-cyan);
	}
	.lede {
		max-width: 60ch;
		margin: 0 auto 30px;
		font-size: clamp(14px, 1.7vw, 18px);
		line-height: 1.55;
		color: var(--text-dim);
	}
	.stats {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 12px;
	}
	.stats div {
		min-width: 130px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 14px 20px;
	}
	.stats b {
		display: block;
		font-size: clamp(20px, 2.6vw, 28px);
		font-weight: 800;
		color: var(--cs-cyan);
		letter-spacing: -0.01em;
	}
	.stats span {
		font-size: 11.5px;
		color: var(--text-dim);
	}

	/* ---------------- filter bar ---------------- */
	.filterbar {
		position: sticky;
		top: 0;
		z-index: 12;
		max-width: 1180px;
		margin: 0 auto 8px;
		padding: 12px 0;
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		align-items: center;
		justify-content: space-between;
		background: linear-gradient(to bottom, var(--bg) 60%, transparent);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
	}
	.chips button {
		padding: 8px 14px;
		border-radius: 999px;
		font-size: 12.5px;
		font-weight: 600;
		color: var(--text-dim);
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--border);
		transition: 0.15s;
	}
	.chips button:hover {
		color: var(--text);
		border-color: var(--border-strong);
	}
	.chips button.on {
		background: var(--cs-cyan);
		border-color: var(--cs-cyan);
		color: #00141b;
	}
	.search {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 12px;
		height: 38px;
		min-width: 240px;
		flex: 1;
		max-width: 320px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--border);
		border-radius: 10px;
		color: var(--text-dim);
		transition: 0.15s;
	}
	.search:focus-within {
		border-color: var(--cs-cyan);
		color: var(--text);
	}
	.search input {
		flex: 1;
		min-width: 0;
		background: none;
		border: none;
		outline: none;
		color: var(--text);
		font-family: inherit;
		font-size: 13px;
	}
	.search input::placeholder {
		color: var(--text-dim);
	}
	.clear {
		color: var(--text-dim);
		font-size: 12px;
		padding: 2px 4px;
	}
	.clear:hover {
		color: var(--text);
	}

	/* ---------------- category ---------------- */
	.cat {
		max-width: 1180px;
		margin: 0 auto;
		padding-top: 26px;
	}
	.cat-head {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.cat-head h2 {
		font-size: clamp(18px, 2.4vw, 24px);
		font-weight: 700;
	}
	.cat-count {
		font-size: 12px;
		font-weight: 700;
		color: var(--cs-cyan);
		background: rgba(0, 174, 239, 0.12);
		border: 1px solid rgba(0, 174, 239, 0.3);
		border-radius: 999px;
		padding: 2px 10px;
	}
	.cat-blurb {
		margin: 8px 0 18px;
		max-width: 80ch;
		font-size: 13.5px;
		line-height: 1.5;
		color: var(--text-dim);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
		gap: 16px;
	}

	/* ---------------- card ---------------- */
	.card {
		display: flex;
		flex-direction: column;
		background: var(--bg-panel-solid);
		border: 1px solid var(--border);
		border-radius: 16px;
		overflow: hidden;
		transition:
			transform 0.18s ease,
			border-color 0.18s ease,
			box-shadow 0.18s ease;
	}
	.card:hover {
		transform: translateY(-4px);
		border-color: color-mix(in srgb, var(--acc) 60%, var(--border-strong));
		box-shadow:
			0 22px 48px -20px rgba(0, 0, 0, 0.8),
			0 0 0 1px color-mix(in srgb, var(--acc) 22%, transparent);
	}
	.body {
		padding: 16px 17px 18px;
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	.card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		margin-bottom: 8px;
	}
	.vendor {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--acc);
	}
	.count {
		font-size: 10.5px;
		font-weight: 600;
		color: var(--text-dim);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 3px 8px;
		white-space: nowrap;
	}
	.card h3 {
		font-size: 16.5px;
		line-height: 1.2;
		font-weight: 700;
		margin-bottom: 9px;
	}
	.what {
		font-size: 12.5px;
		line-height: 1.5;
		color: var(--text-dim);
		margin: 0 0 13px;
	}
	.role {
		border-left: 2px solid color-mix(in srgb, var(--acc) 70%, transparent);
		padding-left: 11px;
		margin-bottom: 14px;
	}
	.role-label {
		display: block;
		font-size: 9.5px;
		font-weight: 700;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: var(--text-dim);
		margin-bottom: 4px;
	}
	.role p {
		margin: 0;
		font-size: 12.5px;
		line-height: 1.5;
		color: var(--text);
	}
	.where {
		margin-top: auto;
		display: flex;
		align-items: flex-start;
		gap: 7px;
		font-size: 11.5px;
		line-height: 1.4;
		color: var(--text-dim);
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}

	/* ---------------- footer / empty ---------------- */
	.empty {
		text-align: center;
		color: var(--text-dim);
		padding: 60px 0;
	}
	.foot {
		max-width: 1180px;
		margin: 48px auto 0;
		padding-top: 22px;
		border-top: 1px solid var(--border);
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
		align-items: center;
		justify-content: space-between;
		font-size: 11.5px;
		color: var(--text-dim);
	}
	.foot-links {
		display: flex;
		gap: 16px;
	}
	.foot-links a {
		color: var(--text-dim);
		text-decoration: none;
		transition: 0.15s;
	}
	.foot-links a:hover {
		color: var(--cs-cyan);
	}

	@media (max-width: 560px) {
		.brand-txt span {
			display: none;
		}
		.topnav a {
			padding: 8px 11px;
		}
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
