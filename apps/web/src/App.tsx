import { useState, type JSX } from 'react';
import { TitleBlock } from './components/TitleBlock';
import { WorkflowRail } from './components/WorkflowRail';
import { GeometryScreen } from './screens/GeometryScreen';
import { DesignBomScreen } from './screens/DesignBomScreen';
import { QuoteScreen } from './screens/QuoteScreen';
import { project, type WorkflowStepId } from './data/mock';
import './App.css';

const implementedScreens: Partial<Record<WorkflowStepId, () => JSX.Element>> = {
  geometry: GeometryScreen,
  design: DesignBomScreen,
  quote: QuoteScreen,
};

function PlaceholderScreen({ label }: { label: string }) {
  return (
    <div className="main-pane">
      <div className="pane-head">
        <h2>{label}</h2>
      </div>
      <p className="pane-sub">Not yet implemented.</p>
    </div>
  );
}

export default function App() {
  const [activeStep, setActiveStep] = useState<WorkflowStepId>('geometry');
  const Screen = implementedScreens[activeStep];

  return (
    <div className="app-shell">
      <div className="app-frame">
        <TitleBlock project={project} />
        <div className="app-body">
          <WorkflowRail activeStep={activeStep} onSelect={setActiveStep} />
          {Screen ? <Screen /> : <PlaceholderScreen label={activeStep} />}
        </div>
      </div>
    </div>
  );
}
