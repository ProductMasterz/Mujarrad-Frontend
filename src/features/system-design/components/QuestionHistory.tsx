'use client';

import type {
  ConstructiveQuestion,
  ConversationMessage,
} from '../types/layer1.types';
import {
  deriveAdditionalRequirementsFromConversation,
  deriveQuestionAnswersFromConversation,
} from '../utils/conversationDerivations';

interface QuestionHistoryProps {
  questions: ConstructiveQuestion[];
  conversation: ConversationMessage[];
}

export function QuestionHistory({
  questions,
  conversation,
}: QuestionHistoryProps) {
  const initialDescription = conversation.find(
    (message) =>
      message.role === 'user' &&
      message.metadata?.source === 'initial_description'
  );

  const additionalRequirements =
    deriveAdditionalRequirementsFromConversation(conversation);

  const qaHistory =
    deriveQuestionAnswersFromConversation(conversation);

  const hasHistory =
    Boolean(initialDescription) ||
    additionalRequirements.length > 0 ||
    qaHistory.length > 0;

  if (!hasHistory) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500">
        No history available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {initialDescription ? (
        <section>
          <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-700">
            Initial Description
          </h3>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {initialDescription.content}
          </div>
        </section>
      ) : null}

      {additionalRequirements.length > 0 ? (
        <section>
          <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-700">
            User Requirements
          </h3>

          <div className="space-y-3">
            {additionalRequirements.map((requirement) => (
              <div
                key={requirement.id}
                className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-slate-700"
              >
                {requirement.text}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {qaHistory.length > 0 ? (
        <section>
          <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-700">
            Q&amp;A History
          </h3>

          <div className="space-y-4">
            {qaHistory.map((qa) => {
              const question = questions.find(
                (item) => item.id === qa.questionId
              );

              return (
                <div
                  key={qa.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="mb-2 font-semibold text-slate-800">
                    Q: {question?.question ?? 'Unknown question'}
                  </p>

                  <div className="rounded-xl border border-slate-100 bg-white p-3 text-slate-700">
                    A: {qa.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
