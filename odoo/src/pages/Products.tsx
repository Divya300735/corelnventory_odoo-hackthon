import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Filter,
  ArrowUpDown,
  CheckCircle2, AlertTriangle, AlertCircle, FileDown,
  X, Edit, Trash2, Image as ImageIcon, Eye
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useProductStore } from '../store/productStore';
import { useAuthStore } from '../store/authStore';
import type { Product } from '../store/productStore';
import ProductDrawer from '../components/ProductDrawer';
import InternalTransferModal from '../components/InternalTransferModal';

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Apparel', 'Food', 'Other'];
const STATUSES = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'In Stock' ? 'text-success bg-success/10 border-success/20' :
    status === 'Low Stock' ? 'text-warning bg-warning/10 border-warning/20' :
    'text-destructive bg-destructive/10 border-destructive/20';

  const Icon =
    status === 'In Stock' ? CheckCircle2 :
    status === 'Low Stock' ? AlertTriangle : AlertCircle;

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', color)}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

export default function Products() {
  const { products, exportProducts, deleteProduct, clearProducts } = useProductStore();
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager';

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Filtered + sorted
  const filtered = products
    .filter(p => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    })
    .sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''));
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const toggleSort = (field: keyof Product) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  // Checkboxes
  const allChecked = filtered.length > 0 && filtered.every(p => selectedIds.has(p.id));
  const someChecked = filtered.some(p => selectedIds.has(p.id));

  const toggleAll = () => {
    if (allChecked) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(p => p.id)));
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach(id => deleteProduct(id));
    setSelectedIds(new Set());
  };

  const openEdit = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProduct(p);
    setDrawerMode('edit');
  };

  const openDelete = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${p.name}"?`)) deleteProduct(p.id);
  };

  const SortIcon = ({ field }: { field: keyof Product }) => (
    <ArrowUpDown className={cn('ml-1 h-3 w-3 transition-opacity', sortField === field ? 'opacity-100 text-primary' : 'opacity-40')} />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Products</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage your inventory items and stock levels.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95 group relative overflow-hidden font-bold',
              showFilters 
                ? 'bg-primary text-white shadow-lg shadow-primary/30 border-transparent' 
                : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
            )}
          >
            <Filter className={cn("h-4 w-4 transition-transform group-hover:rotate-12", "text-white")} />
            <span className="hidden sm:inline">Filter</span>
            {(categoryFilter !== 'All' || statusFilter !== 'All') && !showFilters && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white animate-ping" />
            )}
          </button>
          
          <button 
            onClick={exportProducts} 
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95 group font-bold"
          >
            <FileDown className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button 
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 group font-bold"
          >
            <ArrowUpDown className="h-4 w-4 transition-transform group-hover:rotate-90" />
            <span className="hidden sm:inline">Internal Transfer</span>
          </button>
          {isManager && (
            <>
              <button
                onClick={() => { if(confirm('Are you sure? This will delete all products.')) clearProducts(); }}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95 group font-bold"
              >
                <Trash2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
              <button
                onClick={() => { setEditingProduct(null); setDrawerMode('add'); }}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-purple-500/30 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all active:scale-95 group font-black uppercase tracking-wider text-sm"
              >
                <Plus className="h-4 w-4 transition-transform group-hover:scale-125 font-black" />
                <span className="hidden sm:inline">Add Product</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl border-glow flex flex-wrap gap-4 items-center">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)}
                      className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-all',
                        categoryFilter === cat ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/40'
                      )}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={cn('px-3 py-1 rounded-full text-xs font-medium border transition-all active:scale-90',
                        statusFilter === s ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'border-border hover:border-primary/40 hover:bg-secondary/50'
                      )}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => { setCategoryFilter('All'); setStatusFilter('All'); }}
                className="ml-auto text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Clear filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && isManager && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-primary/30 bg-primary/5">
            <span className="text-sm font-medium text-primary">{selectedIds.size} selected</span>
            <button onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-1.5 text-sm text-blue-500 hover:underline">
              <ArrowUpDown className="w-4 h-4" /> Transfer
            </button>
            <button onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 text-sm text-destructive hover:underline">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
            <button onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="p-4 rounded-xl border-glow glass overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, SKU, category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-transparent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base"
            />
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground mx-1">{filtered.length}</span> of {products.length} items
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-4 py-3 rounded-l-lg w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                    onChange={toggleAll}
                    className="rounded border-input accent-indigo-600 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort('name')}>
                  <div className="flex items-center">Product <SortIcon field="name" /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort('category')}>
                  <div className="flex items-center">SKU / Category <SortIcon field="category" /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort('price')}>
                  <div className="flex items-center">Price <SortIcon field="price" /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort('stock')}>
                  <div className="flex items-center">Stock Level <SortIcon field="stock" /></div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => toggleSort('status')}>
                  <div className="flex items-center">Status <SortIcon field="status" /></div>
                </th>
                <th className="px-4 py-3 rounded-r-lg"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, idx) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  key={product.id}
                  className={cn(
                    'border-b last:border-0 transition-all group relative',
                    selectedIds.has(product.id) ? 'bg-primary/5' : 'hover:bg-secondary/40 hover:shadow-inner'
                  )}
                >
                  <td className="px-4 py-4 w-10 relative">
                    {/* Hover indicator border */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleOne(product.id)}
                      className="rounded border-input accent-indigo-600 w-4 h-4 cursor-pointer"
                      onClick={e => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {/* Product thumbnail */}
                      <div
                        onClick={() => setViewProduct(product)}
                        className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        title="View details"
                      >
                        {(product as any).imageUrl
                          ? <img src={(product as any).imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          : <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        }
                      </div>
                      {/* Clickable name */}
                      <button
                        onClick={() => setViewProduct(product)}
                        className="font-medium text-left hover:text-primary hover:underline truncate max-w-[180px] transition-colors"
                      >
                        {product.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-medium">{product.sku}</span>
                      <span className="text-muted-foreground text-xs">{product.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium">₹{product.price.toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full max-w-[90px] bg-secondary rounded-full h-1.5">
                        <div
                          className={cn('h-1.5 rounded-full transition-all', product.stock > product.maxStock * 0.2 ? 'bg-primary' : 'bg-destructive')}
                          style={{ width: `${Math.min(100, Math.max(0, (product.stock / product.maxStock) * 100))}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{product.stock}/{product.maxStock}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={product.status} /></td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewProduct(product)} title="View" className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-base">
                        <Eye className="w-4 h-4" />
                      </button>
                      {isManager && (
                        <>
                          <button onClick={e => openEdit(product, e)} title="Edit" className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-base">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={e => openDelete(product, e)} title="Delete" className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-destructive transition-base">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                    <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No products found</p>
                    <p className="text-xs mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Detail View */}
      <AnimatePresence>
        {viewProduct && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setViewProduct(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-lg modal-surface rounded-2xl overflow-hidden">
                {/* Image */}
                <div className="w-full h-52 bg-secondary flex items-center justify-center relative overflow-hidden">
                  {(viewProduct as any).imageUrl
                    ? <img src={(viewProduct as any).imageUrl} alt={viewProduct.name} className="w-full h-full object-contain" />
                    : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <ImageIcon className="w-14 h-14 opacity-30" />
                        <span className="text-sm">No image uploaded</span>
                      </div>
                    )
                  }
                  <button onClick={() => setViewProduct(null)} className="absolute top-3 right-3 p-1.5 rounded-full bg-card/80 hover:bg-card transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Details */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">{viewProduct.name}</h2>
                      <p className="text-muted-foreground text-sm font-mono">{viewProduct.sku} · {viewProduct.category}</p>
                    </div>
                    <StatusBadge status={viewProduct.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-secondary/50 text-center">
                      <p className="text-muted-foreground text-xs mb-1">Price</p>
                      <p className="font-bold text-primary">₹{viewProduct.price.toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 text-center">
                      <p className="text-muted-foreground text-xs mb-1">Stock</p>
                      <p className="font-bold">{viewProduct.stock}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 text-center">
                      <p className="text-muted-foreground text-xs mb-1">Max Stock</p>
                      <p className="font-bold">{viewProduct.maxStock}</p>
                    </div>
                  </div>
                  {viewProduct.location && (
                    <p className="text-sm text-muted-foreground">📍 {viewProduct.location}</p>
                  )}
                  <div className="flex gap-2 pt-2">
                    {isManager && (
                      <button
                        onClick={() => { setEditingProduct(viewProduct); setDrawerMode('edit'); setViewProduct(null); }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg hover:bg-secondary transition-base text-sm"
                      >
                        <Edit className="w-4 h-4" /> Edit Product
                      </button>
                    )}
                    <button onClick={() => setViewProduct(null)} className={cn("px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-base", !isManager && "flex-1")}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add / Edit Drawer */}
      <ProductDrawer
        isOpen={drawerMode !== null}
        mode={drawerMode ?? 'add'}
        product={editingProduct}
        onClose={() => { setDrawerMode(null); setEditingProduct(null); }}
      />

      <InternalTransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        initialSelectedItems={Array.from(selectedIds)}
      />
    </div>
  );
}
