import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PersonalAnalysis from '@/models/PersonalAnalysis';
import { withAuth } from '@/lib/withAuth';

// GET all personal analyses (public access)
export async function GET() {
  try {
    await connectDB();
    
    const analyses = await PersonalAnalysis.find({ isActive: true })
      .sort({ updatedAt: -1 })
      .lean();
    
    return NextResponse.json({ analyses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching personal analyses:', error);
    return NextResponse.json(
      { message: 'Failed to fetch personal analyses' },
      { status: 500 }
    );
  }
}

// POST new personal analysis (admin only)
export const POST = withAuth(async (req: Request) => {
  try {
    await connectDB();
    
    const body = await req.json();
    const {
      ticker,
      assetName,
      tendency,
      timeFrame,
      description,
      explanation,
      targetPrice,
      stopLoss,
      confidence
    } = body;

    // Validate required fields
    if (!ticker || !assetName || !tendency || !timeFrame || !confidence) {
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

    const personalAnalysis = new PersonalAnalysis({
      ticker: ticker.toUpperCase(),
      assetName,
      tendency,
      timeFrame,
      description,
      explanation,
      targetPrice,
      stopLoss,
      confidence,
      createdBy
    });

    await personalAnalysis.save();

    return NextResponse.json(
      { 
        message: 'Personal analysis created successfully',
        analysis: personalAnalysis
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating personal analysis:', error);
    return NextResponse.json(
      { message: 'Failed to create personal analysis' },
      { status: 500 }
    );
  }
}, { roles: ['admin'] });
