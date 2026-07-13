import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

function formatDatePassword(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findUnique({
      where: { employeeId: dto.employeeId }
    });

    if (existing) {
      throw new ConflictException('Employee ID already exists');
    }

    const dob = new Date(dto.dob);
    const employee = await this.prisma.employee.create({
      data: {
        employeeId: dto.employeeId,
        name: dto.name,
        designation: dto.designation,
        department: dto.department,
        dob
      }
    });

    await this.prisma.user.create({
      data: {
        employeeId: employee.id,
        passwordHash: await bcrypt.hash(formatDatePassword(dob), 10),
        role: 'EMPLOYEE',
        mustChangePassword: true
      }
    });

    return employee;
  }

  async findAll() {
    const employees = await this.prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return employees.map((employee: (typeof employees)[number]) => ({
      ...employee,
      dob: formatDatePassword(employee.dob)
    }));
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id }
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (dto.employeeId && dto.employeeId !== employee.employeeId) {
      const existing = await this.prisma.employee.findUnique({
        where: { employeeId: dto.employeeId }
      });

      if (existing) {
        throw new ConflictException('Employee ID already exists');
      }
    }

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: {
        ...(dto.employeeId ? { employeeId: dto.employeeId } : {}),
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.designation ? { designation: dto.designation } : {}),
        ...(dto.department ? { department: dto.department } : {}),
        ...(dto.dob ? { dob: new Date(dto.dob) } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {})
      }
    });

    return {
      ...updatedEmployee,
      dob: formatDatePassword(updatedEmployee.dob)
    };
  }
}
