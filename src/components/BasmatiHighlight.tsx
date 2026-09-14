import React from 'react';
import { MenuItem } from '../types';
import { DietaryIndicator } from './DietaryIndicator';
import { resolveImageUrl } from '../data/menuData';
import { Plus, Check } from 'lucide-react';

interface BasmatiHighlightProps {
  items: MenuItem[];
  cartItemIds: Record<string, number>;
  onAddToCart: (item: MenuItem) => void;
  onSelectCategory: (categoryId: string) => void;
}

export const BasmatiHighlight: React.FC<BasmatiHighlightProps> = ({
  items,
  cartItemIds,
  onAddToCart,
  onSelectCategory,
}) => {
  // Filter the featured 11 items directly from the Photo 2 signboard
  const signboardItems = items.filter(
    (item) =>
      item.category === 'rice_noodles' ||
      item.id === 'rn-10' ||
      item.id === 'rn-11'
  ).slice(0, 11);

  return (
    <section id="basmati-highlight" className="py-10 bg-neutral-900/60 border-y border-neutral-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🍚</span>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                Basmathi Rice Delights
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                100% Basmathi Rice
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              All rice items prepared fresh with fragrant long-grain Basmathi rice
            </p>
          </div>

          <button
            onClick={() => {
              onSelectCategory('rice_noodles');
              const menuEl = document.getElementById('menu-section');
              if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Explore all rice & noodles →
          </button>
        </div>

        {/* The 11 Signboard items grid resembling Photo 2 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {signboardItems.map((item) => {
            const qty = cartItemIds[item.id] || 0;
            return (
              <div
                key={item.id}
                id={`signboard-item-${item.id}`}
                className="group relative rounded-xl bg-neutral-950 border border-neutral-800/90 overflow-hidden hover:border-amber-500/50 transition-all flex flex-col justify-between"
              >
                {/* Photo container */}
                <div className="relative aspect-video sm:aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                  <img
                    src={resolveImageUrl(item.image)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  {/* Dietary badge */}
                  <div className="absolute top-2 left-2 bg-neutral-950/80 backdrop-blur-sm p-1 rounded">
                    <DietaryIndicator isVeg={item.isVeg} isEgg={item.isEgg} size="sm" />
                  </div>

                  {item.basmatiRiceNote && (
                    <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-amber-500/90 text-neutral-950 font-bold text-[9px] uppercase tracking-wider">
                      Basmathi
                    </span>
                  )}

                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-neutral-950/90 text-white font-bold text-xs">
                    ₹{item.price}
                  </span>
                </div>

                {/* Content */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="pt-2.5 mt-2 border-t border-neutral-900 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">
                      ₹{item.price}
                    </span>

                    <button
                      onClick={() => onAddToCart(item)}
                      disabled={!item.inStock}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        !item.inStock
                          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          : qty > 0
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
                      }`}
                    >
                      {qty > 0 ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added ({qty})</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
