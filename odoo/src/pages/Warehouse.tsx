import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Building, Layers, LayoutGrid, AlertTriangle, ArrowRightLeft, Truck, Package, PackageCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { useProductStore, WAREHOUSE_ZONES } from '../store/productStore';
import InternalTransferModal from '../components/InternalTransferModal';

// Zones are now imported from productStore

export default function Warehouse() {
  const { products } = useProductStore();
  const [activeTab, setActiveTab] = useState('zones');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Group products by location and calculate usage
  const zoneStats = useMemo(() => {
    return WAREHOUSE_ZONES.map(zone => {
      const zoneProducts = products.filter(p => p.location === zone.id);
      const usedTotal = zoneProducts.reduce((sum, p) => sum + p.stock, 0);
      const usedPercent = Math.min(100, Math.round((usedTotal / zone.capacity) * 100));
      const status = usedPercent > 90 ? 'critical' : usedPercent > 70 ? 'warning' : 'normal';
      
      return {
        ...zone,
        usedTotal,
        usedPercent,
        status,
        productCount: zoneProducts.length,
        products: zoneProducts
      };
    });
  }, [products]);

  const overallCapacity = useMemo(() => {
    const totalUsed = zoneStats.reduce((sum, z) => sum + z.usedTotal, 0);
    const totalCapacity = zoneStats.reduce((sum, z) => sum + z.capacity, 0);
    return Math.round((totalUsed / totalCapacity) * 100);
  }, [zoneStats]);

  const unallocatedProducts = useMemo(() => {
    const zoneIds = WAREHOUSE_ZONES.map(z => z.id);
    return products.filter(p => p.stock > 0 && (!p.location || !zoneIds.includes(p.location)));
  }, [products]);

  const capacityTrend = [
    { name: 'Mon', capacity: 65 },
    { name: 'Tue', capacity: 68 },
    { name: 'Wed', capacity: 72 },
    { name: 'Thu', capacity: 75 },
    { name: 'Fri', capacity: 78 },
    { name: 'Sat', capacity: 74 },
    { name: 'Sun', capacity: overallCapacity }, // Current day reflects actual
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Warehouse Hub</h1>
          <p className="text-muted-foreground mt-1 font-medium">Real-time physical stock tracking across zones.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 font-black uppercase tracking-wider text-sm"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>Internal Transfer</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* KPI Cards */}
        <motion.div 
          className="p-6 rounded-[2rem] border-fixed flex flex-col justify-center bg-card transition-all group premium-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-muted-foreground group-hover:text-primary transition-colors">Overall Capacity</h3>
            <Building className="h-5 w-5 text-primary transition-transform group-hover:scale-125" />
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold">{overallCapacity}%</span>
            <span className="text-muted-foreground mb-1">used</span>
          </div>
          <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${overallCapacity}%` }}
              className={cn(
                "h-full rounded-full transition-all relative overflow-hidden",
                overallCapacity > 90 ? "bg-destructive" : overallCapacity > 70 ? "bg-warning" : "bg-primary"
              )} 
            >
              <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
            </motion.div>
          </div>
        </motion.div>

        <div className="md:col-span-2 p-6 rounded-xl border-glow glass bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Storage Capacity Trend</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Occupancy %</span>
            </div>
          </div>
          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capacityTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'currentColor', fontSize: 12}} dy={10} />
                <Tooltip 
                  cursor={{fill: 'hsl(var(--secondary))'}}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="capacity" radius={[4, 4, 0, 0]}>
                  {capacityTrend.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#6366f1' : '#6366f160'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-xl border-glow glass overflow-hidden bg-card">
          <div className="flex gap-1 p-1 bg-secondary/30 backdrop-blur-md rounded-xl border w-fit">
            {[
              { id: 'zones', label: 'Zone Real-time Tracking', icon: Layers, color: 'text-blue-500 bg-blue-500/10' },
              { id: 'map', label: 'Interactive Warehouse Map', icon: LayoutGrid, color: 'text-indigo-500 bg-indigo-500/10' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedZoneId(null); }}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 relative overflow-hidden group",
                  activeTab === tab.id 
                    ? "bg-primary text-white shadow-xl shadow-primary/20 ring-1 ring-primary/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-md transition-all",
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-primary/5 text-primary group-hover:scale-110"
                )}>
                  <tab.icon className="w-4 h-4" />
                </div>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="tabActive" className="absolute inset-0 bg-white/10" />
                )}
              </button>
            ))}
          </div>

        <div className="p-6">
          {activeTab === 'zones' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-success" />
                  <h3 className="font-medium text-lg">Dynamic Storage Zones</h3>
                </div>
                <div className="text-sm text-muted-foreground">
                  Updated: <span className="font-mono">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-foreground">
                {zoneStats.map((zone, idx) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group shadow-lg",
                      zone.status === 'critical' ? "border-destructive/50 bg-destructive/5 hover:bg-destructive/10" :
                      zone.status === 'warning' ? "border-warning bg-warning/5 hover:bg-warning/10" : 
                      "bg-card hover:border-primary/50 border-border/50"
                    )}
                  >
                    {zone.status === 'critical' && (
                      <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none overflow-hidden">
                        <div className="bg-destructive text-white text-[10px] font-bold py-1 px-8 translate-x-6 translate-y-2 rotate-45 w-full text-center shadow-md">
                          FULL
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className={cn("font-bold flex items-center gap-2", zone.status === 'critical' ? "text-destructive" : "")}>
                          {zone.name}
                          {zone.status === 'critical' && <AlertTriangle className="w-4 h-4 text-destructive" />}
                        </h4>
                        <p className="text-xs text-muted-foreground">{zone.productCount} unique products</p>
                      </div>
                      <div className={cn(
                        "p-2 rounded-lg",
                        zone.status === 'critical' ? "bg-destructive/20" : zone.status === 'warning' ? "bg-warning/20" : "bg-primary/10"
                      )}>
                        <Package className={cn(
                          "w-5 h-5",
                          zone.status === 'critical' ? "text-destructive" : zone.status === 'warning' ? "text-warning" : "text-primary"
                        )} />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-bold">
                          <span className="text-muted-foreground">Live Occupancy</span>
                          <span className={cn(zone.status === 'critical' ? "text-destructive" : "")}>{zone.usedPercent}%</span>
                        </div>
                        <div className="h-5 w-full bg-secondary/50 dark:bg-black/40 rounded-full overflow-hidden shadow-inner border border-border/50">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${zone.usedPercent}%` }}
                            className={cn(
                              "h-full rounded-full transition-all duration-1000 relative shadow-[0_0_15px_rgba(0,0,0,0.1)]",
                              zone.status === 'critical' ? 'bg-destructive' : 
                              zone.status === 'warning' ? 'bg-warning' : 
                              'bg-primary'
                            )} 
                          >
                             {zone.status === 'critical' && <div className="absolute inset-0 bg-white/40 animate-pulse transition-opacity" />}
                          </motion.div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-border/10">
                        <div className="flex -space-x-2">
                          {zone.products.slice(0, 3).map((p) => (
                              <div key={p.id} className="w-7 h-7 rounded-full border-2 border-card bg-secondary/80 flex items-center justify-center text-[10px] font-black text-primary overflow-hidden shadow-sm">
                                 {p.name.charAt(0)}
                              </div>
                          ))}
                          {zone.productCount > 3 && (
                              <div className="w-7 h-7 rounded-full border-2 border-card bg-primary text-white flex items-center justify-center text-[9px] font-black shadow-sm">
                                +{zone.productCount - 3}
                              </div>
                          )}
                        </div>
                        <p className={cn("text-xs font-mono font-bold", zone.status === 'critical' ? "text-destructive" : "text-primary")}>
                          {zone.usedTotal} / {zone.capacity} units
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {unallocatedProducts.length > 0 && (
                <div className="mt-8 p-6 rounded-2xl border border-warning/50 bg-warning/5 animate-pulse">
                  <div className="flex items-center gap-2 mb-4 text-warning-dark">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-bold">Operational Dock (Unallocated Stock)</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    The following items are in stock but have not been assigned to a storage zone.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {unallocatedProducts.map(p => (
                      <div key={p.id} className="p-3 rounded-xl border bg-card flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.sku}</p>
                        </div>
                        <span className="font-black text-primary">Qty: {p.stock}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
              <div className="lg:col-span-3 bg-secondary/20 rounded-xl border p-4 relative h-[500px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 pattern-grid-lg opacity-10 pointer-events-none" />
                
                <div className="grid grid-cols-5 grid-rows-4 gap-4 w-full max-w-4xl h-full p-4 md:p-8">
                  <div 
                    onClick={() => setSelectedZoneId('Raw Materials')}
                    className={cn(
                      "col-start-1 row-start-1 row-span-4 border-2 rounded-xl flex flex-col items-center justify-center font-black shadow-lg transition-all cursor-pointer group",
                      selectedZoneId === 'Raw Materials' 
                        ? "bg-primary border-primary text-primary-foreground scale-[1.05] z-10" 
                        : "bg-card border-border hover:bg-primary/10 hover:border-primary"
                    )}
                  >
                    <LayoutGrid className={cn("w-7 h-7 mb-2 transition-transform group-hover:scale-110", selectedZoneId === 'Raw Materials' ? "text-primary-foreground" : "text-primary")} />
                    Raw Materials
                    <div className={cn("text-xs mt-1 font-mono", selectedZoneId === 'Raw Materials' ? "text-primary-foreground/80" : "text-muted-foreground")}>
                      {zoneStats.find(z => z.id === 'Raw Materials')?.usedPercent}%
                    </div>
                  </div>
                  
                  {/* Zones */}
                  {['Zone A', 'Zone B', 'Zone C'].map((zone, i) => {
                    const stats = zoneStats.find(z => z.id === zone);
                    const isSelected = selectedZoneId === zone;
                    return (
                      <div 
                        key={zone}
                        onClick={() => setSelectedZoneId(zone)}
                        style={{ gridRowStart: i + 1 }}
                        className={cn(
                          "col-start-2 col-span-3 border-2 shadow-sm rounded-xl flex flex-col items-center justify-center font-bold transition-all cursor-pointer group relative",
                          isSelected ? "bg-primary border-primary text-primary-foreground shadow-lg scale-[1.02] z-10" : 
                          stats?.status === 'critical' ? "bg-destructive/20 border-destructive shadow-[0_0_15px_rgba(239,68,68,0.2)] text-destructive" :
                          stats?.status === 'warning' ? "bg-warning/20 border-warning text-warning-dark" : "bg-card border-border hover:border-primary/50"
                        )}
                      >
                        <span className="flex items-center text-sm">
                          {stats?.status === 'critical' && !isSelected && <AlertTriangle className="w-3 h-3 mr-2 animate-pulse" />}
                          {zone}
                        </span>
                        <div className={cn("w-3/4 h-2 mt-2 rounded-full overflow-hidden", isSelected ? "bg-white/30" : "bg-secondary/40")}>
                           <div 
                            className={cn("h-full transition-all duration-700", 
                              isSelected ? "bg-white shadow-[0_0_12px_rgba(255,255,255,1)]" : 
                              stats?.status === 'critical' ? "bg-destructive" : 
                              stats?.status === 'warning' ? "bg-warning" : "bg-success"
                            )} 
                            style={{ width: `${stats?.usedPercent}%` }} 
                           />
                        </div>
                      </div>
                    );
                  })}

                  {/* Extra Storage */}
                  <div 
                    onClick={() => setSelectedZoneId('Extra Storage')}
                    className={cn(
                      "col-start-5 row-start-1 row-span-4 border-2 rounded-xl flex flex-col items-center justify-center font-black shadow-lg transition-all cursor-pointer group",
                      selectedZoneId === 'Extra Storage' 
                        ? "bg-purple-600 border-purple-600 text-white scale-[1.05] z-10" 
                        : zoneStats.find(z => z.id === 'Extra Storage')?.status === 'critical' ? "bg-destructive/20 border-destructive text-destructive" : "bg-card border-border hover:bg-purple-500/10 hover:border-purple-500"
                    )}
                  >
                    <Truck className={cn("w-7 h-7 mb-2 transition-transform group-hover:scale-110", selectedZoneId === 'Extra Storage' ? "text-white" : "text-purple-500")} />
                    Extra Storage
                    <div className={cn("text-xs mt-1 font-mono", selectedZoneId === 'Extra Storage' ? "text-white/80" : "text-muted-foreground")}>
                      {zoneStats.find(z => z.id === 'Extra Storage')?.usedPercent}%
                    </div>
                  </div>

                  {/* Cold Storage */}
                  <div 
                    onClick={() => setSelectedZoneId('Cold Storage')}
                    className={cn(
                      "col-start-2 col-span-3 row-start-4 border-2 shadow-sm rounded-xl flex flex-col items-center justify-center font-bold transition-all cursor-pointer group",
                      selectedZoneId === 'Cold Storage' ? "bg-cyan-600 border-cyan-600 text-white shadow-lg scale-[1.02] z-10" : 
                      zoneStats.find(z => z.id === 'Cold Storage')?.status === 'critical' ? "bg-destructive/20 border-destructive text-destructive" : "bg-card border-border hover:border-cyan-500/20"
                    )}
                  >
                    <span className="flex items-center text-xs">
                       Cold Storage (Food)
                    </span>
                    <div className={cn("w-3/4 h-1.5 mt-2 rounded-full overflow-hidden", selectedZoneId === 'Cold Storage' ? "bg-white/20" : "bg-black/5 dark:bg-white/5")}>
                       <div 
                        className={cn("h-full transition-all duration-700", 
                          selectedZoneId === 'Cold Storage' ? "bg-white shadow-[0_0_8px_rgba(255,255,255,1)]" : 
                          zoneStats.find(z => z.id === 'Cold Storage')?.status === 'critical' ? "bg-destructive" : "bg-success"
                        )} 
                        style={{ width: `${zoneStats.find(z => z.id === 'Cold Storage')?.usedPercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone Detail Panel */}
              <div className="bg-card border rounded-xl overflow-hidden flex flex-col shadow-sm">
                <div className="p-4 border-b bg-secondary/10 flex items-center justify-between">
                   <h3 className="font-bold text-sm">Zone Inventory</h3>
                   {selectedZoneId && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{selectedZoneId}</span>}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
                   {selectedZoneId ? (
                      zoneStats.find(z => z.id === selectedZoneId)?.products.length ? (
                        zoneStats.find(z => z.id === selectedZoneId)?.products.map(p => (
                          <div key={p.id} className="p-3 rounded-lg border bg-secondary/5 h-fit text-foreground group hover:border-primary/30 transition-all">
                             <div className="flex justify-between items-start mb-1 gap-2">
                                <span className="text-xs font-bold truncate">{p.name}</span>
                                <span className="text-[10px] text-muted-foreground font-mono shrink-0">{p.sku}</span>
                             </div>
                             <div className="flex justify-between items-center text-[10px]">
                                <span className="text-muted-foreground">{p.category}</span>
                                <span className="font-bold text-primary">Qty: {p.stock}</span>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-8">
                           <LayoutGrid className="w-8 h-8 mb-2" />
                           <p className="text-xs font-medium">No products in this zone</p>
                        </div>
                      )
                   ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-12">
                         <Layers className="w-10 h-10 mb-2" />
                         <p className="text-sm font-medium">Select a zone on the map to view inventory</p>
                      </div>
                   )}
                </div>
                <div className="p-3 border-t bg-secondary/10 text-[10px] text-muted-foreground italic">
                   Showing live tracking data for selected location.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <InternalTransferModal 
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
      />
    </div>
  );
}
