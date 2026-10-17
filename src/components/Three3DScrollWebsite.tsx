import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { 
  FOOD_3D_CATALOG, 
  FoodModelKey, 
  createCrispyChickenBucket,
  createDumBiryaniHandi,
  createGourmetBurger,
  createThunderWingsPlatter,
  createSteamedMomosBasket
} from '../utils/threeFoodModels';
import { Three3DScrollHUD } from './Three3DScrollHUD';

interface Three3DScrollWebsiteProps {
  onAddToCart: (modelKey: FoodModelKey) => void;
  cartItemCount: number;
  onOpenCart: () => void;
}

export const Three3DScrollWebsite: React.FC<Three3DScrollWebsiteProps> = ({
  onAddToCart,
  cartItemCount,
  onOpenCart,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // State synchronized with HUD
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [activeModelKey, setActiveModelKey] = useState<FoodModelKey>('crispy_chicken');
  const [isOrbitMode, setIsOrbitMode] = useState(false);
  const [explodeAmount, setExplodeAmount] = useState(0);
  const [lightPreset, setLightPreset] = useState<'warm' | 'fire' | 'night'>('warm');

  // Mutable refs for animation loop
  const scrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const orbitModeRef = useRef(isOrbitMode);
  const explodeRef = useRef(explodeAmount);
  const lightPresetRef = useRef(lightPreset);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Sync state to refs
  useEffect(() => {
    orbitModeRef.current = isOrbitMode;
    if (controlsRef.current) {
      controlsRef.current.enabled = isOrbitMode;
    }
  }, [isOrbitMode]);

  useEffect(() => {
    explodeRef.current = explodeAmount;
  }, [explodeAmount]);

  useEffect(() => {
    lightPresetRef.current = lightPreset;
  }, [lightPreset]);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const progress = Math.min(Math.max(window.scrollY / totalScroll, 0), 1);
        targetScrollRef.current = progress;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize Three.js Scene, Camera, Models & Animation Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 7.5);

    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // 2. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enabled = false;
    controlsRef.current = controls;

    // 3. Studio Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffeedd, 0x111122, 1.3);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffaa44, 2.8);
    keyLight.position.set(6, 9, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x3388ff, 1.1);
    fillLight.position.set(-8, -4, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff6600, 1.8);
    rimLight.position.set(0, 5, -8);
    scene.add(rimLight);

    // 5. Contact Shadow Pedestal Base
    const pedestalGroup = new THREE.Group();
    scene.add(pedestalGroup);

    const pedestalGeo = new THREE.CylinderGeometry(2.8, 3.2, 0.4, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x171717,
      roughness: 0.25,
      metalness: 0.85,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.2;
    pedestal.receiveShadow = true;
    pedestalGroup.add(pedestal);

    // Glowing Amber Ring around Pedestal
    const ringGeo = new THREE.TorusGeometry(2.82, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    pedestalGroup.add(ring);

    // 6. Instantiate 5 Signature 3D Dish Models
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const mCrispyChicken = createCrispyChickenBucket();
    const mBiryani = createDumBiryaniHandi();
    const mBurger = createGourmetBurger();
    const mWings = createThunderWingsPlatter();
    const mMomos = createSteamedMomosBasket();

    // Position each dish in its stage layout
    const models: Record<FoodModelKey, THREE.Group> = {
      crispy_chicken: mCrispyChicken,
      biryani: mBiryani,
      burger: mBurger,
      wings: mWings,
      momos: mMomos,
    };

    Object.entries(models).forEach(([key, grp]) => {
      modelGroup.add(grp);
    });

    // 7. Procedural 3D Express Delivery Scooter Model (For Stage 4: 10 KM Radius)
    const scooterGroup = new THREE.Group();
    scene.add(scooterGroup);
    scooterGroup.position.set(0, -10, 0); // Initially hidden below stage

    // Scooter Base
    const scooterBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.5, 0.7),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3, metalness: 0.3 })
    );
    scooterBody.castShadow = true;
    scooterGroup.add(scooterBody);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.9 });
    
    const w1 = new THREE.Mesh(wheelGeo, wheelMat);
    w1.rotation.z = Math.PI / 2;
    w1.position.set(-0.6, -0.3, 0);
    w1.castShadow = true;
    scooterGroup.add(w1);

    const w2 = new THREE.Mesh(wheelGeo, wheelMat);
    w2.rotation.z = Math.PI / 2;
    w2.position.set(0.6, -0.3, 0);
    w2.castShadow = true;
    scooterGroup.add(w2);

    // Firey Treat Delivery Hot Box on Back
    const hotBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.75, 0.75),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.2 })
    );
    hotBox.position.set(-0.4, 0.55, 0);
    hotBox.castShadow = true;
    scooterGroup.add(hotBox);

    // Headlight Glow
    const headlight = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    headlight.position.set(0.8, 0.2, 0);
    scooterGroup.add(headlight);

    // 8. Floating Particles & Spice Embers
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 14;
      particlePos[i * 3 + 1] = Math.random() * 8 - 1;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Helper to explode burger layers vertically
    const applyBurgerExplosion = (amount: number) => {
      if (!mBurger) return;
      // Burger child meshes: 0:Plate, 1:BottomBun, 2:Patty, 3:Cheese, 4:Lettuce, 5:Tomato1, 6:Tomato2, 7:TopBun, 8...
      const children = mBurger.children;
      if (children.length >= 8) {
        children[1].position.y = 0.25 - amount * 0.1;
        children[2].position.y = 0.6 + amount * 0.25;
        children[3].position.y = 0.82 + amount * 0.55;
        children[4].position.y = 0.94 + amount * 0.85;
        children[5].position.y = 1.08 + amount * 1.15;
        children[6].position.y = 1.08 + amount * 1.15;
        children[7].position.y = 1.15 + amount * 1.6;
      }
    };

    // 9. Animation Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth damped scroll interpolation
      scrollRef.current = THREE.MathUtils.damp(scrollRef.current, targetScrollRef.current, 5, delta);
      const progress = scrollRef.current;

      setScrollProgress(progress);

      // Determine active phase (0 to 4)
      let phase = 0;
      let phaseModel: FoodModelKey = 'crispy_chicken';
      if (progress < 0.2) {
        phase = 0;
        phaseModel = 'crispy_chicken';
      } else if (progress < 0.4) {
        phase = 1;
        phaseModel = 'biryani';
      } else if (progress < 0.6) {
        phase = 2;
        phaseModel = 'burger';
      } else if (progress < 0.8) {
        phase = 3;
        phaseModel = 'wings';
      } else {
        phase = 4;
        phaseModel = 'momos';
      }

      setActivePhaseIndex(phase);
      setActiveModelKey(phaseModel);

      // Update Lighting Preset
      if (lightPresetRef.current === 'warm') {
        keyLight.color.setHex(0xffaa44);
        keyLight.intensity = 2.8;
        fillLight.color.setHex(0x3388ff);
        scene.fog!.color.setHex(0x0a0a0a);
      } else if (lightPresetRef.current === 'fire') {
        keyLight.color.setHex(0xef4444);
        keyLight.intensity = 3.5;
        fillLight.color.setHex(0xf59e0b);
        scene.fog!.color.setHex(0x1a0505);
      } else if (lightPresetRef.current === 'night') {
        keyLight.color.setHex(0x818cf8);
        keyLight.intensity = 2.0;
        fillLight.color.setHex(0xc084fc);
        scene.fog!.color.setHex(0x050515);
      }

      // If NOT in manual 360 Orbit Mode, drive camera and model transformations via scroll!
      if (!orbitModeRef.current) {
        // Smooth camera trajectory along 3D scroll spline
        const angle = progress * Math.PI * 2.5;
        const radius = 7.0 - Math.sin(progress * Math.PI) * 1.5;
        
        const camX = Math.sin(angle) * radius * 0.4;
        const camY = 1.2 + Math.cos(progress * Math.PI * 3) * 0.4;
        const camZ = radius;

        camera.position.x = THREE.MathUtils.damp(camera.position.x, camX, 4, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, camY, 4, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, camZ, 4, delta);

        camera.lookAt(0, 0.6, 0);
      } else {
        controls.update();
      }

      // Smoothly hide/show models based on active phase
      Object.entries(models).forEach(([key, modelGrp]) => {
        const isCurrent = key === phaseModel;
        const targetScale = isCurrent ? 1.0 : 0.001;
        const currentScale = modelGrp.scale.x;
        
        const newScale = THREE.MathUtils.damp(currentScale, targetScale, 6, delta);
        modelGrp.scale.setScalar(newScale);

        // Continuous subtle rotation for active model
        if (isCurrent && !orbitModeRef.current) {
          modelGrp.rotation.y += delta * 0.4;
          modelGrp.position.y = Math.sin(time * 1.5) * 0.08;
        }
      });

      // Handle Stage 4 Scooter animation
      if (phase === 3) {
        scooterGroup.position.y = THREE.MathUtils.damp(scooterGroup.position.y, 0.2, 5, delta);
        scooterGroup.position.x = Math.sin(time * 2) * 1.2;
        scooterGroup.rotation.y = Math.sin(time * 2) * 0.3 + Math.PI / 2;
        // Spin scooter wheels
        w1.rotation.x += delta * 10;
        w2.rotation.x += delta * 10;
      } else {
        scooterGroup.position.y = THREE.MathUtils.damp(scooterGroup.position.y, -10, 5, delta);
      }

      // Apply Exploded View on Burger
      applyBurgerExplosion(explodeRef.current);

      // Animate floating particles
      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3 + 1] += delta * 0.25;
        if (posArr[i * 3 + 1] > 7) posArr[i * 3 + 1] = -1;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  // Jump to specific scroll stage when user clicks HUD stage pill
  const handleJumpToStage = (stageIndex: number) => {
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targets = [0.05, 0.28, 0.5, 0.72, 0.95];
    const targetY = (targets[stageIndex] || 0) * totalScroll;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  return (
    <>
      {/* Fixed Fullscreen 3D Scroll Canvas */}
      <div
        ref={mountRef}
        className="fixed inset-0 z-0 pointer-events-none w-full h-full overflow-hidden"
      />

      {/* Floating Interactive 3D Scroll HUD */}
      <Three3DScrollHUD
        scrollProgress={scrollProgress}
        activePhaseIndex={activePhaseIndex}
        activeModelKey={activeModelKey}
        onSelectModel={setActiveModelKey}
        isOrbitMode={isOrbitMode}
        onToggleOrbitMode={setIsOrbitMode}
        explodeAmount={explodeAmount}
        onExplodeChange={setExplodeAmount}
        lightPreset={lightPreset}
        onChangeLightPreset={setLightPreset}
        onJumpToStage={handleJumpToStage}
        onAddToCart={onAddToCart}
        cartItemCount={cartItemCount}
        onOpenCart={onOpenCart}
      />
    </>
  );
};
