import { workflowSteps, type WorkflowStepId } from '../data/mock';
import './WorkflowRail.css';

interface WorkflowRailProps {
  activeStep: WorkflowStepId;
  onSelect: (step: WorkflowStepId) => void;
}

export function WorkflowRail({ activeStep, onSelect }: WorkflowRailProps) {
  const activeIndex = workflowSteps.findIndex((step) => step.id === activeStep);

  return (
    <nav className="rail" aria-label="Design workflow">
      <div className="rail-group-label">Workflow</div>
      {workflowSteps.map((step, index) => {
        const state = index < activeIndex ? 'done' : index === activeIndex ? 'active' : '';
        return (
          <button
            key={step.id}
            type="button"
            className={`rail-step ${state}`}
            onClick={() => onSelect(step.id)}
          >
            <span className="num">{String(index + 1).padStart(2, '0')}</span>
            {step.label}
          </button>
        );
      })}
    </nav>
  );
}
