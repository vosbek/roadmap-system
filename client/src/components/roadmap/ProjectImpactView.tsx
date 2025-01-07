import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Calendar, 
  AlertCircle,
  Building2,
  ArrowLeft,
  Tag,
  Layers,
  GitBranch,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Rocket,
  Power,
  Search,
  Plus
} from 'lucide-react';
import { projectsApi, ProjectImpact } from '../../services/api';

const PROJECT_TYPES = [
  { id: '', name: 'Select type', icon: Tag, color: 'gray' },
  { id: 'new_capability', name: 'New Capability', icon: Rocket, color: 'emerald' },
  { id: 'business_initiative', name: 'Business Initiative', icon: Building2, color: 'blue' },
  { id: 'infrastructure', name: 'Infrastructure', icon: Layers, color: 'cyan' },
  { id: 'innovation', name: 'Innovation', icon: Power, color: 'violet' },
  { id: 'decommission', name: 'Decommission', icon: XCircle, color: 'red' }
];

const ProjectImpactView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDependencySearch, setShowDependencySearch] = useState(false);
  
  // Fetch project data
  const { data: projectData, isLoading, error } = useQuery<ProjectImpact, Error>({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await projectsApi.getImpact(Number(id));
      return response.data;
    },
    enabled: !!id
  });

  // Fetch all projects for dependency selection
  const { data: allProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll();
      return response.data;
    }
  });

  // Update project type mutation
  const updateProjectType = useMutation({
    mutationFn: async ({ projectId, type }: { projectId: number, type: string }) => {
      return await projectsApi.update(projectId, { type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    }
  });

  // Add dependency mutation
  const addDependency = useMutation({
    mutationFn: async ({ projectId, dependencyId }: { projectId: number, dependencyId: number }) => {
      return await projectsApi.addDependency(projectId, dependencyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setShowDependencySearch(false);
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div>Error loading project data: {error.message}</div>;
  }

  if (!projectData) {
    return <div>No project data available</div>;
  }

  const filteredProjects = allProjects?.filter(p => 
    p.id !== projectData.id && 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Project Header */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{projectData.title}</h1>
              
              {/* Project Type Selector */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                <div className="relative">
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={projectData.type || ''}
                    onChange={(e) => {
                      if (e.target.value) { // Only update if a non-empty value is selected
                        updateProjectType.mutate({
                          projectId: Number(id),
                          type: e.target.value
                        });
                      }
                    }}
                  >
                    <option value="" disabled>Select type</option>
                    {PROJECT_TYPES.filter(type => type.id !== '').map(type => {
                      const Icon = type.icon;
                      return (
                        <option 
                          key={type.id} 
                          value={type.id}
                          className={`text-${type.color}-700 bg-${type.color}-50 flex items-center`}
                        >
                          {type.name}
                        </option>
                      );
                    })}
                  </select>
                  {projectData.type && (
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      {(() => {
                        const selectedType = PROJECT_TYPES.find(t => t.id === projectData.type);
                        if (selectedType) {
                          const Icon = selectedType.icon;
                          return <Icon className={`w-4 h-4 mr-2 text-${selectedType.color}-500`} />;
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                ${projectData.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  projectData.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'}`}>
                {projectData.status}
              </span>
            </div>
          </div>
        </div>

        {/* Project Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Timeline */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center text-gray-700 mb-4">
              <Calendar className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-medium">Timeline</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Timeline</span>
                <span className="text-sm font-medium text-gray-900">
                  {projectData.metrics.timeline}
                </span>
              </div>
            </div>
          </div>

          {/* Team Impact */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center text-gray-700 mb-4">
              <Users className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-medium">Team Impact</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Impacted Teams</span>
                <span className="text-sm font-medium text-gray-900">{projectData.metrics.impactedTeams}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Organizations</span>
                <span className="text-sm font-medium text-gray-900">{projectData.metrics.organizations}</span>
              </div>
            </div>
          </div>

          {/* Dependencies Section */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between text-gray-700 mb-4">
              <div className="flex items-center">
                <GitBranch className="w-5 h-5 mr-2" />
                <h2 className="text-lg font-medium">Dependencies</h2>
              </div>
              <button
                onClick={() => setShowDependencySearch(true)}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
            
            {showDependencySearch && (
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                {searchQuery && (
                  <div className="mt-2 max-h-48 overflow-auto border border-gray-200 rounded-md">
                    {filteredProjects.map(project => (
                      <div
                        key={project.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => {
                          addDependency.mutate({
                            projectId: Number(id),
                            dependencyId: Number(project.id)
                          });
                        }}
                      >
                        <span>{project.title}</span>
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Dependencies</span>
                <span className="text-sm font-medium text-gray-900">{projectData.metrics.dependencies}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Items */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="flex items-center text-gray-700 mb-4">
            <Calendar className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-medium">Timeline Items</h2>
          </div>
          <div className="space-y-4">
            {projectData.timelineItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{item.team}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{item.date}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                    <div
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Organization Impact */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex items-center text-gray-700 mb-4">
            <Building2 className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-medium">Organization Impact</h2>
          </div>
          <div className="space-y-4">
            {projectData.orgImpact.map((org, index) => (
              <div key={index} className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{org.impact}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    org.risk === 'high' ? 'bg-red-100 text-red-800' :
                    org.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {org.risk} risk
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  {org.teams} teams affected
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectImpactView;