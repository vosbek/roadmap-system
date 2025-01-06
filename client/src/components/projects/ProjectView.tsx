import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Building2, GitBranch, ArrowLeft, Clock, Tag, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Project } from '../../types';

const ProjectView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      return response.json() as Promise<Project>;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-lg font-medium text-gray-900">Failed to load project</h2>
        <p className="text-gray-500 mt-2">Please try again later</p>
      </div>
    );
  }

  const getTypeColor = (type: string | undefined): string => {
    switch (type?.toLowerCase()) {
      case 'new capability':
        return 'bg-emerald-100 text-emerald-800';
      case 'business initiative':
        return 'bg-blue-100 text-blue-800';
      case 'infrastructure':
        return 'bg-cyan-100 text-cyan-800';
      case 'innovation':
        return 'bg-violet-100 text-violet-800';
      case 'decommission':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
              <h1 className="text-2xl font-semibold text-gray-900">{project.title}</h1>
              <p className="mt-2 text-gray-600 max-w-3xl">{project.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(project.type)}`}>
                {project.type}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                ${project.status === 'active' ? 'bg-green-100 text-green-800' : 
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'}`}>
                {project.status}
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
                <span className="text-sm text-gray-500">Start Date</span>
                <span className="text-sm font-medium text-gray-900">
                  {project.start_date ? format(parseISO(project.start_date), 'MMM d, yyyy') : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">End Date</span>
                <span className="text-sm font-medium text-gray-900">
                  {project.end_date ? format(parseISO(project.end_date), 'MMM d, yyyy') : 'Not set'}
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
                <span className="text-sm text-gray-500">Owner Team</span>
                <span className="text-sm font-medium text-gray-900">{project.owner_team_name || 'Not assigned'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Owner Architect</span>
                <span className="text-sm font-medium text-gray-900">{project.owner_architect_name || 'Not assigned'}</span>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center text-gray-700 mb-4">
              <Tag className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-medium">Additional Details</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Funding Status</span>
                <span className="text-sm font-medium text-gray-900">{project.funding_status || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Project Type</span>
                <span className="text-sm font-medium text-gray-900">{project.project_type}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Impact */}
        {project.business_impact && (
          <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
            <div className="flex items-center text-gray-700 mb-4">
              <Building2 className="w-5 h-5 mr-2" />
              <h2 className="text-lg font-medium">Business Impact</h2>
            </div>
            <p className="text-gray-600 whitespace-pre-line">{project.business_impact}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectView; 