import React from 'react';
import { DollarSign, PieChart, Store, Lightbulb, TrendingDown, CheckCircle } from 'lucide-react';
import { ShoppingItem, PartyPlan } from '../types/planner';

interface BudgetAnalyticsCardProps {
  plan: PartyPlan;
  items: ShoppingItem[];
  targetBudget: number;
}

export const BudgetAnalyticsCard: React.FC<BudgetAnalyticsCardProps> = ({
  plan,
  items,
  targetBudget,
}) => {
  const totalPlannedCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalPurchasedCost = items
    .filter((item) => item.isPurchased)
    .reduce((sum, item) => sum + item.estimatedCost, 0);

  const budgetDelta = targetBudget - totalPlannedCost;
  const isUnderBudget = budgetDelta >= 0;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  // Store breakdown
  const storeTotals: Record<string, number> = {};

  items.forEach((item) => {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.estimatedCost;
    storeTotals[item.store] = (storeTotals[item.store] || 0) + item.estimatedCost;
  });

  const categoryEntries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const storeEntries = Object.entries(storeTotals).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <DollarSign className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-base text-slate-900">Budget Analytics & Store Spending</h3>
          </div>
          <p className="text-xs text-slate-500">
            Real-time financial tracking across stores and categories
          </p>
        </div>

        {/* Budget Status Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Target Budget</div>
            <div className="text-base font-black text-slate-900">${targetBudget.toFixed(0)}</div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 ${
              isUnderBudget
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isUnderBudget ? (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>${Math.abs(budgetDelta).toFixed(0)} Under Budget</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span>${Math.abs(budgetDelta).toFixed(0)} Over Target</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bars: Target vs Planned vs Purchased */}
      <div className="py-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>
            Purchased in-cart:{' '}
            <strong className="text-emerald-700 font-bold">${totalPurchasedCost.toFixed(1)}</strong>
          </span>
          <span>
            Total Planned:{' '}
            <strong className="text-slate-900 font-bold">${totalPlannedCost.toFixed(1)}</strong> / ${targetBudget}
          </span>
        </div>

        {/* Multi-layered progress bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/50">
          {/* Purchased bar */}
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{
              width: `${Math.min(100, targetBudget > 0 ? (totalPurchasedCost / targetBudget) * 100 : 0)}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <CheckCircle className="w-3 h-3" /> Checked off in store
          </span>
          <span>
            {targetBudget > 0
              ? `${Math.round((totalPlannedCost / targetBudget) * 100)}% of target allocated`
              : ''}
          </span>
        </div>
      </div>

      {/* Grid: Category Breakdown + Store Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
        {/* By Category */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            <PieChart className="w-3.5 h-3.5 text-rose-500" /> Spend by Category
          </div>
          <div className="space-y-2">
            {categoryEntries.map(([cat, amount]) => {
              const pct = totalPlannedCost > 0 ? (amount / totalPlannedCost) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="capitalize text-slate-700">{cat}</span>
                    <span className="text-slate-900 font-bold">
                      ${amount.toFixed(0)}{' '}
                      <span className="text-slate-400 font-normal">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By CymbalMart Aisle */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            <Store className="w-3.5 h-3.5 text-indigo-500" /> Spend by CymbalMart Aisle
          </div>
          <div className="space-y-2">
            {storeEntries.map(([st, amount]) => {
              const pct = totalPlannedCost > 0 ? (amount / totalPlannedCost) * 100 : 0;
              return (
                <div key={st} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700 truncate max-w-[170px]">{st}</span>
                    <span className="text-slate-900 font-bold">
                      ${amount.toFixed(0)}{' '}
                      <span className="text-slate-400 font-normal">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Budget Advice & Tips */}
      {plan.budgetAdvice && plan.budgetAdvice.length > 0 && (
        <div className="mt-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 mb-2">
            <Lightbulb className="w-4 h-4 text-amber-600" /> Savvy Shopping Hacks for This Plan
          </div>
          <ul className="space-y-1.5">
            {plan.budgetAdvice.map((advice, idx) => (
              <li key={idx} className="text-xs text-amber-900 flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{advice}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
