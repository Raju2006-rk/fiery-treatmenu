import React from 'react';
import { Flame, PhoneCall, MessageCircle, Heart, Settings, MapPin, Navigation } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-800/80 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-amber-500 flex items-center justify-center text-white">
                <Flame className="w-5 h-5" />
              </div>
              <span className="font-display font-black text-xl text-white tracking-tight uppercase">
                Firey Treat
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Serving mouth-watering crunchy Fried Chicken, fiery Thunder Wings, aromatic Basmathi Rice & Noodles, freshly rolled Kathi Wraps, and Biryani.
            </p>
            <div className="pt-1 flex items-center gap-2 text-xs text-neutral-300">
              <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 font-bold text-[10px]">
                Veg & Non-Veg
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/50 text-amber-400 font-bold text-[10px]">
                Basmathi Rice
              </span>
            </div>
          </div>

          {/* Quick Menu Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">
              Popular Categories
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#menu-section" className="hover:text-amber-400 transition-colors">
                  Basmathi Rice & Noodles
                </a>
              </li>
              <li>
                <a href="#menu-section" className="hover:text-amber-400 transition-colors">
                  Crispy Fried Chicken Buckets (1 to 10 Pcs)
                </a>
              </li>
              <li>
                <a href="#menu-section" className="hover:text-amber-400 transition-colors">
                  Thunder Wings & Peri Peri Lollipops
                </a>
              </li>
              <li>
                <a href="#menu-section" className="hover:text-amber-400 transition-colors">
                  Veg & Non-Veg Kathi Rolls
                </a>
              </li>
              <li>
                <a href="#menu-section" className="hover:text-amber-400 transition-colors">
                  Chicken Dum Biryani (₹120) & Starters
                </a>
              </li>
            </ul>
          </div>

          {/* Delivery & Ordering */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">
              Home Delivery Hotline
            </h4>
            <p className="text-neutral-400">
              {RESTAURANT_INFO.deliveryNotice}
            </p>
            <div className="space-y-1.5 pt-1">
              <a
                href={`tel:${RESTAURANT_INFO.phone1}`}
                className="flex items-center gap-2 text-white font-bold hover:text-amber-400 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>{RESTAURANT_INFO.formattedPhone1}</span>
              </a>
              <a
                href={`tel:${RESTAURANT_INFO.phone2}`}
                className="flex items-center gap-2 text-white font-bold hover:text-amber-400 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>{RESTAURANT_INFO.formattedPhone2}</span>
              </a>
            </div>
            <p className="text-[11px] text-neutral-400">
              {RESTAURANT_INFO.hours}
            </p>
            <div className="pt-2">
              <a
                href={RESTAURANT_INFO.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Locate on Google Maps</span>
              </a>
            </div>
          </div>

          {/* Tools & Staff CMS */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">
              Staff Portal
            </h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Staff Menu Management CMS</span>
              </button>
            </div>
          </div>

        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© {new Date().getFullYear()} FIREY TREAT Restaurant. All rights reserved.</p>
          <p className="flex items-center gap-1 text-neutral-400">
            <span>Prepared with fresh ingredients & authentic Basmathi Rice</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
