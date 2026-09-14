import React, { useState } from 'react';
import { 
  Flame, 
  PhoneCall, 
  ShoppingBag, 
  Settings, 
  Menu as MenuIcon, 
  X,
  MessageCircle
} from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  activeCategory: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Brand */}
          <div 
            id="brand-logo" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-950/50 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-white uppercase group-hover:text-amber-400 transition-colors">
                  Firey Treat
                </span>
                <span className="bg-red-600/30 border border-red-500/40 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
                  Veg & Non-Veg
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium tracking-wide">
                Restaurant & Fast Food
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
            <button
              id="nav-link-menu"
              onClick={() => handleNavClick('menu-section')}
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer"
            >
              Menu
            </button>
            <button
              id="nav-link-basmati"
              onClick={() => handleNavClick('basmati-highlight')}
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer flex items-center gap-1 text-amber-400 font-semibold"
            >
              <span>🍚</span> Basmathi Rice
            </button>
            <button
              id="nav-link-location"
              onClick={() => handleNavClick('location-section')}
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer"
            >
              Contact & Hours
            </button>
          </nav>

          {/* Right Actions (Call, WhatsApp, Admin, Cart) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Call Button */}
            <a
              id="btn-call-restaurant"
              href={`tel:${RESTAURANT_INFO.phone1}`}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
              title="Direct Phone Call"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>{RESTAURANT_INFO.phone1}</span>
            </a>

            {/* WhatsApp Quick Order CTA */}
            <a
              id="btn-whatsapp-chat"
              href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(
                "Hello Firey Treat Restaurant! I would like to place an order."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/50 rounded-lg transition-colors"
              title="Order on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>

            {/* Admin CMS Button */}
            <button
              id="btn-open-admin-modal"
              onClick={onOpenAdmin}
              className="p-2 text-neutral-400 hover:text-amber-400 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
              title="Staff Menu Management (Admin)"
              aria-label="Staff Menu Management"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Cart Button */}
            <button
              id="btn-open-cart"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl font-semibold text-sm shadow-md shadow-red-950/50 hover:shadow-red-900/60 transition-all cursor-pointer"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden xs:inline">Cart</span>
              {cartCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="bg-white text-red-700 text-xs font-bold px-1.5 py-0.2 rounded-full">
                    {cartCount}
                  </span>
                  <span className="text-xs font-bold text-amber-100 hidden sm:inline">
                    ₹{cartTotal}
                  </span>
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-400 hover:text-white bg-neutral-900 rounded-lg border border-neutral-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-800/80 bg-neutral-950/95 space-y-2">
            <button
              onClick={() => handleNavClick('menu-section')}
              className="w-full text-left px-3 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-900 rounded-lg"
            >
              View Full Menu
            </button>
            <button
              onClick={() => handleNavClick('basmati-highlight')}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-amber-400 hover:bg-neutral-900 rounded-lg flex items-center gap-2"
            >
              <span>🍚</span> Basmathi Rice Delights
            </button>
            <button
              onClick={() => handleNavClick('location-section')}
              className="w-full text-left px-3 py-2 text-sm font-medium text-neutral-200 hover:bg-neutral-900 rounded-lg"
            >
              Hours, Location & Phone Numbers
            </button>
            <div className="pt-2 border-t border-neutral-900 flex flex-col gap-2">
              <a
                href={`tel:${RESTAURANT_INFO.phone1}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                Call {RESTAURANT_INFO.formattedPhone1}
              </a>
              <a
                href={`tel:${RESTAURANT_INFO.phone2}`}
                className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-neutral-300 bg-neutral-900/60 rounded-lg"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                Alt: {RESTAURANT_INFO.formattedPhone2}
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
