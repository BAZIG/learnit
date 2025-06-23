export interface AnalystSignal {
  signal: 'buy' | 'sell' | 'hold' | 'neutral';
  confidence: number;
}

export interface AnalystSignals {
  [ticker: string]: AnalystSignal;
}

export interface AnalystData {
  [ticker: string]: AnalystSignals;
}

export interface Decision {
  action: 'buy' | 'sell' | 'hold';
  quantity: number;
  confidence: number;
  reasoning: string;
}

export interface AnalysisData {
  ticker: string;
  analyst_signals: {
    [analyst: string]: {
      [ticker: string]: AnalystSignal;
    };
  };
  decision: Decision;
  timestamp?: string;
}

export interface StrategySignal {
  signal: string;
  confidence: number;
  metrics: Record<string, number>;
}

export function getSignalColor(signal: string): string {
  switch (signal.toLowerCase()) {
    case 'bullish':
      return 'text-green-500';
    case 'bearish':
      return 'text-red-500';
    default:
      return 'text-yellow-500';
  }
}

export function formatConfidence(confidence: number): string {
  return `${confidence.toFixed(1)}%`;
}

export function getAnalystEmoji(analyst: string): string {
  const emojiMap: Record<string, string> = {
    'bill_ackman_agent': '🎯',
    'technical_analyst_agent': '📊',
    'fundamentals_analyst_agent': '📈',
    'sentiment_agent': '😊',
    'valuation_analyst_agent': '💰',
    'aswath_damodaran_agent': '📚',
    'warren_buffett_agent': '🧠',
    'cathie_wood_agent': '🚀',
    'phil_fisher_agent': '🔍',
    'ben_graham_agent': '📖',
    'charlie_munger_agent': '👓',
    'stanley_druckenmiller_agent': '🎲',
    'michael_burry_agent': '🦊',
    'peter_lynch_agent': '💡',
    'risk_management_agent': '🛡️'
  };
  
  return emojiMap[analyst] || '🤖';
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function getAnalystName(analyst: string): string {
  return analyst
    .replace('_agent', '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 