export type Employee = {
  id: number;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  dob: string;
  isActive: boolean;
};

export type Workload = {
  id: number;
  workDate: string;
  workType: string;
  workDescription: string;
  workSharedByTeam: string;
  detailedDescription: string;
  status: 'COMPLETED' | 'WORK_IN_PROGRESS' | 'EXCLUDED' | 'OTHER';
  otherStatus?: string | null;
  employeeId?: number;
  employee: {
    employeeId: string;
    name: string;
    department: string;
    designation: string;
  };
};
