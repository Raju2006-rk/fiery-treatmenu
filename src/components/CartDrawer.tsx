import React, { useState } from 'react';
import { CartItem, OrderType } from '../types';
import { RESTAURANT_INFO } from '../data/menuData';
import { DietaryIndicator } from './DietaryIndicator';
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
  Clock
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const packingCharge = orderType === 'dine_in' ? 0 : cart.length > 0 ? 15 : 0;
  const deliveryFee = orderType === 'delivery' ? (subtotal > 499 ? 0 : 30) : 0;
  const grandTotal = subtotal + packingCharge + deliveryFee;

  const handleNoteChange = (itemId: string, note: string) => {
    setItemNotes((prev) => ({ ...prev, [itemId]: note }));
  };

  const generateWhatsAppMessage = () => {
    let msg = `🔥 *ORDER FOR FIREY TREAT RESTAURANT* 🔥\n`;
    msg += `--------------------------------\n`;
    msg += `*Order Type:* ${
      orderType === 'delivery'
        ? '🛵 Home Delivery'
        : orderType === 'dine_in'
        ? `🍽️ Dine-In (Table ${tableNumber || 'N/A'})`
        : '🥡 Takeaway / Parcel'
    }\n`;

    if (customerName) msg += `*Customer:* ${customerName}\n`;
    if (customerPhone) msg += `*Phone:* ${customerPhone}\n`;
    if (orderType === 'delivery' && deliveryAddress) {
      msg += `*Address:* ${deliveryAddress}\n`;
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
    if (packingCharge > 0) msg += `*Packing Charge:* ₹${packingCharge}\n`;
    if (deliveryFee > 0) msg += `*Delivery Fee:* ₹${deliveryFee}\n`;
    if (orderType === 'delivery' && subtotal > 499) {
      msg += `*Delivery:* FREE (Orders above ₹499)\n`;
    }
    msg += `*GRAND TOTAL:* ₹${grandTotal}\n`;

    if (specialInstructions) {
      msg += `--------------------------------\n`;
      msg += `*Instructions:* ${specialInstructions}\n`;
    }

    msg += `--------------------------------\n`;
    msg += `Please confirm my order. Thank you!`;

    return encodeURIComponent(msg);
  };

  const handleWhatsAppSend = () => {
    const encoded = generateWhatsAppMessage();
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
                      onClick={() => setOrderType('delivery')}
                      className={`py-2 rounded-lg font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        orderType === 'delivery'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Delivery</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('dine_in')}
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
                      onClick={() => setOrderType('takeaway')}
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
                    <div>
                      <label className="text-[11px] text-neutral-400 block mb-1">Delivery Address & Landmark</label>
                      <textarea
                        rows={2}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Street, Building name, Flat No, Landmark..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Order Notes / Kitchen Instructions</label>
                    <input
                      type="text"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="e.g., Deliver hot, keep forks & tissues..."
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
                  {packingCharge > 0 && (
                    <div className="flex justify-between text-neutral-400">
                      <span>Packaging & Containers</span>
                      <span>₹{packingCharge}</span>
                    </div>
                  )}
                  {orderType === 'delivery' && (
                    <div className="flex justify-between text-neutral-400">
                      <span>Delivery Fee</span>
                      <span>
                        {deliveryFee === 0 ? (
                          <span className="text-emerald-400 font-bold">FREE</span>
                        ) : (
                          `₹${deliveryFee}`
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
              <button
                id="btn-send-whatsapp-order"
                onClick={handleWhatsAppSend}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Order via WhatsApp (₹{grandTotal})</span>
              </button>

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
