import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building2, Layers, Users, Layout, GitBranch, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  type: string;
  start_date: string;
  end_date: string;
}

interface Application {
  id: number;
  name: string;
  projects: Project[];
}

interface Team {
  id: number;
  name: string;
  applications: Application[];
}

interface Area {
  id: number;
  name: string;
  teams: Team[];
}

interface Organization {
  id: number;
  name: string;
  description: string;
  areas: Area[];
}

const OrganizationsView: React.FC = () => {
  const navigate = useNavigate();

  const { data: organizations, isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations_details'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/organizations/details');
      return response.json();
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const getOrganizationProjects = (org: Organization): Project[] => {
    const projectMap = new Map<number, Project>();
    org.areas?.forEach(area => {
      area.teams?.forEach(team => {
        team.applications?.forEach(app => {
          if (app.projects) {
            app.projects.forEach(project => {
              projectMap.set(project.id, project);
            });
          }
        });
      });
    });
    return Array.from(projectMap.values());
  };

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

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Organizations</h1>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Organization
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6">
          {organizations?.map(org => {
            const orgProjects = getOrganizationProjects(org);
            const activeProjects = orgProjects.filter(p => p.status.toLowerCase() === 'in progress');
            const plannedProjects = orgProjects.filter(p => p.status.toLowerCase() === 'planned');
            
            return (
              <div key={org.id} className="bg-white border rounded-lg shadow-sm">
                {/* Organization Header */}
                <div className="p-4 bg-gray-50 rounded-t-lg border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Building2 className="w-6 h-6 text-gray-500 mr-2" />
                      <div>
                        <h2 className="text-xl font-medium">{org.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">{org.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organization Metrics */}
                <div className="grid grid-cols-4 gap-4 p-4 border-b">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-blue-600 mb-2">
                      <Layers className="w-4 h-4 mr-2" />
                      <span className="font-medium">Areas</span>
                    </div>
                    <p className="text-2xl font-semibold">
                      {org.areas?.length || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center text-green-600 mb-2">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="font-medium">Teams</span>
                    </div>
                    <p className="text-2xl font-semibold">
                      {org.areas?.reduce((acc, area) => acc + (area.teams?.length || 0), 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center text-purple-600 mb-2">
                      <Layout className="w-4 h-4 mr-2" />
                      <span className="font-medium">Applications</span>
                    </div>
                    <p className="text-2xl font-semibold">
                      {org.areas?.reduce((acc, area) => 
                        acc + area.teams?.reduce((teamAcc, team) => 
                          teamAcc + (team.applications?.length || 0), 0
                        ) || 0, 0
                      )}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center text-orange-600 mb-2">
                      <GitBranch className="w-4 h-4 mr-2" />
                      <span className="font-medium">Active Projects</span>
                    </div>
                    <p className="text-2xl font-semibold">{activeProjects.length}</p>
                  </div>
                </div>

                {/* Projects Overview */}
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                    Current Projects
                  </h3>
                  <div className="space-y-3">
                    {activeProjects.map(project => (
                      <div 
                        key={project.id} 
                        className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/projects/${project.id}/impact`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{project.title}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${getProjectTypeColor(project.type)}`}>
                            {project.type}
                          </span>
                        </div>
                      </div>
                    ))}
                    {plannedProjects.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Planned Projects</h4>
                        {plannedProjects.map(project => (
                          <div 
                            key={project.id} 
                            className="border rounded-lg p-3 mb-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => navigate(`/projects/${project.id}/impact`)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{project.title}</h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${getProjectTypeColor(project.type)}`}>
                                {project.type}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrganizationsView; 