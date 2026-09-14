import React from 'react';
import { MenuItem } from '../types';
import { DietaryIndicator } from './DietaryIndicator';
import { resolveImageUrl } from '../data/menuData';
import { Flame, Plus, Minus, Check, AlertCircle } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  cartQuantity: number;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
}) => {
  return (
    <div
      id={`dish-card-${item.id}`}
      className={`group relative rounded-2xl bg-neutral-900 border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg ${
        !item.inStock
          ? 'border-neutral-800/80 opacity-60'
          : 'border-neutral-800 hover:border-amber-500/50 hover:shadow-orange-950/20'
      }`}
    >
      {/* Top Image Section */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
        <img
          src={resolveImageUrl(item.image)}
          alt={item.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />

        {/* Top Badges: Veg/Non-Veg & Special */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
          <div className="bg-neutral-950/90 backdrop-blur-md px-2 py-1 rounded-lg border border-neutral-800 flex items-center shadow-md">
            <DietaryIndicator isVeg={item.isVeg} isEgg={item.isEgg} size="sm" showLabel={true} />
          </div>

          {item.isBestseller && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-neutral-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wide">
              Bestseller
            </span>
          )}

          {item.isSpecial && !item.isBestseller && (
            <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wide">
              Chef Special
            </span>
          )}
        </div>

        {/* Top Right: Piece count or Basmathi pill */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
          {item.pieceCount && (
            <span className="bg-neutral-950/90 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow">
              {item.pieceCount}
            </span>
          )}
          {item.basmatiRiceNote && (
            <span className="bg-amber-400 text-neutral-950 text-[10px] font-black px-2 py-0.5 rounded shadow">
              Basmathi Rice
            </span>
          )}
        </div>

        {/* Bottom Price in Image */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="bg-neutral-950/90 backdrop-blur-md text-white font-display font-extrabold text-base px-2.5 py-1 rounded-lg border border-neutral-800 shadow-md">
            ₹{item.price}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-amber-400 transition-colors">
              {item.name}
            </h3>

            {/* Spice Rating */}
            {item.spiceLevel && (
              <div className="flex items-center gap-0.5 shrink-0" title={`Spice Level: ${item.spiceLevel}/3`}>
                {Array.from({ length: item.spiceLevel }).map((_, i) => (
                  <Flame key={i} className="w-3.5 h-3.5 text-red-500 fill-current" />
                ))}
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-2 mt-1.5">
            {item.description}
          </p>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {item.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-950 text-neutral-400 border border-neutral-800/80 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block">
              Price
            </span>
            <span className="font-display font-extrabold text-lg text-amber-400">
              ₹{item.price}
            </span>
          </div>

          {!item.inStock ? (
            <span className="text-xs font-semibold text-rose-400 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/50 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Sold Out
            </span>
          ) : cartQuantity > 0 ? (
            /* Quantity Stepper when in cart */
            <div className="inline-flex items-center rounded-xl bg-neutral-950 border border-neutral-700 p-1 shadow-inner">
              <button
                onClick={() => onUpdateQuantity(item.id, -1)}
                className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-bold text-white">
                {cartQuantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, 1)}
                className="w-7 h-7 rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Add Button */
            <button
              id={`add-btn-${item.id}`}
              onClick={() => onAddToCart(item)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
