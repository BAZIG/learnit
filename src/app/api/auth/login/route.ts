import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    try {
      await connectDB();
    } catch (dbError) {
      return NextResponse.json(
        { message: 'Database connection error', error: dbError },
        { status: 500 }
      );
    }

    // Find user and include password
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Create token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      // Remove password from response
      const userWithoutPassword = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      const response = NextResponse.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token,
      });

      // Set token in cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      return response;
    } catch (userError) {
      return NextResponse.json(
        { message: 'Error finding user', error: userError },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Error processing login request', error },
      { status: 500 }
    );
  }
} 