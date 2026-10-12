import React from 'react';
import { Sparkles, ShoppingBag, PlusCircle, Bookmark, MessageSquare, Printer, CheckCircle2, DollarSign, Store } from 'lucide-react';
import { PartyPlan } from '../types/planner';

interface HeaderProps {
  currentPlan: PartyPlan | null;
  onOpenNewPartyModal: () => void;
  onOpenPresetsModal: () => void;
  onOpenChat: () => void;
  onOpenExport: () => void;
  isChatOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPlan,
  onOpenNewPartyModal,
  onOpenPresetsModal,
  onOpenChat,
  onOpenExport,
  isChatOpen,
}) => {
  const totalItems = currentPlan?.items?.length || 0;
  const purchasedItems = currentPlan?.items?.filter((i) => i.isPurchased).length || 0;
  const totalCost = currentPlan?.items?.reduce((sum, i) => sum + i.estimatedCost, 0) || 0;
  const targetBudget = currentPlan?.partyDetails?.targetBudget || currentPlan?.totalEstimatedCost || 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand: CymbalMart Shopping Agent */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-200">
              <Store className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Cymbal<span className="text-blue-600">Mart</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 rounded-full border border-blue-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Shopping Agent
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Curated, budget-conscious event planning for busy hosts
              </p>
            </div>
          </div>

          {/* Mobile Chat Button Shortcut */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenChat}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isChatOpen
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI</span>
            </button>
          </div>
        </div>

        {/* Live Plan Metrics Pill */}
        {currentPlan && (
          <div className="hidden lg:flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-1.5 text-xs text-slate-600 shadow-inner">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                <strong className="text-slate-900">{purchasedItems}</strong> of {totalItems} items
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>
                Est. <strong className="text-slate-900">${totalCost.toFixed(0)}</strong>
                {targetBudget > 0 && (
                  <span className={totalCost > targetBudget ? ' text-amber-600 font-semibold' : ' text-emerald-600 font-semibold'}>
                    {' '}(Target: ${targetBudget})
                  </span>
                )}
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 text-slate-600">
              <span className="font-semibold text-slate-900 truncate max-w-[140px]">
                {currentPlan.title}
              </span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={onOpenPresetsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-medium transition-colors cursor-pointer shrink-0"
          >
            <Bookmark className="w-3.5 h-3.5 text-blue-600" />
            <span>Templates</span>
          </button>

          <button
            onClick={onOpenNewPartyModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Define Event</span>
          </button>

          {currentPlan && (
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer shrink-0"
              title="Export or Print Shopping Checklist"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          )}

          <button
            onClick={onOpenChat}
            className={`hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              isChatOpen
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>CymbalMart Agent</span>
          </button>
        </div>
      </div>
    </header>
  );
};
