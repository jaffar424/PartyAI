import React, { useState } from 'react';
import {
  CheckCircle2,
  Truck,
  Store,
  Scissors,
  ShieldCheck,
  Users,
  CreditCard,
  Sparkles,
  ArrowRight,
  Clock,
  Printer,
  Copy,
  Check,
  MapPin,
  Tag,
} from 'lucide-react';
import { ShoppingItem, PartyPlan } from '../types/planner';

interface RefineAndCheckoutViewProps {
  plan: PartyPlan;
  items: ShoppingItem[];
  targetBudget: number;
  onUpdateItems: (newItems: ShoppingItem[]) => void;
  onOpenChat: () => void;
  onSelectStep: (step: 'define' | 'review' | 'refine_checkout') => void;
}

export const RefineAndCheckoutView: React.FC<RefineAndCheckoutViewProps> = ({
  plan,
  items,
  targetBudget,
  onUpdateItems,
  onOpenChat,
  onSelectStep,
}) => {
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'curbside' | 'delivery' | 'in_store'>('curbside');
  const [pickupSlot, setPickupSlot] = useState('Today, 4:00 PM – 5:00 PM');
  const [isRewardsMember, setIsRewardsMember] = useState(true);
  const [memberId, setMemberId] = useState('CM-883194');
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  // Financial calculations
  const rawSubtotal = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const rawRollbacks = items.reduce((sum, item) => sum + (item.cymbalRollbackSavings || 0), 0);
  const memberExtraDiscount = isRewardsMember ? rawSubtotal * 0.05 : 0;
  const totalSavings = rawRollbacks + memberExtraDiscount;
  const finalSubtotal = Math.max(0, rawSubtotal - memberExtraDiscount);
  const estTax = finalSubtotal * 0.0825;
  const deliveryFee = fulfillmentMethod === 'delivery' ? (isRewardsMember ? 0 : 4.99) : 0;
  const orderTotal = finalSubtotal + estTax + deliveryFee;

  const budgetDifference = targetBudget - orderTotal;
  const isUnderBudget = budgetDifference >= 0;

  // 1-Click Budget Trimmer
  const handleTrimBudget = () => {
    // Filter out optional_splurge items first, or reduce high-cost non-essentials
    let currentTotal = items.reduce((sum, i) => sum + i.estimatedCost, 0);
    const updated = [...items];

    // Priority 1: remove splurge items
    for (let i = updated.length - 1; i >= 0; i--) {
      if (currentTotal <= targetBudget) break;
      if (updated[i].priority === 'optional_splurge') {
        currentTotal -= updated[i].estimatedCost;
        updated.splice(i, 1);
      }
    }

    // Priority 2: if still over, reduce quantities or remove recommended
    if (currentTotal > targetBudget) {
      for (let i = updated.length - 1; i >= 0; i--) {
        if (currentTotal <= targetBudget) break;
        if (updated[i].priority === 'recommended') {
          currentTotal -= updated[i].estimatedCost;
          updated.splice(i, 1);
        }
      }
    }

    onUpdateItems(updated);
  };

  // Place Order Action
  const handlePlaceOrder = () => {
    const randomCode = `CM-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(randomCode);
    setIsOrderPlaced(true);
  };

  // Receipt copy
  const handleCopyReceipt = () => {
    const receiptText = `CYMBALMART ORDER RECEIPT: #${orderId}
Event: ${plan.title}
Fulfillment: ${
      fulfillmentMethod === 'curbside'
        ? 'Express Curbside Pickup (Store #142 - Sunnyvale)'
        : fulfillmentMethod === 'delivery'
        ? '1-Hour Express Delivery'
        : 'In-Store Shopping Mode'
    }
Pickup Slot: ${pickupSlot}
Items (${items.length}):
${items.map((i) => ` - [${i.store}] ${i.name} (${i.quantity}): $${i.estimatedCost.toFixed(2)}`).join('\n')}

Subtotal: $${rawSubtotal.toFixed(2)}
CymbalMart Member Savings: -$${totalSavings.toFixed(2)}
Estimated Tax: $${estTax.toFixed(2)}
FINAL TOTAL: $${orderTotal.toFixed(2)}

Thank you for choosing CymbalMart!`;

    navigator.clipboard.writeText(receiptText);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Step 3 Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-md border border-blue-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
            CUJ Stage 3: Refine & Checkout
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2">Adjust Constraints & Finalize Order</h2>
          <p className="text-xs sm:text-sm text-blue-200 mt-1">
            Fine-tune items to hit your ${targetBudget} budget, select CymbalMart fulfillment, and lock in member savings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectStep('review')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            ← Back to List Review
          </button>
          <button
            onClick={onOpenChat}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult Agent</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Constraint Adjustment Tools */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tool 1: Budget Alignment & One-Click Trimmer */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Scissors className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Budget Constraint Optimizer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Target: ${targetBudget} • Current Order: ${orderTotal.toFixed(0)}
                  </p>
                </div>
              </div>

              <div
                className={`px-3 py-1 rounded-xl text-xs font-black ${
                  isUnderBudget
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {isUnderBudget
                  ? `✓ Under Budget by $${budgetDifference.toFixed(0)}`
                  : `⚠️ $${Math.abs(budgetDifference).toFixed(0)} Over Budget`}
              </div>
            </div>

            {/* Budget explanation card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <p className="font-medium text-slate-700">
                  {isUnderBudget
                    ? `Great job! Your curated list fits comfortably within your $${targetBudget} ceiling.`
                    : `Your current order exceeds your target budget by $${Math.abs(budgetDifference).toFixed(0)}. Trim optional items or ask the agent for private-label swaps.`}
                </p>
                <p className="text-slate-400 text-[11px]">
                  Includes estimated tax and CymbalMart Rewards discounts.
                </p>
              </div>

              {!isUnderBudget && (
                <button
                  onClick={handleTrimBudget}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Auto-Trim to Budget</span>
                </button>
              )}
            </div>
          </div>

          {/* Tool 2: Dietary & Portion Constraints */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Dietary Accommodations & Host Constraints
                </h3>
                <p className="text-xs text-slate-500">
                  Current preferences: {(plan.partyDetails?.dietary || []).join(', ') || 'Standard host menu'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block mb-1">Gluten-Free Check</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Corn tortillas, unbreaded chicken, raw veg, and seltzers are naturally safe.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block mb-1">Vegan / Plant-Based</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Beans, roasted salsas, fresh guacamole, and fresh fruits satisfy plant-based guests.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block mb-1">Portion Buffer Status</span>
                <p className="text-emerald-700 font-semibold text-[11px] leading-relaxed">
                  +25% tableware buffer & 1.5 lbs ice/guest applied.
                </p>
              </div>
            </div>
          </div>

          {/* Fulfillment Method Selector */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
                <Store className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Select CymbalMart Fulfillment
                </h3>
                <p className="text-xs text-slate-500">
                  Choose how you want to receive your party groceries and supplies
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Curbside Pickup */}
              <button
                type="button"
                onClick={() => setFulfillmentMethod('curbside')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  fulfillmentMethod === 'curbside'
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Store className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    FREE
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900">Curbside Pickup</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  CymbalMart Supercenter #142 (Ready in 2 hrs)
                </p>
              </button>

              {/* Option 2: 1-Hour Delivery */}
              <button
                type="button"
                onClick={() => setFulfillmentMethod('delivery')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  fulfillmentMethod === 'delivery'
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    1-Hour
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900">Express Delivery</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Direct to your door in refrigerated temperature bags
                </p>
              </button>

              {/* Option 3: In-Store Mode */}
              <button
                type="button"
                onClick={() => setFulfillmentMethod('in_store')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  fulfillmentMethod === 'in_store'
                    ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    Self-Run
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900">In-Store Checklist</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Use phone checklist ordered by store aisles
                </p>
              </button>
            </div>

            {/* Pickup / Delivery Time Slot */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-800">
                <Clock className="w-4 h-4 text-slate-500" /> Fulfillment Window:
              </span>
              <select
                value={pickupSlot}
                onChange={(e) => setPickupSlot(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 text-xs"
              >
                <option value="Today, 3:00 PM – 4:00 PM">Today, 3:00 PM – 4:00 PM</option>
                <option value="Today, 4:00 PM – 5:00 PM">Today, 4:00 PM – 5:00 PM (Recommended)</option>
                <option value="Today, 5:30 PM – 6:30 PM">Today, 5:30 PM – 6:30 PM</option>
                <option value="Tomorrow, 10:00 AM – 11:00 AM">Tomorrow, 10:00 AM – 11:00 AM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Order Summary & Checkout Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5 sticky top-20">
            <div className="pb-4 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                CymbalMart Checkout
              </span>
              <h3 className="font-black text-lg text-slate-900">Order Summary</h3>
              <p className="text-xs text-slate-500">
                {items.length} items curated for {plan.title}
              </p>
            </div>

            {/* CymbalMart Member Rewards Toggle */}
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-blue-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRewardsMember}
                    onChange={(e) => setIsRewardsMember(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                  />
                  <span>CymbalMart Rewards Member</span>
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white">
                  -5% Extra
                </span>
              </div>
              {isRewardsMember && (
                <div className="flex items-center gap-1.5 text-[11px] text-blue-700">
                  <span>ID:</span>
                  <input
                    type="text"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="px-2 py-0.5 rounded-md bg-white border border-blue-200 text-xs font-mono w-28"
                  />
                  <span className="text-emerald-600 font-bold">✓ Active</span>
                </div>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal ({items.length} items)</span>
                <span className="font-semibold text-slate-900">${rawSubtotal.toFixed(2)}</span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> CymbalMart Rollback & Perks
                  </span>
                  <span>-${totalSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Fulfillment Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600 font-bold">FREE</strong> : `$${deliveryFee.toFixed(2)}`}</span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Local Sales Tax (8.25%)</span>
                <span>${estTax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <div>
                  <div className="font-black text-lg text-slate-900">Total</div>
                  <div className="text-[10px] text-slate-400">Target: ${targetBudget}</div>
                </div>
                <div className="text-2xl font-black text-blue-600">
                  ${orderTotal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Finalize Button */}
            <button
              onClick={handlePlaceOrder}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-blue-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Finalize & Place CymbalMart Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-400">
              100% Satisfaction Guarantee. Easily substitute or add items up to 1 hr before pickup.
            </p>
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {isOrderPlaced && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-black">CymbalMart Order Placed!</h3>
              <p className="text-xs text-emerald-100">
                Confirmation #{orderId} • Your party groceries and supplies are locked in!
              </p>
            </div>

            {/* Modal Details */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Event:</span>
                  <strong className="text-slate-900">{plan.title}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <strong className="text-slate-900 capitalize">
                    {fulfillmentMethod === 'curbside'
                      ? 'Curbside Pickup (Store #142)'
                      : fulfillmentMethod === 'delivery'
                      ? '1-Hour Express Delivery'
                      : 'In-Store Mode'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ready Window:</span>
                  <strong className="text-emerald-700">{pickupSlot}</strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-700">Total Billed:</span>
                  <strong className="text-sm font-black text-slate-900">
                    ${orderTotal.toFixed(2)}{' '}
                    <span className="text-[11px] text-emerald-600 font-normal">
                      (Saved ${totalSavings.toFixed(2)})
                    </span>
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleCopyReceipt}
                  className="py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedReceipt ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedReceipt ? 'Copied!' : 'Copy Receipt'}</span>
                </button>

                <button
                  onClick={() => setIsOrderPlaced(false)}
                  className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
