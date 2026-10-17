import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { 
  FOOD_3D_CATALOG, 
  FoodModelKey, 
  FoodModelMeta 
} from '../utils/threeFoodModels';
import { 
  Rotate3d, 
  Sparkles, 
  Sun, 
  Flame, 
  Plus, 
  Maximize2,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { MenuItem } from '../types';

interface ThreeDishStageProps {
  initialDishKey?: FoodModelKey;
  onAddToCart?: (item: MenuItem) => void;
  onOpenFullStudio?: (dishKey: FoodModelKey) => void;
  heightClass?: string;
  className?: string;
  menuItems?: MenuItem[];
}

export const ThreeDishStage: React.FC<ThreeDishStageProps> = ({
  initialDishKey = 'crispy_chicken',
  onAddToCart,
  onOpenFullStudio,
  heightClass = 'h-72 sm:h-84 md:h-96',
  className = '',
  menuItems = []
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentKey, setCurrentKey] = useState<FoodModelKey>(initialDishKey);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [hasSteam, setHasSteam] = useState(true);
  const [ambiance, setAmbiance] = useState<'restaurant' | 'sunset' | 'studio'>('restaurant');
  const [isDragging, setIsDragging] = useState(false);

  // References for Three.js state across renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const currentDishGroupRef = useRef<THREE.Group | null>(null);
  const steamParticlesRef = useRef<THREE.Points | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);

  const rotTargetRef = useRef<{ x: number; y: number }>({ x: 0.35, y: -0.4 });
  const rotCurrentRef = useRef<{ x: number; y: number }>({ x: 0.35, y: -0.4 });
  const mousePrevRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const activeDishMeta: FoodModelMeta = FOOD_3D_CATALOG[currentKey];

  // Map to real menu item if available
  const matchedMenuItem: MenuItem = menuItems.find(
    (m) => m.name.toLowerCase().includes(activeDishMeta.name.toLowerCase().split(' ')[0])
  ) || {
    id: `3d-${currentKey}`,
    name: activeDishMeta.name,
    category: 'crispy_chicken',
    price: activeDishMeta.price,
    isVeg: activeDishMeta.isVeg,
    spiceLevel: activeDishMeta.spiceLevel as 1 | 2 | 3,
    description: activeDishMeta.subtitle,
    inStock: true,
    image: '',
    tags: [activeDishMeta.badge]
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer Setup
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(0, 2.5, 4.8);
    camera.lookAt(0, 0.65, 0);

    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // 2. Room Environment Reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x1c1917, 0.9);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    keyLight.position.set(3.5, 5.0, 3.5);
    keyLight.castShadow = !isHeadless;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.8);
    rimLight.position.set(-3.5, 4.0, -3.0);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // 4. Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext('2d')!;
    const grad = sctx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.8
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.02;
    scene.add(shadowPlane);

    // 5. Steam Particle System
    const steamCount = 35;
    const steamGeo = new THREE.BufferGeometry();
    const steamPositions = new Float32Array(steamCount * 3);
    const steamLifes = new Float32Array(steamCount);

    for (let i = 0; i < steamCount; i++) {
      steamPositions[i * 3] = (Math.random() - 0.5) * 0.8;
      steamPositions[i * 3 + 1] = 0.6 + Math.random() * 1.5;
      steamPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
      steamLifes[i] = Math.random();
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));

    // Procedural steam soft puff sprite
    const steamCanvas = document.createElement('canvas');
    steamCanvas.width = 64;
    steamCanvas.height = 64;
    const pctx = steamCanvas.getContext('2d')!;
    const pgrad = pctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    pgrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    pgrad.addColorStop(0.4, 'rgba(255, 245, 230, 0.2)');
    pgrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    pctx.fillStyle = pgrad;
    pctx.fillRect(0, 0, 64, 64);
    const steamTexture = new THREE.CanvasTexture(steamCanvas);

    const steamMat = new THREE.PointsMaterial({
      size: 0.5,
      map: steamTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.4
    });
    const steamParticles = new THREE.Points(steamGeo, steamMat);
    scene.add(steamParticles);
    steamParticlesRef.current = steamParticles;

    // 6. Load Initial Food Model
    const dishGroup = FOOD_3D_CATALOG[currentKey].createModel();
    scene.add(dishGroup);
    currentDishGroupRef.current = dishGroup;

    // 7. Animation Loop with Exponential Damping & Clock
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth Auto-Rotation or manual rotation damping
      if (isAutoRotate && !isDragging) {
        rotTargetRef.current.y += delta * 0.6;
      }

      // Smooth exponential damping
      rotCurrentRef.current.y = THREE.MathUtils.damp(
        rotCurrentRef.current.y,
        rotTargetRef.current.y,
        8,
        delta
      );
      rotCurrentRef.current.x = THREE.MathUtils.damp(
        rotCurrentRef.current.x,
        rotTargetRef.current.x,
        8,
        delta
      );

      if (currentDishGroupRef.current) {
        currentDishGroupRef.current.rotation.y = rotCurrentRef.current.y;
        currentDishGroupRef.current.rotation.x = rotCurrentRef.current.x * 0.4;
      }

      // Update Steam Wisps
      if (steamParticlesRef.current && hasSteam) {
        steamParticlesRef.current.visible = true;
        const posAttr = steamGeo.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;

        for (let i = 0; i < steamCount; i++) {
          arr[i * 3 + 1] += delta * 0.5; // Rise up
          arr[i * 3] += Math.sin(clock.elapsedTime * 2 + i) * 0.003; // Drift

          if (arr[i * 3 + 1] > 2.2) {
            arr[i * 3 + 1] = 0.6;
            arr[i * 3] = (Math.random() - 0.5) * 0.7;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 0.7;
          }
        }
        posAttr.needsUpdate = true;
      } else if (steamParticlesRef.current) {
        steamParticlesRef.current.visible = false;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      shadowTex.dispose();
      steamTexture.dispose();
      steamGeo.dispose();
      steamMat.dispose();
    };
  }, []);

  // Update Food Model on key change
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (currentDishGroupRef.current) {
      scene.remove(currentDishGroupRef.current);
      // Traverse and dispose geometries and materials
      currentDishGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else if (child.material) {
            child.material.dispose();
          }
        }
      });
    }

    const newModel = FOOD_3D_CATALOG[currentKey].createModel();
    scene.add(newModel);
    currentDishGroupRef.current = newModel;
  }, [currentKey]);

  // Update Lighting Ambiance
  useEffect(() => {
    if (!keyLightRef.current || !hemiLightRef.current || !rimLightRef.current) return;
    if (ambiance === 'restaurant') {
      hemiLightRef.current.color.setHex(0xffedd5);
      keyLightRef.current.color.setHex(0xfff7ed);
      keyLightRef.current.intensity = 2.2;
      rimLightRef.current.color.setHex(0xf59e0b);
    } else if (ambiance === 'sunset') {
      hemiLightRef.current.color.setHex(0xfdba74);
      keyLightRef.current.color.setHex(0xf97316);
      keyLightRef.current.intensity = 2.6;
      rimLightRef.current.color.setHex(0xef4444);
    } else {
      // Crisp Studio
      hemiLightRef.current.color.setHex(0xffffff);
      keyLightRef.current.color.setHex(0xffffff);
      keyLightRef.current.intensity = 2.0;
      rimLightRef.current.color.setHex(0x93c5fd);
    }
  }, [ambiance]);

  // Pointer Drag Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    mousePrevRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - mousePrevRef.current.x;
    const dy = e.clientY - mousePrevRef.current.y;
    mousePrevRef.current = { x: e.clientX, y: e.clientY };

    rotTargetRef.current.y += dx * 0.008;
    rotTargetRef.current.x = Math.max(-0.4, Math.min(0.8, rotTargetRef.current.x + dy * 0.008));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className={`relative rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 overflow-hidden shadow-2xl flex flex-col justify-between ${className}`}>
      
      {/* Top Header / 3D Mode Banner */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950/90 border border-amber-500/40 text-amber-300 text-xs font-bold backdrop-blur-md shadow pointer-events-auto">
          <Rotate3d className="w-3.5 h-3.5 text-amber-400" />
          <span>3D Food Studio</span>
          <span className="text-[10px] text-neutral-400 font-normal">| 360° Drag to Spin</span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {onOpenFullStudio && (
            <button
              type="button"
              onClick={() => onOpenFullStudio(currentKey)}
              className="p-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 backdrop-blur-md transition-all cursor-pointer shadow"
              title="Open Fullscreen 3D Studio"
            >
              <Maximize2 className="w-4 h-4 text-amber-400" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              rotTargetRef.current = { x: 0.35, y: -0.4 };
            }}
            className="p-1.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 backdrop-blur-md transition-all cursor-pointer shadow"
            title="Reset 3D View"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`w-full ${heightClass} cursor-grab active:cursor-grabbing relative select-none touch-none`}
      />

      {/* Dish Name & Specs Overlay (Bottom Left of 3D Canvas) */}
      <div className="px-4 py-2 flex items-center justify-between gap-2 border-t border-neutral-800/80 bg-neutral-950/70 backdrop-blur-sm z-10">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-base sm:text-lg text-white truncate">
              {activeDishMeta.name}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-extrabold text-[10px] border border-amber-500/30">
              {activeDishMeta.badge}
            </span>
          </div>
          <p className="text-xs text-neutral-400 truncate pt-0.5">
            {activeDishMeta.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-neutral-500 font-semibold uppercase block">Price</span>
            <span className="font-display font-black text-lg text-amber-400">₹{activeDishMeta.price}</span>
          </div>

          {onAddToCart && (
            <button
              type="button"
              onClick={() => onAddToCart(matchedMenuItem)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-red-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Horizontal Dock: Dish Switcher Chips & Ambiance Controls */}
      <div className="p-3 bg-neutral-950 border-t border-neutral-800/80 space-y-2 z-10">
        {/* Dish Switcher Ribbon */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-neutral-800">
          {(Object.keys(FOOD_3D_CATALOG) as FoodModelKey[]).map((key) => {
            const meta = FOOD_3D_CATALOG[key];
            const isSelected = currentKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setCurrentKey(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-neutral-950 shadow-md ring-2 ring-amber-400/30 scale-102'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                }`}
              >
                <span>
                  {key === 'crispy_chicken' && '🍗'}
                  {key === 'biryani' && '🍲'}
                  {key === 'burger' && '🍔'}
                  {key === 'wings' && '🌶️'}
                  {key === 'momos' && '🥟'}
                </span>
                <span>{meta.name.split(' ')[0]} {meta.name.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* 3D Visual Customizer (Auto-Rotate, Steam, Light Ambiance) */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-900">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={isAutoRotate}
                onChange={(e) => setIsAutoRotate(e.target.checked)}
                className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
              />
              <span>Auto-Rotate</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={hasSteam}
                onChange={(e) => setHasSteam(e.target.checked)}
                className="rounded border-neutral-700 text-amber-500 focus:ring-amber-500"
              />
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Sizzling Steam</span>
            </label>
          </div>

          {/* Lighting Ambiance Selector */}
          <div className="flex items-center gap-1 bg-neutral-900 px-2 py-0.5 rounded-lg border border-neutral-800">
            <Sun className="w-3 h-3 text-amber-400" />
            <select
              value={ambiance}
              onChange={(e) => setAmbiance(e.target.value as any)}
              className="bg-transparent text-[11px] text-neutral-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="restaurant" className="bg-neutral-900">Warm Diner</option>
              <option value="sunset" className="bg-neutral-900">Golden Sunset</option>
              <option value="studio" className="bg-neutral-900">Bright Studio</option>
            </select>
          </div>
        </div>
      </div>

    </div>
  );
};
