import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  PhoneCall, 
  ShoppingBag, 
  Settings, 
  Menu as MenuIcon, 
  X, 
  MessageCircle, 
  Lock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { RESTAURANT_INFO } from '../data/menuData';
import fireyTreatLogo from '../assets/images/firey_treat_logo.svg';

const PROMO_ANNOUNCEMENTS = [
  {
    id: 'delivery',
    badge: 'FREE DELIVERY',
    text: 'Free Home Delivery below 500m & fast delivery up to 10 km across Pachikapalem',
    cta: 'Check Distance',
    targetId: 'location-section',
  },
  {
    id: 'basmathi',
    badge: '100% BASMATHI',
    text: 'Every Fried Rice & Dum Biryani dish is cooked exclusively with long-grain Basmathi Rice',
    cta: 'Explore Rice',
    targetId: 'menu-section',
  },
  {
    id: 'chicken',
    badge: 'DAILY HIT',
    text: 'Crispy Golden Fried Chicken Buckets starting at just ₹79 — Fresh Daily Fry!',
    cta: 'Order Now',
    targetId: 'menu-section',
  },
  {
    id: 'catering',
    badge: 'PARTY COMBOS',
    text: 'Function & Birthday Party Dum Biryani catering combos available at special rates',
    cta: 'View Offers',
    targetId: 'offers-section',
  },
  {
    id: 'value',
    badge: 'VALUE BITES',
    text: 'Egg Rolls ₹59 • Chicken Popcorn ₹80 • Chicken Dum Biryani ₹120 — Fresh & Hot!',
    cta: 'See Menu',
    targetId: 'menu-section',
  },
];

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  activeCategory: string;
  onOpenGoogleWorkspace?: () => void;
  googleUser?: { displayName?: string | null; email?: string | null; photoURL?: string | null } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const [promoPaused, setPromoPaused] = useState(false);
  const [showPromo, setShowPromo] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!showPromo || promoPaused) return;
    const timer = window.setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % PROMO_ANNOUNCEMENTS.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [showPromo, promoPaused]);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const activePromo = PROMO_ANNOUNCEMENTS[promoIndex];

  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 shadow-xl' 
          : 'bg-neutral-950/60 backdrop-blur-sm border-b border-white/5'
      }`}
    >
      {/* Slim Full-Width Rotating Promotional Banner */}
      {showPromo && (
        <div
          onMouseEnter={() => setPromoPaused(true)}
          onMouseLeave={() => setPromoPaused(false)}
          className="w-full bg-gradient-to-r from-red-900 via-amber-700 to-red-900 border-b border-amber-400/25 text-white"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-8.5 py-1.5 flex items-center justify-between gap-2 text-[11px] sm:text-xs">
            <button
              type="button"
              onClick={() =>
                setPromoIndex(
                  (prev) => (prev - 1 + PROMO_ANNOUNCEMENTS.length) % PROMO_ANNOUNCEMENTS.length
                )
              }
              className="hidden sm:inline-flex items-center justify-center w-5 h-5 rounded-full text-amber-200/80 hover:text-white hover:bg-black/20 transition-colors cursor-pointer shrink-0"
              aria-label="Previous announcement"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              key={activePromo.id}
              type="button"
              onClick={() => handleNavClick(activePromo.targetId)}
              className="flex-1 flex items-center justify-center gap-2 text-center truncate cursor-pointer group animate-in fade-in duration-300"
            >
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-950/60 border border-amber-300/30 text-amber-300 font-extrabold text-[10px] tracking-wider uppercase shrink-0">
                <Sparkles className="w-2.5 h-2.5" />
                {activePromo.badge}
              </span>
              <span className="font-medium text-white/95 truncate">
                {activePromo.text}
              </span>
              <span className="hidden md:inline-flex items-center gap-0.5 font-bold text-amber-200 group-hover:text-white underline underline-offset-2 shrink-0">
                {activePromo.cta}
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setPromoIndex((prev) => (prev + 1) % PROMO_ANNOUNCEMENTS.length)
                }
                className="hidden sm:inline-flex items-center justify-center w-5 h-5 rounded-full text-amber-200/80 hover:text-white hover:bg-black/20 transition-colors cursor-pointer"
                aria-label="Next announcement"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowPromo(false)}
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-amber-200/80 hover:text-white hover:bg-black/20 transition-colors cursor-pointer"
                aria-label="Dismiss promotional banner"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Brand */}
          <div 
            id="brand-logo" 
            onClick={() => handleNavClick('top')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 group-hover:scale-105 transition-transform drop-shadow-[0_0_14px_rgba(234,88,12,0.45)]">
              <img
                src={fireyTreatLogo}
                alt="Firey Treat - It's a Fry & Pie Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-white uppercase group-hover:text-amber-400 transition-colors">
                  Firey Treat
                </span>
                <span className="hidden xs:inline-block bg-red-600/30 border border-red-500/40 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
                  Fry &amp; Pie
                </span>
              </div>
              <p className="text-[11px] text-amber-400 font-semibold tracking-wide">
                ESTD. 2022 &bull; PACHIKAPALEM
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-neutral-300">
            <button
              id="nav-link-home"
              onClick={() => handleNavClick('top')}
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer"
            >
              Home
            </button>
            <button
              id="nav-link-menu"
              onClick={() => handleNavClick('menu-section')}
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer"
            >
              Menu
            </button>
            <button
              id="nav-link-signature"
              onClick={() => handleNavClick('signature-section')}
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer"
            >
              Signature
            </button>
            <button
              id="nav-link-offers"
              onClick={() => handleNavClick('offers-section')}
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer flex items-center gap-1"
            >
              <span>🔥</span>
              <span>Offers</span>
            </button>
            <button
              id="nav-link-about"
              onClick={() => handleNavClick('about-section')}
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer"
            >
              About
            </button>
            <button
              id="nav-link-contact"
              onClick={() => handleNavClick('location-section')}
              className="hover:text-amber-400 transition-colors py-1 cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Right Actions (Call, Admin, Cart, Order Now) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct Call Button (Large screen) */}
            <a
              id="btn-call-restaurant"
              href={`tel:${RESTAURANT_INFO.phone1}`}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-200 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors"
              title="Call Restaurant Directly"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
              <span>{RESTAURANT_INFO.phone1}</span>
            </a>

            {/* Admin CMS Button (Owner Protected) */}
            <button
              id="btn-open-admin-modal"
              onClick={onOpenAdmin}
              className="relative p-2.5 text-neutral-400 hover:text-amber-400 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors cursor-pointer group"
              title="Owner Settings (Password Protected)"
              aria-label="Owner Settings"
            >
              <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-neutral-950 rounded-full flex items-center justify-center shadow">
                <Lock className="w-2 h-2" />
              </span>
            </button>

            {/* Shopping Cart Icon & Badge */}
            <button
              id="btn-open-cart"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 sm:px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-semibold text-sm border border-neutral-800 transition-all cursor-pointer"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="hidden xs:inline">Cart</span>
              {cartCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="bg-red-600 text-white text-xs font-black px-1.5 py-0.2 rounded-full">
                    {cartCount}
                  </span>
                  <span className="text-xs font-bold text-amber-300 hidden sm:inline">
                    ₹{cartTotal}
                  </span>
                </span>
              )}
            </button>

            {/* Primary Order Now Button */}
            <button
              onClick={() => handleNavClick('menu-section')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-red-950/50 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Order Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-neutral-400 hover:text-white bg-neutral-900 rounded-xl border border-neutral-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-800/80 bg-neutral-950/98 space-y-2 rounded-b-2xl shadow-2xl">
            <button
              onClick={() => handleNavClick('top')}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 rounded-xl"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('menu-section')}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 rounded-xl"
            >
              Full Menu
            </button>
            <button
              onClick={() => handleNavClick('signature-section')}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 rounded-xl"
            >
              Signature Favourites
            </button>
            <button
              onClick={() => handleNavClick('offers-section')}
              className="w-full text-left px-4 py-2.5 text-sm font-bold text-amber-400 hover:bg-neutral-900 rounded-xl flex items-center gap-2"
            >
              <span>🔥 Special Offers &amp; Combos</span>
            </button>
            <button
              onClick={() => handleNavClick('about-section')}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 rounded-xl"
            >
              About Fiery Treat
            </button>
            <button
              onClick={() => handleNavClick('location-section')}
              className="w-full text-left px-4 py-2.5 text-sm font-semibold text-neutral-200 hover:bg-neutral-900 rounded-xl"
            >
              Contact, Hours &amp; Location
            </button>

            <div className="pt-3 border-t border-neutral-900 flex flex-col gap-2 px-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCart();
                }}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Cart &bull; {cartCount} Items (₹{cartTotal})</span>
              </button>

              <a
                href={`tel:${RESTAURANT_INFO.phone1}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Call {RESTAURANT_INFO.formattedPhone1}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
