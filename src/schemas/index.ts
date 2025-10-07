// src/schemas/index.ts
// Barrel export for all validation schemas

export {
  registerSchema,
  loginSchema,
  type RegisterFormData,
  type LoginFormData,
} from './auth.schema';

export {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteCollaboratorSchema,
  type CreateWorkspaceFormData,
  type UpdateWorkspaceFormData,
  type InviteCollaboratorFormData,
} from './workspace.schema';

export {
  createNodeSchema,
  updateNodeSchema,
  type CreateNodeFormData,
  type UpdateNodeFormData,
} from './node.schema';

export {
  createAttributeSchema,
  attributeKeyLabels,
  attributeKeyDescriptions,
  type CreateAttributeFormData,
} from './attribute.schema';

export {
  restoreVersionSchema,
  compareVersionsSchema,
  type RestoreVersionFormData,
  type CompareVersionsFormData,
} from './version.schema';
