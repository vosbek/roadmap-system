export interface Project {
  id: string;
  title: string;
  description: string;
  type?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  project_type: string;
  funding_status?: string;
  business_impact?: string;
  owner_team_id?: string;
  owner_architect_id?: string;
  owner_team_name?: string;
  owner_architect_name?: string;
  is_shared?: boolean;
  meta?: Record<string, any>;
}

export interface Subsystem {
  id: number;
  name: string;
  type?: string;
  status: string;
  enterprise_id: string;
  projects?: Project[];
}

export interface Application {
  id: number;
  name: string;
  description: string;
  status: string;
  subsystems?: Subsystem[];
} 