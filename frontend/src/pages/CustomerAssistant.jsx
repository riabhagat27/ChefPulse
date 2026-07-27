import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, AlertCircle, HelpCircle, Utensils, Clock } from 'lucide-react';
import api from '../services/api';

export default function CustomerAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Good evening. I am your ChefPulse virtual concierge. How may I elevate your dining experience today? I can recommend dishes by category, filter by budget, find vegetarian/non-vegetarian selections, or answer questions about our hours and location.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const suggestionChips = [
    "Vegetarian dishes under $30",
    "Today's chef specials",
    "Suggest drink pairings",
    "Where is the restaurant located?",
    "Starters list"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    if (!textToSend) {
      setInputText('');
    }
    setError('');

    // Add user message
    const userMsgId = Date.now();
    setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text }]);
    setTyping(true);

    try {
      const res = await api.post('/api/assistant/chat', { message: text });
      
      // Parse markdown-like list formatting from response for luxury spacing
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'assistant', 
        text: res.data.reply 
      }]);
    } catch (err) {
      console.error(err);
      setError('Connection to concierge failed. Please try again.');
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'assistant', 
        text: 'Forgive me, I encountered a connection issue while reviewing our menus. Please ask again.' 
      }]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col justify-between text-left font-sans relative">
      {/* 1. Header info */}
      <div className="shrink-0 pb-4 border-b border-border-color">
        <span className="text-xs uppercase tracking-widest text-primary font-bold">ChefPulse Assistant</span>
        <h1 className="text-3xl sm:text-5xl font-serif font-light text-primary-text mt-1 flex items-center gap-2">
          Concierge AI <Sparkles className="w-6 h-6 text-primary fill-primary animate-pulse" />
        </h1>
        <p className="text-xs text-secondary-text mt-1">
          Chat with our virtual sommelier for tailored recommendations and database lookups.
        </p>
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="my-2 p-2.5 rounded-lg border border-danger/20 bg-danger/10 text-danger text-[10px] text-center font-medium shrink-0 flex items-center justify-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Scrollable Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 py-6 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-primary to-secondary text-background font-medium shadow-md shadow-primary/5 rounded-tr-none'
                  : 'glass-card border border-border-color text-primary-text rounded-tl-none whitespace-pre-line'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator bubble */}
        {typing && (
          <div className="flex justify-start">
            <div className="glass-card border border-border-color rounded-2xl rounded-tl-none px-5 py-3.5 flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Suggestion Chips */}
      {messages.length < 5 && (
        <div className="shrink-0 flex items-center gap-2 overflow-x-auto pb-3.5 max-w-full">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-3.5 py-2 rounded-xl border border-border-color bg-surface/50 hover:bg-white/5 hover:border-primary/20 text-secondary-text hover:text-primary-text text-[10px] uppercase tracking-wider font-semibold transition-all shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* 4. Chat Input Bar */}
      <div className="shrink-0 pt-4 border-t border-border-color bg-background flex gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="E.g., Recommend vegetarian main courses under $40..."
          className="flex-1 bg-surface/50 border border-border-color focus:border-primary/50 rounded-xl px-5 py-4 text-xs text-primary-text outline-none placeholder:text-secondary-text/30 transition-all font-sans"
        />
        <button
          onClick={() => handleSendMessage()}
          className="p-4 rounded-xl text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/10 transition-all flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
