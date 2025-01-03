import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TeamsView from './components/teams/TeamsView';
import TeamDetailsView from './components/teams/TeamDetailsView';
import ProjectsView from './components/projects/ProjectsView';
import ExecutiveDashboardView from './components/dashboard/ExecutiveDashboardView';
import RoadmapView from './components/roadmap/RoadmapView';
import ProjectImpactView from './components/roadmap/ProjectImpactView';
import OrganizationsView from './components/organizations/OrganizationsView';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800 text-white p-4">
            <nav className="space-y-2">
              <Link
                to="/dashboard"
                className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/roadmap"
                className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Roadmap
              </Link>
              <Link
                to="/projects"
                className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Projects
              </Link>
              <Link
                to="/teams"
                className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Teams
              </Link>
              <Link
                to="/organizations"
                className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Organizations
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<RoadmapView />} />
              <Route path="/dashboard" element={<ExecutiveDashboardView />} />
              <Route path="/roadmap" element={<RoadmapView />} />
              <Route path="/projects" element={<ProjectsView />} />
              <Route path="/projects/:id/impact" element={<ProjectImpactView />} />
              <Route path="/teams" element={<TeamsView />} />
              <Route path="/teams/:id" element={<TeamDetailsView />} />
              <Route path="/organizations" element={<OrganizationsView />} />
            </Routes>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;