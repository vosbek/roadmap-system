import React, { useState, CSSProperties } from 'react';
import { 
  Plus, Filter, ChevronRight, ChevronDown, Layers,
  Calendar, AlertCircle, Zap, Info, BarChart3,
  X, Rocket, Power, Wrench, Trash2
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { projectsApi, applicationsApi, capabilitiesApi } from '../../services/api';
import type { Project, Application, Subsystem, Capability } from '../../types';
import { format, differenceInMonths, parseISO, addMonths } from 'date-fns';

interface ProjectTooltipProps {
  project: Project;
  visible: boolean;
  x: number;
  y: number;
}

const ProjectTooltip: React.FC<ProjectTooltipProps> = ({ project, visible, x, y }) => {
  if (!visible) return null;

  return (
    <div 
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 pointer-events-none"
      style={{ 
        left: `${x + 16}px`, 
        top: `${y - 8}px`,
        animation: 'fadeIn 0.2s ease-in-out'
      }}
    >
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-gray-900">{project.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <span className={`inline-flex items-center px-2 py-0.5 ml-2 rounded-full text-xs font-medium ${
              project.type?.toLowerCase() === 'new capability' ? 'bg-emerald-100 text-emerald-800' :
              project.type?.toLowerCase() === 'business initiative' ? 'bg-blue-100 text-blue-800' :
              project.type?.toLowerCase() === 'infrastructure' ? 'bg-amber-100 text-amber-800' :
              project.type?.toLowerCase() === 'decommission' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.type}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <span className="ml-2 text-gray-900">{project.status}</span>
          </div>
          <div>
            <span className="text-gray-500">Start:</span>
            <span className="ml-2 text-gray-900">{format(parseISO(project.start_date || ''), 'MMM yyyy')}</span>
          </div>
          <div>
            <span className="text-gray-500">End:</span>
            <span className="ml-2 text-gray-900">{format(parseISO(project.end_date || ''), 'MMM yyyy')}</span>
          </div>
          {project.meta?.business_value && (
            <div>
              <span className="text-gray-500">Value:</span>
              <span className="ml-2 text-gray-900 capitalize">{project.meta.business_value}</span>
            </div>
          )}
          {project.meta?.implementation_risk && (
            <div>
              <span className="text-gray-500">Risk:</span>
              <span className="ml-2 text-gray-900 capitalize">{project.meta.implementation_risk}</span>
            </div>
          )}
        </div>
        {project.meta?.business_impact && (
          <div>
            <span className="text-gray-500 text-sm">Business Impact:</span>
            <p className="text-sm text-gray-900 mt-1">{project.meta.business_impact}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const RoadmapView: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1-year');
  const [expandedApps, setExpandedApps] = useState<Set<number>>(new Set());
  const [selectedView, setSelectedView] = useState<'timeline' | 'capability'>('timeline');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCreateType, setSelectedCreateType] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    project: Project | null;
    x: number;
    y: number;
  }>({
    visible: false,
    project: null,
    x: 0,
    y: 0
  });
  const startDate = new Date(2024, 0, 1);

  const getTimeframeMonths = (): number => {
    switch (selectedTimeframe) {
      case '1-year':
        return 12;
      case '2-year':
        return 24;
      case '3-year':
      default:
        return 36;
    }
  };

  const timeframeMonths = getTimeframeMonths();
  const years = Array.from(
    { length: Math.ceil(timeframeMonths / 12) },
    (_, i) => (2024 + i).toString()
  );
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const { data: applications, isLoading: isLoadingApps, refetch: refetchApplications } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await applicationsApi.getAll();
      return response.data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });

  const { data: capabilities } = useQuery<Capability[]>({
    queryKey: ['capabilities'],
    queryFn: async () => {
      const response = await capabilitiesApi.getAll();
      return response.data;
    }
  });

  const toggleExpanded = (appId: number) => {
    const newExpanded = new Set(expandedApps);
    if (newExpanded.has(appId)) {
      newExpanded.delete(appId);
    } else {
      newExpanded.add(appId);
    }
    setExpandedApps(newExpanded);
  };

  const getProjectStyle = (project: Project, index: number, projects: Project[]): CSSProperties => {
    const startDate = parseISO(project.start_date || '');
    const endDate = parseISO(project.end_date || '');
    const timelineStart = new Date(2024, 0, 1);
    
    // Calculate months for width and position
    const totalMonths = differenceInMonths(endDate, startDate);
    const monthsSinceStart = differenceInMonths(startDate, timelineStart);

    // Simple row assignment - one project per row
    const row = index;
    
    // Constants for sizing - reduced by ~10%
    const barHeight = 32; // Reduced from 36
    const verticalGap = 14; // Reduced from 16
    const verticalPosition = row * (barHeight + verticalGap);

    // Calculate left position and width
    const leftPosition = (monthsSinceStart * 100) / timeframeMonths;
    const widthPercentage = (totalMonths * 100) / timeframeMonths;
    
    return {
      position: 'absolute',
      left: `${leftPosition}%`,
      width: `${widthPercentage}%`,
      top: `${verticalPosition}px`,
      height: `${barHeight}px`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 0.75rem',
      borderRadius: '0.5rem',
      color: 'white',
      fontSize: '0.875rem',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      zIndex: 10,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      backdropFilter: 'brightness(1.1)',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)'
    };
  };

  // Get color based on project type
  const getTypeColor = (type: string | undefined): string => {
    switch (type?.toLowerCase()) {
      case 'new capability':
        return 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 ring-1 ring-emerald-600/30 shadow-[0_4px_12px_-2px_rgba(5,150,105,0.3),0_2px_6px_-1px_rgba(5,150,105,0.2)]';
      case 'business initiative':
        return 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 ring-1 ring-blue-600/30 shadow-[0_4px_12px_-2px_rgba(37,99,235,0.3),0_2px_6px_-1px_rgba(37,99,235,0.2)]';
      case 'infrastructure':
        return 'bg-gradient-to-r from-cyan-600 via-cyan-500 to-cyan-400 ring-1 ring-cyan-600/30 shadow-[0_4px_12px_-2px_rgba(8,145,178,0.3),0_2px_6px_-1px_rgba(8,145,178,0.2)]';
      case 'innovation':
        return 'bg-gradient-to-r from-violet-600 via-violet-500 to-violet-400 ring-1 ring-violet-600/30 shadow-[0_4px_12px_-2px_rgba(124,58,237,0.3),0_2px_6px_-1px_rgba(124,58,237,0.2)]';
      case 'decommission':
        return 'bg-gradient-to-r from-red-600 via-red-500 to-red-400 ring-1 ring-red-600/30 shadow-[0_4px_12px_-2px_rgba(220,38,38,0.3),0_2px_6px_-1px_rgba(220,38,38,0.2)]';
      default:
        return 'bg-gradient-to-r from-gray-600 via-gray-500 to-gray-400 ring-1 ring-gray-600/30 shadow-[0_4px_12px_-2px_rgba(75,85,99,0.3),0_2px_6px_-1px_rgba(75,85,99,0.2)]';
    }
  };

  const renderMonthSeparators = () => (
    <div className="absolute inset-0 grid" style={{ 
      gridTemplateColumns: `repeat(${timeframeMonths}, 1fr)`,
      pointerEvents: 'none'
    }}>
      {Array.from({ length: timeframeMonths }).map((_, index) => (
        <div
          key={index}
          className={`border-l ${index === 0 ? 'border-gray-300' : 'border-gray-200 border-dashed'} h-full`}
          style={{
            marginLeft: index === 0 ? '-1px' : undefined
          }}
        />
      ))}
    </div>
  );

  const getCapabilityStatus = (capability: Capability, subsystem: Subsystem, targetDate: Date) => {
    // Find projects that affect this capability
    const projects = subsystem.projects?.filter(project => {
      const startDate = parseISO(project.start_date || '');
      return startDate <= targetDate;
    }) || [];

    // Check for decommissioning projects
    const decommissionProject = projects.find(project => 
      project.type?.toLowerCase() === 'decommission' && 
      project.title.toLowerCase().includes(capability.name.toLowerCase())
    );

    // Check for new capability projects
    const isNew = projects.some(project => 
      project.type?.toLowerCase() === 'new capability' && 
      project.title.toLowerCase().includes(capability.name.toLowerCase())
    );

    if (decommissionProject) {
      const decommissionDate = parseISO(decommissionProject.start_date || '');
      const threeMonthsFromNow = addMonths(new Date(), 3);
      
      if (decommissionDate <= new Date()) {
        return 'decommissioned';
      } else if (decommissionDate <= threeMonthsFromNow) {
        return 'leaving-soon';
      }
    }

    if (isNew) return 'new';
    return 'current';
  };

  const createTypes = [
    { id: 'new-capability', name: 'New Capability', icon: Rocket, color: 'text-emerald-600', description: 'Add a new business or technical capability' },
    { id: 'project', name: 'Project', icon: Calendar, color: 'text-indigo-600', description: 'Create a new project or initiative' },
    { id: 'enhancement', name: 'Enhancement', icon: Wrench, color: 'text-blue-600', description: 'Improve existing capabilities or infrastructure' },
    { id: 'infrastructure', name: 'Infrastructure', icon: Power, color: 'text-amber-600', description: 'Update or add new infrastructure components' },
    { id: 'retirement', name: 'Retirement', icon: Trash2, color: 'text-red-600', description: 'Plan the retirement of capabilities or systems' },
  ];

  const handleCreateInitiative = async () => {
    const form = document.querySelector('form');
    if (!form) return;

    const formData = new FormData(form);
    
    // Validate required fields
    const startDate = formData.get('start_date');
    const endDate = formData.get('end_date');
    const title = formData.get('title');
    const description = formData.get('description');
    const subsystemId = formData.get('subsystem_id');

    if (!startDate || !endDate || !title || !description || !subsystemId) {
      alert('Please fill in all required fields');
      return;
    }

    // Map the selected type to the correct project type
    let projectType = selectedCreateType;
    switch (selectedCreateType) {
      case 'new-capability':
        projectType = 'new capability';
        break;
      case 'retirement':
        projectType = 'decommission';
        break;
      // Keep other types as is
    }

    // Get the selected subsystem
    const selectedSubsystem = applications?.find(app => app.subsystems?.some(sub => sub.id === Number(subsystemId)))
      ?.subsystems?.find(sub => sub.id === Number(subsystemId));

    if (!selectedSubsystem) {
      alert('Please select a valid subsystem');
      return;
    }

    console.log('Selected subsystem:', selectedSubsystem);
    console.log('Current applications data:', applications);
    console.log('Current subsystem projects:', selectedSubsystem.projects);

    const data = {
      title: title,
      description: description,
      start_date: startDate,
      end_date: endDate,
      subsystem_id: Number(subsystemId),
      type: projectType,
      status: 'planned',
      meta: {
        funded: formData.get('funded') === 'on',
        high_priority: formData.get('high_priority') === 'on',
        board_approved: formData.get('board_approved') === 'on',
        regulatory: formData.get('regulatory') === 'on',
        business_value: formData.get('business_value') || null,
        implementation_risk: formData.get('implementation_risk') || null,
        project_type: formData.get('project_type') || null,
        business_impact: formData.get('business_impact') || null,
        capability_type: formData.get('capability_type') || null,
        retirement_impact: formData.get('retirement_impact') || null
      }
    };

    console.log('Creating initiative with data:', data);

    try {
      const response = await projectsApi.createInitiative(data);
      console.log('Server response:', response);
      console.log('Response data:', response.data);

      if (response.data?.id) {
        // Close the modal and reset state
        setIsCreateModalOpen(false);
        setSelectedCreateType(null);

        // Invalidate and refetch the data
        await queryClient.invalidateQueries({ queryKey: ['architect-applications'] });
        await queryClient.invalidateQueries({ queryKey: ['applications'] });
        
        // Force a refetch with fresh data
        await refetchApplications({
          throwOnError: true,
          cancelRefetch: true
        });

        // Show success message
        alert('Initiative created successfully!');
      } else {
        console.error('Failed to create initiative: No data returned');
        alert('Failed to create initiative. Please try again.');
      }
    } catch (error: any) {
      console.error('Failed to create initiative:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
      const details = error?.response?.data?.details || '';
      alert(`Failed to create initiative: ${errorMessage}\n${details}`);
    }
  };

  if (isLoadingApps) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Enhanced Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="px-6 py-4">
        <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Application Portfolio Roadmap</h1>
              <p className="text-sm text-gray-500 mt-1">Strategic view of enterprise applications and capabilities</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                <button
                  onClick={() => setSelectedView('timeline')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedView === 'timeline'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline-block mr-1" />
                  Timeline
                </button>
                <button
                  onClick={() => setSelectedView('capability')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedView === 'capability'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline-block mr-1" />
                  Capability View
                </button>
              </div>

              <select 
                className="px-3 py-1.5 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
              >
                <option value="1-year">1 Year View</option>
                <option value="2-year">2 Year View</option>
                <option value="3-year">3 Year View</option>
              </select>

              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <Filter className="w-4 h-4 mr-1.5" />
                Filter
              </button>

              <button 
                onClick={() => {
                  setSelectedAppId(applications?.[0]?.id || null);
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add Initiative
              </button>
            </div>
          </div>
        </div>

        {/* Month header row */}
        <div className="px-6 py-2 border-t flex items-center bg-gray-50">
          <div className="w-64 flex-shrink-0 border-r border-gray-200" />
          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${timeframeMonths}, 1fr)` }}>
            {Array.from({ length: timeframeMonths }).map((_, index) => {
              const currentDate = addMonths(startDate, index);
              return (
                <div 
                  key={index} 
                  className={`text-xs text-center py-2 ${
                    index === 0 ? 'border-l border-gray-300' : 'border-l border-gray-200 border-dashed'
                  }`}
                >
                  <span className="text-gray-600 font-medium">
                    {format(currentDate, 'MMM yyyy')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {selectedView === 'timeline' ? (
          // Timeline View
          <div className="h-full flex">
            <div className="flex-1 overflow-auto">
              {applications?.map((app) => (
                <React.Fragment key={app.id}>
                  {/* Application Row */}
                  <div className="flex border-b border-gray-200 relative">
                    <div className="w-64 flex-shrink-0 p-4 border-r border-gray-200 bg-gray-50/80 shadow-[1px_0_0_0_rgba(0,0,0,0.1)] hover:bg-white transition-colors duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">
                            <button 
                              onClick={() => toggleExpanded(app.id)}
                              className="hover:bg-indigo-50 rounded-md p-0.5 transition-colors duration-200"
                            >
                              {expandedApps.has(app.id) ? (
                                <ChevronDown className="w-5 h-5 text-indigo-600 transition-transform duration-200" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-indigo-600 transition-transform duration-200" />
                              )}
                            </button>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <h3 className="text-base font-semibold text-gray-900 tracking-tight">
                                {app.name}
                              </h3>
                              <div className="ml-2 flex-shrink-0">
                                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium 
                                  ${expandedApps.has(app.id) ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'}
                                  rounded-full transition-colors duration-200 shadow-sm`}>
                                  {app.status}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">
                              {app.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 relative h-16 bg-white">
                      {renderMonthSeparators()}
                    </div>
                  </div>

                  {/* Subsystem Rows */}
                  {expandedApps.has(app.id) && app.subsystems?.map((subsystem) => (
                    <div 
                      key={subsystem.id}
                      className="flex border-b border-gray-200 relative"
                    >
                      <div className="w-64 flex-shrink-0 p-4 border-r border-gray-200 bg-white pl-12 hover:bg-gray-50 transition-colors duration-200">
                        <div className="relative">
                          <div className="flex items-center space-x-3">
                            <div className={`flex-shrink-0 w-1.5 h-8 rounded-full shadow-sm ${
                              subsystem.type === 'web' ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' :
                              subsystem.type === 'batch' ? 'bg-gradient-to-b from-cyan-400 to-cyan-600' :
                              'bg-gradient-to-b from-violet-400 to-violet-600'
                            }`} />
                            <div className="min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 flex items-center">
                                {subsystem.name}
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full shadow-sm">
                                  Enterprise ID: {subsystem.enterprise_id}
                                </span>
                              </h4>
                              <div className="flex items-center mt-1 space-x-2">
                                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md shadow-sm
                                  ${subsystem.type === 'web' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' :
                                    subsystem.type === 'batch' ? 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100' :
                                    'bg-violet-50 text-violet-700 ring-1 ring-violet-100'}`}>
                                  {subsystem.type}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {subsystem.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 relative bg-white border-t border-gray-200" style={{ 
                        height: `${(subsystem.projects?.length || 0) * 46 + 24}px`,
                        minHeight: '120px'
                      }}>
                        {renderMonthSeparators()}
                        {subsystem.projects?.sort((a, b) => 
                          new Date(a.start_date || '').getTime() - new Date(b.start_date || '').getTime()
                        ).map((project: Project, index: number) => (
                          <div
                            key={project.id}
                            style={{
                              ...getProjectStyle(project, index, subsystem.projects || []),
                              top: `${(index * (32 + 14)) + 4}px`,
                              left: `calc(${getProjectStyle(project, index, subsystem.projects || []).left} + 4px)`,
                              width: `calc(${getProjectStyle(project, index, subsystem.projects || []).width} - 8px)`
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/projects/${project.id}/impact`);
                            }}
                            onMouseEnter={(e) => {
                              const scrollContainer = e.currentTarget.closest('.overflow-auto');
                              if (scrollContainer) {
                                setTooltipState({
                                  visible: true,
                                  project,
                                  x: e.clientX,
                                  y: e.clientY
                                });
                              }
                            }}
                            onMouseMove={(e) => {
                              if (tooltipState.visible && tooltipState.project?.id === project.id) {
                                setTooltipState(prev => ({
                                  ...prev,
                                  x: e.clientX,
                                  y: e.clientY
                                }));
                              }
                            }}
                            onMouseLeave={() => {
                              if (tooltipState.project?.id === project.id) {
                                setTooltipState(prev => ({ ...prev, visible: false }));
                              }
                            }}
                            className={`${getTypeColor(project.type)} hover:scale-[1.02] hover:brightness-105 hover:shadow-xl hover:shadow-current/20 transition-all duration-200 group cursor-pointer z-10`}
                          >
                            <span className="truncate flex-1 font-medium group-hover:font-semibold tracking-wide">{project.title}</span>
                            <span className="text-xs opacity-95 whitespace-nowrap ml-2 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md font-medium">
                              {format(parseISO(project.start_date || ''), 'MMM')} - {format(parseISO(project.end_date || ''), 'MMM')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          // Capability View
          <div className="h-full overflow-auto p-6">
            <div className="space-y-8">
              {applications?.map((app) => (
                <div key={app.id} className="bg-white rounded-lg shadow">
                  {/* Application Header */}
                  <div className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{app.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">{app.description}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Subsystems Grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {app.subsystems?.map((subsystem) => {
                        const subsystemCapabilities = capabilities && Array.isArray(capabilities) ?
                          capabilities.filter((cap) => cap.subsystem_id === subsystem.id) : [];

                        return (
                          <div key={subsystem.id} className="border rounded-lg bg-gray-50">
                            <div className="p-4 border-b bg-white rounded-t-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`flex-shrink-0 w-1.5 h-8 rounded-full ${
                                  subsystem.type === 'web' ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' :
                                  subsystem.type === 'batch' ? 'bg-gradient-to-b from-cyan-400 to-cyan-600' :
                                  'bg-gradient-to-b from-violet-400 to-violet-600'
                                }`} />
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900">{subsystem.name}</h3>
                                  <div className="flex items-center mt-1 space-x-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md
                                      ${subsystem.type === 'web' ? 'bg-emerald-50 text-emerald-700' :
                                        subsystem.type === 'batch' ? 'bg-cyan-50 text-cyan-700' :
                                        'bg-violet-50 text-violet-700'}`}>
                                      {subsystem.type}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Enterprise ID: {subsystem.enterprise_id}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Capabilities ({format(addMonths(startDate, getTimeframeMonths()), 'MMM yyyy')})
                              </h4>
                              <div className="space-y-3">
                                {subsystemCapabilities.map((capability) => {
                                  const targetDate = addMonths(startDate, getTimeframeMonths());
                                  const status = getCapabilityStatus(capability, subsystem, targetDate);
                                  
                                  return (
                                    <div 
                                      key={capability.id}
                                      className="flex items-start space-x-2"
                                    >
                                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md
                                        ${capability.type === 'core' ? 
                                          'bg-blue-50 text-blue-700' : 
                                          'bg-gray-50 text-gray-700'}`}>
                                        {capability.type}
                                      </span>
                                      <div>
                                        <div className="flex items-center space-x-2">
                                          <p className="text-sm text-gray-900">{capability.name}</p>
                                          {status === 'new' && (
                                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                              New
                                            </span>
                                          )}
                                          {status === 'decommissioned' && (
                                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                              Decommissioned
                                            </span>
                                          )}
                                          {status === 'leaving-soon' && (
                                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                                              Leaving Soon
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500">{capability.description}</p>
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Show planned new capabilities */}
                                {subsystem.projects?.filter(project => {
                                  const startDate = parseISO(project.start_date || '');
                                  const targetDate = addMonths(new Date(2024, 0, 1), getTimeframeMonths());
                                  return (
                                    project.type?.toLowerCase() === 'new capability' &&
                                    startDate <= targetDate &&
                                    !subsystemCapabilities.some(cap => 
                                      project.title.toLowerCase().includes(cap.name.toLowerCase())
                                    )
                                  );
                                }).map(project => (
                                  <div 
                                    key={project.id}
                                    className="flex items-start space-x-2"
                                  >
                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-green-50 text-green-700">
                                      Planned
                                    </span>
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <p className="text-sm text-gray-900">{project.title}</p>
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                          Coming {format(parseISO(project.start_date || ''), 'MMM yyyy')}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500">{project.description}</p>
                                    </div>
                                  </div>
                                ))}

                                {/* Show planned decommissioning */}
                                {subsystem.projects?.filter(project => {
                                  const startDate = parseISO(project.start_date || '');
                                  const targetDate = addMonths(new Date(2024, 0, 1), getTimeframeMonths());
                                  return (
                                    project.type?.toLowerCase() === 'decommission' &&
                                    startDate <= targetDate &&
                                    !subsystemCapabilities.some(cap => 
                                      project.title.toLowerCase().includes(cap.name.toLowerCase())
                                    )
                                  );
                                }).map(project => (
                                  <div 
                                    key={project.id}
                                    className="flex items-start space-x-2"
                                  >
                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md bg-red-50 text-red-700">
                                      Planned Retirement
                                    </span>
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <p className="text-sm text-gray-900">{project.title}</p>
                                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                          Retiring {format(parseISO(project.start_date || ''), 'MMM yyyy')}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500">{project.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedView === 'timeline' && (
        <div className="border-t bg-white p-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-[#059669] mr-2"></div>
              <span>New Capabilities</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-blue-500 mr-2"></div>
              <span>Business Initiative</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-cyan-500 mr-2"></div>
              <span>Infrastructure</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-violet-500 mr-2"></div>
              <span>Innovation</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded bg-red-500 mr-2"></div>
              <span>Decommissioning</span>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCreateType ? createTypes.find(t => t.id === selectedCreateType)?.name : 'Create New Initiative'}
              </h2>
              <button 
            onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedCreateType(null);
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {!selectedCreateType ? (
                // Type Selection
                <div className="grid grid-cols-2 gap-4">
                  {createTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedCreateType(type.id)}
                      className="flex items-start p-4 border rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left"
                    >
                      <type.icon className={`w-6 h-6 mr-3 mt-1 ${type.color}`} />
              <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-indigo-600">
                          {type.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {type.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // Create Form based on type
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      name="title"
                      type="text"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder={`Enter ${selectedCreateType === 'new-capability' ? 'capability' : 'initiative'} title...`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder={`Describe the ${selectedCreateType === 'new-capability' ? 'capability' : 'initiative'}...`}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        name="start_date"
                        type="date"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        name="end_date"
                        type="date"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subsystem</label>
                    <select 
                      name="subsystem_id"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Select a subsystem...</option>
                      {applications?.find(app => app.id === selectedAppId)?.subsystems?.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Meta Tags Section */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Meta Tags</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center space-x-2">
                          <input name="funded" type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm text-gray-700">Funded</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input name="high_priority" type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm text-gray-700">High Priority</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input name="board_approved" type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm text-gray-700">Board Approved</span>
                        </label>
                      </div>
                      <div>
                        <label className="flex items-center space-x-2">
                          <input name="regulatory" type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          <span className="text-sm text-gray-700">Regulatory Requirement</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Value</label>
                      <select name="business_value" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500">
                        <option value="">Select business value...</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Implementation Risk</label>
                      <select name="implementation_risk" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500">
                        <option value="">Select risk level...</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  {selectedCreateType === 'project' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Project Type</label>
                        <select name="project_type" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500">
                          <option value="">Select project type...</option>
                          <option value="business">Business Initiative</option>
                          <option value="infrastructure">Infrastructure</option>
                          <option value="security">Security</option>
                          <option value="innovation">Innovation</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business Impact</label>
                        <textarea
                          name="business_impact"
                          rows={2}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Describe the business impact..."
                          required
                        />
                      </div>
                    </>
                  )}
                  {(selectedCreateType === 'new-capability' || selectedCreateType === 'enhancement') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Capability Type</label>
                      <select name="capability_type" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500">
                        <option value="">Select capability type...</option>
                        <option value="core">Core</option>
                        <option value="supporting">Supporting</option>
                      </select>
                    </div>
                  )}
                  {selectedCreateType === 'retirement' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Retirement Impact</label>
                      <textarea
                        name="retirement_impact"
                        rows={2}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="Describe the impact of this retirement..."
                        required
                      />
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-between">
              <button
                type="button"
                onClick={() => {
                  if (selectedCreateType) {
                    setSelectedCreateType(null);
                  } else {
                    setIsCreateModalOpen(false);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
              >
                {selectedCreateType ? 'Back' : 'Cancel'}
              </button>
              {selectedCreateType && (
                <button
                  type="button"
                  onClick={handleCreateInitiative}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Create Initiative
                </button>
              )}
            </div>
          </div>
      </div>
      )}

      {/* Add the tooltip */}
      {tooltipState.project && (
        <ProjectTooltip
          project={tooltipState.project}
          visible={tooltipState.visible}
          x={tooltipState.x}
          y={tooltipState.y}
        />
      )}
    </div>
  );
};

// Add styles to handle tooltip animation
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default RoadmapView;