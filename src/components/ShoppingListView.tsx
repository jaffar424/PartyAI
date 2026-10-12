import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Search,
  Filter,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Store,
  Layers,
  ShoppingBag,
  HelpCircle,
  Tag,
} from 'lucide-react';
import { ShoppingItem, ItemCategory, StoreType, PriorityLevel } from '../types/planner';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  targetBudget?: number;
  onTogglePurchased: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (updated: ShoppingItem) => void;
  onAddItem: (item: ShoppingItem) => void;
  onOpenSubstitute: (item: ShoppingItem) => void;
  onProceedToCheckout?: () => void;
}

const CATEGORIES: { id: ItemCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Items', icon: '🛒' },
  { id: 'food', label: 'Food & Groceries', icon: '🍽️' },
  { id: 'drinks', label: 'Drinks & Bar', icon: '🍹' },
  { id: 'tableware', label: 'Tableware & Serve', icon: '🍽' },
  { id: 'decor', label: 'Decor & Ambiance', icon: '✨' },
  { id: 'activities', label: 'Fun & Games', icon: '🎉' },
  { id: 'essentials', label: 'Ice & Supplies', icon: '🧊' },
];

const STORE_LIST = [
  'All Stores',
  'Aisle 1 - Fresh Produce & Bakery',
  'Aisle 3 - Butcher & Seafood',
  'Aisle 5 - Party Supplies & Paper Goods',
  'Aisle 7 - Snacks & Pantry Staples',
  'Aisle 9 - Beverages & Chilled Ice',
];

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  targetBudget,
  onTogglePurchased,
  onDeleteItem,
  onUpdateItem,
  onAddItem,
  onOpenSubstitute,
  onProceedToCheckout,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<string>('All Stores');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'remaining' | 'purchased'>('all');
  const [groupBy, setGroupBy] = useState<'none' | 'store' | 'category'>('store');

  // Edit item state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editCost, setEditCost] = useState<number>(0);

  // Add new item state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ItemCategory>('food');
  const [newQty, setNewQty] = useState('1');
  const [newCost, setNewCost] = useState<number>(10);
  const [newStore, setNewStore] = useState<StoreType>('Supermarket / Grocery');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('recommended');

  const startEdit = (item: ShoppingItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditQty(item.quantity);
    setEditCost(item.estimatedCost);
  };

  const saveEdit = (item: ShoppingItem) => {
    onUpdateItem({
      ...item,
      name: editName.trim() || item.name,
      quantity: editQty.trim() || item.quantity,
      estimatedCost: Number(editCost) || item.estimatedCost,
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newItem: ShoppingItem = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      category: newCategory,
      quantity: newQty.trim() || '1 item',
      estimatedCost: Number(newCost) || 5,
      store: newStore,
      dietaryTags: [],
      reason: 'Host custom added item',
      priority: newPriority,
      isPurchased: false,
    };

    onAddItem(newItem);
    setNewName('');
    setNewQty('1');
    setNewCost(10);
    setIsAddingItem(false);
  };

  // Filtering
  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedStore !== 'All Stores' && item.store !== selectedStore) return false;
    if (statusFilter === 'remaining' && item.isPurchased) return false;
    if (statusFilter === 'purchased' && !item.isPurchased) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchStore = item.store.toLowerCase().includes(q);
      const matchTags = item.dietaryTags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchStore && !matchTags) return false;
    }
    return true;
  });

  const totalFilteredCost = filteredItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  const remainingCount = items.filter((i) => !i.isPurchased).length;
  const purchasedCount = items.filter((i) => i.isPurchased).length;

  // Grouping helper
  const renderItemCard = (item: ShoppingItem) => {
    const isEditing = editingId === item.id;

    return (
      <div
        key={item.id}
        className={`group p-4 rounded-2xl border transition-all ${
          item.isPurchased
            ? 'bg-slate-50/70 border-slate-200/80 opacity-75'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
      >
        {isEditing ? (
          // Inline Edit Form
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-semibold col-span-2"
                placeholder="Item name"
              />
              <input
                type="number"
                step="0.5"
                value={editCost}
                onChange={(e) => setEditCost(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-sm font-bold text-emerald-700"
                placeholder="Est. cost ($)"
              />
            </div>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={editQty}
                onChange={(e) => setEditQty(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs w-48"
                placeholder="Quantity (e.g. 3 lbs)"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveEdit(item)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1 rounded-lg bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Display Mode
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: Checkbox + Name + Quantity */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => onTogglePurchased(item.id)}
                className={`mt-0.5 p-1 rounded-lg transition-colors cursor-pointer ${
                  item.isPurchased
                    ? 'text-emerald-600 hover:text-emerald-700'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title={item.isPurchased ? 'Mark as not purchased' : 'Mark as purchased'}
              >
                {item.isPurchased ? (
                  <CheckSquare className="w-5 h-5 fill-emerald-50 text-emerald-600" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400" />
                )}
              </button>

              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <span
                    className={`font-bold text-sm sm:text-base ${
                      item.isPurchased ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}
                  >
                    {item.name}
                  </span>

                  {/* Quantity Tag */}
                  <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                    {item.quantity}
                  </span>

                  {/* Priority Tag */}
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      item.priority === 'essential'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.priority === 'recommended'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {item.priority === 'optional_splurge' ? 'Splurge' : item.priority}
                  </span>
                </div>

                {/* Reason & Portion formula */}
                {item.reason && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.reason}</span>
                  </p>
                )}

                {/* Badges: Store + Dietary */}
                <div className="flex items-center flex-wrap gap-1.5 mt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100/90 px-2.5 py-0.5 rounded-md">
                    <Store className="w-3 h-3 text-slate-500" />
                    {item.store}
                  </span>

                  {item.dietaryTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/50 flex items-center gap-1"
                    >
                      <Tag className="w-2.5 h-2.5 text-emerald-500" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Cost & Action Buttons */}
            <div className="flex items-center justify-between sm:justify-end gap-3 pl-8 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="text-right">
                <div className="text-base sm:text-lg font-black text-slate-900">
                  ${item.estimatedCost.toFixed(2)}
                </div>
                {item.cymbalRollbackSavings && item.cymbalRollbackSavings > 0 ? (
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                    <Tag className="w-2.5 h-2.5" />
                    <span>Rollback -${item.cymbalRollbackSavings.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400">CymbalMart Price</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {/* AI Swap Button */}
                <button
                  onClick={() => onOpenSubstitute(item)}
                  className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-colors cursor-pointer"
                  title="Find AI Budget or Dietary Swap"
                >
                  <Sparkles className="w-4 h-4 text-rose-500" />
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => startEdit(item)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Edit quantity or cost"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Remove from shopping list"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 mb-6">
      {/* Top Bar: Title & Search & Add Item */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <h2 className="font-bold text-lg text-slate-900">Procurement Shopping Checklist</h2>
          </div>
          <p className="text-xs text-slate-500">
            {remainingCount} items remaining • {purchasedCount} purchased • Total:{' '}
            <strong className="text-slate-900">${totalFilteredCost.toFixed(0)}</strong>
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, stores..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add Item Button */}
          <button
            onClick={() => setIsAddingItem(!isAddingItem)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Add Custom Item Drawer / Form */}
      {isAddingItem && (
        <form
          onSubmit={handleAddNewItem}
          className="mt-4 p-4 rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-rose-600" /> Add Custom Party Item
            </span>
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Item name (e.g. Birthday Sparkler Candles)"
              className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900"
              required
            />
            <input
              type="text"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              placeholder="Quantity (e.g. 2 packs)"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900"
            />
            <input
              type="number"
              step="0.5"
              value={newCost}
              onChange={(e) => setNewCost(Number(e.target.value))}
              placeholder="Est. Cost ($)"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-emerald-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ItemCategory)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
            >
              <option value="food">Food & Groceries</option>
              <option value="drinks">Drinks & Bar</option>
              <option value="tableware">Tableware</option>
              <option value="decor">Decor</option>
              <option value="activities">Activities / Favors</option>
              <option value="essentials">Ice & Supplies</option>
            </select>

            <select
              value={newStore}
              onChange={(e) => setNewStore(e.target.value as StoreType)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
            >
              {STORE_LIST.filter((s) => s !== 'All Stores').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800"
              >
                <option value="essential">Essential</option>
                <option value="recommended">Recommended</option>
                <option value="optional_splurge">Splurge</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-slate-100 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count =
            cat.id === 'all'
              ? items.length
              : items.filter((i) => i.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Controls Bar: Store Filter + Status Filter + Grouping */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-slate-100 text-xs">
        {/* Store & Status filters */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Store Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
            <Store className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-hidden text-xs"
            >
              {STORE_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Status Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('remaining')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                statusFilter === 'remaining' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              To Buy ({remainingCount})
            </button>
            <button
              onClick={() => setStatusFilter('purchased')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                statusFilter === 'purchased' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Bought ({purchasedCount})
            </button>
          </div>
        </div>

        {/* Group By selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Group by:
          </span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl">
            <button
              onClick={() => setGroupBy('store')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                groupBy === 'store' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Store Route
            </button>
            <button
              onClick={() => setGroupBy('category')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                groupBy === 'category' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Category
            </button>
            <button
              onClick={() => setGroupBy('none')}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                groupBy === 'none' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Flat List
            </button>
          </div>
        </div>
      </div>

      {/* Items List Content */}
      <div className="pt-4 space-y-4">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No items match your active filters</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing search or store filters.</p>
          </div>
        ) : groupBy === 'store' ? (
          // Grouped by Retail Store
          Object.entries(
            filteredItems.reduce((acc, item) => {
              if (!acc[item.store]) acc[item.store] = [];
              acc[item.store].push(item);
              return acc;
            }, {} as Record<string, ShoppingItem[]>)
          ).map(([storeName, groupItems]) => {
            const subtotal = groupItems.reduce((sum, i) => sum + i.estimatedCost, 0);
            const boughtCount = groupItems.filter((i) => i.isPurchased).length;

            return (
              <div key={storeName} className="space-y-2">
                <div className="flex items-center justify-between px-2 py-1 bg-slate-100/70 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      {storeName}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({groupItems.length} items • {boughtCount} bought)
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    Est. ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-2 pl-1">
                  {groupItems.map((item) => renderItemCard(item))}
                </div>
              </div>
            );
          })
        ) : groupBy === 'category' ? (
          // Grouped by Category
          Object.entries(
            filteredItems.reduce((acc, item) => {
              if (!acc[item.category]) acc[item.category] = [];
              acc[item.category].push(item);
              return acc;
            }, {} as Record<string, ShoppingItem[]>)
          ).map(([catKey, groupItems]) => {
            const catObj = CATEGORIES.find((c) => c.id === catKey);
            const subtotal = groupItems.reduce((sum, i) => sum + i.estimatedCost, 0);

            return (
              <div key={catKey} className="space-y-2">
                <div className="flex items-center justify-between px-2 py-1 bg-slate-100/70 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span>{catObj?.icon || '📦'}</span>
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      {catObj?.label || catKey}
                    </span>
                    <span className="text-[11px] text-slate-400">({groupItems.length} items)</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    Est. ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-2 pl-1">
                  {groupItems.map((item) => renderItemCard(item))}
                </div>
              </div>
            );
          })
        ) : (
          // Flat list
          <div className="space-y-2">
            {filteredItems.map((item) => renderItemCard(item))}
          </div>
        )}
      </div>

      {/* CUJ Stage 2 to Stage 3 Progression Bar */}
      {onProceedToCheckout && (
        <div className="mt-8 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 p-4 rounded-2xl border">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
              CUJ Stage 2 Complete
            </span>
            <h4 className="font-bold text-sm text-slate-900">
              List Aligned with Budget (${totalFilteredCost.toFixed(0)} est.)
            </h4>
            <p className="text-xs text-slate-500">
              Next: Adjust dietary/budget constraints and finalize CymbalMart Curbside Pickup or Delivery.
            </p>
          </div>

          <button
            onClick={onProceedToCheckout}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-200 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <span>Proceed to Refine & Checkout</span>
            <span className="text-sm">→</span>
          </button>
        </div>
      )}
    </div>
  );
};
