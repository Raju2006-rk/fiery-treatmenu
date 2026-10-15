import React, { useState } from 'react';
import { OrderType } from '../types';
import { RESTAURANT_INFO } from '../data/menuData';
import { RESTAURANT_COORDINATES, autoDetectAndSelectLocation, DetectedLocationResult } from '../utils/distance';
import { 
  Clock, 
  MapPin, 
  ShoppingBag, 
  Truck, 
  UtensilsCrossed, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Compass, 
  AlertCircle,
  Loader2,
  PackageCheck,
  Flame,
  ArrowRight
} from 'lucide-react';

interface OrderStatusIndicatorProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  variant?: 'page' | 'drawer';
  activeOrderType?: OrderType;
  onOrderTypeChange?: (type: OrderType) => void;
  detectedLocation?: DetectedLocationResult | null;
  onLocationDetected?: (result: DetectedLocationResult) => void;
}

export const OrderStatusIndicator: React.FC<OrderStatusIndicatorProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  variant = 'page',
  activeOrderType = 'delivery',
  onOrderTypeChange,
  detectedLocation,
  onLocationDetected,
}) => {
  const [internalOrderType, setInternalOrderType] = useState<OrderType>(activeOrderType);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string>('');
  const [quickLocation, setQuickLocation] = useState<DetectedLocationResult | null>(detectedLocation || null);

  const currentType = onOrderTypeChange ? activeOrderType : internalOrderType;

  const handleTypeSelect = (type: OrderType) => {
    if (onOrderTypeChange) {
      onOrderTypeChange(type);
    } else {
      setInternalOrderType(type);
    }
  };

  const handleQuickLocate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetecting(true);
    setDetectionError('');
    try {
      const result = await autoDetectAndSelectLocation(cartTotal);
      setQuickLocation(result);
      if (onLocationDetected) {
        onLocationDetected(result);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to access GPS location';
      setDetectionError(errorMsg);
    } finally {
      setIsDetecting(false);
    }
  };

  if (cartCount === 0) {
    return null;
  }

  // Page variant (prominent info block)
  if (variant === 'page') {
    return (
      <div 
        id="order-status-indicator" 
        className="w-full rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/95 to-neutral-900 border border-amber-500/30 shadow-xl shadow-neutral-950/80 overflow-hidden mb-8 transition-all animate-fadeIn"
      >
        {/* Top Header Bar */}
        <div className="bg-neutral-950/80 px-4 py-3 sm:px-6 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                Live Order Status Indicator
              </h3>
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold px-2 py-0.5 rounded-full">
                Active Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 hidden sm:inline">Order Value:</span>
            <span className="text-xs sm:text-sm font-bold text-amber-400 font-display">
              ₹{cartTotal}
            </span>
            <button
              onClick={onOpenCart}
              className="ml-2 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1 transition-transform hover:scale-105 cursor-pointer shadow-md"
            >
              <span>View Cart & Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4">
          
          {/* Order Type Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1">
              Select Mode:
            </span>
            
            <button
              type="button"
              onClick={() => handleTypeSelect('delivery')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentType === 'delivery'
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Home Delivery (10km Radius)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeSelect('takeaway')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentType === 'takeaway'
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Takeaway / Counter Pickup</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeSelect('dine_in')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentType === 'dine_in'
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Dine-In Table</span>
            </button>
          </div>

          {/* Time & Instructions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            
            {/* Box 1: Estimated Timing */}
            <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Estimated Time</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white font-display">
                  {currentType === 'delivery' 
                    ? quickLocation?.isUnder500m ? '15–20 Mins' : '25–35 Mins'
                    : '10–15 Mins'}
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  {currentType === 'delivery'
                    ? 'Dispatched via delivery rider from Pachikapalem hub within 10km.'
                    : currentType === 'takeaway'
                    ? 'Freshly fried & packed piping hot for counter collection.'
                    : 'Fresh kitchen preparation directly to your restaurant table.'}
                </p>
              </div>

              {currentType === 'delivery' && (
                <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <span>Free delivery under 500m & on orders above ₹499!</span>
                </div>
              )}
            </div>

            {/* Box 2: Instructions (Delivery or Pickup) */}
            <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800 md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                    <span>
                      {currentType === 'delivery'
                        ? '10 KM Delivery Radius & Location Auto-Fill'
                        : currentType === 'takeaway'
                        ? 'Takeaway Pickup Instructions'
                        : 'Dine-In Instructions'}
                    </span>
                  </div>

                  {currentType === 'delivery' && (
                    <button
                      type="button"
                      onClick={handleQuickLocate}
                      disabled={isDetecting}
                      className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-700 text-amber-300 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                      title="Auto-detect GPS location and distance"
                    >
                      {isDetecting ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                          <span>Detecting GPS...</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-3 h-3 text-amber-400" />
                          <span>Auto-Detect My Location</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Instructions Text */}
                {currentType === 'delivery' ? (
                  <div className="space-y-1.5 text-xs text-neutral-300">
                    <p className="leading-relaxed">
                      Delivery is available up to <strong className="text-white">10 km radius</strong> from{' '}
                      <span className="text-amber-400 font-semibold">Pachikapalem</span> (Opposite DCCB Bank, Tirupati Road).
                      Below 500 meters has a <strong className="text-emerald-400">special reduced delivery charge (FREE ₹0)</strong>.
                    </p>
                    {quickLocation ? (
                      <div className="p-2 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            Auto-detected: <strong>{quickLocation.distanceMeters < 1000 ? `${quickLocation.distanceMeters}m` : `${quickLocation.distanceKm.toFixed(1)} km`}</strong> away.
                            {quickLocation.isUnder500m ? ' (Reduced Fee: FREE ₹0 applied!)' : ' (Within 10 km zone)'}
                          </span>
                        </div>
                        <button
                          onClick={onOpenCart}
                          className="text-[10px] bg-emerald-500 text-neutral-950 font-bold px-2 py-0.5 rounded cursor-pointer hover:bg-emerald-400"
                        >
                          Fill In Cart
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-neutral-400">
                        💡 Click &apos;Auto-Detect My Location&apos; or open your cart to automatically select your distance bracket and auto-fill your delivery address.
                      </p>
                    )}
                    {detectionError && (
                      <div className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{detectionError}</span>
                      </div>
                    )}
                  </div>
                ) : currentType === 'takeaway' ? (
                  <div className="space-y-1 text-xs text-neutral-300">
                    <p className="leading-relaxed">
                      <strong className="text-white">Counter Collection Hub:</strong> Firey Treat, Opposite DCCB Bank, Tirupati Road, Pachikapalem.
                    </p>
                    <ul className="text-[11px] text-neutral-400 space-y-0.5 list-disc list-inside">
                      <li>Your order will be ready in approximately <strong className="text-amber-400">10–15 minutes</strong>.</li>
                      <li>Show your WhatsApp order confirmation at the billing counter.</li>
                      <li>Food is securely sealed in hot thermal boxes with complimentary dips & napkins.</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-1 text-xs text-neutral-300">
                    <p className="leading-relaxed">
                      <strong className="text-white">Table Dining:</strong> Prepared fresh by our master kitchen.
                    </p>
                    <ul className="text-[11px] text-neutral-400 space-y-0.5 list-disc list-inside">
                      <li>Enter your table number in the cart drawer.</li>
                      <li>Estimated preparation: <strong className="text-amber-400">10–15 minutes</strong>.</li>
                      <li>Our team will serve hot crispy delicacies directly to your table.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Mock Order Preparation Stepper */}
              <div className="mt-3 pt-2.5 border-t border-neutral-800/80">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  <span>Mock Order Flow:</span>
                  <span className="text-amber-400">Step 1 of 4: Items in Cart</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                  <div className="py-1 px-1.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span className="truncate">1. In Cart</span>
                  </div>
                  <div className="py-1 px-1.5 rounded bg-neutral-800/90 border border-neutral-700 text-amber-300 font-semibold flex items-center justify-center gap-1">
                    <span className="truncate">2. WhatsApp</span>
                  </div>
                  <div className="py-1 px-1.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-center gap-1">
                    <Flame className="w-2.5 h-2.5" />
                    <span className="truncate">3. Cooking</span>
                  </div>
                  <div className="py-1 px-1.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-center gap-1">
                    <PackageCheck className="w-2.5 h-2.5" />
                    <span className="truncate">4. Ready</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    );
  }

  // Drawer variant (compact inside cart)
  return (
    <div className="p-3 rounded-xl bg-neutral-900/90 border border-amber-500/30 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-white uppercase tracking-wider">
            Order Status & Estimates
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {activeOrderType === 'delivery'
              ? detectedLocation?.isUnder500m ? '15–20 Mins' : '25–35 Mins'
              : '10–15 Mins'}
          </span>
        </div>
      </div>

      <div className="text-[11px] text-neutral-300 leading-tight">
        {activeOrderType === 'delivery' ? (
          <p>
            🛵 <strong>Delivery Time:</strong> 25–35 mins within 10 km from Pachikapalem hub.{' '}
            <span className="text-emerald-400 font-semibold">FREE delivery below 500m!</span>
          </p>
        ) : activeOrderType === 'takeaway' ? (
          <p>
            🥡 <strong>Pickup Instructions:</strong> Ready in 10–15 mins at Pachikapalem counter (Opposite DCCB Bank). Show WhatsApp message to collect.
          </p>
        ) : (
          <p>
            🍽️ <strong>Dine-In:</strong> Prepared fresh in 10–15 mins and served hot to your table.
          </p>
        )}
      </div>

      {/* Mini Stepper */}
      <div className="pt-1.5 border-t border-neutral-800/80 flex items-center justify-between text-[9px] text-neutral-400 font-medium">
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          1. Cart Selected
        </span>
        <span>→</span>
        <span className="text-amber-300 font-semibold">2. WhatsApp Order</span>
        <span>→</span>
        <span>3. Fresh Prep</span>
        <span>→</span>
        <span>4. Dispatch</span>
      </div>
    </div>
  );
};
