import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRightLeft, History as HistoryIcon, TrendingUp, 
  Package, Box, AlertCircle, ChevronRight, Search, RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useProductStore } from '../store/productStore';
import InternalTransferModal from '../components/InternalTransferModal';
import StockAdjustmentModal from '../components/StockAdjustmentModal';

export default function Operations() {
  const { moveHistory } = useProductStore();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    { label: 'Today\'s Transfers', value: moveHistory.filter(m => new Date(m.date).toDateString() === new Date().toDateString()).length, icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Active Items', value: '24', icon: Box, color: 'text-blue-500' }, // Mock
    { label: 'Low Space Zones', value: '1', icon: AlertCircle, color: 'text-rose-500' }, // Mock
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Operations Center</h1>
          <p className="text-muted-foreground mt-1 font-medium">Coordinate logistics and internal stock movements.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAdjustmentModal(true)}
            className="flex items-center gap-3 px-8 py-4 bg-slate-800 text-white rounded-[2rem] shadow-2xl hover:bg-slate-900 hover:-translate-y-1 transition-all active:scale-95 font-black uppercase tracking-widest text-sm"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Stock Adjustment</span>
          </button>
          <button 
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[2rem] shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 font-black uppercase tracking-widest text-sm"
          >
            <ArrowRightLeft className="w-5 h-5" />
            <span>Internal Transfer</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-[2rem] border glass bg-card premium-shadow group hover:border-primary/50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <stat.icon className={cn("w-6 h-6 transition-transform group-hover:scale-125", stat.color)} />
            </div>
            <p className="text-4xl font-black">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Recent Movements */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2">
              <HistoryIcon className="w-5 h-5 text-primary" />
              Recent Movements
            </h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search history..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary/50 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="rounded-[2.5rem] border glass bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-muted-foreground uppercase tracking-widest bg-secondary/50">
                  <tr>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Path</th>
                    <th className="px-6 py-4 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {moveHistory.length > 0 ? (
                    moveHistory.filter(m => m.productName.toLowerCase().includes(searchTerm.toLowerCase())).map((move, idx) => (
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        key={move.id} 
                        className="hover:bg-primary/5 transition-colors group"
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs">{new Date(move.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(move.date).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="font-black text-sm group-hover:text-primary transition-colors">{move.productName}</span>
                            <span className="text-[10px] font-mono text-muted-foreground uppercase">{move.sku}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-muted-foreground">{move.from}</span>
                            <div className="flex items-center gap-1">
                               <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                               <div className="w-4 h-0.5 bg-gradient-to-r from-primary/40 to-primary" />
                               <ChevronRight className="w-3 h-3 text-primary -ml-1" />
                            </div>
                            <span className="text-xs font-black text-primary">{move.to}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right font-black text-primary">{move.qty}</td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground opacity-50">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="font-bold">No movements recorded yet</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Stats & Actions */}
        <div className="space-y-6">
          <div className="p-8 rounded-[2.5rem] border glass bg-gradient-to-br from-indigo-600/10 to-purple-600/10 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl transition-all group-hover:scale-150" />
            <h3 className="text-xl font-black mb-4">Stock Insights</h3>
            <div className="space-y-4 relative z-10">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-muted-foreground font-bold">Total Transfers</span>
                 <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{moveHistory.length}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-muted-foreground font-bold">Avg. Qty / Move</span>
                 <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                   {moveHistory.length > 0 ? Math.round(moveHistory.reduce((sum, m) => sum + m.qty, 0) / moveHistory.length) : 0}
                 </span>
               </div>
            </div>
            <button className="w-full mt-6 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all shadow-xl">
              Download Ops Report
            </button>
          </div>

          <div className="p-6 rounded-[2.5rem] border glass bg-card">
            <h3 className="font-black text-sm uppercase tracking-widest mb-4">Zone Utilization</h3>
            <div className="space-y-4">
               {/* Simplified utilization mock */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>Zone A (Dry Goods)</span>
                    <span className="text-primary">82%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[82%]" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>Cold Storage (Perishable)</span>
                    <span className="text-warning">94%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-warning w-[94%]" />
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      <InternalTransferModal 
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
      />

      <StockAdjustmentModal 
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
      />
    </div>
  );
}
