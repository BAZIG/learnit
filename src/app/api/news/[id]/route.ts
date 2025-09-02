import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import News from '@/models/News';
import { withAuth } from '@/lib/withAuth';
import mongoose from 'mongoose';

// GET specific news item (public access - only if published)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid news ID' },
        { status: 400 }
      );
    }

    const news = await News.findOne({ 
      _id: params.id, 
      isPublished: true 
    }).lean();
    
    if (!news) {
      return NextResponse.json(
        { message: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ news }, { status: 200 });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { message: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

// PUT update news (admin only)
export const PUT = withAuth(async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid news ID' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      title,
      event,
      affectedAssets,
      expectations,
      isPublished
    } = body;

    const updateData: Partial<{
      title: string;
      event: string;
      affectedAssets: Array<{ ticker: string; impact: string }>;
      expectations: string;
      isPublished: boolean;
      publishedAt: Date | null;
    }> = {};

    if (title !== undefined) updateData.title = title;
    if (event !== undefined) updateData.event = event;
    if (affectedAssets !== undefined) updateData.affectedAssets = affectedAssets;
    if (expectations !== undefined) updateData.expectations = expectations;
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished;
      // If publishing for the first time, set publishedAt
      if (isPublished) {
        const existingNews = await News.findById(params.id);
        if (existingNews && !existingNews.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }
    }

    const updatedNews = await News.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedNews) {
      return NextResponse.json(
        { message: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'News updated successfully',
        news: updatedNews
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      { message: 'Failed to update news' },
      { status: 500 }
    );
  }
}, { roles: ['admin'] });

// DELETE news (admin only)
export const DELETE = withAuth(async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid news ID' },
        { status: 400 }
      );
    }

    const deletedNews = await News.findByIdAndDelete(params.id);

    if (!deletedNews) {
      return NextResponse.json(
        { message: 'News not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'News deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { message: 'Failed to delete news' },
      { status: 500 }
    );
  }
}, { roles: ['admin'] });
