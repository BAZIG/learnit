import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/dbTest';

export async function GET() {
  try {
    const result = await testDatabaseConnection();
    return NextResponse.json({
      success: true,
      message: 'Database connection test successful',
      data: result
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Database connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 