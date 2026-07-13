import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function formatDobPassword(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

async function main() {
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    }
  });

  const employeeDob = new Date('1995-04-14');
  const employee = await prisma.employee.upsert({
    where: { employeeId: 'EMP001' },
    update: {},
    create: {
      employeeId: 'EMP001',
      name: 'Subha Laxmi',
      designation: 'Software Engineer',
      department: 'Software IT Team',
      dob: employeeDob
    }
  });

  await prisma.user.upsert({
    where: { employeeId: employee.id },
    update: {},
    create: {
      employeeId: employee.id,
      passwordHash: await bcrypt.hash(formatDobPassword(employeeDob), 10),
      role: 'EMPLOYEE',
      mustChangePassword: true
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
