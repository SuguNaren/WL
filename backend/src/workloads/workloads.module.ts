import { Module } from '@nestjs/common';
import { WorkloadsController } from './workloads.controller';
import { WorkloadsService } from './workloads.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [WorkloadsController],
  providers: [WorkloadsService, PrismaService]
})
export class WorkloadsModule {}
