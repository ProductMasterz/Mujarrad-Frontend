'use client';

import type { SystemUnderstanding } from '../types/layer1.types';

export function Layer1UnderstandingPanel({ understanding }: { understanding: SystemUnderstanding }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
        System Understanding
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
          Confidence: {Math.round(understanding.confidence * 100)}%
        </span>
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-1">Goal</h4>
          <p className="text-slate-600 text-sm">{understanding.goal || 'Not specified yet'}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-1">Primary Users</h4>
            {understanding.primaryUsers.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-slate-600">
                {understanding.primaryUsers.map((u, i) => <li key={i}>{u}</li>)}
              </ul>
            ) : <p className="text-sm text-slate-400">None identified</p>}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-1">Roles</h4>
            {understanding.roles.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-slate-600">
                {understanding.roles.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            ) : <p className="text-sm text-slate-400">None identified</p>}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-1">Key Entities</h4>
          {understanding.entities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {understanding.entities.map(e => (
                <span key={e.id} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded border border-emerald-200">
                  {e.name}
                </span>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400">None identified</p>}
        </div>
      </div>
    </div>
  );
}
