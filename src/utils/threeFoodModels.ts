import * as THREE from 'three';

// Procedural materials and texture helpers
const textureLoader = new THREE.TextureLoader();

// Helper to create a procedural noise bump canvas texture
function createNoiseTexture(color1: string, color2: string, spots = 40): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color1;
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < spots; i++) {
    ctx.fillStyle = color2;
    ctx.beginPath();
    ctx.arc(
      Math.random() * 256,
      Math.random() * 256,
      Math.random() * 8 + 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 1. CRISPY FRIED CHICKEN BUCKET & DRUMSTICKS
export function createCrispyChickenBucket(): THREE.Group {
  const group = new THREE.Group();

  // Serving Tray / Plate (Matte dark ceramic)
  const trayGeo = new THREE.CylinderGeometry(2.4, 2.2, 0.15, 48);
  const trayMat = new THREE.MeshStandardMaterial({
    color: 0x1f1f1f,
    roughness: 0.4,
    metalness: 0.1
  });
  const tray = new THREE.Mesh(trayGeo, trayMat);
  tray.receiveShadow = true;
  group.add(tray);

  // Red Chicken Bucket with Firey Treat branding stripe
  const bucketGeo = new THREE.CylinderGeometry(1.3, 0.95, 1.8, 32, 1, true);
  const bucketMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626, // Vivid Red
    roughness: 0.35,
    metalness: 0.15,
    side: THREE.DoubleSide
  });
  const bucket = new THREE.Mesh(bucketGeo, bucketMat);
  bucket.position.set(-0.35, 1.0, -0.2);
  bucket.castShadow = true;
  bucket.receiveShadow = true;
  group.add(bucket);

  // Bucket Base bottom disk
  const bucketBottomGeo = new THREE.CircleGeometry(0.95, 32);
  const bucketBottom = new THREE.Mesh(bucketBottomGeo, bucketMat);
  bucketBottom.rotation.x = Math.PI / 2;
  bucketBottom.position.set(-0.35, 0.1, -0.2);
  group.add(bucketBottom);

  // Golden Branding Stripe around bucket
  const stripeGeo = new THREE.CylinderGeometry(1.25, 1.15, 0.4, 32, 1, true);
  const stripeMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Amber Gold
    roughness: 0.25,
    metalness: 0.6,
    side: THREE.DoubleSide
  });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.position.set(-0.35, 1.05, -0.2);
  group.add(stripe);

  // Crunchy Batter Material (Golden crunchy brown with roughness)
  const batterTexture = createNoiseTexture('#b45309', '#78350f', 60);
  const crunchyMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.85,
    metalness: 0.05,
    bumpMap: batterTexture,
    bumpScale: 0.08
  });

  // Bone material (Off-white ivory)
  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.3,
    metalness: 0.05
  });

  // Helper to build a composite chicken drumstick
  const createDrumstick = () => {
    const ds = new THREE.Group();
    // Meaty part
    const meatGeo = new THREE.DodecahedronGeometry(0.55, 1);
    meatGeo.scale(1.0, 1.35, 0.85);
    const meat = new THREE.Mesh(meatGeo, crunchyMat);
    meat.castShadow = true;
    ds.add(meat);

    // Bone stem
    const boneStemGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 12);
    const boneStem = new THREE.Mesh(boneStemGeo, boneMat);
    boneStem.position.y = -0.55;
    boneStem.castShadow = true;
    ds.add(boneStem);

    // Bone Knuckle joint (2 small spheres)
    const k1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), boneMat);
    k1.position.set(0.07, -0.85, 0);
    const k2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), boneMat);
    k2.position.set(-0.07, -0.85, 0);
    ds.add(k1);
    ds.add(k2);

    return ds;
  };

  // Drumstick 1 (tilted inside bucket)
  const d1 = createDrumstick();
  d1.position.set(-0.35, 1.65, -0.15);
  d1.rotation.set(0.3, 0.2, 0.4);
  d1.scale.set(0.85, 0.85, 0.85);
  group.add(d1);

  // Drumstick 2 (sticking out top)
  const d2 = createDrumstick();
  d2.position.set(-0.15, 1.7, -0.3);
  d2.rotation.set(-0.4, -0.3, -0.3);
  d2.scale.set(0.8, 0.8, 0.8);
  group.add(d2);

  // Drumstick 3 (resting on plate outside bucket)
  const d3 = createDrumstick();
  d3.position.set(0.9, 0.35, 0.45);
  d3.rotation.set(Math.PI / 2, 0, -0.5);
  d3.scale.set(0.95, 0.95, 0.95);
  group.add(d3);

  // Crispy Chicken Popcorn / Nuggets scattered on plate
  const nuggetGeo = new THREE.DodecahedronGeometry(0.22, 1);
  for (let i = 0; i < 5; i++) {
    const nugget = new THREE.Mesh(nuggetGeo, crunchyMat);
    const angle = i * 0.9 + 0.3;
    const radius = 1.35 + (i % 2) * 0.2;
    nugget.position.set(
      Math.cos(angle) * radius,
      0.22,
      Math.sin(angle) * radius
    );
    nugget.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    nugget.scale.set(
      0.8 + Math.random() * 0.4,
      0.7 + Math.random() * 0.3,
      0.9 + Math.random() * 0.3
    );
    nugget.castShadow = true;
    group.add(nugget);
  }

  // Dip Sauce Cup (Creamy Garlic Mayo with mint sprinkle)
  const cupGeo = new THREE.CylinderGeometry(0.42, 0.3, 0.35, 24);
  const cupMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0.05
  });
  const cup = new THREE.Mesh(cupGeo, cupMat);
  cup.position.set(0.65, 0.25, -1.0);
  cup.castShadow = true;
  group.add(cup);

  const sauceGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.05, 24);
  const sauceMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a, // Garlic Mayo Pale Gold
    roughness: 0.3,
    metalness: 0.0
  });
  const sauce = new THREE.Mesh(sauceGeo, sauceMat);
  sauce.position.set(0.65, 0.4, -1.0);
  group.add(sauce);

  return group;
}

// 2. DUM BIRYANI IN TRADITIONAL CLAY HANDI
export function createDumBiryaniHandi(): THREE.Group {
  const group = new THREE.Group();

  // Wooden Table Platter Base
  const baseGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.12, 48);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x451a03, // Rich walnut wood
    roughness: 0.6,
    metalness: 0.05
  });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.receiveShadow = true;
  group.add(base);

  // Terracotta Handi Clay Pot
  const clayMat = new THREE.MeshStandardMaterial({
    color: 0x9a3412, // Earthen terracotta orange-brown
    roughness: 0.8,
    metalness: 0.05
  });

  // Pot Body using LatheGeometry for authentic traditional Indian shape
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(0.8, 0));
  points.push(new THREE.Vector2(1.2, 0.4));
  points.push(new THREE.Vector2(1.35, 0.9));
  points.push(new THREE.Vector2(1.2, 1.4));
  points.push(new THREE.Vector2(0.95, 1.6));
  points.push(new THREE.Vector2(1.15, 1.75)); // Flared lip
  const handiGeo = new THREE.LatheGeometry(points, 32);
  const handi = new THREE.Mesh(handiGeo, clayMat);
  handi.position.y = 0.08;
  handi.castShadow = true;
  handi.receiveShadow = true;
  group.add(handi);

  // Dough Dum Seal (Wheat dough ring around pot neck)
  const sealGeo = new THREE.TorusGeometry(1.05, 0.09, 12, 32);
  const sealMat = new THREE.MeshStandardMaterial({
    color: 0xfde047, // Dough yellow
    roughness: 0.7,
    metalness: 0.0
  });
  const seal = new THREE.Mesh(sealGeo, sealMat);
  seal.rotation.x = Math.PI / 2;
  seal.position.y = 1.65;
  group.add(seal);

  // Fragrant Saffron Basmati Rice Mound inside Handi
  const riceGeo = new THREE.SphereGeometry(0.95, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
  const riceTex = createNoiseTexture('#fbbf24', '#fef08a', 80);
  const riceMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Saffron & White Basmati Rice
    roughness: 0.8,
    metalness: 0.0,
    bumpMap: riceTex,
    bumpScale: 0.05
  });
  const rice = new THREE.Mesh(riceGeo, riceMat);
  rice.position.y = 1.45;
  rice.castShadow = true;
  group.add(rice);

  // Chicken Drumstick emerging from Biryani
  const boneMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 });
  const meatMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });

  const meat = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4, 1), meatMat);
  meat.scale.set(1.0, 1.3, 0.9);
  meat.position.set(0.1, 1.8, 0.1);
  meat.rotation.set(0.3, 0.4, 0.5);
  meat.castShadow = true;
  group.add(meat);

  const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 10), boneMat);
  bone.position.set(0.35, 2.1, 0.25);
  bone.rotation.set(0.3, 0.4, 0.5);
  bone.castShadow = true;
  group.add(bone);

  // Fresh Mint / Coriander Leaves Garnish
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x15803d, // Fresh emerald green
    roughness: 0.5,
    side: THREE.DoubleSide
  });
  const leafGeo = new THREE.ConeGeometry(0.12, 0.28, 5);
  leafGeo.scale(1, 0.3, 1);
  for (let i = 0; i < 4; i++) {
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(
      Math.cos(i * 1.5) * 0.45,
      1.82 + (i % 2) * 0.05,
      Math.sin(i * 1.5) * 0.45
    );
    leaf.rotation.set(0.4, i * 1.2, 0.3);
    group.add(leaf);
  }

  // Caramelized Browned Onions (Birista) strings
  const onionMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  for (let i = 0; i < 6; i++) {
    const o = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.2), onionMat);
    o.position.set(
      Math.sin(i * 1.1) * 0.5,
      1.83,
      Math.cos(i * 1.1) * 0.5
    );
    o.rotation.y = Math.random() * Math.PI;
    group.add(o);
  }

  // Raitha Bowl on the side
  const raithaBowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.35, 0.3, 24),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
  );
  raithaBowl.position.set(1.4, 0.2, 0.4);
  raithaBowl.castShadow = true;
  group.add(raithaBowl);

  const curd = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.04, 24),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
  );
  curd.position.set(1.4, 0.34, 0.4);
  group.add(curd);

  return group;
}

// 3. GOURMET JUICY BURGER WITH MELTED CHEESE
export function createGourmetBurger(): THREE.Group {
  const group = new THREE.Group();

  // Ceramic Plate
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.0, 0.15, 48),
    new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.3, metalness: 0.1 })
  );
  plate.receiveShadow = true;
  group.add(plate);

  // Bun Material (Golden Brioche gloss)
  const bunMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // Brioche Bun Golden
    roughness: 0.5,
    metalness: 0.05
  });

  // Bottom Bun
  const bottomBun = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.15, 0.35, 32),
    bunMat
  );
  bottomBun.position.y = 0.25;
  bottomBun.castShadow = true;
  group.add(bottomBun);

  // Flame-Grilled Patty
  const pattyMat = new THREE.MeshStandardMaterial({
    color: 0x3f2010, // Charred dark grilled beef/chicken
    roughness: 0.9,
    metalness: 0.0
  });
  const patty = new THREE.Mesh(
    new THREE.CylinderGeometry(1.28, 1.25, 0.38, 32),
    pattyMat
  );
  patty.position.y = 0.6;
  patty.castShadow = true;
  group.add(patty);

  // Melted Cheddar Cheese Layer (Square with dripping corners)
  const cheeseMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Vibrant melted cheddar
    roughness: 0.2,
    metalness: 0.05
  });
  const cheese = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.06, 1.5),
    cheeseMat
  );
  cheese.position.y = 0.82;
  cheese.rotation.y = Math.PI / 4;
  cheese.castShadow = true;
  group.add(cheese);

  // Wavy Crispy Green Lettuce
  const lettuceMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e, // Fresh Lettuce green
    roughness: 0.6,
    side: THREE.DoubleSide
  });
  const lettuceGeo = new THREE.TorusGeometry(1.15, 0.14, 8, 24);
  const lettuce = new THREE.Mesh(lettuceGeo, lettuceMat);
  lettuce.rotation.x = Math.PI / 2;
  lettuce.position.y = 0.94;
  group.add(lettuce);

  // Juicy Ripe Tomato Slices (2 slices)
  const tomatoMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626, // Bright ripe tomato
    roughness: 0.25,
    metalness: 0.1
  });
  const t1 = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.1, 24), tomatoMat);
  t1.position.set(-0.35, 1.08, 0.1);
  t1.castShadow = true;
  group.add(t1);

  const t2 = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.1, 24), tomatoMat);
  t2.position.set(0.35, 1.08, -0.1);
  t2.castShadow = true;
  group.add(t2);

  // Top Bun Crown (Golden Brioche dome)
  const topBunGeo = new THREE.SphereGeometry(1.26, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  topBunGeo.scale(1, 0.75, 1);
  const topBun = new THREE.Mesh(topBunGeo, bunMat);
  topBun.position.y = 1.15;
  topBun.castShadow = true;
  group.add(topBun);

  // Sesame Seeds on Top Bun
  const sesameMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 });
  const seedGeo = new THREE.ConeGeometry(0.035, 0.08, 6);
  seedGeo.scale(1, 0.4, 1);
  for (let i = 0; i < 35; i++) {
    const seed = new THREE.Mesh(seedGeo, sesameMat);
    const phi = Math.random() * Math.PI * 0.4;
    const theta = Math.random() * Math.PI * 2;
    const r = 1.24;
    seed.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      1.15 + r * Math.cos(phi) * 0.75,
      r * Math.sin(phi) * Math.sin(theta)
    );
    seed.rotation.set(phi, theta, Math.random());
    group.add(seed);
  }

  // Golden French Fries on the plate side
  const fryMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.5 });
  const fryGeo = new THREE.BoxGeometry(0.1, 0.1, 0.85);
  for (let i = 0; i < 9; i++) {
    const fry = new THREE.Mesh(fryGeo, fryMat);
    fry.position.set(
      -1.4 + (i % 3) * 0.2 + (Math.random() - 0.5) * 0.1,
      0.15 + Math.floor(i / 3) * 0.09,
      0.7 + (i % 3) * 0.2
    );
    fry.rotation.set(0.1, Math.random() * 0.8 - 0.4, 0.05);
    fry.castShadow = true;
    group.add(fry);
  }

  return group;
}

// 4. SIZZLING THUNDER WINGS PLATTER
export function createThunderWingsPlatter(): THREE.Group {
  const group = new THREE.Group();

  // Wooden Sizzler Underliner Base
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.7 });
  const woodBase = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.14, 2.2),
    woodMat
  );
  woodBase.receiveShadow = true;
  group.add(woodBase);

  // Cast Iron Skillet Plate
  const ironMat = new THREE.MeshStandardMaterial({
    color: 0x1e1e1e,
    roughness: 0.8,
    metalness: 0.4
  });
  const ironPlate = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.2, 0.1, 32),
    ironMat
  );
  ironPlate.position.set(-0.25, 0.12, 0);
  ironPlate.receiveShadow = true;
  group.add(ironPlate);

  // Skillet Handle
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.8, 12),
    ironMat
  );
  handle.rotation.z = Math.PI / 2;
  handle.position.set(-1.8, 0.12, 0);
  group.add(handle);

  // Fiery Glazed Chicken Wings (Spicy Red glaze)
  const glazeTexture = createNoiseTexture('#dc2626', '#7f1d1d', 50);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c, // Fiery red glazed wing
    roughness: 0.25,
    metalness: 0.15,
    bumpMap: glazeTexture,
    bumpScale: 0.06
  });

  const createWing = () => {
    const wg = new THREE.Group();
    // Segment 1 (drumette)
    const s1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.45, 8, 12), wingMat);
    s1.rotation.z = 0.5;
    s1.castShadow = true;
    wg.add(s1);

    // Segment 2 (wingette / flat)
    const s2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.4, 8, 12), wingMat);
    s2.position.set(0.35, 0.2, 0);
    s2.rotation.z = -0.6;
    s2.castShadow = true;
    wg.add(s2);

    return wg;
  };

  // 4 Wings arranged sizzling on iron plate
  const positions = [
    [-0.55, 0.3, -0.4, 0.3],
    [0.1, 0.32, -0.3, -0.4],
    [-0.45, 0.31, 0.35, 1.1],
    [0.15, 0.33, 0.3, -1.2]
  ];

  positions.forEach(([x, y, z, rot]) => {
    const w = createWing();
    w.position.set(x, y, z);
    w.rotation.y = rot;
    w.scale.set(0.9, 0.9, 0.9);
    group.add(w);
  });

  // Lemon Wedge garnish
  const lemonMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
  const lemon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16, 1, false, 0, Math.PI),
    lemonMat
  );
  lemon.position.set(0.75, 0.25, -0.7);
  lemon.rotation.set(Math.PI / 2, 0, 0.4);
  group.add(lemon);

  // Mint / Garlic Mayo Dip in white ramekin
  const ramekin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.3, 0.3, 24),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
  );
  ramekin.position.set(1.1, 0.22, 0.35);
  ramekin.castShadow = true;
  group.add(ramekin);

  const whiteDip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, 0.03, 24),
    new THREE.MeshStandardMaterial({ color: 0xecfdf5, roughness: 0.3 })
  );
  whiteDip.position.set(1.1, 0.35, 0.35);
  group.add(whiteDip);

  return group;
}

// 5. STEAMED MOMOS IN BAMBOO STEAMER BASKET
export function createSteamedMomosBasket(): THREE.Group {
  const group = new THREE.Group();

  // Dark Serving Board
  const board = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.2, 0.12, 48),
    new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.5 })
  );
  board.receiveShadow = true;
  group.add(board);

  // Bamboo Steamer Basket Material
  const bambooMat = new THREE.MeshStandardMaterial({
    color: 0xd4a373, // Natural bamboo tan
    roughness: 0.7,
    metalness: 0.05
  });

  // Outer Bamboo Rim
  const basketRim = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.55, 0.8, 32, 1, true),
    bambooMat
  );
  basketRim.position.y = 0.48;
  basketRim.castShadow = true;
  group.add(basketRim);

  // Steamer Slats Floor
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xc89666, roughness: 0.8 });
  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 0.08, 32),
    floorMat
  );
  floor.position.y = 0.2;
  group.add(floor);

  // Steamed Momos Dough (Translucent pearly white)
  const momoMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.05
  });

  const createMomo = () => {
    const mg = new THREE.Group();
    // Dumpling base pouch
    const pouch = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.7),
      momoMat
    );
    pouch.scale.set(1, 0.85, 1);
    pouch.castShadow = true;
    mg.add(pouch);

    // Pinched pleated top knot
    const knot = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.16, 8),
      momoMat
    );
    knot.position.y = 0.28;
    knot.castShadow = true;
    mg.add(knot);

    return mg;
  };

  // 5 Momos arranged in a ring
  for (let i = 0; i < 5; i++) {
    const m = createMomo();
    const angle = (i * Math.PI * 2) / 5;
    m.position.set(
      Math.cos(angle) * 0.85,
      0.35,
      Math.sin(angle) * 0.85
    );
    m.rotation.y = angle + Math.PI / 2;
    group.add(m);
  }

  // Spicy Schezwan Red Chili Dip Bowl in center
  const dipBowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.32, 0.26, 24),
    new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.2 })
  );
  dipBowl.position.y = 0.32;
  dipBowl.castShadow = true;
  group.add(dipBowl);

  const spicyRedChutney = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.38, 0.04, 24),
    new THREE.MeshStandardMaterial({
      color: 0xef4444, // Vibrant schezwan red
      roughness: 0.15,
      metalness: 0.1
    })
  );
  spicyRedChutney.position.y = 0.43;
  group.add(spicyRedChutney);

  return group;
}

// Food Model Catalog Mapping
export type FoodModelKey = 
  | 'crispy_chicken' 
  | 'biryani' 
  | 'burger' 
  | 'wings' 
  | 'momos';

export interface FoodModelMeta {
  key: FoodModelKey;
  name: string;
  subtitle: string;
  price: number;
  category: string;
  isVeg: boolean;
  spiceLevel: number;
  badge: string;
  createModel: () => THREE.Group;
}

export const FOOD_3D_CATALOG: Record<FoodModelKey, FoodModelMeta> = {
  crispy_chicken: {
    key: 'crispy_chicken',
    name: 'Crispy Fried Chicken Bucket',
    subtitle: 'Signature golden crunchy fry with bone knuckle & garlic mayo dip',
    price: 189,
    category: 'Crispy Fried Chicken',
    isVeg: false,
    spiceLevel: 2,
    badge: 'Best Seller',
    createModel: createCrispyChickenBucket
  },
  biryani: {
    key: 'biryani',
    name: 'Special Chicken Dum Biryani',
    subtitle: '100% Basmathi rice sealed with dum, saffron spices & mint leaves',
    price: 120,
    category: 'Basmathi Biryani',
    isVeg: false,
    spiceLevel: 3,
    badge: 'Chef Special',
    createModel: createDumBiryaniHandi
  },
  burger: {
    key: 'burger',
    name: 'Gourmet Double Tandoori Burger',
    subtitle: 'Brioche sesame bun, charred patty, melted cheddar drip & fries',
    price: 99,
    category: 'Burgers',
    isVeg: false,
    spiceLevel: 2,
    badge: 'Hot Deal',
    createModel: createGourmetBurger
  },
  wings: {
    key: 'wings',
    name: 'Fiery Thunder Wings Platter',
    subtitle: 'Sizzling skillet glazed with peri-peri red buffalo sauce & lemon',
    price: 140,
    category: 'Thunder Wings',
    isVeg: false,
    spiceLevel: 3,
    badge: 'Sizzling Hit',
    createModel: createThunderWingsPlatter
  },
  momos: {
    key: 'momos',
    name: 'Steamed Chicken Momos Basket',
    subtitle: 'Authentic bamboo steamer with 5 pleated dumplings & schezwan dip',
    price: 80,
    category: 'Momos Special',
    isVeg: false,
    spiceLevel: 2,
    badge: 'Steam Hot',
    createModel: createSteamedMomosBasket
  }
};
