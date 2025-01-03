import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Users, Calendar, AlertCircle, Building2, Plus } from 'lucide-react';
import CreateProjectModal from './CreateProjectModal';

interface Project {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface TimelineItem {
  team: string;
  date: string;
  status: 'completed' | 'in-progress' | 'planned';
  progress: number;
}

interface OrgImpact {
  name: string;
  teams: number;
  risk: 'low' | 'medium' | 'high';
  impact: string;
}

interface ProjectImpact {
  id: string;
  title: string;
  status: string;
  type: string;
  description: string;
  metrics: {
    impactedTeams: number;
    organizations: number;
    timeline: string;
    dependencies: number;
  };
  timelineItems: TimelineItem[];
  orgImpact: OrgImpact[];
}

const ProjectsView: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch all projects
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/projects');
      return response.json();
    }
  });

  // Fetch selected project impact details
  const { data: projectImpact } = useQuery<ProjectImpact>({
    queryKey: ['project_impact', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) throw new Error('No project selected');
      const response = await fetch(`http://localhost:3001/api/projects/${selectedProjectId}/impact`);
      if (!response.ok) throw new Error('Failed to fetch project impact');
      return response.json();
    },
    enabled: !!selectedProjectId
  });

  const filteredProjects = projects?.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getProjectTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'infrastructure':
        return 'bg-blue-100 text-blue-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'business initiative':
        return 'bg-green-100 text-green-800';
      case 'innovation':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskBadgeColor = (risk: string): string => {
    switch (risk.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      console.error('Error creating project:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  if (projectsLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Projects</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-12 gap-6">
          {/* Projects List */}
          <div className="col-span-3 space-y-3">
            {filteredProjects?.map(project => (
              <div
                key={project.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedProjectId === project.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedProjectId(project.id)}
              >
                <h3 className="font-medium">{project.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getProjectTypeColor(project.type)}`}>
                    {project.type}
                  </span>
                  <span className="text-sm text-gray-500">{project.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Project Impact Details */}
          {selectedProjectId && projectImpact ? (
            <div className="col-span-9 space-y-6">
              {/* Project Header */}
              <div className="bg-white border rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-2">{projectImpact.title}</h2>
                <p className="text-gray-600 mb-4">{projectImpact.description}</p>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-white border rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Impacted Teams</span>
                    </div>
                    <p className="mt-2 text-2xl font-semibold">{projectImpact.metrics.impactedTeams}</p>
                  </div>

                  <div className="p-4 bg-white border rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span className="text-sm">Organizations</span>
                    </div>
                    <p className="mt-2 text-2xl font-semibold">{projectImpact.metrics.organizations}</p>
                  </div>

                  <div className="p-4 bg-white border rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Timeline</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold">{projectImpact.metrics.timeline}</p>
                  </div>

                  <div className="p-4 bg-white border rounded-lg">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Dependencies</span>
                    </div>
                    <p className="mt-2 text-2xl font-semibold">{projectImpact.metrics.dependencies}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Implementation Timeline</h3>
                <div className="space-y-4">
                  {projectImpact.timelineItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-24 text-sm text-gray-500">{item.date}</div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div
                            className="h-2 bg-blue-500 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-32">
                        <span className="text-sm font-medium">{item.team}</span>
                      </div>
                      <div className="w-24">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organization Impact */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Organization Impact</h3>
                <div className="grid grid-cols-2 gap-4">
                  {projectImpact.orgImpact.map((org, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{org.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getRiskBadgeColor(org.risk)}`}>
                          {org.risk} risk
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{org.teams} teams impacted</span>
                      </div>
                      <p className="text-sm text-gray-600">{org.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="col-span-9 flex items-center justify-center">
              <p className="text-gray-500">Select a project to view its impact analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};

export default ProjectsView; 