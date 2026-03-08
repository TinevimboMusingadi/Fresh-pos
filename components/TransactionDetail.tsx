import React from 'react';
import type { Transaction } from '../types';
import { SparklesIcon } from './icons';

interface TransactionDetailProps {
  transaction: Transaction | null;
  insight: string;
  isLoading: boolean;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ transaction, insight, isLoading }) => {
  if (!transaction) {
    return (
      <div className="rounded-lg bg-gradient-to-b from-emerald-600/20 to-black p-px h-full">
        <div className="bg-black w-full h-full rounded-[7px] p-4 flex items-center justify-center">
          <p className="text-zinc-500">Select a transaction to see details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gradient-to-b from-emerald-600/20 to-black p-px h-full">
      <div className="bg-black w-full h-full rounded-[7px] p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-2 text-emerald-400">Transaction Details</h2>
        <p className="text-xs text-zinc-400 mb-4">ID: {transaction.id}</p>
        
        <h3 className="font-semibold mb-2 text-zinc-300">Items Purchased:</h3>
        <ul className="space-y-1 list-none mb-4 text-zinc-300 text-sm flex-grow overflow-y-auto pr-2">
          {transaction.items.map(item => (
            <li key={item.productId} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>${(item.salePrice * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-1 text-sm mb-4 pt-2 border-t border-zinc-700">
            <div className="flex justify-between">
                <span className="text-zinc-400">Total Revenue:</span>
                <span className="font-semibold">${transaction.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-zinc-400">Cost of Goods:</span>
                <span className="font-semibold">-${transaction.costOfGoods.toFixed(2)}</span>
            </div>
             <div className="flex justify-between font-bold text-base pt-1 border-t border-zinc-600 mt-1">
                <span className="text-emerald-400">Net Profit:</span>
                <span className="text-emerald-400">${transaction.profit.toFixed(2)}</span>
            </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-zinc-700">
          <h3 className="font-semibold mb-2 flex items-center text-emerald-400">
            <SparklesIcon className="w-5 h-5 mr-2" />
            Gemini Insight
          </h3>
          <div className="bg-zinc-900 p-3 rounded-lg min-h-[60px] flex items-center justify-center">
              {isLoading ? (
                  <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse [animation-delay:0.4s]"></div>
                  </div>
              ) : (
                  <p className="text-zinc-300 italic text-sm text-center">{insight}</p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;