import React, { useState } from 'react';
import { MenuItem } from '../types';
import { DietaryIndicator } from './DietaryIndicator';
import { resolveImageUrl } from '../data/menuData';
import { Flame, Plus, Minus, Check, AlertCircle, Rotate3d } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  cartQuantity: number;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onOpen3DStudio?: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
  onOpen3DStudio,
}) => {
  const [tilt, setTilt] = useState<{ x: number; y: number; glare: { x: number; y: number; opacity: number } }>({
    x: 0,
    y: 0,
    glare: { x: 50, y: 50, opacity: 0 }
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -((y - centerY) / centerY) * 10;
    const rotateY = ((x - centerX) / centerX) * 10;
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({
      x: rotateX,
      y: rotateY,
      glare: { x: glareX, y: glareY, opacity: 0.25 }
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glare: { x: 50, y: 50, opacity: 0 } });
  };

  return (
    <div
      id={`dish-card-${item.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: tilt.x === 0 ? 'transform 0.4s ease-out, border-color 0.2s' : 'none'
      }}
      className={`group relative rounded-2xl bg-neutral-900 border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg will-change-transform ${
        !item.inStock
          ? 'border-neutral-800/80 opacity-60'
          : 'border-neutral-800 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-orange-950/30'
      }`}
    >
      {/* 3D Dynamic Glare Sheen Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${tilt.glare.x}% ${tilt.glare.y}%, rgba(255,255,255,${tilt.glare.opacity}) 0%, transparent 60%)`
        }}
      />

      {/* Top Image Section */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-950">
        <img
          src={resolveImageUrl(item.image)}
          alt={item.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80 pointer-events-none" />

        {/* Top Badges: Veg/Non-Veg & Special */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
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

        {/* Bottom Bar in Image: 3D Dish View Button & Price */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          {onOpen3DStudio ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpen3DStudio(item);
              }}
              className="px-2.5 py-1 rounded-lg bg-neutral-950/90 hover:bg-neutral-900 text-amber-400 hover:text-amber-300 font-extrabold text-[10px] border border-amber-500/40 flex items-center gap-1 backdrop-blur-md transition-all cursor-pointer shadow-md hover:scale-105"
              title="Inspect dish in interactive 3D Studio"
            >
              <Rotate3d className="w-3.5 h-3.5 text-amber-400" />
              <span>3D View</span>
            </button>
          ) : <div />}

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
