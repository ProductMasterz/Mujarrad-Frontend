// src/schemas/__tests__/react-hook-form-integration.example.tsx
// Example demonstrating React Hook Form integration with Zod schemas

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerSchema,
  loginSchema,
  createSpaceSchema,
  createNodeSchema,
  createAttributeSchema,
  type RegisterFormData,
  type LoginFormData,
  type CreateSpaceFormData,
  type CreateNodeFormData,
  type CreateAttributeFormData,
} from '../index';
import { NodeType, AttributeKey } from '@/types/backend-dtos';

/**
 * Example 1: Registration Form
 */
export function RegisterFormExample() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    console.log('Registration data:', data);
    // API call here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register('username')} placeholder="Username" />
        {errors.username && <span>{errors.username.message}</span>}
      </div>
      <div>
        <input {...register('email')} type="email" placeholder="Email" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      <div>
        <input {...register('password')} type="password" placeholder="Password" />
        {errors.password && <span>{errors.password.message}</span>}
      </div>
      <div>
        <input {...register('confirmPassword')} type="password" placeholder="Confirm Password" />
        {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      </div>
      <button type="submit">Register</button>
    </form>
  );
}

/**
 * Example 2: Login Form
 */
export function LoginFormExample() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    console.log('Login data:', data);
    // API call here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register('email')} type="email" placeholder="Email" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      <div>
        <input {...register('password')} type="password" placeholder="Password" />
        {errors.password && <span>{errors.password.message}</span>}
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

/**
 * Example 3: Create Space Form
 */
export function CreateSpaceFormExample() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSpaceFormData>({
    resolver: zodResolver(createSpaceSchema),
  });

  const onSubmit = (data: CreateSpaceFormData) => {
    console.log('Space data:', data);
    // API call here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register('name')} placeholder="Space Name" />
        {errors.name && <span>{errors.name.message}</span>}
      </div>
      <div>
        <input {...register('slug')} placeholder="space-slug" />
        {errors.slug && <span>{errors.slug.message}</span>}
      </div>
      <div>
        <textarea {...register('description')} placeholder="Description (optional)" />
        {errors.description && <span>{errors.description.message}</span>}
      </div>
      <button type="submit">Create Space</button>
    </form>
  );
}

/**
 * Example 4: Create Node Form
 */
export function CreateNodeFormExample() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateNodeFormData>({
    resolver: zodResolver(createNodeSchema),
    defaultValues: {
      nodeType: NodeType.REGULAR,
      markdownContent: '',
    },
  });

  const onSubmit = (data: CreateNodeFormData) => {
    console.log('Node data:', data);
    // API call here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register('title')} placeholder="Node Title" />
        {errors.title && <span>{errors.title.message}</span>}
      </div>
      <div>
        <select {...register('nodeType')}>
          <option value={NodeType.REGULAR}>Regular</option>
          <option value={NodeType.CONTEXT}>Context</option>
          <option value={NodeType.ASSUMPTION}>Assumption</option>
        </select>
        {errors.nodeType && <span>{errors.nodeType.message}</span>}
      </div>
      <div>
        <textarea {...register('markdownContent')} placeholder="Markdown content" />
        {errors.markdownContent && <span>{errors.markdownContent.message}</span>}
      </div>
      <button type="submit">Create Node</button>
    </form>
  );
}

/**
 * Example 5: Create Attribute Form
 */
export function CreateAttributeFormExample() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAttributeFormData>({
    resolver: zodResolver(createAttributeSchema),
  });

  const onSubmit = (data: CreateAttributeFormData) => {
    console.log('Attribute data:', data);
    // API call here
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          {...register('targetNodeId', { valueAsNumber: true })}
          type="number"
          placeholder="Target Node ID"
        />
        {errors.targetNodeId && <span>{errors.targetNodeId.message}</span>}
      </div>
      <div>
        <select {...register('attributeKey')}>
          <option value={AttributeKey.CONTAINS}>Contains</option>
          <option value={AttributeKey.DEPENDS_ON}>Depends On</option>
          <option value={AttributeKey.REFERENCES}>References</option>
          <option value={AttributeKey.TRIGGERS}>Triggers</option>
          <option value={AttributeKey.NEXT}>Next</option>
          <option value={AttributeKey.CALLS}>Calls</option>
        </select>
        {errors.attributeKey && <span>{errors.attributeKey.message}</span>}
      </div>
      <div>
        <input {...register('attributeValue')} placeholder="Attribute Value (optional)" />
        {errors.attributeValue && <span>{errors.attributeValue.message}</span>}
      </div>
      <button type="submit">Create Relationship</button>
    </form>
  );
}

/**
 * Usage Notes:
 *
 * 1. The zodResolver automatically validates form data against the schema
 * 2. Type safety is provided through TypeScript inference from Zod schemas
 * 3. Error messages from Zod are automatically mapped to form fields
 * 4. Use valueAsNumber for numeric inputs with register()
 * 5. Default values can be set in useForm() options
 * 6. All validation runs client-side before submission
 *
 * Best Practices:
 * - Always use the inferred types (e.g., RegisterFormData) for type safety
 * - Display error messages for all fields
 * - Consider using controlled components for complex inputs
 * - Add loading states during form submission
 * - Handle API errors separately from validation errors
 */
