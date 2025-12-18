import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const feedbackSchema = z.object({
  email: z.string().email('Invalid email address'),
  date: z.string().min(1, 'Date is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  country: z.string().min(1, 'Country is required'),
  salesOrderNumber: z.string().min(1, 'Sales order number is required'),
  toolBuildQuality: z.number().min(1).max(10),
  packaging: z.number().min(1).max(10),
  onTimeDelivery: z.number().min(1).max(10),
  afterSalesSupport: z.number().min(1).max(10),
  productUsability: z.number().min(1).max(10),
  recommendationScore: z.number().min(1).max(10),
  suggestions: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received feedback:', body)
    
    const validatedData = feedbackSchema.parse(body)

    const feedback = await prisma.feedback.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
      }
    })

    console.log('Feedback created:', feedback.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your feedback!',
      id: feedback.id 
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues)
      return NextResponse.json({ 
        success: false, 
        error: 'Validation failed', 
        details: error.issues 
      }, { status: 400 })
    }
    
    console.error('Feedback submission error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to submit feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const whereClause: any = {
      deletedAt: null,
    }

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.feedback.count({
        where: whereClause,
      }),
    ])

    return NextResponse.json({
      success: true,
      data: feedbacks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Fetch feedback error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}
