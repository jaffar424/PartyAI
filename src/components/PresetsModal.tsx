import React from 'react';
import { X, Bookmark, ArrowRight, Sparkles, Users, Clock, DollarSign } from 'lucide-react';
import { PARTY_PRESETS, PartyPreset } from '../data/presets';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PartyPreset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Curated Party Blueprints</h3>
              <p className="text-xs text-rose-100">
                Pre-calibrated guest portions, verified grocery costs & store checklists
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Presets */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {PARTY_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-rose-400 bg-white hover:bg-rose-50/20 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{preset.emoji}</span>
                  <h4 className="font-extrabold text-base text-slate-900 group-hover:text-rose-600 transition-colors">
                    {preset.name}
                  </h4>
                </div>
                <p className="text-xs text-slate-500">{preset.tagline}</p>

                <div className="flex items-center flex-wrap gap-3 pt-1 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-rose-500" />
                    {preset.details.adults} Adults
                    {preset.details.kids > 0 ? `, ${preset.details.kids} Kids` : ''}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    {preset.details.durationHours} Hours
                  </span>
                  <span className="flex items-center gap-1 font-bold text-emerald-700">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Est. ${preset.initialPlan.totalEstimatedCost}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 group-hover:bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <span>Load Blueprint</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
