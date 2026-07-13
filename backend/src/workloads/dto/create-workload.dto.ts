import { IsDateString, IsIn, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';

const WORK_STATUS_VALUES = ['COMPLETED', 'WORK_IN_PROGRESS', 'EXCLUDED', 'OTHER'] as const;
type WorkStatusValue = (typeof WORK_STATUS_VALUES)[number];

export class CreateWorkloadDto {
  @IsDateString()
  workDate!: string;

  @IsNotEmpty()
  workType!: string;

  @IsOptional()
  workDescription?: string;

  @IsOptional()
  workSharedByTeam?: string;

  @IsNotEmpty()
  detailedDescription!: string;

  @IsIn(WORK_STATUS_VALUES)
  status!: WorkStatusValue;

  @ValidateIf((object: CreateWorkloadDto) => object.status === 'OTHER')
  @IsNotEmpty()
  otherStatus?: string;
}
