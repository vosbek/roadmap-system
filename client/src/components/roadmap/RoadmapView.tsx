import React, { useState, CSSProperties } from 'react';
import { Plus, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../../services/api';
import type { Project } from '../../types';
import { format, differenceInMonths, parseISO } from 'date-fns';

const RoadmapView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('3-year');
  const startDate = new Date(2024, 0, 1); // January 2024

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll();
      console.log('Loaded projects:', response.data);
      return response.data;
    }
  });

  const getProjectStyle = (project: Project): CSSProperties => {
    if (!project.start_date || !project.end_date) return {};
    
    const start = parseISO(project.start_date);
    const end = parseISO(project.end_date);
    
    const startMonth = differenceInMonths(start, startDate);
    const duration = differenceInMonths(end, start) + 1;
    
    return {
      position: 'absolute' as const,
      left: `${(startMonth / 36) * 100}%`,
      width: `${(duration / 36) * 100}%`,
      height: '2rem',
      top: '0.5rem',
      backgroundColor: getProjectColor(project.type || ''),
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '0.5rem',
      color: '#ffffff',
      fontSize: '0.75rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    };
  };

  const getProjectColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'infrastructure':
        return '#3B82F6'; // blue
      case 'security':
        return '#EF4444'; // red
      case 'business initiative':
        return '#10B981'; // green
      case 'innovation':
        return '#8B5CF6'; // purple
      default:
        return '#6B7280'; // gray
    }
  };

  const months = Array.from({ length: 36 }, (_, i) => {
    const date = new Date(2024, i, 1);
    return format(date, 'MMM yyyy');
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold">Strategic Roadmap</h1>
            <div className="flex items-center space-x-2">
              <select className="px-3 py-1 text-sm border rounded-md">
                <option value="">All Organizations</option>
                <option value="it-ops">IT Operations</option>
                <option value="digital">Digital Products</option>
                <option value="security">Enterprise Security</option>
                <option value="data">Data & Analytics</option>
              </select>
              <select className="px-3 py-1 text-sm border rounded-md">
                <option value="">All Areas</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="cloud">Cloud Platform</option>
                <option value="mobile">Mobile Solutions</option>
                <option value="web">Web Platform</option>
              </select>
              <select className="px-3 py-1 text-sm border rounded-md">
                <option value="">All Teams</option>
                <option value="platform">Platform Engineering</option>
                <option value="infra">Infrastructure Automation</option>
                <option value="mobile">Mobile Development</option>
                <option value="web">Web Development</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-2 text-sm border rounded-md flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="flex border-b">
        <div className="w-60 flex-shrink-0 p-4 border-r">
          <select 
            className="w-full p-2 border rounded-md"
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
          >
            <option value="3-year">3 Year View</option>
            <option value="2-year">2 Year View</option>
            <option value="1-year">1 Year View</option>
          </select>
        </div>
        <div className="flex-1">
          <div className="grid grid-cols-12 border-b">
            {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
              <div key={quarter} className="col-span-3 p-2 text-sm font-medium text-center border-r">
                {quarter} 2024
              </div>
            ))}
          </div>
          <div className="grid grid-cols-12">
            {months.slice(0, 12).map((_, index) => (
              <div key={index} className="p-2 text-xs text-center border-r">
                {format(new Date(2024, index), 'MMM')}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Rows */}
      <div className="flex-1 overflow-auto">
        {projects?.map((project) => (
          <div 
            key={project.id} 
            className="flex border-b hover:bg-gray-50 cursor-pointer"
            onClick={() => {
              console.log('Clicking project:', project.id, project.title);
              navigate(`/projects/${project.id}/impact`);
            }}
          >
            <div className="w-60 flex-shrink-0 p-4 border-r">
              <div>
                <h3 className="font-medium">{project.title}</h3>
                <div className="flex items-center mt-1">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                    project.status === 'In Progress' ? 'bg-blue-500' :
                    project.status === 'Planned' ? 'bg-gray-500' :
                    'bg-green-500'
                  }`} />
                  <span className="text-sm text-gray-500">{project.status}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 relative h-12">
              <div style={getProjectStyle(project)}>{project.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapView;