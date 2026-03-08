import React from 'react';
import type { CartItem } from '../types';
import { TrashIcon } from './icons';

interface CartProps {
  cart: CartItem[];
  onRemoveFromCart: (productId: string, batchId: string) => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ cart, onRemoveFromCart, onCheckout }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const estimatedProfit = cart.reduce((sum, item) => sum + (item.price - item.cost) * item.quantity, 0);

  return (
    <div className="rounded-lg bg-gradient-to-b from-emerald-600/20 to-black p-px">
      <div className="bg-black p-4 rounded-[7px] flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-emerald-400">Current Order</h2>
        <div className="flex-grow space-y-2 overflow-y-auto pr-2 max-h-64">
          {cart.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">Your cart is empty.</p>
          ) : (
            cart.map((item) => (
              <div key={`${item.productId}-${item.batchId}`} className="flex items-center justify-between bg-zinc-700/60 p-2 rounded-md border border-zinc-600">
                <div className="flex items-center">
                  <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 object-contain rounded-md mr-3" />
                  <div>
                      <p className="font-semibold text-sm">{item.productName}</p>
                      <p className="text-xs text-zinc-400">
                          {item.quantity} x ${item.price.toFixed(2)} ({item.batchSize})
                      </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <p className="font-semibold text-sm mr-4">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => onRemoveFromCart(item.productId, item.batchId)}
                    className="text-zinc-400 hover:text-red-500 transition-colors"
                    aria-label={`Remove ${item.productName} from cart`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-700">
           <div className="flex justify-between items-center text-xs text-emerald-400 mb-2">
            <span>Est. Profit:</span>
            <span>${estimatedProfit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full mt-4 bg-emerald-600 text-white font-bold py-3 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed"
          >
            Complete Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;