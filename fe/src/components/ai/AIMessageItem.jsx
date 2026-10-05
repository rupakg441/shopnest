import React from 'react';
import { Bot, User, Sparkles, BookOpen, Wrench } from 'lucide-react';
import AIProductCard from './AIProductCard';

const AIMessageItem = ({ message }) => {
  const isUser = message.sender === 'user';

  // Basic markdown text renderer
  const renderMarkdown = (text = '') => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold text formatting
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-bold text-on-surface mt-2 mb-1" dangerouslySetInnerHTML={{ __html: formatted.replace('### ', '') }} />;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-bold text-on-surface mt-3 mb-1" dangerouslySetInnerHTML={{ __html: formatted.replace('## ', '') }} />;
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm my-0.5" dangerouslySetInnerHTML={{ __html: formatted.replace(/^[•-]\s+/, '') }} />
        );
      }
      return <p key={idx} className="text-sm my-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className={`flex gap-3 my-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
          isUser ? 'bg-primary text-on-primary' : 'bg-primary-container text-on-primary-container border border-primary/20'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
      </div>

      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-3.5 rounded-2xl text-sm ${
            isUser
              ? 'bg-primary text-on-primary rounded-tr-none'
              : 'bg-surface-container-low text-on-surface border border-outline-variant/40 rounded-tl-none shadow-2xs'
          }`}
        >
          {renderMarkdown(message.text)}

          {/* Interactive Products List */}
          {Array.isArray(message.products) && message.products.length > 0 && (
            <div className="mt-3 flex flex-col gap-2 pt-2 border-t border-outline-variant/30">
              <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Matching Products ({message.products.length}):
              </span>
              {message.products.map((product, pIdx) => (
                <AIProductCard key={product.id || product._id || pIdx} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Source Badges */}
        {Array.isArray(message.sources) && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5 px-1">
            {message.sources.map((src, sIdx) => (
              <span
                key={sIdx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-container-high text-on-surface-variant border border-outline-variant/30"
              >
                {src.type === 'rag' ? <BookOpen className="w-2.5 h-2.5" /> : <Wrench className="w-2.5 h-2.5" />}
                {src.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMessageItem;
