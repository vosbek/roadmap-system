import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TeamsView from './components/teams/TeamsView';
import TeamDetailsView from './components/teams/TeamDetailsView';
import TeamRoadmapView from './components/teams/TeamRoadmapView';
import ProjectsView from './components/projects/ProjectsView';
import ExecutiveDashboardView from './components/dashboard/ExecutiveDashboardView';
import RoadmapView from './components/roadmap/RoadmapView';
import ProjectImpactView from './components/roadmap/ProjectImpactView';
import OrganizationsView from './components/organizations/OrganizationsView';
import ExecutiveView from './components/executive/ExecutiveView';
import IngestionView from './components/ingestion/IngestionView';
import IntegrationsView from './components/integrations/IntegrationsView';
import Navigation from './components/common/Navigation';
import ApplicationArchitectureView from './components/architect/ApplicationArchitectureView';
import StrategicRoadmapView from './components/strategic/StrategicRoadmapView';
import ProjectView from './components/projects/ProjectView';
import TeamDependenciesView from './components/teams/TeamDependenciesView';
import TeamRoadmapsView from './components/teams/TeamRoadmapsView';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex h-screen">
          <Navigation />
          <div className="flex-1 overflow-auto bg-gray-50">
            <Routes>
              <Route path="/" element={<ExecutiveDashboardView />} />
              <Route path="/roadmap" element={<RoadmapView />} />
              <Route path="/projects" element={<ProjectsView />} />
              <Route path="/projects/:id" element={<ProjectView />} />
              <Route path="/projects/:id/impact" element={<ProjectImpactView />} />
              <Route path="/teams/dependencies" element={<TeamDependenciesView />} />
              <Route path="/teams/roadmaps" element={<TeamRoadmapsView />} />
              <Route path="/teams/:id" element={<TeamDetailsView />} />
              <Route path="/teams/:id/roadmap" element={<TeamRoadmapView />} />
              <Route path="/organizations" element={<OrganizationsView />} />
              <Route path="/executive" element={<ExecutiveView />} />
              <Route path="/ingestion" element={<IngestionView />} />
              <Route path="/integrations" element={<IntegrationsView />} />
              <Route path="/strategic" element={<StrategicRoadmapView />} />
              <Route path="/architect" element={<ApplicationArchitectureView />} />
            </Routes>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;