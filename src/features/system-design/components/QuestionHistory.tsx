'use client';

import type { ConstructiveQuestion, QuestionAnswer } from '../types/layer1.types';

interface QuestionHistoryProps {
  questions: ConstructiveQuestion[];
  qaHistory: QuestionAnswer[];
}

export function QuestionHistory({ questions, qaHistory }: QuestionHistoryProps) {
  if (qaHistory.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500">
        No questions answered yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Q&A History</h3>
      <div className="flex flex-col gap-4">
        {qaHistory.map((qa) => {
          const q = questions.find((q) => q.id === qa.questionId);
          return (
            <div key={qa.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="font-semibold text-slate-800 mb-2">Q: {q?.question || 'Unknown question'}</p>
              <div className="rounded-xl bg-white p-3 border border-slate-100 text-slate-700">
                A: {qa.answer}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
