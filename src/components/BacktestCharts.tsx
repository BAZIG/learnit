"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import React, { useState } from 'react';

interface PortfolioHistoryEntry {
  Date: string;
  "Portfolio Value": number;
  [key: string]: number | string | null | undefined;
}

interface DailyReturnEntry {
  date: string;
  return: number;
}

interface AnalystSignal {
  signal?: string;
  confidence?: number;
  reasoning?: string | object;
}

interface TradeEntry {
  date: string;
  ticker: string;
  action: string;
  quantity: number;
  price: number;
  reasoning: string;
  risk: object | string;
  analyst_signals: Record<string, AnalystSignal>;
}

interface NewsItem {
  ticker: string;
  title: string;
  author: string;
  source: string;
  date: string;
  url: string;
  sentiment: string;
}

interface NewsData {
  [ticker: string]: {
    count: number;
    items: NewsItem[];
  };
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
  news_data?: NewsData;
}

function getPortfolioHistory(data: BacktestData): PortfolioHistoryEntry[] {
  return data.portfolio_history || [];
}

function getDailyReturns(history: PortfolioHistoryEntry[]): DailyReturnEntry[] {
  if (!history || history.length < 2) return [];
  const returns: DailyReturnEntry[] = [];
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1]["Portfolio Value"];
    const curr = history[i]["Portfolio Value"];
    returns.push({
      date: history[i]["Date"],
      return: ((curr - prev) / prev) * 100
    });
  }
  return returns;
}

function getTrades(data: BacktestData): TradeEntry[] {
  if (!data.daily_decisions) return [];
  return data.daily_decisions.flatMap((d) => {
    const date = d.date;
    const tickerDecisions = d.ticker_decisions || {};
    return Object.entries(tickerDecisions)
      .filter((entry) => entry[1].quantity !== 0) // Only show trades where quantity is not 0
      .map(([ticker, info]) => ({
        date,
        ticker,
        action: info.action,
        quantity: info.quantity,
        price: info.price,
        reasoning: info.portfolio_manager_decision?.reasoning || '',
        risk: info.risk_management_agent?.reasoning || {},
        analyst_signals: info.analyst_signals || {},
      }));
  });
}

export default function BacktestCharts({ data, newsData }: { data: BacktestData, newsData?: NewsData }) {
  const portfolioHistory = getPortfolioHistory(data);
  const dailyReturns = getDailyReturns(portfolioHistory);
  const trades = getTrades(data);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [previewStats, setPreviewStats] = useState<{
    date: string;
    portfolioValue: number;
    dailyReturn?: number;
    tradesCount: number;
    newsCount: number;
  } | null>(null);
  // Use newsData prop if provided, else fallback to data.news_data
  const news = newsData || data.news_data;

  // Handler for clicking a point on the graph
  const handleChartClick = (e: unknown) => {
    if (
      typeof e === 'object' &&
      e !== null &&
      'activeLabel' in e &&
      typeof (e as { activeLabel?: unknown }).activeLabel === 'string'
    ) {
      setSelectedDate((e as { activeLabel: string }).activeLabel);
      setPreviewStats(null);
    }
  };

  // Handler for clicking a bar in the histogram
  const handleBarClick = (data: unknown) => {
    if (
      typeof data === 'object' &&
      data !== null &&
      'activeLabel' in data &&
      typeof (data as { activeLabel?: unknown }).activeLabel === 'string'
    ) {
      const date = (data as { activeLabel: string }).activeLabel;
      const portfolioEntry = portfolioHistory.find((h) => h.Date === date);
      const dailyReturn = dailyReturns.find((r) => r.date === date)?.return;
      const dateOnly = date.slice(0, 10);
      const tradesCount = trades.filter((t) => t.date.slice(0, 10) === dateOnly).length;
      // Gather news count for the date
      const selectedDateStr = dateOnly;
      let newsCount = 0;
      if (news) {
        Object.values(news as NewsData).forEach((tickerNews) => {
          if (tickerNews && Array.isArray(tickerNews.items)) {
            tickerNews.items.forEach((item: NewsItem) => {
              if (item.date && item.date.slice(0, 10) === selectedDateStr) {
                newsCount++;
              }
            });
          }
        });
      }
      setPreviewStats({
        date,
        portfolioValue: portfolioEntry ? Number(portfolioEntry["Portfolio Value"]) : 0,
        dailyReturn,
        tradesCount,
        newsCount,
      });
      setSelectedDate(null);
    }
  };

  return (
    <>
      {/* Portfolio Value Over Time */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--terminal-bright)' }}>Portfolio Value Over Time</h2>
        <div className="bg-[var(--terminal-header)] p-4 rounded">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={portfolioHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} onClick={handleChartClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="Date" stroke="var(--terminal-dim)" tick={{ fill: 'var(--terminal-dim)' }} />
              <YAxis stroke="var(--terminal-dim)" tick={{ fill: 'var(--terminal-dim)' }} />
              <Tooltip contentStyle={{ background: '#222', color: '#fff', border: '1px solid #888' }} />
              <Legend />
              <Line type="monotone" dataKey="Portfolio Value" stroke="#00ff99" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Histogram of Daily Returns */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--terminal-bright)' }}>Histogram of Daily Returns (%)</h2>
        <div className="bg-[var(--terminal-header)] p-4 rounded">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyReturns} onClick={handleBarClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="var(--terminal-dim)" tick={{ fill: 'var(--terminal-dim)' }} />
              <YAxis stroke="var(--terminal-dim)" tick={{ fill: 'var(--terminal-dim)' }} />
              <Tooltip contentStyle={{ background: '#222', color: '#fff', border: '1px solid #888' }} />
              <Bar dataKey="return" fill="#00bfff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {previewStats && (
          <div className="mt-4 p-4 bg-[var(--terminal-header)] rounded">
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--terminal-bright)' }}>Preview for {previewStats.date}</h3>
            <div className="flex flex-wrap gap-4 mb-2">
              <div><span className="font-semibold">Portfolio Value:</span> {previewStats.portfolioValue}</div>
              <div><span className="font-semibold">Return (%):</span> {previewStats.dailyReturn?.toFixed(2) ?? 'N/A'}</div>
              <div><span className="font-semibold">Trades:</span> {previewStats.tradesCount}</div>
              <div><span className="font-semibold">News:</span> {previewStats.newsCount}</div>
            </div>
            <button className="px-4 py-2 bg-[var(--terminal-bright)] text-black rounded" onClick={() => { setSelectedDate(previewStats.date); setPreviewStats(null); }}>Show Details</button>
            <button className="ml-2 px-4 py-2 bg-gray-600 text-white rounded" onClick={() => setPreviewStats(null)}>Close</button>
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="mt-6 p-4 bg-[var(--terminal-header)] rounded">
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--terminal-bright)' }}>Details for {selectedDate}</h3>
          <div>
            <h4 className="font-semibold">Trades</h4>
            <table className="min-w-full text-sm mb-4">
              <thead>
                <tr style={{ color: 'var(--terminal-bright)' }}>
                  <th className="p-2">Ticker</th>
                  <th className="p-2">Action</th>
                  <th className="p-2">Quantity</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Reasoning</th>
                  <th className="p-2">Risk Management</th>
                  <th className="p-2">Analyst Signals</th>
                </tr>
              </thead>
              <tbody>
                {trades.filter((trade: TradeEntry) => trade.date.slice(0, 10) === (selectedDate ? selectedDate.slice(0, 10) : '')).map((trade: TradeEntry, i: number) => (
                  <tr key={i} className="border-b border-[var(--terminal-border)]">
                    <td className="p-2">{trade.ticker}</td>
                    <td className="p-2 font-bold" style={{ color: trade.action === 'buy' ? '#00ff99' : trade.action === 'sell' ? '#ff4d4d' : '#ffd700' }}>{trade.action?.toUpperCase()}</td>
                    <td className="p-2">{trade.quantity}</td>
                    <td className="p-2">{trade.price}</td>
                    <td className="p-2 max-w-xs whitespace-pre-wrap text-[var(--terminal-text)]">{trade.reasoning}</td>
                    <td className="p-2 max-w-xs whitespace-pre-wrap text-[var(--terminal-text)]">
                      {typeof trade.risk === 'object' ? (
                        <pre className="text-xs" style={{ color: 'var(--terminal-dim)', background: 'none' }}>{JSON.stringify(trade.risk, null, 2)}</pre>
                      ) : String(trade.risk)}
                    </td>
                    <td className="p-2 max-w-xs whitespace-pre-wrap text-[var(--terminal-text)]">
                      {Object.entries(trade.analyst_signals).map(([agent, signal]) => {
                        const s = signal as AnalystSignal;
                        return (
                          <div key={agent} className="mb-1">
                            <span className="font-mono text-[var(--terminal-bright)]">{agent.replace('_agent', '').toUpperCase()}:</span> <span style={{ color: s.signal === 'bullish' ? '#00ff99' : s.signal === 'bearish' ? '#ff4d4d' : '#ffd700' }}>{s.signal?.toUpperCase()}</span> <span className="text-[var(--terminal-dim)]">({s.confidence?.toFixed(1)}%)</span>
                            {s.reasoning && <div className="text-xs text-[var(--terminal-dim)]">{typeof s.reasoning === 'string' ? s.reasoning : JSON.stringify(s.reasoning)}</div>}
                          </div>
                        );
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4 className="font-semibold mt-4">News</h4>
            {news ? (
              (() => {
                // Gather all news items for the selected date (across all tickers)
                const selectedDateStr = selectedDate.slice(0, 10); // 'YYYY-MM-DD'
                const allNews: NewsItem[] = [];
                Object.values(news as NewsData).forEach((tickerNews) => {
                  if (tickerNews && Array.isArray(tickerNews.items)) {
                    tickerNews.items.forEach((item: NewsItem) => {
                      if (item.date && item.date.slice(0, 10) === selectedDateStr) {
                        allNews.push(item);
                      }
                    });
                  }
                });
                if (allNews.length === 0) {
                  return <div className="text-[var(--terminal-dim)]">No news for this date.</div>;
                }
                return (
                  <ul className="list-disc pl-5">
                    {allNews.map((item, idx) => (
                      <li key={idx} className="mb-2 text-[var(--terminal-text)]">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-200">{item.title}</a>
                        <span className="ml-2 text-xs text-[var(--terminal-dim)]">[{item.source}]</span>
                        <span className="ml-2 text-xs text-[var(--terminal-dim)]">{item.author}</span>
                        <span className="ml-2 text-xs text-[var(--terminal-dim)]">({item.sentiment})</span>
                      </li>
                    ))}
                  </ul>
                );
              })()
            ) : (
              <div className="text-[var(--terminal-dim)]">No news data available.</div>
            )}
          </div>
          <button className="mt-4 px-4 py-2 bg-[var(--terminal-bright)] text-black rounded" onClick={() => setSelectedDate(null)}>Close</button>
        </div>
      )}

      {/* Summary Table at the bottom */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--terminal-bright)' }}>Daily Summary</h2>
        <div className="overflow-x-auto bg-[var(--terminal-header)] p-4 rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--terminal-bright)' }}>
                <th className="p-2">Date</th>
                <th className="p-2">Portfolio Value</th>
                <th className="p-2">Return (%)</th>
                <th className="p-2">Trades</th>
                <th className="p-2">News</th>
                <th className="p-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {portfolioHistory.map((entry, i) => {
                const date = entry.Date;
                const dailyReturn = dailyReturns.find((r) => r.date === date)?.return;
                const dateOnly = date.slice(0, 10);
                const tradesCount = trades.filter((t) => t.date.slice(0, 10) === dateOnly).length;
                // Gather news count for the date
                const selectedDateStr = dateOnly;
                let newsCount = 0;
                if (news) {
                  Object.values(news as NewsData).forEach((tickerNews) => {
                    if (tickerNews && Array.isArray(tickerNews.items)) {
                      tickerNews.items.forEach((item: NewsItem) => {
                        if (item.date && item.date.slice(0, 10) === selectedDateStr) {
                          newsCount++;
                        }
                      });
                    }
                  });
                }
                return (
                  <tr key={i} className="border-b border-[var(--terminal-border)]">
                    <td className="p-2 text-[var(--terminal-dim)]">{date}</td>
                    <td className="p-2">{entry["Portfolio Value"]}</td>
                    <td className="p-2">{dailyReturn?.toFixed(2) ?? 'N/A'}</td>
                    <td className="p-2">{tradesCount}</td>
                    <td className="p-2">{newsCount}</td>
                    <td className="p-2">
                      <button className="px-2 py-1 bg-[var(--terminal-bright)] text-black rounded" onClick={() => { setSelectedDate(date); setPreviewStats(null); }}>Show Details</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
} 