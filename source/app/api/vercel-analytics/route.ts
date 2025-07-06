import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // For personal accounts, omit the teamId parameter
    const response = await fetch(
      `https://api.vercel.com/v1/analytics/views?projectId=${process.env.VERCEL_PROJECT_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_API_TOKEN}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch analytics data')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching Vercel analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}