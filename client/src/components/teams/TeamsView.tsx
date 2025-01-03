import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users, Building2, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Team {
  id: number;
  name: string;
  area_id: number;
}

interface Area {
  id: number;
  name: string;
  organization_id: number;
}

interface Organization {
  id: number;
  name: string;
  description: string;
}

interface Application {
  id: number;
  name: string;
  status: string;
  team_id: number;
  architect_id: number;
}

const TeamsView: React.FC = () => {
  const navigate = useNavigate();

  const { data: organizations, isLoading: orgsLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/organizations');
      return response.json();
    }
  });

  const { data: areas, isLoading: areasLoading } = useQuery<Area[]>({
    queryKey: ['areas'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/areas');
      return response.json();
    }
  });

  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/teams');
      return response.json();
    }
  });

  const { data: applications, isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/applications');
      return response.json();
    }
  });

  if (orgsLoading || areasLoading || teamsLoading || appsLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Teams & Organizations</h1>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Team
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          {organizations?.map(org => (
            <div key={org.id} className="border rounded-lg shadow-sm">
              {/* Organization Header */}
              <div className="p-4 bg-gray-50 rounded-t-lg border-b flex items-center">
                <Building2 className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-medium">{org.name}</h2>
              </div>

              {/* Areas and Teams */}
              <div className="p-4 space-y-4">
                {areas
                  ?.filter(area => area.organization_id === org.id)
                  .map(area => (
                    <div key={area.id} className="pl-6">
                      {/* Area Header */}
                      <div className="flex items-center mb-2">
                        <Layers className="w-4 h-4 text-gray-400 mr-2" />
                        <h3 className="font-medium text-gray-700">{area.name}</h3>
                      </div>

                      {/* Teams */}
                      <div className="space-y-3 pl-6">
                        {teams
                          ?.filter(team => {
                            const teamArea = areas?.find(a => a.id === team.area_id);
                            return teamArea?.organization_id === org.id;
                          })
                          .map(team => (
                            <div key={team.id} 
                              className="border rounded-md p-4 bg-white cursor-pointer hover:bg-gray-50"
                              onClick={() => navigate(`/teams/${team.id}`)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="font-medium">{team.name}</span>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {applications?.filter(app => app.team_id === team.id).length} Applications
                                </span>
                              </div>
                              
                              {/* Applications */}
                              <div className="mt-3 pl-6 space-y-2">
                                {applications
                                  ?.filter(app => app.team_id === team.id)
                                  .map(app => (
                                    <div key={app.id} className="flex items-center text-sm">
                                      <span className={`w-2 h-2 rounded-full mr-2 ${
                                        app.status === 'Active' ? 'bg-green-400' : 'bg-gray-400'
                                      }`} />
                                      <span>{app.name}</span>
                                    </div>
                                  ))
                                }
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamsView; 