import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
// Примусово завантажуємо .env файл, який лежить поруч всередині apps/api
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  // Тимчасовий лог для діагностики:
  console.log('🌱 Перевірка .env змінних:', { email, password });

  if (!email || !password) {
    console.error('❌ Помилка: ADMIN_EMAIL або ADMIN_PASSWORD не знайдені в .env');
    process.exit(1);
  }

  console.log('🌱 Запуск сіду бази даних...');

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log(`ℹ️ Адмін з email ${email} вже існує. Пропускаємо створення.`);
    return;
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      role: "ADMIN"
    },
  });

  console.log(`✅ Дефолтного admin (${email}) успішно створено!`);
}

main()
  .catch((e) => {
    console.error('❌ Помилка під час виконання сіду:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });