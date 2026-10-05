import React from 'react';
import { Sparkles, Clock, Cpu, DollarSign, Wrench, BarChart2 } from 'lucide-react';
import { useGetAIAnalyticsQuery } from '../../features/ai/aiApi';

const AIAnalyticsTab = () => {
  const { data, isLoading, refetch } = useGetAIAnalyticsQuery();

  const analytics = data?.data || {
    totalConversations: 0,
    avgLatencyMs: 0,
    totalTokenUsage: 0,
    estimatedCost: '$0.00',
    mostCommonIntents: [],
    mostUsedTools: [],
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-on-surface-variant">
        <Sparkles className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-sm">Loading AI analytics & LangSmith metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-on-surface">AI Agent Analytics & Observability</h2>
          <p className="text-xs text-on-surface-variant">Real-time token usage, latency, tool execution frequency, and cost tracking.</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 text-xs font-semibold border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-high"
        >
          Refresh Data
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase mb-2">
            <Sparkles className="w-4 h-4" /> Total AI Requests
          </div>
          <p className="text-2xl font-black text-on-surface">{analytics.totalConversations}</p>
        </div>

        <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase mb-2">
            <Clock className="w-4 h-4" /> Avg Latency
          </div>
          <p className="text-2xl font-black text-on-surface">{analytics.avgLatencyMs} ms</p>
        </div>

        <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase mb-2">
            <Cpu className="w-4 h-4" /> Total Tokens
          </div>
          <p className="text-2xl font-black text-on-surface">{analytics.totalTokenUsage.toLocaleString()}</p>
        </div>

        <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/40">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase mb-2">
            <DollarSign className="w-4 h-4" /> Est. LLM Cost
          </div>
          <p className="text-2xl font-black text-on-surface">{analytics.estimatedCost}</p>
        </div>
      </div>

      {/* Breakdown Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/40">
          <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" /> Most Common User Intents
          </h3>
          {analytics.mostCommonIntents.length === 0 ? (
            <p className="text-xs text-on-surface-variant italic">No intent data logged yet.</p>
          ) : (
            <div className="space-y-2">
              {analytics.mostCommonIntents.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-surface rounded-lg border border-outline-variant/30">
                  <span className="font-semibold text-on-surface capitalize">{item.intent}</span>
                  <span className="font-bold bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full">{item.count} requests</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/40">
          <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-primary" /> Most Executed AI Tools
          </h3>
          {analytics.mostUsedTools.length === 0 ? (
            <p className="text-xs text-on-surface-variant italic">No tool execution data logged yet.</p>
          ) : (
            <div className="space-y-2">
              {analytics.mostUsedTools.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-surface rounded-lg border border-outline-variant/30">
                  <span className="font-semibold text-on-surface font-mono">{item.tool}</span>
                  <span className="font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{item.count} executions</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalyticsTab;
