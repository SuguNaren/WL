import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateWorkloadDto } from './dto/create-workload.dto';
import { UpdateWorkloadDto } from './dto/update-workload.dto';

function formatDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

@Injectable()
export class WorkloadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: { role: string; employeeId?: string }, dto: CreateWorkloadDto) {
    if (!user.employeeId) {
      throw new ForbiddenException('Only employees can add workloads');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { employeeId: user.employeeId }
    });

    if (!employee) {
      throw new ForbiddenException('Employee not found');
    }

    return this.prisma.workload.create({
      data: {
        employeeId: employee.id,
        workDate: new Date(dto.workDate),
        workType: dto.workType,
        workDescription: dto.workDescription ?? '',
        workSharedByTeam: dto.workSharedByTeam ?? '',
        detailedDescription: dto.detailedDescription,
        status: dto.status,
        otherStatus: dto.otherStatus || null
      },
      include: { employee: true }
    });
  }

  async update(user: { role: string; employeeId?: string }, id: number, dto: UpdateWorkloadDto) {
    if (!user.employeeId) {
      throw new ForbiddenException('Only employees can edit workloads');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { employeeId: user.employeeId }
    });

    if (!employee) {
      throw new ForbiddenException('Employee not found');
    }

    const workload = await this.prisma.workload.findUnique({
      where: { id }
    });

    if (!workload || workload.employeeId !== employee.id) {
      throw new NotFoundException('Workload not found');
    }

    return this.prisma.workload.update({
      where: { id },
      data: {
        workDate: new Date(dto.workDate),
        workType: dto.workType,
        workDescription: dto.workDescription ?? '',
        workSharedByTeam: dto.workSharedByTeam ?? '',
        detailedDescription: dto.detailedDescription,
        status: dto.status,
        otherStatus: dto.otherStatus || null
      },
      include: { employee: true }
    });
  }

  async findForUser(user: { role: string; employeeId?: string }) {
    const where =
      user.role === 'ADMIN' || !user.employeeId
        ? {}
        : {
            employee: {
              employeeId: user.employeeId
            }
          };

    const rows = await this.prisma.workload.findMany({
      where,
      include: { employee: true },
      orderBy: [{ workDate: 'desc' }, { createdAt: 'desc' }]
    });

    return rows.map((row: (typeof rows)[number]) => ({
      ...row,
      workDate: formatDate(row.workDate)
    }));
  }
}
