import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Layout, Calendar } from 'lucide-react';

interface TeamDetails {
  id: number;
  name: string;
  description: string;
  area: {
    id: number;
    name: string;
    organization: {
      id: number;
      name: string;
    }
  };
  applications: Array<{
    id: number;
    name: string;
    status: string;
    architect: {
      name: string;
      email: string;
    }
  }>;
  projects: Array<{
    id: number;
    title: string;
    status: string;
    start_date: string;
    end_date: string;
  }>;
}

const TeamDetailsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: team, isLoading } = useQuery<TeamDetails>({
    queryKey: ['team', id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3001/api/teams/${id}`);
      if (!response.ok) throw new Error('Failed to fetch team details');
      return response.json();
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="max-w-5xl mx-auto">
          <Link to="/teams" className="text-blue-600 hover:text-blue-700 flex items-center mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Teams
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">{team.name}</h1>
            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md">
              Edit Team
            </button>
          </div>
          <div className="mt-2 text-gray-600">
            {team.area.organization.name} / {team.area.name}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
          {/* Applications */}
          <div className="col-span-2 space-y-6">
            <div className="bg-white border rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium flex items-center">
                  <Layout className="w-5 h-5 mr-2 text-gray-500" />
                  Applications
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {team.applications.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">{app.name}</h3>
                        <p className="text-sm text-gray-500">Architect: {app.architect.name}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        app.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white border rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                  Current Projects
                </h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {team.projects.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <h3 className="font-medium">{project.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Team Info */}
          <div className="space-y-6">
            <div className="bg-white border rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-medium flex items-center">
                  <Users className="w-5 h-5 mr-2 text-gray-500" />
                  Team Information
                </h2>
              </div>
              <div className="p-4">
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Organization</dt>
                    <dd className="mt-1">{team.area.organization.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Area</dt>
                    <dd className="mt-1">{team.area.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Applications</dt>
                    <dd className="mt-1">{team.applications.length}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Active Projects</dt>
                    <dd className="mt-1">{team.projects.length}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailsView; 