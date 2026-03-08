
import React from 'react';
import type { Transaction } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
  selectedTransactionId: string | null;
  onSelectTransaction: (transaction: Transaction) => void;
  isLoading?: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, selectedTransactionId, onSelectTransaction, isLoading }) => {
  return (
    <div className="rounded-lg bg-gradient-to-b from-emerald-600/20 to-black p-px h-full">
      <div className="bg-black p-4 rounded-[7px] h-full flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-emerald-400">Transaction History</h2>
        <div className="space-y-2 flex-grow overflow-y-auto pr-2">
          {isLoading ? (
              <div className="flex justify-center items-center h-full">
                  <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse [animation-delay:0.4s]"></div>
                  </div>
              </div>
          ) : transactions.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-zinc-500 text-center">No transactions yet.</p>
            </div>
          ) : (
            [...transactions].reverse().map((transaction) => (
              <button
                key={transaction.id}
                onClick={() => onSelectTransaction(transaction)}
                className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${
                  selectedTransactionId === transaction.id
                    ? 'bg-emerald-500/20 ring-2 ring-emerald-500'
                    : 'bg-zinc-700/60 hover:bg-zinc-600/80 border border-zinc-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-sm">Transaction #{transaction.id.slice(-6)}</p>
                    <p className="text-xs text-zinc-400">{transaction.date.toLocaleString()}</p>
                  </div>
                  <p className="font-bold text-lg">${transaction.total.toFixed(2)}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;