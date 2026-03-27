import * as THREE from 'three';

/**
 * Procedural drone parts configuration — detailed PBR models.
 * Each part defines its mesh geometry, material, snap position/rotation,
 * physics collider, and mass.
 */

// ===== MATERIALS =====
const Materials = {
  carbonFiber: () => new THREE.MeshStandardMaterial({
    color: 0x1a1a1e,
    roughness: 0.35,
    metalness: 0.1,
    flatShading: false,
  }),
  carbonMatte: () => new THREE.MeshStandardMaterial({
    color: 0x222226,
    roughness: 0.55,
    metalness: 0.05,
  }),
  metalSilver: () => new THREE.MeshStandardMaterial({
    color: 0xb0b5c0,
    roughness: 0.25,
    metalness: 0.85,
  }),
  metalDark: () => new THREE.MeshStandardMaterial({
    color: 0x4a4a55,
    roughness: 0.3,
    metalness: 0.8,
  }),
  copper: () => new THREE.MeshStandardMaterial({
    color: 0xc07840,
    roughness: 0.35,
    metalness: 0.9,
  }),
  batteryBlue: () => new THREE.MeshStandardMaterial({
    color: 0x1a44aa,
    roughness: 0.5,
    metalness: 0.1,
  }),
  batteryLabel: () => new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.7,
    metalness: 0.0,
  }),
  pcbGreen: () => new THREE.MeshStandardMaterial({
    color: 0x0d7a3a,
    roughness: 0.6,
    metalness: 0.05,
  }),
  chipBlack: () => new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.3,
    metalness: 0.15,
  }),
  goldPin: () => new THREE.MeshStandardMaterial({
    color: 0xd4a840,
    roughness: 0.2,
    metalness: 0.95,
  }),
  lensGlass: () => new THREE.MeshStandardMaterial({
    color: 0x111122,
    roughness: 0.05,
    metalness: 0.3,
    transparent: true,
    opacity: 0.85,
  }),
  propBlade: () => new THREE.MeshStandardMaterial({
    color: 0x555566,
    roughness: 0.45,
    metalness: 0.15,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  }),
  rubber: () => new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.9,
    metalness: 0.0,
  }),
  redWire: () => new THREE.MeshStandardMaterial({
    color: 0xcc2222,
    roughness: 0.6,
    metalness: 0.1,
  }),
  blackWire: () => new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.6,
    metalness: 0.1,
  }),
  yellowWire: () => new THREE.MeshStandardMaterial({
    color: 0xccaa22,
    roughness: 0.6,
    metalness: 0.1,
  }),
  ledGreen: () => new THREE.MeshStandardMaterial({
    color: 0x00ff44,
    roughness: 0.3,
    metalness: 0.2,
    emissive: 0x00ff44,
    emissiveIntensity: 0.3,
  }),
  xt60Yellow: () => new THREE.MeshStandardMaterial({
    color: 0xddaa00,
    roughness: 0.5,
    metalness: 0.1,
  }),
};

// Arm positions for the quadcopter (X-shape)
const ARM_LENGTH = 1.0;
const ARM_ANGLE_OFFSETS = [
  { x: ARM_LENGTH, z: ARM_LENGTH },    // front-right
  { x: -ARM_LENGTH, z: ARM_LENGTH },   // front-left
  { x: -ARM_LENGTH, z: -ARM_LENGTH },  // back-left
  { x: ARM_LENGTH, z: -ARM_LENGTH },   // back-right
];

function setShadows(mesh, cast = true, receive = true) {
  mesh.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = cast;
      child.receiveShadow = receive;
    }
  });
}

export function createPartDefinitions() {
  const parts = [];

  // ===== FRAME (center + 4 arms + landing gear) =====
  parts.push({
    id: 'frame',
    label: 'Main Frame',
    createMesh: () => {
      const group = new THREE.Group();
      const cf = Materials.carbonFiber();
      const cfMatte = Materials.carbonMatte();

      // Center top plate (octagonal)
      const topPlate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.04, 16),
        cf
      );
      topPlate.position.y = 0.06;
      group.add(topPlate);

      // Center bottom plate
      const bottomPlate = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.04, 16),
        cf
      );
      bottomPlate.position.y = -0.06;
      group.add(bottomPlate);

      // Standoffs between plates (4 posts)
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const standoff = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.08, 12),
          Materials.metalSilver()
        );
        standoff.position.set(Math.cos(angle) * 0.32, 0, Math.sin(angle) * 0.32);
        group.add(standoff);
      }

      // 4 Arms (tubes)
      ARM_ANGLE_OFFSETS.forEach((offset) => {
        const angle = Math.atan2(offset.x, offset.z);
        const armLength = 1.35;

        // Main arm tube
        const arm = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.08, armLength),
          cfMatte
        );
        arm.rotation.y = angle;
        arm.position.set(offset.x * 0.45, 0, offset.z * 0.45);
        group.add(arm);

        // Motor mount platform at arm tip
        const mount = new THREE.Mesh(
          new THREE.CylinderGeometry(0.19, 0.19, 0.03, 24),
          cf
        );
        mount.position.set(offset.x, -0.02, offset.z);
        group.add(mount);

        // Landing leg
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.015, 0.4, 8),
          Materials.rubber()
        );
        leg.position.set(offset.x, -0.24, offset.z);
        group.add(leg);

        // Landing foot pad
        const foot = new THREE.Mesh(
          new THREE.SphereGeometry(0.035, 12, 8),
          Materials.rubber()
        );
        foot.position.set(offset.x, -0.44, offset.z);
        group.add(foot);
      });

      // Battery strap groove (visual detail on bottom)
      const strap = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.01, 0.8),
        Materials.rubber()
      );
      strap.position.y = -0.085;
      group.add(strap);

      setShadows(group);
      return group;
    },
    snapPosition: { x: 0, y: 1, z: 0 },
    snapRotation: { x: 0, y: 0, z: 0, w: 1 },
    colliderType: 'cuboid',
    colliderArgs: [1.0, 0.15, 1.0],
    mass: 3.0,
    spawnOffset: { x: 0, y: 1, z: 0 },
  });

  // ===== MOTORS 1–4 =====
  ARM_ANGLE_OFFSETS.forEach((offset, i) => {
    parts.push({
      id: `motor${i + 1}`,
      label: `Motor ${i + 1}`,
      createMesh: () => {
        const group = new THREE.Group();

        // Stator base (dark metal)
        const stator = new THREE.Mesh(
          new THREE.CylinderGeometry(0.13, 0.14, 0.12, 24),
          Materials.metalDark()
        );
        stator.position.y = -0.02;
        group.add(stator);

        // Bell housing (silver, outer rotor)
        const bell = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.15, 0.14, 24),
          Materials.metalSilver()
        );
        bell.position.y = 0.09;
        group.add(bell);

        // Bell top cap
        const cap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.16, 0.02, 24),
          Materials.metalSilver()
        );
        cap.position.y = 0.17;
        group.add(cap);

        // Shaft
        const shaft = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.12, 12),
          Materials.metalSilver()
        );
        shaft.position.y = 0.24;
        group.add(shaft);

        // Windings visible at gap (copper ring)
        const winding = new THREE.Mesh(
          new THREE.TorusGeometry(0.12, 0.015, 12, 24),
          Materials.copper()
        );
        winding.rotation.x = Math.PI / 2;
        winding.position.y = 0.02;
        group.add(winding);

        // Base mounting plate
        const basePlate = new THREE.Mesh(
          new THREE.CylinderGeometry(0.17, 0.17, 0.02, 24),
          Materials.metalDark()
        );
        basePlate.position.y = -0.09;
        group.add(basePlate);

        // 3 motor wires
        const wireColors = [Materials.redWire(), Materials.blackWire(), Materials.yellowWire()];
        wireColors.forEach((mat, wi) => {
          const wire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.008, 0.25, 6),
            mat
          );
          wire.position.set(-0.06 + wi * 0.04, -0.2, 0);
          group.add(wire);
        });

        setShadows(group);
        return group;
      },
      snapPosition: { x: offset.x, y: 1.16, z: offset.z },
      snapRotation: { x: 0, y: 0, z: 0, w: 1 },
      colliderType: 'cylinder',
      colliderArgs: [0.16, 0.16],
      mass: 0.5,
      spawnOffset: { x: offset.x + (Math.random() - 0.5) * 2, y: 2 + Math.random() * 2, z: offset.z + (Math.random() - 0.5) * 2 },
    });
  });

  // ===== PROPELLERS 1–4 =====
  ARM_ANGLE_OFFSETS.forEach((offset, i) => {
    parts.push({
      id: `prop${i + 1}`,
      label: `Propeller ${i + 1}`,
      createMesh: () => {
        const group = new THREE.Group();
        const bladeMat = Materials.propBlade();

        // Hub center
        const hub = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16),
          Materials.metalDark()
        );
        group.add(hub);

        // Lock nut on top
        const nut = new THREE.Mesh(
          new THREE.CylinderGeometry(0.025, 0.025, 0.02, 8),
          Materials.metalSilver()
        );
        nut.position.y = 0.025;
        group.add(nut);

        // 2 blades — give them proper shape (wider at tip, tapered at root)
        for (let b = 0; b < 2; b++) {
          const bladeShape = new THREE.Shape();
          bladeShape.moveTo(0.03, -0.01);
          bladeShape.lineTo(0.42, -0.025);
          bladeShape.lineTo(0.44, 0);
          bladeShape.lineTo(0.42, 0.025);
          bladeShape.lineTo(0.03, 0.01);
          bladeShape.closePath();

          const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, {
            depth: 0.008,
            bevelEnabled: true,
            bevelThickness: 0.002,
            bevelSize: 0.002,
            bevelSegments: 1,
          });
          bladeGeo.center();

          const blade = new THREE.Mesh(bladeGeo, bladeMat);
          blade.rotation.y = b * Math.PI;
          blade.rotation.z = 0.04; // slight blade pitch
          group.add(blade);
        }

        group.userData.isProp = true;
        group.userData.spinSpeed = 0;

        setShadows(group);
        return group;
      },
      snapPosition: { x: offset.x, y: 1.44, z: offset.z },
      snapRotation: { x: 0, y: 0, z: 0, w: 1 },
      colliderType: 'cuboid',
      colliderArgs: [0.44, 0.02, 0.44],
      mass: 0.2,
      spawnOffset: { x: offset.x + (Math.random() - 0.5) * 3, y: 3 + Math.random() * 2, z: offset.z + (Math.random() - 0.5) * 3 },
    });
  });

  // ===== BATTERY =====
  parts.push({
    id: 'battery',
    label: 'Battery',
    createMesh: () => {
      const group = new THREE.Group();

      // Main battery body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.32, 0.45),
        Materials.batteryBlue()
      );
      group.add(body);

      // Rounded end caps (using cylinders)
      [-0.4, 0.4].forEach((xPos) => {
        const endCap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.16, 0.44, 16),
          Materials.batteryBlue()
        );
        endCap.rotation.z = Math.PI / 2;
        endCap.rotation.x = Math.PI / 2;
        endCap.position.x = xPos;
        group.add(endCap);
      });

      // Label strip
      const label = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.15, 0.46),
        Materials.batteryLabel()
      );
      label.position.y = 0.04;
      group.add(label);

      // XT60 connector
      const xt60 = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.1, 0.12),
        Materials.xt60Yellow()
      );
      xt60.position.set(0.42, -0.06, 0);
      group.add(xt60);

      // Balance lead connector
      const balanceLead = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.05, 0.06),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
      );
      balanceLead.position.set(0.42, 0.08, 0);
      group.add(balanceLead);

      // Power wires coming from XT60
      const redWire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.2, 6),
        Materials.redWire()
      );
      redWire.rotation.z = Math.PI / 2;
      redWire.position.set(0.52, -0.04, 0.02);
      group.add(redWire);

      const blackWire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.2, 6),
        Materials.blackWire()
      );
      blackWire.rotation.z = Math.PI / 2;
      blackWire.position.set(0.52, -0.08, 0.02);
      group.add(blackWire);

      setShadows(group);
      return group;
    },
    snapPosition: { x: 0, y: 0.7, z: 0 },
    snapRotation: { x: 0, y: 0, z: 0, w: 1 },
    colliderType: 'cuboid',
    colliderArgs: [0.44, 0.18, 0.25],
    mass: 1.5,
    spawnOffset: { x: 2.5, y: 1.5, z: 1 },
  });

  // ===== FLIGHT CONTROLLER =====
  parts.push({
    id: 'flightController',
    label: 'Flight Controller',
    createMesh: () => {
      const group = new THREE.Group();

      // Main PCB board
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.06, 0.52),
        Materials.pcbGreen()
      );
      group.add(board);

      // Circuit traces (subtle copper lines on top)
      for (let i = 0; i < 6; i++) {
        const trace = new THREE.Mesh(
          new THREE.BoxGeometry(0.5 - i * 0.06, 0.002, 0.004),
          Materials.copper()
        );
        trace.position.set(0, 0.032, -0.18 + i * 0.07);
        group.add(trace);
      }

      // Main processor chip
      const cpu = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.04, 0.13),
        Materials.chipBlack()
      );
      cpu.position.set(0, 0.05, 0);
      group.add(cpu);

      // Gyro/IMU chip
      const gyro = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.03, 0.08),
        Materials.chipBlack()
      );
      gyro.position.set(-0.15, 0.045, 0.05);
      group.add(gyro);

      // OSD chip
      const osd = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.025, 0.06),
        Materials.chipBlack()
      );
      osd.position.set(0.16, 0.043, -0.08);
      group.add(osd);

      // Capacitors (small cylinders)
      for (let i = 0; i < 3; i++) {
        const cap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.015, 0.04, 12),
          Materials.metalDark()
        );
        cap.position.set(0.2, 0.05, -0.1 + i * 0.08);
        group.add(cap);
      }

      // Pin headers (rows of gold pins)
      [-0.25, 0.25].forEach((xPos) => {
        const pinHeader = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.06, 0.18),
          new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 })
        );
        pinHeader.position.set(xPos, 0.03, 0.12);
        group.add(pinHeader);

        // Gold pins
        for (let p = 0; p < 5; p++) {
          const pin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.004, 0.004, 0.08, 4),
            Materials.goldPin()
          );
          pin.position.set(xPos, 0, 0.06 + p * 0.03);
          group.add(pin);
        }
      });

      // USB port
      const usb = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.03, 0.04),
        Materials.metalSilver()
      );
      usb.position.set(0, 0.04, -0.28);
      group.add(usb);

      // LED indicators
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 10, 10),
        Materials.ledGreen()
      );
      led.position.set(0.18, 0.04, 0.16);
      group.add(led);

      // Mounting holes (visual)
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const hole = new THREE.Mesh(
          new THREE.TorusGeometry(0.018, 0.004, 8, 16),
          Materials.metalSilver()
        );
        hole.rotation.x = Math.PI / 2;
        hole.position.set(Math.cos(angle) * 0.22, 0.032, Math.sin(angle) * 0.22);
        group.add(hole);
      }

      setShadows(group);
      return group;
    },
    snapPosition: { x: 0, y: 1.12, z: 0 },
    snapRotation: { x: 0, y: 0, z: 0, w: 1 },
    colliderType: 'cuboid',
    colliderArgs: [0.31, 0.04, 0.26],
    mass: 0.3,
    spawnOffset: { x: -2.5, y: 2, z: -1 },
  });

  // ===== CAMERA MODULE =====
  parts.push({
    id: 'camera',
    label: 'Camera Module',
    createMesh: () => {
      const group = new THREE.Group();

      // Camera body (main housing)
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.2, 0.16),
        Materials.carbonFiber()
      );
      group.add(body);

      // Lens barrel (cylinder)
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.09, 0.12, 24),
        Materials.metalDark()
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.z = 0.14;
      group.add(barrel);

      // Lens glass (sphere front)
      const lens = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        Materials.lensGlass()
      );
      lens.rotation.x = -Math.PI / 2;
      lens.position.z = 0.19;
      group.add(lens);

      // Lens ring (accent)
      const lensRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.075, 0.008, 12, 24),
        Materials.metalSilver()
      );
      lensRing.rotation.x = Math.PI / 2;
      lensRing.position.z = 0.14;
      group.add(lensRing);

      // Mount bracket (L-shaped using two boxes)
      const bracketV = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.26, 0.08),
        Materials.metalSilver()
      );
      bracketV.position.set(-0.115, 0, -0.04);
      group.add(bracketV);

      const bracketV2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.26, 0.08),
        Materials.metalSilver()
      );
      bracketV2.position.set(0.115, 0, -0.04);
      group.add(bracketV2);

      // Mounting screws on sides
      [-0.12, 0.12].forEach((xPos) => {
        const screw = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.012, 0.04, 6),
          Materials.metalSilver()
        );
        screw.rotation.z = Math.PI / 2;
        screw.position.set(xPos, 0.06, -0.04);
        group.add(screw);
      });

      // Video cable
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.15, 6),
        Materials.blackWire()
      );
      cable.position.set(0, -0.12, -0.04);
      group.add(cable);

      setShadows(group);
      return group;
    },
    snapPosition: { x: 0, y: 0.88, z: 0.52 },
    snapRotation: { x: 0, y: 0, z: 0, w: 1 },
    colliderType: 'cuboid',
    colliderArgs: [0.12, 0.13, 0.15],
    mass: 0.2,
    spawnOffset: { x: -1, y: 2.5, z: 2 },
  });

  // ===== ESC (Electronic Speed Controller) =====
  parts.push({
    id: 'esc',
    label: 'ESC (4-in-1)',
    createMesh: () => {
      const group = new THREE.Group();

      // Main PCB
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.04, 0.52),
        Materials.pcbGreen()
      );
      group.add(board);

      // Large MOSFETs (power transistors)
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
          const mosfet = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.025, 0.05),
            Materials.chipBlack()
          );
          mosfet.position.set(-0.15 + col * 0.1, 0.032, -0.12 + row * 0.24);
          group.add(mosfet);
        }
      }

      // Electrolytic capacitor (big cylinder)
      const bigCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.1, 12),
        Materials.metalDark()
      );
      bigCap.position.set(0.18, 0.07, 0.14);
      group.add(bigCap);

      // Current sense resistors (small)
      for (let i = 0; i < 4; i++) {
        const resistor = new THREE.Mesh(
          new THREE.BoxGeometry(0.03, 0.015, 0.05),
          Materials.metalDark()
        );
        resistor.position.set(-0.15 + i * 0.1, 0.03, 0.06);
        group.add(resistor);
      }

      // Motor output solder pads (4 sets × 3 wires)
      for (let m = 0; m < 4; m++) {
        const angle = (m / 4) * Math.PI * 2 + Math.PI / 4;
        const r = 0.2;
        for (let w = 0; w < 3; w++) {
          const pad = new THREE.Mesh(
            new THREE.CylinderGeometry(0.012, 0.012, 0.006, 8),
            Materials.goldPin()
          );
          pad.position.set(Math.cos(angle) * r + (w - 1) * 0.025, 0.024, Math.sin(angle) * r);
          group.add(pad);
        }
      }

      // Power input pads
      const positivePad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.006, 8),
        Materials.redWire()
      );
      positivePad.position.set(-0.2, 0.024, -0.2);
      group.add(positivePad);

      const negativePad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.006, 8),
        Materials.blackWire()
      );
      negativePad.position.set(-0.15, 0.024, -0.2);
      group.add(negativePad);

      // Signal connector
      const signalConn = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.04, 0.03),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
      );
      signalConn.position.set(0.2, 0.04, -0.2);
      group.add(signalConn);

      // Copper traces
      for (let i = 0; i < 4; i++) {
        const trace = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.002, 0.006),
          Materials.copper()
        );
        trace.position.set(0, 0.022, -0.1 + i * 0.065);
        group.add(trace);
      }

      setShadows(group);
      return group;
    },
    snapPosition: { x: 0, y: 1.06, z: 0 },
    snapRotation: { x: 0, y: 0, z: 0, w: 1 },
    colliderType: 'cuboid',
    colliderArgs: [0.26, 0.03, 0.26],
    mass: 0.25,
    spawnOffset: { x: 3, y: 2, z: -1.5 },
  });

  // ===== VTX (Video Transmitter) =====
  parts.push({
    id: 'vtx',
    label: 'Video Transmitter',
    createMesh: () => {
      const group = new THREE.Group();

      // Main PCB board
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.04, 0.25),
        Materials.pcbGreen()
      );
      group.add(board);

      // RF shielding can
      const shield = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.06, 0.12),
        Materials.metalSilver()
      );
      shield.position.set(-0.04, 0.04, 0);
      group.add(shield);

      // Power amplifier chip
      const pa = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.02, 0.05),
        Materials.chipBlack()
      );
      pa.position.set(0.1, 0.03, 0.04);
      group.add(pa);

      // SMA antenna connector (metallic cylinder)
      const smaBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.03, 12),
        Materials.goldPin()
      );
      smaBase.position.set(0.16, 0.04, 0);
      group.add(smaBase);

      const smaPin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.04, 6),
        Materials.goldPin()
      );
      smaPin.position.set(0.16, 0.07, 0);
      group.add(smaPin);

      // Button (channel/power selector)
      const btn = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.015, 8),
        new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5, metalness: 0.3 })
      );
      btn.position.set(-0.12, 0.04, 0.08);
      group.add(btn);

      // Status LED
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.008, 8, 8),
        Materials.ledGreen()
      );
      led.position.set(-0.12, 0.035, -0.06);
      group.add(led);

      // Wire harness
      const wire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, 0.15, 6),
        Materials.blackWire()
      );
      wire.rotation.z = Math.PI / 2;
      wire.position.set(-0.24, 0, 0);
      group.add(wire);

      setShadows(group);
      return group;
    },
    snapPosition: { x: 0, y: 1.18, z: -0.3 },
    snapRotation: { x: 0, y: 0, z: 0, w: 1 },
    colliderType: 'cuboid',
    colliderArgs: [0.18, 0.04, 0.13],
    mass: 0.12,
    spawnOffset: { x: -3, y: 2, z: 1.5 },
  });

  // ===== GPS MODULE =====
  parts.push({
    id: 'gps',
    label: 'GPS Module',
    createMesh: () => {
      const group = new THREE.Group();

      // Ceramic patch antenna (white square)
      const patch = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.03, 0.28),
        new THREE.MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.7, metalness: 0.0 })
      );
      patch.position.y = 0.04;
      group.add(patch);

      // PCB underneath
      const pcb = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.02, 0.32),
        Materials.pcbGreen()
      );
      group.add(pcb);

      // Ground plane (slightly larger, metallic)
      const groundPlane = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.004, 0.34),
        Materials.metalSilver()
      );
      groundPlane.position.y = -0.012;
      group.add(groundPlane);

      // GPS receiver chip
      const chip = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.015, 0.06),
        Materials.chipBlack()
      );
      chip.position.set(0, -0.018, 0);
      group.add(chip);

      // Crystal oscillator
      const crystal = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.012, 0.02),
        Materials.metalSilver()
      );
      crystal.position.set(0.08, -0.018, 0.06);
      group.add(crystal);

      // Mast/pole
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.018, 0.3, 8),
        Materials.metalDark()
      );
      mast.position.y = -0.16;
      group.add(mast);

      // Connector cable
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6),
        Materials.blackWire()
      );
      cable.position.set(0, -0.32, 0);
      group.add(cable);

      // Connector plug
      const plug = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.015, 0.025),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
      );
      plug.position.set(0, -0.42, 0);
      group.add(plug);

      setShadows(group);
      return group;
    },
    snapPosition: { x: 0, y: 1.5, z: 0 },
    snapRotation: { x: 0, y: 0, z: 0, w: 1 },
    colliderType: 'cuboid',
    colliderArgs: [0.17, 0.22, 0.17],
    mass: 0.15,
    spawnOffset: { x: 2, y: 3, z: 2 },
  });

  // ===== ANTENNA (5.8GHz Pagoda / LHCP) =====
  parts.push({
    id: 'antenna',
    label: 'Antenna (5.8 GHz)',
    createMesh: () => {
      const group = new THREE.Group();

      // SMA connector base (gold)
      const smaBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.04, 12),
        Materials.goldPin()
      );
      smaBase.position.y = -0.02;
      group.add(smaBase);

      // SMA hex nut
      const nut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.01, 6),
        Materials.goldPin()
      );
      nut.position.y = 0.01;
      group.add(nut);

      // Antenna stem (coax)
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.3, 8),
        Materials.metalSilver()
      );
      stem.position.y = 0.17;
      group.add(stem);

      // Pagoda radiating elements (2 PCB discs)
      const disc1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.008, 16),
        Materials.pcbGreen()
      );
      disc1.position.y = 0.25;
      group.add(disc1);

      const disc2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.008, 16),
        Materials.pcbGreen()
      );
      disc2.position.y = 0.3;
      group.add(disc2);

      // Protective housing (translucent tube)
      const housing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.035, 0.32, 12),
        new THREE.MeshStandardMaterial({
          color: 0xaaaaaa,
          roughness: 0.4,
          metalness: 0.0,
          transparent: true,
          opacity: 0.3,
        })
      );
      housing.position.y = 0.17;
      group.add(housing);

      // Tip cap
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 12, 8),
        new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6 })
      );
      tip.position.y = 0.34;
      group.add(tip);

      setShadows(group);
      return group;
    },
    snapPosition: { x: 0.2, y: 1.3, z: -0.4 },
    snapRotation: { x: 0, y: 0, z: 0, w: 1 },
    colliderType: 'cylinder',
    colliderArgs: [0.06, 0.2],
    mass: 0.05,
    spawnOffset: { x: -2, y: 3, z: -2 },
  });

  return parts;
}
