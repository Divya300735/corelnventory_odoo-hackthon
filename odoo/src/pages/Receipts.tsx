import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Filter, MoreHorizontal, ArrowUpDown,
  ShoppingCart, CheckCircle2, Clock, XCircle, FileText, ChevronDown, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useProductStore } from '../store/productStore';
import { cn } from '../lib/utils';
import { useReceiptStore } from '../store/receiptStore';
import type { Receipt } from '../store/receiptStore';
import CreateReceiptWizard from '../components/CreateReceiptWizard';

export default function Receipts() {
  const { receipts, updateReceiptStatus } = useReceiptStore();
  const { products, adjustStock } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const STATUS_FLOW: Receipt['status'][] = ['Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Done': return 'text-success bg-success/10 border-success/20';
      case 'Ready': return 'text-primary bg-primary/10 border-primary/20';
      case 'Waiting': return 'text-warning bg-warning/10 border-warning/20';
      case 'Canceled': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-secondary border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Done': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'Ready': return <ShoppingCart className="w-3.5 h-3.5" />;
      case 'Waiting': return <Clock className="w-3.5 h-3.5" />;
      case 'Canceled': return <XCircle className="w-3.5 h-3.5" />;
      default: return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const summaryStats = useMemo(() => [
    { label: 'Total', count: receipts.length, color: 'text-foreground' },
    { label: 'Done', count: receipts.filter(r => r.status === 'Done').length, color: 'text-success' },
    { label: 'Ready', count: receipts.filter(r => r.status === 'Ready').length, color: 'text-primary' },
    { label: 'Waiting', count: receipts.filter(r => r.status === 'Waiting').length, color: 'text-warning' },
    { label: 'Draft', count: receipts.filter(r => r.status === 'Draft').length, color: 'text-muted-foreground' },
  ], [receipts]);

  function StatusBadge({ status }: { status: string }) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', getStatusColor(status))}>
        {getStatusIcon(status)}
        {status}
      </span>
    );
  }

  function StatusChanger({ receipt, onUpdate }: { receipt: Receipt; onUpdate: (status: Receipt['status']) => void }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
          className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-secondary transition-base"
        >
          <StatusBadge status={receipt.status} />
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              className="absolute top-full mt-1 left-0 z-50 bg-card border rounded-xl shadow-xl overflow-hidden min-w-[180px]"
            >
              {STATUS_FLOW.map(s => (
                <button
                  key={s}
                  disabled={s === receipt.status}
                  onClick={(e) => { e.stopPropagation(); onUpdate(s); setOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-base text-left',
                    s === receipt.status ? 'opacity-50 cursor-not-allowed' : ''
                  )}
                >
                  <StatusBadge status={s} />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
      </div>
    );
  }

  const handleStatusUpdate = (id: string, status: Receipt['status']) => {
    const receipt = receipts.find(r => r.id === id);
    const oldStatus = receipt?.status;

    updateReceiptStatus(id, status);

    if (status === 'Done' && oldStatus !== 'Done' && receipt) {
      const currentProducts = products;
      const addProduct = useProductStore.getState().addProduct; // Direct access to avoid stale closures in complex loops if necessary, though hook is fine here

      receipt.lines.forEach(line => {
        const product = currentProducts.find(p => p.sku === line.sku);
        if (product) {
          adjustStock(product.id, line.receivedQty, `Receipt ${receipt.docNo}`, 'receipt');
        } else {
          // New product found from manual entry - register it
          addProduct({
            name: line.productName,
            sku: line.sku,
            category: 'Uncategorized', // Default for new items
            price: line.unitPrice,
            stock: line.receivedQty,
            maxStock: Math.max(line.receivedQty * 2, 100),
            location: receipt.warehouse
          });
          toast.info(`New product ${line.productName} registered in catalog.`);
        }
      });
      toast.success(`Inventory updated for ${receipt.docNo}`);
    }

    setSelectedReceipt(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const filtered = receipts.filter(r =>
    r.docNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Receipts</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage incoming stock from your suppliers.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 font-black uppercase tracking-wider text-sm">
            <Filter className="h-4 w-4 text-white" />
            <span>Filter</span>
          </button>
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:scale-95 group font-black uppercase tracking-wider text-sm"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:scale-125 font-black text-white" />
            <span>Create Receipt</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {summaryStats.map(stat => (
          <div key={stat.label} className="p-5 rounded-[2rem] border-fixed text-center bg-card premium-shadow group transition-all">
            <p className={cn("text-3xl font-black group-hover:scale-110 transition-transform", stat.color)}>{stat.count}</p>
            <p className="text-[10px] uppercase font-black text-muted-foreground mt-1 tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-[2.5rem] border-glow glass premium-shadow bg-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by doc or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Document No</th>
                <th className="px-4 py-3"><div className="flex items-center gap-1 cursor-pointer hover:text-foreground">Supplier <ArrowUpDown className="h-3 w-3" /></div></th>
                <th className="px-4 py-3"><div className="flex items-center gap-1 cursor-pointer hover:text-foreground">Expected Date <ArrowUpDown className="h-3 w-3" /></div></th>
                <th className="px-4 py-3 text-right">Items</th>
                <th className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1 cursor-pointer hover:text-foreground">Value <ArrowUpDown className="h-3 w-3" /></div></th>
                <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((receipt, idx) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={receipt.id}
                  onClick={() => setSelectedReceipt(receipt)}
                  className="border-b last:border-0 hover:bg-secondary/30 transition-base group cursor-pointer"
                >
                  <td className="px-4 py-4 font-medium text-primary hover:underline">{receipt.docNo}</td>
                  <td className="px-4 py-4">{receipt.supplier}</td>
                  <td className="px-4 py-4 text-muted-foreground">{new Date(receipt.expectedDate).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-right">{receipt.lines.reduce((s, l) => s + l.orderedQty, 0)} units</td>
                  <td className="px-4 py-4 text-right font-medium">₹{receipt.totalValue.toFixed(2)}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <StatusBadge status={receipt.status} />
                      {receipt.status !== 'Done' && receipt.status !== 'Canceled' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const idx = STATUS_FLOW.indexOf(receipt.status);
                            const next = STATUS_FLOW[idx + 1];
                            if (next) handleStatusUpdate(receipt.id, next);
                          }}
                          className="text-xs px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-base opacity-0 group-hover:opacity-100 whitespace-nowrap"
                        >
                          → {STATUS_FLOW[STATUS_FLOW.indexOf(receipt.status) + 1]}
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No receipts found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Detail Panel */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="p-6 rounded-xl border-glow glass space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedReceipt.docNo}</h2>
                <p className="text-sm text-muted-foreground">From: {selectedReceipt.supplier}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusChanger 
                  receipt={selectedReceipt}
                  onUpdate={(status) => handleStatusUpdate(selectedReceipt.id, status)}
                />
                <button onClick={() => setSelectedReceipt(null)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Warehouse</p>
                <p className="font-medium">{selectedReceipt.warehouse}</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                <p className="font-bold">₹{selectedReceipt.totalValue.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Items</p>
                <p className="font-medium">{selectedReceipt.lines.length}</p>
              </div>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-xs text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">SKU</th>
                    <th className="px-4 py-2 text-right">Ordered</th>
                    <th className="px-4 py-2 text-right">Received</th>
                    <th className="px-4 py-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReceipt.lines.map(l => (
                    <tr key={l.id} className="border-t hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-2.5 font-medium">{l.productName}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{l.sku}</td>
                      <td className="px-4 py-2.5 text-right font-black">{l.orderedQty}</td>
                      <td className="px-4 py-2.5 text-right font-black text-primary">{l.receivedQty}</td>
                      <td className="px-4 py-2.5 text-right">₹{l.unitPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateReceiptWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
}
