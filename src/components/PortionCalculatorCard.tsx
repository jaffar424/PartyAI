import React from 'react';
import { GlassWater, Utensils, ShieldAlert, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { CalculatedPortions } from '../types/planner';

interface PortionCalculatorCardProps {
  portions: CalculatedPortions;
  adults: number;
  kids: number;
  durationHours: number;
  onUpdateGuestCount?: (adults: number, kids: number) => void;
}

export const PortionCalculatorCard: React.FC<PortionCalculatorCardProps> = ({
  portions,
  adults,
  kids,
  durationHours,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const totalGuests = adults + kids;
  const bagCount = Math.ceil(portions.iceLbs / 10);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden mb-6">
      {/* Header Banner */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-800 text-white flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
              Guest Portion & Ratio Calculator
              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/20">
                {totalGuests} Guests ({adults} Adults, {kids} Kids) • {durationHours} Hours
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Procurement metrics calibrated to prevent party shortages without wasteful overbuying
            </p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-white p-1">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded Metrics Grid */}
      {isExpanded && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/50">
          {/* 1. Ice Metric */}
          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-blue-700 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Party Ice Reserve</span>
                <span className="text-lg">🧊</span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-2xl font-black text-slate-900">{portions.iceLbs} lbs</span>
                <span className="text-xs text-blue-600 font-semibold">({bagCount} × 10lb bags)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {portions.iceNote || '1.5 lbs per person covers glass chilling and secondary cooler bath.'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-blue-600 font-medium">
              Pro-tip: Buy ice in the final 2 hours before the event.
            </div>
          </div>

          {/* 2. Drink Math */}
          <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-purple-700 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Beverage Volume</span>
                <GlassWater className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-2xl font-black text-slate-900">{portions.drinkCountTotal}</span>
                <span className="text-xs text-purple-600 font-semibold">total servings</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {portions.drinksBreakdown || 'Calculated: 2 drinks for 1st hour, 1 drink per hour after.'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-purple-600 font-medium">
              Ratio: 65% alcoholic / 35% non-alcoholic hydration.
            </div>
          </div>

          {/* 3. Appetizer & Food Math */}
          <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-amber-700 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Food & Grazing</span>
                <Utensils className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-2xl font-black text-slate-900">{portions.appetizerPiecesPerPerson}</span>
                <span className="text-xs text-amber-600 font-semibold">portions / guest</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Proteins measured at 1/3 lb raw per adult; snacks planned for constant grazing.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-amber-600 font-medium">
              Finger foods allow natural guest mingling.
            </div>
          </div>

          {/* 4. Tableware Reserve Buffer */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-emerald-700 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Tableware Buffer</span>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-2xl font-black text-slate-900">+{portions.tablewareBufferPct}%</span>
                <span className="text-xs text-emerald-600 font-semibold">safety margin</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Guests often set down cups or take fresh plates for dessert. Buffer guarantees zero mid-party runs.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-emerald-600 font-medium">
              Keep a Sharpie by the cup stack so guests write their name.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
