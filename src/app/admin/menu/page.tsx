'use client';

import React, { useState, useEffect } from 'react';
import {
  getCategories,
  getMenuItems,
  saveCategory,
  deleteCategory,
  saveMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from '@/lib/storage';
import { Category, MenuItem } from '@/lib/types';
import { formatInr, rupeesToPaise, paiseToRupees } from '@/lib/currency';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Sparkles,
  Layers,
  UtensilsCrossed,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AdminMenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Item Form Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    categoryId: '',
    description: '',
    priceRupees: '',
    imageUrl: '',
    isAvailable: true,
    isFeatured: false,
    isVeg: true,
  });
  const [itemFormError, setItemFormError] = useState<string | null>(null);

  // Category Form Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    displayOrder: 1,
    isActive: true,
  });
  const [catFormError, setCatFormError] = useState<string | null>(null);

  const loadData = () => {
    setCategories(getCategories());
    setMenuItems(getMenuItems());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered menu items
  const filteredItems = menuItems.filter((item) => {
    if (selectedCatFilter !== 'all' && item.categoryId !== selectedCatFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle open item modal
  const openItemModal = (item?: MenuItem) => {
    setItemFormError(null);
    if (item) {
      setEditingItem(item);
      setItemForm({
        name: item.name,
        categoryId: item.categoryId,
        description: item.description,
        priceRupees: paiseToRupees(item.pricePaise).toString(),
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        isFeatured: item.isFeatured,
        isVeg: item.isVeg !== false,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        name: '',
        categoryId: categories[0]?.id || '',
        description: '',
        priceRupees: '',
        imageUrl: '',
        isAvailable: true,
        isFeatured: false,
        isVeg: true,
      });
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    setItemFormError(null);

    if (!itemForm.name.trim()) {
      setItemFormError('Item name is required.');
      return;
    }

    const priceNum = parseFloat(itemForm.priceRupees);
    if (isNaN(priceNum) || priceNum < 0) {
      setItemFormError('Please enter a valid, non-negative price in Rupees.');
      return;
    }

    if (!itemForm.categoryId) {
      setItemFormError('Please select a category.');
      return;
    }

    const pricePaise = rupeesToPaise(priceNum);

    const saved = saveMenuItem({
      id: editingItem?.id || '',
      categoryId: itemForm.categoryId,
      name: itemForm.name.trim(),
      description: itemForm.description.trim(),
      pricePaise,
      imageUrl: itemForm.imageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      isAvailable: itemForm.isAvailable,
      isFeatured: itemForm.isFeatured,
      isVeg: itemForm.isVeg,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setIsItemModalOpen(false);
    loadData();
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? Historical invoices will safely retain their snapshot.`)) {
      deleteMenuItem(id);
      loadData();
    }
  };

  const handleToggleAvailability = (id: string) => {
    toggleMenuItemAvailability(id);
    loadData();
  };

  // Handle open category modal
  const openCategoryModal = (cat?: Category) => {
    setCatFormError(null);
    if (cat) {
      setEditingCat(cat);
      setCatForm({
        name: cat.name,
        displayOrder: cat.displayOrder,
        isActive: cat.isActive,
      });
    } else {
      setEditingCat(null);
      setCatForm({
        name: '',
        displayOrder: categories.length + 1,
        isActive: true,
      });
    }
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCatFormError(null);

    if (!catForm.name.trim()) {
      setCatFormError('Category name is required.');
      return;
    }

    saveCategory({
      id: editingCat?.id || `cat_${Date.now()}`,
      name: catForm.name.trim(),
      displayOrder: Number(catForm.displayOrder) || 1,
      isActive: catForm.isActive,
    });

    setIsCatModalOpen(false);
    loadData();
  };

  const handleDeleteCategory = (id: string, name: string) => {
    const attachedCount = menuItems.filter((i) => i.categoryId === id).length;
    if (attachedCount > 0) {
      alert(`Cannot delete category "${name}" because it currently has ${attachedCount} dishes attached. Please reassign or remove those items first.`);
      return;
    }

    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      deleteCategory(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-500 font-bold block mb-1">
            Menu & Pricing Control
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
            Menu Management
          </h1>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex items-center gap-3">
          <div className="bg-stone-200/80 dark:bg-stone-800 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('items')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'items'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Dishes ({menuItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'categories'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Categories ({categories.length})
            </button>
          </div>

          {activeTab === 'items' ? (
            <button
              type="button"
              onClick={() => openItemModal()}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openCategoryModal()}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* ITEMS VIEW */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 pos-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCatFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCatFilter === 'all'
                    ? 'bg-stone-900 dark:bg-amber-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCatFilter(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCatFilter === c.id
                      ? 'bg-stone-900 dark:bg-amber-600 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase">
                    <th className="py-3.5 px-4">Dish</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price (₹)</th>
                    <th className="py-3.5 px-4 text-center">Diet</th>
                    <th className="py-3.5 px-4 text-center">Featured</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400 dark:text-stone-500 text-sm">
                        No dishes found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => {
                      const catName =
                        categories.find((c) => c.id === item.categoryId)?.name ||
                        'Uncategorized';

                      return (
                        <tr key={item.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shrink-0"
                              />
                              <div>
                                <span className="font-semibold text-stone-900 dark:text-stone-100 block leading-tight">
                                  {item.name}
                                </span>
                                <span className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1 max-w-xs mt-0.5">
                                  {item.description}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs font-medium text-stone-600 dark:text-stone-400">
                            {catName}
                          </td>
                          <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100 font-mono">
                            {formatInr(item.pricePaise)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                item.isVeg
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                                }`}
                              />
                              {item.isVeg ? 'Veg' : 'Non-Veg'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.isFeatured ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                                <Sparkles className="w-3 h-3 fill-amber-500" />
                                Yes
                              </span>
                            ) : (
                              <span className="text-xs text-stone-400 dark:text-stone-600">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleAvailability(item.id)}
                              title={item.isAvailable ? 'Click to mark Sold Out' : 'Click to mark Available'}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                item.isAvailable
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                                  : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-300 dark:hover:bg-stone-700'
                              }`}
                            >
                              {item.isAvailable ? (
                                <>
                                  <Eye className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                                  <span>Active</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 text-stone-500 dark:text-stone-400" />
                                  <span>Sold Out</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openItemModal(item)}
                                className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors"
                                title="Edit Dish"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.id, item.name)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-stone-800 transition-colors"
                                title="Delete Dish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES VIEW */}
      {activeTab === 'categories' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900 dark:text-white">Menu Categories</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Organize and reorder categories displayed on the website and POS</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase">
                  <th className="py-3.5 px-4 w-16">Order</th>
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4 text-center">Items Count</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {categories.map((cat) => {
                  const count = menuItems.filter((i) => i.categoryId === cat.id).length;
                  return (
                    <tr key={cat.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-stone-500 dark:text-stone-400">
                        {cat.displayOrder}
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-900 dark:text-stone-100">
                        {cat.name}
                      </td>
                      <td className="py-3 px-4 text-center text-xs font-medium text-stone-600 dark:text-stone-300">
                        {count} dishes
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            cat.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                              : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                          }`}
                        >
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openCategoryModal(cat)}
                            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-stone-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-stone-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISH ITEM MODAL */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-6">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
                {editingItem ? 'Edit Menu Dish' : 'Add New Menu Dish'}
              </h3>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {itemFormError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{itemFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-1">
                    Category *
                  </label>
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-1">
                    Price in Rupees (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={itemForm.priceRupees}
                    onChange={(e) => setItemForm({ ...itemForm, priceRupees: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-1">
                  Food Photograph Image URL
                </label>
                <input
                  type="url"
                  value={itemForm.imageUrl}
                  onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-700 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/60">
                  <input
                    type="checkbox"
                    checked={itemForm.isVeg}
                    onChange={(e) => setItemForm({ ...itemForm, isVeg: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">Vegetarian Dish</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-700 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/60">
                  <input
                    type="checkbox"
                    checked={itemForm.isFeatured}
                    onChange={(e) => setItemForm({ ...itemForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">Featured Item</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-700 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/60">
                  <input
                    type="checkbox"
                    checked={itemForm.isAvailable}
                    onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">In Stock</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold shadow-sm"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800 mb-6">
              <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
                {editingCat ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {catFormError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
                {catFormError}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={catForm.displayOrder}
                  onChange={(e) => setCatForm({ ...catForm, displayOrder: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 dark:border-stone-700 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/60">
                <input
                  type="checkbox"
                  checked={catForm.isActive}
                  onChange={(e) => setCatForm({ ...catForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">Active (Visible in Menu)</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
