import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Calculator,
  BarChart3,
  Calendar,
  Layers,
  MessageSquare,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Store,
  Tag,
  ArrowRight,
  Edit3,
} from 'lucide-react';
import { Header } from './components/Header';
import { CujStepper, CujStep } from './components/CujStepper';
import { PartyFormModal } from './components/PartyFormModal';
import { PortionCalculatorCard } from './components/PortionCalculatorCard';
import { BudgetAnalyticsCard } from './components/BudgetAnalyticsCard';
import { ShoppingListView } from './components/ShoppingListView';
import { PrepTimelineView } from './components/PrepTimelineView';
import { RefineAndCheckoutView } from './components/RefineAndCheckoutView';
import { AgentChatDrawer } from './components/AgentChatDrawer';
import { SubstituteModal } from './components/SubstituteModal';
import { ExportModal } from './components/ExportModal';
import { PresetsModal } from './components/PresetsModal';
import { PARTY_PRESETS, PartyPreset } from './data/presets';
import { PartyPlan, ShoppingItem, PartyDetails } from './types/planner';

export default function App() {
  // Start with first rich preset
  const defaultPreset = PARTY_PRESETS[0];
  const [currentPlan, setCurrentPlan] = useState<PartyPlan>({
    ...defaultPreset.initialPlan,
    partyDetails: defaultPreset.details,
  });
  const [items, setItems] = useState<ShoppingItem[]>(defaultPreset.initialPlan.items);

  // Active CUJ Step: 'define' | 'review' | 'refine_checkout'
  const [cujStep, setCujStep] = useState<CujStep>('review');

  // Secondary sub-tab for Review stage: 'checklist' | 'calculator' | 'budget' | 'timeline'
  const [activeTab, setActiveTab] = useState<'checklist' | 'calculator' | 'budget' | 'timeline'>('checklist');

  // Modals
  const [isNewPartyOpen, setIsNewPartyOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [substituteItem, setSubstituteItem] = useState<ShoppingItem | null>(null);

  // Loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate Party with AI
  const handleGeneratePlan = async (details: PartyDetails) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        const fullPlan: PartyPlan = {
          ...data.plan,
          partyDetails: details,
        };
        setCurrentPlan(fullPlan);
        setItems(data.plan.items || []);
        setIsNewPartyOpen(false);
        setCujStep('review');
        setActiveTab('checklist');
      } else {
        setErrorMsg(data.error || 'Failed to generate party shopping plan. Please retry.');
      }
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setErrorMsg('Network error while consulting Gemini AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Select Preset Blueprint
  const handleSelectPreset = (preset: PartyPreset) => {
    setCurrentPlan({
      ...preset.initialPlan,
      partyDetails: preset.details,
    });
    setItems(preset.initialPlan.items);
    setCujStep('review');
    setActiveTab('checklist');
  };

  // Item modifications
  const handleTogglePurchased = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPurchased: !item.isPurchased } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (updated: ShoppingItem) => {
    setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleAddItem = (newItem: ShoppingItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  const handleRemoveItemByName = (nameOrId: string) => {
    const lower = nameOrId.toLowerCase();
    setItems((prev) =>
      prev.filter(
        (item) => item.id !== nameOrId && !item.name.toLowerCase().includes(lower)
      )
    );
  };

  const handleApplySwap = (original: ShoppingItem, replacement: Partial<ShoppingItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === original.id
          ? {
              ...item,
              ...replacement,
              name: replacement.name || item.name,
              estimatedCost: replacement.estimatedCost || item.estimatedCost,
              quantity: replacement.quantity || item.quantity,
              store: replacement.store || item.store,
            }
          : item
      )
    );
  };

  const targetBudget = currentPlan.partyDetails?.targetBudget || currentPlan.totalEstimatedCost;
  const currentTotalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const purchasedCount = items.filter((i) => i.isPurchased).length;
  const totalCount = items.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-slate-50 to-amber-50/30 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        currentPlan={currentPlan}
        onOpenNewPartyModal={() => setIsNewPartyOpen(true)}
        onOpenPresetsModal={() => setIsPresetsOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        isChatOpen={isChatOpen}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-600 hover:text-rose-900 font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Critical User Journey (CUJ) Stepper */}
        <CujStepper
          currentStep={cujStep}
          onSelectStep={(step) => {
            setCujStep(step);
            if (step === 'define') {
              setIsNewPartyOpen(true);
            }
          }}
          itemsCount={items.length}
          totalCost={currentTotalCost}
          targetBudget={targetBudget}
        />

        {/* Hero Party Showcase Card */}
        <section className="bg-white rounded-3xl border border-blue-100 shadow-xs p-6 sm:p-7 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/40 via-amber-100/30 to-transparent rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center flex-wrap gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-blue-600" /> CymbalMart Party Plan
                </span>
                {currentPlan.partyDetails?.partyType && (
                  <span className="text-xs font-semibold text-slate-700 px-2 py-0.5 rounded-lg bg-slate-100">
                    {currentPlan.partyDetails.partyType}
                  </span>
                )}
                {currentPlan.partyDetails?.venue && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {currentPlan.partyDetails.venue}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                {currentPlan.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {currentPlan.themeDescription}
              </p>

              {/* Badges strip */}
              <div className="flex items-center flex-wrap gap-3 pt-2 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    <strong>{currentPlan.partyDetails?.adults || 12}</strong> Adults
                    {(currentPlan.partyDetails?.kids || 0) > 0 && (
                      <>, <strong>{currentPlan.partyDetails?.kids}</strong> Kids</>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    <strong>{currentPlan.partyDetails?.durationHours || 3}</strong> Hours
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Target: <strong>${targetBudget}</strong> (Current: ${currentTotalCost.toFixed(0)})
                  </span>
                </div>

                {currentPlan.partyDetails?.dietary && currentPlan.partyDetails.dietary.length > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{currentPlan.partyDetails.dietary.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-row lg:flex-col gap-2 shrink-0">
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-200 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Consult CymbalMart Agent</span>
              </button>

              <button
                onClick={() => setIsNewPartyOpen(true)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Redefine Event</span>
              </button>
            </div>
          </div>
        </section>

        {/* VIEW CONDITIONAL: CUJ STAGE 3 (Refine & Checkout) vs CUJ STAGE 2 (Review List & Tabs) */}
        {cujStep === 'refine_checkout' ? (
          <RefineAndCheckoutView
            plan={currentPlan}
            items={items}
            targetBudget={targetBudget}
            onUpdateItems={(newItems) => setItems(newItems)}
            onOpenChat={() => setIsChatOpen(true)}
            onSelectStep={(step) => setCujStep(step)}
          />
        ) : (
          <div>
            {/* Sub-tab Navigation for Review & Analytics */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'checklist'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Curated Shopping List</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      activeTab === 'checklist' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {purchasedCount}/{totalCount}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('calculator')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'calculator'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  <span>Portion Math</span>
                </button>

                <button
                  onClick={() => setActiveTab('budget')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'budget'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Budget & Aisles</span>
                </button>

                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'timeline'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Host Timeline</span>
                </button>
              </div>

              {/* Next Step Shortcut Button */}
              <button
                onClick={() => setCujStep('refine_checkout')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active Tab Content */}
            {activeTab === 'checklist' && (
              <div>
                {/* Portions summary card */}
                {currentPlan.calculatedPortions && (
                  <PortionCalculatorCard
                    portions={currentPlan.calculatedPortions}
                    adults={currentPlan.partyDetails?.adults || 12}
                    kids={currentPlan.partyDetails?.kids || 0}
                    durationHours={currentPlan.partyDetails?.durationHours || 3}
                  />
                )}

                <ShoppingListView
                  items={items}
                  targetBudget={targetBudget}
                  onTogglePurchased={handleTogglePurchased}
                  onDeleteItem={handleDeleteItem}
                  onUpdateItem={handleUpdateItem}
                  onAddItem={handleAddItem}
                  onOpenSubstitute={(item) => setSubstituteItem(item)}
                  onProceedToCheckout={() => setCujStep('refine_checkout')}
                />
              </div>
            )}

            {activeTab === 'calculator' && currentPlan.calculatedPortions && (
              <div className="space-y-6">
                <PortionCalculatorCard
                  portions={currentPlan.calculatedPortions}
                  adults={currentPlan.partyDetails?.adults || 12}
                  kids={currentPlan.partyDetails?.kids || 0}
                  durationHours={currentPlan.partyDetails?.durationHours || 3}
                />

                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <span>📐</span> CymbalMart Procurement Math Formulas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                    <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                      <h4 className="font-bold text-blue-900 mb-1">Ice Rule (1.5 lbs/guest)</h4>
                      <p className="leading-relaxed">
                        Covers beverage service and secondary drink bath. Buy in final 2 hours before event.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                      <h4 className="font-bold text-purple-900 mb-1">Drink Pacing Ratio</h4>
                      <p className="leading-relaxed">
                        2 drinks for the 1st hour excitement, followed by 1 drink per hour. Ensure 35% non-alcoholic options.
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                      <h4 className="font-bold text-amber-900 mb-1">Tableware Reserve (+25%)</h4>
                      <p className="leading-relaxed">
                        25% buffer guarantees guests never run out of fresh plates or forks between courses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'budget' && (
              <BudgetAnalyticsCard
                plan={currentPlan}
                items={items}
                targetBudget={targetBudget}
              />
            )}

            {activeTab === 'timeline' && currentPlan.prepTimeline && (
              <PrepTimelineView
                timeline={currentPlan.prepTimeline}
                signatureTip={currentPlan.signatureTip}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button for Agent Assistant */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5 font-bold text-xs"
        title="Consult CymbalMart Shopping Agent"
      >
        <Sparkles className="w-5 h-5 text-amber-300" />
        <span className="hidden sm:inline">Ask CymbalMart Agent</span>
      </button>

      {/* Modals & Drawers */}
      <PartyFormModal
        isOpen={isNewPartyOpen}
        onClose={() => setIsNewPartyOpen(false)}
        onSubmit={handleGeneratePlan}
        isLoading={isLoading}
      />

      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      <AgentChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentPlan={currentPlan}
        onAddItem={handleAddItem}
        onRemoveItemByName={handleRemoveItemByName}
      />

      <SubstituteModal
        item={substituteItem}
        isOpen={!!substituteItem}
        onClose={() => setSubstituteItem(null)}
        onApplySwap={handleApplySwap}
      />

      <ExportModal
        plan={currentPlan}
        items={items}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
