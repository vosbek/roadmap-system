// src/types/index.ts

export interface Organization {
    id: number;
    name: string;
    description?: string;
    contact_info?: string;
  }
  
  export interface Area {
    id: number;
    organization_id: number;
    name: string;
    description?: string;
  }
  
  export interface Team {
    id: number;
    area_id: number;
    name: string;
    description?: string;
  }
  
  export interface Architect {
    id: number;
    name: string;
    email: string;
    contact_info?: string;
  }
  
  export interface Application {
    id: number;
    team_id: number;
    architect_id: number;
    name: string;
    description?: string;
    status?: string;
  }
  
  export interface Project {
    id: number;
    title: string;
    description?: string;
    type?: string;
    funding_status?: string;
    start_date?: string;
    end_date?: string;
    business_impact?: string;
    status?: string;
  }
  
  export interface RoadmapProject {
    id: number;
    application_id: number;
    project_id: number;
    custom_start_date?: string;
    custom_end_date?: string;
    notes?: string;
  }