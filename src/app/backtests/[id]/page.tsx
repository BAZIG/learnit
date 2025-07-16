import { notFound } from 'next/navigation';
import path from 'path';
import fs from 'fs';
import BacktestCharts from '@/components/BacktestCharts';

interface PortfolioHistoryEntry {
  Date: string;
  "Portfolio Value": number;
  [key: string]: number | string | null | undefined;
}

interface AnalystSignal {
  signal?: string;
  confidence?: number;
  reasoning?: string | object;
}

interface BacktestData {
  portfolio_history?: PortfolioHistoryEntry[];
  daily_decisions?: Array<{
    date: string;
    ticker_decisions: Record<string, {
      action: string;
      quantity: number;
      price: number;
      portfolio_manager_decision?: { reasoning?: string };
      risk_management_agent?: { reasoning?: object | string };
      analyst_signals?: Record<string, AnalystSignal>;
    }>;
  }>;
}

export default async function BacktestDetailPage({ params }: { params: { id: string } }) {
  // Load the backtest JSON file from the data/backtest directory
  const filePath = path.join(process.cwd(), 'data', 'backtest', params.id);
  let backtestData: BacktestData | null = null;
  try {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    backtestData = JSON.parse(fileContent);
  } catch {
    return notFound();
  }

  if (!backtestData) {
    return notFound();
  }

  return (
    <div className="p-8" style={{ color: 'var(--terminal-text)', background: 'var(--terminal-bg)' }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--terminal-bright)' }}>Backtest Details</h1>
      <p>Backtest ID: <span className="font-mono bg-gray-800 px-2 py-1 rounded" style={{ color: 'var(--terminal-bright)' }}>{params.id}</span></p>
      <BacktestCharts data={backtestData} />
    </div>
  );
} 