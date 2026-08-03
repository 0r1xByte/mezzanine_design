export interface Project {
  id: string;
  name: string;
  client: string;
  usageType: 'storage' | 'office' | 'retail';
  status: 'enquiry' | 'draft' | 'reviewed' | 'quoted';
  createdAt: string;
}
