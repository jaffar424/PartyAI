import React from 'react';
import { Calendar, ShoppingCart, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export type CujStep = 'define' | 'review' | 'refine_checkout';

interface CujStepperProps {
  currentStep: CujStep;
  onSelectStep: (step: CujStep) => void;
  itemsCount: number;
  totalCost: number;
  targetBudget: number;
}

export const CujStepper: React.FC<CujStepperProps> = ({
  currentStep,
  onSelectStep,
  itemsCount,
  totalCost,
  targetBudget,
}) => {
  const steps: { id: CujStep; number: number; label: string; subtext: string; icon: any }[] = [
    {
      id: 'define',
      number: 1,
      label: 'Define Event',
      subtext: 'Type, theme, budget & guests',
      icon: Calendar,
    },
    {
      id: 'review',
      number: 2,
      label: 'Review List',
      subtext: `${itemsCount} items • Align with budget`,
      icon: ShoppingCart,
    },
    {
      id: 'refine_checkout',
      number: 3,
      label: 'Refine & Checkout',
      subtext: 'Adjust constraints & order',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-blue-100 shadow-xs p-3 sm:p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Step Indicator Navigation */}
        <div className="grid grid-cols-3 gap-2 flex-1">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isCompleted =
              (s.id === 'define' && (currentStep === 'review' || currentStep === 'refine_checkout')) ||
              (s.id === 'review' && currentStep === 'refine_checkout');

            return (
              <button
                key={s.id}
                onClick={() => onSelectStep(s.id)}
                className={`flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                    : isCompleted
                    ? 'bg-blue-50/70 border-blue-200/80 text-blue-900 hover:bg-blue-100/60'
                    : 'bg-slate-50 border-slate-200/70 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                    isActive
                      ? 'bg-white text-blue-600'
                      : isCompleted
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isCompleted ? '✓' : s.number}
                </div>
                <div className="truncate">
                  <div className="font-bold text-xs sm:text-sm truncate">{s.label}</div>
                  <div
                    className={`text-[10px] hidden sm:block truncate ${
                      isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {s.subtext}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Budget Alignment Meter */}
        <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-200 shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Budget Alignment</div>
            <div className="text-sm font-black text-slate-900">
              ${totalCost.toFixed(0)}{' '}
              <span className="text-slate-400 font-normal">/ ${targetBudget.toFixed(0)}</span>
            </div>
          </div>
          <div
            className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
              totalCost <= targetBudget
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {totalCost <= targetBudget
              ? `+$${(targetBudget - totalCost).toFixed(0)} Under Budget`
              : `$${(totalCost - targetBudget).toFixed(0)} Over Budget`}
          </div>
        </div>
      </div>
    </div>
  );
};
