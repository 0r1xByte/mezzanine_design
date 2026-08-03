import { useState } from 'react';
import type { DesignRevision, Project } from './api';
import { DemoBanner } from './components/DemoBanner';
import { TitleBlock } from './components/TitleBlock';
import { WorkflowRail } from './components/WorkflowRail';
import { EnquiryScreen } from './screens/EnquiryScreen';
import { GeometryScreen } from './screens/GeometryScreen';
import { DesignBomScreen } from './screens/DesignBomScreen';
import { QuoteScreen } from './screens/QuoteScreen';
import type { WorkflowStepId } from './data/workflow';
import './App.css';

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
  } else if (!project || !revision) {
    content = <NoProjectScreen />;
  } else if (activeStep === 'geometry') {
    content = <GeometryScreen revision={revision} />;
  } else if (activeStep === 'design') {
    content = <DesignBomScreen revision={revision} />;
  } else if (activeStep === 'quote') {
    content = <QuoteScreen projectId={project.id} revision={revision} />;
  } else {
    content = <PlaceholderScreen label={activeStep} />;
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
