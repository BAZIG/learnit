import { Suspense } from 'react';
import { getLatestAnalyses, readAnalysisFile } from '@/lib/fileUtils';
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

export default async function ResearchPage() {
  const companyAnalyses = await getCompanyAnalyses();
  const companies = Object.keys(companyAnalyses).sort();

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
        </div>
      </div>
    </div>
  );
} 