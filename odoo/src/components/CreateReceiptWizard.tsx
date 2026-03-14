import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, CheckCircle2, Plus, Trash2,
  ShoppingCart, Calendar, Building2, PackageCheck, FileText
} from 'lucide-react';
import { useReceiptStore } from '../store/receiptStore';
import type { ReceiptLine } from '../store/receiptStore';
import { cn } from '../lib/utils';
import { WAREHOUSE_ZONES } from '../store/productStore';

const SUPPLIERS = ['Techtronics Inc.', 'Global Furniture Hub', 'Apparel Corp', 'Food Suppliers Ltd', 'Other'];
const WAREHOUSES = WAREHOUSE_ZONES.map(z => z.name);
const PRODUCTS = [
  { name: 'Wireless Headphones', sku: 'EL-001', price: 90 },
  { name: 'Smart Watch', sku: 'EL-002', price: 150 },
  { name: 'Cotton T-Shirt', sku: 'AP-001', price: 5 },
  { name: 'Ergonomic Office Chair', sku: 'FU-001', price: 250 },
  { name: 'Organic Coffee Beans', sku: 'FO-001', price: 8 },
];

const STEPS = [
  { id: 1, title: 'Supplier', icon: Building2, desc: 'Source & delivery info' },
  { id: 2, title: 'Products', icon: ShoppingCart, desc: 'Items to receive' },
  { id: 3, title: 'Review', icon: PackageCheck, desc: 'Confirm & submit' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateReceiptWizard({ isOpen, onClose }: Props) {
  const { addReceipt } = useReceiptStore();
  const [step, setStep] = useState(1);

  // Form state
  const [supplier, setSupplier] = useState('');
  const [supplierRef, setSupplierRef] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [warehouse, setWarehouse] = useState(WAREHOUSES[0] || 'Raw Materials');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<(Omit<ReceiptLine, 'id'> & { isOther?: boolean })[]>([
    { productName: '', sku: '', orderedQty: 1, receivedQty: 0, unitPrice: 0 }
  ]);

  const addLine = () => {
    setLines([...lines, { productName: '', sku: '', orderedQty: 1, receivedQty: 0, unitPrice: 0 }]);
  };

  const removeLine = (idx: number) => {
    setLines(lines.filter((_, i) => i !== idx));
  };

  const updateLine = (idx: number, field: string, value: string | number) => {
    const updated = [...lines];
    updated[idx] = { ...updated[idx], [field]: value };
    
    if (field === 'productName') {
      const found = PRODUCTS.find(p => p.name === value);
      if (found) {
        updated[idx].sku = found.sku;
        updated[idx].unitPrice = found.price;
        updated[idx].isOther = false;
      } else if (value === 'Other') {
        updated[idx].sku = `NEW-${Math.floor(Math.random() * 1000)}`;
        updated[idx].unitPrice = 0;
        updated[idx].isOther = true;
        updated[idx].productName = ''; // Clear it so they can type
      }
    }
    setLines(updated);
  };

  const totalValue = lines.reduce((sum, l) => sum + l.orderedQty * l.unitPrice, 0);

  const handleSubmit = () => {
    addReceipt({
      supplier,
      supplierRef,
      expectedDate,
      warehouse,
      notes,
      lines: lines.map(l => ({ ...l, id: crypto.randomUUID() })),
      status: 'Waiting',
      totalValue,
      createdBy: 'JD',
    });
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSupplier('');
    setSupplierRef('');
    setExpectedDate('');
    setWarehouse(WAREHOUSES[0] || 'Raw Materials');
    setNotes('');
    setLines([{ productName: '', sku: '', orderedQty: 1, receivedQty: 0, unitPrice: 0 }]);
    onClose();
  };

  const canProceedStep1 = supplier && expectedDate && warehouse;
  const canProceedStep2 = lines.length > 0 && lines.every(l => l.productName && l.orderedQty > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-premium"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-2xl modal-surface rounded-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-lg font-bold">Create Receipt</h2>
                <p className="text-xs text-muted-foreground">Step {step} of {STEPS.length}</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress steps */}
            <div className="flex items-center px-6 py-3 border-b bg-secondary/30 gap-0">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                      step > s.id ? "bg-success text-white" : step === s.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    )}>
                      {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                    </div>
                    <div className="hidden sm:block">
                      <p className={cn("text-xs font-medium", step === s.id ? "text-foreground" : "text-muted-foreground")}>{s.title}</p>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn("flex-1 h-px mx-2", step > s.id ? "bg-success" : "bg-border")} />
                  )}
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium mb-1 block">Supplier *</label>
                        <select value={supplier} onChange={e => setSupplier(e.target.value)}
                          className="w-full px-3 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base">
                          <option value="">Select a supplier...</option>
                          {SUPPLIERS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Supplier Reference</label>
                        <input type="text" value={supplierRef} onChange={e => setSupplierRef(e.target.value)}
                          placeholder="e.g. PO-12345"
                          className="w-full px-3 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Destination Warehouse *</label>
                        <select value={warehouse} onChange={e => setWarehouse(e.target.value)}
                          className="w-full px-3 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base">
                          {WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Expected Date *
                        </label>
                        <input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)}
                          className="w-full px-3 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base" />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> Notes
                        </label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)}
                          rows={2} placeholder="Internal notes..."
                          className="w-full px-3 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base resize-none" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Products to Receive</h3>
                      <button onClick={addLine} className="flex items-center gap-1 text-sm text-primary hover:underline">
                        <Plus className="w-3.5 h-3.5" /> Add Line
                      </button>
                    </div>
                    {lines.map((line, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg border bg-secondary/20">
                        <div className="col-span-5">
                          <label className="text-xs text-muted-foreground mb-0.5 block">Product</label>
                          <select value={line.productName} onChange={e => updateLine(idx, 'productName', e.target.value)}
                            className="w-full px-2 py-1.5 text-sm bg-transparent border rounded-md focus:outline-none focus:ring-1 focus:ring-primary">
                            <option value="">Select...</option>
                            {PRODUCTS.map(p => <option key={p.sku} value={p.name}>{p.name}</option>)}
                            <option value="Other">+ Other (Custom Name)</option>
                          </select>
                          {line.isOther && (
                            <input 
                              type="text"
                              placeholder="Enter product name..."
                              className="w-full mt-2 px-2 py-1.5 text-sm bg-transparent border rounded-md focus:outline-none focus:ring-1 focus:ring-primary font-bold animate-in slide-in-from-top-1"
                              value={line.productName}
                              onChange={(e) => updateLine(idx, 'productName', e.target.value)}
                            />
                          )}
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-muted-foreground mb-0.5 block">SKU</label>
                          <input value={line.sku} readOnly
                            className="w-full px-2 py-1.5 text-sm bg-secondary/50 border rounded-md text-muted-foreground" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-muted-foreground mb-0.5 block">Qty</label>
                          <input type="number" min={1} value={line.orderedQty}
                            onChange={e => updateLine(idx, 'orderedQty', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1.5 text-sm bg-transparent border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-muted-foreground mb-0.5 block">Unit Price</label>
                          <input type="number" min={0} value={line.unitPrice}
                            onChange={e => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 text-sm bg-transparent border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <div className="col-span-1 flex items-end justify-center pb-0.5">
                          <button onClick={() => removeLine(idx)} disabled={lines.length === 1}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-end pt-2 border-t">
                      <div className="text-sm">
                        Total: <span className="font-bold text-lg ml-1">₹{totalValue.toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="p-4 rounded-xl border bg-secondary/20 space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Receipt Summary</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-muted-foreground">Supplier:</span><p className="font-medium">{supplier}</p></div>
                        {supplierRef && <div><span className="text-muted-foreground">Supplier Ref:</span><p className="font-medium">{supplierRef}</p></div>}
                        <div><span className="text-muted-foreground">Expected Date:</span><p className="font-medium">{new Date(expectedDate).toLocaleDateString()}</p></div>
                        <div><span className="text-muted-foreground">Warehouse:</span><p className="font-medium">{warehouse}</p></div>
                        {notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span><p className="font-medium">{notes}</p></div>}
                      </div>
                    </div>
                    <div className="rounded-xl border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
                          <tr>
                            <th className="px-4 py-2 text-left">Product</th>
                            <th className="px-4 py-2 text-left">SKU</th>
                            <th className="px-4 py-2 text-right">Qty</th>
                            <th className="px-4 py-2 text-right">Unit Price</th>
                            <th className="px-4 py-2 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map((l, i) => (
                            <tr key={i} className="border-t">
                              <td className="px-4 py-2 font-medium">{l.productName}</td>
                              <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{l.sku}</td>
                              <td className="px-4 py-2 text-right">{l.orderedQty}</td>
                              <td className="px-4 py-2 text-right">₹{l.unitPrice.toFixed(2)}</td>
                              <td className="px-4 py-2 text-right font-medium">₹{(l.orderedQty * l.unitPrice).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t bg-secondary/30">
                          <tr>
                            <td colSpan={4} className="px-4 py-2 text-right font-semibold">Total Value</td>
                            <td className="px-4 py-2 text-right font-bold text-primary">₹{totalValue.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 text-warning text-sm">
                      ⚡ This will create a new receipt in <strong>Waiting</strong> status. The warehouse team will be notified.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-secondary/20">
              <button
                onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-secondary transition-base"
              >
                <ChevronLeft className="w-4 h-4" />
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                  className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-5 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-base"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm Receipt
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
