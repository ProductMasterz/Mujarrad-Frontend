export const FINAL_DOCUMENTATION_SECTIONS = [
  'System Overview',
  'Goals',
  'Users and Roles',
  'System Understanding',
  'Architecture',
  'Workflow',
  'Inputs and Outputs',
  'Business Rules',
  'Integrations',
  'Security',
  'Diagram Explanation',
  'Open Questions',
  'Assumptions',
] as const;

export function getFinalDocumentationSpec() {
  return FINAL_DOCUMENTATION_SECTIONS;
}