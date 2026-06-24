'use client';

import { useState } from 'react';
import type { ConstructiveQuestion } from '../types/layer1.types';

interface QuestionCardProps {
  question: ConstructiveQuestion;
  onSubmit: (answer: string) => void;
  isLoading: boolean;
}

export function QuestionCard({ question, onSubmit, isLoading }: QuestionCardProps) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isLoading) return;
    onSubmit(answer);
    setAnswer('');
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 uppercase tracking-wide">
          {question.category.replace('_', ' ')}
        </span>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{question.question}</h3>
      <p className="text-sm text-slate-500 mb-6 italic">Reason: {question.reasonForAsking}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full rounded-xl border border-slate-300 p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!answer.trim() || isLoading}
          className="self-end rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Submitting...' : 'Submit Answer'}
        </button>
      </form>
    </div>
  );
}
