import { create } from 'zustand';
import { toast } from 'react-toastify';

export interface Customer {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Pending' | 'Blocked';
  totalOrders: number;
  spent: number;
}

interface CustomerState {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'totalOrders' | 'spent'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
}

const initialCustomers: Customer[] = [
  { id: '1', name: 'Alpha Retail', contact: 'Alice Johnson', email: 'alice@alpharetail.com', phone: '+91 98765 43210', address: 'Mumbai, Maharashtra', status: 'Active', totalOrders: 145, spent: 1250000 },
  { id: '2', name: 'Beta Electronics', contact: 'Bob Smith', email: 'bob@beta.in', phone: '+91 87654 32109', address: 'Bangalore, Karnataka', status: 'Active', totalOrders: 89, spent: 4500000 },
  { id: '3', name: 'Gamma Stores', contact: 'Charlie Brown', email: 'charlie@gamma.com', phone: '+91 76543 21098', address: 'Delhi, NCR', status: 'Pending', totalOrders: 12, spent: 85000 },
  { id: '4', name: 'Delta Markets', contact: 'Diana Prince', email: 'diana@delta.com', phone: '+91 65432 10987', address: 'Chennai, Tamil Nadu', status: 'Blocked', totalOrders: 0, spent: 0 },
];

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: JSON.parse(localStorage.getItem('core_inventory_customers') || JSON.stringify(initialCustomers)),

  addCustomer: (data) => {
    const newCustomer: Customer = { 
      ...data, 
      id: crypto.randomUUID(),
      totalOrders: 0,
      spent: 0
    };
    set((state) => {
      const updated = [...state.customers, newCustomer];
      localStorage.setItem('core_inventory_customers', JSON.stringify(updated));
      return { customers: updated };
    });
    toast.success(`${data.name} added as customer`);
  },

  updateCustomer: (id, updates) => {
    set((state) => {
      const updated = state.customers.map(c => c.id === id ? { ...c, ...updates } : c);
      localStorage.setItem('core_inventory_customers', JSON.stringify(updated));
      return { customers: updated };
    });
    toast.success('Customer updated');
  },

  deleteCustomer: (id) => {
    set((state) => {
      const updated = state.customers.filter(c => c.id !== id);
      localStorage.setItem('core_inventory_customers', JSON.stringify(updated));
      return { customers: updated };
    });
    toast.success('Customer removed');
  }
}));
