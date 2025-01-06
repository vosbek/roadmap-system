import React from 'react';
import { useLocation } from 'react-router-dom';
import { Network, GitMerge } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navigation() {
  const { pathname } = useLocation();

  const navigation = [
    {
      name: 'Team Dependencies',
      href: '/teams/dependencies',
      icon: Network,
      current: pathname === '/teams/dependencies'
    },
    {
      name: 'Team Roadmaps',
      href: '/teams',
      icon: GitMerge,
      current: pathname === '/teams'
    },
  ];

  // ... rest of the component code ...
} 