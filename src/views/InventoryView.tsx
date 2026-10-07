import React, { useState } from 'react';
import { InventoryItem, StockHistoryEntry } from '../types';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  IndianRupee,
  Layers,
  X,
  PlusCircle,
  MinusCircle,
  History,
  Edit2,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  Wrench,
  Clock,
  Building,
  Filter,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';
import { NWLogo } from '../components/NWLogo';

interface InventoryViewProps {
  items: InventoryItem[];
  onUpdateStock: (itemId: string, delta: number) => Promise<void>;
  onAddItem: (itemData: Omit<InventoryItem, 'id'>) => Promise<void>;
  onEditItem?: (itemId: string, updates: Partial<InventoryItem>) => Promise<void>;
  onDeleteItem?: (itemId: string) => Promise<void>;
  onAddStock?: (itemId: string, qty: number, notes?: string, supplier?: string) => Promise<void>;
  onStockOut?: (itemId: string, qty: number, notes?: string) => Promise<void>;
}

const CATEGORIES = [
  'All',
  'Low Stock',
  'PCB / Boards',
  'IGBT / Modules',
  'MOSFET / Diodes',
  'Capacitors',
  'Other Welding Components',
  'Other Component',
] as const;

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  onUpdateStock,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAddStock,
  onStockOut,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [stockInItem, setStockInItem] = useState<InventoryItem | null>(null);
  const [stockOutItem, setStockOutItem] = useState<InventoryItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<InventoryItem | null>(null);

  // Form states for Add / Edit
  const [formPartName, setFormPartName] = useState('');
  const [formPartNumber, setFormPartNumber] = useState('');
  const [formCategory, setFormCategory] = useState('PCB / Boards');
  const [formCustomCategory, setFormCustomCategory] = useState('');
  const [formQuantity, setFormQuantity] = useState(10);
  const [formPurchasePrice, setFormPurchasePrice] = useState(100);
  const [formSellingPrice, setFormSellingPrice] = useState(180);
  const [formMinThreshold, setFormMinThreshold] = useState(5);
  const [formSupplier, setFormSupplier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stock In form
  const [stockInQty, setStockInQty] = useState(10);
  const [stockInSupplier, setStockInSupplier] = useState('');
  const [stockInNotes, setStockInNotes] = useState('Stock purchase replenishment');

  // Stock Out form
  const [stockOutQty, setStockOutQty] = useState(1);
  const [stockOutNotes, setStockOutNotes] = useState('Component replaced/testing');

  // Filter items
  const filtered = items.filter((it) => {
    const matchesSearch =
      it.partName.toLowerCase().includes(search.toLowerCase()) ||
      (it.partNumber && it.partNumber.toLowerCase().includes(search.toLowerCase())) ||
      (it.supplier && it.supplier.toLowerCase().includes(search.toLowerCase())) ||
      it.category.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Low Stock') {
      const min = it.minStockLevel ?? it.minThreshold ?? 5;
      return it.quantity <= min;
    }
    if (selectedCategory === 'Other Component') {
      return (
        it.category === 'Other Component' ||
        it.category === 'Custom' ||
        !['PCB / Boards', 'IGBT / Modules', 'MOSFET / Diodes', 'Capacitors', 'Other Welding Components'].includes(
          it.category
        )
      );
    }
    return it.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const lowStockCount = items.filter((it) => {
    const min = it.minStockLevel ?? it.minThreshold ?? 5;
    return it.quantity <= min;
  }).length;

  const totalPartsQuantity = items.reduce((s, i) => s + (i.quantity || 0), 0);

  const resetForm = () => {
    setFormPartName('');
    setFormPartNumber('');
    setFormCategory('PCB / Boards');
    setFormCustomCategory('');
    setFormQuantity(10);
    setFormPurchasePrice(100);
    setFormSellingPrice(180);
    setFormMinThreshold(5);
    setFormSupplier('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormPartName(item.partName);
    setFormPartNumber(item.partNumber || '');
    setFormCategory(item.category);
    setFormQuantity(item.quantity);
    setFormPurchasePrice(item.purchasePrice || item.unitPrice || 0);
    setFormSellingPrice(item.sellingPrice || item.unitPrice || 0);
    setFormMinThreshold(item.minStockLevel ?? item.minThreshold ?? 5);
    setFormSupplier(item.supplier || '');
  };

  const handleSaveSpare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPartName.trim()) return;

    try {
      setIsSubmitting(true);
      const finalCategory =
        formCategory === 'Other Component' && formCustomCategory.trim()
          ? formCustomCategory.trim()
          : formCategory;

      if (editingItem && onEditItem) {
        await onEditItem(editingItem.id, {
          partName: formPartName.trim(),
          partNumber: formPartNumber.trim(),
          category: finalCategory,
          quantity: Number(formQuantity) || 0,
          purchasePrice: Number(formPurchasePrice) || 0,
          sellingPrice: Number(formSellingPrice) || 0,
          unitPrice: Number(formSellingPrice) || 0,
          minThreshold: Number(formMinThreshold) || 5,
          minStockLevel: Number(formMinThreshold) || 5,
          supplier: formSupplier.trim() || undefined,
        });
        setEditingItem(null);
      } else {
        await onAddItem({
          partName: formPartName.trim(),
          partNumber: formPartNumber.trim() || `PART-${Date.now().toString().slice(-4)}`,
          category: finalCategory,
          quantity: Number(formQuantity) || 0,
          purchasePrice: Number(formPurchasePrice) || 0,
          sellingPrice: Number(formSellingPrice) || 0,
          unitPrice: Number(formSellingPrice) || 0,
          minThreshold: Number(formMinThreshold) || 5,
          minStockLevel: Number(formMinThreshold) || 5,
          supplier: formSupplier.trim() || undefined,
        });
        setIsAddOpen(false);
      }
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockInItem || !onAddStock || stockInQty <= 0) return;
    try {
      setIsSubmitting(true);
      await onAddStock(stockInItem.id, Number(stockInQty), stockInNotes, stockInSupplier);
      setStockInItem(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockOutItem || !onStockOut || stockOutQty <= 0) return;
    try {
      setIsSubmitting(true);
      await onStockOut(stockOutItem.id, Number(stockOutQty), stockOutNotes);
      setStockOutItem(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirmItem || !onDeleteItem) return;
    try {
      setIsSubmitting(true);
      await onDeleteItem(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5 pb-24 max-w-lg mx-auto px-3.5 pt-3">
      {/* Top Banner with NW Logo */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 rounded-3xl p-4 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <NWLogo variant="header" showText={false} />
          <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
            Workshop Spares & Components
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black tracking-tight leading-tight">Spare Parts Inventory</h3>
            <p className="text-xs text-blue-100 mt-0.5">
              {items.length} Component types • {totalPartsQuantity} Total in stock
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-900 font-extrabold text-xs px-3.5 py-2.5 rounded-2xl flex items-center gap-1.5 shadow-md shadow-amber-950/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Spare</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search spares (IGBT, SMPS, PCB, Diode, Capacitors, Switch)..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden shadow-2xs"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none text-xs">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const isAlertTab = cat === 'Low Stock';

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs flex items-center gap-1 ${
                  isSelected
                    ? isAlertTab
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-blue-600 text-white shadow-xs'
                    : isAlertTab && lowStockCount > 0
                    ? 'bg-amber-50 text-amber-900 border border-amber-300'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{cat}</span>
                {isAlertTab && lowStockCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-mono">
                    {lowStockCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div
          onClick={() => setSelectedCategory('Low Stock')}
          className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-xs text-amber-950 cursor-pointer hover:bg-amber-100 transition-colors shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <strong>{lowStockCount} components are running LOW!</strong>
              <span className="block text-[11px] text-amber-800">
                Quantity at or below minimum workshop threshold. Order stock soon.
              </span>
            </div>
          </div>
          <span className="text-[11px] font-black text-blue-700 underline shrink-0 ml-2">View List</span>
        </div>
      )}

      {/* Inventory List Count */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <span className="font-bold">
          Showing {filtered.length} of {items.length} parts
        </span>
        {selectedCategory !== 'All' && (
          <button
            onClick={() => setSelectedCategory('All')}
            className="text-blue-600 font-bold hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Spares Cards List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-500 space-y-2">
            <Package className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="font-extrabold text-slate-800 text-sm">No spare components found</h4>
            <p className="text-xs text-slate-400">
              Try adjusting your search query or add a new component manually.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-2 py-2 px-4 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Component
            </button>
          </div>
        ) : (
          filtered.map((item) => {
            const minLevel = item.minStockLevel ?? item.minThreshold ?? 5;
            const isLow = item.quantity <= minLevel;
            const purchase = item.purchasePrice || item.unitPrice || 0;
            const selling = item.sellingPrice || item.unitPrice || 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-3.5 border transition-all shadow-2xs ${
                  isLow ? 'border-amber-300 ring-2 ring-amber-100 bg-amber-50/10' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {item.category}
                      </span>
                      {item.partNumber && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.partNumber}
                        </span>
                      )}
                      {isLow && (
                        <span className="text-[10px] font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          LOW STOCK
                        </span>
                      )}
                    </div>

                    <h4 className="font-black text-slate-900 text-sm leading-snug">
                      {item.partName}
                    </h4>

                    {item.supplier && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        Supplier: <strong className="font-medium text-slate-700">{item.supplier}</strong>
                      </p>
                    )}
                  </div>

                  {/* Stock Quantity Badge */}
                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono font-black text-base px-3 py-1 rounded-2xl border ${
                        isLow
                          ? 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-200'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {item.quantity} <span className="text-[11px] font-bold">pcs</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Min level: {minLevel} pcs
                    </span>
                  </div>
                </div>

                {/* Price and Financials Row */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Purchase Cost</span>
                    <span className="font-mono font-bold text-slate-700">₹{purchase}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Selling / Repair Rate</span>
                    <span className="font-mono font-black text-emerald-700">₹{selling}</span>
                  </div>
                </div>

                {/* Quick Stock Movement & Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setStockInItem(item);
                        setStockInQty(10);
                        setStockInSupplier(item.supplier || '');
                      }}
                      className="inline-flex items-center gap-1 py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 transition-colors cursor-pointer"
                      title="Stock In - Add Quantity"
                    >
                      <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>+ Stock In</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStockOutItem(item);
                        setStockOutQty(1);
                      }}
                      className="inline-flex items-center gap-1 py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-900 font-bold text-xs rounded-xl border border-rose-300 transition-colors cursor-pointer"
                      title="Stock Out - Deduct Quantity"
                    >
                      <ArrowUpCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>- Stock Out</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setHistoryItem(item)}
                      className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="View Stock Movement History"
                    >
                      <History className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Spare Part"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmItem(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Spare Part"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 1. Add / Edit Spare Modal (Supports Custom / Other Spares) */}
      {(isAddOpen || !!editingItem) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  {editingItem ? 'Edit Spare Part' : 'Add New Spare Component'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingItem ? 'Update specifications, pricing and thresholds' : 'Register a new component for welding machine repairs'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingItem(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSpare} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Component / Part Name *
                </label>
                <input
                  type="text"
                  value={formPartName}
                  onChange={(e) => setFormPartName(e.target.value)}
                  placeholder="e.g. 25N120 IGBT PCB, 400i Control PCB, Mosfet 3878..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Part / Sku No.</label>
                  <input
                    type="text"
                    value={formPartNumber}
                    onChange={(e) => setFormPartNumber(e.target.value)}
                    placeholder="e.g. PCB-25N120"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-2 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  >
                    <option value="PCB / Boards">PCB / Boards</option>
                    <option value="IGBT / Modules">IGBT / Modules</option>
                    <option value="MOSFET / Diodes">MOSFET / Diodes</option>
                    <option value="Capacitors">Capacitors</option>
                    <option value="Other Welding Components">Other Welding Components</option>
                    <option value="Other Component">Other Component (Custom)</option>
                  </select>
                </div>
              </div>

              {/* If "Other Component" selected, allow custom category typing */}
              {formCategory === 'Other Component' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custom Component Category *
                  </label>
                  <input
                    type="text"
                    value={formCustomCategory}
                    onChange={(e) => setFormCustomCategory(e.target.value)}
                    placeholder="e.g. Transformer, Torch Spare, Gas Solenoid..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Purchase (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formPurchasePrice}
                    onChange={(e) => setFormPurchasePrice(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono font-bold text-emerald-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Min Stock Alert Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formMinThreshold}
                    onChange={(e) => setFormMinThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono"
                    placeholder="Alert when <= 5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supplier / Vendor</label>
                  <input
                    type="text"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    placeholder="e.g. Delta Spares, Anand MIDC"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-colors"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Save Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Stock In Modal */}
      {stockInItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">Stock In (Add Stock)</h3>
              </div>
              <button
                onClick={() => setStockInItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-2xl mb-3 border border-slate-200 text-xs">
              <span className="font-black text-slate-900 block">{stockInItem.partName}</span>
              <span className="text-slate-500">Current Stock: <strong className="font-mono text-emerald-700">{stockInItem.quantity} pcs</strong></span>
            </div>

            <form onSubmit={handleStockInSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity Received (pcs) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={stockInQty}
                  onChange={(e) => setStockInQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier / Vendor</label>
                <input
                  type="text"
                  value={stockInSupplier}
                  onChange={(e) => setStockInSupplier(e.target.value)}
                  placeholder="e.g. Delta Spares, Anand MIDC"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Bill No.</label>
                <input
                  type="text"
                  value={stockInNotes}
                  onChange={(e) => setStockInNotes(e.target.value)}
                  placeholder="e.g. Invoice #4892 from vendor"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStockInItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md"
                >
                  {isSubmitting ? 'Adding...' : 'Confirm Stock In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Stock Out Modal */}
      {stockOutItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-base text-slate-900">Stock Out (Deduct Stock)</h3>
              </div>
              <button
                onClick={() => setStockOutItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-2xl mb-3 border border-slate-200 text-xs">
              <span className="font-black text-slate-900 block">{stockOutItem.partName}</span>
              <span className="text-slate-500">Available: <strong className="font-mono text-blue-800">{stockOutItem.quantity} pcs</strong></span>
            </div>

            <form onSubmit={handleStockOutSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity to Deduct (pcs) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={stockOutItem.quantity}
                  value={stockOutQty}
                  onChange={(e) => setStockOutQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Notes *</label>
                <input
                  type="text"
                  value={stockOutNotes}
                  onChange={(e) => setStockOutNotes(e.target.value)}
                  placeholder="e.g. Defective part, counter cash sale, internal testing"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStockOutItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md"
                >
                  {isSubmitting ? 'Deducting...' : 'Confirm Stock Out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Stock Movement History Modal */}
      {historyItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Stock Movement History</h3>
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-[240px]">
                    {historyItem.partName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHistoryItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 bg-blue-50/60 rounded-2xl border border-blue-200/60 my-3 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Stock</span>
                <span className="font-mono font-black text-blue-900 text-base">{historyItem.quantity} pcs</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Min Threshold</span>
                <span className="font-mono font-bold text-slate-700">{historyItem.minStockLevel ?? historyItem.minThreshold ?? 5} pcs</span>
              </div>
            </div>

            {/* History Entries List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {!historyItem.stockHistory || historyItem.stockHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No stock history recorded yet for this component.
                </div>
              ) : (
                historyItem.stockHistory.map((hist) => {
                  const isJobUse = hist.type === 'JOB_USE';
                  const isStockIn = hist.type === 'IN';

                  return (
                    <div
                      key={hist.id}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white text-xs space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-black text-[10px] uppercase px-2 py-0.5 rounded-md ${
                            isJobUse
                              ? 'bg-blue-100 text-blue-800'
                              : isStockIn
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isJobUse ? 'Job Repair Use' : isStockIn ? 'Stock In' : 'Stock Out'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {hist.date}
                        </span>
                      </div>

                      <div className="flex items-center justify-between font-mono pt-1">
                        <span className="text-slate-600 font-medium">
                          {hist.previousQty} pcs → <strong>{hist.newQty} pcs</strong>
                        </span>
                        <span
                          className={`font-black ${
                            isStockIn ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {isStockIn ? `+${hist.quantity}` : `-${hist.quantity}`} pcs
                        </span>
                      </div>

                      {hist.notes && (
                        <p className="text-[11px] text-slate-600 font-medium bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          {hist.notes}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 mt-2">
              <button
                type="button"
                onClick={() => setHistoryItem(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-5 shadow-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">Delete Spare Part?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong>{deleteConfirmItem.partName}</strong> from workshop inventory?
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteItem}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
