import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader, Star, ChevronRight, Sparkles, Send, User, Bot } from 'lucide-react';

const PerfumeFinder = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! I'm your perfume assistant. Ask me to find perfumes by notes, brands, or characteristics.",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchPerfumes = async (question) => {
    if (!question.trim()) return;
    
    setLoading(true);
    setError(null);
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: question,
      sender: 'user',
      timestamp: new Date()
    }]);
    
    try {
      const response = await fetch('http://127.0.0.1:5001/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add bot response
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: data.answer,
        sender: 'bot',
        timestamp: new Date(),
        rawAnswer: data.answer
      }]);
    } catch (err) {
      setError(err.message);
      // Add error message
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `Sorry, I encountered an error: ${err.message}`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !loading) {
      searchPerfumes(input);
      setInput('');
    }
  };

  const parsePerfumes = (answer) => {
    if (!answer) return [];
    
    const perfumes = [];
    const lines = answer.split('\n');
    
    lines.forEach(line => {
      // Match numbered list format: "1. **Name** (Rating: X.X, Type)"
      const numberedMatch = line.match(/^\d+\.\s*\*\*(.*?)\*\*\s*\(Rating:\s*([\d.]+)\/10,\s*(.*?)\)/);
      if (numberedMatch) {
        const [, name, rating, type] = numberedMatch;
        // Find notes and reviewers say in subsequent lines
        const notesIndex = lines.indexOf(line) + 1;
        const notesLine = lines[notesIndex]?.match(/\*Notes:\*\s*(.*)/)?.[1];
        const reviewIndex = lines.indexOf(line) + 2;
        const reviewLine = lines[reviewIndex]?.match(/\*Reviewers say:\*\s*(.*)/)?.[1];
        
        perfumes.push({
          name: name.trim(),
          rating: parseFloat(rating),
          type: type.trim(),
          notes: notesLine?.trim(),
          review: reviewLine?.trim()
        });
      }
    });
    
    return perfumes;
  };

  const renderMessageContent = (message) => {
    if (message.sender === 'user') {
      return (
        <div className="px-4 py-3 bg-amber-100 rounded-2xl rounded-tr-none max-w-[85%]">
          <p className="text-gray-900">{message.text}</p>
        </div>
      );
    }

    if (message.isError) {
      return (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-2xl rounded-tl-none max-w-[85%]">
          <p className="text-red-700">{message.text}</p>
        </div>
      );
    }

    const perfumes = parsePerfumes(message.rawAnswer || message.text);
    
    if (perfumes.length > 0) {
      return (
        <div className="space-y-4 max-w-[85%]">
          <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm">
            <p className="text-gray-700">Here are the perfumes I found:</p>
          </div>
          
          <div className="grid gap-3">
            {perfumes.map((perfume, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{perfume.name}</h3>
                    <div className="flex items-center bg-amber-50 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 text-amber-500 fill-current" />
                      <span className="ml-1 text-xs font-medium text-amber-800">{perfume.rating}</span>
                    </div>
                  </div>
                  <div className="text-xs text-amber-600 font-medium mb-2">{perfume.type}</div>
                  {perfume.notes && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">Notes:</p>
                      <p className="text-sm text-gray-700">{perfume.notes}</p>
                    </div>
                  )}
                  {perfume.review && (
                    <div>
                      <p className="text-xs text-gray-500">Reviewers say:</p>
                      <p className="text-sm text-gray-700 italic">"{perfume.review}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
        <p className="text-gray-700 whitespace-pre-line">{message.text}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-3xl mx-auto flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-amber-600" />
          </div>
          <div className="ml-3">
            <h1 className="font-semibold text-gray-900">Perfume Finder</h1>
            <p className="text-xs text-gray-500">Ask me about fragrances</p>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 mt-1">
                  <Bot className="h-4 w-4 text-gray-600" />
                </div>
              )}
              {renderMessageContent(message)}
              {message.sender === 'user' && (
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center ml-2 mt-1">
                  <User className="h-4 w-4 text-amber-600" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 mt-1">
                <Bot className="h-4 w-4 text-gray-600" />
              </div>
              <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about perfumes (e.g., woody fragrances for men)"
              className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-full bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200 focus:bg-white focus:shadow-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            {[
              'woody for men',
              'vanilla perfumes',
              'citrus summer scents',
              'long-lasting fragrances'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(suggestion);
                  setTimeout(() => {
                    document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  }, 0);
                }}
                className="text-xs px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 hover:bg-amber-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfumeFinder;