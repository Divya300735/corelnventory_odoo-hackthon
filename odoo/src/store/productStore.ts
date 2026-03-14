import { create } from 'zustand';
import Papa from 'papaparse';
import { toast } from 'react-toastify';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  maxStock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  reorderPoint?: number;
  location?: string;
  lastUpdated?: string;
  imageUrl?: string;
}

// Helper to determine status based on stock levels
const calculateStatus = (stock: number, maxStock: number): 'In Stock' | 'Low Stock' | 'Out of Stock' => {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= maxStock * 0.2) return 'Low Stock'; // 20% or less
  return 'In Stock';
};

export const WAREHOUSE_ZONES = [
  { id: 'Raw Materials', name: 'Raw Materials', capacity: 1000, color: 'blue' },
  { id: 'Zone A', name: 'Zone A (Dry Goods)', capacity: 800, color: 'green' },
  { id: 'Zone B', name: 'Zone B (General)', capacity: 800, color: 'green' },
  { id: 'Zone C', name: 'Zone C (Bulk)', capacity: 800, color: 'green' },
  { id: 'Cold Storage', name: 'Cold Storage (Perishable)', capacity: 500, color: 'cyan' },
  { id: 'Extra Storage', name: 'Extra Storage (Overflow)', capacity: 600, color: 'purple' },
];

export interface MoveLog {
  id: string;
  date: string;
  from: string;
  to: string;
  sku: string;
  productName: string;
  qty: number;
}

interface ProductState {
  products: Product[];
  moveHistory: MoveLog[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'status'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  importProducts: (file: File) => Promise<void>;
  exportProducts: () => void;
  clearProducts: () => void;
  transferStock: (moves: { productId: string, qty: number }[], from: string, to: string) => void;
  adjustStock: (productId: string, newQty: number, reason: string, type: 'adjustment' | 'delivery' | 'receipt') => void;
}

const mockProducts: Product[] = [
  { id: '1', sku: 'EL-001', name: 'Wireless Headphones', category: 'Electronics', price: 99.99, stock: 150, maxStock: 200, status: 'In Stock', location: 'Zone A' },
  { id: '2', sku: 'EL-002', name: 'Smart Watch', category: 'Electronics', price: 199.99, stock: 15, maxStock: 100, status: 'Low Stock', location: 'Zone A' },
  { id: '3', sku: 'FU-001', name: 'Ergonomic Office Chair', category: 'Furniture', price: 299.99, stock: 0, maxStock: 50, status: 'Out of Stock', location: 'Zone B' },
  { id: '4', sku: 'AP-001', name: 'Cotton T-Shirt', category: 'Apparel', price: 19.99, stock: 500, maxStock: 1000, status: 'In Stock', location: 'Zone C' },
  { id: '5', sku: 'FO-001', name: 'Organic Coffee Beans', category: 'Food', price: 14.99, stock: 80, maxStock: 200, status: 'In Stock', location: 'Cold Storage' },
];

export const useProductStore = create<ProductState>((set, get) => ({
  products: JSON.parse(localStorage.getItem('core_inventory_products') || JSON.stringify(mockProducts)),
  moveHistory: JSON.parse(localStorage.getItem('core_inventory_moves') || '[]'),
  isLoading: false,

  addProduct: (productData) => {
    const products = get().products;
    
    let finalLocation = productData.location || '';
    
    const findAvailableZone = (stockNeeded: number) => {
      for (const zone of WAREHOUSE_ZONES) {
        const zoneUsed = products
          .filter(p => p.location === zone.id)
          .reduce((sum, p) => sum + p.stock, 0);
        
        if (zoneUsed + stockNeeded <= zone.capacity) {
          return zone.id;
        }
      }
      return null;
    };

    if (!finalLocation || finalLocation === 'Raw Materials') {
       const autoZone = findAvailableZone(productData.stock);
       if (autoZone) {
         finalLocation = autoZone;
       } else {
         toast.warning('Warning: No available zone has enough space. Adding to Raw Materials dock as fallback.');
         finalLocation = 'Raw Materials';
       }
    } else {
      const zone = WAREHOUSE_ZONES.find(z => z.id === finalLocation);
      if (zone) {
        const zoneUsed = products
          .filter(p => p.location === zone.id)
          .reduce((sum, p) => sum + p.stock, 0);
        
        if (zoneUsed + productData.stock > zone.capacity) {
           toast.error(`Error: ${finalLocation} only has ${zone.capacity - zoneUsed} units space left. Please select another zone.`);
           return;
        }
      }
    }

    const newProduct: Product = {
      ...productData,
      location: finalLocation,
      id: crypto.randomUUID(),
      status: calculateStatus(productData.stock, productData.maxStock),
      lastUpdated: new Date().toISOString()
    };
    
    set((state) => {
      const updated = [...state.products, newProduct];
      localStorage.setItem('core_inventory_products', JSON.stringify(updated));
      return { products: updated };
    });
    toast.success(`${newProduct.name} assigned to ${finalLocation}`);
  },

  updateProduct: (id, updates) => {
    set((state) => {
      const updated = state.products.map(p => {
        if (p.id === id) {
          const updatedProduct = { ...p, ...updates, lastUpdated: new Date().toISOString() };
          updatedProduct.status = calculateStatus(updatedProduct.stock, updatedProduct.maxStock);
          return updatedProduct;
        }
        return p;
      });
      localStorage.setItem('core_inventory_products', JSON.stringify(updated));
      return { products: updated };
    });
    // Removed toast here to avoid spam during bulk updates if any
  },

  deleteProduct: (id) => {
    set((state) => {
      const updated = state.products.filter(p => p.id !== id);
      localStorage.setItem('core_inventory_products', JSON.stringify(updated));
      return { products: updated };
    });
    toast.success('Product deleted');
  },

  transferStock: (moves, from, to) => {
    set((state) => {
      const updatedProducts = [...state.products];
      const newMoves: MoveLog[] = [];
      const timestamp = new Date().toISOString();

      moves.forEach(move => {
        const productIndex = updatedProducts.findIndex(p => p.id === move.productId);
        if (productIndex === -1) return;

        const product = updatedProducts[productIndex];
        
        // Log the move
        newMoves.push({
          id: crypto.randomUUID(),
          date: timestamp,
          from,
          to,
          sku: product.sku,
          productName: product.name,
          qty: move.qty
        });

        if (product.stock === move.qty) {
          // Full transfer: just change the location of this specific item entry
          updatedProducts[productIndex] = {
            ...product,
            location: to,
            lastUpdated: timestamp
          };
        } else {
          // Partial transfer:
          // 1. Decrease source stock
          updatedProducts[productIndex] = {
            ...product,
            stock: product.stock - move.qty,
            lastUpdated: timestamp,
            status: calculateStatus(product.stock - move.qty, product.maxStock)
          };

          // 2. Increase target stock or create new entry
          const targetIndex = updatedProducts.findIndex(p => p.sku === product.sku && p.location === to);
          if (targetIndex > -1) {
            const targetProd = updatedProducts[targetIndex];
            updatedProducts[targetIndex] = {
              ...targetProd,
              stock: targetProd.stock + move.qty,
              lastUpdated: timestamp,
              status: calculateStatus(targetProd.stock + move.qty, targetProd.maxStock)
            };
          } else {
            updatedProducts.push({
              ...product,
              id: crypto.randomUUID(),
              stock: move.qty,
              location: to,
              lastUpdated: timestamp,
              status: calculateStatus(move.qty, product.maxStock)
            });
          }
        }
      });

      const finalHistory = [...newMoves, ...state.moveHistory];
      localStorage.setItem('core_inventory_products', JSON.stringify(updatedProducts));
      localStorage.setItem('core_inventory_moves', JSON.stringify(finalHistory));
      
      return { products: updatedProducts, moveHistory: finalHistory };
    });
  },

  importProducts: async (file: File) => {
    set({ isLoading: true });
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const importedProducts = results.data.map((row: any) => ({
              id: crypto.randomUUID(),
              sku: row.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
              name: row.name || 'Unknown Product',
              category: row.category || 'Uncategorized',
              price: parseFloat(row.price) || 0,
              stock: parseInt(row.stock) || 0,
              maxStock: parseInt(row.maxStock) || parseInt(row.stock) * 2 || 100,
              get status() { return calculateStatus(this.stock, this.maxStock) },
              location: row.location || 'Raw Materials',
              lastUpdated: new Date().toISOString()
            })) as Product[];

            set((state) => {
              const updated = [...state.products, ...importedProducts];
              localStorage.setItem('core_inventory_products', JSON.stringify(updated));
              return { products: updated };
            });
            
            toast.success(`Successfully imported ${importedProducts.length} products`);
            resolve();
          } catch (error) {
            toast.error('Failed to parse import file format');
            reject(error);
          } finally {
            set({ isLoading: false });
          }
        },
        error: (error) => {
          toast.error(`Import failed: ${error.message}`);
          set({ isLoading: false });
          reject(error);
        }
      });
    });
  },

  exportProducts: () => {
    const products = get().products;
    const exportData = products.map(p => ({
      SKU: p.sku,
      Name: p.name,
      Category: p.category,
      Price: p.price,
      Stock: p.stock,
      MaxStock: p.maxStock,
      Status: p.status,
      Location: p.location || '',
      LastUpdated: p.lastUpdated || ''
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Inventory exported to CSV');
  },
  
  clearProducts: () => {
    set({ products: [] });
    localStorage.setItem('core_inventory_products', JSON.stringify([]));
    toast.info('All products cleared.');
  },

  adjustStock: (productId, newQty, reason, type) => {
    set((state) => {
      const timestamp = new Date().toISOString();
      let moveLog: MoveLog | null = null;
      
      const updatedProducts = state.products.map(p => {
        if (p.id === productId) {
          const diff = type === 'receipt' ? newQty : type === 'delivery' ? -newQty : newQty - p.stock;
          const finalStock = type === 'receipt' ? p.stock + newQty : type === 'delivery' ? p.stock - newQty : newQty;

          moveLog = {
            id: crypto.randomUUID(),
            date: timestamp,
            from: type === 'delivery' ? (p.location || 'Warehouse') : reason,
            to: type === 'receipt' ? (p.location || 'Warehouse') : type === 'delivery' ? 'Destination' : 'Stock Adjustment',
            sku: p.sku,
            productName: p.name,
            qty: Math.abs(diff)
          };

          return {
            ...p,
            stock: finalStock,
            lastUpdated: timestamp,
            status: calculateStatus(finalStock, p.maxStock)
          };
        }
        return p;
      });

      const finalHistory = moveLog ? [moveLog, ...state.moveHistory] : state.moveHistory;
      localStorage.setItem('core_inventory_products', JSON.stringify(updatedProducts));
      localStorage.setItem('core_inventory_moves', JSON.stringify(finalHistory));

      return { products: updatedProducts, moveHistory: finalHistory };
    });
  }
}));
