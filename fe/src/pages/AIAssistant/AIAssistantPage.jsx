import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bot, Sparkles, Send, RefreshCw, ShoppingBag, ShieldCheck, Truck, HelpCircle } from 'lucide-react';
import {
  addMessage,
  setStreaming,
  appendStreamingText,
  clearChat,
  setActiveConfirmation,
  clearActiveConfirmation,
} from '../../features/ai/aiSlice';
import AIMessageItem from '../../components/ai/AIMessageItem';
import ActionConfirmationModal from '../../components/ai/ActionConfirmationModal';
import { useChatWithAIMutation } from '../../features/ai/aiApi';

const AIAssistantPage = () => {
  const dispatch = useDispatch();
  const { messages, isStreaming, streamingText, activeConfirmation } = useSelector((state) => state.ai);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const [sendChatMutation, { isLoading: isMutationLoading }] = useChatWithAIMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const handleSend = async (textToSend) => {
    const queryText = (textToSend || inputText).trim();
    if (!queryText || isStreaming || isMutationLoading) return;

    setInputText('');
    dispatch(addMessage({ sender: 'user', text: queryText }));

    try {
      dispatch(setStreaming(true));
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const streamUrl = `${baseUrl}/ai/stream?message=${encodeURIComponent(queryText)}`;
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
          dispatch(addMessage({ sender: 'ai', text: 'An error occurred while processing your request.' }));
        }
      };
    } catch (err) {
      dispatch(setStreaming(false));
      dispatch(addMessage({ sender: 'ai', text: 'Connection error. Please try again.' }));
    }
  };

  const categories = [
    { title: 'Product Search', desc: 'Find laptops, shoes, accessories', icon: ShoppingBag, prompt: 'Find laptops under $1000 for programming' },
    { title: 'Order Tracking', desc: 'Check order status & delivery', icon: Truck, prompt: 'Where is my latest order?' },
    { title: 'Store Policies', desc: 'Return policy, warranty, shipping', icon: ShieldCheck, prompt: 'What is your return & refund policy?' },
    { title: 'Personal Advice', desc: 'Compare products & get advice', icon: HelpCircle, prompt: 'Compare our top rated shoes' },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background py-6 px-4 max-w-5xl mx-auto flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between pb-6 border-b border-outline-variant/40 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary text-on-primary rounded-2xl shadow-md">
            <Sparkles className="w-6 h-6 fill-on-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">AI Shopping Assistant</h1>
            <p className="text-xs text-on-surface-variant font-medium">Natural language product discovery, RAG policy lookup, & LangGraph tool execution.</p>
          </div>
        </div>

        <button
          onClick={() => dispatch(clearChat())}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface border border-outline-variant/60 rounded-xl"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Clear History
        </button>
      </div>

      {/* Suggested Category Cards */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(cat.prompt)}
                className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40 hover:border-primary/40 text-left transition-all hover:shadow-md group"
              >
                <div className="p-2 bg-surface rounded-xl text-primary w-fit mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-on-surface mb-1">{cat.title}</h3>
                <p className="text-xs text-on-surface-variant">{cat.desc}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Messages History */}
      <div className="flex-1 bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-4 sm:p-6 mb-4 overflow-y-auto max-h-[60vh] space-y-4">
        {messages.map((msg) => (
          <AIMessageItem key={msg.id} message={msg} />
        ))}

        {isStreaming && (
          <div className="flex gap-3 my-3">
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container border border-primary/20 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="p-4 rounded-2xl text-sm bg-surface-container-low text-on-surface border border-outline-variant/40 rounded-tl-none max-w-[80%]">
              {streamingText ? (
                <p className="whitespace-pre-wrap">{streamingText}</p>
              ) : (
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                  <span>Scanning catalog & policies...</span>
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="flex items-center gap-3 bg-surface p-2.5 rounded-2xl border border-outline-variant shadow-md">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          disabled={isStreaming}
          placeholder="Ask anything (e.g. 'I need running shoes under $120' or 'What is your return policy?')..."
          className="flex-1 bg-transparent px-4 py-2 text-sm text-on-surface focus:outline-none"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isStreaming}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-xl font-bold text-xs hover:bg-neutral-800 disabled:opacity-40 transition-colors shrink-0"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </div>

      <ActionConfirmationModal
        confirmation={activeConfirmation}
        onConfirm={(msg) => {
          dispatch(clearActiveConfirmation());
          dispatch(addMessage({ sender: 'ai', text: msg }));
        }}
        onCancel={() => dispatch(clearActiveConfirmation())}
      />
    </div>
  );
};

export default AIAssistantPage;
