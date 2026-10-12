import React, { useState } from 'react';
import { X, Sparkles, TrendingDown, ShieldCheck, ArrowRight, Loader2, Check } from 'lucide-react';
import { ShoppingItem } from '../types/planner';

interface SubstituteModalProps {
  item: ShoppingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApplySwap: (originalItem: ShoppingItem, replacementItem: Partial<ShoppingItem>) => void;
}

export const SubstituteModal: React.FC<SubstituteModalProps> = ({
  item,
  isOpen,
  onClose,
  onApplySwap,
}) => {
  const [swapType, setSwapType] = useState<'budget_cheaper' | 'dietary' | 'upscale'>('budget_cheaper');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen || !item) return null;

  const handleFetchSubstitute = async (typeToUse = swapType) => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/planner/substitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item,
          type: typeToUse,
          context: `Party shopping item swap for ${item.category}`,
        }),
      });

      const data = await res.json();
      if (data.success && data.replacement) {
        setResult(data.replacement);
      }
    } catch (err) {
      console.error('Failed to get substitution:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApplySwap(item, {
      name: result.name,
      quantity: result.quantity || item.quantity,
      estimatedCost: result.estimatedCost || item.estimatedCost,
      store: result.store || item.store,
      dietaryTags: result.dietaryTags || item.dietaryTags,
      reason: `${result.whyBetter || 'AI Swap'} (${result.savingsOrDifference || ''})`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-rose-600 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">AI Smart Swap & Alternative</h3>
              <p className="text-xs text-rose-100">Procure smarter for your party</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Item Overview */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Current Item
            </span>
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-slate-900">{item.name}</span>
                <span className="text-xs text-slate-500 block">
                  {item.quantity} • {item.store}
                </span>
              </div>
              <span className="text-base font-black text-slate-900">
                ${item.estimatedCost.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Goal Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Substitution Goal
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSwapType('budget_cheaper');
                  handleFetchSubstitute('budget_cheaper');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  swapType === 'budget_cheaper'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <TrendingDown className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <span className="text-xs block">Budget Saver</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSwapType('dietary');
                  handleFetchSubstitute('dietary');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  swapType === 'dietary'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <span className="text-xs block">Dietary Safe</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSwapType('upscale');
                  handleFetchSubstitute('upscale');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  swapType === 'upscale'
                    ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Sparkles className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                <span className="text-xs block">Crowd Elevate</span>
              </button>
            </div>
          </div>

          {/* If not generated yet */}
          {!result && !loading && (
            <button
              onClick={() => handleFetchSubstitute()}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Find Recommended Alternative</span>
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div className="py-6 text-center text-slate-500 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-600" />
              <p className="text-xs">Finding smart procurement alternative with Gemini...</p>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" /> Recommended Replacement
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                  {result.savingsOrDifference || 'Great Value'}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-base text-slate-900">{result.name}</h4>
                <div className="text-xs text-slate-600 mt-0.5">
                  {result.quantity} • {result.store} •{' '}
                  <strong className="text-emerald-800 font-bold">
                    ${Number(result.estimatedCost).toFixed(2)}
                  </strong>
                </div>
              </div>

              {result.whyBetter && (
                <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-emerald-100 leading-relaxed">
                  {result.whyBetter}
                </p>
              )}

              {/* Apply Button */}
              <button
                onClick={handleApply}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Apply Swap to Shopping List</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
