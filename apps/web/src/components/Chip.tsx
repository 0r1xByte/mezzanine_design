import './Chip.css';

interface ChipProps {
  status: 'pass' | 'review';
}

export function Chip({ status }: ChipProps) {
  return <span className={`chip ${status}`}>{status === 'pass' ? 'Pass' : 'Re-sized'}</span>;
}
