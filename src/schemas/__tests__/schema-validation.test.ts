import { describe, it, expect } from '@jest/globals';
import { registerSchema, loginSchema } from '../auth.schema';
import { createSpaceSchema, updateSpaceSchema } from '../space.schema';
import { createNodeSchema, updateNodeSchema } from '../node.schema';
import { createAttributeSchema } from '../attribute.schema';
import { restoreVersionSchema, compareVersionsSchema } from '../version.schema';
import { NodeType, AttributeKey } from '@/types/backend-dtos';

describe('Auth Schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const validData = {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };
      expect(() => registerSchema.parse(validData)).not.toThrow();
    });

    it('should reject username with invalid characters', () => {
      const invalidData = {
        username: 'john@doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        confirmPassword: 'SecurePass123',
      };
      expect(() => registerSchema.parse(invalidData)).toThrow(
        'Username can only contain letters, numbers, hyphens, and underscores'
      );
    });

    it('should reject password without uppercase letter', () => {
      const invalidData = {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'securepass123',
        confirmPassword: 'securepass123',
      };
      expect(() => registerSchema.parse(invalidData)).toThrow(
        'Password must contain at least one uppercase letter'
      );
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'SecurePass123',
        confirmPassword: 'DifferentPass123',
      };
      expect(() => registerSchema.parse(invalidData)).toThrow("Passwords don't match");
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123',
      };
      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow('Invalid email address');
    });
  });
});

describe('Space Schemas', () => {
  describe('createSpaceSchema', () => {
    it('should validate valid space data', () => {
      const validData = {
        name: 'My Space',
        slug: 'my-space',
        description: 'A test space',
      };
      expect(() => createSpaceSchema.parse(validData)).not.toThrow();
    });

    it('should trim whitespace from name', () => {
      const data = {
        name: '  My Space  ',
        slug: 'my-space',
      };
      const result = createSpaceSchema.parse(data);
      expect(result.name).toBe('My Space');
    });

    it('should reject slug with uppercase letters', () => {
      const invalidData = {
        name: 'My Space',
        slug: 'My-Space',
      };
      expect(() => createSpaceSchema.parse(invalidData)).toThrow(
        'Slug can only contain lowercase letters, numbers, and hyphens'
      );
    });

    it('should reject slug not starting with letter', () => {
      const invalidData = {
        name: 'My Space',
        slug: '123-space',
      };
      expect(() => createSpaceSchema.parse(invalidData)).toThrow(
        'Slug must start with a letter'
      );
    });
  });

  describe('updateSpaceSchema', () => {
    it('should validate partial update data', () => {
      const validData = {
        name: 'Updated Name',
      };
      expect(() => updateSpaceSchema.parse(validData)).not.toThrow();
    });

    it('should allow empty object', () => {
      expect(() => updateSpaceSchema.parse({})).not.toThrow();
    });
  });
});

describe('Node Schemas', () => {
  describe('createNodeSchema', () => {
    it('should validate valid node data', () => {
      const validData = {
        title: 'My Node',
        nodeType: NodeType.REGULAR,
        markdownContent: '# Hello World',
        nodeDetails: { key: 'value' },
      };
      expect(() => createNodeSchema.parse(validData)).not.toThrow();
    });

    it('should allow markdownContent to be omitted', () => {
      const data = {
        title: 'My Node',
        nodeType: NodeType.CONTEXT,
      };
      const result = createNodeSchema.parse(data);
      expect(result.markdownContent).toBeUndefined();
    });

    it('should reject invalid node type', () => {
      const invalidData = {
        title: 'My Node',
        nodeType: 'INVALID_TYPE',
      };
      expect(() => createNodeSchema.parse(invalidData)).toThrow('Invalid node type');
    });

    it('should reject title exceeding max length', () => {
      const invalidData = {
        title: 'a'.repeat(201),
        nodeType: NodeType.REGULAR,
      };
      expect(() => createNodeSchema.parse(invalidData)).toThrow(
        'Title must not exceed 200 characters'
      );
    });
  });

  describe('updateNodeSchema', () => {
    it('should validate partial update with version', () => {
      const validData = {
        title: 'Updated Title',
        version: 2,
      };
      expect(() => updateNodeSchema.parse(validData)).not.toThrow();
    });

    it('should require positive version number', () => {
      const invalidData = {
        title: 'Updated Title',
        version: 0,
      };
      expect(() => updateNodeSchema.parse(invalidData)).toThrow('Version must be positive');
    });

    it('should require integer version', () => {
      const invalidData = {
        title: 'Updated Title',
        version: 1.5,
      };
      expect(() => updateNodeSchema.parse(invalidData)).toThrow('Version must be an integer');
    });
  });
});

describe('Attribute Schema', () => {
  describe('createAttributeSchema', () => {
    it('should validate valid attribute data', () => {
      const validData = {
        targetNodeId: 123,
        attributeKey: AttributeKey.CONTAINS,
        attributeValue: 'test value',
        metadata: { key: 'value' },
      };
      expect(() => createAttributeSchema.parse(validData)).not.toThrow();
    });

    it('should allow optional attributeValue and metadata', () => {
      const validData = {
        targetNodeId: 123,
        attributeKey: AttributeKey.REFERENCES,
      };
      expect(() => createAttributeSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid attribute key', () => {
      const invalidData = {
        targetNodeId: 123,
        attributeKey: 'invalid_key',
      };
      expect(() => createAttributeSchema.parse(invalidData)).toThrow('Invalid relationship type');
    });

    it('should reject negative targetNodeId', () => {
      const invalidData = {
        targetNodeId: -1,
        attributeKey: AttributeKey.CONTAINS,
      };
      expect(() => createAttributeSchema.parse(invalidData)).toThrow(
        'Target node ID must be positive'
      );
    });
  });
});

describe('Version Schemas', () => {
  describe('restoreVersionSchema', () => {
    it('should validate valid restore data', () => {
      const validData = {
        versionId: 5,
        confirmation: true,
      };
      expect(() => restoreVersionSchema.parse(validData)).not.toThrow();
    });

    it('should reject unconfirmed restoration', () => {
      const invalidData = {
        versionId: 5,
        confirmation: false,
      };
      expect(() => restoreVersionSchema.parse(invalidData)).toThrow(
        'You must confirm the restoration'
      );
    });
  });

  describe('compareVersionsSchema', () => {
    it('should validate different versions', () => {
      const validData = {
        versionA: 1,
        versionB: 2,
      };
      expect(() => compareVersionsSchema.parse(validData)).not.toThrow();
    });

    it('should reject identical versions', () => {
      const invalidData = {
        versionA: 1,
        versionB: 1,
      };
      expect(() => compareVersionsSchema.parse(invalidData)).toThrow(
        'Please select two different versions to compare'
      );
    });
  });
});