import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Filter, Building2, Mail, Phone, 
  ArrowUpRight, Globe, ShieldCheck, X, Save
} from 'lucide-react';
import { useSupplierStore } from '../store/supplierStore';

export default function Suppliers() {
  const { suppliers, addSupplier } = useSupplierStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [newSupplier, setNewSupplier] = useState({
    name: '', category: 'Electronics', contact: '', email: '', phone: '', location: '', status: 'Active' as const
  });

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier({
      ...newSupplier,
      rating: 5.0,
      performance: 100
    });
    setIsAdding(false);
    setNewSupplier({ name: '', category: 'Electronics', contact: '', email: '', phone: '', location: '', status: 'Active' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Suppliers</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage vendor relations and procurement channels.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-purple-500/30 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all active:scale-95 group font-black uppercase tracking-wider text-sm"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:scale-125 font-black" />
          <span>New Supplier</span>
        </button>
      </div>

      <div className="p-4 rounded-xl border glass bg-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-transparent border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base placeholder:text-muted-foreground/50"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 group">
            <Filter className="h-4 w-4 transition-transform group-hover:rotate-12 text-white" />
            <span className="text-sm font-bold">Filter</span>
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((supplier, idx) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              className="group p-6 rounded-2xl border bg-card hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Decorative background glow */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-colors" />
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold">{supplier.name}</h3>
                    {(supplier.status === 'Premium' || supplier.status === 'Verified') && (
                      <ShieldCheck className="w-4 h-4 text-success" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="px-2 py-0.5 rounded-md bg-secondary border">{supplier.category}</span>
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {supplier.location}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Performance</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-success" style={{ width: `${supplier.performance}%` }} />
                        </div>
                        <span className="text-xs font-bold">{supplier.performance}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Rating</p>
                      <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                        <span className="text-warning">★</span>
                        {supplier.rating} / 5.0
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border/50 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {supplier.email}</span>
                    <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {supplier.phone}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 py-12 text-center text-muted-foreground bg-secondary/20 rounded-2xl border-2 border-dashed">
              No suppliers found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Add Supplier Modal */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 pointer-events-auto"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-[60] pointer-events-none"
            >
              <div className="bg-card w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">
                <div className="p-6 border-b flex justify-between items-center bg-secondary/30">
                  <div>
                    <h2 className="text-xl font-bold">Add New Supplier</h2>
                    <p className="text-xs text-muted-foreground">Register a new vendor in your network.</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Company Name</label>
                      <input 
                        required type="text"
                        className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="e.g. NextGen Electronics"
                        value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Category</label>
                      <select 
                        className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={newSupplier.category} onChange={e => setNewSupplier({...newSupplier, category: e.target.value})}
                      >
                        <option>Electronics</option>
                        <option>Furniture</option>
                        <option>Clothing</option>
                        <option>F&B</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</label>
                      <input 
                        required type="email"
                        className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="vendor@company.com"
                        value={newSupplier.email} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Phone</label>
                      <input 
                        required type="tel"
                        className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="+91 98765 43210"
                        value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Headquarters Location</label>
                    <input 
                      required type="text" 
                      placeholder="City, Country"
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={newSupplier.location} onChange={e => setNewSupplier({...newSupplier, location: e.target.value})}
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsAdding(false)} 
                      className="flex-1 px-4 py-2.5 border border-border rounded-xl font-bold hover:bg-secondary transition-all">
                      Cancel
                    </button>
                    <button type="submit" 
                      className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> Save Supplier
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
