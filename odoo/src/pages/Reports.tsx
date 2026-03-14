import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart as BarChartIcon, TrendingUp, Download, PieChart, Activity
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend
} from 'recharts';

const salesData = [
  { name: 'Jan', revenue: 4000, cost: 2400, profit: 1600 },
  { name: 'Feb', revenue: 3000, cost: 1398, profit: 1602 },
  { name: 'Mar', revenue: 2000, cost: 9800, profit: -7800 }, // Huge cost anomaly mock
  { name: 'Apr', revenue: 2780, cost: 3908, profit: -1128 },
  { name: 'May', revenue: 1890, cost: 4800, profit: -2910 },
  { name: 'Jun', revenue: 2390, cost: 3800, profit: -1410 },
  { name: 'Jul', revenue: 3490, cost: 4300, profit: -810 },
];

const supplierPerf = [
  { name: 'Techtronics', deliveryTime: 4.5, quality: 9.8, fulfillment: 95 },
  { name: 'Global Hub', deliveryTime: 2.1, quality: 8.5, fulfillment: 98 },
  { name: 'Apparel Corp', deliveryTime: 7.2, quality: 7.9, fulfillment: 85 },
  { name: 'Food Ltd', deliveryTime: 1.5, quality: 9.9, fulfillment: 99 },
];

export default function Reports() {
  const [activeReport, setActiveReport] = useState('inventory-value');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Data Intelligence</h1>
          <p className="text-muted-foreground mt-1 font-medium">Deep dive into your inventory data and AI forecasts.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-purple-500/30 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all active:scale-95 group font-black uppercase tracking-wider text-sm cursor-pointer">
            <Download className="h-4 w-4 text-white" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { id: 'inventory-value', icon: PieChart, title: 'Stock Value' },
          { id: 'movement', icon: Activity, title: 'Movement Analysis' },
          { id: 'supplier', icon: BarChartIcon, title: 'Supplier Perf.' },
          { id: 'forecasting', icon: TrendingUp, title: 'AI Forecasting' }
        ].map(r => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`flex items-center gap-3 p-4 rounded-[1.5rem] border transition-all duration-300 ${
              activeReport === r.id ? 'bg-primary text-white border-transparent shadow-lg shadow-primary/30 premium-shadow scale-105' : 'bg-card text-muted-foreground hover:bg-secondary border-border premium-shadow'
            }`}
          >
            <r.icon className={cn("w-5 h-5", activeReport === r.id ? "text-white" : "text-primary")} />
            <span className="font-black text-[10px] uppercase tracking-widest">{r.title}</span>
          </button>
        ))}
      </div>

      <motion.div 
        key={activeReport}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="p-8 rounded-[2rem] border glass premium-shadow bg-card"
      >
        {activeReport === 'inventory-value' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Total Stock Value</h3>
                <p className="text-sm text-muted-foreground">Monetary value over time vs costs</p>
              </div>
              <div className="px-4 py-2 bg-success/10 text-success rounded-lg font-bold border border-success/20">
                ₹1.24 Cr Net Worth
              </div>
            </div>
            
            <div className="h-[400px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.6}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.6}} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend verticalAlign="top" height={36}/>
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="cost" stroke="#f43f5e" fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeReport === 'supplier' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Supplier Delivery Performance</h3>
                <p className="text-sm text-muted-foreground">Average delivery time vs quality score</p>
              </div>
            </div>
            
            <div className="h-[400px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supplierPerf} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.6}} />
                  <YAxis yAxisId="left" orientation="left" stroke="#6366f1" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="deliveryTime" name="Delivery Time (Days)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="quality" name="Quality Score (1-10)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Mock other tabs for UI demo purposes simply showing placeholders */}
        {(activeReport === 'movement' || activeReport === 'forecasting') && (
           <div className="h-[400px] w-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl border-border/50">
             <TrendingUp className="w-16 h-16 mb-4 opacity-50 text-primary" />
             <h3 className="text-xl font-bold mb-2">Generating Deep Insights...</h3>
             <p className="text-sm max-w-[300px] text-center">In production, this area connects to the PyTorch AI Forecasting APIs to generate predictions.</p>
           </div>
        )}
      </motion.div>
    </div>
  );
}
