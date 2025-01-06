import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, GitBranch, Upload, BarChart3, Settings, LayoutGrid, Network, Building2, Share2, LineChart, GitMerge } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-56 bg-gray-900 text-gray-300 py-6 flex flex-col h-screen">
      {/* Enterprise Logo/Name */}
      <div className="px-6 mb-8">
        <h1 className="text-xl font-semibold text-white">Enterprise Architecture</h1>
        <p className="text-sm text-gray-500 mt-1">Portfolio Management</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {/* Main Navigation Group */}
        <div className="space-y-1">
          <Link
            to="/"
            className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-800 hover:text-white group transition-colors ${
              isActive('/') ? 'bg-gray-800 text-white' : ''
            }`}
          >
            <Activity className={`w-5 h-5 mr-3 ${isActive('/') ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
            Portfolio Overview
          </Link>
          <Link
            to="/strategic"
            className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-800 hover:text-white group transition-colors ${
              isActive('/strategic') ? 'bg-gray-800 text-white' : ''
            }`}
          >
            <LineChart className={`w-5 h-5 mr-3 ${isActive('/strategic') ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
            Strategic Roadmap
          </Link>
          <Link
            to="/architect"
            className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-800 hover:text-white group transition-colors ${
              isActive('/architect') ? 'bg-gray-800 text-white' : ''
            }`}
          >
            <Network className={`w-5 h-5 mr-3 ${isActive('/architect') ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
            Application Architecture
          </Link>
        </div>

        {/* Architecture Group */}
        <div className="mt-8">
          <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Architecture Views
          </h2>
          <div className="mt-2 space-y-1">
            <Link
              to="/projects"
              className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-800 hover:text-white group transition-colors ${
                isActive('/projects') ? 'bg-gray-800 text-white' : ''
              }`}
            >
              <LayoutGrid className={`w-5 h-5 mr-3 ${isActive('/projects') ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              Capabilities & Projects
            </Link>
            <Link
              to="/organizations"
              className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-800 hover:text-white group transition-colors ${
                isActive('/organizations') ? 'bg-gray-800 text-white' : ''
              }`}
            >
              <Building2 className={`w-5 h-5 mr-3 ${isActive('/organizations') ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              Organization Structure
            </Link>
            <Link
              to="/teams/dependencies"
              className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-800 hover:text-white group transition-colors ${
                isActive('/teams/dependencies') ? 'bg-gray-800 text-white' : ''
              }`}
            >
              <Network className={`w-5 h-5 mr-3 ${isActive('/teams/dependencies') ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              Team Dependencies
            </Link>
            <Link
              to="/teams/roadmaps"
              className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-800 hover:text-white group transition-colors ${
                isActive('/teams/roadmaps') ? 'bg-gray-800 text-white' : ''
              }`}
            >
              <GitMerge className={`w-5 h-5 mr-3 ${isActive('/teams/roadmaps') ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              Team Roadmaps
            </Link>
          </div>
        </div>

        {/* Data Management Group */}
        <div className="mt-8">
          <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Data Management
          </h2>
          <div className="mt-2 space-y-1">
            <Link
              to="/ingestion"
              className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-800 hover:text-white group transition-colors ${
                isActive('/ingestion') ? 'bg-gray-800 text-white' : ''
              }`}
            >
              <Upload className={`w-5 h-5 mr-3 ${isActive('/ingestion') ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              Data Ingestion
            </Link>
            <Link
              to="/integrations"
              className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-800 hover:text-white group transition-colors ${
                isActive('/integrations') ? 'bg-gray-800 text-white' : ''
              }`}
            >
              <Share2 className={`w-5 h-5 mr-3 ${isActive('/integrations') ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              Integrations
            </Link>
          </div>
        </div>

        {/* Executive View */}
        <div className="mt-8">
          <Link
            to="/executive"
            className={`flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-800 hover:text-white group transition-colors ${
              isActive('/executive') ? 'bg-gray-800 text-white' : ''
            }`}
          >
            <BarChart3 className={`w-5 h-5 mr-3 ${isActive('/executive') ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
            Executive View
          </Link>
        </div>
      </nav>

      {/* Settings Section */}
      <div className="mt-auto px-3">
        <div className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-md cursor-pointer transition-colors">
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </div>
      </div>
    </div>
  );
};

export default Navigation; 