export type Role = 'USER' | 'ADMIN';
  
export interface User {
id: number;
auth0Id: string;
tenantId: number;
name: string | null;
role: Role;
tenant: Tenant;
machines: Machine[];
}

export interface Tenant {
id: number;
name: string;
codes: Code[];
machines: Machine[];
users: User[];
}

export interface Code {
id: number;
code: string;
email: string;
valid: boolean;
tenantId: number;
tenant: Tenant;
}

export interface Machine {
id: number;
name: string;
description: string | null;
generalNotes: string | null;
maintenanceNotes: string | null;
prompt: string | null;
isActive: boolean;
tenantId: number;
jobs?: Job[];
tenant?: Tenant;
users?: User[];
}

export interface Job {
id: number;
name: string;
part: string | null;
description: string | null;
setupNotes: string | null;
operationNotes: string | null;
qualityNotes: string | null;
prompt: string | null;
gCode: string | null;
isActive: boolean;
machineId: number;
machine: Machine;
}