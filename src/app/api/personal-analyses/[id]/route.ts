import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PersonalAnalysis from '@/models/PersonalAnalysis';
import { withAuth } from '@/lib/withAuth';
import mongoose from 'mongoose';

// GET specific personal analysis (public access)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid analysis ID' },
        { status: 400 }
      );
    }

    const analysis = await PersonalAnalysis.findById(params.id).lean();
    
    if (!analysis) {
      return NextResponse.json(
        { message: 'Analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    console.error('Error fetching personal analysis:', error);
    return NextResponse.json(
      { message: 'Failed to fetch personal analysis' },
      { status: 500 }
    );
  }
}

// PUT update personal analysis (admin only)
export const PUT = withAuth(async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid analysis ID' },
        { status: 400 }
      );
    }

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
      confidence,
      isActive
    } = body;

    const updateData: Partial<{
      ticker: string;
      assetName: string;
      tendency: string;
      timeFrame: string;
      description: string;
      explanation: string;
      targetPrice: number;
      stopLoss: number;
      confidence: number;
      isActive: boolean;
    }> = {};
    if (ticker) updateData.ticker = ticker.toUpperCase();
    if (assetName) updateData.assetName = assetName;
    if (tendency) updateData.tendency = tendency;
    if (timeFrame) updateData.timeFrame = timeFrame;
    if (description !== undefined) updateData.description = description;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (targetPrice !== undefined) updateData.targetPrice = targetPrice;
    if (stopLoss !== undefined) updateData.stopLoss = stopLoss;
    if (confidence !== undefined) updateData.confidence = confidence;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedAnalysis = await PersonalAnalysis.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedAnalysis) {
      return NextResponse.json(
        { message: 'Analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Personal analysis updated successfully',
        analysis: updatedAnalysis
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating personal analysis:', error);
    return NextResponse.json(
      { message: 'Failed to update personal analysis' },
      { status: 500 }
    );
  }
}, { roles: ['admin'] });

// DELETE personal analysis (admin only)
export const DELETE = withAuth(async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid analysis ID' },
        { status: 400 }
      );
    }

    const deletedAnalysis = await PersonalAnalysis.findByIdAndDelete(params.id);

    if (!deletedAnalysis) {
      return NextResponse.json(
        { message: 'Analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Personal analysis deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting personal analysis:', error);
    return NextResponse.json(
      { message: 'Failed to delete personal analysis' },
      { status: 500 }
    );
  }
}, { roles: ['admin'] });
