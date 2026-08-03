import type { ProjectSummary } from '../data/mock';
import './TitleBlock.css';

interface TitleBlockProps {
  project: ProjectSummary;
  extraFields?: { label: string; value: string }[];
}

export function TitleBlock({ project, extraFields }: TitleBlockProps) {
  const fields = extraFields ?? [
    { label: 'Revision', value: project.revision },
    { label: 'Code / Region', value: project.codeRegion },
    { label: 'Updated', value: project.updated },
  ];

  return (
    <div className="titleblock">
      <div>
        <span className="tb-label">Project</span>
        <span className="tb-value">{project.name}</span>
      </div>
      <div>
        <span className="tb-label">Client</span>
        <span className="tb-value">{project.client}</span>
      </div>
      {fields.map((field) => (
        <div key={field.label}>
          <span className="tb-label">{field.label}</span>
          <span className="tb-value mono">{field.value}</span>
        </div>
      ))}
      <div>
        <span className={`status-pill status-${project.status}`}>
          {project.status === 'draft' ? 'Draft' : 'Checked'}
        </span>
      </div>
    </div>
  );
}
