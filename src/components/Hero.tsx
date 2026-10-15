import React from 'react';
import { 
  Flame, 
  PhoneCall, 
  Sparkles, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  MessageCircle,
  Truck
} from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';
import imgCrispyFriedChicken from '../assets/images/crispy_fried_chicken_toi.jpg';

interface HeroProps {
  onExploreMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMenu }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 pt-6 pb-12 sm:pt-10 sm:pb-16 border-b border-neutral-800">
      {/* Background Ambience Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-r from-red-600/10 via-amber-500/10 to-orange-600/10 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Banner: Authentic Basmathi Rice Announcement */}
        <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium mb-6 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-bold text-white">Authentic Signboard Promise:</span>
          <span>All Rice Items Prepared with 100% Basmathi Rice!</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-wider text-xs sm:text-sm">
                <Flame className="w-4 h-4 fill-current" />
                <span>Crispy • Sizzling • Authentic Fast Food</span>
              </div>
              
              <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-none uppercase">
                Taste the Crunch. <br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-red-500 bg-clip-text text-transparent">
                  Feel the Fire.
                </span>
              </h1>
              
              <p className="text-neutral-300 text-base sm:text-lg max-w-xl leading-relaxed pt-2">
                Welcome to <strong className="text-white font-semibold">FIREY TREAT Restaurant</strong>. 
                Savor our signature golden Fried Chicken, fiery Thunder Wings, aromatic Basmati Rice & Noodles, 
                flaky Kathi Rolls, juicy Burgers, Dum Biryani, and steamed Momos!
              </p>
            </div>

            {/* Quick Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-neutral-200 font-medium">100% Basmathi Rice</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-neutral-200 font-medium">Fresh Daily Fry</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 col-span-2 sm:col-span-1">
                <Truck className="w-4 h-4 text-red-400 shrink-0" />
                <span className="text-neutral-200 font-medium">Home Delivery</span>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-btn-explore-menu"
                onClick={onExploreMenu}
                className="px-6 py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-red-950/60 hover:shadow-red-900/80 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Explore Full Menu</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <a
                id="hero-btn-whatsapp"
                href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(
                  "Hi Firey Treat Restaurant, I want to see your menu and order food for delivery!"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Order via WhatsApp</span>
              </a>

              <a
                id="hero-btn-call"
                href={`tel:${RESTAURANT_INFO.phone1}`}
                className="px-4 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 font-semibold text-sm rounded-xl flex items-center gap-2 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>{RESTAURANT_INFO.phone1}</span>
              </a>
            </div>

            {/* Delivery Alert Banner with 10km radius & below 500m reduced charge */}
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-amber-500/30 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-amber-300">
                    Online WhatsApp Home Delivery (10 KM Radius)
                  </p>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-bold text-[10px]">
                    Below 500m: Reduced Fee (FREE)
                  </span>
                </div>
                <p className="text-neutral-300 pt-0.5">
                  Delivering across Pachikapalem & up to 10 km! Call or WhatsApp:{' '}
                  <strong className="text-white underline">{RESTAURANT_INFO.formattedPhone1}</strong> or{' '}
                  <strong className="text-white underline">{RESTAURANT_INFO.formattedPhone2}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Menu Showcase Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-neutral-900/90 border border-neutral-800 p-4 sm:p-5 shadow-2xl">
              
              {/* Featured dish image banner */}
              <div className="relative h-56 sm:h-64 rounded-xl overflow-hidden mb-4 group">
                <img
                  src={imgCrispyFriedChicken}
                  alt="Crispy Fried Chicken and Chicken Lollipop"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
                
                {/* Floating Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-red-600/90 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-sm">
                    Crispy Fried Chicken
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-amber-500/90 text-neutral-950 font-bold text-xs backdrop-blur-sm">
                    Starts ₹79
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-base sm:text-lg">Signature Thunder Wings & Chicken</p>
                      <p className="text-xs text-neutral-300">1 / 2 / 4 / 8 / 10 Piece Buckets Available</p>
                    </div>
                    <span className="text-amber-400 font-bold text-sm bg-neutral-950/80 px-2.5 py-1 rounded-lg">
                      🔥 Super Hit
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Menu Highlights Grid from Photos */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">SIGNATURE RICE</span>
                    <span className="font-semibold text-white">Chicken Fried Rice</span>
                  </div>
                  <span className="font-bold text-amber-400">₹100</span>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">CHEF SPECIAL</span>
                    <span className="font-semibold text-white">Chicken Dum Biryani</span>
                  </div>
                  <span className="font-bold text-amber-400">₹120</span>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">ROLLS DEAL</span>
                    <span className="font-semibold text-white">Egg Roll</span>
                  </div>
                  <span className="font-bold text-amber-400">₹59</span>
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-950/60 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">CRUNCHY BITES</span>
                    <span className="font-semibold text-white">Chicken Pop Corn</span>
                  </div>
                  <span className="font-bold text-amber-400">₹80</span>
                </div>
              </div>

              {/* Service Capabilities */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dine-In, Takeaway & Home Delivery Available</span>
                </div>
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  {RESTAURANT_INFO.hours}
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
