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
    enterprise_id: string;
    subsystems?: Subsystem[];
  }
  
  export interface Project {
    id: number;
    title: string;
    description: string;
    type?: string;
    status: string;
    start_date?: string;
    end_date?: string;
    meta?: Record<string, any>;
    _calculatedRow?: number;
  }
  
  export interface RoadmapProject {
    id: number;
    application_id: number;
    project_id: number;
    custom_start_date?: string;
    custom_end_date?: string;
    notes?: string;
  }
  
  export interface Subsystem {
    id: number;
    application_id: number;
    name: string;
    description?: string;
    enterprise_id: string;
    type: 'web' | 'batch' | 'mainframe' | 'other';
    status?: string;
    projects?: Project[];
  }
  
  export interface Capability {
    id: number;
    subsystem_id: number;
    name: string;
    description: string;
    type: string;
    status: string;
  }
  
  export interface ProjectDetails {
    id: number;
    title: string;
    description: string;
    type: string;
    status: string;
    start_date: string;
    end_date: string;
    subsystem: {
      id: number;
      name: string;
      type: string;
      application: {
        id: number;
        name: string;
        status: string;
      };
    };
    meta: {
      funded: boolean;
      high_priority: boolean;
      board_approved: boolean;
      regulatory: boolean;
      business_value: string;
      implementation_risk: string;
      business_impact?: string;
      project_type?: string;
      capability_type?: string;
      retirement_impact?: string;
    };
    capabilities: Array<{
      id: number;
      name: string;
      type: string;
      status: string;
    }>;
    dependencies: Array<{
      id: number;
      title: string;
      type: string;
      status: string;
    }>;
  }