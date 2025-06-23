import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Debug logs removed
    // Connect to MongoDB
    try {
      await connectDB();
    } catch (dbError) {
      return NextResponse.json(
        { message: 'Database connection error', error: dbError },
        { status: 500 }
      );
    }
    // Create the contact document
    try {
      const contact = await Contact.create(body);
      return NextResponse.json(
        { message: 'Message sent successfully', contact },
        { status: 201 }
      );
    } catch (createError) {
      return NextResponse.json(
        { message: 'Error creating contact', error: createError },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Error processing request', error },
      { status: 500 }
    );
  }
} 