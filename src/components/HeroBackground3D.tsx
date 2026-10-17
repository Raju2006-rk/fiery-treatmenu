import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FOOD_3D_CATALOG, FoodModelKey } from '../utils/threeFoodModels';

export const HeroBackground3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 600;

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

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
    renderer.toneMappingExposure = 1.2;

    container.replaceChildren(renderer.domElement);

    // 2. Studio Environment Reflection Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xffeedd, 0x111122, 1.2);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffaa44, 2.5);
    keyLight.position.set(6, 8, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x3388ff, 1.2);
    fillLight.position.set(-8, -4, -4);
    scene.add(fillLight);

    // 4. Create Floating 3D Signature Dishes in Background
    const dishKeys: FoodModelKey[] = ['crispy_chicken', 'burger', 'wings', 'momos', 'biryani'];
    const floatingGroup = new THREE.Group();
    scene.add(floatingGroup);

    interface FloatingDish {
      group: THREE.Group;
      baseX: number;
      baseY: number;
      baseZ: number;
      rotSpeedX: number;
      rotSpeedY: number;
      bobSpeed: number;
      bobHeight: number;
      offset: number;
    }

    const floatingDishes: FloatingDish[] = [];

    // Array of initial positions for a balanced floating background
    const positions = [
      { x: -5.2, y: 1.8, z: -2, scale: 0.75 },  // Left Top (Crispy Chicken)
      { x: 5.4, y: 2.2, z: -1.5, scale: 0.8 },  // Right Top (Burger)
      { x: -4.8, y: -2.2, z: -3, scale: 0.65 }, // Left Bottom (Wings)
      { x: 4.8, y: -2.0, z: -2.5, scale: 0.7 }, // Right Bottom (Momos)
      { x: 0, y: 3.5, z: -4, scale: 0.6 },      // Top Center (Biryani Pot)
    ];

    dishKeys.forEach((key, index) => {
      const modelCreator = FOOD_3D_CATALOG[key]?.createModel;
      if (!modelCreator) return;

      const pos = positions[index] || { x: (index - 2) * 3, y: 0, z: -2, scale: 0.7 };
      const modelGroup = modelCreator();
      modelGroup.scale.setScalar(pos.scale);
      modelGroup.position.set(pos.x, pos.y, pos.z);

      floatingGroup.add(modelGroup);

      floatingDishes.push({
        group: modelGroup,
        baseX: pos.x,
        baseY: pos.y,
        baseZ: pos.z,
        rotSpeedX: (Math.random() - 0.5) * 0.8 + 0.3,
        rotSpeedY: (Math.random() - 0.5) * 0.8 + 0.5,
        bobSpeed: 1.2 + Math.random() * 0.8,
        bobHeight: 0.25 + Math.random() * 0.15,
        offset: Math.random() * Math.PI * 2,
      });
    });

    // 5. Floating Spices / Sparkles Particles
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 16;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Interactive Mouse & Gyro Movement
    const mouseTarget = { x: 0, y: 0 };
    const mouseCurrent = { x: 0, y: 0 };

    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseTarget.x = nx * 0.8;
      mouseTarget.y = ny * 0.5;
    };

    window.addEventListener('mousemove', handlePointerMove);

    // 7. Animation Loop with Exponential Damping
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Damped Mouse Parallax Effect
      mouseCurrent.x = THREE.MathUtils.damp(mouseCurrent.x, mouseTarget.x, 4, delta);
      mouseCurrent.y = THREE.MathUtils.damp(mouseCurrent.y, mouseTarget.y, 4, delta);

      floatingGroup.position.x = mouseCurrent.x * 0.8;
      floatingGroup.position.y = mouseCurrent.y * 0.5;
      floatingGroup.rotation.y = mouseCurrent.x * 0.15;
      floatingGroup.rotation.x = -mouseCurrent.y * 0.1;

      // Animate floating dishes
      floatingDishes.forEach((item) => {
        item.group.rotation.y += delta * item.rotSpeedY;
        item.group.rotation.x += delta * item.rotSpeedX * 0.5;
        item.group.position.y = item.baseY + Math.sin(time * item.bobSpeed + item.offset) * item.bobHeight;
        item.group.position.x = item.baseX + Math.cos(time * item.bobSpeed * 0.7 + item.offset) * 0.1;
      });

      // Animate floating particles
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        arr[i * 3 + 1] += delta * 0.15;
        if (arr[i * 3 + 1] > 5) arr[i * 3 + 1] = -5;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Listener
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 600;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      floatingGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else if (child.material) {
            child.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 z-0 pointer-events-none opacity-40 sm:opacity-60 transition-opacity overflow-hidden"
    />
  );
};
