import React, { useState } from 'react';
import { MenuItem, CategoryId } from '../types';
import { CATEGORIES } from '../data/menuData';
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
  Save
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  onUpdateItem: (updatedItem: MenuItem) => void;
  onAddItem: (newItem: MenuItem) => void;
  onResetMenu: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateItem,
  onAddItem,
  onResetMenu,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Dish Form State
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState<CategoryId>('rice_noodles');
  const [newPrice, setNewPrice] = useState<number>(99);
  const [newIsVeg, setNewIsVeg] = useState(true);
  const [newDescription, setNewDescription] = useState('');
  const [newSpiceLevel, setNewSpiceLevel] = useState<1 | 2 | 3>(2);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    const matchCat = selectedCat === 'all' || item.category === selectedCat;
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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

    const newItem: MenuItem = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      category: newCat,
      price: Number(newPrice),
      isVeg: newIsVeg,
      spiceLevel: newSpiceLevel,
      description: newDescription.trim() || `${newName} freshly prepared at Firey Treat.`,
      inStock: true,
      image: newIsVeg
        ? 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80',
      tags: ['Chef Special', 'New Item'],
    };

    onAddItem(newItem);
    setNewName('');
    setNewDescription('');
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

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items by name to change price..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full sm:w-auto bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Categories ({items.length})</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortName}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'Add New Dish'}</span>
          </button>
        </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="text-neutral-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Short appetizing description..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsVeg}
                    onChange={(e) => setNewIsVeg(e.target.checked)}
                    className="rounded border-neutral-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Pure Vegetarian</span>
                </label>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Item
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Scrollable Items Table */}
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
                    {/* Name & Type */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <DietaryIndicator isVeg={item.isVeg} isEgg={item.isEgg} size="sm" />
                        <div>
                          <span className="font-semibold text-white block">
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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

      </div>
    </div>
  );
};
