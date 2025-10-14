// src/schemas/__tests__/validate-schemas.ts
// Manual validation script to test Zod schemas

import { registerSchema, loginSchema } from '../auth.schema';
import { createSpaceSchema, updateSpaceSchema } from '../space.schema';
import { createNodeSchema, updateNodeSchema } from '../node.schema';
import { createAttributeSchema, attributeKeyLabels, attributeKeyDescriptions } from '../attribute.schema';
import { restoreVersionSchema, compareVersionsSchema } from '../version.schema';
import { NodeType, AttributeKey } from '@/types/backend-dtos';

console.log('=== Testing Zod Schemas ===\n');

// Test Auth Schemas
console.log('1. Testing Auth Schemas');
try {
  const validRegister = registerSchema.parse({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'SecurePass123',
    confirmPassword: 'SecurePass123',
  });
  console.log('   ✓ Valid registration data passed');

  const validLogin = loginSchema.parse({
    email: 'john@example.com',
    password: 'password123',
  });
  console.log('   ✓ Valid login data passed');

  try {
    registerSchema.parse({
      username: 'john@doe',
      email: 'john@example.com',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    });
    console.log('   ✗ Should have rejected invalid username');
  } catch (e: any) {
    console.log('   ✓ Correctly rejected invalid username:', e.errors[0].message);
  }

  try {
    registerSchema.parse({
      username: 'john_doe',
      email: 'john@example.com',
      password: 'SecurePass123',
      confirmPassword: 'DifferentPass123',
    });
    console.log('   ✗ Should have rejected mismatched passwords');
  } catch (e: any) {
    console.log('   ✓ Correctly rejected mismatched passwords:', e.errors[0].message);
  }
} catch (error) {
  console.error('   ✗ Auth schema test failed:', error);
}

// Test Space Schemas
console.log('\n2. Testing Space Schemas');
try {
  const validCreate = createSpaceSchema.parse({
    name: '  My Space  ',
    slug: 'my-space',
    description: 'A test space',
  });
  console.log('   ✓ Valid create space data passed');
  console.log('   ✓ Name trimmed:', validCreate.name === 'My Space');

  const validUpdate = updateSpaceSchema.parse({
    name: 'Updated Name',
  });
  console.log('   ✓ Valid update space data passed');

  try {
    createSpaceSchema.parse({
      name: 'My Space',
      slug: 'My-Space',
    });
    console.log('   ✗ Should have rejected uppercase slug');
  } catch (e: any) {
    console.log('   ✓ Correctly rejected uppercase slug:', e.errors[0].message);
  }

  try {
    createSpaceSchema.parse({
      name: 'My Space',
      slug: '123-space',
    });
    console.log('   ✗ Should have rejected slug not starting with letter');
  } catch (e: any) {
    console.log('   ✓ Correctly rejected invalid slug:', e.errors[0].message);
  }
} catch (error) {
  console.error('   ✗ Space schema test failed:', error);
}

// Test Node Schemas
console.log('\n3. Testing Node Schemas');
try {
  const validCreate = createNodeSchema.parse({
    title: 'My Node',
    nodeType: NodeType.REGULAR,
    markdownContent: '# Hello World',
    nodeDetails: { key: 'value' },
  });
  console.log('   ✓ Valid create node data passed');

  const nodeWithDefault = createNodeSchema.parse({
    title: 'My Node',
    nodeType: NodeType.CONTEXT,
  });
  console.log('   ✓ Default markdownContent applied:', nodeWithDefault.markdownContent === '');

  const validUpdate = updateNodeSchema.parse({
    title: 'Updated Title',
    version: 2,
  });
  console.log('   ✓ Valid update node data passed');

  try {
    createNodeSchema.parse({
      title: 'My Node',
      nodeType: 'INVALID_TYPE' as any,
    });
    console.log('   ✗ Should have rejected invalid node type');
  } catch (e: any) {
    console.log('   ✓ Correctly rejected invalid node type:', e.errors[0].message);
  }

  try {
    updateNodeSchema.parse({
      title: 'Updated Title',
      version: 0,
    });
    console.log('   ✗ Should have rejected version 0');
  } catch (e: any) {
    console.log('   ✓ Correctly rejected invalid version:', e.errors[0].message);
  }
} catch (error) {
  console.error('   ✗ Node schema test failed:', error);
}

// Test Attribute Schema
console.log('\n4. Testing Attribute Schema');
try {
  const validAttribute = createAttributeSchema.parse({
    targetNodeId: 123,
    attributeKey: AttributeKey.CONTAINS,
    attributeValue: 'test value',
    metadata: { key: 'value' },
  });
  console.log('   ✓ Valid attribute data passed');

  const minimalAttribute = createAttributeSchema.parse({
    targetNodeId: 123,
    attributeKey: AttributeKey.REFERENCES,
  });
  console.log('   ✓ Minimal attribute data passed (optional fields omitted)');

  console.log('   ✓ Attribute key labels:', Object.keys(attributeKeyLabels).length === 6);
  console.log('   ✓ Attribute key descriptions:', Object.keys(attributeKeyDescriptions).length === 6);

  try {
    createAttributeSchema.parse({
      targetNodeId: -1,
      attributeKey: AttributeKey.CONTAINS,
    });
    console.log('   ✗ Should have rejected negative targetNodeId');
  } catch (e: any) {
    console.log('   ✓ Correctly rejected negative ID:', e.errors[0].message);
  }
} catch (error) {
  console.error('   ✗ Attribute schema test failed:', error);
}

// Test Version Schemas
console.log('\n5. Testing Version Schemas');
try {
  const validRestore = restoreVersionSchema.parse({
    versionId: 5,
    confirmation: true,
  });
  console.log('   ✓ Valid restore version data passed');

  const validCompare = compareVersionsSchema.parse({
    versionA: 1,
    versionB: 2,
  });
  console.log('   ✓ Valid compare versions data passed');

  try {
    restoreVersionSchema.parse({
      versionId: 5,
      confirmation: false,
    });
    console.log('   ✗ Should have rejected unconfirmed restoration');
  } catch (e: any) {
    console.log('   ✓ Correctly rejected unconfirmed restoration:', e.errors[0].message);
  }

  try {
    compareVersionsSchema.parse({
      versionA: 1,
      versionB: 1,
    });
    console.log('   ✗ Should have rejected identical versions');
  } catch (e: any) {
    console.log('   ✓ Correctly rejected identical versions:', e.errors[0].message);
  }
} catch (error) {
  console.error('   ✗ Version schema test failed:', error);
}

console.log('\n=== All Schema Tests Completed ===');
