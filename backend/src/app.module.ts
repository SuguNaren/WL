import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { WorkloadsModule } from './workloads/workloads.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example']
    }),
    AuthModule,
    EmployeesModule,
    WorkloadsModule,
    ReportsModule
  ],
  providers: [PrismaService]
})
export class AppModule {}
