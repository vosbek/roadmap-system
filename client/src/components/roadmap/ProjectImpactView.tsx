import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Calendar, 
  AlertCircle,
  Building2
} from 'lucide-react';
import { projectsApi } from '../../services/api';

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
  metrics: {
    impactedTeams: number;
    organizations: number;
    timeline: string;
    dependencies: number;
  };
  timelineItems: TimelineItem[];
  orgImpact: OrgImpact[];
}

const ProjectImpactView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: impactData, isLoading } = useQuery<ProjectImpact>({
    queryKey: ['projectImpact', id],
    queryFn: async () => {
      const response = await projectsApi.getImpact(Number(id));
      return response.data;
    },
    enabled: !!id
  });

  const getRiskBadgeColor = (risk: 'low' | 'medium' | 'high'): string => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[risk];
  };

  const getStatusColor = (status: 'completed' | 'in-progress' | 'planned'): string => {
    const colors = {
      completed: 'bg-green-500',
      'in-progress': 'bg-blue-500',
      planned: 'bg-gray-300'
    };
    return colors[status];
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!impactData) {
    return <div>No impact data available</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-800">{impactData.title}</h1>
              <span className="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded-full">
                {impactData.status}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                Export
              </button>
              <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Edit Project
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">Impacted Teams</span>
              </div>
              <p className="mt-2 text-2xl font-semibold">{impactData.metrics.impactedTeams}</p>
            </div>

            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Building2 className="w-4 h-4" />
                <span className="text-sm">Organizations</span>
              </div>
              <p className="mt-2 text-2xl font-semibold">{impactData.metrics.organizations}</p>
            </div>

            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Timeline</span>
              </div>
              <p className="mt-2 text-sm font-semibold">{impactData.metrics.timeline}</p>
            </div>

            <div className="p-4 bg-white border rounded-lg shadow-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Dependencies</span>
              </div>
              <p className="mt-2 text-2xl font-semibold">{impactData.metrics.dependencies}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-3 gap-6 p-6">
        {/* Timeline Section */}
        <div className="col-span-2">
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Implementation Timeline</h2>
            </div>
            <div className="p-4">
              <div className="space-y-6">
                {impactData.timelineItems?.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.team}</span>
                        <span className="text-sm text-gray-500">{item.date}</span>
                      </div>
                      <div className="mt-2 h-2 bg-gray-100 rounded-full">
                        <div 
                          className={`h-full rounded-full ${getStatusColor(item.status)}`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Impact Analysis */}
        <div className="space-y-6">
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Team Impact Analysis</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {impactData.orgImpact?.map((org, index) => (
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
        </div>
      </div>
    </div>
  );
};

export default ProjectImpactView;