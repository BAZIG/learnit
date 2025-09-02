'use client';

import { useState, useEffect } from 'react';
import { IPersonalAnalysis } from '@/models/PersonalAnalysis';

export default function PersonalAnalysesPage() {
  const [analyses, setAnalyses] = useState<IPersonalAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTendency, setFilterTendency] = useState<string>('all');
  const [filterTimeFrame, setFilterTimeFrame] = useState<string>('all');

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/personal-analyses');
      if (!res.ok) throw new Error('Failed to fetch analyses');
      const data = await res.json();
      setAnalyses(data.analyses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesTendency = filterTendency === 'all' || analysis.tendency === filterTendency;
    const matchesTimeFrame = filterTimeFrame === 'all' || analysis.timeFrame === filterTimeFrame;
    return matchesTendency && matchesTimeFrame;
  });

  const getTendencyColor = (tendency: string) => {
    switch (tendency) {
      case 'bullish': return 'text-green-400 bg-green-900';
      case 'bearish': return 'text-red-400 bg-red-900';
      default: return 'text-yellow-400 bg-yellow-900';
    }
  };

  const getTimeFrameColor = (timeFrame: string) => {
    switch (timeFrame) {
      case 'short-term': return 'text-orange-400 bg-orange-900';
      case 'mid-term': return 'text-blue-400 bg-blue-900';
      case 'long-term': return 'text-purple-400 bg-purple-900';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 8) return 'text-green-400 bg-green-900';
    if (confidence >= 6) return 'text-yellow-400 bg-yellow-900';
    return 'text-red-400 bg-red-900';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading personal analyses...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-400">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Personal Investment Analyses
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300">
            Insights and personal investment Ideas
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Filter by Tendency</label>
            <select
              value={filterTendency}
              onChange={(e) => setFilterTendency(e.target.value)}
              className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-600"
            >
              <option value="all">All Tendencies</option>
              <option value="bullish">Bullish</option>
              <option value="bearish">Bearish</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Filter by Time Frame</label>
            <select
              value={filterTimeFrame}
              onChange={(e) => setFilterTimeFrame(e.target.value)}
              className="bg-gray-800 text-white rounded px-3 py-2 border border-gray-600"
            >
              <option value="all">All Time Frames</option>
              <option value="short-term">Short Term</option>
              <option value="mid-term">Mid Term</option>
              <option value="long-term">Long Term</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center mb-8 text-gray-400">
          Showing {filteredAnalyses.length} of {analyses.length} analyses
        </div>

        {/* Analyses Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAnalyses.map((analysis) => (
            <div key={analysis._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {analysis.ticker}
                    </h3>
                    <p className="text-gray-300">{analysis.assetName}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(analysis.confidence)}`}>
                    {analysis.confidence}/10
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTendencyColor(analysis.tendency)}`}>
                    {analysis.tendency.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTimeFrameColor(analysis.timeFrame)}`}>
                    {analysis.timeFrame.replace('-', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Price Targets */}
                {(analysis.targetPrice || analysis.stopLoss) && (
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    {analysis.targetPrice && (
                      <div className="bg-gray-700 rounded p-2">
                        <div className="text-gray-400 text-xs">Target</div>
                        <div className="font-mono text-green-400">${analysis.targetPrice}</div>
                      </div>
                    )}
                    {analysis.stopLoss && (
                      <div className="bg-gray-700 rounded p-2">
                        <div className="text-gray-400 text-xs">Stop Loss</div>
                        <div className="font-mono text-red-400">${analysis.stopLoss}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {analysis.description && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-300 text-sm mb-2">Summary</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {analysis.description}
                    </p>
                  </div>
                )}

                {/* Explanation */}
                {analysis.explanation && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-300 text-sm mb-2">Analysis</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {analysis.explanation.length > 150 
                        ? `${analysis.explanation.substring(0, 150)}...`
                        : analysis.explanation
                      }
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(analysis.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAnalyses.length === 0 && analyses.length > 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">No analyses match your filters</div>
            <button
              onClick={() => {
                setFilterTendency('all');
                setFilterTimeFrame('all');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Clear Filters
            </button>
          </div>
        )}

        {filteredAnalyses.length === 0 && analyses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl">No personal analyses available yet</div>
          </div>
        )}
      </div>
    </div>
  );
}
