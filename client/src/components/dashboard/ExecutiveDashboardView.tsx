import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity, TrendingUp, AlertTriangle, Shield,
  Network, Zap, Clock, CheckCircle2, Users,
  Layers, Component
} from 'lucide-react';

interface Area {
  id: number;
  name: string;
  description: string;
  organization_id: number;
}

interface Team {
  id: number;
  name: string;
  area_id: number;
}

interface Application {
  id: number;
  name: string;
  status: string;
  team_id: number;
}

interface Project {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  start_date: string;
  end_date: string;
}

const ExecutiveDashboardView: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'month' | 'quarter' | 'year'>('quarter');

  // Fetch all data
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/projects');
      return response.json();
    }
  });

  const { data: teams } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/teams');
      return response.json();
    }
  });

  const { data: areas } = useQuery<Area[]>({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/areas');
      return response.json();
    }
  });

  const { data: applications } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/applications');
      return response.json();
    }
  });

  if (projectsLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Calculate metrics
  const totalProjects = projects?.length || 0;
  const inProgressProjects = projects?.filter(p => p.status === 'in_progress').length || 0;
  const completedProjects = projects?.filter(p => p.status === 'completed').length || 0;
  const plannedProjects = projects?.filter(p => p.status === 'planning').length || 0;
  const atRiskProjects = projects?.filter(p => p.status === 'at_risk').length || 0;

  const projectTypes = projects?.reduce((acc, project) => {
    acc[project.type] = (acc[project.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Enterprise Technology Portfolio</h1>
        <p className="mt-2 text-gray-600">Strategic Initiative Dashboard</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 flex justify-end">
        <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
          <button
            onClick={() => setSelectedTimeframe('month')}
            className={`px-4 py-2 rounded-lg ${
              selectedTimeframe === 'month'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setSelectedTimeframe('quarter')}
            className={`px-4 py-2 rounded-lg ${
              selectedTimeframe === 'quarter'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Quarter
          </button>
          <button
            onClick={() => setSelectedTimeframe('year')}
            className={`px-4 py-2 rounded-lg ${
              selectedTimeframe === 'year'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-blue-600">Portfolio Health</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">{totalProjects}</span>
            <span className="text-sm text-gray-500">Total Initiatives</span>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
              <span>{completedProjects} Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
              <span>{inProgressProjects} In Progress</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <Layers className="w-6 h-6 text-purple-500" />
            </div>
            <span className="text-sm font-medium text-purple-600">Area Coverage</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">{areas?.length || 0}</span>
            <span className="text-sm text-gray-500">Areas Engaged</span>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${(areas?.length || 0) / 10 * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-sm font-medium text-green-600">Delivery Progress</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">{teams?.length || 0}</span>
            <span className="text-sm text-gray-500">Teams Delivering</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold text-gray-700">{plannedProjects}</span>
              <span className="text-xs text-gray-500">Planned</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold text-gray-700">{inProgressProjects}</span>
              <span className="text-xs text-gray-500">Active</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-semibold text-gray-700">{completedProjects}</span>
              <span className="text-xs text-gray-500">Done</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-sm font-medium text-red-600">Risk Profile</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">{atRiskProjects}</span>
            <span className="text-sm text-gray-500">Projects at Risk</span>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Critical Projects</span>
              <span className="text-red-600">{atRiskProjects}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Needs Attention</span>
              <span className="text-yellow-600">
                {inProgressProjects - atRiskProjects}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Initiatives Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Initiative Categories</h3>
          <div className="space-y-4">
            {Object.entries(projectTypes).map(([type, count]) => (
              <div key={type} className="flex items-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-4">
                  {type === 'infrastructure' && <Network className="w-5 h-5 text-blue-500" />}
                  {type === 'security' && <Shield className="w-5 h-5 text-red-500" />}
                  {type === 'business' && <TrendingUp className="w-5 h-5 text-green-500" />}
                  {type === 'innovation' && <Zap className="w-5 h-5 text-purple-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">{count} projects</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        type === 'infrastructure' ? 'bg-blue-500' :
                        type === 'security' ? 'bg-red-500' :
                        type === 'business' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`}
                      style={{ width: `${(count / totalProjects) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline Overview</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Average Project Duration</span>
              </div>
              <span className="text-sm font-medium text-gray-900">4.5 months</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">On-time Delivery Rate</span>
              </div>
              <span className="text-sm font-medium text-gray-900">92%</span>
            </div>
            <div className="mt-6">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
                <div className="space-y-8 relative">
                  {projects?.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-start ml-6">
                      <div className="absolute left-0 w-2 h-2 rounded-full bg-blue-500 transform -translate-x-1 mt-2" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{project.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(project.start_date).toLocaleDateString()} - 
                          {new Date(project.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Area Distribution */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Area Distribution & Capacity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {areas?.slice(0, 4).map((area, index) => (
            <div key={area.id} className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">{area.name}</span>
                <span className="text-xs text-gray-500">
                  {teams?.filter(t => t.area_id === area.id).length} teams
                </span>
              </div>
              <div className="flex-1 flex items-end">
                <div className="w-full bg-gray-100 rounded-lg h-24 relative">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-lg"
                    style={{ 
                      height: `${Math.min(
                        ((teams?.filter(t => t.area_id === area.id).length || 0) / 5) * 100,
                        100
                      )}%`,
                      opacity: 0.1 + (index * 0.2)
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboardView; 