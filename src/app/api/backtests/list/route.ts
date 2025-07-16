import { NextResponse } from 'next/server';
import { getAllBacktestFiles, isNewsIntegratedBacktest } from '@/lib/fileUtils';

export async function GET() {
  try {
    const allFiles = getAllBacktestFiles();
    const fileList = allFiles.map(fileInfo => ({
      filename: fileInfo.filename,
      timestamp: fileInfo.timestamp.toISOString(),
      isNewsIntegrated: isNewsIntegratedBacktest(fileInfo)
    }));

    return NextResponse.json({ files: fileList });
  } catch (error) {
    console.error('Error getting backtest files:', error);
    return NextResponse.json({ error: 'Failed to get backtest files' }, { status: 500 });
  }
} 