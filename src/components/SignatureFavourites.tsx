import React, { useState } from 'react';
import { MenuItem } from '../types';
import { resolveImageUrl } from '../data/menuData';
import { DietaryIndicator } from './DietaryIndicator';
import { 
  Sparkles, 
  Flame, 
  Plus, 
  Check, 
  ShoppingBag,
  ArrowRight
} from 'lucide-react';

interface SignatureFavouritesProps {
  items: MenuItem[];
  cartItemMap: Record<string, number>;
  onAddToCart: (item: MenuItem) => void;
  onExploreMenu: () => void;
}

export const SignatureFavourites: React.FC<SignatureFavouritesProps> = ({
  items,
  cartItemMap,
  onAddToCart,
  onExploreMenu,
}) => {
  // Select top signature dishes from actual verified menu items
  const signatureDishes = items.filter(
    (item) => item.isSpecial || item.isBestseller
  ).slice(0, 8);

  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAdd = (item: MenuItem) => {
    onAddToCart(item);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section id="signature-section" className="py-14 sm:py-20 bg-neutral-950 border-t border-neutral-900 relative">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-red-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-neutral-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest mb-2">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Chef Recommended</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight uppercase">
              Signature Favourites
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Our most-ordered crunch and sizzle hits, crafted fresh daily with secret marinades and 100% Basmathi rice.
            </p>
          </div>

          <button
            onClick={onExploreMenu}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <span>View Full 40+ Item Menu</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Premium Food Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {signatureDishes.map((dish) => {
            const qty = cartItemMap[dish.id] || 0;
            const isJustAdded = addedId === dish.id;

            return (
              <div
                key={dish.id}
                className="group relative rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:shadow-2xl hover:shadow-orange-950/30"
              >
                {/* Image Container with 4:3 Aspect Ratio */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950">
                  <img
                    src={resolveImageUrl(dish.image)}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  
                  {/* Subtle Media Contrast Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent pointer-events-none" />

                  {/* Dietary Indicator Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-neutral-950/80 backdrop-blur-md p-1 rounded-md border border-white/10">
                    <DietaryIndicator isVeg={dish.isVeg} isEgg={dish.isEgg} size="sm" />
                  </div>

                  {/* Basmathi Promise badge if applicable */}
                  {dish.basmatiRiceNote && (
                    <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-amber-500 text-neutral-950 font-black text-[10px] uppercase tracking-wider shadow">
                      100% Basmathi
                    </span>
                  )}

                  {/* Price Tag */}
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-neutral-950/90 backdrop-blur-md border border-neutral-800 text-white font-black text-sm">
                    ₹{dish.price}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase font-bold tracking-wider">
                        Price
                      </span>
                      <span className="text-sm font-black text-amber-400">
                        ₹{dish.price}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAdd(dish)}
                      disabled={!dish.inStock}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                        !dish.inStock
                          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          : isJustAdded
                          ? 'bg-emerald-500 text-neutral-950 scale-105'
                          : qty > 0
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white hover:scale-105 active:scale-95'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : qty > 0 ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In Cart ({qty})</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
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
