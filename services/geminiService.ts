import { GoogleGenAI, FunctionDeclaration, Type, GenerateContentResponse } from "@google/genai";
import type { Transaction } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are a friendly and helpful POS assistant and business analyst for a vegetable vendor. You can help with finding products, checking sales, analyzing profit, managing stock, and suggesting items to pair with others. You now have advanced financial capabilities, including profit forecasting and detailed product analysis. Be friendly and concise. When asked about products, provide their price, batch size, and current stock. When a function returns no results, inform the user gracefully.`;

const tools: FunctionDeclaration[] = [
    {
        name: 'findProduct',
        parameters: {
            type: Type.OBJECT,
            properties: { productName: { type: Type.STRING, description: 'The name of the vegetable to search for.' } },
            required: ['productName']
        },
        description: 'Find a vegetable by its name to check its price and stock.'
    },
    {
        name: 'getLowStockItems',
        parameters: {
            type: Type.OBJECT,
            properties: { threshold: { type: Type.NUMBER, description: 'The stock level at or below which items are considered low. Defaults to 10.' } },
            required: []
        },
        description: 'Get a list of vegetables that are low in stock.'
    },
    {
        name: 'getProfitReport',
        parameters: {
            type: Type.OBJECT,
            properties: { period: { type: Type.STRING, description: "The time period for the report, e.g., 'today', 'yesterday', 'this week'." } },
            required: ['period']
        },
        description: 'Get a financial report with total revenue, cost of goods, and net profit for a given period.'
    },
    {
        name: 'getMostProfitableProduct',
        parameters: { type: Type.OBJECT, properties: {} },
        description: 'Find the product that has generated the most profit.'
    },
    {
        name: 'getSpoilageReport',
        parameters: {
            type: Type.OBJECT,
            properties: { period: { type: Type.STRING, description: "The time period for the report, e.g., 'today', 'this week'." } },
            required: ['period']
        },
        description: 'Get a report on spoiled items, including the total cost lost.'
    },
    {
        name: 'suggestUpsell',
        parameters: {
            type: Type.OBJECT,
            properties: { cartItems: { type: Type.ARRAY, description: 'An array of vegetable names currently in the cart.', items: { type: Type.STRING } } },
            required: ['cartItems']
        },
        description: 'Suggest a vegetable to add to the current cart as a complementary item.'
    },
    {
        name: 'getProfitForecast',
        parameters: { type: Type.OBJECT, properties: {} },
        description: 'Calculates and returns the total potential profit based on current inventory and margins.'
    },
    {
        name: 'getProductFinancials',
        parameters: {
            type: Type.OBJECT,
            properties: { productName: { type: Type.STRING, description: 'The name of the vegetable to get financial details for.' } },
            required: ['productName']
        },
        description: 'Get a detailed financial breakdown for a specific product, including costs, margins, and stock across all batches.'
    }
];


export const getTransactionInsight = async (
  transaction: Transaction,
  history: Transaction[]
): Promise<string> => {
  const currentTransactionPrompt = `Items: ${transaction.items
    .map((i) => `${i.quantity}x ${i.name}`)
    .join(", ")}, Total: $${transaction.total.toFixed(2)}, Profit: $${transaction.profit.toFixed(2)}`;

  const prompt = `
    You are a helpful POS assistant for a fresh vegetable stand. Your task is to provide a brief, insightful summary of a customer transaction.
    Analyze the items purchased and the profitability. Keep the summary to a single, friendly sentence.

    Here is the current transaction you need to analyze:
    ${currentTransactionPrompt}

    Please provide your one-sentence summary (e.g., "A healthy and profitable sale!", "Looks like someone is making a fresh salad today!"):
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini insight:", error);
    return "Could not retrieve an insight for this transaction.";
  }
};


export const getChatResponse = async (chatHistory: any[]): Promise<GenerateContentResponse> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: chatHistory,
            config: {
                systemInstruction,
                tools: [{ functionDeclarations: tools }],
            }
        });
        return response;
    } catch (error) {
        console.error("Error getting chat response:", error);
        throw new Error("Failed to get response from Gemini.");
    }
};