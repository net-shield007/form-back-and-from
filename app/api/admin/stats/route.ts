import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [totalFeedbacks, averageScores, recentFeedbacks] = await Promise.all([
      prisma.feedback.count(),
      prisma.feedback.aggregate({
        _avg: {
          toolBuildQuality: true,
          packaging: true,
          onTimeDelivery: true,
          afterSalesSupport: true,
          productUsability: true,
          recommendationScore: true,
        }
      }),
      prisma.feedback.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          contactName: true,
          companyName: true,
          recommendationScore: true,
          createdAt: true,
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalFeedbacks,
        averageScores: averageScores._avg,
        recentFeedbacks
      }
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch stats' 
    }, { status: 500 })
  }
}
