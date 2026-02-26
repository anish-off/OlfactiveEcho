import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader, Bot, User, Minimize2 } from 'lucide-react';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your perfume assistant. Ask me about any fragrance!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || 'http://127.0.0.1:5001';
      const response = await fetch(`${CHATBOT_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: input.trim(),
          mode: 'quick'
        }),
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.answer || 'Sorry, I could not process your request.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I\'m having trouble connecting. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-4 rounded-full shadow-2xl hover:shadow-amber-500/50 hover:scale-110 transition-all duration-300 z-50 group"
        aria-label="Open chatbot"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          1
        </span>
      </button>
    );
  }

  return (
    <div 
      className={`fixed right-6 z-50 transition-all duration-300 ${
        isMinimized ? 'bottom-6' : 'bottom-6'
      }`}
    >
      {/* Minimized State */}
      {isMinimized ? (
        <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden w-80">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">Perfume Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(false)}
                className="hover:bg-white/20 p-1 rounded transition-colors"
                aria-label="Expand chat"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Expanded State */
        <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden w-96 h-[600px] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Perfume Assistant</h3>
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="hover:bg-white/20 p-1 rounded transition-colors"
                aria-label="Minimize chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`flex-1 max-w-[75%] ${
                    message.sender === 'user' ? 'text-right' : ''
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-amber-500 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-200">
                  <Loader className="w-5 h-5 text-amber-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-end gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about perfumes..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-2 rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Powered by Olfactive Echo AI
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatbot;
