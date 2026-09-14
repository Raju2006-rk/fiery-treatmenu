import React from 'react';
import { CATEGORIES } from '../data/menuData';
import { CategoryId } from '../types';
import { 
  Search, 
  X, 
  Sparkles, 
  Flame, 
  Utensils, 
  Sandwich, 
  Salad, 
  Egg, 
  ChefHat,
  Filter
} from 'lucide-react';

interface CategoryNavProps {
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dietaryFilter: 'all' | 'veg' | 'non_veg' | 'egg';
  onDietaryFilterChange: (filter: 'all' | 'veg' | 'non_veg' | 'egg') => void;
  categoryItemCounts: Record<string, number>;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  dietaryFilter,
  onDietaryFilterChange,
  categoryItemCounts,
}) => {
  return (
    <div className="sticky top-16 sm:top-20 z-30 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 py-3 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        
        {/* Search & Dietary Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              id="menu-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search dishes (e.g., Gobi, Fried Chicken, Biryani, Momos)..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dietary Filters (FSSAI style pills) */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
            <button
              onClick={() => onDietaryFilterChange('all')}
              className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                dietaryFilter === 'all'
                  ? 'bg-neutral-100 text-neutral-950 shadow'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              All Items
            </button>

            <button
              onClick={() => onDietaryFilterChange('veg')}
              className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-neutral-900 text-emerald-400 hover:bg-neutral-800 border border-emerald-950/80'
              }`}
            >
              <div className="w-3 h-3 border border-emerald-400 rounded-[2px] flex items-center justify-center p-[1px]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <span>Pure Veg</span>
            </button>

            <button
              onClick={() => onDietaryFilterChange('non_veg')}
              className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                dietaryFilter === 'non_veg'
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-neutral-900 text-rose-400 hover:bg-neutral-800 border border-rose-950/80'
              }`}
            >
              <div className="w-3 h-3 border border-rose-400 rounded-[2px] flex items-center justify-center p-[1px]">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              </div>
              <span>Non-Veg</span>
            </button>

            <button
              onClick={() => onDietaryFilterChange('egg')}
              className={`px-3 py-2 rounded-lg font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                dietaryFilter === 'egg'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-neutral-900 text-amber-400 hover:bg-neutral-800 border border-amber-950/80'
              }`}
            >
              <div className="w-3 h-3 border border-amber-400 rounded-[2px] flex items-center justify-center p-[1px]">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
              <span>Egg</span>
            </button>
          </div>

        </div>

        {/* Category Horizontal Scrolling Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </button>

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryItemCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                id={`cat-tab-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                    : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-800'
                }`}
              >
                <span>{cat.shortName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
