import { NodeType } from '@/types';
import { nodeService } from './node.service';


export const conversationService = {
  async createConversation(spaceSlug: string) {
    const today = new Date().toISOString().split('T')[0];
    return nodeService.createNode(spaceSlug, {
      //2. Title includes date
      title: `Chat - ${today}`,
      content: '',
      nodeType: NodeType.REGULAR, 
      nodeDetails: {
         type: 'conversation', 
      },
    });
  },
};