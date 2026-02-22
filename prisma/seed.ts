import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function main() {
  const prisma = new PrismaClient()
  
  try {
    const hashedPassword = await bcrypt.hash('password123', 10)

    // Create Admins
    await prisma.user.create({
      data: { email: 'lukas@test.de', name: 'Lukas', role: 'ADMIN', password: hashedPassword }
    })
    await prisma.user.create({
      data: { email: 'ben@test.de', name: 'Ben', role: 'ADMIN', password: hashedPassword }
    })
    await prisma.user.create({
      data: { email: 'christoph@test.de', name: 'Christoph', role: 'ADMIN', password: hashedPassword }
    })

    // Create Closers
    await prisma.user.create({
      data: { email: 'alex@test.de', name: 'Alex', role: 'CLOSER', password: hashedPassword }
    })
    await prisma.user.create({
      data: { email: 'niklas@test.de', name: 'Niklas', role: 'CLOSER', password: hashedPassword }
    })

    console.log('Users created!')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)
