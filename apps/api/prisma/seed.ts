import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/../.env' });

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Error: ADMIN_EMAIL or ADMIN_PASSWORD is missing in .env');
    process.exit(1);
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log(`ℹ️ Admin user with email ${email} already exists. Skipping seed.`);
    return;
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Default admin user has been successfully created!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });