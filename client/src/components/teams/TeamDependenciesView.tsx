import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Network, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Team {
  id: number;
  name: string;
  area_name: string;
  organization_name: string;
}

const TeamDependenciesView: React.FC = () => {
  const { data: teams, isLoading } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');
      return response.json();
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold">Team Dependencies</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage dependencies between teams and their applications
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <div className="flex items-center">
                <Network className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-medium">Team Network</h2>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {teams?.map(team => (
                  <div key={team.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{team.name}</h3>
                        <p className="text-sm text-gray-500">
                          {team.organization_name} / {team.area_name}
                        </p>
                      </div>
                      <Link
                        to={`/teams/${team.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <GitBranch className="w-4 h-4 mr-1" />
                        Dependencies coming soon...
                      </div>
                    </div>
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

export default TeamDependenciesView; 