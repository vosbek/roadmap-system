import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Layers, Users, Layout, GitBranch,
  AlertTriangle, CheckCircle2, Clock,
  ChevronRight, ChevronDown, Network,
  ArrowRight, Component
} from 'lucide-react';
import { format, parseISO, addMonths, isWithinInterval } from 'date-fns';

interface ExecutiveProject {
  area_name: string;
  team_name: string;
  project_id: number;
  project_title: string;
  project_description: string;
  project_status: string;
  project_type: string;
  start_date: string;
  end_date: string;
  area_project_count: number;
  area_in_progress_count: number;
  area_planned_count: number;
  team_project_count: number;
}

type TimelineScale = '3-months' | '6-months' | '1-year' | '2-years';

const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'infrastructure': return 'bg-purple-100 border-purple-400 text-purple-700';
    case 'security': return 'bg-red-100 border-red-400 text-red-700';
    case 'innovation': return 'bg-blue-100 border-blue-400 text-blue-700';
    case 'decommission': return 'bg-yellow-100 border-yellow-400 text-yellow-700';
    default: return 'bg-gray-100 border-gray-400 text-gray-700';
  }
};

const ExecutiveView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedScale, setSelectedScale] = useState<TimelineScale>('1-year');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { data: executiveData, isLoading } = useQuery<ExecutiveProject[]>({
    queryKey: ['executive-view'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/executive-view');
      const data = await response.json();
      console.log('Executive view data loaded:', data);
      return data;
    }
  });

  const timelineMonths = useMemo(() => {
    switch (selectedScale) {
      case '3-months': return 3;
      case '6-months': return 6;
      case '2-years': return 24;
      default: return 12;
    }
  }, [selectedScale]);

  const startDate = useMemo(() => {
    const now = new Date(2024, 0, 1);
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const endDate = useMemo(() => {
    const end = addMonths(startDate, timelineMonths);
    return new Date(end.getFullYear(), end.getMonth() + 1, 0);
  }, [startDate, timelineMonths]);

  const timelineMarkers = useMemo(() => {
    const markers = [];
    let currentDate = startDate;
    const totalMonths = timelineMonths;
    
    // Calculate column width - add extra for the entity name column
    const timelineWidth = 100;
    const columnWidth = timelineWidth / totalMonths;
    
    for (let i = 0; i < totalMonths; i++) {
      const year = currentDate.getFullYear();
      const month = format(currentDate, 'MMM');
      
      markers.push({
        label: month,
        year,
        width: `${columnWidth}%`
      });
      
      currentDate = addMonths(currentDate, 1);
    }
    
    return markers;
  }, [startDate, timelineMonths]);

  const areas = useMemo(() => {
    if (!executiveData?.length) return [];
    return Array.from(new Set(executiveData.map(p => p.area_name)));
  }, [executiveData]);

  const getProjectDates = useCallback((project: ExecutiveProject) => {
    const start = parseISO(project.start_date);
    const end = parseISO(project.end_date);
    
    // Ensure end date is at the end of the month
    return {
      start: new Date(start.getFullYear(), start.getMonth(), 1),
      end: new Date(end.getFullYear(), end.getMonth() + 1, 0)
    };
  }, []);

  const renderTimeline = useCallback((areaName: string, teamName: string) => {
    if (!executiveData) return null;

    const teamProjects = executiveData.filter(p => 
      p.area_name === areaName && p.team_name === teamName
    );

    if (teamProjects.length === 0) {
      return null;
    }

    const projectRows: { [key: string]: number } = {};
    let maxRow = 0;

    // Assign rows to avoid overlapping
    teamProjects.forEach(project => {
      const { start, end } = getProjectDates(project);
      
      // Check if project is within timeline
      const projectStart = start.getTime();
      const projectEnd = end.getTime();
      const timelineStart = startDate.getTime();
      const timelineEnd = endDate.getTime();

      const isVisible = (
        (projectStart >= timelineStart && projectStart <= timelineEnd) || // Start is within timeline
        (projectEnd >= timelineStart && projectEnd <= timelineEnd) ||     // End is within timeline
        (projectStart <= timelineStart && projectEnd >= timelineEnd)      // Project spans timeline
      );

      if (!isVisible) return;

      projectRows[project.project_title] = maxRow;
      maxRow++;
    });

    return (
      <div className="relative pl-4 pr-4 mt-2">
        <div 
          className="relative bg-gray-50"
          style={{ 
            height: `${Math.max((maxRow + 1) * 40, 40)}px`,
            minHeight: '40px',
            width: '100%'
          }}
        >
          {teamProjects.map(project => {
            const { start, end } = getProjectDates(project);
            
            const projectStart = start.getTime();
            const projectEnd = end.getTime();
            const timelineStart = startDate.getTime();
            const timelineEnd = endDate.getTime();

            const isVisible = (
              (projectStart >= timelineStart && projectStart <= timelineEnd) ||
              (projectEnd >= timelineStart && projectEnd <= timelineEnd) ||
              (projectStart <= timelineStart && projectEnd >= timelineEnd)
            );

            if (!isVisible) return null;

            const row = projectRows[project.project_title];
            
            // Calculate position and width
            const startPosition = Math.max(0, (projectStart - timelineStart) / (timelineEnd - timelineStart));
            const endPosition = Math.min(1, (projectEnd - timelineStart) / (timelineEnd - timelineStart));
            const width = Math.max((endPosition - startPosition) * 100, 5);

            return (
              <div
                key={project.project_title}
                className={`absolute h-8 rounded-lg cursor-pointer transition-all ${getTypeColor(project.project_type)} border shadow-sm hover:shadow-md`}
                style={{
                  left: `${startPosition * 100}%`,
                  width: `${width}%`,
                  top: `${row * 40 + 4}px`,
                  zIndex: 10
                }}
                onClick={() => navigate(`/projects/${project.project_id}/impact`)}
              >
                <div className="px-3 py-1.5 text-xs font-medium truncate flex items-center justify-between">
                  <span className="truncate">{project.project_title}</span>
                  <span className="text-xs opacity-75 ml-2 whitespace-nowrap">
                    {format(start, 'MMM')} - {format(end, 'MMM')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [executiveData, getProjectDates, startDate, endDate, navigate]);

  // Add loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Add empty state
  if (!executiveData?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <Layers className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">No Projects Found</h2>
        <p>There are no projects configured in the system.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Area Roadmaps</h1>
        <p className="text-sm text-gray-600 mt-1">
          Strategic initiatives across areas and teams
        </p>
      </div>

      {/* Timeline Scale Selector */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Timeline:</label>
          <select
            value={selectedScale}
            onChange={(e) => setSelectedScale(e.target.value as TimelineScale)}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value="3-months">3 Months</option>
            <option value="6-months">6 Months</option>
            <option value="1-year">1 Year</option>
            <option value="2-years">2 Years</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Timeline Header */}
        <div className="border-b">
          <div className="flex">
            {/* Year row */}
            <div className="flex" style={{ width: '100%' }}>
              {timelineMarkers.reduce((acc: JSX.Element[], marker, idx) => {
                if (idx === 0 || marker.year !== timelineMarkers[idx - 1].year) {
                  // Calculate how many months are in this year
                  const monthsInYear = timelineMarkers.filter(m => m.year === marker.year).length;
                  acc.push(
                    <div
                      key={`year-${marker.year}`}
                      className="text-xs font-medium text-gray-500 text-center border-r"
                      style={{ width: `${monthsInYear * parseFloat(marker.width)}%` }}
                    >
                      {marker.year}
                    </div>
                  );
                }
                return acc;
              }, [])}
            </div>
          </div>
          {/* Month row */}
          <div className="flex">
            {timelineMarkers.map((marker, idx) => (
              <div
                key={`month-${idx}`}
                className="text-xs text-gray-500 p-2 text-center border-r last:border-r-0"
                style={{ width: marker.width }}
              >
                {marker.label}
              </div>
            ))}
          </div>
        </div>

        {/* Areas and Teams */}
        <div className="divide-y">
          {areas.map(areaName => {
            const areaProjects = executiveData.filter(p => p.area_name === areaName);
            const teams = Array.from(new Set(areaProjects.map(p => p.team_name)));
            const isAreaExpanded = expandedItems.has(areaName);
            const metrics = areaProjects[0];

            return (
              <div key={areaName} className="bg-white">
                {/* Area Header */}
                <div
                  className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    const newExpanded = new Set(expandedItems);
                    if (isAreaExpanded) {
                      newExpanded.delete(areaName);
                    } else {
                      newExpanded.add(areaName);
                    }
                    setExpandedItems(newExpanded);
                  }}
                >
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${
                      isAreaExpanded ? 'rotate-90' : ''
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-900 ml-2">{areaName}</span>
                  <div className="ml-4 flex items-center space-x-4 text-xs text-gray-500">
                    <span>{metrics.area_project_count} Projects</span>
                    <span>{metrics.area_in_progress_count} In Progress</span>
                    <span>{metrics.area_planned_count} Planned</span>
                  </div>
                </div>

                {/* Teams */}
                {isAreaExpanded && teams.map(teamName => {
                  const teamProjects = executiveData.filter(p => 
                    p.area_name === areaName && p.team_name === teamName
                  );
                  const teamMetrics = teamProjects[0];

                  return (
                    <div key={teamName} className="pl-8 pr-4 py-2 border-t">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-700">{teamName}</span>
                        <div className="ml-4 flex items-center space-x-4 text-xs text-gray-500">
                          <span>{teamMetrics.team_project_count} Projects</span>
                        </div>
                      </div>
                      {renderTimeline(areaName, teamName)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="p-4 border-t">
          <div className="text-sm text-gray-600 mb-2">Project Types:</div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-sm mr-2 ${getTypeColor('infrastructure')}`} />
              <span className="text-sm text-gray-600">Infrastructure</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-sm mr-2 ${getTypeColor('security')}`} />
              <span className="text-sm text-gray-600">Security</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-sm mr-2 ${getTypeColor('innovation')}`} />
              <span className="text-sm text-gray-600">Innovation</span>
            </div>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-sm mr-2 ${getTypeColor('decommission')}`} />
              <span className="text-sm text-gray-600">Decommission</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveView; 