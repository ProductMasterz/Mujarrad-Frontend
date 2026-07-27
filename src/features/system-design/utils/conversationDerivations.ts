import type {
  AdditionalRequirement,
  ClarificationChatMessage,
  ConstructiveQuestion,
  ConversationMessage,
  QuestionAnswer,
} from '../types/layer1.types';

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function asIntent(value: unknown): ClarificationChatMessage['intent'] | undefined {
  return typeof value === 'string' ? (value as ClarificationChatMessage['intent']) : undefined;
}

export function deriveQuestionAnswersFromConversation(
  conversation: ConversationMessage[]
): QuestionAnswer[] {
  return conversation
    .filter(
      (
        message
      ): message is ConversationMessage & {
        questionId: string;
        answerId: string;
      } =>
        (message.kind === 'user_input' || message.kind === 'assistant_message') &&
        Boolean(message.questionId) &&
        Boolean(message.answerId)
    )
    .map((message) => ({
      id: message.answerId,
      questionId: message.questionId,
      answer: message.content,
      createdAt: message.createdAt,
      updatedAt:
        typeof message.metadata?.editedAt === 'string' ? message.metadata.editedAt : undefined,
      assumedByAi: asBoolean(message.metadata?.assumedByAi),
    }));
}

export function deriveAdditionalRequirementsFromConversation(
  conversation: ConversationMessage[]
): AdditionalRequirement[] {
  return conversation
    .filter(
      (
        message
      ): message is ConversationMessage & {
        requirementId: string;
      } =>
        message.role === 'user' && message.kind === 'user_input' && Boolean(message.requirementId)
    )
    .map((message) => ({
      id: message.requirementId,
      text: message.content,
      createdAt: message.createdAt,
      updatedAt:
        typeof message.metadata?.editedAt === 'string' ? message.metadata.editedAt : undefined,
    }));
}

export function deriveClarificationMessagesFromConversation(
  conversation: ConversationMessage[]
): ClarificationChatMessage[] {
  return conversation
    .filter((message) => message.kind === 'user_input' || message.kind === 'assistant_message')
    .filter((message) => message.metadata?.source !== 'initial_description')
    .map((message) => ({
      id: message.id,
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content,
      intent: asIntent(message.metadata?.intent),
      createdAt: message.createdAt,
    }));
}

export function deriveAnsweredQuestionsFromConversation(
  conversation: ConversationMessage[],
  questions: ConstructiveQuestion[]
): Array<{
  answerId: string;
  questionId: string;
  question: string;
  answer: string;
  assumedByAi: boolean;
}> {
  const questionById = new Map(questions.map((question) => [question.id, question]));

  return deriveQuestionAnswersFromConversation(conversation).map((answer) => ({
    answerId: answer.id,
    questionId: answer.questionId,
    question: questionById.get(answer.questionId)?.question ?? answer.questionId,
    answer: answer.answer,
    assumedByAi: answer.assumedByAi ?? false,
  }));
}
