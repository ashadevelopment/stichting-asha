import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '../../../lib/mongodb'
import User from '../../../lib/models/User'
import { getServerSession } from 'next-auth/next'
import { authOptions }   from '../../../lib/authOptions'

export async function GET(request: NextRequest) {
  // 1. Grab the session
  const session = await getServerSession(authOptions)
  const userRole = session?.user?.role

  // 2. Reject if no session, no user, or no role
  if (!session || !session.user || !userRole) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 3. Only allow beheerder & developer
  if (!['beheerder', 'developer'].includes(userRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await dbConnect()

    // 4. Fetch minimal user data
    const users = await User.find({}, 'firstName lastName email role')

    // 5. Map to a lean payload, including the `fullName` virtual
    const usersList = users.map((user) => {
      const u = user.toJSON()
      return {
        _id: u._id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
      }
    })

    return NextResponse.json({ users: usersList })
  } catch (err: any) {
    console.error('Error fetching users list:', err)
    return NextResponse.json(
      { error: 'Failed to fetch users list', details: err.message },
      { status: 500 }
    )
  }
}