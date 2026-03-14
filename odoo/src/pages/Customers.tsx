import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Filter, User, Mail, Phone, MapPin, 
  ChevronRight, X, Save
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useCustomerStore } from '../store/customerStore';

export default function Customers() {
  const { customers, addCustomer } = useCustomerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [newCustomer, setNewCustomer] = useState({
    name: '', contact: '', email: '', phone: '', address: '', status: 'Active' as const
  });

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer(newCustomer);
    setIsAdding(false);
    setNewCustomer({ name: '', contact: '', email: '', phone: '', address: '', status: 'Active' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Customers</h1>
          <p className="text-muted-foreground mt-1 font-medium">Manage your customer relationships and order history.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-purple-500/30 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all active:scale-95 group font-black uppercase tracking-wider text-sm"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:scale-125 font-black" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <div className="p-6 rounded-[2rem] border glass bg-card premium-shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 group">
            <Filter className="h-4 w-4 transition-transform group-hover:rotate-12 text-white" />
            <span className="text-sm font-bold">Filter</span>
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((customer, idx) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                className="group p-5 rounded-2xl border-glow bg-card transition-all cursor-pointer relative overflow-hidden text-foreground"
              >
              {/* Decorative background glow */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/10 transition-colors" />
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {customer.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold truncate text-lg group-hover:text-primary transition-colors">{customer.name}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      customer.status === 'Active' ? "bg-success/10 text-success border-success/20" :
                      customer.status === 'Pending' ? "bg-warning/10 text-warning border-warning/20" :
                      "bg-destructive/10 text-destructive border-destructive/20"
                    )}>
                      {customer.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-3">
                    <User className="w-3.5 h-3.5" /> {customer.contact}
                  </p>

                  <div className="grid grid-cols-2 gap-y-2 mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
                      <Phone className="w-3 h-3" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 outline-none" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-primary justify-end">
                      ₹{(customer.spent / 100000).toFixed(1)}L spent
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
             <div className="col-span-2 py-16 text-center text-muted-foreground bg-secondary/20 rounded-2xl border-2 border-dashed">
                <p className="font-medium">No customers found</p>
                <p className="text-xs mt-1">Try a different search term</p>
             </div>
          )}
        </div>
      </div>      {/* Add Customer Modal */}
      <AnimatePresence>
        {isAdding && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="fixed inset-0 backdrop-premium z-50 pointer-events-auto"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-[60] pointer-events-none"
            >
              <div className="w-full max-w-lg modal-surface rounded-2xl overflow-hidden pointer-events-auto">
                <div className="p-6 border-b flex justify-between items-center bg-secondary/30">
                  <div>
                    <h2 className="text-xl font-bold">New Relationship</h2>
                    <p className="text-xs text-muted-foreground">Onboard a new customer to your database.</p>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name / Business Title</label>
                    <input 
                      required type="text"
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      placeholder="e.g. Acme Corp Inc."
                      value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Primary Contact Email</label>
                      <input 
                        required type="email"
                        className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="contact@email.com"
                        value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Business Phone</label>
                      <input 
                        required type="tel"
                        className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                        placeholder="+91 98765 43210"
                        value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Shipping & Billing Address</label>
                    <textarea 
                      required rows={3}
                      placeholder="123 Storage Lane, Industrial Area..."
                      className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                      value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsAdding(false)} 
                      className="flex-1 px-4 py-2.5 border border-border rounded-xl font-bold hover:bg-secondary transition-all">
                      Cancel
                    </button>
                    <button type="submit" 
                      className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-black shadow-lg shadow-violet-500/20 hover:bg-violet-700 transition-all flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> Save Customer
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
