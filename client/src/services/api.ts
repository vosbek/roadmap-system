// src/services/api.ts
import axios from 'axios';
import { Project, Application } from '../types';
import { RoadmapProject, Capability, ProjectDetails } from '../types/index';

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
  type: string;
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
  getById: (id: number) => api.get<Project>(`/architect/projects/${id}`),
  getImpact: (id: number) => api.get<ProjectImpact>(`/projects/${id}/impact`),
  getProjectDetails: (id: number) => api.get<ProjectDetails>(`/projects/${id}/impact`),
  create: (data: Partial<Project>) => api.post<Project>('/projects', data),
  update: (id: number, data: Partial<Project>) => api.put<Project>(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
  addDependency: (projectId: number, dependencyId: number) => api.post<void>(`/projects/${projectId}/dependencies/${dependencyId}`),
  getArchitectApplications: () => api.get<Application[]>('/architect/applications', {
    params: {
      _t: Date.now()
    },
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }),
  getCapabilities: () => {
    return api.get<Capability[]>('/capabilities');
  },
  createInitiative: async (data: any) => {
    console.log('API: Creating initiative with data:', data);
    const response = await api.post('/initiatives', data);
    console.log('API: Server response:', response);
    return response;
  },
  uploadFile: async (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/ingestion/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return response.json();
  },
  processFile: async (fileId: string) => {
    const response = await fetch(`/api/ingestion/process/${fileId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to process file');
    }

    return response.json();
  },
};

export const applicationsApi = {
  getAll: () => api.get<Application[]>('/applications'),
  getById: (id: number) => api.get<Application>(`/applications/${id}`),
  getRoadmap: (id: number) => api.get<RoadmapProject[]>(`/applications/${id}/roadmap`),
  addProject: (id: number, projectId: number, data: Partial<RoadmapProject>) =>
    api.post<RoadmapProject>(`/applications/${id}/projects/${projectId}`, data)
};

export const capabilitiesApi = {
  getAll: () => api.get<Capability[]>('/capabilities')
};

export default api;