import { useState } from 'react';
import type { DesignRevision, Project } from './api';
import { DemoBanner } from './components/DemoBanner';
import { ThemeToggle } from './components/ThemeToggle';
import { TitleBlock } from './components/TitleBlock';
import { WorkflowRail } from './components/WorkflowRail';
import { EnquiryScreen } from './screens/EnquiryScreen';
import { GeometryScreen } from './screens/GeometryScreen';
import { LoadsScreen } from './screens/LoadsScreen';
import { DesignBomScreen } from './screens/DesignBomScreen';
import { PricingScreen } from './screens/PricingScreen';
import { QuoteScreen } from './screens/QuoteScreen';
import { DrawingsScreen } from './screens/DrawingsScreen';
import type { WorkflowStepId } from './data/workflow';
import { useTheme } from './useTheme';
import './App.css';

function NoProjectScreen() {
  return (
    <div className="main-pane">
      <div className="pane-head">
        <h2>No enquiry yet</h2>
      </div>
      <p className="pane-sub">Start with the Enquiry step to create a project and run a design.</p>
    </div>
  );
}

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [activeStep, setActiveStep] = useState<WorkflowStepId>('enquiry');
  const [project, setProject] = useState<Project | null>(null);
  const [revision, setRevision] = useState<DesignRevision | null>(null);

  function handleCreated(newProject: Project, newRevision: DesignRevision) {
    setProject(newProject);
    setRevision(newRevision);
    setActiveStep('design');
  }

  let content: React.JSX.Element;
  if (activeStep === 'enquiry') {
    content = <EnquiryScreen onCreated={handleCreated} />;
  } else if (activeStep === 'pricing') {
    content = <PricingScreen />;
  } else if (!project || !revision) {
    content = <NoProjectScreen />;
  } else if (activeStep === 'geometry') {
    content = <GeometryScreen revision={revision} />;
  } else if (activeStep === 'loads') {
    content = <LoadsScreen projectId={project.id} revision={revision} onRevised={setRevision} />;
  } else if (activeStep === 'design') {
    content = <DesignBomScreen revision={revision} />;
  } else if (activeStep === 'quote') {
    content = <QuoteScreen projectId={project.id} revision={revision} />;
  } else {
    content = <DrawingsScreen projectId={project.id} revision={revision} />;
  }

  const titleFields = project
    ? [
        { label: 'Revision', value: `R${revision?.revisionNumber ?? 1}` },
        { label: 'Code / Region', value: 'EC3-simplified' },
        { label: 'Updated', value: new Date(project.createdAt).toLocaleDateString() },
      ]
    : [
        { label: 'Revision', value: '-' },
        { label: 'Code / Region', value: '-' },
        { label: 'Updated', value: '-' },
      ];

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  return (
    <div className="app-shell">
      <div className="app-shell-header">
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>
      {isDemoMode && <DemoBanner />}
      <div className="app-frame">
        <TitleBlock
          name={project?.name ?? 'New enquiry'}
          client={project?.client ?? '-'}
          status="draft"
          extraFields={titleFields}
        />
        <div className="app-body">
          <WorkflowRail activeStep={activeStep} onSelect={setActiveStep} />
          {content}
        </div>
      </div>
    </div>
  );
}
