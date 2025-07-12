import { Suspense } from 'react';
import { getLatestAnalyses, readAnalysisFile, getBacktestFiles, readBacktestFile, BacktestResult } from '@/lib/fileUtils';
import { AnalysisData } from '@/lib/analysis';
import Link from 'next/link';

async function getCompanyAnalyses(): Promise<Record<string, AnalysisData[]>> {
  try {
    const latestFiles = getLatestAnalyses(100); // Get more files for research
    const analyses = await Promise.all(
      latestFiles.map(async (fileInfo) => {
        try {
          const data = await readAnalysisFile(fileInfo);
          return {
            ...data,
            timestamp: fileInfo.timestamp.toISOString()
          } as AnalysisData;
        } catch (error) {
          console.error(`Error reading file ${fileInfo.filename}:`, error);
          return null;
        }
      })
    );

    // Group analyses by ticker
    const validAnalyses = analyses.filter((analysis): analysis is AnalysisData => analysis !== null);
    return validAnalyses.reduce((acc, analysis) => {
      const ticker = analysis.ticker;
      if (!acc[ticker]) {
        acc[ticker] = [];
      }
      acc[ticker].push(analysis);
      return acc;
    }, {} as Record<string, AnalysisData[]>);
  } catch (error) {
    console.error('Error getting company analyses:', error);
    return {};
  }
}

function CompanyCard({ ticker, analyses }: { ticker: string; analyses: AnalysisData[] }) {
  // Sort analyses by timestamp, newest first
  const sortedAnalyses = [...analyses].sort((a, b) => 
    new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime()
  );

  const latestAnalysis = sortedAnalyses[0];
  if (!latestAnalysis) return null;

  const latestSignal = latestAnalysis.decision.action;
  const latestConfidence = latestAnalysis.decision.confidence;

  const signalColor = latestSignal === 'buy' ? 'text-green-500' : 
                     latestSignal === 'sell' ? 'text-red-500' : 
                     'text-yellow-500';

  return (
    <div className="terminal-window mb-4">
      <div className="terminal-header">
        <span className="text-[var(--terminal-text)]">
          $ {ticker} - RESEARCH DIRECTORY
        </span>
      </div>
      <div className="terminal-content">
        <div className="grid grid-cols-1 gap-6">
          {/* Latest Analysis Summary */}
          <div className="terminal-window">
            <div className="terminal-header">
              <span className="text-[var(--terminal-text)]">LATEST ANALYSIS</span>
            </div>
            <div className="terminal-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--terminal-dim)]">LATEST SIGNAL:</span>
                    <span className={`${signalColor} font-bold`}>
                      {latestSignal.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--terminal-dim)]">CONFIDENCE:</span>
                    <span className="text-[var(--terminal-bright)]">
                      {latestConfidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--terminal-dim)]">LAST UPDATED:</span>
                    <span className="text-[var(--terminal-bright)]">
                      {new Date(latestAnalysis.timestamp || '').toLocaleString()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[var(--terminal-bright)] text-sm">
                    {latestAnalysis.decision.reasoning}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis History */}
          <div className="terminal-window">
            <div className="terminal-header">
              <span className="text-[var(--terminal-text)]">ANALYSIS HISTORY</span>
            </div>
            <div className="terminal-content">
              <div className="space-y-2">
                {sortedAnalyses.map((analysis) => (
                  <div key={analysis.timestamp} className="terminal-window p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--terminal-dim)]">
                        {new Date(analysis.timestamp || '').toLocaleString()}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className={`${
                          analysis.decision.action === 'buy' ? 'text-green-500' :
                          analysis.decision.action === 'sell' ? 'text-red-500' :
                          'text-yellow-500'
                        } font-bold`}>
                          {analysis.decision.action.toUpperCase()}
                        </span>
                        <span className="text-[var(--terminal-bright)]">
                          {analysis.decision.confidence.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function isValidNumber(val: unknown): val is number {
  return typeof val === 'number' && isFinite(val);
}

function BacktestCard({ backtest }: { backtest: BacktestResult }) {
  const pm = backtest.performance_metrics;
  return (
    <div className="terminal-window mb-4">
      <div className="terminal-header">
        <span className="text-[var(--terminal-text)]">
          $ {backtest.tickers?.join(', ')} BACKTEST ({backtest.start_date} → {backtest.end_date})
        </span>
      </div>
      <div className="terminal-content">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {isValidNumber(backtest.initial_capital) && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--terminal-dim)]">Initial Capital:</span>
                <span className="text-[var(--terminal-bright)]">${backtest.initial_capital.toLocaleString()}</span>
              </div>
            )}
            {isValidNumber(backtest.final_value) && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--terminal-dim)]">Final Value:</span>
                <span className="text-[var(--terminal-bright)]">${backtest.final_value.toLocaleString()}</span>
              </div>
            )}
            {isValidNumber(backtest.total_return_pct) && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--terminal-dim)]">Total Return:</span>
                <span className="text-[var(--terminal-bright)]">{backtest.total_return_pct.toFixed(2)}%</span>
              </div>
            )}
            {isValidNumber(pm?.sharpe_ratio) && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--terminal-dim)]">Sharpe Ratio:</span>
                <span className="text-[var(--terminal-bright)]">{pm.sharpe_ratio.toFixed(2)}</span>
              </div>
            )}
            {isValidNumber(pm?.sortino_ratio) && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--terminal-dim)]">Sortino Ratio:</span>
                <span className="text-[var(--terminal-bright)]">{pm.sortino_ratio.toFixed(2)}</span>
              </div>
            )}
            {isValidNumber(pm?.max_drawdown) && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--terminal-dim)]">Max Drawdown:</span>
                <span className="text-[var(--terminal-bright)]">{pm.max_drawdown.toFixed(2)}%</span>
              </div>
            )}
          </div>
          <div>
            <div className="text-[var(--terminal-bright)] text-sm">
              <b>Model:</b> {backtest.model_name} ({backtest.model_provider})<br />
              <b>Analysts:</b> {backtest.selected_analysts?.join(', ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function ResearchPage() {
  const companyAnalyses = await getCompanyAnalyses();
  const companies = Object.keys(companyAnalyses).sort();

  // Load backtest files and their data (limit to 5 most recent)
  const backtestFiles = getBacktestFiles().slice(0, 5);
  const backtests: BacktestResult[] = await Promise.all(backtestFiles.map(readBacktestFile));

  return (
    <div className="space-y-4 p-4">
      <div className="terminal-window">
        <div className="terminal-header">
          <span className="text-[var(--terminal-text)]">$ RESEARCH DIRECTORY</span>
        </div>
        <div className="terminal-content">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[var(--terminal-dim)]">Available Companies:</span>
            <div className="flex flex-wrap gap-2">
              {companies.map((ticker) => (
                <Link 
                  key={ticker}
                  href={`#${ticker}`}
                  className="text-[var(--terminal-bright)] hover:text-[var(--terminal-text)]"
                >
                  {ticker}
                </Link>
              ))}
            </div>
          </div>

          <Suspense fallback={
            <div className="text-[var(--terminal-text)]">
              <span className="animate-pulse">Loading research data...</span>
            </div>
          }>
            {companies.length > 0 ? (
              companies.map((ticker) => (
                <div key={ticker} id={ticker}>
                  <CompanyCard ticker={ticker} analyses={companyAnalyses[ticker]} />
                </div>
              ))
            ) : (
              <div className="text-[var(--terminal-text)]">
                <span className="opacity-75">$ </span>
                <span>No research data available.</span>
              </div>
            )}
          </Suspense>

          {/* Backtest Results Section */}
          <div className="mt-8">
            <div className="terminal-header">
              <span className="text-[var(--terminal-text)]">BACKTEST RESULTS</span>
            </div>
            <div className="terminal-content">
              {backtests.length > 0 ? (
                backtests.map((backtest, idx) => (
                  <BacktestCard key={idx} backtest={backtest} />
                ))
              ) : (
                <div className="text-[var(--terminal-text)]">No backtest results available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 