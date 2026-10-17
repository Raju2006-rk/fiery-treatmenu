import React from 'react';
import { 
  Sparkles, 
  Truck, 
  Gift, 
  PartyPopper, 
  ShieldCheck, 
  Flame, 
  PhoneCall, 
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';

interface SpecialOffersSectionProps {
  onOpenMenu: () => void;
}

export const SpecialOffersSection: React.FC<SpecialOffersSectionProps> = ({ onOpenMenu }) => {
  return (
    <section id="offers-section" className="py-16 sm:py-20 bg-neutral-950 border-t border-neutral-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-neutral-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
              <Gift className="w-3.5 h-3.5" />
              <span>Verified Restaurant Perks</span>
            </div>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight uppercase">
              Special Offers &amp; Catering Deals
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
              Authentic restaurant policies and catering deals directly from Firey Treat Pachikapalem.
            </p>
          </div>

          <a
            href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(
              "Hi Firey Treat, I want to inquire about your party catering and special offers!"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Inquire on WhatsApp</span>
          </a>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Offer 1: Free delivery below 500m */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-4 shadow-lg group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                Neighbor Special
              </span>
              <h3 className="font-display font-bold text-lg text-white">
                Below 500m: FREE Delivery
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Live or work within 500 meters of our Pachikapalem hub? Enjoy automatic <strong>₹0 (FREE) delivery fee</strong> on all WhatsApp orders!
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800 text-xs text-emerald-300 font-semibold flex items-center justify-between">
              <span>Auto-applied by GPS</span>
              <span>₹0 Fee</span>
            </div>
          </div>

          {/* Offer 2: 10 KM Online Delivery */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col justify-between space-y-4 shadow-lg group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                Radius Coverage
              </span>
              <h3 className="font-display font-bold text-lg text-white">
                10 KM Wide WhatsApp Delivery
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                We deliver piping hot fast food within 10 km along Tirupati Road and nearby villages. Fast dispatch and real-time distance calculation.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800 text-xs text-amber-300 font-semibold flex items-center justify-between">
              <span>500m–6km: ₹30 | 6–10km: ₹40</span>
              <span>Fast Dispatch</span>
            </div>
          </div>

          {/* Offer 3: Party & Birthday Biryani Combos */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-red-500/30 hover:border-red-500/60 transition-all flex flex-col justify-between space-y-4 shadow-lg group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                <PartyPopper className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider block">
                Catering &amp; Functions
              </span>
              <h3 className="font-display font-bold text-lg text-white">
                Party &amp; Biryani Combos
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Birthday parties, family get-togethers, and office lunches! Bulk biryani and crispy chicken packs customized for your gathering.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800 text-xs text-red-300 font-semibold flex items-center justify-between">
              <span>Advance Booking Available</span>
              <span>Bulk Deals</span>
            </div>
          </div>

          {/* Offer 4: 100% Basmathi Rice Promise */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                Signboard Promise
              </span>
              <h3 className="font-display font-bold text-lg text-white">
                100% Basmathi Rice Guarantee
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Every single fried rice and biryani dish is cooked with authentic aromatic long-grain Basmathi rice. Zero shortcuts, pure quality.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-800 text-xs text-amber-400 font-semibold flex items-center justify-between">
              <span>Authentic Fast Food</span>
              <span>Premium Grain</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
