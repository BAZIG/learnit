import { NextResponse } from 'next/server';
import { readBacktestFile, readNewsIntegratedBacktestFile, isNewsIntegratedBacktest, parseBacktestFilename } from '@/lib/fileUtils';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = decodeURIComponent(params.filename);
    const fileInfo = parseBacktestFilename(filename);
    
    if (!fileInfo) {
      return NextResponse.json({ error: 'Invalid filename format' }, { status: 400 });
    }

    const isNewsIntegrated = isNewsIntegratedBacktest(fileInfo);
    const data = isNewsIntegrated 
      ? await readNewsIntegratedBacktestFile(fileInfo)
      : await readBacktestFile(fileInfo);

    return NextResponse.json({ 
      data, 
      isNewsIntegrated,
      fileInfo: {
        filename: fileInfo.filename,
        timestamp: fileInfo.timestamp.toISOString()
      }
    });
  } catch (error) {
    console.error(`Error reading backtest file ${params.filename}:`, error);
    return NextResponse.json({ error: 'Failed to read backtest file' }, { status: 500 });
  }
} 