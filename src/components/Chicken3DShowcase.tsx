import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  Layers, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  Plus, 
  ShoppingBag, 
  Check, 
  Eye, 
  Info,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { FireyTreatLogo } from './FireyTreatLogo';
import { MenuItem } from '../types';

interface Chicken3DShowcaseProps {
  onAddToCart?: (item: MenuItem) => void;
}

export const Chicken3DShowcase: React.FC<Chicken3DShowcaseProps> = ({ onAddToCart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'all' | 'drumsticks' | 'embers' | 'specs'>('all');
  const [isAdded, setIsAdded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Auto slow rotation when idle
  useEffect(() => {
    if (!autoRotate || isHovered) return;
    const interval = setInterval(() => {
      setRotateY((prev) => (prev >= 360 ? 0 : prev + 0.6));
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate, isHovered]);

  // Handle 3D mouse parallax move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setAutoRotate(false);
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Limit rotation angle for natural 3D depth
    const maxAngle = 18;
    const rotX = -(y / (rect.height / 2)) * maxAngle;
    const rotY = (x / (rect.width / 2)) * maxAngle;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setAutoRotate(true);
  };

  const bucketDish: MenuItem = {
    id: 'cfc-bucket-10pcs',
    name: '3D Crispy Mega Bucket (10 Pcs Drumsticks & Wings)',
    category: 'fried_chicken',
    price: 449,
    isVeg: false,
    spiceLevel: 2,
    description: '10 Pieces of ultra-crunchy, juicy golden fried chicken drumsticks and wings bursting with secret fiery spices, served with 2 complimentary dips.',
    inStock: true,
    image: '/firey_treat_logo.svg',
    isBestseller: true,
    isSpecial: true,
    tags: ['Mega Bucket', '3D Showcase', 'Chef Special']
  };

  const handleQuickAdd = () => {
    if (onAddToCart) {
      onAddToCart(bucketDish);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2200);
    }
  };

  return (
    <div className="relative w-full rounded-3xl bg-neutral-950/90 border border-neutral-800/90 p-4 sm:p-5 shadow-2xl overflow-hidden group">
      
      {/* Background Ambient Glow matching the video */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/15 via-red-950/20 to-transparent pointer-events-none -z-10" />

      {/* Header bar */}
      <div className="flex items-center justify-between mb-3 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm text-white uppercase tracking-wider">
                Customer 3D View
              </span>
              <span className="bg-amber-500 text-neutral-950 text-[10px] font-black px-1.5 py-0.5 rounded shadow">
                INTERACTIVE
              </span>
            </div>
            <p className="text-[10px] text-neutral-400">
              Drag or move cursor to inspect in 360° 3D depth
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              autoRotate 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'bg-neutral-800 text-neutral-400'
            }`}
            title="Toggle 3D Auto Spin"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            <span className="text-[10px] hidden sm:inline">Spin</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
            title="Full Screen 3D Inspection"
            aria-label="Expand 3D View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3D Viewport Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative h-64 sm:h-72 w-full rounded-2xl bg-gradient-to-b from-neutral-900/90 via-black to-neutral-950 border border-neutral-800 flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden"
        style={{ perspective: '1100px' }}
      >
        {/* Floating Embers in 3D */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-2 h-2 rounded-full bg-amber-400 blur-[1px] top-1/4 left-1/4 animate-ping opacity-60" />
          <div className="absolute w-1.5 h-1.5 rounded-full bg-orange-400 top-2/3 right-1/4 animate-pulse opacity-70" />
          <div className="absolute w-1 h-1 rounded-full bg-yellow-300 top-1/3 right-1/3 animate-bounce opacity-80" />
          <div className="absolute w-2.5 h-2.5 rounded-full bg-red-500 blur-[1px] bottom-1/4 left-1/3 opacity-40 animate-pulse" />
        </div>

        {/* 3D Transform Object Container */}
        <div
          className="relative w-48 h-56 transition-transform ease-out duration-100 flex flex-col items-center justify-center"
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Layer 1: Exploding Mid-Air Drumsticks (Floating Top) */}
          <div
            className="absolute -top-12 z-30 transition-transform duration-300"
            style={{
              transform: 'translateZ(90px) translateY(-10px) scale(1.05)',
            }}
          >
            <div className="relative animate-bounce duration-1000">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-600 to-orange-800 flex items-center justify-center p-2 shadow-2xl shadow-orange-950/80 border-2 border-amber-400/50">
                <span className="text-4xl filter drop-shadow-md">🍗</span>
              </div>
              <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-red-400 shadow">
                PIPING HOT
              </div>
            </div>
          </div>

          {/* Layer 2: Left Floating Drumstick */}
          <div
            className="absolute -left-10 top-6 z-20"
            style={{
              transform: 'translateZ(60px) rotate(-24deg)',
            }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-700 to-yellow-600 flex items-center justify-center p-1.5 shadow-xl border border-amber-500/40 animate-pulse">
              <span className="text-2xl filter drop-shadow">🍗</span>
            </div>
          </div>

          {/* Layer 3: Right Floating Crispy Drumstick */}
          <div
            className="absolute -right-10 top-6 z-20"
            style={{
              transform: 'translateZ(70px) rotate(22deg)',
            }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tl from-amber-700 to-orange-600 flex items-center justify-center p-1.5 shadow-xl border border-amber-500/40">
              <span className="text-2xl filter drop-shadow">🍗</span>
            </div>
          </div>

          {/* Layer 4: Floating Crispy Crunch Flakes (Crumbs bursting) */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ transform: 'translateZ(110px)' }}
          >
            <span className="absolute top-2 left-6 w-2.5 h-2.5 bg-amber-400 rounded-sm rotate-45 opacity-80" />
            <span className="absolute top-4 right-8 w-2 h-2 bg-yellow-400 rounded-full opacity-90" />
            <span className="absolute bottom-16 -left-4 w-2 h-2 bg-orange-400 rounded-sm rotate-12 opacity-75" />
            <span className="absolute bottom-20 -right-4 w-2.5 h-2.5 bg-amber-300 rounded-sm rotate-45 opacity-85" />
          </div>

          {/* Layer 5: Rising Steam Animation Wisps */}
          <div
            className="absolute -top-16 inset-x-0 flex justify-center gap-3 pointer-events-none opacity-60"
            style={{ transform: 'translateZ(40px)' }}
          >
            <div className="w-1.5 h-10 bg-gradient-to-t from-white/30 to-transparent rounded-full blur-[1px] animate-pulse" />
            <div className="w-2 h-14 bg-gradient-to-t from-white/40 to-transparent rounded-full blur-[1px] animate-ping" />
            <div className="w-1.5 h-12 bg-gradient-to-t from-white/30 to-transparent rounded-full blur-[1px] animate-pulse" />
          </div>

          {/* Layer 6: Signature Firey Treat Red & White Striped Bucket */}
          <div
            className="relative w-36 h-36 rounded-b-3xl bg-neutral-900 border-2 border-red-600 shadow-2xl overflow-hidden flex flex-col items-center justify-between p-2"
            style={{
              transform: 'translateZ(30px)',
              background: 'repeating-linear-gradient(90deg, #dc2626, #dc2626 14px, #ffffff 14px, #ffffff 28px)',
            }}
          >
            {/* Top Rim of Bucket */}
            <div className="w-full h-4 bg-neutral-950 border-b border-red-700 rounded-full flex items-center justify-center">
              <span className="text-[8px] font-black tracking-widest text-amber-400 uppercase">
                FRESH FROM KITCHEN
              </span>
            </div>

            {/* Official Firey Treat Logo Badge Placed on Center of Bucket */}
            <div className="w-14 h-14 rounded-full bg-black/95 p-1 border-2 border-amber-400 shadow-xl flex items-center justify-center my-auto">
              <img
                src="/firey_treat_logo.svg"
                alt="Firey Treat Emblem"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Bottom Base */}
            <div className="w-full py-0.5 bg-neutral-950 text-center rounded-b-2xl">
              <span className="text-[7.5px] font-black text-white tracking-widest uppercase">
                FIREY TREAT BUCKET
              </span>
            </div>
          </div>

          {/* 3D Floor Shadow */}
          <div
            className="absolute -bottom-8 w-40 h-10 rounded-full bg-black/80 blur-md pointer-events-none"
            style={{ transform: 'translateZ(-40px) rotateX(90deg)' }}
          />
        </div>

        {/* Viewport Overlay Controls */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-neutral-400 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-800">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white font-semibold">3D Orbit Enabled</span>
          </div>

          <div className="bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg border border-neutral-800 text-[10px] text-amber-300 font-bold">
            100% Basmathi &amp; Daily Fresh Fry
          </div>
        </div>
      </div>

      {/* Footer Info & Order Action */}
      <div className="mt-3.5 pt-3 border-t border-neutral-800/80 flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-sm">
              Crispy Mega Bucket (10 Pcs)
            </span>
            <span className="text-amber-400 font-bold text-sm">₹449</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Wings &amp; drumsticks freshly prepared • Includes 2 free dips
          </p>
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
            isAdded
              ? 'bg-emerald-500 text-neutral-950 scale-105'
              : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white hover:scale-105'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Order 3D Bucket</span>
            </>
          )}
        </button>
      </div>

      {/* Full-Screen 3D Inspection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <FireyTreatLogo size={40} />
                <div>
                  <h3 className="font-display font-black text-lg text-white">
                    Crispy Mega Bucket 3D Customer Inspection
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Interact in 3D, inspect ingredients, crispiness &amp; preparation
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            {/* Modal 3D Canvas Area */}
            <div className="relative h-72 rounded-2xl bg-gradient-to-b from-neutral-950 via-neutral-900 to-black border border-neutral-800 flex items-center justify-center overflow-hidden">
              <div className="text-center space-y-2">
                <div className="text-6xl animate-bounce filter drop-shadow-lg">
                  🍗
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 font-bold text-xs">
                  Double-Dipped Crunchy Breading &bull; Secret 11 Spices
                </div>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Every piece is marinated for 12 hours, dipped in signature seasoned batter, and fried to golden perfection in 100% clean vegetable oil.
                </p>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">PIECES</span>
                <span className="font-bold text-white text-sm">10 Pieces</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">CRUNCH FACTOR</span>
                <span className="font-bold text-amber-400 text-sm">Extreme (10/10)</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-400 block text-[10px]">PREPARATION</span>
                <span className="font-bold text-emerald-400 text-sm">100% Fresh Daily</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <div>
                <span className="text-neutral-400 text-xs block">Price</span>
                <span className="font-bold text-xl text-white">₹449</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs"
                >
                  Close Viewer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleQuickAdd();
                    setIsModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add 3D Bucket to Cart</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
