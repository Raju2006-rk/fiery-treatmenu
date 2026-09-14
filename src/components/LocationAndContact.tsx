import React from 'react';
import { RESTAURANT_INFO } from '../data/menuData';
import { 
  PhoneCall, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Navigation 
} from 'lucide-react';

export const LocationAndContact: React.FC = () => {
  return (
    <section id="location-section" className="py-16 bg-neutral-950 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Visit Us & Home Delivery</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
            Contact & Location
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base">
            Visit our restaurant for hot dine-in crunch or get doorstep delivery anywhere in town!
          </p>
        </div>

        {/* Contact, Delivery & Hours Cards */}
        <div className="max-w-4xl mx-auto space-y-5">
          
          {/* Phone & Delivery Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-400" />
                <span>Call for Home Delivery & Takeaway</span>
              </h3>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-bold">
                ● Kitchen Open Now
              </span>
            </div>
            
            <p className="text-sm text-neutral-300">
              Freshly fried and prepared on order. Call directly or chat on WhatsApp for speedy dispatch:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <a
                href={`tel:${RESTAURANT_INFO.phone1}`}
                className="p-4 rounded-xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 text-white flex items-center gap-3.5 transition-colors group"
              >
                <div className="w-11 h-11 rounded-lg bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
                  <PhoneCall className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">Primary Line</span>
                  <span className="font-bold text-base text-white">{RESTAURANT_INFO.formattedPhone1}</span>
                </div>
              </a>

              <a
                href={`tel:${RESTAURANT_INFO.phone2}`}
                className="p-4 rounded-xl bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 text-white flex items-center gap-3.5 transition-colors group"
              >
                <div className="w-11 h-11 rounded-lg bg-emerald-950/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shrink-0">
                  <PhoneCall className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-bold block">Secondary Line</span>
                  <span className="font-bold text-base text-white">{RESTAURANT_INFO.formattedPhone2}</span>
                </div>
              </a>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(
                  "Hello Firey Treat Restaurant, I want to inquire about home delivery!"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-colors"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Chat on WhatsApp Directly</span>
              </a>
            </div>
          </div>

          {/* Operating Hours & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>Opening Hours</span>
              </div>
              <p className="text-base font-bold text-white">
                Monday – Sunday
              </p>
              <p className="text-xs text-neutral-400">
                {RESTAURANT_INFO.hours}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <MapPin className="w-4 h-4" />
                <span>Restaurant Address</span>
              </div>
              <p className="text-base font-semibold text-white">
                {RESTAURANT_INFO.name}
              </p>
              <p className="text-xs text-neutral-400">
                {RESTAURANT_INFO.address}
              </p>
              <a
                href={RESTAURANT_INFO.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:underline pt-1 font-semibold"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
