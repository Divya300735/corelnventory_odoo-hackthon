import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus,
  Truck, CheckCircle2, Package, FileText, MapPin, ChevronDown, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useReceiptStore } from '../store/receiptStore';
import { useProductStore } from '../store/productStore';
import type { Delivery } from '../store/receiptStore';
import CreateDeliveryWizard from '../components/CreateDeliveryWizard';
import { toast } from 'react-toastify';

const STATUS_FLOW: Delivery['status'][] = ['Draft', 'Packing', 'In Transit', 'Done', 'Canceled'];

function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'Done' ? 'text-success bg-success/10 border-success/20' :
    status === 'In Transit' ? 'text-primary bg-primary/10 border-primary/20' :
    status === 'Packing' ? 'text-warning bg-warning/10 border-warning/20' :
    status === 'Canceled' ? 'text-destructive bg-destructive/10 border-destructive/20' :
    'text-muted-foreground bg-secondary border-border';

  const Icon =
    status === 'Done' ? CheckCircle2 :
    status === 'In Transit' ? Truck :
    status === 'Packing' ? Package : FileText;

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', color)}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

function StatusChanger({ delivery, onUpdate }: { delivery: Delivery; onUpdate: (status: Delivery['status']) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm hover:bg-secondary transition-base"
      >
        <StatusBadge status={delivery.status} />
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full mt-1 left-0 z-50 bg-card border rounded-xl shadow-xl overflow-hidden min-w-[180px]"
          >
            {STATUS_FLOW.map(s => (
              <button
                key={s}
                disabled={s === delivery.status}
                onClick={() => { onUpdate(s); setOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-base text-left',
                  s === delivery.status ? 'opacity-50 cursor-not-allowed' : ''
                )}
              >
                <StatusBadge status={s} />
                {s === delivery.status && <span className="ml-auto text-xs text-muted-foreground">current</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}

export default function Deliveries() {
  const { deliveries, updateDeliveryStatus, updateDeliveryLineDoneQty } = useReceiptStore();
  const { products, adjustStock } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  const filtered = deliveries.filter(d =>
    d.docNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const summaryStats = [
    { label: 'Total', count: deliveries.length, color: 'text-foreground' },
    { label: 'Done', count: deliveries.filter(d => d.status === 'Done').length, color: 'text-success' },
    { label: 'In Transit', count: deliveries.filter(d => d.status === 'In Transit').length, color: 'text-primary' },
    { label: 'Packing', count: deliveries.filter(d => d.status === 'Packing').length, color: 'text-warning' },
    { label: 'Draft', count: deliveries.filter(d => d.status === 'Draft').length, color: 'text-muted-foreground' },
  ];

  const handleStatusUpdate = (id: string, status: Delivery['status']) => {
    const delivery = deliveries.find(d => d.id === id);
    const oldStatus = delivery?.status;
    
    updateDeliveryStatus(id, status);
    
    // If moving to 'Done', decrease stock for all items from the correct warehouse
    if (status === 'Done' && oldStatus !== 'Done' && delivery) {
      delivery.lines.forEach(line => {
        // Find product that matches SKU AND the delivery's source warehouse
        const product = products.find(p => p.sku === line.sku && p.location === delivery.warehouse);
        if (product) {
          adjustStock(product.id, line.doneQty, `Delivery ${delivery.docNo}`, 'delivery');
        } else {
          // Fallback if not found in specific zone (should not happen if system is used correctly)
          const generalProduct = products.find(p => p.sku === line.sku);
          if (generalProduct) {
             adjustStock(generalProduct.id, line.doneQty, `Delivery ${delivery.docNo}`, 'delivery');
          }
        }
      });
      toast.success(`Inventory updated at ${delivery.warehouse} for ${delivery.docNo}`);
    }

    setSelectedDelivery(prev => prev?.id === id ? { ...prev, status } : prev);
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Deliveries</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage outgoing stock to your customers.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:scale-95 group font-black uppercase tracking-wider text-sm"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:scale-125 font-black text-white" />
            <span>Create Delivery</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {summaryStats.map(stat => (
          <div key={stat.label} className="p-5 rounded-[2rem] border glass text-center bg-card premium-shadow group hover:border-primary/50 transition-all">
            <p className={cn('text-3xl font-black group-hover:scale-110 transition-transform', stat.color)}>{stat.count}</p>
            <p className="text-[10px] uppercase font-black text-muted-foreground mt-1 tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-[2.5rem] border glass premium-shadow bg-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by document or customer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Document No</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((delivery, idx) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={delivery.id}
                  onClick={() => setSelectedDelivery(d => d?.id === delivery.id ? null : delivery)}
                  className="border-b last:border-0 hover:bg-secondary/30 transition-base group cursor-pointer"
                >
                  <td className="px-4 py-4 font-medium text-primary">{delivery.docNo}</td>
                  <td className="px-4 py-4 font-medium">{delivery.customer}</td>
                  <td className="px-4 py-4 text-muted-foreground">{new Date(delivery.scheduledDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-4">
                    <span className="text-xs px-2 py-0.5 rounded border bg-secondary text-muted-foreground">{delivery.deliveryType}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center text-muted-foreground gap-1">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate max-w-[150px] text-xs">{delivery.address}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={delivery.status} /></td>
                  <td className="px-4 py-4 text-right" onClick={e => e.stopPropagation()}>
                    {/* Inline quick status changer */}
                    {delivery.status !== 'Done' && delivery.status !== 'Canceled' && (
                      <button
                        onClick={() => {
                          const idx = STATUS_FLOW.indexOf(delivery.status);
                          const next = STATUS_FLOW[idx + 1];
                          if (next) handleStatusUpdate(delivery.id, next);
                        }}
                        className="text-xs px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full hover:bg-primary/20 transition-base opacity-0 group-hover:opacity-100 whitespace-nowrap"
                      >
                        → {STATUS_FLOW[STATUS_FLOW.indexOf(delivery.status) + 1]}
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No deliveries found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel with status changer */}
      <AnimatePresence>
        {selectedDelivery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="p-6 rounded-xl border glass space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedDelivery.docNo}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <span className="font-bold text-primary">{selectedDelivery.warehouse}</span> → {selectedDelivery.customer}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* STATUS CHANGER */}
                <StatusChanger
                  delivery={selectedDelivery}
                  onUpdate={(status) => handleStatusUpdate(selectedDelivery.id, status)}
                />
                <button onClick={() => setSelectedDelivery(null)} className="p-2 hover:bg-secondary rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Type</p>
                <p className="font-medium">{selectedDelivery.deliveryType}</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Scheduled</p>
                <p className="font-medium">{new Date(selectedDelivery.scheduledDate).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Items</p>
                <p className="font-medium">{selectedDelivery.lines.length}</p>
              </div>
              <div className="col-span-3 p-3 bg-secondary/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Delivery Address</p>
                <p className="font-medium">{selectedDelivery.address}</p>
              </div>
            </div>

            {selectedDelivery.lines.length > 0 && (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs text-muted-foreground uppercase">
                    <tr>
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-left">SKU</th>
                      <th className="px-4 py-2 text-right">Demanded</th>
                      <th className="px-4 py-2 text-right">Done</th>
                      <th className="px-4 py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDelivery.lines.map(l => (
                      <tr key={l.id} className="border-t hover:bg-secondary/20 transition-all">
                        <td className="px-4 py-2.5 font-medium">{l.productName}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{l.sku}</td>
                        <td className="px-4 py-2.5 text-right font-bold">{l.demandedQty}</td>
                        <td className="px-4 py-2.5 text-right">
                          {selectedDelivery.status === 'Done' || selectedDelivery.status === 'Canceled' ? (
                            <span className="font-black text-primary">{l.doneQty}</span>
                          ) : (
                            <input
                              type="number"
                              min={0}
                              max={l.demandedQty}
                              value={l.doneQty}
                              onChange={(e) => updateDeliveryLineDoneQty(selectedDelivery.id, l.id, parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-1 bg-secondary rounded border border-primary/20 focus:outline-none focus:ring-1 focus:ring-primary text-right font-black"
                            />
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right">₹{l.unitPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedDelivery.notes && (
              <div className="p-3 bg-secondary/30 rounded-lg text-sm">
                <span className="text-muted-foreground">Notes: </span>
                {selectedDelivery.notes}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <CreateDeliveryWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
}
