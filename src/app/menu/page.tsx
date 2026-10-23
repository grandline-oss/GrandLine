'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { getCategories, getMenuItems, getSettings } from '@/lib/storage';
import { Category, MenuItem, RestaurantSettings } from '@/lib/types';
import { formatInr } from '@/lib/currency';
import { Search, Sparkles, Filter, AlertCircle, Utensils } from 'lucide-react';

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setCategories(getCategories().filter((c) => c.isActive));
      setMenuItems(getMenuItems());
      setSettings(getSettings());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }
      // Diet filter
      if (dietFilter === 'veg' && !item.isVeg) return false;
      if (dietFilter === 'nonveg' && item.isVeg) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        return matchesName || matchesDesc;
      }

      return true;
    });
  }, [menuItems, selectedCategory, dietFilter, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <Header />

      <main className="flex-1">
        {/* Menu Hero Banner */}
        <section className="bg-stone-900 text-white py-16 sm:py-20 border-b border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-bold block mb-2">
              Freshly Prepared Every Day
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
              Our Culinary Menu
            </h1>
            <p className="max-w-2xl mx-auto text-stone-300 text-sm sm:text-base leading-relaxed">
              Explore our selection of handcrafted heritage recipes, aromatic clay oven breads, slow-cooked curries, and refreshing artisanal coolers.
            </p>
          </div>
        </section>

        {/* Filter and Search Bar */}
        <section className="sticky top-20 z-30 bg-[#faf8f5]/95 backdrop-blur-md border-b border-stone-200 py-4 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 pos-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  All Items ({menuItems.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Search & Diet Toggle */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes or ingredients..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Diet Filter Buttons */}
                <div className="flex items-center rounded-xl bg-white border border-stone-200 p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setDietFilter('all')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                      dietFilter === 'all'
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setDietFilter('veg')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors ${
                      dietFilter === 'veg'
                        ? 'bg-emerald-700 text-white'
                        : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setDietFilter('nonveg')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors ${
                      dietFilter === 'nonveg'
                        ? 'bg-red-700 text-white'
                        : 'text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Non-Veg
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Items Grid */}
        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-stone-200" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-stone-200 max-w-xl mx-auto p-8">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">No Dishes Match Your Selection</h3>
              <p className="text-stone-600 text-sm mb-6">
                Try adjusting your search terms or clearing the active category and dietary filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setDietFilter('all');
                  setSearchQuery('');
                }}
                className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((dish) => (
                <div
                  key={dish.id}
                  className={`group bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col ${
                    !dish.isAvailable ? 'opacity-60 grayscale-[0.6]' : 'hover:-translate-y-1'
                  }`}
                >
                  {/* Dish Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />

                    {/* Vegetarian Indicator */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 text-xs font-semibold">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          dish.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                      />
                      <span className="text-stone-700">
                        {dish.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>

                    {/* Featured Star Badge */}
                    {dish.isFeatured && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1 text-[11px]">
                        <Sparkles className="w-3 h-3 fill-stone-950" />
                        <span>Chef Choice</span>
                      </div>
                    )}

                    {/* Unavailable Badge */}
                    {!dish.isAvailable && (
                      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-stone-900 text-white text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-md">
                          Currently Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                          {dish.name}
                        </h3>
                        <span className="font-bold text-base text-amber-700 whitespace-nowrap">
                          {formatInr(dish.pricePaise)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3">
                        {dish.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <span>
                        {dish.isAvailable ? (
                          <span className="text-emerald-700 font-medium">Ready to serve</span>
                        ) : (
                          <span className="text-stone-400 font-medium">Restocking shortly</span>
                        )}
                      </span>
                      <span className="text-stone-400 italic">Dine-in & Takeaway</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Note on Dine-in Experience */}
        <section className="py-12 bg-white border-t border-stone-200">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">
              Dietary or Allergy Preferences?
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Please inform your server of any dietary requirements or food allergies before ordering. All dishes are prepared to order in our kitchen with pure cooking mediums.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
