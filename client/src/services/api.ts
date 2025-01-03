// src/services/api.ts
import axios from 'axios';
import { Project, Application, RoadmapProject } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ProjectImpact {
  id: string;
  title: string;
  status: string;
  metrics: {
    impactedTeams: number;
    organizations: number;
    timeline: string;
    dependencies: number;
  };
  timelineItems: Array<{
    team: string;
    date: string;
    status: 'completed' | 'in-progress' | 'planned';
    progress: number;
  }>;
  orgImpact: Array<{
    name: string;
    teams: number;
    risk: 'low' | 'medium' | 'high';
    impact: string;
  }>;
}

export const projectsApi = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: number) => api.get<Project>(`/projects/${id}`),
  getImpact: (id: number) => api.get<ProjectImpact>(`/projects/${id}/impact`),
  create: (data: Partial<Project>) => api.post<Project>('/projects', data),
  update: (id: number, data: Partial<Project>) => api.put<Project>(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`)
};

export const applicationsApi = {
  getAll: () => api.get<Application[]>('/applications'),
  getById: (id: number) => api.get<Application>(`/applications/${id}`),
  getRoadmap: (id: number) => api.get<RoadmapProject[]>(`/applications/${id}/roadmap`),
  addProject: (id: number, projectId: number, data: Partial<RoadmapProject>) =>
    api.post<RoadmapProject>(`/applications/${id}/projects/${projectId}`, data)
};

export default api;