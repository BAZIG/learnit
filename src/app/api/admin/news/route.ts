import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import News from '@/models/News';
import { withAuth } from '@/lib/withAuth';

// GET all news for admin (including unpublished)
export const GET = withAuth(async () => {
  try {
    await connectDB();
    
    const news = await News.find({})
      .sort({ updatedAt: -1 })
      .lean();
    
    return NextResponse.json({ news }, { status: 200 });
  } catch (error) {
    console.error('Error fetching news for admin:', error);
    return NextResponse.json(
      { message: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}, { roles: ['admin'] });
