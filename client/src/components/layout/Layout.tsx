// src/components/layout/Layout.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, GitBranch, Users, Building2, FolderGit2 } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { icon: <LayoutGrid size={20} />, label: 'Dashboard', path: '/' },
    { icon: <GitBranch size={20} />, label: 'Roadmap', path: '/roadmap' },
    { icon: <FolderGit2 size={20} />, label: 'Projects', path: '/projects' },
    { icon: <Users size={20} />, label: 'Teams', path: '/teams' },
    { icon: <Building2 size={20} />, label: 'Organizations', path: '/organizations' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Navigation */}
      <div className="w-64 bg-[#0071bf] border-r border-[#0071bf]/20">
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-6 text-white">Application Roadmap</h2>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                  location.pathname === item.path
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Layout;