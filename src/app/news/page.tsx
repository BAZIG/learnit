'use client';

import { useState, useEffect } from 'react';
import { INews } from '@/models/News';

export default function NewsPage() {
  const [news, setNews] = useState<INews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Failed to fetch news');
      const data = await res.json();
      setNews(data.news);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'bullish': return 'text-green-400 bg-green-900 border-green-700';
      case 'bearish': return 'text-red-400 bg-red-900 border-red-700';
      default: return 'text-yellow-400 bg-yellow-900 border-yellow-700';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'bullish': return '▲';
      case 'bearish': return '▼';
      default: return '◆';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading news...</div>
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
            Market News & Analysis
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300">
            Latest market events and their potential impact on your investments
          </p>
        </div>

        {/* News Items */}
        <div className="space-y-8">
          {news.map((newsItem) => (
            <article key={newsItem._id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
              <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {newsItem.title}
                    </h2>
                                         <div className="flex items-center text-sm text-gray-400">
                       <time dateTime={newsItem.publishedAt ? newsItem.publishedAt.toString() : undefined}>
                        {newsItem.publishedAt 
                          ? new Date(newsItem.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Draft'
                        }
                      </time>
                    </div>
                  </div>
                </div>

                {/* Event Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">Event</h3>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <p className="text-gray-300 leading-relaxed">{newsItem.event}</p>
                  </div>
                </div>

                {/* Affected Assets */}
                {newsItem.affectedAssets.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-3">Affected Assets</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {newsItem.affectedAssets.map((asset, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg border ${getImpactColor(asset.impact)}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getImpactIcon(asset.impact)}</span>
                            <span className="font-mono font-bold text-lg">{asset.ticker}</span>
                          </div>
                          <span className="text-xs font-medium uppercase tracking-wide">
                            {asset.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expectations */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-200 mb-3">Market Expectations & Analysis</h3>
                  <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {newsItem.expectations}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                      Published: {newsItem.publishedAt 
                        ? new Date(newsItem.publishedAt).toLocaleDateString()
                        : 'Draft'
                      }
                    </span>
                    <span>
                      Last updated: {new Date(newsItem.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {news.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-xl mb-4">No news available at the moment</div>
            <p className="text-gray-500">Check back later for the latest market updates and analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
