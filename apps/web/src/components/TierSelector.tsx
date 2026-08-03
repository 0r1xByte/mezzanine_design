import './TierSelector.css';

interface TierSelectorProps {
  count: number;
  active: number;
  onSelect: (index: number) => void;
}

export function TierSelector({ count, active, onSelect }: TierSelectorProps) {
  if (count <= 1) return null;
  return (
    <div className="tier-selector">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          className={`tier-selector-btn ${i === active ? 'active' : ''}`}
          onClick={() => onSelect(i)}
        >
          Tier {i + 1}
        </button>
      ))}
    </div>
  );
}
