import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export default async function BacktestsListPage() {
  // List all JSON files in the data/backtest directory
  const backtestDir = path.join(process.cwd(), 'data', 'backtest');
  let files: string[] = [];
  try {
    files = fs.readdirSync(backtestDir).filter(f => f.endsWith('.json'));
  } catch {
    files = [];
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">All Backtests</h1>
      <ul className="space-y-2">
        {files.map(filename => (
          <li key={filename}>
            <Link href={`/backtests/${filename}`} className="text-blue-600 underline">
              {filename}
            </Link>
          </li>
        ))}
      </ul>
      {files.length === 0 && <div className="text-gray-500 mt-4">No backtest files found.</div>}
    </div>
  );
} 