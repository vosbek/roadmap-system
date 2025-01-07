import React, { useState, CSSProperties } from 'react';
import { 
  Plus, Filter, ChevronRight, ChevronDown, Layers,
  Calendar, AlertCircle, Zap, Info, BarChart3,
  X, Rocket, Power, Wrench, Trash2
} from 'lucide-react';
import { format, differenceInMonths, parseISO, addMonths } from 'date-fns';
import { Application, Project } from '../../types';
import { useNavigate } from 'react-router-dom';

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
            <span className="text-gray-900 ml-2">{project.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StrategicRoadmapView: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'timeline' | 'capability'>('timeline');
  const [expandedApps, setExpandedApps] = useState<Set<number>>(new Set());
  const [selectedTimeframe, setSelectedTimeframe] = useState('1-year');
  const [tooltipState, setTooltipState] = useState<{ visible: boolean; x: number; y: number; project: Project | null }>({
    visible: false,
    x: 0,
    y: 0,
    project: null
  });

  const startDate = new Date(2024, 0, 1);
  
  // Cache key that includes the view type
  const cacheKey = 'strategic-roadmap-data';
  const cacheDuration = 30 * 60 * 1000; // 30 minutes

  React.useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheDuration) {
            setApplications(data);
            return; // Don't set loading state if we have cached data
          }
        }

        setLoading(true);
        const controller = new AbortController();
        const signal = controller.signal;
        
        const response = await fetch('/api/applications', { 
          signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch applications data');
        }
        const data = await response.json();
        
        // Update cache
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
        
        setApplications(data);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();

    // Prefetch the next data update before cache expires
    const prefetchTimeout = setTimeout(() => {
      fetchApplications();
    }, cacheDuration - 5 * 60 * 1000); // 5 minutes before expiry

    return () => {
      clearTimeout(prefetchTimeout);
    };
  }, []);

  // Add loading skeleton
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <AlertCircle className="inline-block mr-2" />
        {error}
      </div>
    );
  }

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

  const toggleExpanded = (appId: number) => {
    const newExpanded = new Set(expandedApps);
    if (newExpanded.has(appId)) {
      newExpanded.delete(appId);
    } else {
      newExpanded.add(appId);
    }
    setExpandedApps(newExpanded);
  };

  const getProjectStyle = (project: Project, index: number): CSSProperties => {
    if (!project.start_date || !project.end_date) {
      return {
        width: '100%',
        backgroundColor: getTypeColor(project.type),
        position: 'relative',
        height: '32px',
        borderRadius: '0.5rem',
        marginBottom: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '0 0.75rem',
        color: 'white',
        fontSize: '0.875rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        zIndex: 10,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'brightness(1.1)',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)'
      };
    }

    const startDate = parseISO(project.start_date);
    const endDate = parseISO(project.end_date);
    const timelineStart = new Date(2024, 0, 1);
    
    // Calculate months for width and position
    const totalMonths = differenceInMonths(endDate, startDate);
    const monthsSinceStart = differenceInMonths(startDate, timelineStart);

    // Simple row assignment - one project per row
    const row = index;
    
    // Constants for sizing
    const barHeight = 32;
    const verticalGap = 14;
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
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
      backgroundColor: getTypeColor(project.type)
    };
  };

  const getTypeColor = (type: string | undefined): string => {
    switch (type?.toLowerCase()) {
      case 'new capability':
        return '#059669'; // Emerald
      case 'business initiative':
        return '#3B82F6'; // Blue
      case 'infrastructure':
        return '#0EA5E9'; // Cyan
      case 'innovation':
        return '#8B5CF6'; // Violet
      case 'decommission':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
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

  const handleProjectClick = (project: Project) => {
    navigate(`/projects/${project.id}/impact`);
  };

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
                  onClick={() => setView('timeline')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    view === 'timeline'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 inline-block mr-1" />
                  Timeline
                </button>
                <button
                  onClick={() => setView('capability')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    view === 'capability'
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
        {view === 'timeline' ? (
          // Timeline View
          <div className="h-full flex">
            <div className="flex-1 overflow-auto">
              {applications.map((app) => (
                <React.Fragment key={app.id}>
                  {/* Application Row */}
                  <div className="border-b border-gray-200">
                    <div className="flex items-center px-6 py-4">
                      <button
                        onClick={() => toggleExpanded(app.id)}
                        className="flex items-center space-x-2 text-gray-900 hover:text-gray-600"
                      >
                        {expandedApps.has(app.id) ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                        <span className="font-medium">{app.name}</span>
                      </button>
                    </div>

                    {/* Subsystems */}
                    {expandedApps.has(app.id) && app.subsystems?.map((subsystem) => (
                      <div key={subsystem.id} className="border-t border-gray-100">
                        <div className="flex">
                          <div className="w-64 flex-shrink-0 bg-gray-50 px-6 py-4 border-r border-gray-200">
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
                                  ...getProjectStyle(project, index),
                                  top: `${(index * (32 + 14)) + 4}px`,
                                }}
                                onClick={() => handleProjectClick(project)}
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
                                className="hover:scale-[1.02] hover:brightness-105 hover:shadow-xl hover:shadow-current/20 transition-all duration-200 group cursor-pointer z-10"
                              >
                                <span className="truncate flex-1 font-medium group-hover:font-semibold tracking-wide">{project.title}</span>
                                {project.start_date && project.end_date && (
                                  <span className="text-xs opacity-95 whitespace-nowrap ml-2 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-md font-medium">
                                    {format(parseISO(project.start_date), 'MMM')} - {format(parseISO(project.end_date), 'MMM')}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          // Capability View
          <div className="h-full overflow-auto p-6">
            <div className="space-y-8">
              {applications.map((app) => (
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
                      {app.subsystems?.map((subsystem) => (
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
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="space-y-3">
                              {subsystem.projects?.map((project) => (
                                <div 
                                  key={project.id}
                                  className="flex items-start space-x-2 cursor-pointer hover:bg-gray-50 rounded-md p-2 transition-colors"
                                  onClick={() => handleProjectClick(project)}
                                >
                                  {project.type?.toLowerCase() === 'new capability' && <Rocket className="w-5 h-5 text-emerald-500" />}
                                  {project.type?.toLowerCase() === 'business initiative' && <Zap className="w-5 h-5 text-blue-500" />}
                                  {project.type?.toLowerCase() === 'infrastructure' && <Wrench className="w-5 h-5 text-cyan-500" />}
                                  {project.type?.toLowerCase() === 'innovation' && <Power className="w-5 h-5 text-violet-500" />}
                                  {project.type?.toLowerCase() === 'decommission' && <Trash2 className="w-5 h-5 text-red-500" />}
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{project.title}</p>
                                    <p className="text-xs text-gray-500">{project.description}</p>
                                    {project.start_date && project.end_date && (
                                      <p className="text-xs text-gray-400 mt-1">
                                        {format(parseISO(project.start_date), 'MMM yyyy')} - {format(parseISO(project.end_date), 'MMM yyyy')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {view === 'timeline' && (
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

      {tooltipState.visible && tooltipState.project && (
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

export default StrategicRoadmapView; 