import type { Product } from './types';

// Helper to create clean, high-quality SVG icons from emojis
const emojiToSvgDataUri = (emoji: string) => `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22central%22 text-anchor=%22middle%22 font-size=%2280%22>${emoji}</text></svg>`;

const initialDate = new Date();

export const PRODUCTS: Product[] = [
  { 
    id: 'prod-1', name: 'Tomatoes', imageUrl: emojiToSvgDataUri('🍅'), batchSize: 'per kg', 
    batches: [{ id: 'batch-1-1', date: initialDate, quantity: 50, stock: 50, purchasePrice: 1.10, transportCost: 0.10, otherCosts: 0, costPrice: 1.20, retailPrice: 2.50 }]
  },
  { 
    id: 'prod-2', name: 'Carrots', imageUrl: emojiToSvgDataUri('🥕'), batchSize: 'bunch',
    batches: [{ id: 'batch-2-1', date: initialDate, quantity: 45, stock: 45, purchasePrice: 0.70, transportCost: 0.10, otherCosts: 0, costPrice: 0.80, retailPrice: 1.50 }]
  },
  { 
    id: 'prod-3', name: 'Onions', imageUrl: emojiToSvgDataUri('🧅'), batchSize: 'per kg',
    batches: [{ id: 'batch-3-1', date: initialDate, quantity: 30, stock: 30, purchasePrice: 0.85, transportCost: 0.05, otherCosts: 0, costPrice: 0.90, retailPrice: 1.75 }]
  },
  { 
    id: 'prod-4', name: 'Broccoli', imageUrl: emojiToSvgDataUri('🥦'), batchSize: 'per head',
    batches: [{ id: 'batch-4-1', date: initialDate, quantity: 25, stock: 25, purchasePrice: 1.40, transportCost: 0.10, otherCosts: 0, costPrice: 1.50, retailPrice: 3.00 }]
  },
  { 
    id: 'prod-5', name: 'Potatoes', imageUrl: emojiToSvgDataUri('🥔'), batchSize: 'per kg',
    batches: [{ id: 'batch-5-1', date: initialDate, quantity: 60, stock: 60, purchasePrice: 0.70, transportCost: 0.05, otherCosts: 0, costPrice: 0.75, retailPrice: 2.00 }]
  },
  { 
    id: 'prod-6', name: 'Bell Peppers', imageUrl: emojiToSvgDataUri('🫑'), batchSize: 'single item',
    batches: [{ id: 'batch-6-1', date: initialDate, quantity: 40, stock: 40, purchasePrice: 0.35, transportCost: 0.05, otherCosts: 0, costPrice: 0.40, retailPrice: 0.80 }]
  },
  { 
    id: 'prod-7', name: 'Lettuce', imageUrl: emojiToSvgDataUri('🥬'), batchSize: 'per head',
    batches: [{ id: 'batch-7-1', date: initialDate, quantity: 35, stock: 35, purchasePrice: 1.00, transportCost: 0.10, otherCosts: 0, costPrice: 1.10, retailPrice: 2.25 }]
  },
  { 
    id: 'prod-8', name: 'Garlic', imageUrl: emojiToSvgDataUri('🧄'), batchSize: 'single bulb',
    batches: [{ id: 'batch-8-1', date: initialDate, quantity: 100, stock: 100, purchasePrice: 0.18, transportCost: 0.02, otherCosts: 0, costPrice: 0.20, retailPrice: 0.50 }]
  },
];