import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  ArrowUpRight, Package, AlertTriangle,
  ShoppingCart, Truck, SlidersHorizontal,
  CheckCircle2, FileText, Users, ClipboardList,
  Box, Search, MapPin, Move, ClipboardCheck,
  PieChart, Settings, ArrowRightLeft, History, Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useProductStore } from '../store/productStore';
import { useReceiptStore } from '../store/receiptStore';
import { useAuthStore } from '../store/authStore';

const stockMovementData = [
  { name: 'Jan', received: 400, delivered: 300 },
  { name: 'Feb', received: 300, delivered: 280 },
  { name: 'Mar', received: 550, delivered: 400 },
  { name: 'Apr', received: 278, delivered: 190 },
  { name: 'May', received: 189, delivered: 220 },
  { name: 'Jun', received: 239, delivered: 180 },
  { name: 'Jul', received: 349, delivered: 290 },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const isManager = user?.role === 'manager';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
            Welcome back, <br className="sm:hidden" />
            <span className="text-gradient px-1">{user?.name}</span>!
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {isManager
              ? "Your inventory control center is online. Monitor real-time movements and operational health below."
              : "Access your daily queue and warehouse assignments directly from your personalized dashboard."}
          </p>
        </div>
        {isManager && <ManagerLiveValue />}
      </div>

      {isManager ? <ManagerDashboard /> : <StaffDashboard />}
    </div>
  );
}

function ManagerLiveValue() {
  const { products } = useProductStore();
  const totalStockValue = useMemo(() => products.reduce((sum, p) => sum + p.price * p.stock, 0), [products]);

  const formattedValue = useMemo(() => {
     if (totalStockValue >= 10000000) return `₹${(totalStockValue / 10000000).toFixed(2)} Cr`;
     if (totalStockValue >= 100000) return `₹${(totalStockValue / 100000).toFixed(2)} L`;
     return `₹${totalStockValue.toLocaleString()}`;
  }, [totalStockValue]);

  return (
    <div className="flex items-center gap-4 px-6 py-4 rounded-[2rem] border-fixed bg-card text-foreground premium-shadow hover:scale-105 transition-all duration-500 cursor-default">
      <div className="relative">
        <div className="p-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
           <Package className="w-6 h-6" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-success border-4 border-card rounded-full animate-pulse" />
      </div>
      <div>
        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] mb-1">Total System Value</p>
        <p className="text-3xl font-black text-primary tracking-tighter">{formattedValue}</p>
      </div>
    </div>
  );
}

function ManagerDashboard() {
  const navigate = useNavigate();
  const { products } = useProductStore();
  const { receipts, deliveries } = useReceiptStore();

  const stats = {
    lowStock: products.filter(p => p.status === 'Low Stock').length,
    pendingReceipts: receipts.filter(r => r.status === 'Waiting').length,
    pendingDeliveries: deliveries.filter(d => d.status === 'Draft' || d.status === 'Packing').length,
    performance: 94
  };

  const kpis = [
    { title: 'Low Stock Alerts', value: stats.lowStock, sub: 'Requires attention', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', to: '/products' },
    { title: 'Pending Receipts', value: stats.pendingReceipts, sub: 'To be approved', icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10', to: '/receipts' },
    { title: 'Pending Deliveries', value: stats.pendingDeliveries, sub: 'In pipeline', icon: Truck, color: 'text-success', bg: 'bg-success/10', to: '/deliveries' },
    { title: 'Staff Performance', value: `${stats.performance}%`, sub: 'Above average', icon: Users, color: 'text-accent', bg: 'bg-accent/10', to: '#' },
  ];

  const managerTasks = [
    { label: 'Approve Receipts (>₹50,000)', icon: CheckCircle2, completed: false },
    { label: 'Review Stock Adjustments', icon: SlidersHorizontal, completed: false },
    { label: 'Generate Monthly Reports', icon: FileText, completed: true },
    { label: 'Add/Edit New Products', icon: Box, completed: true },
    { label: 'Manage Global Suppliers', icon: Users, completed: false },
    { label: 'View Deep Analytics', icon: PieChart, completed: true },
    { label: 'Configure Reorder Rules', icon: Settings, completed: false },
    { label: 'System Preferences', icon: SlidersHorizontal, completed: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <motion.button
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            onClick={() => navigate(kpi.to)}
            className="p-6 rounded-[2rem] border-fixed bg-card hover:border-primary transition-all text-left group premium-shadow relative overflow-hidden active:scale-95"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <kpi.icon className="w-16 h-16 -mr-4 -mt-4" />
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-3 rounded-2xl transition-all group-hover:scale-110 shadow-lg", kpi.bg, kpi.color)}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">{kpi.title}</p>
            <h3 className="text-4xl font-black mt-2 tracking-tighter group-hover:translate-x-1 transition-transform">{kpi.value}</h3>
            <p className="text-xs text-muted-foreground mt-2 font-medium">{kpi.sub}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 rounded-2xl border glass bg-card">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Operational Tasks
          </h3>
          <div className="space-y-3">
            {managerTasks.map((task, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border-glow bg-card hover:border-primary/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", task.completed ? "bg-success/10 text-success" : "bg-primary/10 text-primary")}>
                    <task.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{task.label}</span>
                </div>
                {task.completed ? (
                  <span className="text-[10px] font-bold uppercase py-1 px-2 rounded-md bg-success/20 text-success border border-success/30">Done</span>
                ) : (
                  <button className="text-[10px] font-bold uppercase py-1 px-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-95 transition-all">Handle</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl border glass bg-card">
            <h3 className="text-lg font-bold mb-4">Stock Movement Trend</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stockMovementData}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="received" stroke="#6366f1" fillOpacity={1} fill="url(#colorRec)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-2xl border glass bg-card">
             <h3 className="text-sm font-bold flex items-center gap-2 mb-4 uppercase tracking-widest text-muted-foreground">
                <History className="w-4 h-4 text-primary" />
                Live Activity Feed
             </h3>
             <div className="space-y-4">
               {[
                 { action: 'New Inventory Added', item: 'Steel Sheet 2.0', time: '2 mins ago', icon: Plus, color: 'text-success' },
                 { action: 'Delivery Dispatched', item: 'ORD-7721', time: '15 mins ago', icon: Truck, color: 'text-primary' },
                 { action: 'Low Stock Alert', item: 'Gasket Set B', time: '1 hour ago', icon: AlertTriangle, color: 'text-warning' },
               ].map((event, i) => (
                 <div key={i} className="flex gap-3 items-start border-b border-border/50 last:border-0 pb-3 last:pb-0">
                    <div className={cn("p-1.5 rounded-lg bg-secondary", event.color)}>
                       <event.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                       <p className="text-xs font-bold">{event.action}</p>
                       <p className="text-[10px] text-muted-foreground">{event.item}</p>
                       <p className="text-[9px] text-muted-foreground/60 mt-0.5">{event.time}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StaffDashboard() {
  const staffTasks = [
    { label: 'Pending Picks', value: '15 items', icon: Package, color: 'text-primary', sub: 'Urgent shipping' },
    { label: 'Pending Packs', value: '8 orders', icon: Box, color: 'text-success', sub: 'Standard delivery' },
    { label: 'Receiving', value: 'Truck #TR-123', icon: Truck, color: 'text-warning', sub: 'Arriving soon' },
    { label: 'Transfers', value: '50 Steel Units', icon: Move, color: 'text-accent', sub: 'Move to Zone B' },
  ];

  const assignedLocations = [
    { name: 'Zone A (Raw Materials)', detail: 'Full monitoring required' },
    { name: 'Rack A1 - A5', detail: 'Regular counting scheduled' },
  ];

  const capabilities = [
    { label: 'Pick items for delivery', icon: Package },
    { label: 'Pack orders', icon: Box },
    { label: 'Receive incoming goods', icon: ShoppingCart },
    { label: 'Move items between locations', icon: ArrowRightLeft },
    { label: 'Perform physical count', icon: ClipboardCheck },
    { label: 'Mark damaged items', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {staffTasks.map((task, idx) => (
          <motion.div
            key={task.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-5 rounded-2xl border-glow bg-card/40 backdrop-blur-md hover:border-primary/40 hover:bg-card/60 hover:shadow-lg transition-all group"
          >
             <div className={cn("p-2 rounded-lg w-fit mb-3 bg-secondary transition-all group-hover:scale-110", task.color)}>
               <task.icon className="w-5 h-5" />
             </div>
             <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">{task.label}</p>
             <h3 className="text-xl font-bold mt-1 group-hover:text-primary transition-colors">{task.value}</h3>
             <p className="text-[10px] text-muted-foreground mt-1 italic">{task.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
           <div className="p-6 rounded-2xl border glass bg-card">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <History className="w-5 h-5 text-success" />
                Recent Work Log
              </h3>
              <div className="space-y-4">
                {[
                  { log: 'Picked 50 Steel Units for ORD-991', time: '10:45 AM', type: 'Pick' },
                  { log: 'Marked Section B-12 as Overfilled', time: '09:30 AM', type: 'System' },
                  { log: 'Unloaded Truck #TR-882 at Dock 1', time: '08:15 AM', type: 'Reception' },
                ].map((log, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-border/50 hover:bg-secondary/30 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">{log.type}</span>
                      <span className="text-[10px] text-muted-foreground/50">{log.time}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{log.log}</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="p-6 rounded-2xl border glass bg-card">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                My Assigned Locations
              </h3>
              <div className="space-y-3">
                {assignedLocations.map((loc, i) => (
                  <div key={i} className="p-4 rounded-xl border bg-secondary/20 border-primary/10">
                    <p className="font-bold text-sm">{loc.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{loc.detail}</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="p-6 rounded-2xl border border-success/20 bg-success/5">
              <h3 className="text-sm font-bold text-success uppercase tracking-widest mb-4">Authorized Actions</h3>
              <div className="grid grid-cols-1 gap-2 text-foreground">
                {capabilities.map((cap, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-medium p-2 rounded-lg hover:bg-success/10 hover:border-success/20 border border-transparent transition-all group">
                    <cap.icon className="w-4 h-4 text-success transition-transform group-hover:scale-125" />
                    {cap.label}
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="p-6 rounded-2xl border glass bg-card h-full">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                 <ClipboardCheck className="w-5 h-5 text-primary" />
                 Special Physical Count
              </h3>
              <div className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed rounded-2xl opacity-50">
                 <Search className="w-12 h-12 mb-2 text-muted-foreground" />
                 <p className="text-sm font-medium text-muted-foreground">Raw Materials counting scheduled today</p>
                 <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold uppercase tracking-widest">Start Scanning</button>
              </div>
              
              <div className="mt-8 p-6 rounded-2xl border border-destructive/20 bg-destructive/5">
                <h4 className="text-xs font-bold text-destructive uppercase tracking-widest mb-3">Restricted Actions</h4>
                <div className="space-y-2">
                  {['Delete products', 'Change supplier details', 'Access financial reports', 'Modify user roles', 'Change system settings'].map((text) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-destructive" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
