import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.login }, { employee: { employeeId: dto.login } }]
      },
      include: { employee: true }
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.employee && !user.employee.isActive) {
      throw new UnauthorizedException('Employee is inactive');
    }

    return this.buildAuthResponse(user);
  }

  async changePassword(userId: number, newPassword: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await bcrypt.hash(newPassword, 10),
        mustChangePassword: false
      },
      include: { employee: true }
    });

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: {
    id: number;
    role: string;
    mustChangePassword: boolean;
    employee?: { employeeId: string; name: string } | null;
  }) {
    const payload = {
      sub: user.id,
      role: user.role,
      employeeId: user.employee?.employeeId ?? null
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        employeeId: user.employee?.employeeId,
        employeeName: user.employee?.name
      }
    };
  }
}
