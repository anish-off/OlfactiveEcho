import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader, Star, ChevronRight, Sparkles, Send, User, Bot, Clock, Zap, FileText, AlertCircle, Award, Heart, Droplets, Wind, Sun, Moon, Flower, TreePine, Gem } from 'lucide-react';

const PerfumeFinder = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your perfume assistant. Ask me to find perfumes by notes, brands, or characteristics. Switch between ⚡ Fast mode (5-10s) and 📚 Detailed mode using the toggle above.",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('descriptive');
  const [lastResponseTime, setLastResponseTime] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchPerfumes = async (question) => {
    if (!question.trim() || loading) return;
    
    setLoading(true);
    const requestStart = Date.now();
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: question,
      sender: 'user',
      timestamp: new Date(),
      mode: mode
    };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL || 'http://127.0.0.1:5001';
      const response = await fetch(`${CHATBOT_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: question.trim(),
          mode: mode
        }),
      });
      
      const data = await response.json();
      const responseTimeMs = Date.now() - requestStart;
      setLastResponseTime(responseTimeMs);
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: data.answer,
        sender: 'bot',
        timestamp: new Date(),
        mode: mode,
        responseTime: data.response_time || responseTimeMs / 1000,
        retrievedCount: data.retrieved_count,
        responseType: data.type // 'advice' or 'product_search'
      };
      setMessages(prev => [...prev, botMessage]);
      
    } catch (err) {
      console.error('Search error:', err);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: `Sorry, I encountered an error: ${err.message}. Please check if the server is running and try again.`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
        mode: mode
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (input.trim() && !loading) {
      searchPerfumes(input);
      setInput('');
    }
  };

  // Enhanced parsing function that handles all possible response formats
  const parseContent = (text, messageMode, responseType) => {
    if (!text) return { type: 'text', content: text };
    
    // If this is an advice response, don't try to parse as perfumes
    if (responseType === 'advice') {
      // Check for tips or advice format
      const tips = parseTips(text);
      if (tips.length > 0) {
        return { type: 'tips', content: tips };
      }
      // Otherwise return as formatted text
      return { type: 'text', content: text };
    }
    
    // Check for structured perfume data first
    const perfumes = parsePerfumes(text, messageMode);
    if (perfumes.length > 0) {
      return { type: 'perfumes', content: perfumes };
    }
    
    // Check for lists or bullet points
    const listItems = parseList(text);
    if (listItems.length > 1) {
      return { type: 'list', content: listItems };
    }
    
    // Check for comparison tables
    const comparison = parseComparison(text);
    if (comparison) {
      return { type: 'comparison', content: comparison };
    }
    
    // Check for recommendations with ratings
    const recommendations = parseRecommendations(text);
    if (recommendations.length > 0) {
      return { type: 'recommendations', content: recommendations };
    }
    
    // Check for structured information (FAQ style)
    const sections = parseSections(text);
    if (sections.length > 1) {
      return { type: 'sections', content: sections };
    }
    
    // Check for tips or advice format
    const tips = parseTips(text);
    if (tips.length > 0) {
      return { type: 'tips', content: tips };
    }
    
    // Default to formatted text
    return { type: 'text', content: text };
  };

  // Enhanced perfume parsing with more flexible patterns
  const parsePerfumes = (text, messageMode) => {
    if (!text) return [];
    
    const perfumes = [];
    
    // Pattern 1: **Name** (Rating/Type) with detailed sections
    const detailedPattern = /\*\*(\d+\.?\s*.*?)\*\*\s*\([^)]*\)\s*([\s\S]*?)(?=\*\*\d+\.|$)/gs;
    let matches = [...text.matchAll(detailedPattern)];
    
    if (matches.length > 0) {
      for (const match of matches) {
        const [, fullName, body] = match;
        const name = fullName.replace(/^\d+\.?\s*/, '').trim();
        
        // Extract rating from the header
        const ratingMatch = text.match(new RegExp(`\\*\\*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*\\s*\\([^)]*Rating:\\s*([\\d.]+)`));
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
        
        // Extract type
        const typeMatch = text.match(new RegExp(`\\*\\*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*\\s*\\([^)]*Type:\\s*([^,)]+)`));
        const type = typeMatch ? typeMatch[1].trim() : 'Fragrance';
        
        // Parse sections dynamically
        const sections = {};
        const sectionPatterns = [
          { key: 'notes', pattern: /\*Notes?:\*\s*([\s\S]*?)(?=\*\w+:|$)/i },
          { key: 'review', pattern: /\*Review:\*\s*([\s\S]*?)(?=\*\w+:|$)/i },
          { key: 'description', pattern: /\*Description:\*\s*([\s\S]*?)(?=\*\w+:|$)/i },
          { key: 'perfectFor', pattern: /\*Perfect for:\*\s*([\s\S]*?)(?=\*\w+:|$)/i },
          { key: 'bestFor', pattern: /\*Best for:\*\s*([\s\S]*?)(?=\*\w+:|$)/i },
          { key: 'performance', pattern: /\*Performance:\*\s*([\s\S]*?)(?=\*\w+:|$)/i },
          { key: 'longevity', pattern: /\*Longevity:\*\s*([\s\S]*?)(?=\*\w+:|$)/i },
          { key: 'projection', pattern: /\*Projection:\*\s*([\s\S]*?)(?=\*\w+:|$)/i },
          { key: 'sillage', pattern: /\*Sillage:\*\s*([\s\S]*?)(?=\*\w+:|$)/i },
          { key: 'similar', pattern: /\*Similar (?:to|fragrances?):\*\s*([\s\S]*?)(?=\*\w+:|$)/i },
          { key: 'occasions', pattern: /\*Occasions?:\*\s*([\s\S]*?)(?=\*\w+:|$)/i },
          { key: 'season', pattern: /\*Seasons?:\*\s*([\s\S]*?)(?=\*\w+:|$)/i },
          { key: 'price', pattern: /\*Price:\*\s*([\s\S]*?)(?=\*\w+:|$)/i },
          { key: 'brand', pattern: /\*Brand:\*\s*([\s\S]*?)(?=\*\w+:|$)/i },
          { key: 'concentration', pattern: /\*Concentration:\*\s*([\s\S]*?)(?=\*\w+:|$)/i }
        ];
        
        for (const { key, pattern } of sectionPatterns) {
          const match = body.match(pattern);
          if (match && match[1].trim()) {
            sections[key] = match[1].trim();
          }
        }
        
        perfumes.push({
          name,
          rating,
          type,
          ...sections,
          isDetailed: Object.keys(sections).length > 2
        });
      }
    }
    
    // Pattern 2: Simple **Name** with rating in parentheses
    if (perfumes.length === 0) {
      const simplePattern = /\*\*([^*]+)\*\*\s*(?:\((?:★|⭐|Rating:)?\s*([0-9.]+)(?:\/10)?\))?\s*([^\n*]*)/g;
      matches = [...text.matchAll(simplePattern)];
      
      for (const match of matches) {
        const [, name, rating, description] = match;
        if (name && name.trim()) {
          perfumes.push({
            name: name.trim(),
            rating: rating ? parseFloat(rating) : 0,
            description: description ? description.trim() : '',
            type: 'Fragrance',
            isDetailed: false
          });
        }
      }
    }
    
    // Pattern 3: Numbered list format
    if (perfumes.length === 0) {
      const numberedPattern = /(\d+\.)\s*([^-\n]+)(?:\s*-\s*([^\n]+))?/g;
      matches = [...text.matchAll(numberedPattern)];
      
      for (const match of matches) {
        const [, number, name, description] = match;
        if (name && name.trim()) {
          const ratingMatch = (name + (description || '')).match(/([0-9.]+)\/10|★\s*([0-9.]+)/);
          perfumes.push({
            name: name.trim(),
            rating: ratingMatch ? parseFloat(ratingMatch[1] || ratingMatch[2]) : 0,
            description: description ? description.trim() : '',
            type: 'Fragrance',
            isDetailed: false
          });
        }
      }
    }
    
    return perfumes.slice(0, 10); // Limit to 10 results
  };

  // Parse list format
  const parseList = (text) => {
    const bulletPatterns = [
      /^[-•*]\s+(.+)$/gm,
      /^\d+\.\s+(.+)$/gm,
      /^[→→]\s+(.+)$/gm
    ];
    
    for (const pattern of bulletPatterns) {
      const matches = [...text.matchAll(pattern)];
      if (matches.length > 1) {
        return matches.map(match => match[1].trim());
      }
    }
    
    // Check for lines that start with capital letters (simple list)
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length > 2 && lines.every(line => /^[A-Z]/.test(line.trim()))) {
      return lines.map(line => line.trim());
    }
    
    return [];
  };

  // Parse comparison tables or vs. content
  const parseComparison = (text) => {
    if (text.toLowerCase().includes(' vs ') || text.toLowerCase().includes('compared to')) {
      const sections = text.split(/vs\.?|compared to/i);
      if (sections.length >= 2) {
        return {
          items: sections.map((section, index) => ({
            title: index === 0 ? 'Option A' : index === 1 ? 'Option B' : `Option ${String.fromCharCode(65 + index)}`,
            content: section.trim()
          }))
        };
      }
    }
    return null;
  };

  // Parse recommendations with ratings or scores
  const parseRecommendations = (text) => {
    const recommendations = [];
    const patterns = [
      /(?:recommend|suggest|try).*?([A-Z][^.!?]+).*?([0-9.]+\/10|★\s*[0-9.]+)/gi,
      /([A-Z][^-\n]+)\s*-\s*(?:Rating|Score):\s*([0-9.]+)/gi
    ];
    
    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        recommendations.push({
          name: match[1].trim(),
          rating: parseFloat(match[2].replace(/[^\d.]/g, '')),
          type: 'Recommendation'
        });
      }
    }
    
    return recommendations;
  };

  // Parse sections (Q&A, headers, etc.)
  const parseSections = (text) => {
    const sections = [];
    
    // Pattern for headers followed by content
    const headerPattern = /^(#{1,6}\s+.*|[A-Z][^:\n]*:|\*\*[^*]+\*\*)\s*\n([^\n#*]+(?:\n(?![#*])[^\n]+)*)/gm;
    let matches = [...text.matchAll(headerPattern)];
    
    if (matches.length > 0) {
      for (const match of matches) {
        sections.push({
          title: match[1].replace(/[#*]/g, '').replace(':', '').trim(),
          content: match[2].trim()
        });
      }
    } else {
      // Try paragraph separation
      const paragraphs = text.split('\n\n').filter(p => p.trim());
      if (paragraphs.length > 2) {
        paragraphs.forEach((para, index) => {
          const lines = para.split('\n');
          if (lines.length > 1 && lines[0].length < 100) {
            sections.push({
              title: lines[0].trim(),
              content: lines.slice(1).join('\n').trim()
            });
          } else {
            sections.push({
              title: `Section ${index + 1}`,
              content: para.trim()
            });
          }
        });
      }
    }
    
    return sections;
  };

  // Parse tips or advice
  const parseTips = (text) => {
    const tips = [];
    const tipPatterns = [
      /(?:tip|advice|suggestion|remember):\s*([^\n]+)/gi,
      /^(?:\d+\.?\s*)?(?:tip|pro tip|advice|note):\s*(.+)$/gim
    ];
    
    for (const pattern of tipPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        tips.push(match[1].trim());
      }
    }
    
    return tips;
  };

  const getFragranceIcon = (type, name) => {
    const lower = (type + ' ' + name).toLowerCase();
    if (lower.includes('woody') || lower.includes('cedar') || lower.includes('sandalwood')) return TreePine;
    if (lower.includes('floral') || lower.includes('rose') || lower.includes('jasmine')) return Flower;
    if (lower.includes('aquatic') || lower.includes('marine') || lower.includes('ocean')) return Droplets;
    if (lower.includes('citrus') || lower.includes('fresh') || lower.includes('bergamot')) return Sun;
    if (lower.includes('oriental') || lower.includes('amber') || lower.includes('vanilla')) return Moon;
    if (lower.includes('musk') || lower.includes('powder')) return Wind;
    return Gem;
  };

  const renderMessageContent = (message) => {
    if (message.sender === 'user') {
      return (
        <div className="px-4 py-3 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm">
          <p className="text-gray-900 font-medium">{message.text}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-amber-700 opacity-75 flex items-center">
              {message.mode === 'concise' ? <Zap className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
              {message.mode} mode
            </span>
          </div>
        </div>
      );
    }

    if (message.isError) {
      return (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 text-sm">{message.text}</p>
          </div>
        </div>
      );
    }

    const parsedContent = parseContent(message.text, message.mode, message.responseType);
    const showResponseTime = message.responseTime && (
      <div className="flex items-center space-x-1 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        <span>{message.responseTime.toFixed(1)}s</span>
        {message.mode === 'concise' && <Zap className="w-3 h-3 text-green-500" />}
      </div>
    );

    // Render based on content type
    switch (parsedContent.type) {
      case 'perfumes':
        return renderPerfumes(parsedContent.content, message.mode, showResponseTime);
      
      case 'list':
        return renderList(parsedContent.content, showResponseTime);
      
      case 'comparison':
        return renderComparison(parsedContent.content, showResponseTime);
      
      case 'recommendations':
        return renderRecommendations(parsedContent.content, showResponseTime);
      
      case 'sections':
        return renderSections(parsedContent.content, showResponseTime);
      
      case 'tips':
        return renderTips(parsedContent.content, showResponseTime);
      
      default:
        return renderText(parsedContent.content, showResponseTime, message.retrievedCount);
    }
  };

  const renderPerfumes = (perfumes, mode, showResponseTime) => {
    return (
      <div className="space-y-4 max-w-[90%]">
        <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 font-medium">Found {perfumes.length} fragrance{perfumes.length !== 1 ? 's' : ''}:</p>
            {showResponseTime}
          </div>
        </div>
        
        <div className="grid gap-4">
          {perfumes.map((perfume, index) => {
            const IconComponent = getFragranceIcon(perfume.type || '', perfume.name || '');
            return (
              <div key={index} className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${perfume.isDetailed ? 'p-6' : 'p-4'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className={`font-bold text-gray-900 ${perfume.isDetailed ? 'text-lg' : 'text-base'}`}>
                        {perfume.name}
                      </h3>
                      {perfume.type && perfume.type !== 'Fragrance' && (
                        <p className="text-amber-600 font-semibold text-sm">{perfume.type}</p>
                      )}
                    </div>
                  </div>
                  {perfume.rating > 0 && (
                    <div className="flex items-center bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1 rounded-full border border-amber-200">
                      <Star className="text-amber-500 fill-current w-4 h-4" />
                      <span className="ml-1 font-bold text-amber-800 text-sm">
                        {perfume.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                
                {perfume.isDetailed ? (
                  <div className="space-y-4">
                    {renderPerfumeSection('Fragrance Notes', perfume.notes, 'purple', Flower)}
                    {renderPerfumeSection('Review', perfume.review || perfume.description, 'blue', Award)}
                    {renderPerfumeSection('Perfect For', perfume.perfectFor || perfume.bestFor, 'green', Heart)}
                    {renderPerfumeSection('Occasions', perfume.occasions, 'indigo', Star)}
                    {renderPerfumeSection('Season', perfume.season, 'teal', Sun)}
                    {renderPerfumeSection('Performance', perfume.performance, 'orange', Zap)}
                    {renderPerfumeSection('Longevity', perfume.longevity, 'red', Clock)}
                    {renderPerfumeSection('Projection', perfume.projection, 'pink', Wind)}
                    {renderPerfumeSection('Brand', perfume.brand, 'yellow', Award)}
                    {renderPerfumeSection('Concentration', perfume.concentration, 'cyan', Droplets)}
                    {renderPerfumeSection('Price Range', perfume.price, 'emerald', Gem)}
                    {renderPerfumeSection('Similar Fragrances', perfume.similar, 'gray', Search)}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {perfume.notes && (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-800">Notes:</span> {perfume.notes}
                      </p>
                    )}
                    {perfume.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">{perfume.description}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPerfumeSection = (title, content, color, IconComponent) => {
    if (!content) return null;
    
    const colorClasses = {
      purple: 'from-purple-50 to-indigo-50 border-purple-100 text-purple-700 bg-purple-500 text-purple-900',
      blue: 'from-blue-50 to-cyan-50 border-blue-100 text-blue-700 bg-blue-500 text-blue-900',
      green: 'from-green-50 to-emerald-50 border-green-100 text-green-700 bg-green-500 text-green-900',
      orange: 'from-orange-50 to-red-50 border-orange-100 text-orange-700 bg-orange-500 text-orange-900',
      gray: 'from-gray-50 to-slate-50 border-gray-100 text-gray-700 bg-gray-500 text-gray-900',
      indigo: 'from-indigo-50 to-purple-50 border-indigo-100 text-indigo-700 bg-indigo-500 text-indigo-900',
      teal: 'from-teal-50 to-cyan-50 border-teal-100 text-teal-700 bg-teal-500 text-teal-900',
      red: 'from-red-50 to-pink-50 border-red-100 text-red-700 bg-red-500 text-red-900',
      pink: 'from-pink-50 to-rose-50 border-pink-100 text-pink-700 bg-pink-500 text-pink-900',
      yellow: 'from-yellow-50 to-amber-50 border-yellow-100 text-yellow-700 bg-yellow-500 text-yellow-900',
      cyan: 'from-cyan-50 to-blue-50 border-cyan-100 text-cyan-700 bg-cyan-500 text-cyan-900',
      emerald: 'from-emerald-50 to-green-50 border-emerald-100 text-emerald-700 bg-emerald-500 text-emerald-900'
    };
    
    const classes = colorClasses[color] || colorClasses.gray;
    const [bgClass, borderClass, titleColor, dotColor, textColor] = classes.split(' ');
    
    return (
      <div className={`bg-gradient-to-r ${bgClass} rounded-lg p-4 border ${borderClass}`}>
        <div className="flex items-center mb-2">
          <div className={`w-2 h-2 rounded-full ${dotColor} mr-2`}></div>
          <p className={`text-xs font-bold ${titleColor} uppercase tracking-wide flex items-center`}>
            <IconComponent className="w-3 h-3 mr-1" />
            {title}
          </p>
        </div>
        <p className={`text-sm ${textColor} leading-relaxed`}>{content}</p>
      </div>
    );
  };

  const renderList = (items, showResponseTime) => {
    return (
      <div className="space-y-4 max-w-[85%]">
        <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 font-medium">Here's what I found:</p>
            {showResponseTime}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <p className="text-gray-800 leading-relaxed flex-1">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderComparison = (comparison, showResponseTime) => {
    return (
      <div className="space-y-4 max-w-[90%]">
        <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 font-medium">Comparison Results:</p>
            {showResponseTime}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {comparison.items.map((item, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className={`w-3 h-3 rounded-full mr-2 ${index % 2 === 0 ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{item.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecommendations = (recommendations, showResponseTime) => {
    return (
      <div className="space-y-4 max-w-[85%]">
        <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 font-medium">My Recommendations:</p>
            {showResponseTime}
          </div>
        </div>
        
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="font-semibold text-gray-900">{rec.name}</h4>
                  <p className="text-sm text-gray-600">{rec.type}</p>
                </div>
              </div>
              {rec.rating > 0 && (
                <div className="flex items-center bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-1 rounded-full border border-amber-200">
                  <Star className="text-amber-500 fill-current w-4 h-4" />
                  <span className="ml-1 font-bold text-amber-800 text-sm">
                    {rec.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSections = (sections, showResponseTime) => {
    return (
      <div className="space-y-4 max-w-[85%]">
        <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 font-medium">Detailed Information:</p>
            {showResponseTime}
          </div>
        </div>
        
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 px-6 py-4">
                <h3 className="font-bold text-gray-900 flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-600 mr-2" />
                  {section.title}
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTips = (tips, showResponseTime) => {
    return (
      <div className="space-y-4 max-w-[85%]">
        <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 font-medium">Pro Tips & Advice:</p>
            {showResponseTime}
          </div>
        </div>
        
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <p className="text-blue-900 leading-relaxed flex-1">{tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderText = (content, showResponseTime, retrievedCount) => {
    // Enhanced text rendering with better formatting
    const formatText = (text) => {
      if (!text) return text;
      
      // Convert **bold** to actual bold
      text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      
      // Convert *italic* to actual italic
      text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
      
      // Convert bullet points to proper list items
      text = text.replace(/^[-•*]\s+(.+)$/gm, '<li>$1</li>');
      
      // Wrap consecutive list items in ul tags
      text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
      
      return text;
    };

    return (
      <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
        <div 
          className="text-gray-700 whitespace-pre-line leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatText(content) }}
        />
        {(showResponseTime || retrievedCount) && (
          <div className="flex items-center space-x-1 text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
            {showResponseTime}
            {retrievedCount && (
              <span className="ml-2">• {retrievedCount} matches found</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleModeChange = () => {
    const newMode = mode === 'descriptive' ? 'concise' : 'descriptive';
    setMode(newMode);
    
    // Add system message
    const systemMessage = {
      id: Date.now(),
      text: `Switched to ${newMode} mode. ${newMode === 'concise' ? '⚡ Responses will be faster (5-10s) and more compact.' : '📚 Responses will include comprehensive details and rich information.'}`,
      sender: 'bot',
      timestamp: new Date(),
      isSystemMessage: true
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const quickSuggestions = [
    'woody for men',
    'vanilla perfumes', 
    'citrus summer scents',
    'long-lasting fragrances',
    'floral for women',
    'fresh aquatic scents',
    'best perfumes under $50',
    'niche vs designer fragrances',
    'perfume layering tips',
    'seasonal fragrance guide'
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="font-bold text-xl text-gray-900">Perfume Finder</h1>
                <p className="text-sm text-gray-600">AI-powered fragrance discovery</p>
              </div>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100/80 rounded-full p-1 shadow-inner">
              <button
                onClick={handleModeChange}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  mode === 'concise' 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Fast</span>
                <span className="text-xs text-gray-500">5-10s</span>
              </button>
              <button
                onClick={handleModeChange}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  mode === 'descriptive' 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Detailed</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-3 mt-1 shadow-sm ${
                  message.isSystemMessage 
                    ? 'bg-gradient-to-br from-blue-400 to-blue-500' 
                    : message.isError
                    ? 'bg-gradient-to-br from-red-400 to-red-500'
                    : 'bg-gradient-to-br from-gray-400 to-gray-500'
                }`}>
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              
              {message.isSystemMessage ? (
                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm">
                  <p className="text-blue-800 text-sm font-medium">{message.text}</p>
                </div>
              ) : (
                renderMessageContent(message)
              )}
              
              {message.sender === 'user' && (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center ml-3 mt-1 shadow-sm">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mr-3 mt-1 shadow-sm">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {mode === 'concise' ? 'Finding matches quickly...' : 'Analyzing fragrances in detail...'}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
              placeholder={`Ask about perfumes in ${mode} mode${mode === 'concise' ? ' (⚡ 5-10s response)' : ' (📚 detailed analysis)'} - e.g., woody fragrances for men`}
              className="w-full pl-5 pr-14 py-4 border border-gray-300/50 rounded-full bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 outline-none transition-all duration-200 focus:bg-white focus:shadow-lg text-sm placeholder-gray-500"
              disabled={loading}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-md"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {/* Quick Suggestions */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(suggestion);
                  setTimeout(() => {
                    handleSubmit();
                  }, 100);
                }}
                disabled={loading}
                className="text-xs px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-full border border-amber-200/50 hover:from-amber-100 hover:to-orange-100 hover:border-amber-300 transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow"
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          {/* Status Bar */}
          <div className="mt-3 flex items-center justify-center space-x-4">
            <span className={`text-xs px-3 py-1.5 rounded-full border shadow-sm ${
              mode === 'descriptive' 
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200' 
                : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200'
            }`}>
              {mode === 'descriptive' ? '📚 Comprehensive analysis mode' : '⚡ Fast response mode (5-10s)'}
            </span>
            {lastResponseTime && (
              <span className="text-xs text-gray-500 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Last: {(lastResponseTime / 1000).toFixed(1)}s</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfumeFinder;