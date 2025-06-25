import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { withAuth } from '@/lib/withAuth';

async function handler(req: Request) {
  if (req.method !== 'GET') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  try {
    await connectDB();
    const users = await User.find({}).select('-password');
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching users', error },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler, { roles: ['admin'] }); 