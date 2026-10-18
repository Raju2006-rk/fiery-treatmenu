import React, { useState, useEffect, useMemo } from 'react';
import { CartItem, OrderType, OrderDetails } from '../types';
import { RESTAURANT_INFO } from '../data/menuData';
import { 
  getAccessToken, 
  pushOrderToAllGoogleChannels 
} from '../services/googleWorkspace';
import { 
  calculateDistanceKm, 
  evaluateDeliveryDistance, 
  DISTANCE_PRESETS, 
  RESTAURANT_COORDINATES, 
  DistanceBracket,
  DistanceInfo,
  autoDetectAndSelectLocation,
  DetectedLocationResult
} from '../utils/distance';
import { DietaryIndicator } from './DietaryIndicator';
import { OrderStatusIndicator } from './OrderStatusIndicator';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  MessageCircle, 
  PhoneCall, 
  Truck, 
  ShoppingBag, 
  UtensilsCrossed, 
  AlertCircle,
  Clock,
  MapPin,
  Compass,
  Navigation,
  CheckCircle2,
  Sparkles,
  Loader2,
  Check,
  Lock,
  Unlock,
  ShieldAlert,
  Heart,
  Users
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  externalOrderType?: OrderType;
  onExternalOrderTypeChange?: (type: OrderType) => void;
  externalLocation?: DetectedLocationResult | null;
  onLocationDetected?: (result: DetectedLocationResult) => void;
  onOrderPlaced?: (order: OrderDetails) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  externalOrderType,
  onExternalOrderTypeChange,
  externalLocation,
  onLocationDetected,
  onOrderPlaced,
}) => {
  const [orderType, setOrderType] = useState<OrderType>(externalOrderType || 'delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [addressAutoFilled, setAddressAutoFilled] = useState(false);

  // Feature: Order for Family / Relatives when sender is outside the 10km radius
  const [isOrderingForFamily, setIsOrderingForFamily] = useState(false);
  const [familyRecipientName, setFamilyRecipientName] = useState('');
  const [familyRecipientPhone, setFamilyRecipientPhone] = useState('');
  const [familyRelationship, setFamilyRelationship] = useState('Parents');

  // Sync external order type if changed
  useEffect(() => {
    if (externalOrderType && externalOrderType !== orderType) {
      setOrderType(externalOrderType);
    }
  }, [externalOrderType]);

  // Sync external detected location if provided and calculate distance to restaurant
  useEffect(() => {
    if (externalLocation) {
      const calculatedDist = calculateDistanceKm(
        externalLocation.latitude,
        externalLocation.longitude,
        RESTAURANT_COORDINATES.latitude,
        RESTAURANT_COORDINATES.longitude
      );
      setDetectedDistanceKm(calculatedDist);
      setUserCoords({ lat: externalLocation.latitude, lng: externalLocation.longitude });
      setSelectedBracket(calculatedDist > RESTAURANT_COORDINATES.maxDeliveryRadiusKm ? 'above_10km' : externalLocation.bracket);
      if (!deliveryAddress || addressAutoFilled) {
        setDeliveryAddress(externalLocation.suggestedAddress);
        setAddressAutoFilled(true);
      }
    }
  }, [externalLocation]);

  // Distance & Radius Calculation State (10 km limit, <500m reduced fee)
  const [selectedBracket, setSelectedBracket] = useState<DistanceBracket>('under_500m');
  const [detectedDistanceKm, setDetectedDistanceKm] = useState<number | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [locationError, setLocationError] = useState<string>('');

  // Explicit radius-check logic: calculates distance between detected user location and restaurant
  const calculatedDistanceKm: number | null = useMemo(() => {
    if (userCoords) {
      return calculateDistanceKm(
        userCoords.lat,
        userCoords.lng,
        RESTAURANT_COORDINATES.latitude,
        RESTAURANT_COORDINATES.longitude
      );
    }
    if (detectedDistanceKm !== null) {
      return detectedDistanceKm;
    }
    return null;
  }, [userCoords, detectedDistanceKm]);

  // Check if distance exceeds 10km radius (exempt if ordering for family residing in Pachikapalem)
  const isDistanceExceeding10km = useMemo(() => {
    if (isOrderingForFamily) {
      return false;
    }
    if (calculatedDistanceKm !== null) {
      return calculatedDistanceKm > RESTAURANT_COORDINATES.maxDeliveryRadiusKm;
    }
    return selectedBracket === 'above_10km';
  }, [isOrderingForFamily, calculatedDistanceKm, selectedBracket]);

  // Customer is out of 10 km radius: hide distance options and lock until auto-detected below 10 km OR ordering for family
  const isCustomerOutOfRadius = useMemo(() => {
    if (isOrderingForFamily) {
      return false;
    }
    if (calculatedDistanceKm !== null) {
      return calculatedDistanceKm > RESTAURANT_COORDINATES.maxDeliveryRadiusKm;
    }
    if (externalLocation && !externalLocation.isWithin10km) {
      return true;
    }
    return selectedBracket === 'above_10km';
  }, [isOrderingForFamily, calculatedDistanceKm, externalLocation, selectedBracket]);

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  // Compute active distance info (only 0-500m is free, 500m-6km: ₹30, 6km-10km: ₹40, >10km: unable to deliver)
  const effectiveDistanceKm = isOrderingForFamily
    ? (DISTANCE_PRESETS.find(p => p.id === (selectedBracket === 'above_10km' ? 'between_500m_and_6km' : selectedBracket))?.typicalKm ?? 1.5)
    : (calculatedDistanceKm !== null 
        ? calculatedDistanceKm 
        : (selectedBracket === 'above_10km' ? 12.0 : (DISTANCE_PRESETS.find(p => p.id === selectedBracket)?.typicalKm ?? 0.35)));

  const deliveryInfo: DistanceInfo = evaluateDeliveryDistance(effectiveDistanceKm);
  const isDeliveryAbove10km = orderType === 'delivery' && !isOrderingForFamily && (isDistanceExceeding10km || !deliveryInfo.isWithin10km || effectiveDistanceKm > RESTAURANT_COORDINATES.maxDeliveryRadiusKm);
  const deliveryFee = orderType === 'delivery' ? (isDeliveryAbove10km ? 0 : deliveryInfo.calculatedFee) : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleNoteChange = (itemId: string, note: string) => {
    setItemNotes((prev) => ({ ...prev, [itemId]: note }));
  };

  const handleDetectLocation = async () => {
    setIsLocating(true);
    setLocationError('');
    setLocationStatus('Pinpointing your location via GPS & calculating distance to restaurant...');

    try {
      const result = await autoDetectAndSelectLocation();
      // Explicit radius-check calculation between detected user location and restaurant
      const distKm = calculateDistanceKm(
        result.latitude,
        result.longitude,
        RESTAURANT_COORDINATES.latitude,
        RESTAURANT_COORDINATES.longitude
      );
      const distMeters = Math.round(distKm * 1000);

      setDetectedDistanceKm(distKm);
      setUserCoords({ lat: result.latitude, lng: result.longitude });
      setSelectedBracket(distKm > RESTAURANT_COORDINATES.maxDeliveryRadiusKm ? 'above_10km' : result.bracket);
      
      // Auto-fill delivery address with resolved location and landmark
      setDeliveryAddress(result.suggestedAddress);
      setAddressAutoFilled(true);

      if (distKm <= RESTAURANT_COORDINATES.maxDeliveryRadiusKm) {
        if (distMeters <= RESTAURANT_COORDINATES.reducedFeeThresholdMeters) {
          setLocationStatus(`📍 Located! You are ${distMeters}m away (< 500m). Free delivery (₹0) automatically applied!`);
        } else if (distKm <= 6) {
          setLocationStatus(`📍 Located! ${distKm.toFixed(2)} km away (500m–6km zone). Delivery fee: ₹30 applied.`);
        } else {
          setLocationStatus(`📍 Located! ${distKm.toFixed(2)} km away (6km–10km zone). Delivery fee: ₹40 applied.`);
        }
      } else {
        setLocationStatus(`🚫 Delivery unavailable: Distance is ${distKm.toFixed(2)} km, which exceeds our 10 km delivery radius. Delivery options are hidden and checkout is restricted.`);
      }

      if (onLocationDetected) {
        onLocationDetected({
          ...result,
          distanceKm: distKm,
          distanceMeters: distMeters,
          bracket: distKm > RESTAURANT_COORDINATES.maxDeliveryRadiusKm ? 'above_10km' : result.bracket,
          isWithin10km: distKm <= RESTAURANT_COORDINATES.maxDeliveryRadiusKm,
          isDeliveryAvailable: distKm <= RESTAURANT_COORDINATES.maxDeliveryRadiusKm
        });
      }
    } catch (error: unknown) {
      let errorMsg = 'Could not access GPS location. Please allow browser location permissions to verify delivery radius.';
      if (error && typeof error === 'object' && 'code' in error) {
        const geoErr = error as { code: number };
        if (geoErr.code === 1) {
          errorMsg = 'Location permission was denied. Please allow location access in your browser.';
        } else if (geoErr.code === 2) {
          errorMsg = 'GPS location is currently unavailable. Please turn on device location services.';
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      setLocationError(errorMsg);
    } finally {
      setIsLocating(false);
    }
  };

  const generateWhatsAppMessage = () => {
    if (isDeliveryAbove10km) {
      return '';
    }

    let msg = `🔥 *ORDER FOR FIREY TREAT RESTAURANT* 🔥\n`;
    msg += `--------------------------------\n`;
    msg += `*Order Type:* ${
      orderType === 'delivery'
        ? '🛵 Home Delivery'
        : orderType === 'dine_in'
        ? `🍽️ Dine-In (Table ${tableNumber || 'N/A'})`
        : '🥡 Takeaway / Parcel'
    }\n`;

    if (!isOrderingForFamily) {
      if (customerName) msg += `*Customer:* ${customerName}\n`;
      if (customerPhone) msg += `*Phone:* ${customerPhone}\n`;
    }

    if (orderType === 'delivery') {
      if (isOrderingForFamily) {
        msg += `🎁 *SPECIAL ORDER: ORDERING FOR FAMILY / RELATIVES* 🎁\n`;
        msg += `_(Sender is ordering from outside radius for family residing in Pachikapalem)_\n`;
        msg += `*Recipient (Family Member):* ${familyRecipientName || 'Family Member'}${familyRelationship ? ` (${familyRelationship})` : ''}\n`;
        msg += `*Recipient Phone:* ${familyRecipientPhone || 'N/A'} _(Please call on arrival!)_\n`;
        msg += `*Family Delivery Address:* ${deliveryAddress || 'Pachikapalem'}\n`;
        msg += `*Pachikapalem Distance Zone:* ${deliveryInfo.bracketLabel}\n`;
        if (customerName) msg += `*Sender (Ordered By):* ${customerName}\n`;
        if (customerPhone) msg += `*Sender Phone:* ${customerPhone}\n`;
      } else {
        const distanceDisplay = detectedDistanceKm !== null 
          ? `${Math.round(detectedDistanceKm * 1000)} meters (${detectedDistanceKm.toFixed(2)} km)` 
          : `${deliveryInfo.bracketLabel}`;

        msg += `*Delivery Distance:* ${distanceDisplay} from Pachikapalem\n`;
        msg += `*10km Radius Status:* ${
          deliveryInfo.isUnder500m
            ? '⚡ Below 500m (Reduced Delivery Fee: FREE ₹0)'
            : `✅ Within 10 KM Radius (${deliveryInfo.bracketLabel})`
        }\n`;

        if (userCoords) {
          msg += `*Customer GPS Pin:* https://maps.google.com/?q=${userCoords.lat},${userCoords.lng}\n`;
        }

        if (deliveryAddress) {
          msg += `*Address / Landmark:* ${deliveryAddress}\n`;
        }
      }
    }

    if (orderType === 'dine_in' && tableNumber) {
      msg += `*Table Number:* ${tableNumber}\n`;
    }

    msg += `--------------------------------\n`;
    msg += `*ITEMS:*\n`;

    cart.forEach((item, index) => {
      const note = itemNotes[item.menuItem.id];
      msg += `${index + 1}. ${item.menuItem.name} x ${item.quantity} = ₹${
        item.menuItem.price * item.quantity
      }${note ? ` _(${note})_` : ''}\n`;
    });

    msg += `--------------------------------\n`;
    msg += `*Subtotal:* ₹${subtotal}\n`;

    if (orderType === 'delivery') {
      if (deliveryFee === 0 && deliveryInfo.isUnder500m) {
        msg += `*Delivery Fee:* ₹0 FREE (Below 500m radius!)\n`;
      } else {
        msg += `*Delivery Fee:* ₹${deliveryFee}\n`;
      }
    }

    msg += `*GRAND TOTAL:* ₹${grandTotal}\n`;

    if (specialInstructions) {
      msg += `--------------------------------\n`;
      msg += `*Instructions:* ${specialInstructions}\n`;
    }

    msg += `--------------------------------\n`;
    msg += `📍 *Restaurant Location:* ${RESTAURANT_COORDINATES.mapUrl}\n`;
    msg += `Please confirm my order and dispatch timeline. Thank you!`;

    return encodeURIComponent(msg);
  };

  const handleWhatsAppSend = () => {
    if (isDeliveryAbove10km) {
      return;
    }
    const encoded = generateWhatsAppMessage();
    if (!encoded) return;

    // Construct order details object for CMS and Google Sheets sync
    const newOrder: OrderDetails = {
      id: `FT-${Date.now().toString().slice(-6)}`,
      items: [...cart],
      orderType,
      customerName: isOrderingForFamily
        ? `${familyRecipientName.trim() || 'Family'} (From: ${customerName.trim() || 'Sender'})`
        : customerName.trim() || 'WhatsApp Customer',
      customerPhone: isOrderingForFamily
        ? (familyRecipientPhone.trim() || customerPhone.trim() || '')
        : (customerPhone.trim() || ''),
      address: orderType === 'delivery' 
        ? (deliveryAddress || (userCoords ? `${userCoords.lat.toFixed(5)}, ${userCoords.lng.toFixed(5)}` : 'Local'))
        : undefined,
      tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
      instructions: isOrderingForFamily
        ? `🎁 [Family Order: ${familyRecipientName} (${familyRecipientPhone}) from ${customerName} (${customerPhone})] ${specialInstructions || ''}`.trim()
        : specialInstructions || undefined,
      subtotal,
      deliveryFee,
      grandTotal,
      timestamp: Date.now(),
      status: 'new',
    };

    onOrderPlaced?.(newOrder);

    // Auto-save to Google Sheet & Google Apps Script Web App
    pushOrderToAllGoogleChannels(newOrder).catch((e) => {
      console.error('Google Sheet / Apps Script auto-sync failed:', e);
    });

    const url = `https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-neutral-950 border-l border-neutral-800 text-white flex flex-col shadow-2xl">
          
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-600/20 text-red-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-white">
                  Your Order Cart
                </h2>
                <p className="text-xs text-neutral-400">
                  {cart.length} dish{cart.length === 1 ? '' : 'es'} selected
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-neutral-300">Your cart is empty</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  Explore our authentic menu, add Basmati fried rice, crispy fried chicken, or rolls to start your order!
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-400 text-xs font-bold"
                >
                  Browse Menu Dishes
                </button>
              </div>
            ) : (
              <>
                {/* Order Type Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                    Order Type
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        if (isDistanceExceeding10km) {
                          return;
                        }
                        setOrderType('delivery');
                        onExternalOrderTypeChange?.('delivery');
                      }}
                      disabled={isDistanceExceeding10km}
                      className={`py-2 rounded-lg font-bold flex flex-col items-center gap-1 transition-all ${
                        isDistanceExceeding10km
                          ? 'opacity-40 cursor-not-allowed text-neutral-500 bg-neutral-950/50'
                          : orderType === 'delivery'
                          ? 'bg-red-600 text-white shadow-md cursor-pointer'
                          : 'text-neutral-400 hover:text-white cursor-pointer'
                      }`}
                      title={isDistanceExceeding10km ? 'Delivery unavailable for your location (>10 km)' : 'Home Delivery'}
                    >
                      <div className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        {isDistanceExceeding10km && <Lock className="w-2.5 h-2.5 text-rose-400" />}
                      </div>
                      <span>Delivery {isDistanceExceeding10km ? '(>10km)' : ''}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderType('dine_in');
                        onExternalOrderTypeChange?.('dine_in');
                      }}
                      className={`py-2 rounded-lg font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        orderType === 'dine_in'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>Dine-In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderType('takeaway');
                        onExternalOrderTypeChange?.('takeaway');
                      }}
                      className={`py-2 rounded-lg font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        orderType === 'takeaway'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Takeaway</span>
                    </button>
                  </div>
                </div>

                {/* Live Order Status & Estimates Mock Indicator inside Cart */}
                <OrderStatusIndicator
                  cartCount={cart.length}
                  cartTotal={subtotal}
                  onOpenCart={() => {}}
                  variant="drawer"
                  activeOrderType={orderType}
                  detectedLocation={userCoords && detectedDistanceKm !== null ? {
                    latitude: userCoords.lat,
                    longitude: userCoords.lng,
                    distanceKm: detectedDistanceKm,
                    distanceMeters: Math.round(detectedDistanceKm * 1000),
                    bracket: selectedBracket,
                    suggestedAddress: deliveryAddress,
                    isUnder500m: deliveryInfo.isUnder500m,
                    isWithin10km: deliveryInfo.isWithin10km,
                    calculatedFee: deliveryFee
                  } : null}
                />

                {/* Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase tracking-wider">
                    <span>Order Items</span>
                    <button
                      onClick={onClearCart}
                      className="text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {cart.map((item) => (
                      <div
                        key={item.menuItem.id}
                        className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/90 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1">
                            <DietaryIndicator
                              isVeg={item.menuItem.isVeg}
                              isEgg={item.menuItem.isEgg}
                              size="sm"
                            />
                            <div>
                              <h4 className="font-bold text-sm text-white leading-snug">
                                {item.menuItem.name}
                              </h4>
                              <p className="text-xs text-neutral-400">
                                ₹{item.menuItem.price} each
                              </p>
                            </div>
                          </div>

                          {/* Stepper */}
                          <div className="flex items-center rounded-lg bg-neutral-950 border border-neutral-800 p-0.5">
                            <button
                              onClick={() => onUpdateQuantity(item.menuItem.id, -1)}
                              className="w-6 h-6 rounded bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center transition-colors"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.menuItem.id, 1)}
                              className="w-6 h-6 rounded bg-neutral-900 hover:bg-neutral-800 text-white flex items-center justify-center transition-colors"
                              aria-label="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right min-w-[50px]">
                            <span className="font-bold text-sm text-amber-400">
                              ₹{item.menuItem.price * item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Optional Cooking Note per item */}
                        <input
                          type="text"
                          value={itemNotes[item.menuItem.id] || ''}
                          onChange={(e) => handleNoteChange(item.menuItem.id, e.target.value)}
                          placeholder="Special request (e.g. Less spicy, extra onions)..."
                          className="w-full bg-neutral-950 border border-neutral-800/80 rounded-lg px-2.5 py-1 text-[11px] text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Details Form */}
                <div className="space-y-3 pt-2 border-t border-neutral-800">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">
                    Customer Information
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Your Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Rahul"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {orderType === 'dine_in' && (
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Table Number</label>
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="e.g. Table 4"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  )}

                  {orderType === 'delivery' && (
                    <div className="space-y-3 p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          <span>Delivery Distance & 10 KM Zone</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 font-bold">
                          10 km Radius
                        </span>
                      </div>

                      {/* Feature: Order for Family / Relatives in Pachikapalem (Out-of-Radius Friendly) */}
                      <div className={`p-3 rounded-xl border transition-all ${
                        isOrderingForFamily
                          ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-950/60'
                          : 'bg-neutral-950 border-neutral-800 hover:border-amber-500/30'
                      }`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className={`p-2 rounded-lg mt-0.5 ${isOrderingForFamily ? 'bg-amber-500 text-neutral-950' : 'bg-neutral-900 text-amber-400'}`}>
                              <Heart className="w-4 h-4 fill-current" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs text-white">Order for Family / Relatives</span>
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold uppercase tracking-wider">
                                  Out-of-Radius Friendly
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                                Are you currently outside our 10 km radius? Send a fresh feast directly to your parents, family, or friends residing in Pachikapalem!
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const next = !isOrderingForFamily;
                              setIsOrderingForFamily(next);
                              if (next && selectedBracket === 'above_10km') {
                                setSelectedBracket('between_500m_and_6km');
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                              isOrderingForFamily
                                ? 'bg-amber-500 text-neutral-950 shadow-md font-extrabold'
                                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                            }`}
                          >
                            {isOrderingForFamily ? 'Enabled ✓' : 'Enable'}
                          </button>
                        </div>

                        {/* Family Recipient Form when Enabled */}
                        {isOrderingForFamily && (
                          <div className="mt-3 pt-3 border-t border-amber-500/30 space-y-2.5 animate-fadeIn">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                                <Users className="w-3 h-3" /> Family Recipient Details (In Pachikapalem)
                              </span>
                              <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/80">
                                🔓 Delivery Radius Unlocked
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-neutral-400 block mb-1">
                                  Family Member Name <span className="text-amber-400">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={familyRecipientName}
                                  onChange={(e) => setFamilyRecipientName(e.target.value)}
                                  placeholder="e.g. Dad / Mom / Suresh"
                                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-neutral-400 block mb-1">
                                  Recipient Phone (for Rider) <span className="text-amber-400">*</span>
                                </label>
                                <input
                                  type="tel"
                                  value={familyRecipientPhone}
                                  onChange={(e) => setFamilyRecipientPhone(e.target.value)}
                                  placeholder="e.g. 9848012345"
                                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] text-neutral-400 block mb-1">
                                Who are you ordering for? (Optional tag)
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                {['Parents', 'Spouse', 'Children', 'Siblings', 'Relatives', 'Friends'].map((rel) => (
                                  <button
                                    key={rel}
                                    type="button"
                                    onClick={() => setFamilyRelationship(rel === familyRelationship ? '' : rel)}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer border ${
                                      familyRelationship === rel
                                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                                    }`}
                                  >
                                    {rel}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Rule Highlight Callout */}
                      <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span>Below 500 Meters: Special Reduced Delivery Charge (₹0 / FREE)!</span>
                        </div>
                        <p className="text-neutral-400 text-[10px] leading-tight">
                          Dispatched from <a href={RESTAURANT_COORDINATES.mapUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline inline-flex items-center gap-0.5">Pachikapalem Hub <Navigation className="w-2.5 h-2.5" /></a> within 10 km.
                        </p>
                      </div>

                      {/* GPS Detection Button with Auto-Fill Feature (Only if NOT ordering for remote family) */}
                      {!isOrderingForFamily && (
                        <div>
                          <button
                            type="button"
                            onClick={handleDetectLocation}
                            disabled={isLocating}
                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-neutral-950 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-amber-950/40"
                          >
                            {isLocating ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-neutral-950" />
                                <span>Detecting GPS Location & Auto-Filling...</span>
                              </>
                            ) : (
                              <>
                                <Compass className="w-4 h-4 text-neutral-950" />
                                <span>Auto-Detect & Fill Location (GPS)</span>
                              </>
                            )}
                          </button>

                          {/* Location status or error */}
                          {locationStatus && (
                            <div className={`mt-2 p-2.5 rounded-lg text-xs flex items-start gap-1.5 ${
                              deliveryInfo.isUnder500m
                                ? 'bg-emerald-950/80 border border-emerald-800/80 text-emerald-300'
                                : deliveryInfo.isWithin10km
                                ? 'bg-blue-950/80 border border-blue-800/80 text-blue-300'
                                : 'bg-rose-950/80 border border-rose-800/80 text-rose-300'
                            }`}>
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span className="leading-tight">{locationStatus}</span>
                            </div>
                          )}

                          {locationError && (
                            <div className="mt-2 p-2 rounded-lg bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span className="leading-tight">{locationError}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Distance Range Picker (or Family Delivery Zone) */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-neutral-400 uppercase font-bold flex items-center gap-1.5">
                            {isOrderingForFamily ? (
                              <>
                                <Heart className="w-3 h-3 text-amber-400 fill-current" />
                                <span className="text-amber-300">Family Location Distance from Pachikapalem:</span>
                              </>
                            ) : isCustomerOutOfRadius ? (
                              <>
                                <Lock className="w-3 h-3 text-rose-500" />
                                <span className="text-rose-400">Distance Options Locked (&gt;10 km)</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3 h-3 text-emerald-400" />
                                <span>Select Distance from Pachikapalem:</span>
                              </>
                            )}
                          </label>
                          <span className={`text-[10px] font-semibold ${isOrderingForFamily ? 'text-emerald-400 font-bold' : isCustomerOutOfRadius ? 'text-rose-400' : 'text-neutral-500'}`}>
                            {isOrderingForFamily ? 'Family Zone' : 'Max limit: 10 km'}
                          </span>
                        </div>

                        {/* If customer is OUT of 10 km radius and NOT ordering for family: Lock */}
                        {isCustomerOutOfRadius ? (
                          <div className="p-3.5 rounded-xl bg-neutral-950 border border-rose-800/80 space-y-3 shadow-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs sm:text-sm">
                                <Lock className="w-4 h-4 text-rose-500 shrink-0" />
                                <span>Delivery Locked: Out of 10 KM Radius</span>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/80">
                                🔒 Locked
                              </span>
                            </div>

                            <p className="text-[11px] leading-relaxed text-neutral-300">
                              The 3 delivery distance options from Pachikapalem are <strong className="text-rose-300">locked and hidden</strong> because your location is beyond our 10 km delivery radius {detectedDistanceKm !== null ? `(${detectedDistanceKm.toFixed(2)} km away)` : '(more than 10 km away)'}.
                            </p>

                            {/* Quick Unlock for Family Feature */}
                            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/60 to-neutral-900 border border-amber-500/40 space-y-2">
                              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                                <Heart className="w-4 h-4 fill-current text-rose-400 shrink-0" />
                                <span>Are you ordering for family in Pachikapalem?</span>
                              </div>
                              <p className="text-[11px] text-neutral-300 leading-snug">
                                You can order remotely from anywhere! If your family or relatives live within 10 km of Pachikapalem, enable &quot;Order for Family&quot; to unlock delivery immediately.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsOrderingForFamily(true);
                                  setSelectedBracket('between_500m_and_6km');
                                }}
                                className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow"
                              >
                                <Heart className="w-3.5 h-3.5 fill-current" />
                                <span>Unlock &amp; Order for Family in Pachikapalem</span>
                              </button>
                            </div>

                            <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-800/80 text-[11px] text-rose-200 flex items-start gap-2">
                              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="font-bold text-rose-300 block">How else to Unlock:</span>
                                <span>
                                  Unlocks if customer is physically in radius <strong>below 10 km</strong> using <strong>&quot;Auto-Detect &amp; Fill Location (GPS)&quot;</strong> above.
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 pt-1">
                              <button
                                type="button"
                                onClick={handleDetectLocation}
                                disabled={isLocating}
                                className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow disabled:opacity-50"
                              >
                                {isLocating ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Verifying GPS...</span>
                                  </>
                                ) : (
                                  <>
                                    <Compass className="w-3.5 h-3.5" />
                                    <span>Auto-Detect &amp; Unlock</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOrderType('takeaway');
                                  onExternalOrderTypeChange?.('takeaway');
                                }}
                                className="flex-1 py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Switch to Takeaway</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Within 10 km radius OR Ordering for Family: Show the 3 distance options */
                          <div className="space-y-1">
                            {isOrderingForFamily && (
                              <p className="text-[10px] text-amber-300/90 pb-1">
                                Select your family&apos;s distance zone from Pachikapalem:
                              </p>
                            )}
                            {DISTANCE_PRESETS.filter((p) => p.id !== 'above_10km').map((preset) => {
                              const isSelected = selectedBracket === preset.id && (isOrderingForFamily || detectedDistanceKm === null);
                              const isAutoActive = !isOrderingForFamily && selectedBracket === preset.id && detectedDistanceKm !== null;
                              const isUnder500 = preset.id === 'under_500m';

                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedBracket(preset.id);
                                    if (preset.id === 'above_10km') {
                                      setDetectedDistanceKm(12.0);
                                    } else {
                                      setDetectedDistanceKm(null);
                                    }
                                    setLocationStatus('');
                                    setLocationError('');
                                  }}
                                  className={`w-full p-2 rounded-lg text-left text-xs transition-all border flex items-center justify-between cursor-pointer ${
                                    isSelected || isAutoActive
                                      ? isUnder500
                                        ? 'bg-emerald-950/60 border-emerald-500 text-white font-semibold'
                                        : 'bg-amber-950/50 border-amber-500 text-white font-semibold'
                                      : 'bg-neutral-950 hover:bg-neutral-800/60 border-neutral-800 text-neutral-300'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold">{preset.label}</span>
                                      {isUnder500 && (
                                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                                          FREE (₹0)
                                        </span>
                                      )}
                                      {isAutoActive && (
                                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold">
                                          GPS Detected
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-neutral-400 block">
                                      {preset.subLabel}
                                    </span>
                                  </div>
                                  <span className={`text-[11px] font-bold shrink-0 ml-2 ${
                                    isUnder500 ? 'text-emerald-400' : 'text-neutral-300 font-semibold'
                                  }`}>
                                    {preset.feeNotice}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Unable to Deliver Alert if customer is > 10 km (and NOT ordering for family) */}
                        {isDeliveryAbove10km && !isCustomerOutOfRadius && !isOrderingForFamily && (
                          <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-600/80 text-rose-200 text-xs space-y-1.5 shadow-lg mt-2 animate-fadeIn">
                            <div className="flex items-center gap-1.5 font-bold text-rose-300 text-xs sm:text-sm">
                              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                              <span>Unable to Deliver Above 10 KM</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-rose-200/90">
                              Online WhatsApp delivery is not available beyond 10 km radius from Pachikapalem.
                            </p>
                            <p className="text-[11px] text-rose-300 font-semibold">
                              👉 Please select <strong>Takeaway (Counter Pickup)</strong> to place your WhatsApp order, or call us directly.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setOrderType('takeaway');
                                onExternalOrderTypeChange?.('takeaway');
                              }}
                              className="w-full mt-1.5 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Switch to Takeaway &amp; Proceed</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Delivery Address & Landmark Input with Auto-Fill Status */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] text-neutral-400 block font-medium">
                            {isOrderingForFamily ? (
                              <span className="text-amber-300 font-bold">
                                Family Home Delivery Address in Pachikapalem Area <span className="text-rose-400">*</span>
                              </span>
                            ) : (
                              'Delivery Address & Landmark'
                            )}
                          </label>
                          {addressAutoFilled && !isOrderingForFamily && (
                            <span className="text-[9px] text-emerald-300 bg-emerald-950/90 border border-emerald-800/80 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Auto-Filled from GPS
                            </span>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          value={deliveryAddress}
                          onChange={(e) => {
                            setDeliveryAddress(e.target.value);
                            setAddressAutoFilled(false);
                          }}
                          placeholder={
                            isOrderingForFamily
                              ? "House #, Street, Landmark in Pachikapalem (e.g. Near ZP High School / Ramalayam / DCCB Bank)..."
                              : "House/Plot No, Street, Landmark near Pachikapalem..."
                          }
                          className={`w-full bg-neutral-950 border rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none resize-none ${
                            isOrderingForFamily
                              ? 'border-amber-500/50 focus:border-amber-400'
                              : 'border-neutral-800 focus:border-amber-500'
                          }`}
                        />
                        {addressAutoFilled && !isOrderingForFamily && (
                          <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-400">
                            <span>You can edit or add specific house/flat number</span>
                            <button
                              type="button"
                              onClick={() => {
                                setDeliveryAddress('');
                                setAddressAutoFilled(false);
                              }}
                              className="text-rose-400 hover:text-rose-300 cursor-pointer"
                            >
                              Clear
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Order Notes / Kitchen Instructions</label>
                    <input
                      type="text"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g., Deliver hot, keep extra spoons & tissues..."
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-300">
                    <span>Items Subtotal</span>
                    <span className="font-semibold">₹{subtotal}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between text-neutral-400 items-center">
                      <div className="flex items-center gap-1.5">
                        <span>Delivery Charge</span>
                        {deliveryInfo.isUnder500m && (
                          <span className="text-[9px] text-emerald-300 font-bold bg-emerald-950 border border-emerald-800/80 px-1.5 py-0.5 rounded">
                            Below 500m (FREE)
                          </span>
                        )}
                        {isDeliveryAbove10km && (
                          <span className="text-[9px] text-rose-300 font-bold bg-rose-950 border border-rose-800/80 px-1.5 py-0.5 rounded">
                            Above 10 km (Unavailable)
                          </span>
                        )}
                      </div>
                      <span>
                        {isDeliveryAbove10km ? (
                          <span className="text-rose-400 font-bold">Unavailable (&gt;10 km)</span>
                        ) : deliveryFee === 0 ? (
                          <span className="text-emerald-400 font-bold">FREE (₹0)</span>
                        ) : (
                          <span className="font-semibold text-neutral-200">₹{deliveryFee}</span>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-neutral-800 flex justify-between text-sm font-bold text-white">
                    <span>Grand Total</span>
                    <span className="text-amber-400 font-display text-base">
                      ₹{grandTotal}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer Actions */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-900/60 space-y-2">
              {isDeliveryAbove10km ? (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-center">
                    <p className="text-xs font-bold text-rose-300">
                      🚫 Unable to Deliver Above 10 KM
                    </p>
                    <p className="text-[10px] text-neutral-300 mt-0.5">
                      Online WhatsApp delivery is not accepted for locations above 10 km.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setOrderType('takeaway');
                      onExternalOrderTypeChange?.('takeaway');
                    }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Switch to Takeaway & Order via WhatsApp</span>
                  </button>

                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                  >
                    <X className="w-4 h-4" />
                    <span>Delivery Not Available Above 10 km</span>
                  </button>
                </div>
              ) : (
                <button
                  id="btn-send-whatsapp-order"
                  onClick={handleWhatsAppSend}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  {isOrderingForFamily ? (
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-current text-rose-300" />
                      <span>Send Feast to Family via WhatsApp (₹{grandTotal})</span>
                    </span>
                  ) : (
                    <span>Order via WhatsApp (₹{grandTotal})</span>
                  )}
                </button>
              )}

              <div className="flex gap-2">
                <a
                  href={`tel:${RESTAURANT_INFO.phone1}`}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call {RESTAURANT_INFO.phone1}</span>
                </a>
                <a
                  href={`tel:${RESTAURANT_INFO.phone2}`}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Call {RESTAURANT_INFO.phone2}</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
