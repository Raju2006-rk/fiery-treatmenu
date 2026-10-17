import React, { useState } from 'react';
import { 
  X, 
  Rotate3d, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { FOOD_3D_CATALOG, FoodModelKey } from '../utils/threeFoodModels';
import { ThreeDishStage } from './ThreeDishStage';
import { MenuItem } from '../types';
import { DietaryIndicator } from './DietaryIndicator';

interface ThreeDishStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKey?: FoodModelKey;
  onAddToCart?: (item: MenuItem) => void;
  menuItems?: MenuItem[];
}

export const ThreeDishStudioModal: React.FC<ThreeDishStudioModalProps> = ({
  isOpen,
  onClose,
  initialKey = 'crispy_chicken',
  onAddToCart,
  menuItems = []
}) => {
  const [selectedKey, setSelectedKey] = useState<FoodModelKey>(initialKey);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToast, setIsAddedToast] = useState(false);

  if (!isOpen) return null;

  const currentMeta = FOOD_3D_CATALOG[selectedKey];

  // Resolve matching real MenuItem
  const currentItem: MenuItem = menuItems.find((m) =>
    m.name.toLowerCase().includes(currentMeta.name.toLowerCase().split(' ')[0])
  ) || {
    id: `3d-studio-${selectedKey}`,
    name: currentMeta.name,
    category: 'crispy_chicken',
    price: currentMeta.price,
    isVeg: currentMeta.isVeg,
    spiceLevel: currentMeta.spiceLevel as 1 | 2 | 3,
    description: currentMeta.subtitle,
    inStock: true,
    image: '',
    tags: [currentMeta.badge]
  };

  const handleAdd = () => {
    if (!onAddToCart) return;
    for (let i = 0; i < quantity; i++) {
      onAddToCart(currentItem);
    }
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[92vh]">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 transition-all cursor-pointer shadow-lg"
          aria-label="Close 3D Studio"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Interactive 3D Canvas Stage */}
        <div className="w-full md:w-3/5 bg-neutral-950 flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-800 relative">
          <ThreeDishStage
            initialDishKey={selectedKey}
            heightClass="h-80 sm:h-96 md:h-[500px]"
            className="border-0 rounded-none bg-transparent shadow-none"
            menuItems={menuItems}
          />
        </div>

        {/* Right Column: Dish Specs & Ordering Dock */}
        <div className="w-full md:w-2/5 p-6 flex flex-col justify-between space-y-5 bg-neutral-900/90 overflow-y-auto">
          
          <div className="space-y-4">
            
            {/* Top Badge */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-xs border border-amber-500/30 flex items-center gap-1">
                <Rotate3d className="w-3.5 h-3.5" />
                <span>3D Interactive Inspection</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-400 font-bold text-[10px] uppercase">
                {currentMeta.badge}
              </span>
            </div>

            {/* Title & Category */}
            <div>
              <div className="flex items-center gap-2">
                <DietaryIndicator isVeg={currentMeta.isVeg} size="sm" />
                <span className="text-xs text-neutral-400 font-semibold">{currentMeta.category}</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white pt-1">
                {currentMeta.name}
              </h2>
            </div>

            {/* Price & Spice Rating */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Price</span>
                <span className="font-display font-black text-2xl text-amber-400">
                  ₹{currentMeta.price}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">Spice Level</span>
                <div className="flex items-center gap-0.5 pt-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Flame
                      key={i}
                      className={`w-4 h-4 ${
                        i < currentMeta.spiceLevel ? 'text-red-500 fill-current' : 'text-neutral-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Chef Description */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Chef Preparation</span>
              <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/60 p-3 rounded-xl border border-neutral-800">
                {currentMeta.subtitle}. Prepared fresh daily at Firey Treat Restaurant using authentic ingredients, secret spices, and high-temp frying techniques.
              </p>
            </div>

            {/* Authentic Promises */}
            <div className="space-y-1.5 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cooked fresh upon your order</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>10 KM WhatsApp Home Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>100% Basmathi Rice Guarantee on Rice/Biryani</span>
              </div>
            </div>

            {/* Dish Switcher Grid */}
            <div className="pt-2">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                Switch 3D Dish
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(FOOD_3D_CATALOG) as FoodModelKey[]).map((key) => {
                  const item = FOOD_3D_CATALOG[key];
                  const isSelected = selectedKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setSelectedKey(key);
                        setQuantity(1);
                      }}
                      className={`p-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between border ${
                        isSelected
                          ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <span className="truncate">{item.name.split(' ')[0]}</span>
                      <span className="text-[11px]">₹{item.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Action Ordering Dock */}
          <div className="pt-4 border-t border-neutral-800 space-y-3">
            
            {/* Added Toast */}
            {isAddedToast && (
              <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-700/80 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Added {quantity}x {currentMeta.name} to Cart!</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="inline-flex items-center rounded-xl bg-neutral-950 border border-neutral-700 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-9 text-center font-bold text-sm text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add {quantity} to Cart • ₹{currentMeta.price * quantity}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
