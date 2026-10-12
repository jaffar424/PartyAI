import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  Loader2,
  Trash2,
  Lightbulb,
} from 'lucide-react';
import { AgentChatMessage, PartyPlan, ShoppingItem } from '../types/planner';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PartyPlan;
  onAddItem: (item: ShoppingItem) => void;
  onRemoveItemByName: (nameOrId: string) => void;
}

const QUICK_PROMPTS = [
  'Trim $40 from this list without guests noticing',
  'Suggest 2 signature cocktails with shared ingredients',
  'We have 3 gluten-free guests joining, what should we swap?',
  'What small essentials did I forget (ice scoop, sharpie, bags)?',
  'Give me a game schedule and playlist vibe',
];

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onAddItem,
  onRemoveItemByName,
}) => {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: `Hello! I'm your CymbalMart Shopping Agent. I've analyzed your event plan for "${currentPlan.title}". How can I help fine-tune your shopping list, align items with your budget, or recommend smart substitutions across CymbalMart aisles?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      proTip: 'Ask me to cut costs to hit your budget, adapt for sudden dietary needs, or find member rollback deals!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    const userMsg: AgentChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const history = messages.slice(-4).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/planner/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          currentPlan,
          history,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const agentMsg: AgentChatMessage = {
          id: `agent-${Date.now()}`,
          sender: 'agent',
          text: data.reply || 'Here is what I recommend for your party shopping.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          proTip: data.proTip,
          suggestedAdditions: data.suggestedAdditions,
          suggestedRemovals: data.suggestedRemovals,
        };
        setMessages((prev) => [...prev, agentMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'agent',
            text: 'I ran into an issue processing that. Please try rephrasing!',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: 'Unable to reach the shopping agent right now. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm flex items-center gap-1.5">
              CymbalMart Agent
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-blue-100">AI Procurement & Event Strategy</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Prompts Banner */}
      <div className="p-3 bg-slate-50 border-b border-slate-200/80 overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Ask:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(prompt)}
            disabled={isSending}
            className="text-[11px] px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 text-slate-700 whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white ${
                msg.sender === 'user'
                  ? 'bg-slate-800'
                  : 'bg-gradient-to-tr from-rose-500 to-amber-500'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] space-y-2`}>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-100/90 text-slate-900 rounded-tl-none border border-slate-200/60'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
                <span className="block text-[10px] text-slate-400 mt-1 text-right">
                  {msg.timestamp}
                </span>
              </div>

              {/* Agent Pro Tip */}
              {msg.proTip && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Pro-Tip: </span>
                    {msg.proTip}
                  </div>
                </div>
              )}

              {/* Suggested Additions */}
              {msg.suggestedAdditions && msg.suggestedAdditions.length > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1">
                    <Plus className="w-3 h-3 text-emerald-600" /> Recommended Additions:
                  </span>
                  <div className="space-y-1.5">
                    {msg.suggestedAdditions.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-emerald-100 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {item.quantity} • ${item.estimatedCost} • {item.store}
                          </div>
                        </div>
                        <button
                          onClick={() => onAddItem(item)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Removals */}
              {msg.suggestedRemovals && msg.suggestedRemovals.length > 0 && (
                <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
                  <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wide flex items-center gap-1">
                    <Trash2 className="w-3 h-3 text-rose-600" /> Suggested Removals:
                  </span>
                  <div className="space-y-1.5">
                    {msg.suggestedRemovals.map((remName, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-rose-100 text-xs"
                      >
                        <span className="text-slate-800 font-medium truncate max-w-[200px]">
                          {remName}
                        </span>
                        <button
                          onClick={() => onRemoveItemByName(remName)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 w-fit text-xs text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
            <span>Consulting party knowledge base & recalculating...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for budget cuts, drink recipes, substitutions..."
          disabled={isSending}
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-900"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="p-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white disabled:opacity-40 transition-all cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
