// A single purchase of a product from a supplier
export interface ProductBatch {
  id: string; // e.g., 'batch-prod-1-1678886400000'
  date: Date;
  quantity: number; // Initial quantity purchased
  stock: number; // Current remaining stock
  purchasePrice: number; // Price per item/unit from supplier
  transportCost: number; // Additional transport cost per item/unit
  otherCosts: number; // Other miscellaneous costs per item/unit
  costPrice: number; // TOTAL cost per item/unit (purchase + transport + other)
  retailPrice: number; // Price per item/unit for the customer
}

// Represents a type of vegetable the vendor sells
export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  batchSize: string; // e.g., 'per kg', 'bunch'
  batches: ProductBatch[];
}

// An item in the customer's current shopping cart
export interface CartItem {
  productId: string;
  productName: string;
  imageUrl: string;
  batchSize: string;
  quantity: number;
  price: number; // The retail price for this item
  batchId: string; // Which batch this item is being sold from
  cost: number; // The cost price for this item from the batch
}

// An item recorded in a completed transaction
export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  batchSize: string;
  salePrice: number; // Price it was sold at
  costPrice: number; // Cost of the item
}

// A completed sale
export interface Transaction {
  id: string;
  items: TransactionItem[];
  total: number; // Total revenue from sale
  costOfGoods: number; // Total cost of items sold
  profit: number; // total - costOfGoods
  date: Date;
}

// A record of items that were thrown away
export interface SpoilageRecord {
  id: string;
  productId: string;
  productName: string;
  batchId: string;
  quantity: number;
  date: Date;
  costLost: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}