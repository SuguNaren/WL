import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkloadReport(
    user: { role: string; employeeId?: string },
    filters: { fromDate?: string; toDate?: string; department?: string }
  ) {
    const where: Prisma.WorkloadWhereInput = {};

    if (filters.fromDate || filters.toDate) {
      where.workDate = {
        ...(filters.fromDate ? { gte: new Date(filters.fromDate) } : {}),
        ...(filters.toDate ? { lte: new Date(filters.toDate) } : {})
      };
    }

    if (filters.department) {
      where.employee = {
        is: {
          department: {
            contains: filters.department
          }
        }
      };
    }

    if (user.role === 'EMPLOYEE' && user.employeeId) {
      where.employee = {
        ...(where.employee ?? {}),
        is: {
          ...(('is' in (where.employee ?? {}) ? (where.employee as any).is : {}) ?? {}),
          employeeId: user.employeeId
        }
      };
    }

    const rows = await this.prisma.workload.findMany({
      where,
      include: { employee: true },
      orderBy: [{ workDate: 'asc' }, { employee: { name: 'asc' } }]
    });

    return rows.map((row: Prisma.WorkloadGetPayload<{ include: { employee: true } }>) => ({
      id: row.id,
      workDate: formatDate(row.workDate),
      workType: row.workType,
      workDescription: row.workDescription,
      workSharedByTeam: row.workSharedByTeam,
      detailedDescription: row.detailedDescription,
      status: row.status,
      otherStatus: row.otherStatus,
      employee: {
        employeeId: row.employee.employeeId,
        name: row.employee.name,
        department: row.employee.department,
        designation: row.employee.designation
      }
    }));
  }
}
