import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Save } from 'lucide-react';

interface AddProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddProductDrawer({ isOpen, onClose }: AddProductDrawerProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // In a real app, handle file processing here
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-premium z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-card border-l shadow-2xl z-50 overflow-y-auto flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-card z-10 glass">
              <h2 className="text-xl font-bold">Add New Product</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-secondary transition-base"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 space-y-8">
              {/* Image Upload Area */}
              <div>
                <label className="text-sm font-medium mb-2 block">Product Images</label>
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-base ${
                    dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-primary/10 rounded-full text-primary">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Product Name *</label>
                    <input type="text" className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" placeholder="e.g. Wireless Keyboard" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">SKU *</label>
                    <div className="flex">
                      <input type="text" className="w-full px-3 py-2 bg-background border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" placeholder="EL-005" />
                      <button className="px-3 py-2 bg-secondary border border-l-0 rounded-r-lg text-xs font-medium hover:bg-secondary/80 transition-base text-muted-foreground whitespace-nowrap">
                        Auto-generate
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <select className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base appearance-none">
                      <option value="">Select Category</option>
                      <option value="electronics">Electronics</option>
                      <option value="furniture">Furniture</option>
                      <option value="apparel">Apparel</option>
                      <option value="food">Food</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Unit of Measure</label>
                    <select className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base appearance-none">
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="l">Liters (L)</option>
                      <option value="box">Boxes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t pt-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Cost Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input type="number" className="w-full pl-8 pr-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Selling Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input type="number" className="w-full pl-8 pr-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Initial Stock</label>
                    <input type="number" className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" placeholder="0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Reorder Level</label>
                    <input type="number" className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" placeholder="10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Maximum Stock</label>
                    <input type="number" className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-base" placeholder="100" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-card sticky bottom-0 z-10 glass flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-secondary transition-base"
              >
                Cancel
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-base flex items-center shadow-md"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Product
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
