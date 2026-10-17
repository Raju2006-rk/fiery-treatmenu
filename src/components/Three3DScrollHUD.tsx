import React, { useState } from 'react';
import { 
  Rotate3d, 
  Sparkles, 
  Eye, 
  Sliders, 
  Sun, 
  Flame, 
  Moon, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag,
  Check,
  Compass,
  UtensilsCrossed,
  Truck
} from 'lucide-react';
import { FoodModelKey, FOOD_3D_CATALOG } from '../utils/threeFoodModels';

interface Three3DScrollHUDProps {
  scrollProgress: number; // 0 to 1
  activePhaseIndex: number;
  activeModelKey: FoodModelKey;
  onSelectModel: (key: FoodModelKey) => void;
  isOrbitMode: boolean;
  onToggleOrbitMode: (enabled: boolean) => void;
  explodeAmount: number; // 0 to 1
  onExplodeChange: (val: number) => void;
  lightPreset: 'warm' | 'fire' | 'night';
  onChangeLightPreset: (preset: 'warm' | 'fire' | 'night') => void;
  onJumpToStage: (stageIndex: number) => void;
  onAddToCart: (modelKey: FoodModelKey) => void;
  cartItemCount: number;
  onOpenCart: () => void;
}

export const Three3DScrollHUD: React.FC<Three3DScrollHUDProps> = ({
  scrollProgress,
  activePhaseIndex,
  activeModelKey,
  onSelectModel,
  isOrbitMode,
  onToggleOrbitMode,
  explodeAmount,
  onExplodeChange,
  lightPreset,
  onChangeLightPreset,
  onJumpToStage,
  onAddToCart,
  cartItemCount,
  onOpenCart,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [added, setAdded] = useState(false);

  const currentDish = FOOD_3D_CATALOG[activeModelKey];

  const handleAdd = () => {
    onAddToCart(activeModelKey);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const stages = [
    { label: '01. Welcome', icon: Sparkles, index: 0 },
    { label: '02. Basmathi', icon: UtensilsCrossed, index: 1 },
    { label: '03. 3D Studio', icon: Rotate3d, index: 2 },
    { label: '04. 10km Delivery', icon: Truck, index: 3 },
    { label: '05. Dine-In', icon: Compass, index: 4 },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-4xl transition-all">
      
      {/* Collapse / Expand Toggle Button */}
      <div className="flex justify-center mb-1">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="px-3 py-1 rounded-t-xl bg-neutral-900/90 border-t border-x border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-md cursor-pointer hover:bg-neutral-800 transition-colors"
        >
          <Rotate3d className="w-3.5 h-3.5" />
          <span>{collapsed ? '▴ Show 3D Controls' : '▾ Collapse 3D HUD'}</span>
        </button>
      </div>

      {!collapsed && (
        <div className="rounded-2xl bg-neutral-950/90 border border-neutral-800/90 p-3.5 sm:p-4 shadow-2xl backdrop-blur-md text-white space-y-3">
          
          {/* Top Row: Stage Pills & Live Scroll Progress Gauge */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
            
            {/* Stage Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
              {stages.map((st) => {
                const Icon = st.icon;
                const isActive = activePhaseIndex === st.index;
                return (
                  <button
                    key={st.index}
                    type="button"
                    onClick={() => onJumpToStage(st.index)}
                    className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow-md'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Progress Bar */}
            <div className="flex items-center gap-2 shrink-0 text-xs">
              <span className="text-neutral-400 font-mono text-[11px]">
                {Math.round(scrollProgress * 100)}% SCROLL
              </span>
              <div className="w-20 h-2 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-amber-400 transition-all duration-150"
                  style={{ width: `${Math.round(scrollProgress * 100)}%` }}
                />
              </div>
            </div>

          </div>

          {/* Middle Row: Active 3D Dish Info & Quick Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-neutral-900/60 p-3 rounded-xl border border-neutral-800/80">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-red-600/30 border border-red-500/40 text-red-300 text-[10px] font-bold uppercase tracking-wider">
                  {currentDish.badge}
                </span>
                <h3 className="font-display font-bold text-sm text-white">
                  {currentDish.name}
                </h3>
                <span className="text-amber-400 font-bold text-sm">
                  ₹{currentDish.price}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5 max-w-lg line-clamp-1">
                {currentDish.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add 3D Dish (₹{currentDish.price})</span>
                  </>
                )}
              </button>

              {cartItemCount > 0 && (
                <button
                  type="button"
                  onClick={onOpenCart}
                  className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs flex items-center gap-1 border border-neutral-700 transition-colors"
                >
                  <span>Cart ({cartItemCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Row: 3D Camera Mode, Explode Slider & Lighting Presets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            
            {/* Camera / Scroll Mode Toggle */}
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <span className="text-neutral-400 font-medium">Interaction Mode:</span>
              <div className="flex items-center gap-1 p-0.5 bg-neutral-950 rounded-lg border border-neutral-800">
                <button
                  type="button"
                  onClick={() => onToggleOrbitMode(false)}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    !isOrbitMode
                      ? 'bg-amber-500 text-neutral-950 shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Scroll Sync
                </button>
                <button
                  type="button"
                  onClick={() => onToggleOrbitMode(true)}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    isOrbitMode
                      ? 'bg-amber-500 text-neutral-950 shadow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  360° Drag
                </button>
              </div>
            </div>

            {/* Explode 3D Layers Slider */}
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                  <span>3D Layer Explosion</span>
                  <span className="text-amber-300 font-bold">{Math.round(explodeAmount * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={explodeAmount}
                  onChange={(e) => onExplodeChange(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Lighting Preset Toggle */}
            <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <span className="text-neutral-400 font-medium">3D Lighting:</span>
              <div className="flex items-center gap-1 p-0.5 bg-neutral-950 rounded-lg border border-neutral-800">
                <button
                  type="button"
                  onClick={() => onChangeLightPreset('warm')}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    lightPreset === 'warm' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Warm Studio"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLightPreset('fire')}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    lightPreset === 'fire' ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Sizzling Fire"
                >
                  <Flame className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLightPreset('night')}
                  className={`p-1 rounded transition-all cursor-pointer ${
                    lightPreset === 'night' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Night Lounge"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
