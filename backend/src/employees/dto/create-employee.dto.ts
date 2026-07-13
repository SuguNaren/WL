import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateEmployeeDto {
  @IsNotEmpty()
  employeeId!: string;

  @IsNotEmpty()
  name!: string;

  @IsNotEmpty()
  designation!: string;

  @IsNotEmpty()
  department!: string;

  @IsDateString()
  dob!: string;
}
