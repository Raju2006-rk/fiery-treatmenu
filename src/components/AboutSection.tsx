import React from 'react';
import { 
  Flame, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  MapPin, 
  Clock, 
  HeartHandshake,
  CheckCircle2,
  Utensils
} from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';
import imgFriedChicken from '../assets/images/crispy_fried_chicken_1789393849879.jpg';

export const AboutSection: React.FC = () => {
  return (
    <section id="about-section" className="py-16 sm:py-24 bg-neutral-950 border-t border-neutral-900 relative overflow-hidden">
      
      {/* Background Accent Gradients */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-orange-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-red-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Visual Collage */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900 group">
              <img
                src={imgFriedChicken}
                alt="Firey Treat Kitchen - Authentic Crispy Fried Chicken"
                className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
              
              {/* Floating Trust Badge */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-black/85 backdrop-blur-md border border-amber-500/30 text-white shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-extrabold text-sm uppercase tracking-wider text-white">
                      The Firey Treat Standard
                    </h4>
                    <p className="text-xs text-neutral-400">
                      ESTD. 2022 &bull; Pachikapalem, Tirupati Road
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Floating Pill Badge */}
            <div className="hidden sm:flex absolute -top-4 -right-4 px-3.5 py-1.5 rounded-full bg-red-600 border border-red-400 text-white font-extrabold text-xs shadow-xl items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>It&apos;s a Fry &amp; Pie!</span>
            </div>
          </div>

          {/* Right Content Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Our Restaurant Story</span>
              </div>
              
              <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight uppercase">
                Passionate Fast Food, <br />
                <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-red-500 bg-clip-text text-transparent">
                  Uncompromising Quality.
                </span>
              </h2>

              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed pt-1">
                Founded in 2022 in <strong className="text-white">Pachikapalem</strong> (Opposite DCCB Bank on Tirupati Road), 
                <strong className="text-white"> FIREY TREAT Restaurant</strong> was created with a single mission: to bring authentic, high-standard crispy fast food and aromatic rice specialties to local food lovers.
              </p>

              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                Whether you crave golden fried chicken with an ear-popping crunch, saucy Thunder Wings, or authentic wok-tossed fried rice cooked exclusively with 100% premium Basmathi rice, every dish is prepared fresh on order with strict kitchen hygiene.
              </p>
            </div>

            {/* 3 Pillars of Firey Treat */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-sm">100% Basmathi</h4>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Every grain of rice used across our entire menu is genuine long-grain Basmathi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center mb-2">
                  <Flame className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-sm">Daily Fresh Fry</h4>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Fried in fresh, clean vegetable oil with secret 11-herb &amp; spice batter.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-white text-sm">Piping Hot Dispatch</h4>
                <p className="text-neutral-400 text-[11px] leading-relaxed">
                  Fast 10km WhatsApp delivery and counter takeaway sealed in thermal boxes.
                </p>
              </div>
            </div>

            {/* Verified Location & Hours Summary */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-400 border-t border-neutral-800">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>Pachikapalem, DCCB Bank Opposite, Tirupati Road</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Open 7 Days: 10:00 AM – 10:30 PM</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
