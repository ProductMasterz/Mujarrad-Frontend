import { NodeType } from '@/types/backend-dtos';
import { nodeService } from './node.service';


export const conversationService = {
  async createConversation(spaceSlug: string) {
    const today = new Date().toISOString().split('T')[0];

    return nodeService.createNode(spaceSlug, {
      title: `Chat - ${today}`,
      content: '',
      nodeType: NodeType.CONVERSATION,
    });
  },
};