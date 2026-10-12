import React, { useState } from 'react';
import { X, Copy, Check, Printer, FileText } from 'lucide-react';
import { PartyPlan, ShoppingItem } from '../types/planner';

interface ExportModalProps {
  plan: PartyPlan;
  items: ShoppingItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  plan,
  items,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'by_store' | 'by_category' | 'plain'>('by_store');

  if (!isOpen) return null;

  // Generate formatted text
  const generateText = () => {
    let output = `🛒 CYMBALMART PARTY SHOPPING LIST: ${plan.title}\n`;
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `Total Items: ${items.length} | Est. Cost: $${items.reduce((s, i) => s + i.estimatedCost, 0).toFixed(0)}\n`;
    if (plan.calculatedPortions) {
      output += `Ice Reserve: ${plan.calculatedPortions.iceLbs} lbs | Drinks Target: ${plan.calculatedPortions.drinkCountTotal} servings\n`;
    }
    output += `\n`;

    if (format === 'by_store') {
      const stores = Array.from(new Set(items.map((i) => i.store)));
      stores.forEach((store) => {
        const storeItems = items.filter((i) => i.store === store);
        const subtotal = storeItems.reduce((s, i) => s + i.estimatedCost, 0);
        output += `📍 ${store.toUpperCase()} (~$${subtotal.toFixed(0)}):\n`;
        storeItems.forEach((i) => {
          output += `  [${i.isPurchased ? 'x' : ' '}] ${i.name} - ${i.quantity} ($${i.estimatedCost.toFixed(2)})\n`;
        });
        output += `\n`;
      });
    } else if (format === 'by_category') {
      const cats = Array.from(new Set(items.map((i) => i.category)));
      cats.forEach((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        output += `📁 ${cat.toUpperCase()}:\n`;
        catItems.forEach((i) => {
          output += `  [${i.isPurchased ? 'x' : ' '}] ${i.name} - ${i.quantity} ($${i.estimatedCost.toFixed(2)}) @ ${i.store}\n`;
        });
        output += `\n`;
      });
    } else {
      items.forEach((i) => {
        output += `[${i.isPurchased ? 'x' : ' '}] ${i.name} (${i.quantity}) - $${i.estimatedCost.toFixed(2)} [${i.store}]\n`;
      });
    }

    if (plan.signatureTip) {
      output += `\n💡 Host Pro-Tip: ${plan.signatureTip}\n`;
    }

    return output;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Export Shopping Checklist</h3>
              <p className="text-xs text-indigo-200">Copy to phone notes, WhatsApp, or print</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Format selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setFormat('by_store')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  format === 'by_store'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                By Store Route
              </button>
              <button
                onClick={() => setFormat('by_category')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  format === 'by_category'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                By Category
              </button>
              <button
                onClick={() => setFormat('plain')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  format === 'plain'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Compact List
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Print</span>
              </button>
              <button
                onClick={handleCopy}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
          </div>

          {/* Formatted Text Preview */}
          <textarea
            readOnly
            value={generateText()}
            rows={14}
            className="w-full p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed border border-slate-800 focus:outline-hidden resize-none select-all shadow-inner"
          />

          <p className="text-[11px] text-slate-400 text-center">
            Ready to paste into Apple Notes, Google Keep, or group chat.
          </p>
        </div>
      </div>
    </div>
  );
};
