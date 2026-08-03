import './TitleBlock.css';

interface TitleBlockProps {
  name: string;
  client: string;
  status: 'draft' | 'reviewed';
  extraFields: { label: string; value: string }[];
}

export function TitleBlock({ name, client, status, extraFields }: TitleBlockProps) {
  return (
    <div className="titleblock">
      <div>
        <span className="tb-label">Project</span>
        <span className="tb-value">{name}</span>
      </div>
      <div>
        <span className="tb-label">Client</span>
        <span className="tb-value">{client}</span>
      </div>
      {extraFields.map((field) => (
        <div key={field.label}>
          <span className="tb-label">{field.label}</span>
          <span className="tb-value mono">{field.value}</span>
        </div>
      ))}
      <div>
        <span className={`status-pill status-${status}`}>{status === 'draft' ? 'Draft' : 'Checked'}</span>
      </div>
    </div>
  );
}
