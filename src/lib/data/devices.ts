/* ============================================================
   CoSol AI Innovation Lab — Device Stack
   20 device families · 154 endpoints · ₹19.8 Cr device BOM
   (51.5% of the ₹38.4 Cr fit-out)
   Source: "Device Stack & Office Design Reference"
   ============================================================ */

export type DeviceIconId =
	| 'dgx'
	| 'omniverse'
	| 'greenlake'
	| 'watsonx'
	| 'network'
	| 'outposts'
	| 'lookingglass'
	| 'videowall'
	| 'arheadset'
	| 'vrheadset'
	| 'touchboard'
	| 'holomind'
	| 'webex'
	| 'atmos'
	| 'voiceai'
	| 'console'
	| 'totem'
	| 'spot'
	| 'cobot'
	| 'surveillance'
	| 'power';

export interface Device {
	id: string;
	name: string;
	vendor: string;
	/** short unit / quantity tag, e.g. "2 racks", "40 APs" */
	count: string;
	icon: DeviceIconId;
	whatItIs: string;
	role: string;
	where: string;
	/** accent colour for the card glow — defaults to brand cyan */
	accent?: string;
}

export interface DeviceCategory {
	id: string;
	label: string;
	blurb: string;
	devices: Device[];
}

export const DEVICE_STATS = {
	families: '20',
	endpoints: '154',
	bom: '₹19.8 Cr',
	bomShare: '51.5%',
	fitout: '₹38.4 Cr'
};

export const DEVICE_CATEGORIES: DeviceCategory[] = [
	{
		id: 'compute',
		label: 'Compute, AI Training & Edge',
		blurb: 'The on-premise horsepower — training clusters, edge nodes and the network fabric that ties every device together.',
		devices: [
			{
				id: 'dgx',
				name: 'NVIDIA DGX H100 SuperPOD',
				vendor: 'NVIDIA',
				count: '2 racks · 16× H100',
				icon: 'dgx',
				accent: '#76b900',
				whatItIs:
					'Production-class AI training & inference cluster — 8× H100 SXM5 per node, NVLink + InfiniBand 400G fabric, BlueField-3 DPU.',
				role: 'The hero compute backbone. Powers live demos of LLM fine-tuning, computer vision and digital-twin simulation — letting teams prototype and run AI workloads on-premise.',
				where: 'AI Lab (signature space) · visible behind the Holomind table'
			},
			{
				id: 'omniverse',
				name: 'NVIDIA Omniverse Workstation',
				vendor: 'NVIDIA · RTX 6000 Ada',
				count: '4 stations',
				icon: 'omniverse',
				accent: '#76b900',
				whatItIs:
					'Triple 49" 5K monitors + RTX 6000 Ada (48GB) towers for real-time digital twins, USD asset authoring and Omniverse Cloud collaboration.',
				role: 'Designer / engineer workstations for 3D and physical-AI simulation work; anchor desks for collaborative visualization sessions.',
				where: 'AI Lab perimeter · 4 stations'
			},
			{
				id: 'greenlake',
				name: 'HPE GreenLake EL8000',
				vendor: 'HPE',
				count: '3 racks',
				icon: 'greenlake',
				accent: '#01a982',
				whatItIs:
					'ProLiant DL380 Gen11 compute + Alletra dHCI all-flash storage + Edgeline ruggedised edge compute; consumption-based via GreenLake.',
				role: 'On-prem edge compute for AI inference at the network edge; supports hybrid / consumption IT operations behind the office.',
				where: 'Server Room (SE) · 3 racks'
			},
			{
				id: 'watsonx',
				name: 'IBM watsonx Visitor AI Kiosk',
				vendor: 'IBM · Granite 13B',
				count: '1 kiosk',
				icon: 'watsonx',
				accent: '#4589ff',
				whatItIs:
					'Standing visitor kiosk, tap-to-speak in 12 Indian languages, retrieval-augmented AI over the company case-study corpus.',
				role: 'Reception greeter and lead-router — handles visitor wayfinding / Q&A and pushes leads into CRM, reducing front-desk load.',
				where: 'Reception · routes leads to CRM'
			},
			{
				id: 'network',
				name: 'Cisco Catalyst 9300 + Meraki MR57',
				vendor: 'Cisco · Wi-Fi 7',
				count: '40 APs',
				icon: 'network',
				accent: '#00bceb',
				whatItIs:
					'Core switching stack + Wi-Fi 7 (802.11be) access across all zones; full SD-Access fabric with macro / micro-segmentation.',
				role: 'The connectivity foundation of the office — secure, segmented, high-throughput network for every device, desk and meeting room.',
				where: 'Server Room (core), IT Room, every zone'
			},
			{
				id: 'outposts',
				name: 'AWS Outposts 42U',
				vendor: 'AWS · Mumbai region',
				count: '1 rack',
				icon: 'outposts',
				accent: '#ff9900',
				whatItIs:
					'Fully managed on-prem AWS rack — same APIs / console — extending the Mumbai region into the lab; SageMaker runs locally.',
				role: 'Enables sub-5ms inference and data-residency-compliant hybrid cloud workloads from inside the office.',
				where: 'Server Room (SE) · AWS-managed remotely'
			}
		]
	},
	{
		id: 'viz',
		label: 'Visualization, Holographics & XR',
		blurb: 'The “wow” surfaces — holographic, immersive and touch-driven displays that turn data and digital twins into something you can walk around.',
		devices: [
			{
				id: 'lookingglass',
				name: 'Looking Glass 65" Holographic',
				vendor: 'Looking Glass',
				count: '1 display',
				icon: 'lookingglass',
				accent: '#b07cff',
				whatItIs: 'Glasses-free holographic display rendering 3D content with 100 simultaneous views (8K).',
				role: 'The “wow” visualization moment — shows network topology, customer-site digital twins and walkthrough overlays to visitors without headsets.',
				where: 'Demo Lounge centre'
			},
			{
				id: 'videowall',
				name: 'LG OLED 12m × 2.4m NOC Video Wall',
				vendor: 'LG · Cisco',
				count: '4×2 grid',
				icon: 'videowall',
				accent: '#a50034',
				whatItIs: 'Bezel-thin OLED panels in a 4×2 grid (5760×3240), Cisco Spaces content management.',
				role: 'Operations command surface — live dashboards for network health and on-demand demos; the signature visual of the ops floor.',
				where: 'NOC primary wall'
			},
			{
				id: 'arheadset',
				name: 'HoloLens 2 + Magic Leap 2',
				vendor: 'Microsoft · Magic Leap',
				count: '8 headsets',
				icon: 'arheadset',
				accent: '#5bd1ff',
				whatItIs:
					'Enterprise AR fleet — HoloLens 2 for digital-twin walkthroughs, Magic Leap 2 for high-FOV industrial design, linked to Omniverse.',
				role: 'Immersive collaboration and design-review tools for hands-on product / infrastructure exploration in meetings.',
				where: 'Demo Lounge (4) · Innovation Pods (4)'
			},
			{
				id: 'vrheadset',
				name: 'Meta Quest 3 + Apple Vision Pro',
				vendor: 'Meta · Apple',
				count: '6 headsets',
				icon: 'vrheadset',
				accent: '#f5f5f7',
				whatItIs:
					'VR / spatial-computing fleet for site walkthroughs (Quest 3, WebXR) and executive briefings (Vision Pro, eye + hand input).',
				role: 'Spatial briefing tools — let clients / execs “walk” remote sites and review designs immersively.',
				where: 'Demo Lounge VR pod · Innovation Pods · NOC gallery'
			},
			{
				id: 'touchboard',
				name: 'Samsung Flip Pro 85" + Surface Hub 3',
				vendor: 'Samsung · Microsoft',
				count: '8 boards',
				icon: 'touchboard',
				accent: '#1428a0',
				whatItIs: '4K multi-touch collaboration boards (40-pt + pen) integrated with Teams and Webex.',
				role: 'Interactive whiteboards for training, conference and huddle collaboration — real-time co-editing across rooms.',
				where: 'Training (2) · Conference (2) · Pods (4) · Huddle (4)'
			},
			{
				id: 'holomind',
				name: 'PI Holomind Table System',
				vendor: 'PI Spaces · 300L/180L/65L',
				count: '5 tables',
				icon: 'holomind',
				accent: '#00d2c7',
				whatItIs:
					'Interactive multi-user touch tables — 300L (3m×1.5m, 8K) hero table, 180L round-table demos, 65L one-on-one.',
				role: 'Centrepiece interactive surface for customer-map browsing and product configuration in shared sessions.',
				where: 'AI Lab (300L) · Demo Lounge (3×180L) · Reception (65L)'
			}
		]
	},
	{
		id: 'collab',
		label: 'Collaboration, Voice AI & Audio',
		blurb: 'How people meet, present and are greeted — hybrid-meeting endpoints, spatial audio, voice greeters and the staffed NOC consoles.',
		devices: [
			{
				id: 'webex',
				name: 'Cisco Webex Board Pro G2 75"',
				vendor: 'Cisco Webex · AI Codec Pro',
				count: '14 endpoints',
				icon: 'webex',
				accent: '#00bceb',
				whatItIs:
					'Collaboration boards with AI Codec Pro: speaker-tracking, presenter framing, noise removal, live captions in 14 Indian languages.',
				role: 'Standard hybrid-meeting endpoint across all meeting / huddle rooms — equalises in-room and remote participants.',
				where: 'Conf · Meeting ×4 · Huddle ×4 · Pods ×4 · Training'
			},
			{
				id: 'atmos',
				name: 'Dolby Atmos Spatial Audio',
				vendor: 'Dolby',
				count: '2 zones',
				icon: 'atmos',
				accent: '#e6007e',
				whatItIs: '7.1.4 immersive Atmos audio with active noise cancellation, India-certified calibration.',
				role: 'Cinematic demo playback and acoustic privacy in flagship presentation spaces.',
				where: 'Demo Lounge · Conference (SW)'
			},
			{
				id: 'voiceai',
				name: 'Voice AI Greeters',
				vendor: 'GPT-4o · Gemini 2.5 · ElevenLabs',
				count: '3 greeters',
				icon: 'voiceai',
				accent: '#10a37f',
				whatItIs:
					'Always-on multilingual voice greeters (12 IN languages + EN), 320ms speech-to-speech, ElevenLabs signature voice.',
				role: 'Hands-free reception, wayfinding and host-notification — automates the visitor welcome experience.',
				where: 'Reception · Demo Lounge · Wellness'
			},
			{
				id: 'console',
				name: 'PI Pro Edge Console',
				vendor: 'PI Spaces · Elo',
				count: '16 consoles',
				icon: 'console',
				accent: '#00d2c7',
				whatItIs:
					'Triple Elo 27" 4K monitors, ergonomic desk, RGB status accent, Cisco UCS X workstation, biometric reader.',
				role: 'Operator workstations for the 24×7 NOC — the staffed nerve-centre desks of the operations floor.',
				where: 'NOC · 16 consoles (4×4 grid)'
			},
			{
				id: 'totem',
				name: 'iStandee Transparent Totem',
				vendor: 'PI Spaces · LG T-OLED',
				count: '6 totems',
				icon: 'totem',
				accent: '#5bd1ff',
				whatItIs:
					'Transparent 55" OLED totems for wayfinding, DPDP-compliant face-anonymised visitor recognition, NFC schedule push.',
				role: 'Self-service navigation and brand-led digital signage throughout high-traffic zones.',
				where: 'Reception · Demo Lounge (3) · Wellness (2)'
			}
		]
	},
	{
		id: 'robotics',
		label: 'Robotics & Physical AI',
		blurb: 'Physical AI you can watch move — an autonomous tour guide and a live human-robot collaboration cell.',
		devices: [
			{
				id: 'spot',
				name: 'Boston Dynamics Spot Quadruped',
				vendor: 'Boston Dynamics',
				count: '1 robot',
				icon: 'spot',
				accent: '#ffd400',
				whatItIs: 'Spot (with arm + CORE AI), LIDAR-mapped 17-zone navigation, 14kg payload, auto-docking.',
				role: 'Autonomous tour guide and night inspector — demonstrates physical AI and runs automated facility logging / inspections.',
				where: 'Roams all 17 zones · dock near Reception'
			},
			{
				id: 'cobot',
				name: 'Universal Robots UR10e Cobot Cell',
				vendor: 'Universal Robots',
				count: '1 cell',
				icon: 'cobot',
				accent: '#00b3e3',
				whatItIs:
					'UR10e (10kg payload, 1300mm reach) + OnRobot gripper, AI-vision pick-and-place on NVIDIA Isaac, safety-rated.',
				role: 'Live manufacturing / automation demo cell for customer briefings on human-robot collaboration.',
				where: 'Innovation Pods · safety-fenced demo cell'
			}
		]
	},
	{
		id: 'infra',
		label: 'Security, Access & Infrastructure',
		blurb: 'The systems that keep the workspace safe and always-on — AI surveillance with privacy zoning, and N+1 power & cooling.',
		devices: [
			{
				id: 'surveillance',
				name: 'Hikvision AcuSense AI + Lenel S2 BLUE',
				vendor: 'Hikvision · Lenel S2',
				count: '120 cams · 36 readers',
				icon: 'surveillance',
				accent: '#e2333a',
				whatItIs:
					'4K AI cameras (person / vehicle classification) + Lenel S2 access controllers and biometric / mobile readers; DPDP-zoned (skips Wellness & booths).',
				role: 'Surveillance and access control — secures the workspace while respecting privacy zoning for compliance.',
				where: '120 cameras + 36 readers (15 / 17 zones)'
			},
			{
				id: 'power',
				name: 'APC Symmetra UPS + InRow + DCIM',
				vendor: 'APC · Schneider EcoStruxure',
				count: 'N+1 · 200 kVA',
				icon: 'power',
				accent: '#3dcd58',
				whatItIs:
					'200 kVA N+1 modular UPS + 40kW close-coupled cooling + DCIM, with 250 kVA Cummins genset for 8-hr backup.',
				role: 'Power continuity and environmental monitoring — keeps the office and data infrastructure running without interruption.',
				where: 'Server Room (SE) · IT Room · external genset'
			}
		]
	}
];
