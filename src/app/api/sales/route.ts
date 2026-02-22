import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const role = (session.user as any).role
  
  try {
    let sales
    if (role === 'ADMIN') {
      sales = await prisma.sale.findMany({
        orderBy: { date: 'desc' }
      })
    } else {
      const userId = (session.user as any).id
      sales = await prisma.sale.findMany({
        where: { userId },
        orderBy: { date: 'desc' }
      })
    }
    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const userId = (session.user as any).id
    const userName = (session.user as any).name

    const sale = await prisma.sale.create({
      data: {
        userId,
        closerName: userName,
        date: new Date(body.date),
        amount: parseFloat(body.amount),
        paymentType: body.paymentType,
        installmentMonths: body.installmentMonths ? parseInt(body.installmentMonths) : null,
        monthlyAmount: body.monthlyAmount ? parseFloat(body.monthlyAmount) : null,
        stage: body.stage
      }
    })

    return NextResponse.json(sale)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 })
  }
}
