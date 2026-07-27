import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, MessageSquare, Bot, User, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AdminAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "🤵 **ChefPulse Admin AI Concierge:**\n\nHello Chef! I am ready to assist you. Ask me about stock levels, sales figures, today's order queue, customer directories, or seating limits."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const viewportRef = useRef(null);

  const scrollViewport = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollViewport();
  }, [messages, loading]);

  const handleSend = async (msgText) => {
    const textToSend = msgText || input.trim();
    if (!textToSend || loading) return;

    // Append user query
    setMessages(prev => [...prev, { sender: 'user', text: textToSend }]);
    if (!msgText) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/assistant/chat', { message: textToSend });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to request assistant response.');
      setMessages(prev => [
        ...prev, 
        { sender: 'bot', text: '⚠️ Failed to connect to ChefPulse AI concierge. Please check backend services.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        sender: 'bot',
        text: "🤵 **ChefPulse Admin AI Concierge:**\n\nHello Chef! I am ready to assist you. Ask me about stock levels, sales figures, today's order queue, customer directories, or seating limits."
      }
    ]);
  };

  const suggestions = [
    "Check inventory stock levels",
    "Display current orders status",
    "Check reservations queue status",
    "Show daily sales revenue summary"
  ];

  return (
    <div className="space-y-6 text-left h-full flex flex-col font-sans max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">Chef Assistant</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-light text-primary-text mt-1">
            Admin AI Concierge
          </h1>
        </div>

        <button
          onClick={handleClear}
          className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-danger/10 hover:text-danger hover:border-danger/20 transition-all text-secondary-text text-xs flex items-center gap-1.5"
          title="Clear Chat Logs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Conversation
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sug)}
            disabled={loading}
            className="px-3.5 py-2 border border-border-color bg-surface/30 hover:border-primary/50 hover:bg-surface/80 rounded-xl text-[10px] font-bold text-secondary-text hover:text-primary-text transition-all disabled:opacity-50 text-left"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Messages Viewport */}
      <div 
        ref={viewportRef}
        className="flex-1 bg-surface/20 border border-border-color rounded-card p-6 overflow-y-auto space-y-6 max-h-[480px] min-h-[300px]"
      >
        {messages.map((m, idx) => {
          const isBot = m.sender === 'bot';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3.5 max-w-[85%] ${
                isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'
              }`}
            >
              {/* Avatar Icon */}
              <div 
                className={`p-2 rounded-xl shrink-0 border ${
                  isBot 
                    ? 'bg-primary/10 text-primary border-primary/20' 
                    : 'bg-secondary/10 text-secondary border-secondary/20'
                }`}
              >
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Speech bubble */}
              <div className={`p-4 rounded-card border text-xs leading-relaxed ${
                isBot 
                  ? 'bg-surface/50 border-border-color text-primary-text' 
                  : 'bg-primary/10 border-primary/20 text-primary-text'
              }`}>
                {/* Parse basic markdown bullet points/bold titles */}
                <div className="space-y-1.5 whitespace-pre-wrap">
                  {m.text.split('\n').map((line, lIdx) => {
                    let formatted = line;
                    
                    // Match bullet points
                    if (formatted.startsWith('- ')) {
                      formatted = formatted.substring(2);
                      
                      // Bold replacements
                      const boldMatch = formatted.match(/\*\*(.*?)\*\*/g);
                      if (boldMatch) {
                        return (
                          <div key={lIdx} className="flex items-start gap-2 pl-3">
                            <span className="text-primary mt-1">•</span>
                            <span 
                              dangerouslySetInnerHTML={{ 
                                __html: formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                              }} 
                            />
                          </div>
                        );
                      }
                      
                      return (
                        <div key={lIdx} className="flex items-start gap-2 pl-3">
                          <span className="text-primary mt-1">•</span>
                          <span>{formatted}</span>
                        </div>
                      );
                    }
                    
                    // Regular line with bold replacement
                    const boldMatch = formatted.match(/\*\*(.*?)\*\*/g);
                    if (boldMatch) {
                      return (
                        <p 
                          key={lIdx} 
                          dangerouslySetInnerHTML={{ 
                            __html: formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                          }} 
                        />
                      );
                    }
                    
                    return <p key={lIdx}>{formatted}</p>;
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3.5 mr-auto text-left max-w-[85%]">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-card border border-border-color bg-surface/50 text-secondary-text/80 text-xs italic flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Chef Concierge is searching analytics databases...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input controls form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-3 bg-surface/50 border border-border-color p-2 rounded-xl focus-within:border-primary/50 transition-all shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Concierge for reports (e.g. 'Show stock levels')..."
          className="flex-1 bg-transparent outline-none px-3.5 text-xs text-primary-text placeholder:text-secondary-text/30"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-background hover:brightness-110 shadow disabled:opacity-30 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
