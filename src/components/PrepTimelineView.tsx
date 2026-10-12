import React, { useState } from 'react';
import { Calendar, CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import { PrepMilestone } from '../types/planner';

interface PrepTimelineViewProps {
  timeline: PrepMilestone[];
  signatureTip?: string;
}

export const PrepTimelineView: React.FC<PrepTimelineViewProps> = ({
  timeline,
  signatureTip,
}) => {
  // Track completed tasks locally
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (taskKey: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  const totalTasks = timeline.reduce((sum, m) => sum + m.tasks.length, 0);
  const completedCount = Object.values(completedTasks).filter(Boolean).length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-base text-slate-900">Host Prep & Procurement Countdown</h3>
          </div>
          <p className="text-xs text-slate-500">
            Chronological task schedule so nothing is forgotten and shopping happens at the optimal time
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {completedCount} of {totalTasks} Tasks Completed
          </span>
        </div>
      </div>

      {/* Signature Tip Callout */}
      {signatureTip && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/70 flex items-start gap-3">
          <div className="p-1.5 rounded-xl bg-rose-500 text-white shadow-xs shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
              Signature Host Secret
            </h4>
            <p className="text-xs text-rose-950 mt-0.5 leading-relaxed font-medium">
              {signatureTip}
            </p>
          </div>
        </div>
      )}

      {/* Timeline Steps */}
      <div className="mt-6 space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
        {timeline.map((milestone, mIdx) => (
          <div key={mIdx} className="relative pl-9 space-y-2">
            {/* Timeline Node Icon */}
            <div className="absolute left-1.5 top-0.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black ring-4 ring-white shadow-xs">
              {mIdx + 1}
            </div>

            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                {milestone.timeframe}
              </h4>
              <span className="text-[11px] text-slate-400 font-medium">
                {milestone.tasks.length} action items
              </span>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 space-y-2">
              {milestone.tasks.map((task, tIdx) => {
                const taskKey = `${mIdx}-${tIdx}`;
                const isDone = !!completedTasks[taskKey];

                return (
                  <div
                    key={tIdx}
                    onClick={() => toggleTask(taskKey)}
                    className="flex items-start gap-2.5 p-1.5 rounded-xl hover:bg-white transition-colors cursor-pointer"
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-indigo-600 shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <span
                      className={`text-xs font-medium leading-relaxed ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {task}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
