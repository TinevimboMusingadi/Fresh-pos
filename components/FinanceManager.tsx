import React, { useState, useMemo } from 'react';
import type { Product, ProductBatch } from '../types';
import { XMarkIcon, PlusIcon, TrashIcon } from './icons';

interface FinanceManagerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddBatch: (productId: string, newBatchData: Omit<ProductBatch, 'id'>) => void;
  onRecordSpoilage: (productId: string, batchId: string, quantity: number) => void;
  forecastedProfit: number;
}

const FinanceManager: React.FC<FinanceManagerProps> = ({ isOpen, onClose, products, onAddBatch, onRecordSpoilage, forecastedProfit }) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'spoil' | null>(null);
  const [formData, setFormData] = useState({ quantity: '', purchasePrice: '', transportCost: '', otherCosts: '', retailPrice: '', batchId: '' });

  const financialSummary = useMemo(() => {
    const totalInventoryValue = products.reduce((total, product) => {
        return total + product.batches.reduce((subtotal, batch) => subtotal + (batch.costPrice * batch.stock), 0);
    }, 0);
    const totalPotentialRevenue = products.reduce((total, product) => {
        return total + product.batches.reduce((subtotal, batch) => subtotal + (batch.retailPrice * batch.stock), 0);
    }, 0);

    return { totalInventoryValue, totalPotentialRevenue };
  }, [products]);

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !formData.quantity || !formData.purchasePrice || !formData.retailPrice) return;
    
    const purchasePrice = parseFloat(formData.purchasePrice) || 0;
    const transportCost = parseFloat(formData.transportCost) || 0;
    const otherCosts = parseFloat(formData.otherCosts) || 0;

    onAddBatch(selectedProductId, {
      date: new Date(),
      quantity: parseInt(formData.quantity),
      stock: parseInt(formData.quantity),
      purchasePrice,
      transportCost,
      otherCosts,
      costPrice: purchasePrice + transportCost + otherCosts,
      retailPrice: parseFloat(formData.retailPrice),
    });
    resetForms();
  };

  const handleSpoilageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !formData.batchId || !formData.quantity) return;
    onRecordSpoilage(selectedProductId, formData.batchId, parseInt(formData.quantity));
    resetForms();
  };
  
  const resetForms = () => {
    setSelectedProductId(null);
    setFormMode(null);
    setFormData({ quantity: '', purchasePrice: '', transportCost: '', otherCosts: '', retailPrice: '', batchId: '' });
  };

  const renderForm = () => {
    if (!formMode || !selectedProduct) return null;

    if (formMode === 'add') {
      return (
        <form onSubmit={handleAddBatchSubmit} className="bg-zinc-800 p-4 rounded-lg mt-4 border border-zinc-700">
          <h4 className="font-semibold text-emerald-400 mb-2">Add New Batch for {selectedProduct.name}</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <input name="quantity" type="number" placeholder="Quantity" value={formData.quantity} onChange={handleFormChange} className="bg-zinc-700 p-2 rounded-md" required />
            <input name="purchasePrice" type="number" placeholder="Purchase Price ($)" value={formData.purchasePrice} onChange={handleFormChange} className="bg-zinc-700 p-2 rounded-md" step="0.01" required />
            <input name="transportCost" type="number" placeholder="Transport ($)" value={formData.transportCost} onChange={handleFormChange} className="bg-zinc-700 p-2 rounded-md" step="0.01" />
            <input name="otherCosts" type="number" placeholder="Other ($)" value={formData.otherCosts} onChange={handleFormChange} className="bg-zinc-700 p-2 rounded-md" step="0.01" />
            <input name="retailPrice" type="number" placeholder="Retail Price ($)" value={formData.retailPrice} onChange={handleFormChange} className="bg-zinc-700 p-2 rounded-md" step="0.01" required />
          </div>
          <button type="submit" className="mt-3 bg-emerald-600 text-white font-semibold py-1 px-3 rounded-md text-sm">Add Batch</button>
        </form>
      );
    }
    
    if (formMode === 'spoil') {
        const availableBatches = selectedProduct.batches.filter(b => b.stock > 0);
        return (
            <form onSubmit={handleSpoilageSubmit} className="bg-zinc-800 p-4 rounded-lg mt-4 border border-zinc-700">
                <h4 className="font-semibold text-red-400 mb-2">Record Spoilage for {selectedProduct.name}</h4>
                 <div className="grid grid-cols-2 gap-3">
                    <select name="batchId" value={formData.batchId} onChange={handleFormChange} className="bg-zinc-700 p-2 rounded-md" required>
                        <option value="">Select Batch</option>
                        {availableBatches.map(b => <option key={b.id} value={b.id}>Batch from {b.date.toLocaleDateString()} (Stock: {b.stock})</option>)}
                    </select>
                    <input name="quantity" type="number" placeholder="Spoiled Qty" value={formData.quantity} onChange={handleFormChange} className="bg-zinc-700 p-2 rounded-md" required min="1" max={selectedProduct.batches.find(b=>b.id===formData.batchId)?.stock || 1} />
                </div>
                <button type="submit" className="mt-3 bg-red-600 text-white font-semibold py-1 px-3 rounded-md text-sm">Record Spoilage</button>
            </form>
        )
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-5xl h-[90vh] rounded-lg shadow-2xl bg-gradient-to-b from-emerald-600/20 to-black p-px" onClick={e => e.stopPropagation()}>
        <div className="bg-black w-full h-full rounded-[7px] flex flex-col text-zinc-200">
          <header className="flex items-center justify-between p-4 border-b border-zinc-700">
            <h2 className="text-xl font-bold text-emerald-400">Finance & Inventory Manager</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors" aria-label="Close"><XMarkIcon className="w-6 h-6" /></button>
          </header>

          <div className="p-4 bg-zinc-900/50 border-b border-zinc-700">
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-zinc-400">Total Inventory Value</p>
                    <p className="text-2xl font-bold">${financialSummary.totalInventoryValue.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-zinc-400">Potential Revenue</p>
                    <p className="text-2xl font-bold">${financialSummary.totalPotentialRevenue.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-emerald-400">Forecasted Profit</p>
                    <p className="text-2xl font-bold text-emerald-400">${forecastedProfit.toFixed(2)}</p>
                </div>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {products.map(product => (
              <div key={product.id} className="bg-zinc-900 p-3 rounded-lg border border-zinc-700">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-xs text-zinc-400">Total Stock: {product.batches.reduce((s, b) => s + b.stock, 0)}</p>
                    </div>
                    <div className="space-x-2">
                        <button onClick={() => { setSelectedProductId(product.id); setFormMode('add'); }} className="bg-emerald-600 text-white p-2 rounded-md text-xs font-semibold"><PlusIcon className="w-4 h-4 inline mr-1"/>New Batch</button>
                        <button onClick={() => { setSelectedProductId(product.id); setFormMode('spoil'); }} className="bg-red-600 text-white p-2 rounded-md text-xs font-semibold"><TrashIcon className="w-4 h-4 inline mr-1"/>Record Spoilage</button>
                    </div>
                </div>

                {selectedProductId === product.id && renderForm()}

                <div className="mt-3 border-t border-zinc-700 pt-2 text-xs">
                    <p className="font-semibold mb-1 text-zinc-400">Batches:</p>
                    {product.batches.length > 0 ? (
                        <ul className="space-y-1">
                            {product.batches.map(batch => (
                                <li key={batch.id} className={`grid grid-cols-5 gap-2 items-center p-2 rounded ${batch.stock > 0 ? 'bg-zinc-800' : 'bg-zinc-800/50 text-zinc-500'}`}>
                                    <span>Added: {batch.date.toLocaleDateString()}</span>
                                    <span>Stock: {batch.stock} / {batch.quantity}</span>
                                    <span>Cost: ${batch.costPrice.toFixed(2)}</span>
                                    <span>Retail: ${batch.retailPrice.toFixed(2)}</span>
                                    <span className={`font-bold text-right ${batch.retailPrice > batch.costPrice ? 'text-green-400' : 'text-red-400'}`}>
                                        Margin: ${ (batch.retailPrice - batch.costPrice).toFixed(2)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : ( <p className="text-zinc-500">No batches for this product.</p> )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceManager;