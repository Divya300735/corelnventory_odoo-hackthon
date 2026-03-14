import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-toastify';

export interface ReceiptLine {
  id: string;
  productName: string;
  sku: string;
  orderedQty: number;
  receivedQty: number;
  unitPrice: number;
}

export interface Receipt {
  id: string;
  docNo: string;
  supplier: string;
  supplierRef: string;
  expectedDate: string;
  receivedDate?: string;
  warehouse: string;
  notes: string;
  lines: ReceiptLine[];
  status: 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
  totalValue: number;
  createdAt: string;
  createdBy: string;
}

export interface DeliveryLine {
  id: string;
  productName: string;
  sku: string;
  demandedQty: number;
  doneQty: number;
  unitPrice: number;
}

export interface Delivery {
  id: string;
  docNo: string;
  customer: string;
  scheduledDate: string;
  warehouse: string;
  deliveredDate?: string;
  deliveryType: 'Standard' | 'Express' | 'International';
  address: string;
  notes: string;
  lines: DeliveryLine[];
  status: 'Draft' | 'Packing' | 'In Transit' | 'Done' | 'Canceled';
  createdAt: string;
  createdBy: string;
}

interface ReceiptStore {
  receipts: Receipt[];
  deliveries: Delivery[];
  addReceipt: (receipt: Omit<Receipt, 'id' | 'docNo' | 'createdAt'>) => void;
  updateReceiptStatus: (id: string, status: Receipt['status']) => void;
  addDelivery: (delivery: Omit<Delivery, 'id' | 'docNo' | 'createdAt'>) => void;
  updateDeliveryLineDoneQty: (deliveryId: string, lineId: string, doneQty: number) => void;
  updateDeliveryStatus: (id: string, status: Delivery['status']) => void;
}

const generateDocNo = (prefix: string, existing: string[]) => {
  const year = new Date().getFullYear();
  const max = existing
    .map(d => parseInt(d.split('-')[2] || '0'))
    .reduce((a, b) => Math.max(a, b), 0);
  return `${prefix}-${year}-${String(max + 1).padStart(3, '0')}`;
};

const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: '1', docNo: 'REC-2024-001', supplier: 'Techtronics Inc.', supplierRef: 'PO-1234', expectedDate: '2024-03-20', warehouse: 'Zone A',
    notes: '', status: 'Done', totalValue: 4500.00, createdAt: '2024-03-10T10:00:00Z', createdBy: 'JD',
    lines: [{ id: 'l1', productName: 'Wireless Headphones', sku: 'EL-001', orderedQty: 50, receivedQty: 50, unitPrice: 90 }]
  },
  {
    id: '2', docNo: 'REC-2024-002', supplier: 'Global Furniture Hub', supplierRef: 'PO-5678', expectedDate: '2024-03-22', warehouse: 'Zone B',
    notes: 'Handle with care', status: 'Ready', totalValue: 12500.00, createdAt: '2024-03-11T10:00:00Z', createdBy: 'SM',
    lines: [{ id: 'l2', productName: 'Ergonomic Office Chair', sku: 'FU-001', orderedQty: 50, receivedQty: 0, unitPrice: 250 }]
  },
  {
    id: '3', docNo: 'REC-2024-003', supplier: 'Apparel Corp', supplierRef: '', expectedDate: '2024-03-25', warehouse: 'Zone C',
    notes: '', status: 'Waiting', totalValue: 2500.00, createdAt: '2024-03-12T10:00:00Z', createdBy: 'JD',
    lines: [{ id: 'l3', productName: 'Cotton T-Shirt', sku: 'AP-001', orderedQty: 500, receivedQty: 0, unitPrice: 5 }]
  },
  {
    id: '4', docNo: 'REC-2024-004', supplier: 'Food Suppliers Ltd', supplierRef: '', expectedDate: '2024-03-28', warehouse: 'Cold Storage',
    notes: 'Check expiry dates', status: 'Draft', totalValue: 800.00, createdAt: '2024-03-13T10:00:00Z', createdBy: 'RK',
    lines: [{ id: 'l4', productName: 'Organic Coffee Beans', sku: 'FO-001', orderedQty: 100, receivedQty: 0, unitPrice: 8 }]
  },
];

const INITIAL_DELIVERIES: Delivery[] = [
  {
    id: '1', docNo: 'DEL-2024-001', customer: 'Alpha Retail', scheduledDate: '2024-03-20', warehouse: 'Zone A', deliveryType: 'Standard',
    address: '123 Main St, New York, NY 10001', notes: '', status: 'Done', createdAt: '2024-03-09T10:00:00Z', createdBy: 'JD',
    lines: [{ id: 'l1', productName: 'Smart Watch', sku: 'EL-002', demandedQty: 5, doneQty: 5, unitPrice: 199.99 }]
  },
  {
    id: '2', docNo: 'DEL-2024-002', customer: 'Beta Electronics', scheduledDate: '2024-03-21', warehouse: 'Zone A', deliveryType: 'Express',
    address: '456 Tech Blvd, San Francisco, CA 94105', notes: 'Before 12pm', status: 'In Transit', createdAt: '2024-03-10T10:00:00Z', createdBy: 'SM',
    lines: [{ id: 'l2', productName: 'Wireless Headphones', sku: 'EL-001', demandedQty: 10, doneQty: 10, unitPrice: 99.99 }]
  },
  {
    id: '3', docNo: 'DEL-2024-003', customer: 'Gamma Stores', scheduledDate: '2024-03-25', warehouse: 'Zone C', deliveryType: 'Standard',
    address: '789 Trade Way, Austin, TX 78701', notes: '', status: 'Packing', createdAt: '2024-03-11T10:00:00Z', createdBy: 'JD',
    lines: [{ id: 'l3', productName: 'Cotton T-Shirt', sku: 'AP-001', demandedQty: 100, doneQty: 0, unitPrice: 19.99 }]
  },
  {
    id: '4', docNo: 'DEL-2024-004', customer: 'Delta Markets', scheduledDate: '2024-03-28', warehouse: 'Zone B', deliveryType: 'International',
    address: '10 Global Road, London, UK EC1A 1BB', notes: 'Include customs docs', status: 'Draft', createdAt: '2024-03-12T10:00:00Z', createdBy: 'RK',
    lines: []
  },
];

export const useReceiptStore = create<ReceiptStore>()(
  persist(
    (set, get) => ({
      receipts: INITIAL_RECEIPTS,
      deliveries: INITIAL_DELIVERIES,

      addReceipt: (receiptData) => {
        const { receipts } = get();
        const docNo = generateDocNo('REC', receipts.map(r => r.docNo));
        const newReceipt: Receipt = {
          ...receiptData,
          id: crypto.randomUUID(),
          docNo,
          createdAt: new Date().toISOString(),
        };
        set({ receipts: [newReceipt, ...receipts] });
        toast.success(`Receipt ${docNo} created successfully!`);
      },

      updateReceiptStatus: (id, status) => {
        set(state => ({
          receipts: state.receipts.map(r => r.id === id ? { ...r, status } : r)
        }));
        toast.success(`Receipt status updated to ${status}`);
      },

      addDelivery: (deliveryData) => {
        const { deliveries } = get();
        const docNo = generateDocNo('DEL', deliveries.map(d => d.docNo));
        const newDelivery: Delivery = {
          ...deliveryData,
          id: crypto.randomUUID(),
          docNo,
          createdAt: new Date().toISOString(),
        };
        set({ deliveries: [newDelivery, ...deliveries] });
        toast.success(`Delivery ${docNo} created successfully!`);
      },

      updateDeliveryStatus: (id, status) => {
        set(state => ({
          deliveries: state.deliveries.map(d => d.id === id ? { ...d, status } : d)
        }));
        toast.success(`Delivery status updated to ${status}`);
      },

      updateDeliveryLineDoneQty: (deliveryId, lineId, doneQty) => {
        set(state => ({
          deliveries: state.deliveries.map(d => 
            d.id === deliveryId 
              ? { 
                  ...d, 
                  lines: d.lines.map(l => l.id === lineId ? { ...l, doneQty } : l) 
                } 
              : d
          )
        }));
      },
    }),
    { name: 'coreinventory-receipts' }
  )
);
