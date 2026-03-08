

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { PaperAirplaneIcon, XMarkIcon, SparklesIcon } from './icons';

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ isOpen, onClose, messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-40 flex justify-center items-center p-4 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-2xl h-[80vh] rounded-lg shadow-2xl bg-gradient-to-b from-emerald-600/20 to-black p-px">
        <div className="bg-black w-full h-full rounded-[7px] flex flex-col text-zinc-200">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-zinc-700">
            <div className="flex items-center">
                <SparklesIcon className="w-6 h-6 mr-3 text-emerald-400" />
                <h2 className="text-xl font-bold text-emerald-400">AI Assistant</h2>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors" aria-label="Close chat">
                <XMarkIcon className="w-6 h-6" />
            </button>
            </header>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-zinc-700'}`}>
                    <p className="text-sm">{msg.text}</p>
                </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="max-w-md p-3 rounded-lg bg-zinc-700 flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-zinc-700">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products, stock, or sales..."
                className="w-full bg-zinc-700 text-zinc-200 p-3 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={isLoading}
                aria-label="Chat input"
                />
                <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-emerald-600 text-white p-3 rounded-lg disabled:bg-zinc-600 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
                aria-label="Send message"
                >
                <PaperAirplaneIcon className="w-6 h-6" />
                </button>
            </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;