import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { PrismaService } from '../prisma.service';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService, PrismaService, RolesGuard]
})
export class EmployeesModule {}
