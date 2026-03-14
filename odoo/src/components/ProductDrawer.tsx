import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Save, Trash2, RefreshCw } from 'lucide-react';
import { useProductStore, WAREHOUSE_ZONES } from '../store/productStore';
import type { Product } from '../store/productStore';
import { cn } from '../lib/utils';

interface ProductDrawerProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  product?: Product | null;
  onClose: () => void;
}

const CATEGORIES = ['Electronics', 'Furniture', 'Apparel', 'Food', 'Other'];
// Zones are now imported from productStore

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="text-sm font-medium mb-1 block">{label}</label>
    {children}
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

const inputClass = (err?: string) => cn(
  'w-full px-3 py-2 bg-background text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base text-sm',
  err ? 'border-destructive focus:ring-destructive text-destructive' : ''
);

function generateSku(category: string, count: number) {
  const prefix: Record<string, string> = {
    Electronics: 'EL', Furniture: 'FU', Apparel: 'AP', Food: 'FO', Other: 'OT'
  };
  return `${prefix[category] || 'PR'}-${String(count + 1).padStart(3, '0')}`;
}

export default function ProductDrawer({ isOpen, mode, product, onClose }: ProductDrawerProps) {
  const { addProduct, updateProduct, products } = useProductStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const blank = {
    name: '', sku: '', category: 'Electronics', price: '', stock: '', maxStock: '',
    reorderPoint: '', location: 'Raw Materials', imageUrl: '',
  };

  const [form, setForm] = useState(blank);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form on edit
  useEffect(() => {
    if (mode === 'edit' && product) {
      setForm({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: String(product.price),
        stock: String(product.stock),
        maxStock: String(product.maxStock),
        reorderPoint: String(product.reorderPoint ?? ''),
        location: product.location ?? 'Raw Materials',
        imageUrl: (product as any).imageUrl ?? '',
      });
      setPreviewUrl((product as any).imageUrl ?? '');
    } else {
      setForm(blank);
      setPreviewUrl('');
      setErrors({});
    }
  }, [isOpen, mode, product]);

  const set = (key: string, val: string) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => { const next = { ...e }; delete next[key]; return next; });
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      setPreviewUrl(url);
      setForm(f => ({ ...f, imageUrl: url }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.sku.trim()) errs.sku = 'SKU is required';
    if (!form.price || Number(form.price) < 0) errs.price = 'Valid price required';
    if (!form.stock || Number(form.stock) < 0) errs.stock = 'Valid stock required';
    if (!form.maxStock || Number(form.maxStock) <= 0) errs.maxStock = 'Max stock required';
    
    // Zone capacity check
    const zone = WAREHOUSE_ZONES.find(z => z.id === form.location);
    if (zone) {
      const zoneUsed = products
        .filter(p => p.location === zone.id && (mode === 'edit' ? p.id !== product?.id : true))
        .reduce((sum, p) => sum + p.stock, 0);
      
      const newStock = Number(form.stock);
      if (zoneUsed + newStock > zone.capacity) {
        errs.location = `Selected zone is full (Space: ${zone.capacity - zoneUsed}). Change storage to continue.`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category,
      price: Number(form.price),
      stock: Number(form.stock),
      maxStock: Number(form.maxStock),
      reorderPoint: form.reorderPoint ? Number(form.reorderPoint) : undefined,
      location: form.location,
      imageUrl: form.imageUrl,
    };

    if (mode === 'edit' && product) {
      updateProduct(product.id, payload);
    } else {
      addProduct(payload as any);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 backdrop-premium z-40" />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[580px] bg-card border-l shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b glass sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold">{mode === 'edit' ? 'Edit Product' : 'Add New Product'}</h2>
                <p className="text-sm text-muted-foreground">{mode === 'edit' ? 'Update product details' : 'Fill in the product details below'}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-base">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Image Upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">Product Image</label>
                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden h-44 border bg-secondary group">
                    <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button onClick={() => fileRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-black rounded-lg text-xs font-bold hover:bg-gray-100 transition-transform active:scale-95">
                        Change
                      </button>
                      <button onClick={() => { setPreviewUrl(''); setForm(f => ({ ...f, imageUrl: '' })); }}
                        className="px-3 py-1.5 bg-destructive text-white rounded-lg text-xs font-bold hover:bg-destructive/80 flex items-center gap-1 transition-transform active:scale-95">
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
                      dragActive ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-secondary/40'
                    )}
                  >
                    <div className="p-3 bg-primary/10 rounded-full inline-flex mb-3">
                      <UploadCloud className="w-7 h-7 text-primary" />
                    </div>
                    <p className="font-medium text-sm">Click to upload or drag & drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF or WebP (max 5MB)</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ''; }} />
              </div>

              {/* Name + SKU */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Product Name *" error={errors.name}>
                  <input type="text" className={inputClass(errors.name)} placeholder="e.g. Wireless Keyboard"
                    value={form.name} onChange={e => set('name', e.target.value)} />
                </Field>
                <Field label="SKU *" error={errors.sku}>
                  <div className="flex">
                    <input type="text" className={cn(inputClass(errors.sku), 'rounded-r-none')} placeholder="EL-005"
                      value={form.sku} onChange={e => set('sku', e.target.value)} />
                    <button
                      type="button"
                      onClick={() => set('sku', generateSku(form.category, products.length))}
                      className="px-2.5 py-2 bg-secondary border border-l-0 rounded-r-lg text-xs hover:bg-secondary/80 transition-base text-muted-foreground whitespace-nowrap flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Auto
                    </button>
                  </div>
                </Field>
              </div>

              {/* Category + Location */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <select className={inputClass()} value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Warehouse Location" error={errors.location}>
                  <select 
                    className={cn(
                      inputClass(errors.location),
                      (() => {
                        const zone = WAREHOUSE_ZONES.find(z => z.id === form.location);
                        const used = products.filter(p => p.location === form.location).reduce((sum, p) => sum + p.stock, 0);
                        return (used >= (zone?.capacity || 0)) ? "border-warning text-warning bg-warning/10" : "";
                      })()
                    )} 
                    value={form.location} 
                    onChange={e => set('location', e.target.value)}
                  >
                    {WAREHOUSE_ZONES.map(l => {
                      const used = products.filter(p => p.location === l.id).reduce((sum, p) => sum + p.stock, 0);
                      const isFull = used >= l.capacity;
                      return (
                        <option key={l.id} value={l.id}>
                          {l.id} ({used}/{l.capacity} units) {isFull ? '⚠️ FULL' : ''}
                        </option>
                      );
                    })}
                  </select>
                  {(() => {
                    const zone = WAREHOUSE_ZONES.find(z => z.id === form.location);
                    if (!zone) return null;
                    const used = products.filter(p => p.location === zone.id).reduce((sum, p) => sum + p.stock, 0);
                    const space = zone.capacity - used;
                    if (space <= 0) {
                      return <p className="text-[10px] text-destructive font-black mt-1 uppercase tracking-tighter">🚨 Zone is full. Cannot add more items here.</p>;
                    }
                    return <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-tighter">✅ {space} units of space remaining</p>;
                  })()}
                </Field>
              </div>

              {/* Pricing */}
              <div className="border-t pt-4">
                <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Pricing & Stock</p>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Selling Price (₹) *" error={errors.price}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                      <input type="number" min="0" step="0.01" className={cn(inputClass(errors.price), 'pl-7')} placeholder="0.00"
                        value={form.price} onChange={e => set('price', e.target.value)} />
                    </div>
                  </Field>
                  <Field label="Current Stock *" error={errors.stock}>
                    <input type="number" min="0" className={inputClass(errors.stock)} placeholder="0"
                      value={form.stock} onChange={e => set('stock', e.target.value)} />
                  </Field>
                  <Field label="Max Stock *" error={errors.maxStock}>
                    <input type="number" min="1" className={inputClass(errors.maxStock)} placeholder="100"
                      value={form.maxStock} onChange={e => set('maxStock', e.target.value)} />
                  </Field>
                </div>
              </div>

              {/* Reorder point */}
              <Field label="Reorder Level (Low Stock Alert)">
                <input type="number" min="0" className={inputClass()} placeholder="e.g. 10"
                  value={form.reorderPoint} onChange={e => set('reorderPoint', e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Alert triggers when stock falls below this number</p>
              </Field>
            </div>

            {/* Footer */}
            <div className="p-5 border-t glass sticky bottom-0 flex justify-end gap-3">
              <button onClick={onClose} className="px-5 py-2 border rounded-lg hover:bg-secondary transition-base text-sm">Cancel</button>
              <button onClick={handleSave}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-base flex items-center gap-2 text-sm shadow-md">
                <Save className="w-4 h-4" />
                {mode === 'edit' ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
