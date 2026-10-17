import React, { useState } from 'react';
import { 
  Home, 
  Rotate3d, 
  Utensils, 
  ShoppingBag, 
  Settings, 
  ChevronUp, 
  ChevronDown, 
  Flame, 
  Sparkles,
  Layers,
  Search,
  Check
} from 'lucide-react';
import { CategoryId, MenuItem } from '../types';
import { CATEGORIES } from '../data/menuData';

interface DownNavigationProps {
  selectedCategory: CategoryId;
  onSelectCategory: (categoryId: CategoryId) => void;
  categoryItemCounts: Record<string, number>;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpen3DStudio: () => void;
  onOpenOwner: () => void;
  onScrollToTop: () => void;
}

export const DownNavigation: React.FC<DownNavigationProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryItemCounts,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpen3DStudio,
  onOpenOwner,
  onScrollToTop,
}) => {
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleCategoryClick = (catId: CategoryId) => {
    onSelectCategory(catId);
    setIsCategoryDrawerOpen(false);
    
    // Scroll smoothly to menu section
    const menuSection = document.getElementById('menu-section');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHomeClick = () => {
    setIsCategoryDrawerOpen(false);
    onScrollToTop();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none flex flex-col items-center">
      
      {/* Down Items Category Drawer Overlay Sheet */}
      {isCategoryDrawerOpen && (
        <div className="pointer-events-auto w-full max-w-3xl mx-auto px-3 pb-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 rounded-3xl p-4 shadow-2xl shadow-black/80">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-sm text-white uppercase tracking-wider">
                    Down Menu Categories Navigation
                  </h4>
                  <p className="text-[11px] text-neutral-400">Select any dish category to jump directly</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCategoryDrawerOpen(false)}
                className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of Categories for Down Items Navigation */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 max-h-60 overflow-y-auto pr-1">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = cat.id === 'all' 
                  ? (Object.values(categoryItemCounts) as number[]).reduce((a, b) => a + b, 0)
                  : categoryItemCounts[cat.id] || 0;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.id as CategoryId)}
                    className={`p-2.5 rounded-2xl text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between border ${
                      isSelected
                        ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border-amber-400 shadow-lg shadow-red-950/50 scale-[1.02]'
                        : 'bg-neutral-950/80 text-neutral-200 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/80'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <span className="block truncate">{cat.name}</span>
                      {cat.badge && (
                        <span className="text-[9px] font-black text-amber-300 uppercase block">
                          {cat.badge}
                        </span>
                      )}
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-neutral-800 text-amber-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button for Minimized Mode */}
      <div className="pointer-events-auto mb-1">
        <button
          type="button"
          onClick={() => setIsMinimized(!isMinimized)}
          className="px-3 py-1 rounded-t-xl bg-neutral-900/90 hover:bg-neutral-800 border-t border-x border-neutral-700/80 text-neutral-300 text-[10px] font-bold flex items-center gap-1 shadow-lg backdrop-blur-md transition-all cursor-pointer"
        >
          {isMinimized ? (
            <>
              <ChevronUp className="w-3 h-3 text-amber-400" />
              <span>Show Down Nav</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
              <span>Hide Nav</span>
            </>
          )}
        </button>
      </div>

      {/* Main Bottom Dock Bar */}
      {!isMinimized && (
        <div className="pointer-events-auto w-full max-w-2xl px-3 pb-3">
          <div className="bg-neutral-900/95 backdrop-blur-2xl border border-neutral-800 rounded-3xl p-2 shadow-2xl shadow-black/90 flex items-center justify-around gap-1 sm:gap-2">
            
            {/* 1. Home */}
            <button
              type="button"
              onClick={handleHomeClick}
              className="flex-1 py-2 px-1 rounded-2xl hover:bg-neutral-800/80 text-neutral-400 hover:text-white flex flex-col items-center gap-1 transition-all cursor-pointer group"
            >
              <Home className="w-5 h-5 text-neutral-400 group-hover:text-amber-400 transition-colors" />
              <span className="text-[10px] font-bold tracking-tight">Home</span>
            </button>

            {/* 2. Down Items Menu Selector */}
            <button
              type="button"
              onClick={() => setIsCategoryDrawerOpen(!isCategoryDrawerOpen)}
              className={`flex-1 py-2 px-1 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                isCategoryDrawerOpen 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-md'
                  : 'hover:bg-neutral-800/80 text-neutral-300 border-transparent'
              }`}
            >
              <Utensils className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-extrabold tracking-tight">
                {selectedCategory === 'all' ? 'All Dishes' : CATEGORIES.find(c => c.id === selectedCategory)?.name.split(' ')[0]}
              </span>
            </button>

            {/* 3. 3D Dish View Studio Button */}
            <button
              type="button"
              onClick={() => {
                setIsCategoryDrawerOpen(false);
                onOpen3DStudio();
              }}
              className="flex-1 py-2 px-1.5 rounded-2xl bg-gradient-to-r from-red-600/90 via-orange-600/90 to-amber-600/90 hover:from-red-500 hover:to-amber-500 text-white font-extrabold flex flex-col items-center gap-1 shadow-lg shadow-red-950/60 border border-amber-400/30 transition-all cursor-pointer hover:scale-105"
              title="Inspect All Dishes in 3D Interactive Stage"
            >
              <Rotate3d className="w-5 h-5 text-amber-200 animate-spin-slow" />
              <span className="text-[10px] tracking-tight uppercase">3D Dishes</span>
            </button>

            {/* 4. Cart Button */}
            <button
              type="button"
              onClick={() => {
                setIsCategoryDrawerOpen(false);
                onOpenCart();
              }}
              className="relative flex-1 py-2 px-1 rounded-2xl hover:bg-neutral-800/80 text-neutral-300 hover:text-white flex flex-col items-center gap-1 transition-all cursor-pointer group"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-neutral-900 shadow">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-extrabold tracking-tight text-emerald-400">
                {cartTotal > 0 ? `₹${cartTotal}` : 'Cart'}
              </span>
            </button>

            {/* 5. Owner Settings */}
            <button
              type="button"
              onClick={() => {
                setIsCategoryDrawerOpen(false);
                onOpenOwner();
              }}
              className="flex-1 py-2 px-1 rounded-2xl hover:bg-neutral-800/80 text-neutral-400 hover:text-white flex flex-col items-center gap-1 transition-all cursor-pointer group"
            >
              <Settings className="w-5 h-5 text-neutral-400 group-hover:text-amber-400 transition-colors" />
              <span className="text-[10px] font-bold tracking-tight">Owner</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
