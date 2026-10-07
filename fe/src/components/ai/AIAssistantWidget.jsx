import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bot, Sparkles, Send, X, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import {
  toggleWidget,
  closeWidget,
  addMessage,
  setStreaming,
  appendStreamingText,
  clearChat,
  setActiveConfirmation,
  clearActiveConfirmation,
} from '../../features/ai/aiSlice';
import AIMessageItem from './AIMessageItem';
import ActionConfirmationModal from './ActionConfirmationModal';
import { useChatWithAIMutation } from '../../features/ai/aiApi';

const AIAssistantWidget = () => {
  const dispatch = useDispatch();
  const { isWidgetOpen, messages, isStreaming, streamingText, activeConfirmation } = useSelector((state) => state.ai);
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const [sendChatMutation, { isLoading: isMutationLoading }] = useChatWithAIMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isWidgetOpen) scrollToBottom();
  }, [messages, streamingText, isWidgetOpen]);

  const handleSend = async (textToSend) => {
    const queryText = (textToSend || inputText).trim();
    if (!queryText || isStreaming || isMutationLoading) return;

    setInputText('');
    dispatch(addMessage({ sender: 'user', text: queryText }));

    try {
      dispatch(setStreaming(true));

      // Try SSE streaming endpoint first
      const token = localStorage.getItem('token') || '';
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const streamUrl = `${baseUrl}/ai/stream?message=${encodeURIComponent(queryText)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;

      const eventSource = new EventSource(streamUrl);

      let accumulatedText = '';
      let metaData = { products: [], sources: [] };

      eventSource.addEventListener('chunk', (e) => {
        const data = JSON.parse(e.data);
        accumulatedText += data.text;
        dispatch(appendStreamingText(data.text));
      });

      eventSource.addEventListener('done', (e) => {
        metaData = JSON.parse(e.data);
        eventSource.close();
        dispatch(setStreaming(false));
        dispatch(
          addMessage({
            sender: 'ai',
            text: accumulatedText || 'Here is what I found for your request.',
            products: metaData.products || [],
            sources: metaData.sources || [],
          })
        );

        if (metaData.requiresConfirmation && metaData.confirmationData) {
          dispatch(setActiveConfirmation(metaData.confirmationData));
        }
      });

      eventSource.onerror = async () => {
        eventSource.close();
        // Fallback to standard POST chat mutation if EventSource streaming fails
        try {
          const res = await sendChatMutation({ message: queryText }).unwrap();
          dispatch(setStreaming(false));
          dispatch(
            addMessage({
              sender: 'ai',
              text: res.data.answer,
              products: res.data.products || [],
              sources: res.data.sources || [],
            })
          );
          if (res.data.requiresConfirmation && res.data.confirmationData) {
            dispatch(setActiveConfirmation(res.data.confirmationData));
          }
        } catch (err) {
          dispatch(setStreaming(false));
          dispatch(
            addMessage({
              sender: 'ai',
              text: 'I encountered an error processing your request. Please check back shortly.',
            })
          );
        }
      };
    } catch (err) {
      dispatch(setStreaming(false));
      dispatch(
        addMessage({
          sender: 'ai',
          text: 'I encountered a connection error. Please try again.',
        })
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = [
    'Laptops under $1000',
    'Where is my order?',
    'What is your return policy?',
    'Running shoes with good support',
  ];

  return (
    <>
      {/* Floating Action Launcher */}
      <button
        onClick={() => dispatch(toggleWidget())}
        aria-label="Open AI Shopping Assistant"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-primary text-on-primary px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all focus:outline-none"
      >
        <div className="relative">
          <Bot className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        <span className="text-xs font-bold tracking-wide hidden sm:inline">AI Shopping Assistant</span>
      </button>

      {/* Floating Chat Drawer Window */}
      {isWidgetOpen && (
        <div
          className={`fixed bottom-20 right-4 sm:right-6 z-40 bg-surface border border-outline-variant/60 rounded-2xl shadow-2xl flex flex-col transition-all overflow-hidden ${
            isExpanded ? 'w-[92vw] sm:w-[600px] h-[80vh]' : 'w-[92vw] sm:w-[420px] h-[550px]'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-surface-container-high border-b border-outline-variant/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <Sparkles className="w-4 h-4 fill-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-on-surface">ShopNest AI Assistant</h3>
                <p className="text-[10px] text-on-surface-variant font-medium">Powered by LangGraph & RAG</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => dispatch(clearChat())}
                title="Clear Chat"
                className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => dispatch(closeWidget())}
                title="Close"
                className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-surface">
            {messages.map((msg) => (
              <AIMessageItem key={msg.id} message={msg} />
            ))}

            {/* Live Streaming Response Indicator */}
            {isStreaming && (
              <div className="flex gap-3 my-3">
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container border border-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="p-3.5 rounded-2xl text-sm bg-surface-container-low text-on-surface border border-outline-variant/40 rounded-tl-none max-w-[85%]">
                  {streamingText ? (
                    <p className="whitespace-pre-wrap">{streamingText}</p>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                      <span>Thinking & searching catalog...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestion Chips */}
          {messages.length <= 2 && !isStreaming && (
            <div className="px-3 py-2 bg-surface-container-low border-t border-outline-variant/30 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="shrink-0 bg-surface px-2.5 py-1 rounded-full border border-outline-variant/50 text-on-surface-variant hover:text-primary hover:border-primary/40 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Footer */}
          <div className="p-3 bg-surface-container-high border-t border-outline-variant/40 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Ask about products, orders, or policies..."
              className="flex-1 bg-surface border border-outline-variant/60 text-on-surface px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-primary"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isStreaming}
              className="p-2.5 bg-primary text-on-primary rounded-xl hover:bg-neutral-800 disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ActionConfirmationModal
        confirmation={activeConfirmation}
        onConfirm={(msg) => {
          dispatch(clearActiveConfirmation());
          dispatch(addMessage({ sender: 'ai', text: msg }));
        }}
        onCancel={() => dispatch(clearActiveConfirmation())}
      />
    </>
  );
};

export default AIAssistantWidget;
