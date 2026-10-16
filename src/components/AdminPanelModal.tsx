import React, { useState, useRef, useMemo } from 'react';
import { MenuItem, CategoryId } from '../types';
import { CATEGORIES, resolveImageUrl } from '../data/menuData';
import { DietaryIndicator } from './DietaryIndicator';
import { 
  X, 
  Settings, 
  Search, 
  Plus, 
  Check, 
  RotateCcw, 
  Download, 
  Upload, 
  Flame, 
  AlertCircle,
  Save,
  Image as ImageIcon,
  Trash2,
  Camera,
  UploadCloud,
  Truck,
  Navigation,
  MapPin,
  FileSpreadsheet,
  LayoutGrid,
  List,
  Eye,
  SlidersHorizontal,
  Sparkles,
  Filter,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { OrderDetails } from '../types';
import { GoogleWorkspacePanel } from './GoogleWorkspacePanel';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  onUpdateItem: (updatedItem: MenuItem) => void;
  onAddItem: (newItem: MenuItem) => void;
  onDeleteItem: (itemId: string) => void;
  onResetMenu: () => void;
  orders?: OrderDetails[];
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  onResetMenu,
  orders = [],
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'google_workspace'>('menu');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletedNotification, setDeletedNotification] = useState<string>('');

  // Owner Dishes Navigation Extension States
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg' | 'special'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');
  const [inspectingItem, setInspectingItem] = useState<MenuItem | null>(null);

  // New Dish Form State
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<CategoryId>('rice_noodles');
  const [newPrice, setNewPrice] = useState<number>(99);
  const [newIsVeg, setNewIsVeg] = useState(true);
  const [newDescription, setNewDescription] = useState('');
  const [newSpiceLevel, setNewSpiceLevel] = useState<1 | 2 | 3>(2);
  const [newImage, setNewImage] = useState<string>('');
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Dish Image State for existing items
  const [editingImageItem, setEditingImageItem] = useState<MenuItem | null>(null);
  const [editImageUrl, setEditImageUrl] = useState('');
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Category counts for owner navigation extension
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    CATEGORIES.forEach((c) => {
      counts[c.id] = items.filter((i) => i.category === c.id).length;
    });
    return counts;
  }, [items]);

  const vegDishesCount = useMemo(() => items.filter((i) => i.isVeg).length, [items]);
  const nonVegDishesCount = useMemo(() => items.filter((i) => !i.isVeg).length, [items]);
  const specialsCount = useMemo(() => items.filter((i) => i.isSpecial).length, [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = items.filter((item) => {
      const matchCat = selectedCat === 'all' || item.category === selectedCat;
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      const matchDietary =
        dietaryFilter === 'all'
          ? true
          : dietaryFilter === 'veg'
          ? item.isVeg
          : dietaryFilter === 'non-veg'
          ? !item.isVeg
          : item.isSpecial;
      return matchCat && matchSearch && matchDietary;
    });

    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [items, selectedCat, search, dietaryFilter, sortBy]);

  if (!isOpen) return null;

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setNewImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditItemImageFile = (file: File, targetItem: MenuItem) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onUpdateItem({ ...targetItem, image: e.target.result as string });
        setEditingImageItem(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartEditPrice = (item: MenuItem) => {
    setEditingId(item.id);
    setTempPrice(item.price);
  };

  const handleSavePrice = (item: MenuItem) => {
    onUpdateItem({ ...item, price: Number(tempPrice) });
    setEditingId(null);
  };

  const handleToggleStock = (item: MenuItem) => {
    onUpdateItem({ ...item, inStock: !item.inStock });
  };

  const handleToggleSpecial = (item: MenuItem) => {
    onUpdateItem({ ...item, isSpecial: !item.isSpecial });
  };

  const handleToggleBestseller = (item: MenuItem) => {
    onUpdateItem({ ...item, isBestseller: !item.isBestseller });
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newPrice <= 0) return;

    const finalImage = newImage.trim()
      ? resolveImageUrl(newImage.trim())
      : (newIsVeg
        ? 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80');

    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      category: newCat,
      price: Number(newPrice),
      isVeg: newIsVeg,
      spiceLevel: newSpiceLevel,
      description: newDescription.trim() || `${newName} freshly prepared at Firey Treat.`,
      inStock: true,
      image: finalImage,
      tags: ['Chef Special', 'New Item'],
    };

    onAddItem(newItem);
    setNewName('');
    setNewDescription('');
    setNewImage('');
    setUploadError('');
    setShowAddForm(false);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `firey_treat_menu_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-white space-y-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                Restaurant Menu CMS & Staff Panel
              </h2>
              <p className="text-xs text-neutral-400">
                Live price adjustments, stock toggles, and specials management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200"
              title="Download Menu JSON backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onResetMenu}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 border border-red-800/40 text-xs font-semibold text-red-300"
              title="Reset to original photographed board prices"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Menu</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Menu CMS vs Google Workspace Sync) */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-amber-500 text-neutral-950 shadow-md'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Menu Dishes CMS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('google_workspace')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'google_workspace'
                ? 'bg-emerald-500 text-neutral-950 shadow-md'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheets & Drive Sync</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[9px] font-bold border border-emerald-700/60">
              Workspace
            </span>
          </button>
        </div>

        {activeTab === 'google_workspace' ? (
          <div className="flex-1 overflow-y-auto pr-1">
            <GoogleWorkspacePanel orders={orders} />
          </div>
        ) : (
          <>
        {/* Delivery Radius & WhatsApp Ordering Configuration Info for Owner */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between flex-wrap gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 shrink-0">
              <Truck className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm">
                  10 KM WhatsApp Delivery Radius Active
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800/80">
                  Below 500m: Reduced Fee (FREE ₹0)
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 pt-0.5">
                Central Hub: Pachikapalem, DCCB Bank opposite, Tirupati Road (Coordinates: 13.4478° N, 79.3611° E)
              </p>
            </div>
          </div>

          <a
            href="https://maps.app.goo.gl/r8P7kyEs2Q5bEvXY7"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open Maps Link</span>
          </a>
        </div>

        {/* ========================================================
            OWNER DISHES NAVIGATION EXTENSION
            ======================================================== */}
        <div className="space-y-3 bg-neutral-950 p-3.5 rounded-2xl border border-neutral-800 shrink-0">
          
          {/* Top Bar: Search, View Mode (Visual Cards vs Table), Sort, and Add Dish */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes by name, ingredients, or keywords..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-8 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Controls: Dietary Filter, Sort, View Toggle, and Add Button */}
            <div className="flex items-center gap-2 flex-wrap">
              
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300">
                <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs text-neutral-200 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="default" className="bg-neutral-900">Default Sort</option>
                  <option value="price-low" className="bg-neutral-900">Price: Low to High</option>
                  <option value="price-high" className="bg-neutral-900">Price: High to Low</option>
                  <option value="name" className="bg-neutral-900">Name: A to Z</option>
                </select>
              </div>

              {/* View Mode Toggle (Visual Grid vs Table) */}
              <div className="flex items-center bg-neutral-900 border border-neutral-800 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-amber-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Visual Card Catalog View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cards View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-amber-500 text-neutral-950 shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Compact Table View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table View</span>
                </button>
              </div>

              {/* Add New Dish Button */}
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddForm ? 'Close' : 'Add Dish'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Category Ribbon Extension with icons & counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-neutral-800">
            <button
              type="button"
              onClick={() => setSelectedCat('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                selectedCat === 'all'
                  ? 'bg-amber-500 text-neutral-950 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
              }`}
            >
              <span>All Dishes</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                selectedCat === 'all' ? 'bg-neutral-950 text-amber-400' : 'bg-neutral-800 text-neutral-400'
              }`}>
                {categoryCounts.all || items.length}
              </span>
            </button>

            {CATEGORIES.map((c) => {
              const count = categoryCounts[c.id] || 0;
              const isSelected = selectedCat === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCat(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-neutral-950 shadow-md ring-2 ring-amber-400/30'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.shortName}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-neutral-950 text-amber-400' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Quick Filters: Dietary (Veg / Non-Veg / Specials) & Stats Strip */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1.5 border-t border-neutral-800/80 text-[11px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-neutral-500 font-semibold text-[10px] uppercase tracking-wider">Quick Filter:</span>
              <button
                type="button"
                onClick={() => setDietaryFilter('all')}
                className={`px-2 py-0.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  dietaryFilter === 'all'
                    ? 'bg-neutral-800 text-white font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                All ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('veg')}
                className={`px-2 py-0.5 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  dietaryFilter === 'veg'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold'
                    : 'text-emerald-400/80 hover:text-emerald-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Veg ({vegDishesCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('non-veg')}
                className={`px-2 py-0.5 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  dietaryFilter === 'non-veg'
                    ? 'bg-red-950 text-red-300 border border-red-700/60 font-bold'
                    : 'text-red-400/80 hover:text-red-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span>Non-Veg ({nonVegDishesCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('special')}
                className={`px-2 py-0.5 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                  dietaryFilter === 'special'
                    ? 'bg-amber-950 text-amber-300 border border-amber-700/60 font-bold'
                    : 'text-amber-400/80 hover:text-amber-300'
                }`}
              >
                <Flame className="w-3 h-3 fill-current text-amber-400" />
                <span>Specials ({specialsCount})</span>
              </button>
            </div>

            <div className="text-neutral-400 font-medium">
              Showing <span className="text-amber-400 font-bold">{filteredItems.length}</span> of {items.length} dishes
              {selectedCat !== 'all' && (
                <span> in <strong className="text-white">{CATEGORIES.find(c => c.id === selectedCat)?.name}</strong></span>
              )}
            </div>
          </div>

        </div>

        {/* Delete Toast Notification */}
        {deletedNotification && (
          <div className="px-4 py-2.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-center justify-between animate-in fade-in duration-200 shrink-0">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-semibold">{deletedNotification}</span>
            </div>
            <button
              type="button"
              onClick={() => setDeletedNotification('')}
              className="p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add New Dish Form Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleCreateNewItem}
            className="p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 space-y-3 shrink-0"
          >
            <h4 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Add New Menu Item</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="text-neutral-400 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Butter Garlic Wings"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Category</label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as CategoryId)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.shortName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-white"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="text-neutral-400 block mb-1">Description</label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Short appetizing description..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-white"
              />
            </div>

            {/* Dish Image Upload Section */}
            <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-neutral-300 text-xs font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dish Image</span>
                  <span className="text-[10px] text-neutral-500 font-normal">(Upload photo or provide web link)</span>
                </label>

                <div className="inline-flex rounded-lg bg-neutral-900 p-0.5 border border-neutral-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      imageInputMode === 'upload'
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      imageInputMode === 'url'
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Image Link
                  </button>
                </div>
              </div>

              {imageInputMode === 'upload' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {newImage ? (
                    <div className="flex items-center gap-3 p-2 bg-neutral-900 rounded-xl border border-neutral-800">
                      <img
                        src={newImage}
                        alt="Uploaded Preview"
                        className="w-16 h-16 rounded-lg object-cover border border-amber-500/40 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Image uploaded successfully</span>
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate">
                          Ready for restaurant menu display
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Change Photo
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewImage('')}
                            className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files?.[0]) {
                          handleImageFile(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300'
                          : 'border-neutral-700 hover:border-amber-500/60 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-400'
                      }`}
                    >
                      <UploadCloud className="w-7 h-7 mx-auto mb-1 text-amber-400 animate-pulse" />
                      <p className="text-xs font-semibold text-neutral-200">
                        Click to browse dish photo, or drag & drop here
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        Supports PNG, JPG, JPEG, WEBP files
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="https://example.com/dish.jpg or recipe link..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                  />
                  {newImage && (
                    <div className="flex items-center gap-2 p-2 bg-neutral-900 rounded-lg border border-neutral-800">
                      <img
                        src={resolveImageUrl(newImage)}
                        alt="URL Preview"
                        className="w-12 h-12 rounded object-cover border border-neutral-700 shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = newIsVeg
                            ? 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80'
                            : 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="text-[11px] text-neutral-400 min-w-0">
                        <span className="font-semibold text-white block">Image URL detected</span>
                        <span className="truncate block">{newImage}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {uploadError && (
                <p className="text-xs text-rose-400 font-medium">{uploadError}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={newIsVeg}
                  onChange={(e) => setNewIsVeg(e.target.checked)}
                  className="rounded border-neutral-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-neutral-300 font-medium">Pure Vegetarian Dish</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Dish</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ========================================================
            DISHES DISPLAY AREA (Visual Cards Grid vs Table View)
            ======================================================== */}
        {viewMode === 'grid' ? (
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center text-neutral-500 rounded-2xl border border-neutral-800 bg-neutral-950">
                <Flame className="w-10 h-10 mx-auto mb-2 text-neutral-600 animate-pulse" />
                <p className="font-semibold text-sm text-neutral-300">No dishes match your navigation filters</p>
                <p className="text-xs text-neutral-500 mt-1">Try resetting the category ribbon or search query</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCat('all');
                    setDietaryFilter('all');
                    setSearch('');
                  }}
                  className="mt-4 px-4 py-1.5 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredItems.map((item) => {
                  const isEditing = editingId === item.id;
                  const catName = CATEGORIES.find((c) => c.id === item.category)?.shortName || item.category;
                  return (
                    <div
                      key={item.id}
                      className={`relative rounded-2xl bg-neutral-950 border transition-all flex flex-col justify-between overflow-hidden group shadow-md ${
                        item.inStock
                          ? 'border-neutral-800 hover:border-amber-500/40'
                          : 'border-neutral-800/60 opacity-75'
                      }`}
                    >
                      {/* Card Header & Photo */}
                      <div>
                        <div className="relative h-36 w-full bg-neutral-900 overflow-hidden">
                          <img
                            src={resolveImageUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = item.isVeg
                                ? 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80'
                                : 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent pointer-events-none" />

                          {/* Top Badges */}
                          <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                            <div className="flex items-center gap-1.5 pointer-events-auto">
                              <DietaryIndicator isVeg={item.isVeg} isEgg={item.isEgg} size="sm" />
                              <span className="px-2 py-0.5 rounded-md bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 text-[10px] font-bold text-neutral-200">
                                {catName}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 pointer-events-auto">
                              <button
                                type="button"
                                onClick={() => handleToggleSpecial(item)}
                                className={`p-1 rounded-md text-[10px] font-bold transition-colors cursor-pointer ${
                                  item.isSpecial ? 'bg-red-600 text-white shadow' : 'bg-black/60 text-neutral-400 hover:text-white'
                                }`}
                                title="Toggle Special"
                              >
                                <Flame className="w-3 h-3 fill-current" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleBestseller(item)}
                                className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold transition-colors cursor-pointer ${
                                  item.isBestseller ? 'bg-amber-500 text-neutral-950 shadow' : 'bg-black/60 text-neutral-400 hover:text-white'
                                }`}
                                title="Toggle Bestseller"
                              >
                                ★ Top
                              </button>
                            </div>
                          </div>

                          {/* Quick Inspect Button */}
                          <button
                            type="button"
                            onClick={() => setInspectingItem(item)}
                            className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black text-white text-[11px] font-semibold flex items-center gap-1.5 backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow"
                            title="Quick Inspect Full Dish Details"
                          >
                            <Eye className="w-3 h-3 text-amber-400" />
                            <span>Inspect</span>
                          </button>
                        </div>

                        {/* Card Content */}
                        <div className="p-3 space-y-1.5">
                          <div className="flex items-start justify-between gap-1.5">
                            <h5 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors leading-tight">
                              {item.name}
                            </h5>
                            {item.spiceLevel && (
                              <div className="flex items-center text-xs shrink-0" title={`Spice Level ${item.spiceLevel}/3`}>
                                {Array.from({ length: item.spiceLevel }).map((_, i) => (
                                  <span key={i}>🌶️</span>
                                ))}
                              </div>
                            )}
                          </div>

                          {item.pieceCount && (
                            <span className="text-[10px] text-amber-400 font-semibold block">
                              {item.pieceCount}
                            </span>
                          )}

                          <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer: Price inline edit, In-Stock switch & Actions */}
                      <div className="p-2.5 bg-neutral-900/60 border-t border-neutral-800/80 flex items-center justify-between gap-2 text-xs">
                        {/* Price Edit */}
                        <div>
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <span className="text-amber-400 font-bold">₹</span>
                              <input
                                type="number"
                                value={tempPrice}
                                onChange={(e) => setTempPrice(Number(e.target.value))}
                                className="w-14 bg-neutral-950 border border-amber-500 rounded px-1.5 py-0.5 text-xs text-white"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSavePrice(item)}
                                className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                                title="Save Price"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEditPrice(item)}
                              className="font-black text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1 cursor-pointer"
                              title="Click to edit price"
                            >
                              <span>₹{item.price}</span>
                              <span className="text-[10px] text-neutral-500 hover:text-amber-400">✎</span>
                            </button>
                          )}
                        </div>

                        {/* In-Stock Toggle & Action Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleStock(item)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                              item.inStock
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                            }`}
                            title="Toggle in-stock status"
                          >
                            {item.inStock ? 'In Stock' : 'Out of Stock'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingImageItem(item);
                              setEditImageUrl(item.image);
                            }}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
                            title="Change Dish Image"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>

                          {confirmDeleteId === item.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteItem(item.id);
                                  setConfirmDeleteId(null);
                                  setDeletedNotification(`Deleted "${item.name}" from the menu.`);
                                  setTimeout(() => setDeletedNotification(''), 3500);
                                }}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold"
                              >
                                Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded text-[10px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                              title="Delete Dish"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Scrollable Items Table */
          <div className="flex-1 overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-neutral-900 text-neutral-400 font-bold uppercase tracking-wider border-b border-neutral-800 z-10">
                <tr>
                  <th className="p-3">Dish / Type</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price (₹)</th>
                  <th className="p-3 text-center">In Stock</th>
                  <th className="p-3 text-center">Special</th>
                  <th className="p-3 text-center">Bestseller</th>
                  <th className="p-3 text-center text-rose-400">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {filteredItems.map((item) => {
                  const isEditing = editingId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-neutral-900/50 transition-colors"
                    >
                      {/* Name & Type with Dish Photo Thumbnail */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={resolveImageUrl(item.image)}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-neutral-800 shrink-0 bg-neutral-900 cursor-pointer"
                            referrerPolicy="no-referrer"
                            onClick={() => setInspectingItem(item)}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = item.isVeg
                                ? 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80'
                                : 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <DietaryIndicator isVeg={item.isVeg} isEgg={item.isEgg} size="sm" />
                          <div>
                            <span 
                              className="font-semibold text-white block hover:text-amber-400 cursor-pointer"
                              onClick={() => setInspectingItem(item)}
                            >
                              {item.name}
                            </span>
                            {item.pieceCount && (
                              <span className="text-[10px] text-amber-400">
                                {item.pieceCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3 text-neutral-400 whitespace-nowrap">
                        {CATEGORIES.find((c) => c.id === item.category)?.shortName || item.category}
                      </td>

                      {/* Price with Live Edit */}
                      <td className="p-3 whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(Number(e.target.value))}
                              className="w-16 bg-neutral-900 border border-amber-500 rounded px-2 py-1 text-xs text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSavePrice(item)}
                              className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                              title="Save Price"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditPrice(item)}
                            className="font-bold text-amber-400 hover:underline px-2 py-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
                            title="Click to edit price"
                          >
                            ₹{item.price} ✎
                          </button>
                        )}
                      </td>

                      {/* In-Stock Toggle */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleStock(item)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            item.inStock
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-800'
                          }`}
                        >
                          {item.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>

                      {/* Special Toggle */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleSpecial(item)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                            item.isSpecial
                              ? 'bg-red-600 text-white'
                              : 'bg-neutral-900 text-neutral-600 hover:text-neutral-400'
                          }`}
                          title="Toggle Special status"
                        >
                          <Flame className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </td>

                      {/* Bestseller Toggle */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleToggleBestseller(item)}
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-all cursor-pointer ${
                            item.isBestseller
                              ? 'bg-amber-500 text-neutral-950'
                              : 'bg-neutral-900 text-neutral-600 hover:text-neutral-400 border border-neutral-800'
                          }`}
                          title="Toggle Bestseller status"
                        >
                          ★ Top
                        </button>
                      </td>

                      {/* Delete Option for Owner */}
                      <td className="p-3 text-center whitespace-nowrap">
                        {confirmDeleteId === item.id ? (
                          <div className="inline-flex items-center gap-1 bg-neutral-900 border border-rose-800/80 p-1 rounded-lg shadow-lg">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteItem(item.id);
                                setConfirmDeleteId(null);
                                setDeletedNotification(`Deleted "${item.name}" from the menu.`);
                                setTimeout(() => setDeletedNotification(''), 3500);
                              }}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold shadow transition-colors cursor-pointer flex items-center gap-1"
                              title="Confirm permanent deletion"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] font-medium transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition-all cursor-pointer inline-flex items-center gap-1"
                            title={`Delete "${item.name}" (Owner access)`}
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 className="w-4 h-4 text-rose-500/80 hover:text-rose-400" />
                            <span className="text-[10px] text-rose-400/90 font-medium hidden sm:inline">Delete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info note */}
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <span>
            Showing {filteredItems.length} of {items.length} items. All modifications persist instantly to your browser.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold"
          >
            Done Editing
          </button>
        </div>
        </>
        )}

      </div>

      {/* ========================================================
          DISH QUICK-INSPECTOR SPOTLIGHT MODAL (NAVIGATION EXTENSION)
          ======================================================== */}
      {inspectingItem && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Top Image */}
            <div className="relative h-60 w-full bg-neutral-950">
              <img
                src={resolveImageUrl(inspectingItem.image)}
                alt={inspectingItem.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-black/40" />
              
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md border border-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Category Pill */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-neutral-900/90 text-amber-400 font-bold text-xs border border-neutral-700/80 backdrop-blur-md flex items-center gap-1.5 shadow">
                  <span>{CATEGORIES.find(c => c.id === inspectingItem.category)?.icon}</span>
                  <span>{CATEGORIES.find(c => c.id === inspectingItem.category)?.name}</span>
                </span>
                <DietaryIndicator isVeg={inspectingItem.isVeg} isEgg={inspectingItem.isEgg} size="md" />
              </div>

              {/* Price Tag */}
              <div className="absolute bottom-3 right-3 px-4 py-1.5 rounded-xl bg-amber-500 text-neutral-950 font-black text-xl shadow-lg">
                ₹{inspectingItem.price}
              </div>
            </div>

            {/* Dish Details */}
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                    {inspectingItem.name}
                  </h3>
                  {inspectingItem.spiceLevel && (
                    <div className="flex items-center text-sm" title={`Spice Rating ${inspectingItem.spiceLevel}/3`}>
                      {Array.from({ length: inspectingItem.spiceLevel }).map((_, i) => (
                        <span key={i}>🌶️</span>
                      ))}
                    </div>
                  )}
                </div>

                {inspectingItem.pieceCount && (
                  <p className="text-xs text-amber-400 font-semibold mt-0.5">
                    Portion: {inspectingItem.pieceCount}
                  </p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Kitchen & Customer Description</span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {inspectingItem.description}
                </p>
              </div>

              {/* Tags */}
              {inspectingItem.tags && inspectingItem.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-neutral-400 font-medium">Badges:</span>
                  {inspectingItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[10px] font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Controls inside Inspector */}
              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleStock(inspectingItem);
                      setInspectingItem({ ...inspectingItem, inStock: !inspectingItem.inStock });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      inspectingItem.inStock
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {inspectingItem.inStock ? '✓ In Stock' : '✗ Marked Sold Out'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target = inspectingItem;
                      setInspectingItem(null);
                      setEditingImageItem(target);
                      setEditImageUrl(target.image);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Change Photo</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectingItem(null)}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Dish Photo Modal */}
      {editingImageItem && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Update Photo for {editingImageItem.name}</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingImageItem(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1 font-semibold">Image URL or Web Link</label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  placeholder="Paste direct image URL..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="text-center py-1 text-neutral-500 font-bold text-[10px] uppercase">
                — OR UPLOAD LOCAL FILE —
              </div>

              <div>
                <input
                  type="file"
                  ref={editFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleEditItemImageFile(e.target.files[0], editingImageItem);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => editFileInputRef.current?.click()}
                  className="w-full py-2.5 rounded-xl border border-dashed border-neutral-700 hover:border-amber-500 text-neutral-300 font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-amber-400" />
                  <span>Choose Image File from Computer / Mobile</span>
                </button>
              </div>

              {editImageUrl && (
                <div className="flex items-center gap-2.5 p-2 bg-neutral-950 rounded-xl border border-neutral-800">
                  <img
                    src={resolveImageUrl(editImageUrl)}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-neutral-700"
                  />
                  <span className="text-[11px] text-neutral-400 truncate">Preview Ready</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingImageItem(null)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editImageUrl.trim()) {
                      onUpdateItem({ ...editingImageItem, image: resolveImageUrl(editImageUrl.trim()) });
                      setEditingImageItem(null);
                    }
                  }}
                  disabled={!editImageUrl.trim()}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold transition-colors cursor-pointer"
                >
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
