import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, ArrowUpDown, ArrowUpRight, ArrowDownRight, RefreshCcw, Hand, FileDown, Printer, History as HistoryIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import { useProductStore } from '../store/productStore';

export default function History() {
  const { moveHistory, products } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');

  const combinedHistory = useMemo(() => {
    // Convert moveHistory to history format
    const realHistory = moveHistory.map(m => ({
      id: m.id,
      date: m.date,
      user: 'OP', // Operator
      type: 'Transfer',
      ref: `TRF-${m.id.slice(0, 4).toUpperCase()}`,
      product: m.productName,
      sku: m.sku,
      qty: m.qty,
      from: m.from,
      to: m.to,
      balance: products.find(p => p.sku === m.sku && p.location === m.to)?.stock || 0
    }));

    const mockHistory = [
      { id: 'm1', date: '2024-03-10T10:30:00Z', user: 'JD', type: 'Receipt', ref: 'REC-2024-001', product: 'Wireless Headphones', sku: 'EL-001', qty: 50, balance: 150, from: 'Techtronics (Vendor)', to: 'Zone A' },
      { id: 'm2', date: '2024-03-09T14:15:00Z', user: 'SM', type: 'Delivery', ref: 'DEL-2024-001', product: 'Smart Watch', sku: 'EL-002', qty: -5, balance: 15, from: 'Zone A', to: 'Customer #1902' },
    ];

    return [...realHistory, ...mockHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [moveHistory, products]);

  const filteredHistory = combinedHistory.filter(h => 
    h.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Receipt': return <ArrowDownRight className="w-4 h-4 text-success" />;
      case 'Delivery': return <ArrowUpRight className="w-4 h-4 text-primary" />;
      case 'Transfer': return <RefreshCcw className="w-4 h-4 text-warning" />;
      case 'Adjustment': return <Hand className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const getQtyColor = (qty: number) => {
    if (qty > 0) return 'text-success';
    if (qty < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Stock Ledger Details", 14, 15);
      
      const tableData = filteredHistory.map(row => [
        new Date(row.date).toLocaleDateString(),
        row.type,
        row.ref,
        row.product,
        row.qty > 0 ? `+${row.qty}` : row.qty,
        row.balance
      ]);

      autoTable(doc, {
        head: [['Date', 'Type', 'Reference', 'Product', 'Quantity', 'Balance']],
        body: tableData,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [99, 102, 241] }
      });

      doc.save(`Stock_Ledger_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF Downloaded");
    } catch (e) {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Stock Ledger</h1>
          <p className="text-muted-foreground mt-1 font-medium">Detailed history of all inventory movements.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 font-black uppercase tracking-wider text-sm">
            <Filter className="h-4 w-4 text-white" />
            <span>Filter</span>
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-[1.5rem] shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 font-black uppercase tracking-wider text-sm cursor-pointer">
             <Printer className="h-4 w-4 text-white" />
             <span>Print PDF</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-700 text-white rounded-[1.5rem] shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 font-black uppercase tracking-wider text-sm cursor-pointer">
            <FileDown className="h-4 w-4 text-white" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="p-6 rounded-[2.5rem] border-glow glass premium-shadow bg-card overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by product, SKU, document ref..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary/50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-muted-foreground uppercase tracking-widest bg-secondary/30">
              <tr>
                <th className="px-6 py-4 rounded-tl-[1.5rem]"><div className="flex items-center cursor-pointer hover:text-foreground">Date <ArrowUpDown className="ml-1 h-3 w-3" /></div></th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4"><div className="flex items-center cursor-pointer hover:text-foreground">Type <ArrowUpDown className="ml-1 h-3 w-3" /></div></th>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">From / To</th>
                <th className="px-6 py-4 text-right"><div className="flex items-center justify-end cursor-pointer hover:text-foreground">Qty <ArrowUpDown className="ml-1 h-3 w-3" /></div></th>
                <th className="px-6 py-4 text-right rounded-tr-[1.5rem]">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((row, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={row.id} 
                    className="hover:bg-primary/5 transition-colors group"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold">{new Date(row.date).toLocaleDateString()}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[10px] border border-primary/20">
                        {row.user}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(row.type)}
                        <span className="font-bold text-xs">{row.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 rounded-lg border bg-secondary/50 text-[10px] font-mono font-bold">
                        {row.ref}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-black group-hover:text-primary transition-colors">{row.product}</span>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{row.sku}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col text-[10px] space-y-1">
                        <div className="flex items-center gap-1.5 opacity-70">
                          <span className="w-8 text-muted-foreground uppercase">From:</span>
                          <span className="font-bold truncate">{row.from}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-8 text-muted-foreground uppercase">To:</span>
                          <span className="font-black truncate text-primary uppercase">{row.to}</span>
                        </div>
                      </div>
                    </td>
                    <td className={cn("px-6 py-5 text-right font-black text-sm", getQtyColor(row.qty))}>
                      {row.qty > 0 ? `+${row.qty}` : row.qty === 0 ? '-' : row.qty}
                    </td>
                    <td className="px-6 py-5 text-right font-black text-sm">
                      {row.balance}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                   <td colSpan={8} className="px-6 py-16 text-center text-muted-foreground opacity-40">
                      <HistoryIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="font-bold">No history records found</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
