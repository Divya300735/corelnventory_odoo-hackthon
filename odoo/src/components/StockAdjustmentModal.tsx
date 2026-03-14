import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Package, Save, RefreshCw, 
  AlertTriangle, TrendingDown, TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useProductStore } from '../store/productStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REASONS = [
  'Damaged', 'Lost', 'Found', 'Error', 'Theft', 'Spoilage'
];

export default function StockAdjustmentModal({ isOpen, onClose }: StockAdjustmentModalProps) {
  const { products, adjustStock } = useProductStore();
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [physicalCount, setPhysicalCount] = useState<number | ''>('');
  const [reason, setReason] = useState(REASONS[0]);
  const [notes, setNotes] = useState('');

  const selectedProduct = useMemo(() => 
    products.find(p => p.id === selectedProductId),
  [products, selectedProductId]);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search && !selectedProductId) {
      return products.slice(0, 5); // Show first 5 if empty and nothing selected
    }
    if (selectedProductId) return []; 
    return products.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.sku.toLowerCase().includes(search)
    ).slice(0, 10);
  }, [products, searchTerm, selectedProductId]);

  const variance = useMemo(() => {
    if (!selectedProduct || physicalCount === '') return 0;
    return physicalCount - selectedProduct.stock;
  }, [selectedProduct, physicalCount]);

  const variancePercent = useMemo(() => {
    if (!selectedProduct || selectedProduct.stock === 0) return 0;
    return (Math.abs(variance) / selectedProduct.stock) * 100;
  }, [selectedProduct, variance]);

  const handleSave = () => {
    if (!selectedProduct || physicalCount === '') {
      toast.error('Please select a product and enter valid count');
      return;
    }

    if (physicalCount < 0) {
      toast.error('Physical count cannot be negative');
      return;
    }

    // Manager approval logic
    if (!isManager && variancePercent > 5) {
      toast.warning('Variance exceeds 5%. Manager approval required for this adjustment.');
      return;
    }

    adjustStock(selectedProduct.id, Number(physicalCount), reason, 'adjustment');

    if (variance > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6']
      });
    }

    toast.success(`Stock adjusted for ${selectedProduct.name}`);
    
    // Reset and close
    setSearchTerm('');
    setSelectedProductId('');
    setPhysicalCount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 backdrop-premium" onClick={onClose} 
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl modal-surface rounded-[2.5rem] flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 border-b flex items-center justify-between bg-primary/5">
            <div>
              <h2 className="text-3xl font-black text-gradient">Stock Adjustment</h2>
              <p className="text-sm text-muted-foreground mt-1 font-medium">Reconcile physical inventory with system records.</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Step 1: Product Search */}
            <div className="space-y-3">
              <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">1. Find Product</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedProduct && e.target.value !== selectedProduct.name) {
                      setSelectedProductId('');
                    }
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-secondary/50 border rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none transition-all font-bold"
                />
                
                {/* Autocomplete */}
                <AnimatePresence>
                  {((searchTerm && !selectedProductId) || (!searchTerm && !selectedProductId)) && filteredProducts.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-2xl shadow-xl z-10 overflow-hidden"
                    >
                      {filteredProducts.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setSearchTerm(p.name);
                          }}
                          className="w-full p-4 flex items-center justify-between hover:bg-primary/5 transition-colors border-b last:border-0"
                        >
                          <div className="text-left">
                            <p className="font-bold">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono uppercase">{p.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-primary">{p.stock} Units</p>
                            <p className="text-[10px] text-muted-foreground">{p.location}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {selectedProduct && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 animate-in fade-in"
              >
                {/* Step 2: Current Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-3xl border glass bg-card">
                    <p className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">System Stock</p>
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      <span className="text-3xl font-black">{selectedProduct.stock}</span>
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl border glass bg-card">
                    <p className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Variance</p>
                    <div className="flex items-center gap-2">
                      {variance > 0 ? (
                        <TrendingUp className="w-5 h-5 text-success" />
                      ) : variance < 0 ? (
                        <TrendingDown className="w-5 h-5 text-destructive" />
                      ) : (
                        <RefreshCw className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span className={cn(
                        "text-3xl font-black",
                        variance > 0 ? "text-success" : variance < 0 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {variance > 0 ? `+${variance}` : variance}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 3: Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Physical Count</label>
                    <input 
                      type="number"
                      min="0"
                      value={physicalCount}
                      onChange={(e) => setPhysicalCount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-6 py-4 bg-secondary/30 border rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none transition-all font-black text-2xl"
                    />
                  </div>
                  {variance !== 0 && (
                    <div className="space-y-3">
                      <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Adjustment Reason</label>
                      <select 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-6 py-4 bg-secondary/30 border rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none transition-all font-bold text-lg appearance-none"
                      >
                        {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Notes (Optional)</label>
                  <textarea 
                    placeholder="Provide details about the adjustment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-6 py-4 bg-secondary/30 border rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none transition-all font-medium text-sm min-h-[100px] resize-none"
                  />
                </div>

                {/* High Variance Warning */}
                {!isManager && variancePercent > 5 && (
                  <div className="p-4 rounded-2xl bg-warning/10 border border-warning/30 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-black text-warning-dark uppercase tracking-tight">Manager Approval Required</p>
                      <p className="text-xs text-warning-dark/80 mt-1 font-medium italic">
                        The current variance is {variancePercent.toFixed(1)}%. Adjustments over 5% must be reviewed by a manager.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-8 border-t bg-secondary/30 flex justify-between items-center">
            <button 
              onClick={onClose}
              className="px-8 py-3 rounded-2xl hover:bg-secondary font-black text-xs uppercase tracking-widest transition-all"
            >
              Discard Changes
            </button>
            <button 
              disabled={!selectedProductId || physicalCount === '' || (!isManager && variancePercent > 5)}
              onClick={handleSave}
              className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] shadow-2xl shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 font-black uppercase tracking-widest text-xs"
            >
              <Save className="w-5 h-5" />
              <span>Apply Adjustment</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
