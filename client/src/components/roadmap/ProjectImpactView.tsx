import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  Power
} from 'lucide-react';
import { projectsApi, ProjectImpact } from '../../services/api';

const ProjectImpactView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  console.log('ProjectImpactView rendered with id:', id);
  
  const { data: projectData, isLoading, error } = useQuery<ProjectImpact, Error>({
    queryKey: ['project', id],
    queryFn: async () => {
      console.log('Fetching project impact data for id:', id);
      const response = await projectsApi.getImpact(Number(id));
      console.log('Project impact data received:', response.data);
      return response.data;
    },
    enabled: !!id
  });

  if (isLoading) {
    console.log('ProjectImpactView is loading');
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    console.error('ProjectImpactView error:', error);
    return <div>Error loading project data: {error.message}</div>;
  }

  if (!projectData) {
    console.log('ProjectImpactView has no data');
    return <div>No project data available</div>;
  }

  console.log('ProjectImpactView rendering with data:', projectData);

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

          {/* Dependencies */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center text-gray-700 mb-4">
              <GitBranch className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-medium">Dependencies</h2>
            </div>
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