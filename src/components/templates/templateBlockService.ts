import { attributeService } from '@/services/api/attribute.service';
import { nodeService } from '@/services/api/node.service';
import {
  AttributeKey,
  AttributeTypeMode,
  NodeType,
} from '@/types/backend-dtos';
import type { BlockNodeDetails } from '@/components/blocks/types';
import type { TemplateBlockDefinition } from './nodeTemplates';

type CreateTemplateBlocksOptions = {
  spaceSlug: string;
  pageId: string;
  blocks: TemplateBlockDefinition[];
  startOrder?: number;
};

export async function createTemplateBlocks({
  spaceSlug,
  pageId,
  blocks,
  startOrder = 1000,
}: CreateTemplateBlocksOptions) {
  const createdBlocks = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const templateBlock = blocks[index];
    const order = startOrder + index * 1000;

    const nodeDetails: BlockNodeDetails = {
      blockType: templateBlock.type,
      showInSpaceList: false,
      ...(templateBlock.checked !== undefined
        ? { checked: templateBlock.checked }
        : {}),
      ...(templateBlock.language ? { language: templateBlock.language } : {}),
      ...(templateBlock.calloutType
        ? { calloutType: templateBlock.calloutType }
        : {}),
    };

    const blockNode = await nodeService.createNode(spaceSlug, {
      title: `Block ${Date.now()}-${index}`,
      nodeType: NodeType.REGULAR,
      content: templateBlock.content,
      nodeDetails: nodeDetails as unknown as Record<string, unknown>,
    });

    await attributeService.createAttribute(pageId, {
      sourceNodeId: pageId,
      targetNodeId: blockNode.id,
      attributeType: AttributeKey.CONTAINS,
      attributeTypeMode: AttributeTypeMode.SCHEMALESS,
      attributeName: AttributeKey.CONTAINS,
      attributeValue: { order },
    });

    createdBlocks.push({
      id: blockNode.id,
      type: templateBlock.type,
      content: templateBlock.content,
      order,
      checked: templateBlock.checked,
      language: templateBlock.language,
      calloutType: templateBlock.calloutType,
    });
  }

  return createdBlocks;
}

type DeleteBlocksOptions = {
  spaceSlug: string;
  blockIds: string[];
};

export async function deleteBlocks({
  spaceSlug,
  blockIds,
}: DeleteBlocksOptions) {
  await Promise.all(
    blockIds.map((blockId) => nodeService.deleteNode(spaceSlug, blockId))
  );
}