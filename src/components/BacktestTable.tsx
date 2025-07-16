'use client';

import { useState, useEffect } from 'react';

interface BacktestStats {
  id: string;
  tickers: string;
  startDate: string;
  endDate: string;
  duration: string;
  initialCapital: number;
  finalValue: number;
  totalReturn: number;
  sharpeRatio: number | null;
  sortinoRatio: number | null;
  maxDrawdown: number | null;
  totalTrades: number;
  buyTrades: number;
  sellTrades: number;
  totalVolume: number;
  winRate: number;
  modelName: string;
  modelProvider: string;
  analysts: string;
  isNewsIntegrated: boolean;
  newsCount: number;
  timestamp: string;
}

interface BacktestTableProps {
  onSelectBacktest: (id: string) => void;
}

export default function BacktestTable({ onSelectBacktest }: BacktestTableProps) {
  const [stats, setStats] = useState<BacktestStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof BacktestStats>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<'all' | 'news' | 'regular'>('all');

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/backtests/stats');
        const data = await response.json();
        setStats(data.stats || []);
      } catch (error) {
        console.error('Error loading backtest stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const handleSort = (field: keyof BacktestStats) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedStats = [...stats].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const filteredStats = sortedStats.filter(stat => {
    if (filter === 'all') return true;
    if (filter === 'news') return stat.isNewsIntegrated;
    if (filter === 'regular') return !stat.isNewsIntegrated;
    return true;
  });

  const formatNumber = (value: number | null, decimals: number = 2): string => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(decimals);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="terminal-window">
        <div className="terminal-header">
          <span className="text-[var(--terminal-text)]">BACKTEST STATISTICS</span>
        </div>
        <div className="terminal-content">
          <div className="text-[var(--terminal-text)]">
            <span className="animate-pulse">Loading statistics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <div className="flex items-center justify-between">
          <span className="text-[var(--terminal-text)]">BACKTEST STATISTICS</span>
          <div className="flex items-center space-x-4">
            <span className="text-[var(--terminal-dim)] text-sm">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 text-xs rounded ${
                filter === 'all' 
                  ? 'bg-[var(--terminal-bright)] text-black' 
                  : 'text-[var(--terminal-bright)] hover:text-[var(--terminal-text)]'
              }`}
            >
              All ({stats.length})
            </button>
            <button
              onClick={() => setFilter('news')}
              className={`px-2 py-1 text-xs rounded ${
                filter === 'news' 
                  ? 'bg-[var(--terminal-bright)] text-black' 
                  : 'text-[var(--terminal-bright)] hover:text-[var(--terminal-text)]'
              }`}
            >
              News ({stats.filter(s => s.isNewsIntegrated).length})
            </button>
            <button
              onClick={() => setFilter('regular')}
              className={`px-2 py-1 text-xs rounded ${
                filter === 'regular' 
                  ? 'bg-[var(--terminal-bright)] text-black' 
                  : 'text-[var(--terminal-bright)] hover:text-[var(--terminal-text)]'
              }`}
            >
              Regular ({stats.filter(s => !s.isNewsIntegrated).length})
            </button>
          </div>
        </div>
      </div>
      <div className="terminal-content">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--terminal-dim)]">
                <th 
                  className="text-left p-2 cursor-pointer hover:text-[var(--terminal-bright)]"
                  onClick={() => handleSort('tickers')}
                >
                  Tickers {sortField === 'tickers' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left p-2 cursor-pointer hover:text-[var(--terminal-bright)]"
                  onClick={() => handleSort('totalReturn')}
                >
                  Return {sortField === 'totalReturn' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left p-2 cursor-pointer hover:text-[var(--terminal-bright)]"
                  onClick={() => handleSort('sharpeRatio')}
                >
                  Sharpe {sortField === 'sharpeRatio' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left p-2 cursor-pointer hover:text-[var(--terminal-bright)]"
                  onClick={() => handleSort('maxDrawdown')}
                >
                  Max DD {sortField === 'maxDrawdown' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left p-2 cursor-pointer hover:text-[var(--terminal-bright)]"
                  onClick={() => handleSort('totalTrades')}
                >
                  Trades {sortField === 'totalTrades' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left p-2 cursor-pointer hover:text-[var(--terminal-bright)]"
                  onClick={() => handleSort('totalVolume')}
                >
                  Volume {sortField === 'totalVolume' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left p-2 cursor-pointer hover:text-[var(--terminal-bright)]"
                  onClick={() => handleSort('winRate')}
                >
                  Win Rate {sortField === 'winRate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((stat) => (
                <tr 
                  key={stat.id} 
                  className="border-b border-[var(--terminal-dim)] hover:bg-[var(--terminal-dim)] hover:bg-opacity-20"
                >
                  <td className="p-2">
                    <div className="font-semibold text-[var(--terminal-bright)]">
                      {stat.tickers}
                    </div>
                    <div className="text-xs text-[var(--terminal-dim)]">
                      {stat.duration}
                    </div>
                  </td>
                  <td className="p-2">
                    <span className={`font-semibold ${
                      stat.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {formatPercentage(stat.totalReturn)}
                    </span>
                    <div className="text-xs text-[var(--terminal-dim)]">
                      {formatCurrency(stat.finalValue)}
                    </div>
                  </td>
                  <td className="p-2">
                    <span className="text-[var(--terminal-bright)]">
                      {formatNumber(stat.sharpeRatio, 2)}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className="text-red-500">
                      {formatNumber(stat.maxDrawdown, 1)}%
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="text-[var(--terminal-bright)]">
                      {stat.totalTrades}
                    </div>
                    <div className="text-xs text-[var(--terminal-dim)]">
                      {stat.buyTrades}B/{stat.sellTrades}S
                    </div>
                  </td>
                  <td className="p-2">
                    <span className="text-[var(--terminal-bright)]">
                      {stat.totalVolume.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className="text-[var(--terminal-bright)]">
                      {formatNumber(stat.winRate, 1)}%
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        stat.isNewsIntegrated 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {stat.isNewsIntegrated ? 'News' : 'Regular'}
                      </span>
                      {stat.isNewsIntegrated && (
                        <span className="text-xs text-[var(--terminal-dim)]">
                          {stat.newsCount} articles
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => onSelectBacktest(stat.id)}
                      className="text-[var(--terminal-bright)] hover:text-[var(--terminal-text)] text-sm underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredStats.length === 0 && (
          <div className="text-center py-8 text-[var(--terminal-text)]">
            No backtest results available for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
} 