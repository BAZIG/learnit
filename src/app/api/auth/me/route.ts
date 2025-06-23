import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key'
    );
    const { payload } = await jwtVerify(token, secret);

    // Connect to MongoDB
    await connectDB();

    // Get user
    const user = await User.findById(payload.id).select('-password');
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return both user and JWT payload for debugging
    return NextResponse.json({ user, jwtPayload: payload });
  } catch (error) {
    return NextResponse.json(
      { message: 'Authentication failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 401 }
    );
  }
} 