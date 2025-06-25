import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth } from '@/lib/withAuth';

async function handler(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (req.method !== 'PUT') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  const { id } = params;
  const { role } = await req.json();

  if (!['admin', 'member', 'visitor'].includes(role)) {
    return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
  }

  try {
    await connectDB();
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error updating user role', error },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(handler, { roles: ['admin'] }); 