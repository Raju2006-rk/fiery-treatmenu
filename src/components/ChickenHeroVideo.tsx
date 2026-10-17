import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { 
  Sparkles, 
  Flame, 
  Rotate3d, 
  Video, 
  Play, 
  Pause, 
  Plus, 
  Check, 
  Maximize2, 
  Minimize2,
  Volume2,
  VolumeX,
  Compass,
  Info
} from 'lucide-react';
import { MenuItem } from '../types';
import imgCrispyPoster from '../assets/images/crispy_fried_chicken_1789393849879.jpg';

interface ChickenHeroVideoProps {
  onAddToCart: (item: MenuItem) => void;
  onExploreMenu: () => void;
}

export const ChickenHeroVideo: React.FC<ChickenHeroVideoProps> = ({
  onAddToCart,
  onExploreMenu,
}) => {
  const [viewMode, setViewMode] = useState<'3d' | 'video'>('3d');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isAdded, setIsAdded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default featured 3D Bucket dish item
  const bucketItem: MenuItem = {
    id: 'cfc-bucket-10pcs',
    name: '3D Crispy Mega Bucket (10 Pcs Drumsticks & Wings)',
    category: 'fried_chicken',
    price: 449,
    isVeg: false,
    spiceLevel: 2,
    description: '10 Pieces of golden ultra-crunchy fried chicken drumsticks and wings bursting with fiery marinade, served with 2 signature dips.',
    inStock: true,
    image: imgCrispyPoster,
    isBestseller: true,
    isSpecial: true,
    tags: ['Mega Bucket', '10 Pcs', 'Chef Special'],
  };

  const handleOrderBucket = () => {
    onAddToCart(bucketItem);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  };

  // Three.js 3D Interactive Bucket & Orbiting Chicken Pieces
  useEffect(() => {
    if (viewMode !== '3d' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.parentElement?.clientWidth || 540;
    const height = canvas.parentElement?.clientHeight || 460;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 7.8);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;

    // 2. Lighting Setup (Dramatic Black & Fiery Orange Rim Lighting)
    const ambientLight = new THREE.AmbientLight(0x221105, 1.6);
    scene.add(ambientLight);

    // Warm Key Light from Top Right
    const keyLight = new THREE.DirectionalLight(0xffddaa, 3.2);
    keyLight.position.set(5, 7, 5);
    scene.add(keyLight);

    // Intense Fiery Orange Rim Light from Behind / Bottom Left
    const fieryRimLight = new THREE.PointLight(0xf97316, 5.5, 14);
    fieryRimLight.position.set(-4, -1, -2.5);
    scene.add(fieryRimLight);

    // Golden Yellow Rim Highlight
    const goldRimLight = new THREE.PointLight(0xfbbf24, 4.0, 12);
    goldRimLight.position.set(3.5, 3.5, -3);
    scene.add(goldRimLight);

    // Front soft fill
    const fillLight = new THREE.DirectionalLight(0xff6622, 1.2);
    fillLight.position.set(0, -2, 4);
    scene.add(fillLight);

    // 3. Procedural Noise Bump Texture for Crunchy Batter
    const createBreadingTexture = () => {
      const cvs = document.createElement('canvas');
      cvs.width = 256;
      cvs.height = 256;
      const ctx = cvs.getContext('2d')!;
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 90; i++) {
        ctx.fillStyle = Math.random() > 0.4 ? '#78350f' : '#d97706';
        ctx.beginPath();
        ctx.arc(Math.random() * 256, Math.random() * 256, Math.random() * 6 + 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(cvs);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      return tex;
    };

    const breadingTex = createBreadingTexture();

    // Crispy Chicken Material with physical roughness & golden gloss
    const crispyMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.8,
      metalness: 0.1,
      bumpMap: breadingTex,
      bumpScale: 0.12,
    });

    const boneMaterial = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      roughness: 0.35,
      metalness: 0.05,
    });

    // Helper: Build a realistic drumstick mesh
    const createDrumstickMesh = () => {
      const pieceGroup = new THREE.Group();

      // Meat Head (tapered egg/sphere geometry)
      const headGeo = new THREE.SphereGeometry(0.55, 24, 20);
      headGeo.scale(1, 1.35, 0.9);
      const headMesh = new THREE.Mesh(headGeo, crispyMaterial);
      headMesh.position.y = 0.4;
      pieceGroup.add(headMesh);

      // Crunchy Crumb Flakes bumps
      for (let b = 0; b < 7; b++) {
        const flakeGeo = new THREE.DodecahedronGeometry(0.12, 0);
        const flake = new THREE.Mesh(flakeGeo, crispyMaterial);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        flake.position.set(
          Math.sin(phi) * Math.cos(theta) * 0.55,
          0.3 + Math.cos(phi) * 0.55,
          Math.sin(phi) * Math.sin(theta) * 0.5
        );
        flake.rotation.set(Math.random(), Math.random(), Math.random());
        pieceGroup.add(flake);
      }

      // Bone Shaft
      const boneGeo = new THREE.CylinderGeometry(0.09, 0.1, 0.7, 16);
      const boneMesh = new THREE.Mesh(boneGeo, boneMaterial);
      boneMesh.position.y = -0.35;
      pieceGroup.add(boneMesh);

      // Bone Knuckles
      const knuckle1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), boneMaterial);
      knuckle1.position.set(0.08, -0.7, 0);
      const knuckle2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), boneMaterial);
      knuckle2.position.set(-0.08, -0.7, 0);
      pieceGroup.add(knuckle1, knuckle2);

      return pieceGroup;
    };

    // 4. Central 3D Restaurant Bucket
    const bucketRoot = new THREE.Group();
    scene.add(bucketRoot);

    // Deep Dark Ceramic Serving Platter
    const platterGeo = new THREE.CylinderGeometry(2.6, 2.4, 0.15, 48);
    const platterMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.35,
      metalness: 0.2,
    });
    const platter = new THREE.Mesh(platterGeo, platterMat);
    platter.position.y = -1.25;
    bucketRoot.add(platter);

    // Firey Treat Iconic Striped Bucket Body
    const bucketGeo = new THREE.CylinderGeometry(1.5, 1.15, 2.1, 40, 1, true);
    
    // Create bucket stripe canvas texture
    const bucketCanvas = document.createElement('canvas');
    bucketCanvas.width = 512;
    bucketCanvas.height = 256;
    const bCtx = bucketCanvas.getContext('2d')!;
    bCtx.fillStyle = '#dc2626'; // Red
    bCtx.fillRect(0, 0, 512, 256);
    bCtx.fillStyle = '#ffffff'; // White stripes
    for (let s = 0; s < 512; s += 64) {
      bCtx.fillRect(s, 0, 32, 256);
    }
    // Gold Trim Lines
    bCtx.fillStyle = '#f59e0b';
    bCtx.fillRect(0, 0, 512, 22);
    bCtx.fillRect(0, 234, 512, 22);
    // Center Emblem Ribbon
    bCtx.fillStyle = '#171717';
    bCtx.fillRect(0, 96, 512, 64);
    bCtx.fillStyle = '#fbbf24';
    bCtx.font = 'bold 26px sans-serif';
    bCtx.textAlign = 'center';
    bCtx.fillText('FIREY TREAT • CRISPY FRY', 256, 138);

    const bucketTexture = new THREE.CanvasTexture(bucketCanvas);
    bucketTexture.wrapS = THREE.RepeatWrapping;
    bucketTexture.wrapT = THREE.ClampToEdgeWrapping;

    const bucketMat = new THREE.MeshStandardMaterial({
      map: bucketTexture,
      roughness: 0.3,
      metalness: 0.15,
      side: THREE.DoubleSide,
    });

    const bucketMesh = new THREE.Mesh(bucketGeo, bucketMat);
    bucketMesh.position.y = -0.15;
    bucketRoot.add(bucketMesh);

    // Bucket Bottom
    const bucketBottom = new THREE.Mesh(
      new THREE.CircleGeometry(1.15, 36),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 })
    );
    bucketBottom.rotation.x = Math.PI / 2;
    bucketBottom.position.y = -1.2;
    bucketRoot.add(bucketBottom);

    // Inside Fill of Overflowing Drumsticks inside bucket
    for (let c = 0; c < 5; c++) {
      const insideDrum = createDrumstickMesh();
      const angle = (c / 5) * Math.PI * 2;
      insideDrum.position.set(Math.cos(angle) * 0.65, 0.6 + (c % 2) * 0.25, Math.sin(angle) * 0.65);
      insideDrum.rotation.set(0.4, angle, -0.3);
      insideDrum.scale.setScalar(0.95);
      bucketRoot.add(insideDrum);
    }
    // Center Top Crown Drumstick
    const centerDrum = createDrumstickMesh();
    centerDrum.position.set(0, 1.1, 0);
    centerDrum.rotation.set(0.2, 0.5, 0.1);
    centerDrum.scale.setScalar(1.05);
    bucketRoot.add(centerDrum);

    // 5. Individual Orbiting Chicken Drumsticks Rotating in 3D around the bucket
    const orbitingGroup = new THREE.Group();
    scene.add(orbitingGroup);

    interface OrbitingPiece {
      mesh: THREE.Group;
      radius: number;
      speed: number;
      angle: number;
      yOffset: number;
      rotSpeedX: number;
      rotSpeedY: number;
    }

    const orbitingPieces: OrbitingPiece[] = [];
    const orbitRadii = [2.6, 2.9, 2.7, 3.1];
    const orbitSpeeds = [0.45, -0.38, 0.52, -0.42];

    for (let i = 0; i < 4; i++) {
      const piece = createDrumstickMesh();
      const initialAngle = (i / 4) * Math.PI * 2;
      piece.scale.setScalar(0.85 + (i % 2) * 0.15);
      orbitingGroup.add(piece);

      orbitingPieces.push({
        mesh: piece,
        radius: orbitRadii[i],
        speed: orbitSpeeds[i],
        angle: initialAngle,
        yOffset: -0.2 + (i % 3) * 0.6,
        rotSpeedX: 0.6 + Math.random() * 0.5,
        rotSpeedY: 0.8 + Math.random() * 0.6,
      });
    }

    // 6. Floating Crunchy Golden Crumbs
    const crumbCount = 65;
    const crumbGeo = new THREE.BufferGeometry();
    const crumbPositions = new Float32Array(crumbCount * 3);
    const crumbVelocities: { x: number; y: number; z: number }[] = [];

    for (let k = 0; k < crumbCount; k++) {
      crumbPositions[k * 3] = (Math.random() - 0.5) * 6;
      crumbPositions[k * 3 + 1] = Math.random() * 4 - 1.5;
      crumbPositions[k * 3 + 2] = (Math.random() - 0.5) * 5;
      crumbVelocities.push({
        x: (Math.random() - 0.5) * 0.15,
        y: -0.15 - Math.random() * 0.25,
        z: (Math.random() - 0.5) * 0.15,
      });
    }
    crumbGeo.setAttribute('position', new THREE.BufferAttribute(crumbPositions, 3));

    const crumbMat = new THREE.PointsMaterial({
      size: 0.12,
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.85,
    });
    const crumbParticles = new THREE.Points(crumbGeo, crumbMat);
    scene.add(crumbParticles);

    // 7. Rising Steam Wisps (Soft glowing warm particles)
    const steamCount = 35;
    const steamGeo = new THREE.BufferGeometry();
    const steamPositions = new Float32Array(steamCount * 3);
    for (let s = 0; s < steamCount; s++) {
      steamPositions[s * 3] = (Math.random() - 0.5) * 1.8;
      steamPositions[s * 3 + 1] = 0.8 + Math.random() * 3.5;
      steamPositions[s * 3 + 2] = (Math.random() - 0.5) * 1.8;
    }
    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));

    const steamMat = new THREE.PointsMaterial({
      size: 0.32,
      color: 0xffedd5,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const steamParticles = new THREE.Points(steamGeo, steamMat);
    scene.add(steamParticles);

    // 8. Animation & Mouse Parallax Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Slow elegant bucket spin
      bucketRoot.rotation.y += delta * 0.35;

      // Mouse Parallax reaction
      bucketRoot.rotation.x = THREE.MathUtils.lerp(bucketRoot.rotation.x, mousePos.y * 0.25, 0.05);
      bucketRoot.position.x = THREE.MathUtils.lerp(bucketRoot.position.x, mousePos.x * 0.4, 0.05);

      // Orbiting chicken pieces around bucket
      orbitingPieces.forEach((piece, index) => {
        piece.angle += delta * piece.speed;
        const curRadius = piece.radius + Math.sin(elapsed * 1.5 + index) * 0.2;
        piece.mesh.position.x = Math.cos(piece.angle) * curRadius;
        piece.mesh.position.z = Math.sin(piece.angle) * curRadius;
        piece.mesh.position.y = piece.yOffset + Math.sin(elapsed * 2 + index * 1.5) * 0.35;

        piece.mesh.rotation.x += delta * piece.rotSpeedX;
        piece.mesh.rotation.y += delta * piece.rotSpeedY;
      });

      // Animate falling golden crumbs
      const cPositions = crumbGeo.attributes.position as THREE.BufferAttribute;
      const cArr = cPositions.array as Float32Array;
      for (let k = 0; k < crumbCount; k++) {
        cArr[k * 3 + 1] += crumbVelocities[k].y * delta;
        cArr[k * 3] += crumbVelocities[k].x * delta;
        if (cArr[k * 3 + 1] < -1.8) {
          cArr[k * 3 + 1] = 2.5 + Math.random();
          cArr[k * 3] = (Math.random() - 0.5) * 4;
          cArr[k * 3 + 2] = (Math.random() - 0.5) * 4;
        }
      }
      cPositions.needsUpdate = true;

      // Animate rising steam
      const sPositions = steamGeo.attributes.position as THREE.BufferAttribute;
      const sArr = sPositions.array as Float32Array;
      for (let s = 0; s < steamCount; s++) {
        sArr[s * 3 + 1] += delta * 0.45;
        sArr[s * 3] += Math.sin(elapsed * 2 + s) * delta * 0.12;
        if (sArr[s * 3 + 1] > 4.2) {
          sArr[s * 3 + 1] = 0.8;
          sArr[s * 3] = (Math.random() - 0.5) * 1.4;
          sArr[s * 3 + 2] = (Math.random() - 0.5) * 1.4;
        }
      }
      sPositions.needsUpdate = true;

      renderer.render(scene, camera);
    };

    render();

    // Resize Handler
    const handleResize = () => {
      if (!canvas.parentElement) return;
      const w = canvas.parentElement.clientWidth;
      const h = canvas.parentElement.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      breadingTex.dispose();
      bucketTexture.dispose();
      crumbGeo.dispose();
      crumbMat.dispose();
      steamGeo.dispose();
      steamMat.dispose();
    };
  }, [viewMode, mousePos]);

  // Mouse Parallax Track
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: nx, y: ny });
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full rounded-3xl bg-neutral-950/95 border border-amber-500/30 shadow-2xl shadow-orange-950/60 overflow-hidden flex flex-col justify-between transition-all duration-300 ${
        isExpanded ? 'lg:col-span-12 fixed inset-4 z-50 bg-black/95' : ''
      }`}
    >
      {/* Cinematic Studio Glow Ambience */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/20 via-red-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-orange-600/15 via-amber-700/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="relative z-20 px-4 py-3 sm:px-5 sm:py-3.5 border-b border-neutral-800/80 flex items-center justify-between gap-3 bg-neutral-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-display font-black text-xs sm:text-sm tracking-wider text-white uppercase">
            {viewMode === '3d' ? 'Interactive 3D Chicken Bucket' : 'Cinematic 8s Food Loop'}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
            Realtime Experience
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === '3d'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">3D Model</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('video')}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === 'video'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Video Loop</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display Area */}
      <div className="relative w-full h-80 sm:h-96 md:h-[420px] flex items-center justify-center overflow-hidden bg-radial from-neutral-900 via-neutral-950 to-black">
        
        {/* VIEW MODE 1: Interactive 3D WebGL Canvas */}
        {viewMode === '3d' && (
          <div className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
            <canvas ref={canvasRef} className="w-full h-full block" />
            
            {/* 3D Orbit Help Badge */}
            <div className="absolute bottom-3 left-4 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-neutral-800 text-[11px] text-neutral-300">
              <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Move mouse to explore 3D rim lighting &amp; orbiting chicken</span>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: Cinematic Video with Graceful Fallback */}
        {viewMode === 'video' && (
          <div className="relative w-full h-full">
            {/* HTML5 Video element loading /videos/fiery-chicken-hero.mp4 */}
            <video
              ref={videoRef}
              src="/videos/fiery-chicken-hero.mp4"
              poster="/images/hero-chicken-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              onLoadedData={() => {
                setVideoLoaded(true);
                setVideoError(false);
              }}
              onError={() => {
                setVideoError(true);
                setVideoLoaded(false);
              }}
              className="w-full h-full object-cover"
            />

            {/* Poster Fallback if video is not yet placed */}
            {videoError && (
              <div className="absolute inset-0">
                <img
                  src="/images/hero-chicken-poster.jpg"
                  alt="Golden Crispy Fried Chicken Bucket"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-amber-500/30 text-xs text-neutral-200 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white">Cinematic Video Slot Ready</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Place your generated 8-second commercial loop at <code className="text-amber-300 bg-neutral-900 px-1 py-0.5 rounded">public/videos/fiery-chicken-hero.mp4</code>. Showing high-resolution crispy chicken fallback.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Video Controls Overlay */}
            {!videoError && (
              <div className="absolute bottom-3 right-4 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-neutral-800 transition-colors"
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="p-2 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-neutral-800 transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Dish Highlights Pill */}
        <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md bg-red-600/90 text-white font-black text-[11px] uppercase tracking-wider backdrop-blur-md shadow-md">
            Crispy Mega Bucket
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-500 text-neutral-950 font-black text-[11px] backdrop-blur-md shadow-md">
            ₹449 (10 Pcs)
          </span>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="relative z-20 px-4 py-3 sm:px-5 sm:py-4 border-t border-neutral-800/80 bg-neutral-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-white text-sm sm:text-base">
              Crispy Mega Bucket (10 Pcs)
            </span>
            <span className="text-amber-400 font-bold text-sm">₹449</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Freshly seasoned wings &amp; drumsticks • Includes 2 free dips • Dispatched piping hot
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onExploreMenu}
            className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-bold transition-colors cursor-pointer text-center"
          >
            Full Menu
          </button>
          
          <button
            type="button"
            onClick={handleOrderBucket}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg ${
              isAdded
                ? 'bg-emerald-500 text-neutral-950 scale-105'
                : 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white hover:scale-105 shadow-red-950/60'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Bucket Added!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add 3D Bucket to Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
