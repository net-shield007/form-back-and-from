import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('Tritorc@2025', 12)
    
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@tritorc.com' },
      update: {},
      create: {
        email: 'admin@tritorc.com',
        password: hashedPassword,
        name: 'Tritorc Admin',
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Password: Tritorc@2025')
    console.log('\nYou can now login at your /admin/login page')

  } catch (error) {
    console.error('❌ Error creating admin:', error)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
