import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import News from '@/models/News';
import { withAuth } from '@/lib/withAuth';

// GET all news (public access - only published news)
export async function GET() {
  try {
    await connectDB();
    
    const news = await News.find({ isPublished: true })
      .sort({ publishedAt: -1 })
      .lean();
    
    return NextResponse.json({ news }, { status: 200 });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { message: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// POST new news (admin only)
export const POST = withAuth(async (req: Request) => {
  try {
    await connectDB();
    
    const body = await req.json();
    const {
      title,
      event,
      affectedAssets,
      expectations,
      isPublished
    } = body;

    // Validate required fields
    if (!title || !event || !expectations) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract user ID from JWT token
    const cookieStore = await import('next/headers').then(m => m.cookies());
    const token = cookieStore.get('token')?.value;
    let createdBy = 'admin';
    
    if (token) {
      try {
        const { jwtVerify } = await import('jose');
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
        const { payload } = await jwtVerify(token, secret);
        createdBy = payload.id as string || 'admin';
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    const newsItem = new News({
      title,
      event,
      affectedAssets: affectedAssets || [],
      expectations,
      isPublished: isPublished || false,
      createdBy
    });

    await newsItem.save();

    return NextResponse.json(
      { 
        message: 'News created successfully',
        news: newsItem
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { message: 'Failed to create news' },
      { status: 500 }
    );
  }
}, { roles: ['admin'] });
