import React, { useState, useCallback } from 'react';
import type { Product, ProductBatch } from '../types';
import { XMarkIcon, PlusIcon, PhotoIcon } from './icons';

interface AddProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
}

const emojiToSvgDataUri = (emoji: string) => `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22central%22 text-anchor=%22middle%22 font-size=%2280%22>${emoji}</text></svg>`;

const DEFAULT_ICONS = ['🍅', '🥕', '🧅', '🥦', '🥔', '🫑', '🥬', '🧄', '🌽', '🥒', '🍆', '🌶️'];

const AddProductForm: React.FC<AddProductFormProps> = ({ isOpen, onClose, onAddProduct }) => {
  const [name, setName] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [transportCost, setTransportCost] = useState('');
  const [otherCosts, setOtherCosts] = useState('');
  const [batchSize, setBatchSize] = useState('');
  const [stock, setStock] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      fileToBase64(file).then(url => setSelectedImageUrl(url));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
  };
  
  const resetForm = useCallback(() => {
    setName('');
    setRetailPrice('');
    setPurchasePrice('');
    setTransportCost('');
    setOtherCosts('');
    setBatchSize('');
    setStock('');
    setSelectedImageUrl(null);
    setError('');
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !retailPrice || !purchasePrice || !batchSize || !stock || !selectedImageUrl) {
      setError('All fields (except optional costs) and an icon/image are required.');
      return;
    }
    
    const pp = parseFloat(purchasePrice) || 0;
    const tc = parseFloat(transportCost) || 0;
    const oc = parseFloat(otherCosts) || 0;

    const newProduct: Omit<Product, 'id'> = {
        name,
        imageUrl: selectedImageUrl,
        batchSize,
        batches: [{
            id: '', // App will generate this
            date: new Date(),
            quantity: parseInt(stock, 10),
            stock: parseInt(stock, 10),
            purchasePrice: pp,
            transportCost: tc,
            otherCosts: oc,
            costPrice: pp + tc + oc,
            retailPrice: parseFloat(retailPrice),
        }]
    };
    
    onAddProduct(newProduct);
    resetForm();
    onClose();
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-40 flex justify-center items-center p-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-lg shadow-2xl bg-gradient-to-b from-emerald-600/20 to-black p-px">
        <div className="bg-black w-full h-full rounded-[7px] flex flex-col text-zinc-200">
            <header className="flex items-center justify-between p-4 border-b border-zinc-700">
            <h2 className="text-xl font-bold text-emerald-400">Add New Product</h2>
            <button onClick={handleClose} className="text-zinc-400 hover:text-white transition-colors" aria-label="Close form">
                <XMarkIcon className="w-6 h-6" />
            </button>
            </header>
            <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
            {error && <p className="text-red-400 text-sm bg-red-500/10 p-2 rounded-md">{error}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product-name" className="block text-sm font-medium text-zinc-400 mb-1">Product Name</label>
                  <input type="text" id="product-name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-zinc-700 p-2 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                 <div>
                  <label htmlFor="batch-size" className="block text-sm font-medium text-zinc-400 mb-1">Batch Size (e.g., per kg)</label>
                  <input type="text" id="batch-size" value={batchSize} onChange={e => setBatchSize(e.target.value)} className="w-full bg-zinc-700 p-2 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
             <div className="p-3 bg-zinc-900/50 border border-zinc-700 rounded-lg space-y-3">
                <p className="text-sm font-medium text-zinc-300">First Batch Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="stock" className="block text-xs font-medium text-zinc-400 mb-1">Initial Stock</label>
                        <input type="number" id="stock" value={stock} onChange={e => setStock(e.target.value)} min="0" className="w-full bg-zinc-700 p-2 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" required/>
                    </div>
                     <div>
                        <label htmlFor="retail-price" className="block text-xs font-medium text-zinc-400 mb-1">Retail Price ($)</label>
                        <input type="number" id="retail-price" value={retailPrice} onChange={e => setRetailPrice(e.target.value)} min="0" step="0.01" className="w-full bg-zinc-700 p-2 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" required/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="purchase-price" className="block text-xs font-medium text-zinc-400 mb-1">Purchase Price ($)</label>
                        <input type="number" id="purchase-price" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} min="0" step="0.01" className="w-full bg-zinc-700 p-2 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" required/>
                    </div>
                    <div>
                        <label htmlFor="transport-cost" className="block text-xs font-medium text-zinc-400 mb-1">Transport ($)</label>
                        <input type="number" id="transport-cost" value={transportCost} onChange={e => setTransportCost(e.target.value)} min="0" step="0.01" placeholder="Optional" className="w-full bg-zinc-700 p-2 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                     <div>
                        <label htmlFor="other-costs" className="block text-xs font-medium text-zinc-400 mb-1">Other ($)</label>
                        <input type="number" id="other-costs" value={otherCosts} onChange={e => setOtherCosts(e.target.value)} min="0" step="0.01" placeholder="Optional" className="w-full bg-zinc-700 p-2 rounded-md border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                    </div>
                </div>
             </div>

            <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Product Icon</label>
                <div className="p-3 bg-zinc-900/50 border border-zinc-700 rounded-lg">
                    <div className="grid grid-cols-6 gap-2 mb-3">
                        {DEFAULT_ICONS.map(emoji => {
                            const url = emojiToSvgDataUri(emoji);
                            return (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setSelectedImageUrl(url)}
                                    className={`aspect-square flex items-center justify-center text-3xl rounded-md transition-all ${selectedImageUrl === url ? 'bg-emerald-500 ring-2 ring-white' : 'bg-zinc-700 hover:bg-zinc-600'}`}
                                >
                                    {emoji}
                                </button>
                            );
                        })}
                    </div>
                    <div className="relative border-t border-zinc-700 pt-3">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-zinc-700"></div></div>
                        <div className="relative flex justify-center"><span className="bg-black px-2 text-sm text-zinc-400">Or</span></div>
                    </div>
                    <label htmlFor="file-upload" className="mt-3 w-full bg-zinc-700 hover:bg-zinc-600 transition-colors text-emerald-300 font-semibold py-2 px-4 rounded-md flex items-center justify-center text-sm cursor-pointer">
                        <PhotoIcon className="w-5 h-5 mr-2" />
                        Upload Custom Image
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                    </label>
                </div>
                {selectedImageUrl && (
                    <div className="mt-3 text-center">
                        <p className="text-sm text-zinc-400 mb-2">Image Preview:</p>
                        <img src={selectedImageUrl} alt="Preview" className="w-20 h-20 object-contain rounded-md inline-block bg-zinc-900 p-1 border border-zinc-700"/>
                    </div>
                )}
            </div>
            <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-md hover:bg-emerald-700 transition-colors flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Product
                </button>
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;