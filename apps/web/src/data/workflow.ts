export type WorkflowStepId =
  | 'enquiry'
  | 'geometry'
  | 'loads'
  | 'design'
  | 'pricing'
  | 'quote'
  | 'drawings';

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
}

export const workflowSteps: WorkflowStep[] = [
  { id: 'enquiry', label: 'Enquiry' },
  { id: 'geometry', label: 'Geometry' },
  { id: 'loads', label: 'Loads' },
  { id: 'design', label: 'Design & BOM' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'quote', label: 'Quote' },
  { id: 'drawings', label: 'Drawings' },
];
