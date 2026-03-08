import React from 'react';
import type { Product } from '../types';
import { PlusIcon, XCircleIcon } from './icons';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onAddNewProductClick: () => void;
  onDeleteProduct: (productId: string) => void;
}

// Helper to get display info from a product's batches
const getProductDisplayInfo = (product: Product) => {
    const totalStock = product.batches.reduce((sum, batch) => sum + batch.stock, 0);
    // Find the oldest batch that still has stock (FIFO)
    const firstAvailableBatch = product.batches.find(batch => batch.stock > 0);
    // Use its price, or fall back to the latest batch's price if all are out of stock
    const displayPrice = firstAvailableBatch ? firstAvailableBatch.retailPrice : product.batches[product.batches.length-1]?.retailPrice || 0;
    
    return { totalStock, displayPrice };
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ products, onAddToCart, onAddNewProductClick, onDeleteProduct }) => {
  return (
    <div className="rounded-lg bg-gradient-to-b from-emerald-600/20 to-black p-px h-full">
      <div className="bg-black p-4 rounded-[7px] h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-emerald-400">Product Catalog</h2>
          <button 
            onClick={onAddNewProductClick}
            className="bg-emerald-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center text-sm"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add New Product
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto flex-grow p-1">
          {products.map((product) => {
              const { totalStock, displayPrice } = getProductDisplayInfo(product);
              const isOutOfStock = totalStock <= 0;
              const isLowStock = totalStock > 0 && totalStock <= 10;
              return (
                  <div key={product.id} className="group relative bg-zinc-700/60 p-3 rounded-lg flex flex-col text-center shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-emerald-500/10 border border-zinc-600">
                      <button 
                        onClick={() => onDeleteProduct(product.id)}
                        className="absolute top-1 right-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        aria-label={`Delete ${product.name}`}
                      >
                          <XCircleIcon className="w-6 h-6" />
                      </button>
                      <img src={product.imageUrl} alt={product.name} className="w-full h-24 object-contain rounded-md mb-2" />
                      <div className="flex-grow flex flex-col">
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-xs text-zinc-400 mb-1">${displayPrice.toFixed(2)} <span className="text-zinc-500">/ {product.batchSize}</span></p>
                        <p className={`text-xs font-bold mt-auto ${isLowStock ? 'text-amber-400' : 'text-zinc-400'} ${isOutOfStock ? 'text-red-500' : ''}`}>
                            {isOutOfStock ? 'Out of Stock' : `Stock: ${totalStock}`}
                        </p>
                      </div>
                      <button
                      onClick={() => onAddToCart(product)}
                      disabled={isOutOfStock}
                      className="mt-2 w-full bg-emerald-600 text-white font-semibold p-2 rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center text-sm disabled:bg-zinc-600 disabled:cursor-not-allowed"
                      aria-label={`Add ${product.name} to cart`}
                      >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add
                      </button>
                  </div>
              );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;