import React, { useState } from 'react';
import { Bot, ChevronDown, Send, Sparkles, UserRound } from 'lucide-react';
import { useSendAssistantMessageMutation } from '../../features/assistant/assistantApi';

const ShopNestAssistant = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello. I can help you discover products, check orders, or explain ShopNest policies.' }
  ]);
  const [sendMessage, { isLoading }] = useSendAssistantMessageMutation();

  const submitMessage = async (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    setMessages((current) => [...current, { role: 'user', content: trimmedMessage }]);
    setMessage('');
    try {
      const response = await sendMessage(trimmedMessage).unwrap();
      setMessages((current) => [...current, {
        role: 'assistant',
        content: response.answer,
        meta: `${response.agent} agent${response.handoff ? ' · handoff' : ''}${response.sources?.length ? ` · ${response.sources.length} sources` : ''}`
      }]);
    } catch (error) {
      console.error('Error sending message to assistant:', error);
      const content = error?.status === 404
        ? 'The assistant service is not deployed on the ShopNest API yet. Please deploy the latest backend revision and try again.'
        : 'I could not reach the assistant right now. Please try again in a moment.';
      setMessages((current) => [...current, { role: 'assistant', content }]);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 w-[min(360px,calc(100vw-2rem))]">
      {open && (
        <section className="mb-3 overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface shadow-2xl">
          <header className="flex items-center justify-between bg-primary px-4 py-3 text-on-primary">
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <div>
                <p className="font-button text-button">ShopNest Concierge</p>
                <p className="text-[10px] uppercase tracking-widest opacity-75">Multi-agent assistant</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} title="Close assistant" className="p-1">
              <ChevronDown size={18} />
            </button>
          </header>
          <div className="max-h-80 space-y-3 overflow-y-auto p-3">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`flex gap-2 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {item.role === 'assistant' && <Bot size={16} className="mt-1 shrink-0 text-primary" />}
                <div className={`max-w-[82%] rounded-xl px-3 py-2 text-sm ${item.role === 'user' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-low text-on-surface'}`}>
                  <p>{item.content}</p>
                  {item.meta && <p className="mt-1 text-[10px] uppercase tracking-wide opacity-60">{item.meta}</p>}
                </div>
                {item.role === 'user' && <UserRound size={16} className="mt-1 shrink-0 text-primary" />}
              </div>
            ))}
            {isLoading && <p className="pl-6 text-xs text-on-surface-variant">Routing to an agent...</p>}
          </div>
          <form onSubmit={submitMessage} className="flex gap-2 border-t border-outline-variant/30 p-3">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about products or orders"
              aria-label="Ask ShopNest Concierge"
              className="min-w-0 flex-1 rounded-lg border border-outline-variant/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button type="submit" disabled={isLoading || !message.trim()} title="Send message" className="rounded-lg bg-primary p-2 text-on-primary disabled:opacity-40">
              <Send size={16} />
            </button>
          </form>
        </section>
      )}
      {!open && (
        <button type="button" onClick={() => setOpen(true)} className="ml-auto flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-on-primary shadow-lg transition-transform hover:-translate-y-0.5" title="Open ShopNest Concierge">
          <Bot size={18} />
          <span className="font-button text-button">Concierge</span>
        </button>
      )}
    </div>
  );
};

export default ShopNestAssistant;