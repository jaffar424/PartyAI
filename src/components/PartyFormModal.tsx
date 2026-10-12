import React, { useState } from 'react';
import { X, Sparkles, Users, Clock, DollarSign, Utensils, Wine, ShieldCheck, MapPin, Loader2, Store, Tag } from 'lucide-react';
import { PartyDetails } from '../types/planner';

interface PartyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: PartyDetails) => void;
  isLoading: boolean;
}

const PARTY_TYPES = [
  'Birthday Celebration',
  'Game Day Tailgate',
  'Backyard BBQ & Cookout',
  'Dinner Party & Tapas',
  'Cocktail Soirée',
  'Kids Celebration',
  'Holiday Feast',
  'Casual Weekend Hangout',
];

const QUICK_THEMES = [
  'Street Taco & Margarita Fiesta',
  'Game Night & Artisan Pizza',
  'Retro 90s Neon Bash',
  'Sunset Backyard BBQ',
  'Wine & Artisan Charcuterie',
  'Kids Superhero Adventure',
  'Mediterranean Mezze Bar',
  'Cozy Movie & S’mores Firepit',
];

const MEAL_STYLES = [
  { id: 'Finger Foods / Appetizers Only', label: 'Finger Foods & Grazing', desc: '4–6 bites/person/hr' },
  { id: 'Casual Buffet / Heavy Grazing', label: 'Casual Buffet & Sliders', desc: 'Hearty crowd pleaser' },
  { id: 'Full Sit-Down Meal / BBQ', label: 'Full Sit-Down / Grill BBQ', desc: 'Substantial mains & sides' },
  { id: 'Dessert & Drinks Only', label: 'Dessert & Cocktail Bar', desc: 'Sweet treats & sips' },
];

const DRINK_STYLES = [
  { id: 'Full Bar (Beer, Wine & Signature Cocktails)', label: 'Full Bar & Cocktails', desc: 'Spirits, wine, beer, mixers' },
  { id: 'Beer & Wine Only', label: 'Beer & Wine Only', desc: 'Curated brews & vintages' },
  { id: 'Non-Alcoholic & Mocktails Only', label: 'Mocktails & Sodas Only', desc: 'Family & alcohol-free focus' },
  { id: 'BYOB + Host provides Mixers & Ice', label: 'BYOB + Mixers & Ice', desc: 'Budget-friendly host setup' },
];

const DIETARY_OPTIONS = [
  'Vegetarian options',
  'Vegan options',
  'Gluten-Free items',
  'Dairy-Free alternatives',
  'Nut-Free (Allergy safe)',
  'Kid-friendly foods',
  'Halal options',
];

const VENUE_OPTIONS = [
  'Backyard / Patio',
  'Indoor / Living Room',
  'Public Park / Pavilion',
  'Clubhouse / Event Space',
  'Rooftop / Balcony',
];

export const PartyFormModal: React.FC<PartyFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [partyType, setPartyType] = useState(PARTY_TYPES[0]);
  const [theme, setTheme] = useState('Street Taco & Margarita Fiesta');
  const [adults, setAdults] = useState<number>(16);
  const [kids, setKids] = useState<number>(4);
  const [durationHours, setDurationHours] = useState<number>(4);
  const [foodStyle, setFoodStyle] = useState(MEAL_STYLES[1].id);
  const [drinkStyle, setDrinkStyle] = useState(DRINK_STYLES[0].id);
  const [targetBudget, setTargetBudget] = useState<number>(260);
  const [dietary, setDietary] = useState<string[]>(['Vegetarian options', 'Gluten-Free items']);
  const [venue, setVenue] = useState(VENUE_OPTIONS[0]);
  const [notes, setNotes] = useState('Slow cooker carnitas, batch margaritas, festive decor');

  if (!isOpen) return null;

  const toggleDietary = (item: string) => {
    setDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      partyType,
      theme: theme.trim() || partyType,
      adults: Math.max(1, adults),
      kids: Math.max(0, kids),
      durationHours: Math.max(1, durationHours),
      foodStyle,
      drinkStyle,
      targetBudget: Math.max(20, targetBudget),
      dietary,
      venue,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 text-white p-5 sm:p-6 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-2">
              <Store className="w-3.5 h-3.5 text-amber-300" /> CUJ Stage 1: Define Event
            </div>
            <h2 className="text-xl sm:text-2xl font-black">CymbalMart Event Architect</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">
              Specify your event parameters. Our agent converts your intent into a curated, budget-aligned CymbalMart shopping list.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Party Type Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              1. Party Type & Occasion
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PARTY_TYPES.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setPartyType(pt)}
                  className={`text-xs p-2.5 rounded-xl border text-left transition-all cursor-pointer font-medium ${
                    partyType === pt
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  {pt}
                </button>
              ))}
            </div>
          </div>

          {/* Theme & Custom Intent */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              2. Event Theme & Vibe
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Street Taco & Margarita Fiesta, Retro 90s, Backyard Smoker..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-900"
              required
            />
            {/* Quick Themes */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="text-[11px] text-slate-400 self-center mr-1">Inspirations:</span>
              {QUICK_THEMES.slice(0, 5).map((qTheme) => (
                <button
                  key={qTheme}
                  type="button"
                  onClick={() => setTheme(qTheme)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    theme === qTheme
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {qTheme}
                </button>
              ))}
            </div>
          </div>

          {/* Guest Count & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Adults */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" /> Adult Guests
              </label>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAdults((a) => Math.max(1, a - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="text-xl font-black text-slate-900">{adults}</span>
                <button
                  type="button"
                  onClick={() => setAdults((a) => a + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Kids */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                <Users className="w-3.5 h-3.5 text-amber-600" /> Kid Guests
              </label>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setKids((k) => Math.max(0, k - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="text-xl font-black text-slate-900">{kids}</span>
                <button
                  type="button"
                  onClick={() => setKids((k) => k + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> Duration (Hours)
              </label>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setDurationHours((h) => Math.max(1, h - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="text-xl font-black text-slate-900">{durationHours}h</span>
                <button
                  type="button"
                  onClick={() => setDurationHours((h) => Math.min(10, h + 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Budget Constraint Target */}
          <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Target Budget (USD)
              </label>
              <span className="text-lg font-black text-blue-900">${targetBudget}</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="25"
              value={targetBudget}
              onChange={(e) => setTargetBudget(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>$50 (Budget)</span>
              <span>$260 (Host Average)</span>
              <span>$500 (Generous)</span>
              <span>$1,000+ (Lavish)</span>
            </div>
          </div>

          {/* Food & Drink Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                <Utensils className="w-4 h-4 text-blue-600" /> Food Serving Style
              </label>
              <select
                value={foodStyle}
                onChange={(e) => setFoodStyle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
              >
                {MEAL_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.desc})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                <Wine className="w-4 h-4 text-purple-600" /> Drink & Bar Setup
              </label>
              <select
                value={drinkStyle}
                onChange={(e) => setDrinkStyle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
              >
                {DRINK_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dietary Restrictions & Special Requests */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Dietary Accommodations & Inclusions
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((opt) => {
                const selected = dietary.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleDietary(opt)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                      selected
                        ? 'bg-emerald-600 text-white border-emerald-600 font-medium shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Venue & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> Venue
              </label>
              <select
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
              >
                {VENUE_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Special Host Requests & Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. S’mores firepit, specific signature cocktail..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-200 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Curating CymbalMart Shopping List with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Curate CymbalMart Shopping List (Proceed to Review)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2">
              Gemini calculates exact portions, assigns CymbalMart aisle locations, and aligns items with your budget.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
