import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWorkloadDto } from './dto/create-workload.dto';
import { UpdateWorkloadDto } from './dto/update-workload.dto';
import { WorkloadsService } from './workloads.service';

@Controller('workloads')
@UseGuards(JwtAuthGuard)
export class WorkloadsController {
  constructor(private readonly workloadsService: WorkloadsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateWorkloadDto) {
    return this.workloadsService.create(req.user, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateWorkloadDto) {
    return this.workloadsService.update(req.user, Number(id), dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.workloadsService.findForUser(req.user);
  }
}
