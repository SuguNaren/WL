import { IsBoolean, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsNotEmpty()
  employeeId?: string;

  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  designation?: string;

  @IsOptional()
  @IsNotEmpty()
  department?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
