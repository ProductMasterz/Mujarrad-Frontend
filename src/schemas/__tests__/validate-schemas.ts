import { describe, it, expect } from '@jest/globals';
import { registerSchema, loginSchema } from '../auth.schema';
import { createSpaceSchema, updateSpaceSchema } from '../space.schema';
import { createNodeSchema, updateNodeSchema } from '../node.schema';
import {
  createAttributeSchema,
  attributeKeyLabels,
  attributeKeyDescriptions,
} from '../attribute.schema';
import { restoreVersionSchema, compareVersionsSchema } from '../version.schema';
import { NodeType, AttributeKey } from '@/types/backend-dtos';

describe('schema validation smoke tests', () => {
  it('parses representative valid payloads', () => {
    expect(
      registerSchema.parse({
        username: 'john_doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      })
    ).toBeTruthy();

    expect(
      loginSchema.parse({
        email: 'john@example.com',
        password: 'password123',
      })
    ).toBeTruthy();

    expect(
      createSpaceSchema.parse({
        name: 'My Space',
        slug: 'my-space',
        description: 'A test space',
      })
    ).toBeTruthy();

    expect(
      updateSpaceSchema.parse({
        name: 'Updated Space',
      })
    ).toBeTruthy();

    expect(
      createNodeSchema.parse({
        title: 'My Node',
        nodeType: NodeType.REGULAR,
        markdownContent: '# Hello World',
        nodeDetails: { key: 'value' },
      })
    ).toBeTruthy();

    expect(
      updateNodeSchema.parse({
        title: 'Updated Title',
        version: 2,
      })
    ).toBeTruthy();

    expect(
      createAttributeSchema.parse({
        targetNodeId: 123,
        attributeKey: AttributeKey.CONTAINS,
        attributeValue: 'test value',
        metadata: { key: 'value' },
      })
    ).toBeTruthy();

    expect(
      restoreVersionSchema.parse({
        versionId: 5,
        confirmation: true,
      })
    ).toBeTruthy();

    expect(
      compareVersionsSchema.parse({
        versionA: 1,
        versionB: 2,
      })
    ).toBeTruthy();
  });

  it('exports attribute label and description maps', () => {
    expect(Object.keys(attributeKeyLabels).length).toBeGreaterThan(0);
    expect(Object.keys(attributeKeyDescriptions).length).toBeGreaterThan(0);
  });
});