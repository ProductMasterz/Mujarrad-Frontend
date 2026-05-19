# Validation Schemas Documentation

This directory contains all Zod validation schemas for form inputs in the Mujarrad Knowledge Graph Frontend application.

## Overview

All schemas are built using [Zod](https://zod.dev/) and integrated with [React Hook Form](https://react-hook-form.com/) via [@hookform/resolvers](https://github.com/react-hook-form/resolvers).

## File Structure

```
src/schemas/
├── index.ts                  # Barrel export for all schemas
├── auth.schema.ts            # Authentication forms (register, login)
├── space.schema.ts       # Space forms (create, update)
├── node.schema.ts            # Node forms (create, update)
├── attribute.schema.ts       # Relationship/attribute forms
├── version.schema.ts         # Version management forms
└── __tests__/
    ├── validate-schemas.ts                      # Manual validation tests
    ├── schema-validation.test.ts                # Vitest unit tests
    └── react-hook-form-integration.example.tsx  # Integration examples
```

## Schemas

### 1. Authentication Schemas (`auth.schema.ts`)

#### `registerSchema`
Validates user registration form data.

**Fields:**
- `username`: 3-50 characters, alphanumeric with hyphens/underscores only
- `email`: Valid email address, max 255 characters
- `password`: 8-100 characters, must contain uppercase, lowercase, and number
- `confirmPassword`: Must match password field

**Type:** `RegisterFormData`

#### `loginSchema`
Validates user login form data.

**Fields:**
- `email`: Valid email address, max 255 characters
- `password`: Required, any non-empty string

**Type:** `LoginFormData`

---

### 2. Space Schemas (`space.schema.ts`)

#### `createSpaceSchema`
Validates space creation form data.

**Fields:**
- `name`: Required, 1-100 characters, automatically trimmed
- `slug`: 3-50 characters, lowercase letters/numbers/hyphens only, must start with letter
- `description`: Optional, max 500 characters

**Type:** `CreateSpaceFormData`

#### `updateSpaceSchema`
Validates space update form data.

**Fields:**
- `name`: Optional, 1-100 characters, automatically trimmed
- `description`: Optional, max 500 characters

**Type:** `UpdateSpaceFormData`

---

### 3. Node Schemas (`node.schema.ts`)

#### `createNodeSchema`
Validates node creation form data.

**Fields:**
- `title`: Required, 1-200 characters, automatically trimmed
- `nodeType`: Must be valid `NodeType` enum (REGULAR, CONTEXT, ASSUMPTION)
- `markdownContent`: Max 50,000 characters, defaults to empty string
- `nodeDetails`: Optional JSON object

**Type:** `CreateNodeFormData`

#### `updateNodeSchema`
Validates node update form data.

**Fields:**
- `title`: Optional, 1-200 characters, automatically trimmed
- `nodeType`: Optional, must be valid `NodeType` enum
- `markdownContent`: Optional, max 50,000 characters
- `nodeDetails`: Optional JSON object
- `version`: Required positive integer for optimistic locking

**Type:** `UpdateNodeFormData`

---

### 4. Attribute Schema (`attribute.schema.ts`)

#### `createAttributeSchema`
Validates relationship/attribute creation form data.

**Fields:**
- `targetNodeId`: Required positive integer
- `attributeKey`: Must be valid `AttributeKey` enum (contains, depends_on, references, triggers, next, calls)
- `attributeValue`: Optional, max 1,000 characters
- `metadata`: Optional JSON object

**Type:** `CreateAttributeFormData`

**Helpers:**
- `attributeKeyLabels`: Human-readable labels for each relationship type
- `attributeKeyDescriptions`: Detailed descriptions for each relationship type

---

### 5. Version Schemas (`version.schema.ts`)

#### `restoreVersionSchema`
Validates version restoration form data.

**Fields:**
- `versionId`: Required positive integer
- `confirmation`: Must be `true` (forces explicit user confirmation)

**Type:** `RestoreVersionFormData`

#### `compareVersionsSchema`
Validates version comparison form data.

**Fields:**
- `versionA`: Required positive integer
- `versionB`: Required positive integer, must be different from versionA

**Type:** `CompareVersionsFormData`

---

## Usage with React Hook Form

### Basic Example

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/schemas';

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    // API call with validated data
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} type="email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

### Advanced Example with Numeric Fields

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAttributeSchema, type CreateAttributeFormData } from '@/schemas';

function CreateAttributeForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateAttributeFormData>({
    resolver: zodResolver(createAttributeSchema),
  });

  const onSubmit = async (data: CreateAttributeFormData) => {
    await createAttribute(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('targetNodeId', { valueAsNumber: true })}
        type="number"
      />
      {errors.targetNodeId && <span>{errors.targetNodeId.message}</span>}

      <select {...register('attributeKey')}>
        <option value="contains">Contains</option>
        <option value="depends_on">Depends On</option>
        {/* ... */}
      </select>

      <button type="submit">Create</button>
    </form>
  );
}
```

## Validation Features

### String Validation
- **Min/Max length**: Enforced with custom error messages
- **Regex patterns**: Username, slug, password complexity
- **Auto-trimming**: Applied to name and title fields using `.trim()`
- **Email validation**: Built-in Zod email validator

### Number Validation
- **Type coercion**: Use `valueAsNumber: true` in register()
- **Integer validation**: `.int()` for whole numbers only
- **Positive validation**: `.positive()` for IDs and versions

### Enum Validation
- **Native enum support**: Uses `z.nativeEnum()` for TypeScript enums
- **Custom error messages**: Clear feedback for invalid enum values

### Cross-field Validation
- **Password confirmation**: Uses `.refine()` to compare password fields
- **Version comparison**: Ensures two different versions are selected

### Optional Fields
- **Explicit optionals**: Fields marked `.optional()` can be omitted
- **Defaults**: Some fields have default values (e.g., `markdownContent: ''`)

## Error Messages

All schemas include user-friendly error messages:

```typescript
// Example error messages
"Username must be at least 3 characters"
"Email must not exceed 255 characters"
"Password must contain at least one uppercase letter"
"Passwords don't match"
"Slug can only contain lowercase letters, numbers, and hyphens"
"Invalid node type"
"Version must be positive"
```

## Testing

Run the validation test script:

```bash
npx tsx src/schemas/__tests__/validate-schemas.ts
```

This will test all schemas with valid and invalid data to ensure proper validation.

## Best Practices

1. **Always use inferred types**: Export and use `z.infer<typeof schema>` types
2. **Display all errors**: Show validation messages for every field
3. **Handle numeric inputs correctly**: Use `valueAsNumber: true` for number fields
4. **Set sensible defaults**: Use `defaultValues` in `useForm()` options
5. **Validate on client and server**: These schemas validate client-side; always validate on backend too
6. **Keep messages user-friendly**: All error messages should be clear and actionable

## Dependencies

- `zod`: ^3.22.4
- `@hookform/resolvers`: ^3.3.4
- `react-hook-form`: ^7.49.3

## Related Files

- Type definitions: `src/types/backend-dtos.ts`
- API client: `src/lib/api/client.ts` (uses validated data)
- Form components: Will use these schemas for validation
