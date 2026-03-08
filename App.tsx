import React, { useState, useCallback, useEffect } from 'react';
import type { Product, CartItem, Transaction, ChatMessage, ProductBatch, SpoilageRecord } from './types';
import { PRODUCTS } from './constants';
import ProductCatalog from './components/ProductCatalog';
import Cart from './components/Cart';
import TransactionHistory from './components/TransactionHistory';
import TransactionDetail from './components/TransactionDetail';
import ChatAssistant from './components/ChatAssistant';
import AddProductForm from './components/AddProductForm';
import FinanceManager from './components/FinanceManager';
import { getTransactionInsight, getChatResponse } from './services/geminiService';
import { ChatBubbleLeftEllipsisIcon, ChartBarSquareIcon } from './components/icons';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [spoilage, setSpoilage] = useState<SpoilageRecord[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [geminiInsight, setGeminiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(true);
  
  // Modals state
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState<boolean>(false);
  const [isFinanceManagerOpen, setIsFinanceManagerOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoadingTransactions(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const addToCart = useCallback((product: Product) => {
    const firstAvailableBatch = product.batches.find(b => b.stock > 0);
    if (!firstAvailableBatch) {
      alert("This item is out of stock!");
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id && item.batchId === firstAvailableBatch.id);
      if (existingItem) {
        if (existingItem.quantity < firstAvailableBatch.stock) {
          return prevCart.map(item =>
            item.batchId === firstAvailableBatch.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          alert("Cannot add more than available stock in the current batch.");
          return prevCart;
        }
      }
      return [
        ...prevCart,
        {
          productId: product.id,
          productName: product.name,
          imageUrl: product.imageUrl,
          batchSize: product.batchSize,
          quantity: 1,
          price: firstAvailableBatch.retailPrice,
          cost: firstAvailableBatch.costPrice,
          batchId: firstAvailableBatch.id,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, batchId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === productId && item.batchId === batchId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item =>
          item.batchId === batchId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevCart.filter(item => item.batchId !== batchId);
    });
  }, []);

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return;

    let total = 0;
    let costOfGoods = 0;
    const transactionItems: Transaction['items'] = [];
    const updatedProducts = JSON.parse(JSON.stringify(products));

    cart.forEach(cartItem => {
      total += cartItem.price * cartItem.quantity;
      costOfGoods += cartItem.cost * cartItem.quantity;
      transactionItems.push({
        productId: cartItem.productId,
        name: cartItem.productName,
        quantity: cartItem.quantity,
        batchSize: cartItem.batchSize,
        salePrice: cartItem.price,
        costPrice: cartItem.cost,
      });

      const product = updatedProducts.find((p: Product) => p.id === cartItem.productId);
      if (product) {
        const batch = product.batches.find((b: ProductBatch) => b.id === cartItem.batchId);
        if (batch) {
          batch.stock -= cartItem.quantity;
        }
      }
    });

    const newTransaction: Transaction = {
      id: `txn-${Date.now()}`,
      items: transactionItems,
      total,
      costOfGoods,
      profit: total - costOfGoods,
      date: new Date(),
    };

    setTransactions(prev => [...prev, newTransaction]);
    setProducts(updatedProducts.map((p: Product) => ({...p, batches: p.batches.map((b: ProductBatch) => ({...b, date: new Date(b.date)}))})));
    setCart([]);
    setSelectedTransaction(newTransaction);
  }, [cart, products]);

  const handleSelectTransaction = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
  }, []);

  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    setProducts(prev => [
        ...prev,
        {
            ...newProductData,
            id: `prod-${Date.now()}`,
            batches: newProductData.batches.map(b => ({...b, id: `batch-${Date.now()}`}))
        }
    ]);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
        setProducts(prev => prev.filter(p => p.id !== productId));
    }
  }

   const handleAddBatch = (productId: string, newBatchData: Omit<ProductBatch, 'id'>) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId
          ? {
              ...p,
              batches: [
                ...p.batches,
                { ...newBatchData, id: `batch-${productId}-${Date.now()}` },
              ],
            }
          : p
      )
    );
  };
  
  const handleRecordSpoilage = (productId: string, batchId: string, quantity: number) => {
      const product = products.find(p => p.id === productId);
      const batch = product?.batches.find(b => b.id === batchId);
      if (!product || !batch || quantity > batch.stock) {
        alert("Invalid spoilage record.");
        return;
      }

      const newSpoilageRecord: SpoilageRecord = {
          id: `spoil-${Date.now()}`,
          productId,
          productName: product.name,
          batchId,
          quantity,
          date: new Date(),
          costLost: batch.costPrice * quantity
      };
      setSpoilage(prev => [...prev, newSpoilageRecord]);
      
      setProducts(prevProducts => prevProducts.map(p => {
          if (p.id === productId) {
              return {
                  ...p,
                  batches: p.batches.map(b => b.id === batchId ? {...b, stock: b.stock - quantity} : b)
              }
          }
          return p;
      }));
  }
  
  const calculateForecastedProfit = useCallback(() => {
    return products.reduce((totalProfit, product) => {
        const productProfit = product.batches.reduce((batchProfit, batch) => {
            const margin = batch.retailPrice - batch.costPrice;
            return batchProfit + (batch.stock * margin);
        }, 0);
        return totalProfit + productProfit;
    }, 0);
  }, [products]);


  useEffect(() => {
    if (selectedTransaction) {
        setIsLoadingInsight(true);
        setGeminiInsight('');
        getTransactionInsight(selectedTransaction, [])
            .then(insight => setGeminiInsight(insight))
            .finally(() => setIsLoadingInsight(false));
    }
  }, [selectedTransaction]);
  
  const handleSendMessage = async (message: string) => {
    setIsChatLoading(true);
    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', text: message }];
    setChatMessages(newMessages);

    try {
        const apiHistory = newMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
        let response = await getChatResponse(apiHistory);
        let responseText = response.text;

        if (response.functionCalls && response.functionCalls.length > 0) {
            const fc = response.functionCalls[0];
            let functionResult: any;
            
            if (fc.name === 'findProduct') {
                const { productName } = fc.args;
                const product = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
                const stock = product ? product.batches.reduce((sum, b) => sum + b.stock, 0) : 0;
                const price = product?.batches.find(b=>b.stock > 0)?.retailPrice;
                functionResult = product ? `Found ${product.name}. Price: $${price?.toFixed(2)} per ${product.batchSize}, Stock: ${stock}` : `Product "${productName}" not found.`;
            } else if (fc.name === 'getLowStockItems') {
                const threshold = fc.args.threshold || 10;
                const lowStock = products.map(p => ({...p, totalStock: p.batches.reduce((s,b)=>s+b.stock,0)})).filter(p => p.totalStock > 0 && p.totalStock <= threshold);
                functionResult = lowStock.length > 0 ? `Low stock items: ${lowStock.map(p => `${p.name} (${p.totalStock} left)`).join(', ')}` : 'No items are currently low on stock.';
            } else if (fc.name === 'getProfitReport') {
                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const yesterdayStart = new Date(todayStart.getTime() - 24 * 3600 * 1000);
                const weekStart = new Date(todayStart.getTime() - now.getDay() * 24 * 3600 * 1000);

                const relevantTransactions = transactions.filter(t => {
                    const tDate = new Date(t.date);
                    if(fc.args.period === 'today') return tDate >= todayStart;
                    if(fc.args.period === 'yesterday') return tDate >= yesterdayStart && tDate < todayStart;
                    if(fc.args.period === 'this week') return tDate >= weekStart;
                    return true;
                });
                const revenue = relevantTransactions.reduce((s,t)=>s+t.total, 0);
                const profit = relevantTransactions.reduce((s,t)=>s+t.profit, 0);
                functionResult = `For ${fc.args.period}: Total Revenue is $${revenue.toFixed(2)}, and Net Profit is $${profit.toFixed(2)}.`;
            } else if (fc.name === 'getSpoilageReport') {
                 // Similar date logic as profit report
                const totalCostLost = spoilage.reduce((s, sp) => s + sp.costLost, 0);
                functionResult = `Total cost lost to spoilage is $${totalCostLost.toFixed(2)}.`;
            } else if (fc.name === 'getMostProfitableProduct') {
                 const profitByProduct: {[key: string]: number} = {};
                 transactions.forEach(t => t.items.forEach(i => {
                     profitByProduct[i.name] = (profitByProduct[i.name] || 0) + (i.salePrice - i.costPrice) * i.quantity;
                 }));
                 const mostProfitable = Object.entries(profitByProduct).sort((a,b) => b[1] - a[1])[0];
                 functionResult = mostProfitable ? `${mostProfitable[0]} is the most profitable product, generating $${mostProfitable[1].toFixed(2)} in profit.` : "No sales data available to determine profitability.";
            } else if (fc.name === 'getProfitForecast') {
                functionResult = `Based on current inventory, the total forecasted profit is $${calculateForecastedProfit().toFixed(2)}.`;
            } else if (fc.name === 'getProductFinancials') {
                const { productName } = fc.args;
                const product = products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
                if (product) {
                    const totalStock = product.batches.reduce((sum, b) => sum + b.stock, 0);
                    const avgCost = product.batches.reduce((sum, b) => sum + b.costPrice * b.stock, 0) / totalStock || 0;
                    const avgRetail = product.batches.reduce((sum, b) => sum + b.retailPrice * b.stock, 0) / totalStock || 0;
                    const avgMargin = avgRetail - avgCost;
                    functionResult = `Financials for ${product.name}: Total stock is ${totalStock}. The average cost price is $${avgCost.toFixed(2)} and average retail price is $${avgRetail.toFixed(2)}, giving an average profit margin of $${avgMargin.toFixed(2)} per item.`;
                } else {
                    functionResult = `Could not find financial data for "${productName}".`;
                }
            } else {
                functionResult = "Unknown function called.";
            }

            const historyWithFunctionCall = [ ...apiHistory, { role: 'model', parts: [{ functionCall: fc }] }, { role: 'user', parts: [{ functionResponse: { name: fc.name, response: { result: functionResult } } }] }];
            const finalResponse = await getChatResponse(historyWithFunctionCall);
            responseText = finalResponse.text;
        }

        if (responseText) setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
        setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting." }]);
    } finally {
        setIsChatLoading(false);
    }
  };


  return (
    <div className="min-h-screen p-4 lg:p-8 font-sans w-full max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div className="text-left">
            <h1 className="text-4xl font-bold text-emerald-400">Fresh Produce POS</h1>
            <p className="text-zinc-400">A smart point-of-sale system for vegetable vendors.</p>
        </div>
        <button
            onClick={() => setIsFinanceManagerOpen(true)}
            className="bg-zinc-800 text-emerald-400 font-semibold py-2 px-4 rounded-md hover:bg-zinc-700 transition-colors flex items-center justify-center text-sm border border-emerald-600/50"
          >
            <ChartBarSquareIcon className="w-5 h-5 mr-2" />
            Finance Manager
          </button>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-170px)]">
        <div className="flex flex-col"><ProductCatalog products={products} onAddToCart={addToCart} onAddNewProductClick={() => setIsAddProductModalOpen(true)} onDeleteProduct={handleDeleteProduct}/></div>
        <div className="flex flex-col gap-8">
            <Cart cart={cart} onRemoveFromCart={removeFromCart} onCheckout={handleCheckout} />
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8">
                <TransactionHistory transactions={transactions} selectedTransactionId={selectedTransaction?.id ?? null} onSelectTransaction={handleSelectTransaction} isLoading={isLoadingTransactions} />
                <TransactionDetail transaction={selectedTransaction} insight={geminiInsight} isLoading={isLoadingInsight} />
            </div>
        </div>
      </main>

       <button onClick={() => setIsChatOpen(true)} className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-transform hover:scale-110 z-30" aria-label="Open AI Assistant">
        <ChatBubbleLeftEllipsisIcon className="w-8 h-8" />
       </button>
       <ChatAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} messages={chatMessages} onSendMessage={handleSendMessage} isLoading={isChatLoading} />
       <AddProductForm isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} onAddProduct={handleAddProduct} />
       <FinanceManager 
            isOpen={isFinanceManagerOpen} 
            onClose={() => setIsFinanceManagerOpen(false)} 
            products={products} 
            onAddBatch={handleAddBatch} 
            onRecordSpoilage={handleRecordSpoilage} 
            forecastedProfit={calculateForecastedProfit()}
        />
    </div>
  );
};

export default App;