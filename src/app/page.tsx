import { Suspense } from 'react';
import { getLatestAnalyses, readAnalysisFile } from '@/lib/fileUtils';
import { AnalysisData } from '@/lib/analysis';

async function getLatestAnalysis(): Promise<AnalysisData[]> {
  try {
    const latestFiles = getLatestAnalyses(10);
    const analyses = await Promise.all(
      latestFiles.map(async (fileInfo) => {
        try {
          const data = await readAnalysisFile(fileInfo);
          return {
            ...data,
            timestamp: fileInfo.timestamp.toISOString()
          } as AnalysisData;
        } catch (error) {
          // Log error and return null for failed file reads
          if (error instanceof Error) {
            console.error(`Error reading file ${fileInfo.filename}: ${error.message}`);
          }
          return null;
        }
      })
    );
    return analyses.filter((analysis): analysis is AnalysisData => analysis !== null);
  } catch (error) {
    // Log error and return empty array for failed analysis
    if (error instanceof Error) {
      console.error(`Error getting latest analyses: ${error.message}`);
    }
    return [];
  }
}

function AnalysisCard({ analysis }: { analysis: AnalysisData }) {
  if (!analysis || !analysis.ticker || !analysis.analyst_signals || !analysis.decision) {
    return null;
  }

  return (
    <div className="terminal-window mb-4">
      <div className="terminal-header">
        <span className="text-[var(--terminal-text)]">
          $ {analysis.ticker} - {analysis.timestamp ? new Date(analysis.timestamp).toLocaleString() : 'No timestamp'}
        </span>
      </div>
      <div className="terminal-content">
        <div className="grid grid-cols-1 gap-6">
          {/* Analyst Signals Section */}
          <div className="terminal-window">
            <div className="terminal-header">
              <span className="text-[var(--terminal-text)]">ANALYST SIGNALS</span>
            </div>
            <div className="terminal-content">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysis.analyst_signals).map(([analyst, data]) => {
                  if (!data || !analysis.ticker) return null;
                  
                  const tickerData = data[analysis.ticker];
                  if (!tickerData || !tickerData.signal || typeof tickerData.confidence !== 'number') return null;
                  
                  const signalColor = tickerData.signal === 'buy' ? 'text-green-500' : 
                                    tickerData.signal === 'sell' ? 'text-red-500' : 
                                    'text-yellow-500';
                  
                  return (
                    <div key={analyst} className="terminal-window p-3">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--terminal-dim)] font-bold">
                            {analyst.replace('_agent', '').toUpperCase()}
                          </span>
                          <span className={`${signalColor} font-bold`}>
                            {tickerData.signal.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--terminal-dim)]">CONFIDENCE:</span>
                          <span className="text-[var(--terminal-bright)]">
                            {tickerData.confidence.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Decision Section */}
          <div className="terminal-window">
            <div className="terminal-header">
              <span className="text-[var(--terminal-text)]">FINAL DECISION</span>
            </div>
            <div className="terminal-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Decision Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--terminal-dim)]">ACTION:</span>
                    <span className={`text-[var(--terminal-bright)] font-bold ${
                      analysis.decision.action === 'buy' ? 'text-green-500' :
                      analysis.decision.action === 'sell' ? 'text-red-500' :
                      'text-yellow-500'
                    }`}>
                      {analysis.decision.action.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--terminal-dim)]">QUANTITY:</span>
                    <span className="text-[var(--terminal-bright)]">
                      {analysis.decision.quantity.toLocaleString()} shares
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--terminal-dim)]">CONFIDENCE:</span>
                    <span className="text-[var(--terminal-bright)]">
                      {analysis.decision.confidence.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="terminal-window">
                  <div className="terminal-header">
                    <span className="text-[var(--terminal-text)]">REASONING</span>
                  </div>
                  <div className="terminal-content">
                    <p className="text-[var(--terminal-bright)] whitespace-pre-wrap">
                      {analysis.decision.reasoning}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const analyses = await getLatestAnalysis();

  return (
    <div className="space-y-4 p-4">
      <div className="terminal-window">
        <div className="terminal-header">
          <span className="text-[var(--terminal-text)]">$ LATEST_ANALYSES</span>
        </div>
        <div className="terminal-content">
          <Suspense fallback={
            <div className="text-[var(--terminal-text)]">
              <span className="animate-pulse">Loading analyses...</span>
            </div>
          }>
            {analyses.length > 0 ? (
              analyses.map((analysis) => (
                <AnalysisCard key={`${analysis.ticker}-${analysis.timestamp}`} analysis={analysis} />
              ))
            ) : (
              <div className="text-[var(--terminal-text)]">
                <span className="opacity-75">$ </span>
                <span>No analyses available.</span>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
