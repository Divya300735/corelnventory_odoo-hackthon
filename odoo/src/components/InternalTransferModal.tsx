import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ArrowRight, Package, CheckCircle2, AlertTriangle, 
  MapPin, ChevronRight, ChevronLeft, Building2, Search 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useProductStore, WAREHOUSE_ZONES } from '../store/productStore';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';

interface InternalTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedItems?: string[];
}

// Zones are now imported from productStore

const EMPTY_ARRAY: string[] = [];

export default function InternalTransferModal({ isOpen, onClose, initialSelectedItems = EMPTY_ARRAY }: InternalTransferModalProps) {
  const { products, transferStock } = useProductStore();
  const [step, setStep] = useState(1);
  const [sourceZone, setSourceZone] = useState('');
  const [destZone, setDestZone] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<{ productId: string, qty: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset state when opening
  useEffect(() => {
    if (!isOpen) return;

    setStep(1);
    setSourceZone('');
    setDestZone('');
    setSelectedProducts([]);
    
    if (initialSelectedItems.length > 0) {
      const productData = products.filter(p => initialSelectedItems.includes(p.id));
      if (productData.length > 0) {
        setSourceZone(productData[0].location || '');
        setSelectedProducts(productData.map(p => ({ productId: p.id, qty: p.stock })));
        setStep(2); // Jump to destination if items pre-selected
      }
    }
    // We only want to reset when the modal officially opens
  }, [isOpen]); 

  const zoneStats = useMemo(() => {
    return WAREHOUSE_ZONES.map(zone => {
      const zoneProducts = products.filter(p => p.location === zone.id);
      const used = zoneProducts.reduce((sum, p) => sum + p.stock, 0);
      const free = zone.capacity - used;
      const freePercent = (free / zone.capacity) * 100;
      return { ...zone, used, free, freePercent, hasItems: used > 0 };
    });
  }, [products]);

  const sourceProducts = useMemo(() => {
    return products.filter(p => p.location === sourceZone && (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    ));
  }, [products, sourceZone, searchTerm]);

  const handleTransfer = () => {
    transferStock(selectedProducts, sourceZone, destZone);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#6366f1']
    });
    toast.success(`Successfully transferred items to ${destZone}!`);
    onClose();
  };

  const getStatusColor = (freePercent: number) => {
    if (freePercent > 30) return 'text-success bg-success/10 border-success/20';
    if (freePercent >= 10) return 'text-warning bg-warning/10 border-warning/20';
    return 'text-destructive bg-destructive/10 border-destructive/20';
  };

  const totalUnits = selectedProducts.reduce((sum, p) => sum + p.qty, 0);
  const destUsedAfter = (zoneStats.find(z => z.id === destZone)?.used || 0) + totalUnits;
  const destCap = zoneStats.find(z => z.id === destZone)?.capacity || 1;
  const destPercentAfter = Math.min(100, Math.round((destUsedAfter / destCap) * 100));

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
          className="relative w-full max-w-2xl modal-surface rounded-[2rem] flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b flex items-center justify-between bg-primary/5">
            <div>
              <h2 className="text-2xl font-black text-gradient">Internal Transfer</h2>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    step === s ? "w-8 bg-primary" : step > s ? "w-4 bg-primary/40" : "w-4 bg-secondary"
                  )} />
                ))}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">Step 1: Select Source Location</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {zoneStats.map(zone => (
                    <button
                      key={zone.id}
                      disabled={!zone.hasItems}
                      onClick={() => { setSourceZone(zone.id); setStep(2); }}
                      className={cn(
                        "p-4 rounded-2xl border text-left transition-all group",
                        !zone.hasItems ? "opacity-50 cursor-not-allowed bg-secondary/20" : "hover:border-primary/50 hover:bg-primary/5 bg-card"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold group-hover:text-primary">{zone.id}</span>
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Used: {zone.used} units</span>
                        <span>Cap: {zone.capacity}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">Step 2: Select Destination</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {zoneStats.filter(z => z.id !== sourceZone).map(zone => (
                    <button
                      key={zone.id}
                      onClick={() => { setDestZone(zone.id); setStep(3); }}
                      className="p-4 rounded-2xl border text-left hover:border-primary/50 hover:bg-primary/5 transition-all group bg-card"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold group-hover:text-primary">{zone.id}</span>
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border", getStatusColor(zone.freePercent))}>
                          {zone.free} Units Free
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mt-3">
                        <div className="h-full bg-primary transition-all" style={{ width: `${100 - zone.freePercent}%` }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Step 3: Select Products</h3>
                  </div>
                  <div className="relative w-48">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input 
                      type="text" placeholder="Search..."
                      value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs bg-secondary/50 border rounded-lg focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {sourceProducts.map(p => {
                    const selected = selectedProducts.find(sp => sp.productId === p.id);
                    return (
                      <div key={p.id} className={cn(
                        "p-3 rounded-xl border flex items-center justify-between transition-all",
                        selected ? "bg-primary/5 border-primary/30" : "bg-card"
                      )}>
                        <div className="flex-1">
                          <p className="font-bold text-sm">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{p.sku} • Stock: {p.stock}</p>
                        </div>
                        <div className="flex items-center gap-3">
                           <input 
                            type="number" min="1" max={p.stock}
                            value={selected?.qty || ''}
                            placeholder="Qty"
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const clamped = Math.min(p.stock, Math.max(0, val));
                              setSelectedProducts(prev => {
                                const exist = prev.find(sp => sp.productId === p.id);
                                if (exist) {
                                  if (clamped === 0) return prev.filter(sp => sp.productId !== p.id);
                                  return prev.map(sp => sp.productId === p.id ? { ...sp, qty: clamped } : sp);
                                }
                                if (clamped === 0) return prev;
                                return [...prev, { productId: p.id, qty: clamped }];
                              });
                            }}
                            className="w-20 px-2 py-1 text-xs border rounded bg-background focus:ring-1 focus:ring-primary"
                           />
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <span className="text-xs font-bold text-primary">Selected Items: {selectedProducts.length}</span>
                  <span className="text-xs font-bold text-primary">Total Units: {totalUnits}</span>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <h3 className="font-bold">Step 4: Review & Confirm</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border bg-secondary/20">
                    <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-1">From</p>
                    <p className="font-bold">{sourceZone}</p>
                  </div>
                  <div className="p-4 rounded-2xl border bg-secondary/20">
                    <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-1">To</p>
                    <p className="font-bold">{destZone}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border glass bg-card space-y-3">
                   <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground font-medium">Unique Items</span>
                     <span className="font-bold">{selectedProducts.length} items</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-muted-foreground font-medium">Total Quantity</span>
                     <span className="font-bold">{totalUnits} units</span>
                   </div>
                   
                   <div className="pt-4 space-y-2">
                     <div className="flex justify-between text-xs font-bold">
                       <span className="text-muted-foreground">{destZone} Occupancy After Move</span>
                       <span className={cn(destPercentAfter > 90 ? "text-destructive" : "text-primary")}>{destPercentAfter}%</span>
                     </div>
                     <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-border/50">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${destPercentAfter}%` }}
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            destPercentAfter > 90 ? "bg-destructive" : "bg-primary"
                          )} 
                        />
                     </div>
                     {destPercentAfter > 100 && (
                        <p className="text-[10px] text-destructive flex items-center gap-1 font-bold">
                           <AlertTriangle className="w-3 h-3" /> Destination capacity exceeded! Please reduce quantity.
                        </p>
                     )}
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-secondary/30 flex justify-between items-center">
            {step > 1 ? (
              <button 
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-6 py-2 rounded-xl hover:bg-secondary font-bold text-sm transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}
            
            <div className="flex gap-3">
              <button onClick={onClose} className="px-6 py-2 text-sm font-bold hover:text-primary transition-colors">Cancel</button>
              {step < 4 ? (
                <button 
                  disabled={(step === 1 && !sourceZone) || (step === 2 && !destZone) || (step === 3 && selectedProducts.length === 0)}
                  onClick={() => setStep(s => s + 1)}
                  className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-black text-sm transition-all active:scale-95"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  disabled={destPercentAfter > 100}
                  onClick={handleTransfer}
                  className="px-10 py-3 bg-indigo-600 text-white rounded-xl shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 font-black text-sm transition-all active:scale-95 animate-pulse"
                >
                  CONFIRM TRANSFER
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
