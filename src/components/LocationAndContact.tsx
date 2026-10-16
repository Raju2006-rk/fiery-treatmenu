import React, { useState } from 'react';
import { RESTAURANT_INFO } from '../data/menuData';
import { calculateDistanceKm, RESTAURANT_COORDINATES } from '../utils/distance';
import { 
  PhoneCall, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Navigation,
  Truck,
  Sparkles,
  Compass,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

export const LocationAndContact: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [distanceResult, setDistanceResult] = useState<{
    meters: number;
    km: number;
    isUnder500: boolean;
    isWithin10km: boolean;
  } | null>(null);
  const [locationError, setLocationError] = useState('');

  const handleCheckDistance = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsChecking(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const km = calculateDistanceKm(pos.coords.latitude, pos.coords.longitude);
        const meters = Math.round(km * 1000);
        setDistanceResult({
          meters,
          km,
          isUnder500: meters <= 500,
          isWithin10km: km <= 10,
        });
        setIsChecking(false);
      },
      (err) => {
        setIsChecking(false);
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Location access was denied. You can check your distance manually in the order cart!'
            : 'Unable to pinpoint your GPS location.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <section id="location-section" className="py-16 bg-neutral-950 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Visit Us & 10 KM Delivery Radius</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
            Contact & Location
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base">
            Visit our restaurant for hot dine-in crunch or get doorstep delivery across our 10 km service radius!
          </p>
        </div>

        {/* Contact, Delivery & Hours Cards */}
        <div className="max-w-4xl mx-auto space-y-5">
          
          {/* 10 KM Delivery Radius & Policy Showcase Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-amber-500/30 space-y-5 shadow-xl">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                    <span>10 KM Delivery Radius Coverage</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Dispatched hot & fresh from Pachikapalem, Opposite DCCB Bank
                  </p>
                </div>
              </div>

              <a
                href={RESTAURANT_INFO.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-bold flex items-center gap-1.5 border border-neutral-700 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>View on Google Maps</span>
                <ExternalLink className="w-3 h-3 text-neutral-400" />
              </a>
            </div>

            {/* Delivery Rule Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-neutral-950/80 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">Special Neighbor Offer</span>
                    <h4 className="font-bold text-sm text-white">Below 500 Meters: Reduced Delivery (FREE)</h4>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed pl-9">
                  Live or work within 500m of our restaurant? Enjoy <strong>₹0 (FREE) delivery charge</strong> directly to your home or shop!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950/80 border border-red-500/30 space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-950 border border-red-700/60 flex items-center justify-center text-red-400">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider block">Wide Coverage Zone</span>
                    <h4 className="font-bold text-sm text-white">Up to 10 KM Online WhatsApp Delivery</h4>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed pl-9">
                  We deliver across a 10 km radius along Tirupati Road and neighboring areas with speedy WhatsApp dispatch and tracking.
                </p>
              </div>
            </div>

            {/* Live Distance Checker Widget */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Check Your Distance to Firey Treat:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCheckDistance}
                  disabled={isChecking}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow disabled:opacity-50"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking GPS...</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-3.5 h-3.5" />
                      <span>Check My Distance (GPS)</span>
                    </>
                  )}
                </button>
              </div>

              {distanceResult && (
                <div className={`p-3 rounded-lg text-xs space-y-1 ${
                  distanceResult.isUnder500
                    ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-200'
                    : distanceResult.isWithin10km
                    ? 'bg-blue-950/80 border border-blue-700 text-blue-200'
                    : 'bg-rose-950/80 border border-rose-700 text-rose-200'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      You are {distanceResult.km < 1 ? `${distanceResult.meters} meters` : `${distanceResult.km.toFixed(2)} km`} away from Firey Treat Restaurant
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 pl-5.5">
                    {distanceResult.isUnder500
                      ? '🎉 Fantastic! You qualify for our reduced delivery charge: FREE (₹0) delivery on WhatsApp orders!'
                      : distanceResult.km <= 6
                      ? '✅ You are within our 500m–6km zone (₹30 delivery fee). Order your favorite dishes online via WhatsApp!'
                      : distanceResult.isWithin10km
                      ? '✅ You are within our 6km–10km zone (₹40 delivery fee). Order your favorite dishes online via WhatsApp!'
                      : '🚫 You are beyond our 10 km delivery radius. Online delivery orders cannot be delivered above 10 km. Please select Takeaway / Counter Pickup to place your order!'}
                  </p>
                </div>
              )}

              {locationError && (
                <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{locationError}</span>
                </div>
              )}
            </div>
          </div>

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
                  "Hello Firey Treat Restaurant, I want to inquire about home delivery within your 10km radius!"
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
                <span>Open in Google Maps (Pachikapalem)</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
