import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
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

    // Check if user already exists
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: 'User already exists' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { message: 'Error checking existing user', error },
        { status: 500 }
      );
    }

    // Only allow 'admin' role if no admin exists yet
    let assignedRole = 'visitor';
    if (role === 'admin') {
      const adminExists = await User.exists({ role: 'admin' });
      if (!adminExists) {
        assignedRole = 'admin';
      }
    } else if (role === 'member') {
      assignedRole = 'member';
    }

    // Create user
    try {
      const user = await User.create({
        name,
        email,
        password,
        role: assignedRole,
      });

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

      const response = NextResponse.json(
        {
          message: 'User registered successfully',
          user: userWithoutPassword,
          token,
        },
        { status: 201 }
      );

      // Set token in cookie
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });

      return response;
    } catch (createError) {
      return NextResponse.json(
        { message: 'Error creating user', error: createError },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Error processing registration request', error },
      { status: 500 }
    );
  }
} 