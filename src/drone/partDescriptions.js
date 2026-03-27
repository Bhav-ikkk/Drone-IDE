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
