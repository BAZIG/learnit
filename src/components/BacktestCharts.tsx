"use client";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import React from 'react';

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
    return Object.entries(tickerDecisions).map(([ticker, info]) => ({
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

export default function BacktestCharts({ data }: { data: BacktestData }) {
  const portfolioHistory = getPortfolioHistory(data);
  const dailyReturns = getDailyReturns(portfolioHistory);
  const trades = getTrades(data);

  return (
    <>
      {/* Portfolio Value Over Time */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--terminal-bright)' }}>Portfolio Value Over Time</h2>
        <div className="bg-[var(--terminal-header)] p-4 rounded">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={portfolioHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            <BarChart data={dailyReturns}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="date" stroke="var(--terminal-dim)" tick={{ fill: 'var(--terminal-dim)' }} />
              <YAxis stroke="var(--terminal-dim)" tick={{ fill: 'var(--terminal-dim)' }} />
              <Tooltip contentStyle={{ background: '#222', color: '#fff', border: '1px solid #888' }} />
              <Bar dataKey="return" fill="#00bfff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trades Table with Agent Argumentation */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--terminal-bright)' }}>Trades & Agent Argumentation</h2>
        <div className="overflow-x-auto bg-[var(--terminal-header)] p-4 rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--terminal-bright)' }}>
                <th className="p-2">Date</th>
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
              {trades.map((trade, i) => (
                <tr key={i} className="border-b border-[var(--terminal-border)]">
                  <td className="p-2 text-[var(--terminal-dim)]">{trade.date}</td>
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
                    {Object.entries(trade.analyst_signals).map(([agent, signal]) => (
                      <div key={agent} className="mb-1">
                        <span className="font-mono text-[var(--terminal-bright)]">{agent.replace('_agent', '').toUpperCase()}:</span> <span style={{ color: signal.signal === 'bullish' ? '#00ff99' : signal.signal === 'bearish' ? '#ff4d4d' : '#ffd700' }}>{signal.signal?.toUpperCase()}</span> <span className="text-[var(--terminal-dim)]">({signal.confidence?.toFixed(1)}%)</span>
                        {signal.reasoning && <div className="text-xs text-[var(--terminal-dim)]">{typeof signal.reasoning === 'string' ? signal.reasoning : JSON.stringify(signal.reasoning)}</div>}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
} 