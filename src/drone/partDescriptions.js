/**
 * Comprehensive educational descriptions for each drone part.
 * Used by the info panel to teach users about drone components.
 */

export const partDescriptions = {
  frame: {
    name: 'Main Frame (Chassis)',
    icon: '🏗️',
    category: 'Structural',
    overview: `The frame is the skeleton of the drone — every other component mounts to it. A typical quadcopter frame uses an "X" configuration with a central hub and four arms radiating outward.\n\nThe frame must balance strength with weight: too heavy and the drone can't fly efficiently, too weak and it'll crack on a hard landing. The center section houses the electronics stack (FC, ESC, VTX) between top and bottom plates, while the arms extend outward to hold the motors at the optimal distance apart.`,

    specifications: [
      { label: 'Material', value: 'Carbon Fiber Composite (3K weave)' },
      { label: 'Configuration', value: 'True-X Quad (symmetrical arms)' },
      { label: 'Wheelbase', value: '250mm (motor-to-motor diagonal)' },
      { label: 'Weight', value: '~85g (frame only)' },
      { label: 'Arm Thickness', value: '4mm carbon fiber' },
      { label: 'Center Stack', value: '30.5×30.5mm mounting pattern' },
      { label: 'Bottom Plate', value: '2mm carbon fiber' },
    ],

    whyChosen: `Carbon fiber X-frames are the industry standard for racing and freestyle drones. The X-configuration provides equal thrust distribution and symmetrical flight characteristics in all directions.\n\nCarbon fiber gives the best strength-to-weight ratio of any affordable material — it's 5× stronger than steel at a fraction of the weight. The 250mm wheelbase is optimized for 5-inch propellers, the most popular size class.`,

    useCase: `This 250mm frame is designed for a 5-inch propeller quad — the most popular class for FPV flying. It's used for:\n• FPV racing at speeds up to 150+ km/h\n• Freestyle acrobatics (rolls, flips, power loops)\n• Cinematic filming with mounted action cameras\n• General hobby flying and learning\n\nThe compact size makes it agile while still having enough space for all components.`,

    alternatives: [
      { name: 'H-Frame', desc: 'Better for heavy camera rigs; less agile but more stable and easier to build' },
      { name: 'Dead Cat Frame', desc: 'Front arms angled wider to keep props out of camera FOV' },
      { name: 'Unibody Frame', desc: 'Single-piece carbon design — lighter but cannot replace individual arms' },
      { name: 'Cinewhoop Frame', desc: 'Ducted propeller guards for safe indoor/proximity flying' },
      { name: '3D Printed (TPU/PETG)', desc: 'Cheap and customizable, but 3-4× heavier and much weaker' },
    ],

    failureModes: [
      'Arm snaps on hard crash impact — the most common frame failure',
      'Standoff screws strip their threading from vibration over time',
      'Carbon fiber de-laminates (layers separate) from repeated stress cycles',
      'Motor mounting holes elongate or crack from repeated crash forces',
      'Center plate cracks from hard bottom-out landings on concrete',
    ],

    limitations: [
      'Carbon fiber is electrically conductive — can short-circuit exposed wires or antenna connections',
      'Cannot be bent back into shape once cracked; damaged sections must be fully replaced',
      'Vibrations transfer through the rigid structure directly to the camera mount',
      'Fixed arm length permanently limits maximum propeller size',
      'Not waterproof — electronics require separate conformal coating for moisture protection',
      'Carbon fiber blocks RF signals — antenna placement is critical',
    ],

    positives: [
      'Extremely high strength-to-weight ratio (stronger than steel, lighter than aluminum)',
      'Rigid structure provides precise, responsive flight characteristics',
      'Standardized mounting patterns (20×20mm M2, 30.5×30.5mm M3) fit most electronics',
      'Individual arms can be replaced without replacing the entire frame ($3-5 per arm)',
      'Carbon fiber naturally dampens some mid-frequency vibrations',
      'Scratch-resistant surface maintains professional appearance',
      'Excellent thermal conductivity helps dissipate heat from electronics',
    ],

    assemblyTips: `The frame is assembled first — it's the foundation everything mounts to.\n\n1. Start with the bottom plate and press-fit the 4 arms\n2. Install M3 standoffs for the electronics stack\n3. Mount the top plate last, sandwiching the arms\n4. Use medium-strength threadlocker (Loctite Blue 242) on all frame screws\n5. Check arm alignment by spinning each arm mount hole — no play should exist\n6. Route the battery strap through the bottom plate slots before final assembly`,

    powerStates: {
      min: {
        label: 'Static / Ground Idle',
        description: 'The frame sits motionless. Motors are disarmed or at minimum power. Only static gravity loads act on the structure — standoffs, arm joints, and mounting holes experience near-zero dynamic stress. The carbon fiber is in its most relaxed state.',
        metrics: [
          { label: 'Structural Load', value: 'Static (gravity only, ~0.8 kg system weight)' },
          { label: 'Vibration Level', value: 'None' },
          { label: 'Arm Flex', value: '< 0.1 mm' },
          { label: 'Frame Temperature', value: 'Ambient (no heat input)' },
          { label: 'Motor Torque on Arms', value: '~0 Nm' },
        ],
      },
      mid: {
        label: 'Normal Flight / Hover (~50% throttle)',
        description: 'The drone hovers or cruises steadily. Motors at ~21,000 RPM transmit moderate vibration through the arms. The carbon fiber flexes slightly at arm tips but well within its elastic limit. This is the designed operational envelope.',
        metrics: [
          { label: 'Total System Thrust', value: '~1.2–1.6 kg (balancing weight + climb margin)' },
          { label: 'Arm Tip Deflection', value: '~0.3–0.8 mm at cruise thrust' },
          { label: 'Vibration Frequency', value: '~350 Hz conducted from motors' },
          { label: 'Frame Temperature', value: '35–50°C (conducted from motor mounts)' },
          { label: 'Motor Torque on Arms', value: '~1.0–1.5 Nm per arm' },
        ],
      },
      max: {
        label: 'Full Throttle / Maximum Stress (100%)',
        description: 'All 4 motors at peak RPM (~42,000). Each arm bears up to 1.5 kg outward pull. The center plates experience maximum torsion from rotor torque imbalance. Impact crashes at this power level produce the highest frame failure risk. G-forces during aggressive maneuvers can reach 10–15G.',
        metrics: [
          { label: 'Total Thrust Generated', value: '~6 kg (4 × 1,500 g)' },
          { label: 'Arm Bending Moment', value: 'Near design limit (~3–4 Nm per arm)' },
          { label: 'Vibration Frequency', value: '~700 Hz at max RPM' },
          { label: 'Peak G-Force (maneuvers)', value: 'Up to 10–15G' },
          { label: 'Frame Temperature', value: '60–80°C near motor mounts' },
          { label: 'Motor Torque on Arms', value: '~2.5–3.5 Nm per arm' },
        ],
      },
    },

    glbModel: {
      suggestedFilename: 'drone_frame.glb',
      description: 'A high-detail quadcopter X-frame featuring an octagonal center stack (top + bottom carbon fiber plates with visible 3K weave pattern), four tapered arms extending to motor mount platforms, four rubber-tipped landing legs, M3 standoffs between the plates, and a battery strap groove on the underside. The model should clearly show the arm cross-section (rectangular tube), individual bolt holes, and the mounting pattern.',
      polyCount: '8,000–20,000 triangles recommended',
      materials: [
        'Carbon fiber — dark near-black (hex #1a1a1e), roughness 0.35, metalness 0.10, with 3K weave normal map',
        'Metal standoffs — silver (hex #b0b5c0), roughness 0.25, metalness 0.85',
        'Rubber landing legs — near-black (hex #222222), roughness 0.90, metalness 0.00',
        'Motor mount face — slight sheen (roughness 0.30)',
      ],
      keyFeatures: [
        'Visible carbon-fiber weave texture on all CF surfaces',
        'M3 bolt holes at arm roots, motor mounts, and standoff positions',
        'Battery strap slot cutout on the bottom plate',
        'Slight arm taper (wider at root, narrower at motor mount)',
        'Chamfered edges on center plates',
      ],
      loaderNote: 'Load with THREE.GLTFLoader. Replace the THREE.Group from createMesh() with gltf.scene. Set origin at frame geometric center (mid-height between top and bottom plates). Apply gltf.scene.traverse() to enable castShadow/receiveShadow on all child Meshes.',
    },
  },

  motor: {
    name: 'Brushless DC Motor',
    icon: '⚡',
    category: 'Propulsion',
    overview: `Brushless DC (BLDC) motors are the workhorses of multirotor drones. Unlike brushed motors found in toy drones, they have no physical contacts between the rotor and stator — electromagnets in the stator switch on and off in precise sequence to spin the permanent-magnet rotor (the outer bell).\n\nThis design is dramatically more efficient (85-92%), more powerful, and lasts 10-50× longer than brushed alternatives. The "outrunner" design places magnets on the outside bell, maximizing torque for direct-drive propeller spinning without gears.`,

    specifications: [
      { label: 'Type', value: 'Brushless Outrunner (14-pole, 12N14P)' },
      { label: 'Stator Size', value: '2306 (23mm diameter, 6mm height)' },
      { label: 'KV Rating', value: '1750KV (RPM per volt)' },
      { label: 'Max RPM', value: '~42,000 on 6S LiPo' },
      { label: 'Peak Thrust', value: '~1.5kg per motor' },
      { label: 'Weight', value: '~33g per motor' },
      { label: 'Shaft', value: '5mm (M5 thread)' },
      { label: 'Bearings', value: 'Japanese EZO steel bearings' },
    ],

    whyChosen: `The 2306 stator size is the sweet spot for 5-inch quads — enough torque to spin 5" props aggressively without adding unnecessary weight. The 1750KV rating is optimized for 6S (22.2V) batteries.\n\nKV × Voltage = unloaded RPM, so 1750 × 22.2 ≈ 38,850 RPM. Under load with a prop, this translates to responsive, powerful thrust. The outrunner design provides higher torque than inrunner motors, eliminating the need for a gearbox.`,

    useCase: `Each motor independently varies its speed to control the drone's movement:\n• All 4 speed up = climb\n• All 4 slow down = descend\n• Front pair slows, rear speeds up = pitch forward (fly forward)\n• Diagonal pair speed difference = yaw (rotate)\n\nThe flight controller sends DShot digital signals to each motor's ESC at up to 8kHz, enabling incredibly fast response times essential for acrobatic flight.`,

    alternatives: [
      { name: '2207 Motors', desc: 'Larger stator = more torque, ~5g heavier — for heavier builds or aggressive flying' },
      { name: '1404 Motors', desc: 'Much smaller for 3" micro quads — half the weight but much less thrust' },
      { name: '2812 Motors', desc: 'For 7" long-range builds — more efficient at lower RPM, poor for acrobatics' },
      { name: 'Brushed Motors', desc: 'Simple, cheap ($1), but only 50-60% efficient and die after 20-50 hours' },
      { name: '2004 Ultralight', desc: 'For ultralight 5" builds — less powerful but extremely efficient at cruise' },
    ],

    failureModes: [
      'Bearing failure from crash impacts — causes grinding noise, wobble, and heat',
      'Bent motor shaft from hard landings — prop wobbles visibly',
      'Demagnetized magnets from extreme heat (200°C+) after prolonged full-throttle',
      'Bell housing dent contacts stator windings — motor grinds or locks up completely',
      'Wire insulation melts from excessive current — creates internal short circuit',
      'Loose magnet detaches inside bell — catastrophic vibration and possible fire',
    ],

    limitations: [
      'High KV motors are power-hungry and less efficient at cruise throttle',
      'No position feedback without separate Hall sensors or encoders',
      'Require an ESC (Electronic Speed Controller) to operate — can\'t run directly from battery',
      'Generate significant electromagnetic interference (EMI) affecting GPS and radio reception',
      'Bearing lifespan is finite — typically 200-500 flight hours before degradation',
      'Performance decreases as magnets weaken with age and heat cycling',
    ],

    positives: [
      'Extraordinary power-to-weight ratio (1.5kg thrust from a 33g motor)',
      'Millisecond response time — critical for stable flight',
      'No brush wear means 10-50× longer lifespan than brushed motors',
      '85-92% electrical-to-mechanical conversion efficiency',
      'Smooth, digitally precise speed control via DShot ESC protocol',
      'Minimal maintenance required — just check bearings periodically',
      'Run cool under normal flight loads due to high efficiency',
    ],

    assemblyTips: `1. Use all 4 M3 mounting screws — never fly with fewer (vibration will loosen remaining ones)\n2. Before mounting props, hand-spin each motor checking for any grinding or rough spots\n3. Check shaft straightness: spin the motor and watch the shaft tip for wobble\n4. Route the 3 motor wires cleanly along the arm, secured with zip ties\n5. Motor direction matters: 2 spin CW (motors 1,4), 2 spin CCW (motors 2,3)\n6. If a motor gets hot after flying (too hot to touch), it's either damaged or the prop is wrong`,

    powerStates: {
      min: {
        label: 'Idle / Armed-on-Ground (~5% throttle)',
        description: 'Motor spins at minimum commanded speed, just enough to keep the ESC active and props turning slowly. Almost no thrust is generated. The motor bell rotates at low RPM; windings carry minimal current and run cool. This is the "armed but sitting" state.',
        metrics: [
          { label: 'RPM', value: '~3,000–4,000 RPM' },
          { label: 'Thrust (per motor)', value: '~20–40 g (negligible)' },
          { label: 'Current Draw', value: '~0.5–0.8 A per motor' },
          { label: 'Power Consumption', value: '~11–18 W per motor' },
          { label: 'Motor Temperature', value: '25–35°C (cool, near ambient)' },
          { label: 'ESC Signal', value: 'DShot digital, ~5% duty' },
        ],
      },
      mid: {
        label: 'Cruise / Hover (~45–55% throttle)',
        description: 'Motor at the efficiency sweet spot — spinning fast enough to support steady hover with a small climb margin. This is where the motor spends most of its flight time. Heat is generated but managed effectively. The outrunner bell rotates smoothly; the EMF back-pressure closely tracks the applied voltage.',
        metrics: [
          { label: 'RPM', value: '~18,000–23,000 RPM' },
          { label: 'Thrust (per motor)', value: '~600–800 g' },
          { label: 'Current Draw', value: '~8–12 A per motor' },
          { label: 'Power Consumption', value: '~180–265 W per motor' },
          { label: 'Motor Temperature', value: '55–70°C (warm but safe)' },
          { label: 'Electrical Efficiency', value: '~88–92%' },
        ],
      },
      max: {
        label: 'Full Throttle / Maximum Output (100%)',
        description: 'Motor is pushed to its absolute design limit. All 4 motors combined pull 130–160 A from the battery. Thrust-to-weight ratio peaks at ~7.5:1. Sustained operation at this level for more than a few seconds risks demagnetizing the permanent magnets or melting winding insulation. Used for climbing or extreme acceleration bursts only.',
        metrics: [
          { label: 'RPM', value: '~40,000–44,000 RPM' },
          { label: 'Thrust (per motor)', value: '~1,400–1,600 g' },
          { label: 'Current Draw', value: '~35–42 A per motor' },
          { label: 'Power Consumption', value: '~780–930 W per motor' },
          { label: 'Motor Temperature', value: '80–105°C (very hot — limit exposure)' },
          { label: 'Prop Tip Speed', value: 'Approaching Mach 0.5' },
          { label: 'Total 4-Motor Draw', value: '~140–168 A from battery' },
        ],
      },
    },

    glbModel: {
      suggestedFilename: 'brushless_motor.glb',
      description: 'A high-detail outrunner BLDC motor showing: the dark stator base with visible winding slots, the silver bell housing (outer rotor) that rotates over the stator, a flat cap on top of the bell, the 5 mm motor shaft protruding upward, a visible copper winding ring in the gap between stator and bell, a base mounting plate with 4 bolt holes, and 3 wire leads (red, black, yellow) exiting the bottom. The bell should be a separate mesh to support programmatic rotation animation.',
      polyCount: '4,000–12,000 triangles recommended',
      materials: [
        'Stator body — dark metal (hex #4a4a55), roughness 0.30, metalness 0.80',
        'Bell housing — silver (hex #b0b5c0), roughness 0.25, metalness 0.85',
        'Copper windings — warm copper (hex #c07840), roughness 0.35, metalness 0.90',
        'Motor shaft — bright silver, roughness 0.15, metalness 0.95',
        'Wire insulation — red, black, and yellow, roughness 0.60',
      ],
      keyFeatures: [
        'Separate bell mesh for spin animation (rotate Y-axis)',
        'Visible winding gaps between stator teeth',
        '4× M3 bolt holes on base mounting plate',
        '5 mm shaft extending above bell cap',
        '3 ESC phase wires exiting base',
      ],
      loaderNote: 'Load with THREE.GLTFLoader. Find the bell mesh by name (e.g., "bell" or "rotor") and store a reference to animate its Y-axis rotation each frame via: bellMesh.rotation.y += spinSpeed * deltaTime. Ensure origin is at the motor shaft center-bottom.',
    },
  },

  propeller: {
    name: 'Propeller',
    icon: '🌀',
    category: 'Propulsion',
    overview: `Propellers convert the motor's rotational energy into thrust by pushing air downward — Newton's Third Law in action. Each blade is an airfoil (shaped like a wing cross-section) that generates lift as it spins through the air.\n\nThe "pitch" (angle of the blade) determines how much air each revolution moves. Higher pitch = more air moved = more thrust but also more drag and current draw. A quadcopter uses 2 clockwise (CW) and 2 counter-clockwise (CCW) props to balance out rotational torque.`,

    specifications: [
      { label: 'Diameter', value: '5 inch (127mm)' },
      { label: 'Pitch', value: '4.3 inch (distance traveled per revolution in air)' },
      { label: 'Blades', value: '2-blade (bi-blade)' },
      { label: 'Material', value: 'Polycarbonate (PC) blend, injection molded' },
      { label: 'Weight', value: '~4g per propeller' },
      { label: 'Hub', value: '5mm bore, press-fit onto M5 motor shaft' },
      { label: 'Tip Speed', value: '~Mach 0.5 at full throttle' },
    ],

    whyChosen: `5-inch bi-blade props are the gold standard for FPV quads. The "5043" size specification (5" diameter, 4.3" pitch) provides excellent thrust with manageable current draw on 2306 motors.\n\nTwo-blade props are more efficient and quieter than tri-blades. The 4.3" pitch balances top speed with low-speed controllability. Higher pitch (5.1"+) gives more speed but makes the quad feel "slippery" at low throttle.`,

    useCase: `Propellers directly determine the drone's flight personality:\n• High pitch (5.1"+) = higher top speed, aggressive feel\n• Low pitch (4.0-) = better hover efficiency, smoother control\n• More blades (tri/quad) = more grip and thrust but less efficiency\n\nFor a general-purpose 5" quad, 4.3-4.8" pitch is the sweet spot. Props are consumables — expect to replace them frequently. A typical pilot goes through 20-50 sets per year.`,

    alternatives: [
      { name: 'Tri-blade (3-blade)', desc: 'More thrust and "grip" in turns, but ~15% less efficient and louder' },
      { name: 'Quad-blade (4-blade)', desc: 'Maximum grip for aggressive freestyle, highest current draw' },
      { name: 'HQ Prop V2', desc: 'Premium quality, extremely well-balanced, noticeably smoother flight' },
      { name: 'Folding Props', desc: 'For long-range fixed-wing conversions — fold back when not powered' },
      { name: 'Carbon Fiber Props', desc: 'Ultra-rigid and efficient, but dangerous — can easily cut skin/bone' },
    ],

    failureModes: [
      'Blade snaps on contact with objects — the most common part to break on any drone',
      'Leading edge nicks from grass, dust, or small debris degrade thrust by 5-20%',
      'Prop flies off mid-flight if nut isn\'t tightened (catastrophic — drone falls from sky)',
      'Hub cracks from repeated aggressive throttle punches (material fatigue)',
      'UV exposure makes polycarbonate brittle — outdoor-stored props become fragile',
    ],

    limitations: [
      'Maximum diameter is physically limited by the frame arm length',
      'Plastic props flex under high load, reducing efficiency compared to rigid carbon',
      'Even a small nick causes vibration that ruins camera stabilization footage',
      'At full RPM, prop tips approach transonic speeds — efficiency drops and noise spikes',
      'Performance decreases significantly at high altitude due to thinner air density',
    ],

    positives: [
      'Extremely cheap — $2-4 for a full set of 4 propellers',
      'Tool-free replacement on most setups (press-fit + lock nut)',
      'Ultra-lightweight at ~4g — negligible impact on total flight weight',
      'Huge variety of pitch/blade configurations for fine-tuning performance',
      'Act as a mechanical fuse — props break before the more expensive motor does in crashes',
      'Readily available worldwide, many brands and styles to choose from',
    ],

    assemblyTips: `1. CRITICAL: Check prop direction markings! CW props go on CW motors, CCW on CCW\n2. The letter "R" on a prop usually means "reverse" (CCW)\n3. Use nylon lock nuts (nylock) on motor shafts — never fly without them\n4. Inspect every prop before each flight for hairline cracks, nicks, or deformation\n5. After a crash, always replace the prop on the motor that hit — even if it looks fine\n6. For smooth camera footage, balance new props by sanding the heavier blade tip`,

    powerStates: {
      min: {
        label: 'Idle Spin (~5% throttle)',
        description: 'Propeller rotates slowly at low RPM. Blades cut through air at a shallow angle; almost no net downwash is produced. The tip speed is well below transonic — no aerodynamic noise. The prop is essentially spinning in place, consuming almost no energy.',
        metrics: [
          { label: 'RPM', value: '~3,000–4,000 RPM' },
          { label: 'Tip Speed', value: '~20 m/s (72 km/h) — very subsonic' },
          { label: 'Thrust', value: '~20–40 g per prop' },
          { label: 'Aerodynamic Drag', value: 'Minimal — blades at low AoA' },
          { label: 'Noise Level', value: 'Low hum (~55–65 dB at 1 m)' },
          { label: 'Blade Flex', value: '< 0.5 mm' },
        ],
      },
      mid: {
        label: 'Cruise / Hover (~50% throttle)',
        description: 'Propellers operating at their most aerodynamically efficient point. The blade pitch angle produces maximum lift-to-drag ratio. Downwash creates a stable column of accelerated air below the drone. This is the Goldilocks zone — enough thrust to hover with a margin, without excessive current draw.',
        metrics: [
          { label: 'RPM', value: '~18,000–23,000 RPM' },
          { label: 'Tip Speed', value: '~120 m/s (~Mach 0.35)' },
          { label: 'Thrust', value: '~600–800 g per prop' },
          { label: 'Propulsive Efficiency', value: '~75–85% (peak efficiency band)' },
          { label: 'Noise Level', value: 'Moderate buzz (~75–80 dB at 1 m)' },
          { label: 'Blade Flex', value: '~1–2 mm at tip (centrifugal load)' },
        ],
      },
      max: {
        label: 'Full Throttle / Maximum RPM (100%)',
        description: 'Propeller blades near their structural limit. Tip speeds approach the transonic regime where aerodynamic efficiency drops sharply. Centrifugal force pulls blades outward; polycarbonate flexes measurably. The characteristic high-pitched scream comes from blade-tip vortices transitioning to shock waves. This is where props are most likely to shatter on impact.',
        metrics: [
          { label: 'RPM', value: '~40,000–44,000 RPM' },
          { label: 'Tip Speed', value: '~168–175 m/s (Mach 0.49–0.51)' },
          { label: 'Thrust', value: '~1,400–1,600 g per prop' },
          { label: 'Centrifugal Force at Tip', value: '~80–120 N' },
          { label: 'Blade Tip Deflection', value: '~3–5 mm (significant flex)' },
          { label: 'Noise Level', value: 'Very loud screech (~95–100 dB at 1 m)' },
          { label: 'Efficiency Drop', value: '~15–25% below peak due to compressibility' },
        ],
      },
    },

    glbModel: {
      suggestedFilename: 'propeller.glb',
      description: 'A 5-inch two-blade propeller with a center hub, two swept and tapered airfoil blades (wider at mid-span, tapering toward root and tip), a hexagonal lock nut on top of the hub, and a 5 mm bore for the motor shaft. The blade cross-section should show an airfoil profile (asymmetric, flat bottom, curved top) with slight pitch twist along the span. Both CW and CCW variants are needed (mirror the blade sweep direction).',
      polyCount: '800–2,500 triangles per prop (lightweight, 11 props total)',
      materials: [
        'Blade — translucent polycarbonate (hex #555566), roughness 0.45, metalness 0.15, opacity 0.92',
        'Hub — dark metal (hex #4a4a55), roughness 0.30, metalness 0.80',
        'Lock nut — silver metal, roughness 0.20, metalness 0.90',
      ],
      keyFeatures: [
        'True airfoil blade cross-section (not flat)',
        'Blade pitch twist from root to tip',
        'CW / CCW variants (mirrored blade sweep)',
        'Separate hub mesh for assembly attachment point',
        'Slight blade camber for lift generation visualization',
      ],
      loaderNote: 'Load with THREE.GLTFLoader. Store reference to blade group and animate rotation.y each frame: propMesh.rotation.y += spinSpeed * deltaTime. Spin direction: CW props (motors 1, 4) rotate positive Y; CCW props (motors 2, 3) rotate negative Y. Scale to match frame arm length.',
    },
  },

  battery: {
    name: 'LiPo Battery Pack',
    icon: '🔋',
    category: 'Power',
    overview: `Lithium Polymer (LiPo) batteries are the energy source for the entire drone. They store electrical energy in lithium-ion chemistry cells and can deliver it at extraordinary current rates.\n\nLiPo cells operate at 3.7V nominal (4.2V fully charged, 3.0V empty — NEVER go below 3.3V). A "6S" pack has 6 cells in series for 22.2V nominal (25.2V full charge). LiPos are chosen for drones specifically because of their incredible power density — they can output 100+ amps from a pack that weighs under 200g.`,

    specifications: [
      { label: 'Configuration', value: '6S1P (6 cells in series, 1 parallel)' },
      { label: 'Capacity', value: '1300mAh' },
      { label: 'Nominal Voltage', value: '22.2V (25.2V fully charged)' },
      { label: 'C-Rating', value: '100C continuous discharge' },
      { label: 'Max Continuous Current', value: '130A' },
      { label: 'Energy', value: '28.86Wh' },
      { label: 'Weight', value: '~195g' },
      { label: 'Connector', value: 'XT60 (main) + JST-XH (balance)' },
    ],

    whyChosen: `6S 1300mAh has become the standard for 5-inch freestyle and racing quads. The higher voltage (compared to 4S) means lower current for the same power output, which means less heat in ESCs and wiring.\n\n1300mAh provides 3-5 minutes of aggressive flight or 6-8 minutes of casual flying — the ideal balance between battery weight and flight time. The 100C rating ensures the pack can deliver the ~120A peak current draw during full-throttle maneuvers without dangerous voltage sag.`,

    useCase: `The battery is typically the heaviest single component at 30-40% of total drone weight, making its placement critical for balance.\n\nTypical workflow:\n• Charge batteries to 4.2V/cell before flying (use a proper balance charger)\n• Mount on the bottom of the frame with a rubberized strap\n• Fly for 3-5 minutes, monitoring voltage via OSD\n• Land when any cell drops to 3.5V\n• Swap with a fresh pack and continue flying\n• Store at 3.85V/cell (storage voltage) for long-term health`,

    alternatives: [
      { name: '4S LiPo (14.8V)', desc: 'Simpler, cheaper electronics, but less efficient at high power levels' },
      { name: 'Li-Ion (18650/21700)', desc: '2-3× more energy density for long-range, but 1/5th the discharge rate' },
      { name: 'LiHV (High Voltage)', desc: 'Charges to 4.35V/cell for ~5% more energy, slightly shorter calendar life' },
      { name: 'Graphene LiPo', desc: 'Graphene-enhanced for lower internal resistance and faster charging' },
      { name: 'Solid-State Battery', desc: 'Emerging tech — much safer, higher density, but currently very expensive' },
    ],

    failureModes: [
      'Puffing/swelling — gas buildup from over-discharge or internal damage (stop using immediately)',
      'Thermal runaway — internal short circuit causing self-sustaining fire at 600°C+ (extremely dangerous)',
      'Cell imbalance — one cell drops voltage faster than others, leading to over-discharge damage',
      'Physical puncture from a crash causing instant fire (exposed cells are extremely volatile)',
      'Cold weather (<5°C) dramatically reduces available capacity and increases internal resistance',
      'Over-charging past 4.25V/cell causes lithium plating and permanent capacity loss',
    ],

    limitations: [
      'LiPo fires are extremely dangerous — burns at 600°C+, cannot be extinguished with water',
      'Short flight times: 3-5 min aggressive, 8-12 min cruise (energy density vs gasoline is ~1/50th)',
      'Must be stored at 3.80-3.85V/cell; storing fully charged degrades the cells faster',
      'Typical lifespan of 200-300 charge cycles before noticeable capacity loss',
      'Performance drops 30-50% below 5°C ambient temperature',
      'Requires a specialized balance charger — improper charging causes fires',
      'Cannot be shipped easily via air freight (hazmat classification)',
    ],

    positives: [
      'Incredible power density — can deliver 130+ amps from a 195g package',
      'Lightweight for the energy they provide (best available for high-power drones)',
      'No memory effect — can top-off charge at any state without degradation',
      'Fast charging possible — quality packs support 2-3C charge rates (full in 15-25 min)',
      'Widely available worldwide, standardized sizes, and connector types',
      'Relatively affordable at $15-30 per pack',
      'Flat discharge curve — voltage stays relatively stable until near empty',
    ],

    assemblyTips: `1. Secure with a proper non-slip strap — the battery must NOT shift during aggressive flying\n2. Mount as close to the drone's center of gravity as possible\n3. Use a rubberized battery pad to prevent sliding and dampen vibration\n4. NEVER fly with a puffed, damaged, or dented battery\n5. Check total voltage AND individual cell voltages before each flight\n6. After crashing, immediately check the battery for damage, dents, or warmth\n7. Store batteries in a fireproof LiPo-safe bag when not in use\n8. Never charge unattended — always monitor the charging process`,

    powerStates: {
      min: {
        label: 'Idle / Minimum Draw (armed, no throttle)',
        description: 'Battery powers only the flight controller, ESCs in standby, receiver, and any LEDs. Extremely light current draw — effectively a parasitic load. Cell voltages remain near full charge. The battery can sustain this state for 20–40 minutes before meaningful voltage drop.',
        metrics: [
          { label: 'Total Current Draw', value: '~2–4 A (all systems, no motors)' },
          { label: 'Power Consumed', value: '~45–90 W' },
          { label: 'Cell Voltage', value: '~4.18–4.20 V per cell (near full)' },
          { label: 'Internal Resistance Effect', value: 'Negligible voltage sag' },
          { label: 'Battery Temperature', value: 'Ambient + ~1–2°C' },
          { label: 'Estimated Runtime at this Load', value: '~20–35 minutes' },
        ],
      },
      mid: {
        label: 'Cruise / Hover (~50% throttle)',
        description: 'The most common operating state during flight. Total current around 30–45 A from all four motors at hover throttle. The battery voltage sags ~0.1–0.2 V per cell under this load. Packs stay in their safe operating temperature range. A healthy pack will maintain this output for 3–6 minutes depending on flying style.',
        metrics: [
          { label: 'Total Current Draw', value: '~30–45 A (hover throttle)' },
          { label: 'Power Consumed', value: '~670–1,000 W' },
          { label: 'Cell Voltage Under Load', value: '~3.85–3.95 V per cell' },
          { label: 'Voltage Sag', value: '~0.10–0.20 V per cell' },
          { label: 'Battery Temperature', value: '35–50°C (warm but normal)' },
          { label: 'Estimated Flight Time', value: '3–6 min (aggressive) / 6–9 min (relaxed)' },
        ],
      },
      max: {
        label: 'Full Throttle / Peak Discharge (100%)',
        description: 'Maximum burst power delivery. All motors at full throttle pull 130–165 A combined — nearly the pack\'s C-rating limit. Voltage sags dramatically (0.3–0.5 V per cell), reducing available power and stressing the internal chemistry. Sustained full throttle for more than 5–10 seconds risks cell imbalance, excessive heat, and accelerated wear. A LiPo fire can occur if pushed beyond rated limits.',
        metrics: [
          { label: 'Peak Current Draw', value: '~130–165 A (all 4 motors max)' },
          { label: 'Peak Power Output', value: '~2,900–3,650 W' },
          { label: 'Cell Voltage Under Full Load', value: '~3.60–3.75 V per cell (heavy sag)' },
          { label: 'Voltage Sag', value: '~0.35–0.55 V per cell' },
          { label: 'Battery Temperature', value: '55–80°C (hot — cycle limit approaching)' },
          { label: 'Internal Resistance Heating', value: '~P = I²R; ~50–90 W as waste heat' },
          { label: 'Safe Burst Duration', value: '< 10 seconds continuously' },
        ],
      },
    },

    glbModel: {
      suggestedFilename: 'lipo_battery_6s.glb',
      description: 'A 6S 1300 mAh LiPo battery pack with a main rectangular body, cylindrical end caps for a rounded profile, a white/grey label strip showing cell count and capacity, a yellow XT60 connector protruding from one end, a small JST-XH balance lead connector, and red + black power wires. The model should convey the compact, dense feel of a LiPo — slightly shorter than a person\'s palm and about as thick as two fingers.',
      polyCount: '1,500–4,000 triangles recommended',
      materials: [
        'Battery body — blue (hex #1a44aa), roughness 0.50, metalness 0.10 (plastic shrink wrap)',
        'Label strip — light grey/white, roughness 0.70, metalness 0.00 (with text markings)',
        'XT60 connector — yellow (hex #ddaa00), roughness 0.50, metalness 0.10',
        'Power wires — red and black PVC, roughness 0.60',
        'Balance lead — white plastic, roughness 0.65',
      ],
      keyFeatures: [
        'Rounded end cap profile (cylindrical caps on ±X ends)',
        'Visible XT60 connector with correct 2-pin oval shape',
        'JST-XH balance lead (6-pin for 6S)',
        'Printed label with capacity, voltage, and C-rating text',
        'Subtle seam line around battery body',
      ],
      loaderNote: 'Load with THREE.GLTFLoader. Mount at snapPosition (x:0, y:0.7, z:0) on the drone frame underside, held by a simulated strap. Scale so the long axis (X) spans ~0.8 world units to match frame slot dimensions.',
    },
  },

  flightController: {
    name: 'Flight Controller (FC)',
    icon: '🧠',
    category: 'Electronics',
    overview: `The flight controller is the brain of the drone. It's a compact circuit board containing a powerful microprocessor, a gyroscope (measures rotation rate), and an accelerometer (measures linear acceleration) — together forming an IMU (Inertial Measurement Unit).\n\nThe FC reads sensor data thousands of times per second, runs PID (Proportional-Integral-Derivative) control loops, and continuously adjusts all four motor speeds to keep the drone stable and responsive. Without it, a quadcopter would tumble uncontrollably within milliseconds — it's inherently unstable and relies entirely on the FC for flight.`,

    specifications: [
      { label: 'Processor', value: 'STM32 H743 (480 MHz ARM Cortex-M7)' },
      { label: 'IMU Gyro', value: 'BMI270 (6-axis, 6.4kHz sampling)' },
      { label: 'PID Loop Rate', value: '8kHz (8,000 corrections/second)' },
      { label: 'Firmware', value: 'Betaflight 4.5 (open-source)' },
      { label: 'Mounting', value: '30.5×30.5mm, M3 grommets' },
      { label: 'UARTs', value: '6× serial ports for peripherals' },
      { label: 'OSD Chip', value: 'AT7456E on-screen display IC' },
      { label: 'Weight', value: '~8g' },
    ],

    whyChosen: `The H7 processor provides enough computational power to run the PID loop at 8kHz while simultaneously handling RPM filtering, dynamic notch filters, GPS rescue, and all modern Betaflight features without any performance bottleneck.\n\nThe BMI270 gyro is purpose-designed with extremely low noise specifically for drone applications. Betaflight firmware is open-source, actively developed by a massive community, and runs on >90% of custom-built drones.`,

    useCase: `The FC is the central nervous system, processing:\n\nInputs: Gyro rotation data, accelerometer data, barometer altitude, GPS position, radio pilot commands, battery voltage/current telemetry, RPM telemetry from ESCs\n\nOutputs: DShot digital signals to each ESC/motor, OSD graphics overlaid on the video feed, telemetry data transmitted back to the pilot's radio\n\nThe PID controller is the core algorithm — it calculates the error between the desired rotation rate (from pilot sticks) and the actual rotation rate (from gyro), then applies corrections to each motor. This happens 8,000 times per second.`,

    alternatives: [
      { name: 'F405 FC', desc: 'Older F4-class processor — cheaper but limited for modern filtering features' },
      { name: 'All-in-One (AIO)', desc: 'FC + ESC on single board — lighter and simpler, but if one part dies both are lost' },
      { name: 'DJI Flight Controller', desc: 'Proprietary, extremely reliable, but locked to DJI ecosystem only' },
      { name: 'Pixhawk / ArduPilot', desc: 'For autonomous survey/mapping drones — much heavier but vastly more features' },
      { name: 'KISS FC', desc: 'Premium closed-source firmware — buttery smooth flight, higher price' },
    ],

    failureModes: [
      'Gyro chip failure from crash vibration — most common FC death (causes uncontrollable oscillation)',
      'USB port physically breaks off from stress during configuration cable connection',
      'Voltage regulator burns from power surge during battery plug-in with charged capacitor',
      'Solder pads lift from PCB due to repeated soldering/desoldering of peripherals',
      'Firmware corruption from interrupted USB flash process (recoverable via DFU mode)',
      'Processor thermal throttle or damage from sustained computation without airflow',
    ],

    limitations: [
      'Requires careful PID tuning for each specific build — bad tunes fly dangerously',
      'Gyro noise from frame vibration can cause motor oscillation if filtering is misconfigured',
      'Limited number of UART ports constrains how many peripherals can be connected',
      'Firmware updates occasionally introduce regressions that break existing configurations',
      'Cannot maintain altitude or position without GPS — only rotation stabilization is native',
      'Configuration requires a computer and Betaflight Configurator software',
    ],

    positives: [
      'Open-source firmware with massive community of developers and support',
      'Microsecond response times — among the fastest control systems in consumer electronics',
      'Built-in OSD chip renders flight data (battery voltage, altitude, speed) in the pilot\'s goggles',
      'Blackbox flight data logging for detailed post-flight analysis and tuning',
      'GPS rescue mode can autonomously fly the drone home if signal is lost',
      'Extremely compact and light at ~8g for the entire flight computer',
      'Continuously improving through community firmware updates (new version every ~3 months)',
      'Supports dozens of protocols: SBUS, CRSF, DShot, SmartAudio, MSP, MAVLink',
    ],

    assemblyTips: `1. Mount with soft silicone grommets (M3) to isolate vibration from the carbon frame — this is critical\n2. Solder connections carefully — cold or bridged joints cause intermittent failures that are nightmare to debug\n3. Flash and configure firmware BEFORE soldering anything to verify the board is functional\n4. The arrow printed on the FC must point toward the front of the drone\n5. Double-check all UART assignments in Betaflight Configurator before first flight\n6. Apply conformal coating to the board for moisture/dust protection\n7. Keep the gyro area clear — no wires touching or pressing against the IMU chip`,

    powerStates: {
      min: {
        label: 'Standby / Armed-Idle',
        description: 'Flight controller is powered and running Betaflight. The PID loop executes at 8 kHz but output to motors is zeroed (or minimum idle). The gyro samples continuously; barometer and GPS poll at low rates. The FC draws minimal power — essentially waiting for pilot input.',
        metrics: [
          { label: 'CPU Load', value: '~15–25% (PID loop + sensor polling)' },
          { label: 'PID Loop Rate', value: '8,000 Hz active' },
          { label: 'Current Draw (FC only)', value: '~120–160 mA @ 5V' },
          { label: 'Power Consumption', value: '~0.6–0.8 W' },
          { label: 'FC Temperature', value: '30–40°C (processor warm-up)' },
          { label: 'Gyro Sample Rate', value: '6,400 Hz (BMI270)' },
        ],
      },
      mid: {
        label: 'Active Flight / Standard Operation',
        description: 'Full active flight. The processor runs at 480 MHz, executing the full PID control chain including RPM-based filtering, dynamic notch filters, motor mixing, and OSD graphics rendering every frame. Blackbox logging is active (writing ~2 MB per minute to flash). All UART peripherals are polling. This is normal operating state.',
        metrics: [
          { label: 'CPU Load', value: '~55–75%' },
          { label: 'PID Corrections/sec', value: '8,000 (every 125 µs)' },
          { label: 'Current Draw (FC only)', value: '~180–220 mA @ 5V' },
          { label: 'Power Consumption', value: '~0.9–1.1 W' },
          { label: 'FC Temperature', value: '50–65°C (active cooling from airflow)' },
          { label: 'Blackbox Log Rate', value: '~2,000 entries/sec' },
          { label: 'Motor Command Update Rate', value: '8,000 Hz via DShot600' },
        ],
      },
      max: {
        label: 'Maximum Processing Load (GPS rescue + logging + full filtering)',
        description: 'All computational features simultaneously active: GPS rescue algorithm computing return path, full RPM-based harmonic notch filter stack, DShot bidirectional telemetry, OSD rendering, Blackbox at maximum rate, barometer altitude hold, and an active RC link. The H7 processor approaches its thermal limit without airflow cooling.',
        metrics: [
          { label: 'CPU Load', value: '~85–95%' },
          { label: 'Active Features', value: 'GPS rescue + RPM filter + Blackbox + OSD + telemetry' },
          { label: 'Current Draw (FC only)', value: '~250–300 mA @ 5V' },
          { label: 'Power Consumption', value: '~1.25–1.5 W' },
          { label: 'FC Temperature (no airflow)', value: '75–90°C (thermal throttle risk)' },
          { label: 'FC Temperature (in-flight airflow)', value: '50–65°C (safe)' },
          { label: 'Filter Latency Added', value: '~1–2 ms (notch + RPM stacks)' },
        ],
      },
    },

    glbModel: {
      suggestedFilename: 'flight_controller_h7.glb',
      description: 'A 30.5 × 30.5 mm green PCB flight controller with: a large central ARM processor chip (black, square, ~13 × 13 mm), a smaller IMU chip offset from center, an OSD chip, 3 electrolytic capacitors (upright cylinders), two rows of gold pin headers on opposite edges, a micro-USB port on one edge, a green LED indicator, four corner mounting holes with chamfers (for M3 rubber grommets), and visible copper PCB traces etched on the board surface. The top surface has component markings and a directional arrow.',
      polyCount: '3,000–8,000 triangles recommended',
      materials: [
        'PCB substrate — green (hex #0d7a3a), roughness 0.60, metalness 0.05',
        'Copper traces — warm gold (hex #d4a840), roughness 0.25, metalness 0.80 (subtle traces on surface)',
        'ICs / chips — black (hex #1a1a1a), roughness 0.30, metalness 0.15',
        'Pin headers — black housing + gold pins (hex #d4a840), metalness 0.95',
        'Capacitors — dark metallic cylinders with colored bands',
        'USB port — silver metal, roughness 0.20, metalness 0.90',
        'LED — green emissive (hex #00ff44), emissiveIntensity 0.8',
      ],
      keyFeatures: [
        'Component-level detail: chips, caps, pin headers, USB port',
        'Visible directional arrow (⬆ FRONT) printed on PCB surface',
        'Mounting hole chamfers at all 4 corners',
        'Green LED with emissive material',
        'Subtle PCB copper trace pattern on board surface',
      ],
      loaderNote: 'Load with THREE.GLTFLoader. Mount flat (XZ plane) at snapPosition (x:0, y:1.12, z:0). Ensure the forward arrow points toward positive Z (drone front). The LED mesh should pulse its emissiveIntensity in code to simulate armed/unarmed status.',
    },
  },

  camera: {
    name: 'FPV Camera Module',
    icon: '📷',
    category: 'Vision',
    overview: `The FPV (First Person View) camera is the pilot's eyes in the sky. It captures a live video feed that's wirelessly transmitted to the pilot's goggles in real-time, enabling flight as if sitting in the cockpit.\n\nUnlike action cameras optimized for recording quality, FPV cameras prioritize ultra-low latency (under 20ms glass-to-glass delay) over resolution. Even 50ms of delay at 100km/h means the drone has traveled 1.4 meters since what you're seeing — so latency is literally life-or-death for the drone.\n\nWide Dynamic Range (WDR) allows the pilot to see details in both bright sky and dark shadows simultaneously, critical for flying through mixed-lighting environments.`,

    specifications: [
      { label: 'Sensor', value: '1/3" CMOS (Sony Starvis IMX335)' },
      { label: 'Resolution', value: '1200TVL (analog) / 720p60 (digital)' },
      { label: 'Latency', value: '< 15ms glass-to-glass' },
      { label: 'FOV', value: '155° diagonal (ultra-wide)' },
      { label: 'Lens', value: '2.1mm focal length, M12 mount' },
      { label: 'Min Illumination', value: '0.001 Lux (near-darkness)' },
      { label: 'Voltage Input', value: '5-36V (wide range)' },
      { label: 'Weight', value: '~5g (camera only)' },
    ],

    whyChosen: `Ultra-low latency is non-negotiable for FPV piloting. The Sony Starvis sensor family provides the best low-light performance available, enabling dawn/dusk flying and dark indoor environments.\n\nThe 155° wide FOV gives critical peripheral awareness of approaching obstacles. The 2.1mm lens is the standard choice — wider options exist (1.8mm) but cause excessive barrel distortion. The camera tilts upward 25-35° because the drone nose-dives forward to fly, so the camera compensates to look ahead at the horizon.`,

    useCase: `The FPV camera's video feed goes through this chain:\n\nCamera → Video Transmitter (VTX) → Radio waves → Receiving antenna → Pilot's goggles/screen\n\nThis entire chain must maintain <30ms total latency. The camera itself contributes <15ms.\n\nMany pilots mount a second, separate HD action camera (GoPro, Insta360) purely for recording beautiful footage. The FPV camera is solely for piloting — function over beauty.\n\nUse cases include FPV racing, proximity flying through buildings, and scouting/inspection of hard-to-reach areas.`,

    alternatives: [
      { name: 'DJI O3 Air Unit Camera', desc: 'Digital HD with ~30ms latency — best image quality but 20g heavier' },
      { name: 'HDZero Micro V3', desc: 'Ultra-low latency digital (~5ms) but shorter signal range' },
      { name: 'Walksnail Avatar Camera', desc: 'Good digital quality with recording, moderate 40ms latency' },
      { name: 'RunCam Analog', desc: 'Budget-friendly ($15), proven reliability, lower resolution but zero-delay' },
      { name: 'Naked GoPro', desc: 'Stripped-down action cam used as main FPV feed — heavy but stunning HD' },
    ],

    failureModes: [
      'Lens cracks from frontal crash impact — the camera sits at the very front, most exposed position',
      'Internal ribbon cable tears from sustained vibration or crash deceleration forces',
      'Image sensor burns out from prolonged direct sun exposure (pointing at sun while landed)',
      'Video becomes noisy/grainy when supply voltage drops — needs clean filtered power',
      'Connector pins bend from repeated plugging/unplugging during maintenance',
    ],

    limitations: [
      'Analog cameras have limited resolution — fine for flying but not for detailed recording',
      'Video signal quality degrades progressively with distance from the pilot',
      'Fixed lens — no optical zoom capability (digital zoom exists but is unusable for flying)',
      'Tiny sensor = limited dynamic range compared to phone or action cameras',
      'No image stabilization — camera vibration shows directly in the feed',
      'Color reproduction is functional rather than cinematic — it\'s a tool, not an art camera',
    ],

    positives: [
      'Ultra-low latency (<15ms) enables real-time piloting at 150+ km/h',
      'Featherweight at ~5g — negligible impact on drone performance',
      'Ultra-wide 155° FOV provides excellent spatial awareness for obstacle avoidance',
      'Outstanding low-light performance with Sony Starvis sensors (flies in near-darkness)',
      'Very affordable at $15-25 — easy to replace after crashes',
      'Wide voltage input range (5-36V) works with any battery configuration',
      'Extremely durable for their size — survives many crashes intact',
      'M12 lens mount allows swapping between different focal lengths',
    ],

    assemblyTips: `1. Mount at the very front of the frame, tilted up 25-35° from horizontal\n2. Use an adjustable camera mount that allows tilt angle changes (you'll want to experiment)\n3. Secure with both side screws — don't skip one even if it seems tight enough\n4. Route the video cable along the arm underside to avoid any prop contact\n5. Apply a small bead of hot glue to the connector for crash resilience (easy to remove later)\n6. Protect the lens with the spare lens cap during transport\n7. Clean the lens before flying — fingerprints cause noticeable haze in the video feed`,

    powerStates: {
      min: {
        label: 'Powered / Standby (no active flight)',
        description: 'Camera receives 5–12 V power from the video transmitter or direct battery line. The image sensor initializes; auto-exposure and auto-gain circuits lock onto the scene. The sensor reads out continuously but the drone is on the ground. The pilot\'s goggles show a stationary ground view. Latency is at its lowest (<12 ms) because the scene is static.',
        metrics: [
          { label: 'Power State', value: 'On — sensor active, lens pointed at ground/scene' },
          { label: 'Input Voltage', value: '5–12 V from VTX or filtered supply' },
          { label: 'Current Draw', value: '~60–90 mA' },
          { label: 'Power Consumption', value: '~0.3–1.1 W' },
          { label: 'Image Latency', value: '<12 ms glass-to-glass' },
          { label: 'Auto-Exposure State', value: 'Locking on ambient light scene' },
          { label: 'Temperature', value: '30–40°C (sensor warm from power)' },
        ],
      },
      mid: {
        label: 'Active Flight / Nominal Operation',
        description: 'Camera streams live video at full frame rate during flight. The Wide Dynamic Range (WDR) circuit constantly adjusts per-pixel exposure to handle bright sky and dark ground simultaneously. The image stabilizer (if present) compensates for vibration. The video transmitter is broadcasting this feed to the pilot\'s goggles in real-time.',
        metrics: [
          { label: 'Frame Rate', value: '60–100 fps (analog) / 60 fps (digital)' },
          { label: 'Resolution', value: '1200 TVL (analog) or 720p60 (digital)' },
          { label: 'Current Draw', value: '~80–120 mA' },
          { label: 'Power Consumption', value: '~0.4–1.4 W' },
          { label: 'WDR Mode', value: 'Active — blending short/long exposures per frame' },
          { label: 'Latency', value: '<15 ms steady-state' },
          { label: 'Temperature', value: '40–55°C (sensor + VTX heat in nacelle)' },
        ],
      },
      max: {
        label: 'Maximum Sensitivity / Low-Light / Full Dynamic Range',
        description: 'Camera pushed to its sensor limits — flying at dusk, dawn, or indoors with mixed lighting. The Sony Starvis sensor activates maximum analog gain and longest safe exposure time. The WDR algorithm performs frame-stacking to reveal shadow detail without blowing highlights. Noise becomes visible in the feed but the scene remains intelligible. This is where quality FPV cameras separate from consumer-grade sensors.',
        metrics: [
          { label: 'Minimum Illumination', value: '0.001 Lux (near complete darkness)' },
          { label: 'Analog Gain', value: 'Maximum (highest sensitivity mode)' },
          { label: 'Exposure Time', value: 'Near-maximum (motion blur risk at speed)' },
          { label: 'Current Draw', value: '~110–140 mA (max gain circuitry active)' },
          { label: 'Power Consumption', value: '~0.6–1.7 W' },
          { label: 'Dynamic Range', value: '~120 dB with WDR stacking' },
          { label: 'Latency Increase', value: '+1–3 ms (extra processing for WDR)' },
          { label: 'Temperature', value: '50–65°C (image sensor under heavy load)' },
        ],
      },
    },

    glbModel: {
      suggestedFilename: 'fpv_camera.glb',
      description: 'A miniature FPV camera unit featuring a compact rectangular carbon-fiber housing (~20 × 20 × 16 mm), a forward-pointing cylindrical lens barrel with a convex glass element at the front, a silver lens accent ring, a thin aluminium L-bracket mount on each side for tilt-angle adjustment, two tilt-lock screws, and a thin video cable exiting the rear. The lens should be clearly the visual focal point of the model. Overall feel: dense, industrial, miniaturized.',
      polyCount: '1,500–4,000 triangles recommended',
      materials: [
        'Camera housing — dark carbon (hex #1a1a1e), roughness 0.35, metalness 0.10',
        'Lens barrel — dark metal (hex #4a4a55), roughness 0.30, metalness 0.80',
        'Lens glass — near-black (hex #111122), roughness 0.05, metalness 0.30, transparent opacity 0.85',
        'Lens ring accent — silver, roughness 0.20, metalness 0.90',
        'Mount bracket — silver aluminium, roughness 0.30, metalness 0.75',
        'Video cable — black, roughness 0.60',
      ],
      keyFeatures: [
        'Convex glass lens element clearly visible at front',
        'Tilted mount position (25–35° upward from horizontal)',
        'Side bracket tilt slots visible',
        'Video cable exiting rear of housing',
        'Compact size relative to other components (~20 mm wide)',
      ],
      loaderNote: 'Load with THREE.GLTFLoader. Position at snapPosition (x:0, y:0.88, z:0.52) facing positive Z (front of drone). Apply a 25–30° rotation around X-axis to simulate upward camera tilt. The lens glass mesh should be a separate mesh with the transparent material applied in Three.js post-load.',
    },
  },

  esc: {
    name: 'Electronic Speed Controller (4-in-1 ESC)',
    icon: '⚡',
    category: 'Electronics',
    overview: `The ESC converts DC battery power into precisely timed 3-phase AC signals to drive brushless motors. A 4-in-1 ESC integrates all four motor controllers onto a single board, saving weight and wiring.\n\nIt receives throttle commands from the Flight Controller via DShot protocol up to 150,000 times per second, and adjusts motor RPM accordingly. Modern ESCs run BLHeli_32 firmware with features like active braking, RPM telemetry, and dynamic motor timing.`,
    specifications: [
      { label: 'Type', value: '4-in-1 Stack (30.5×30.5mm)' },
      { label: 'Continuous Current', value: '55A per motor' },
      { label: 'Burst Current', value: '65A (10s)' },
      { label: 'Firmware', value: 'BLHeli_32' },
      { label: 'Protocol', value: 'DShot600 / DShot1200' },
      { label: 'Input Voltage', value: '3-6S LiPo (11.1–25.2V)' },
      { label: 'MOSFETs', value: '8× N-channel (low-side + high-side)' },
      { label: 'Weight', value: '~12g' },
    ],
    whyChosen: `A 4-in-1 ESC simplifies wiring, reduces weight, and provides centralized current management. DShot protocol eliminates calibration and provides digital noise-immunity.`,
    useCase: `Controls the speed and direction of all four motors. Essential for any multirotor — without the ESC, the flight controller cannot command motors.`,
    alternatives: [
      { name: 'Individual ESCs', desc: 'One ESC per arm — easier to replace a single failed unit' },
      { name: 'BLHeli_S ESC', desc: 'Older 8-bit firmware, cheaper but fewer features' },
      { name: 'AM32 ESC', desc: 'Open-source 32-bit alternative to BLHeli_32' },
    ],
    failureModes: [
      'MOSFET burnout from sustained overcurrent or hard shorts',
      'Desync — motor stutters when ESC loses commutation timing',
      'Capacitor failure from voltage spikes during aggressive flying',
      'Solder pad detachment from vibration or crash impact',
    ],
    limitations: [
      'Single point of failure — if one channel dies, you lose the whole board',
      'Heat dissipation limited by small PCB area',
      'Must match ESC current rating to motor draw',
    ],
  },

  vtx: {
    name: 'Video Transmitter (VTX)',
    icon: '📡',
    category: 'FPV System',
    overview: `The VTX broadcasts live analog or digital video from the drone camera to your FPV goggles on the ground. It operates on 5.8 GHz with selectable channels and power levels.\n\nModern VTXs support SmartAudio or Tramp protocols, allowing the flight controller to remotely change channel, power level, and pit mode. Power ranges from 25mW (pit mode / close range) to 800mW+ (long range).`,
    specifications: [
      { label: 'Frequency', value: '5.8 GHz (5 bands × 8 channels)' },
      { label: 'Power Levels', value: '25mW / 100mW / 400mW / 800mW' },
      { label: 'Protocol', value: 'SmartAudio V2.1' },
      { label: 'Input Voltage', value: '7–26V DC' },
      { label: 'Connector', value: 'MMCX / u.FL' },
      { label: 'Weight', value: '~6g (board only)' },
    ],
    whyChosen: `Analog VTX provides the lowest latency for FPV racing (<1ms glass-to-glass). The multi-power selection allows legal compliance and range flexibility.`,
    useCase: `Required for FPV (First Person View) flying. Pilots see real-time video in their goggles as if sitting in the drone cockpit.`,
    alternatives: [
      { name: 'DJI O4 Digital', desc: 'HD digital link — better image quality but higher latency (~30ms)' },
      { name: 'HDZero', desc: 'Low-latency digital system — closest to analog speeds with HD image' },
      { name: 'Walksnail Avatar', desc: 'Digital system with recording and OSD overlay' },
    ],
    failureModes: [
      'RF amplifier burns out if powered without antenna connected',
      'Overheating at max power without airflow causes thermal shutdown',
      'Channel interference from nearby VTXs on same frequency',
    ],
    limitations: [
      'Analog signal degrades with distance (static/noise)',
      'Must have antenna connected before powering on',
      'Higher power = more heat and battery drain',
    ],
  },

  gps: {
    name: 'GPS Module (GNSS Receiver)',
    icon: '🛰️',
    category: 'Navigation',
    overview: `The GPS module receives satellite signals from GPS, GLONASS, BeiDou, and Galileo constellations to determine the drone's position, altitude, and ground speed. It provides position hold, return-to-home, and waypoint navigation capabilities.\n\nThe ceramic patch antenna faces skyward and must have a clear view of the sky. A magnetometer (compass) is often integrated to provide heading information independent of flight direction.`,
    specifications: [
      { label: 'Chipset', value: 'u-blox M10 (or BN-880 equivalent)' },
      { label: 'Constellations', value: 'GPS + GLONASS + BeiDou + Galileo' },
      { label: 'Accuracy', value: '±1.5m CEP (horizontal)' },
      { label: 'Update Rate', value: '10 Hz' },
      { label: 'Cold Start', value: '~26 seconds' },
      { label: 'Hot Start', value: '<1 second' },
      { label: 'Compass', value: 'Integrated QMC5883L magnetometer' },
      { label: 'Weight', value: '~10g (with mast)' },
    ],
    whyChosen: `Multi-constellation GNSS provides fast fix times and better accuracy in urban environments. The integrated compass simplifies wiring.`,
    useCase: `Enables autonomous flight modes: return-to-home, position hold, waypoint missions, and geofencing safety features.`,
    alternatives: [
      { name: 'u-blox M9N', desc: 'Previous generation — slightly cheaper, fewer constellations' },
      { name: 'RTK GPS', desc: 'Centimeter-precision using correction signals — survey/mapping grade' },
      { name: 'ublox F9P', desc: 'Dual-band RTK receiver for professional surveying drones' },
    ],
    failureModes: [
      'Compass interference from nearby high-current wires or motors',
      'No fix indoors or under dense foliage/urban canyons',
      'Position drift during GPS glitches can cause flyaway',
    ],
    limitations: [
      'Requires clear sky view — does not work indoors',
      'Compass must be calibrated and mounted far from magnetic interference',
      'Position accuracy varies with satellite geometry (PDOP)',
    ],
  },

  antenna: {
    name: '5.8 GHz Antenna (Pagoda LHCP)',
    icon: '📶',
    category: 'FPV System',
    overview: `The antenna radiates the video signal from the VTX to the pilot's goggles. A circularly polarized design (LHCP or RHCP) rejects multipath reflections and provides consistent signal in any orientation.\n\nThe Pagoda design uses two stacked PCB radiating elements for a nearly omnidirectional radiation pattern. The SMA connector threads onto the VTX's output jack.`,
    specifications: [
      { label: 'Frequency', value: '5.8 GHz (5.6–6.0 GHz bandwidth)' },
      { label: 'Polarization', value: 'LHCP (Left-Hand Circular)' },
      { label: 'Gain', value: '2.1 dBi (omnidirectional)' },
      { label: 'Connector', value: 'SMA Male' },
      { label: 'VSWR', value: '< 1.5:1 across band' },
      { label: 'Weight', value: '~5g' },
    ],
    whyChosen: `Circular polarization matches the goggle antenna, reducing signal loss from antenna orientation changes during acrobatic flight.`,
    useCase: `Transmits live video feed from the drone to FPV goggles on the ground. Must match polarization (LHCP/RHCP) with the receiving antenna.`,
    alternatives: [
      { name: 'Dipole Whip', desc: 'Simplest, cheapest — linear polarization with 3dB polarization loss' },
      { name: 'Cherry Antenna', desc: 'Stubby omnidirectional — very durable for racing' },
      { name: 'Patch/Crosshair', desc: 'Directional high-gain — for long range in one direction' },
    ],
    failureModes: [
      'SMA connector damage from crash impact',
      'PCB element cracks from repeated bends',
      'Coax cable break at solder joint',
    ],
    limitations: [
      'Omnidirectional = lower gain compared to directional antennas',
      'Protrudes from frame — vulnerable to crashes',
      'Must be mounted away from carbon fiber (RF shielding)',
    ],
  },
};

/**
 * Get description for a part by ID.
 * Motors and propellers share their respective base descriptions.
 */
export function getPartDescription(partId) {
  if (partDescriptions[partId]) return partDescriptions[partId];
  if (partId.startsWith('motor')) return { ...partDescriptions.motor, name: `Brushless Motor #${partId.replace('motor', '')}` };
  if (partId.startsWith('prop')) return { ...partDescriptions.propeller, name: `Propeller #${partId.replace('prop', '')}` };
  return null;
}
