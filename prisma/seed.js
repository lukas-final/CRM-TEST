const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({})

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  await prisma.user.create({ data: { email: 'lukas@test.de', name: 'Lukas', role: 'ADMIN', password: hashedPassword } })
  await prisma.user.create({ data: { email: 'ben@test.de', name: 'Ben', role: 'ADMIN', password: hashedPassword } })
  await prisma.user.create({ data: { email: 'christoph@test.de', name: 'Christoph', role: 'ADMIN', password: hashedPassword } })
  await prisma.user.create({ data: { email: 'alex@test.de', name: 'Alex', role: 'CLOSER', password: hashedPassword } })
  await prisma.user.create({ data: { email: 'niklas@test.de', name: 'Niklas', role: 'CLOSER', password: hashedPassword } })

  console.log('Users created!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
