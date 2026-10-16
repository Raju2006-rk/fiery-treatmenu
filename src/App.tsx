import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, CartItem, CategoryId, OrderType, OrderDetails } from './types';
import { INITIAL_MENU_ITEMS, CATEGORIES, RESTAURANT_INFO } from './data/menuData';
import { DetectedLocationResult } from './utils/distance';
import { initAuth } from './services/googleWorkspace';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BasmatiHighlight } from './components/BasmatiHighlight';
import { CategoryNav } from './components/CategoryNav';
import { MenuCard } from './components/MenuCard';
import { CartDrawer } from './components/CartDrawer';
import { OrderStatusIndicator } from './components/OrderStatusIndicator';
import { AdminPanelModal } from './components/AdminPanelModal';
import { OwnerAuthModal } from './components/OwnerAuthModal';
import { LocationAndContact } from './components/LocationAndContact';
import { Footer } from './components/Footer';
import { 
  ShoppingBag, 
  MessageCircle, 
  PhoneCall, 
  Sparkles, 
  UtensilsCrossed, 
  Search, 
  Check, 
  Flame 
} from 'lucide-react';

const CART_STORAGE_KEY = 'firey_treat_cart_v2';
const MENU_STORAGE_KEY = 'firey_treat_menu_items_v7';

export default function App() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(MENU_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Error loading stored menu:', e);
      }
    }
    return INITIAL_MENU_ITEMS;
  });

  // Clear legacy stored menu items on mount so stale caches never override
  useEffect(() => {
    try {
      [
        'firey_treat_menu_items_v1',
        'firey_treat_menu_items_v2',
        'firey_treat_menu_items_v3',
        'firey_treat_menu_items_v4',
        'firey_treat_menu_items_v5',
        'firey_treat_menu_items_v6',
      ].forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }, []);

  // Save menuItems to localStorage whenever edited, added, or deleted
  useEffect(() => {
    try {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menuItems));
    } catch (e) {
      console.error('Error saving menu to storage:', e);
    }
  }, [menuItems]);

  // Cart state with local persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          const parsed: CartItem[] = JSON.parse(saved);
          // Keep only items that exist in current menu items and ensure latest images/prices
          return parsed
            .filter((c) => c?.menuItem && INITIAL_MENU_ITEMS.some((init) => init.id === c.menuItem.id))
            .map((c) => {
              const initial = INITIAL_MENU_ITEMS.find((init) => init.id === c.menuItem.id)!;
              return {
                ...c,
                menuItem: {
                  ...c.menuItem,
                  image: initial.image,
                  price: initial.price,
                  name: initial.name,
                },
              };
            });
        }
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
    return [];
  });

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non_veg' | 'egg'>('all');

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOwnerAuthOpen, setIsOwnerAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const handleOpenOwnerSettings = () => {
    setIsOwnerAuthOpen(true);
  };

  // Google Workspace User State
  const [googleUser, setGoogleUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setGoogleUser(user),
      () => setGoogleUser(null)
    );
    return () => unsubscribe();
  }, []);

  // Restaurant Orders History (for sync to Google Sheets)
  const [orders, setOrders] = useState<OrderDetails[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('firey_treat_orders_v1');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading orders:', e);
      }
    }
    return [
      {
        id: 'FT-894121',
        items: [
          { menuItem: INITIAL_MENU_ITEMS[0], quantity: 2 },
          { menuItem: INITIAL_MENU_ITEMS[2], quantity: 1 }
        ],
        orderType: 'delivery',
        customerName: 'Kavitha R',
        customerPhone: '9848022334',
        address: 'Pachikapalem Main Road, Near SBI ATM (0.4 km away)',
        subtotal: 310,
        deliveryFee: 0,
        grandTotal: 310,
        timestamp: Date.now() - 3600000 * 2,
        status: 'completed'
      },
      {
        id: 'FT-894122',
        items: [
          { menuItem: INITIAL_MENU_ITEMS[1], quantity: 1 },
          { menuItem: INITIAL_MENU_ITEMS[3], quantity: 1 }
        ],
        orderType: 'takeaway',
        customerName: 'Ramesh Reddy',
        customerPhone: '9440112233',
        subtotal: 240,
        deliveryFee: 0,
        grandTotal: 240,
        timestamp: Date.now() - 1800000,
        status: 'preparing'
      }
    ];
  });

  const handleOrderPlaced = (newOrder: OrderDetails) => {
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('firey_treat_orders_v1', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving orders:', e);
      }
      return updated;
    });
  };

  // Order Type & Auto-detected location state (for Order Status indicator & CartDrawer)
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocationResult | null>(null);

  // Table QR param detection (e.g. ?table=Table%203)
  const [dineInTable, setDineInTable] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const table = params.get('table');
      if (table) {
        setDineInTable(table);
        setOrderType('dine_in');
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to storage:', e);
    }
  }, [cart]);

  // Cart calculations
  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.menuItem.price * item.quantity, 0),
    [cart]
  );

  const cartItemMap = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((item) => {
      map[item.menuItem.id] = item.quantity;
    });
    return map;
  }, [cart]);

  // Category counts
  const categoryItemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    menuItems.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [menuItems]);

  // Cart actions
  const handleAddToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((c) => c.menuItem.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prevCart, { menuItem: item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.menuItem.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.menuItem.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Admin menu actions
  const handleUpdateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleAddMenuItem = (newItem: MenuItem) => {
    setMenuItems((prev) => [newItem, ...prev]);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
    // Also remove from active cart if it was added
    setCart((prev) => prev.filter((item) => item.menuItem.id !== itemId));
  };

  const handleResetMenu = () => {
    if (window.confirm('Reset all prices, restore deleted dishes, and revert custom items to original menu board?')) {
      setMenuItems(INITIAL_MENU_ITEMS);
      try {
        localStorage.removeItem(MENU_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  // Filtered Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Dietary filter
      if (dietaryFilter === 'veg' && !item.isVeg) return false;
      if (dietaryFilter === 'non_veg' && item.isVeg) return false;
      if (dietaryFilter === 'egg' && !item.isEgg) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesTag) return false;
      }

      return true;
    });
  }, [menuItems, selectedCategory, dietaryFilter, searchQuery]);

  // Group items by category if 'all' is selected and no search
  const isGroupedView = selectedCategory === 'all' && !searchQuery && dietaryFilter === 'all';

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-amber-500 selection:text-neutral-950">
      
      {/* Top Banner if scanned from Dine-In Table */}
      {dineInTable && (
        <div className="bg-amber-500 text-neutral-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-md">
          <UtensilsCrossed className="w-4 h-4" />
          <span>Ordering for {dineInTable} • Enjoy your meal at Firey Treat!</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        cartCount={cartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={handleOpenOwnerSettings}
        onOpenGoogleWorkspace={handleOpenOwnerSettings}
        googleUser={googleUser}
        activeCategory={selectedCategory}
      />

      {/* Hero Section */}
      <Hero
        onExploreMenu={() => {
          const menuSection = document.getElementById('menu-section');
          if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Dedicated Basmati Rice & Noodles Signboard Highlight */}
      <BasmatiHighlight
        items={menuItems}
        cartItemIds={cartItemMap}
        onAddToCart={handleAddToCart}
        onSelectCategory={(catId) => setSelectedCategory(catId as CategoryId)}
      />

      {/* Sticky Menu Category Navigation & Search */}
      <div id="menu-section">
        <CategoryNav
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          dietaryFilter={dietaryFilter}
          onDietaryFilterChange={setDietaryFilter}
          categoryItemCounts={categoryItemCounts}
        />
      </div>

      {/* Main Dishes Catalog Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-12">
        
        {/* Customer Order Status & Dispatch Info Block (appears when items are in cart) */}
        {cartCount > 0 && (
          <OrderStatusIndicator
            cartCount={cartCount}
            cartTotal={cartTotal}
            onOpenCart={() => setIsCartOpen(true)}
            variant="page"
            activeOrderType={orderType}
            onOrderTypeChange={setOrderType}
            detectedLocation={detectedLocation}
            onLocationDetected={setDetectedLocation}
          />
        )}

        {/* Results Header or Active Filter Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-4">
          <div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight uppercase">
              {selectedCategory === 'all'
                ? 'Full Restaurant Menu'
                : CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Menu'}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              {selectedCategory === 'all'
                ? 'Select any dish to add to your order cart'
                : CATEGORIES.find((c) => c.id === selectedCategory)?.description}
            </p>
          </div>

          <div className="text-xs text-neutral-400 font-medium">
            Showing <strong className="text-amber-400 font-bold">{filteredMenuItems.length}</strong> items
          </div>
        </div>

        {/* Empty state if search returned no results */}
        {filteredMenuItems.length === 0 ? (
          <div className="py-20 text-center space-y-4 rounded-3xl bg-neutral-900/50 border border-neutral-800">
            <div className="w-16 h-16 mx-auto rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No dishes found matching your filter</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Try adjusting your search query or reset dietary filters to view all menu items.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setDietaryFilter('all');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : isGroupedView ? (
          /* Grouped by Categories view */
          <div className="space-y-14">
            {CATEGORIES.map((cat) => {
              const catItems = menuItems.filter((i) => i.category === cat.id);
              if (catItems.length === 0) return null;

              return (
                <section key={cat.id} id={`category-section-${cat.id}`} className="space-y-6">
                  {/* Category Section Header */}
                  <div className="flex items-center justify-between border-l-4 border-amber-500 pl-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                          {cat.name}
                        </h3>
                        {cat.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-[10px] font-bold uppercase tracking-wider">
                            {cat.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">{cat.description}</p>
                    </div>

                    <span className="text-xs text-neutral-500 font-semibold">
                      {catItems.length} items
                    </span>
                  </div>

                  {/* Dishes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {catItems.map((item) => (
                      <MenuCard
                        key={item.id}
                        item={item}
                        cartQuantity={cartItemMap[item.id] || 0}
                        onAddToCart={handleAddToCart}
                        onUpdateQuantity={handleUpdateQuantity}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          /* Filtered Grid view */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredMenuItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                cartQuantity={cartItemMap[item.id] || 0}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </div>
        )}

      </main>

      {/* Location, Timings & Party Catering Section */}
      <LocationAndContact />

      {/* Footer */}
      <Footer
        onOpenAdmin={handleOpenOwnerSettings}
      />

      {/* Floating Mobile Cart & WhatsApp Action Button */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5">
        {cartCount > 0 && (
          <button
            id="floating-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-2xl shadow-xl shadow-red-950/70 font-bold text-sm cursor-pointer hover:scale-105 transition-all border border-red-400/30"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>{cartCount} items</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs">
              ₹{cartTotal}
            </span>
            <span className="hidden sm:inline-flex items-center bg-black/40 text-amber-300 font-bold text-[10px] px-2 py-0.5 rounded-md">
              {orderType === 'delivery' ? '25–35 min' : '10–15 min'}
            </span>
          </button>
        )}

        <a
          id="floating-whatsapp-btn"
          href={`https://wa.me/${RESTAURANT_INFO.whatsappNumber}?text=${encodeURIComponent(
            "Hello Firey Treat Restaurant, I want to place an order!"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-13 h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/70 flex items-center justify-center transition-all hover:scale-110 cursor-pointer border border-emerald-400/30"
          title="Direct WhatsApp Order"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7 fill-current" />
        </a>
      </div>

      {/* Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        externalOrderType={orderType}
        onExternalOrderTypeChange={setOrderType}
        externalLocation={detectedLocation}
        onLocationDetected={setDetectedLocation}
        onOrderPlaced={handleOrderPlaced}
      />

      <OwnerAuthModal
        isOpen={isOwnerAuthOpen}
        onClose={() => setIsOwnerAuthOpen(false)}
        onSuccess={() => setIsAdminOpen(true)}
      />

      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        items={menuItems}
        onUpdateItem={handleUpdateMenuItem}
        onAddItem={handleAddMenuItem}
        onDeleteItem={handleDeleteMenuItem}
        onResetMenu={handleResetMenu}
        orders={orders}
      />

    </div>
  );
}
