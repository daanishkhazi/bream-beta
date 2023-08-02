export type Role = 'USER' | 'ADMIN';
  
export interface User {
id: string;
auth0Id?: string;
verified?: boolean;
tenantId?: string;
name: string | null;
role: Role;
tenant?: Tenant;
machines?: Machine[];
}

export interface Tenant {
id: string;
name: string;
codes: Code[];
machines: Machine[];
users: User[];
}

export interface Code {
id: string;
code: string;
email: string;
name: string;
valid: boolean;
tenantId: string;
tenant: Tenant;
}

export interface Machine {
id: string;
name: string;
description: string | null;
generalNotes: string | null;
maintenanceNotes: string | null;
prompt?: string | null;
isActive: boolean;
tenantId?: string;
jobs?: Job[];
tenant?: Tenant;
users?: User[];
}

export interface ChatMachine {
    id: string;
    name: string;
    description: string | null;
    generalNotes: string | null;
    maintenanceNotes: string | null;
    prompt?: string | null;
    isActive: boolean;
    tenantId?: string;
    jobs: Job[];
    tenant?: Tenant;
    users?: User[];
    }

export interface Job {
id: string;
name: string;
part: string | null;
description?: string | null;
setupNotes?: string | null;
operationNotes?: string | null;
qualityNotes?: string | null;
prompt?: string | null;
gCode?: string | null;
isActive: boolean;
machineId?: string;
machine?: Machine;
}
