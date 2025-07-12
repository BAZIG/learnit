import fs from 'fs';
import path from 'path';
import { AnalysisData } from './analysis';
import matter from 'gray-matter';

export interface FileInfo {
  filename: string;
  timestamp: Date;
}

export function parseAnalysisFilename(filename: string): FileInfo | null {
  // Expected format: NVDA_20250528_171416_analysis.json
  const match = filename.match(/^([A-Z]+)_(\d{8})_(\d{6})_analysis\.json$/);
  
  if (!match) return null;
  
  const [, , date, time] = match;
  
  // Parse the date and time
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);
  const hour = time.substring(0, 2);
  const minute = time.substring(2, 4);
  const second = time.substring(4, 6);
  
  const timestamp = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  
  return {
    filename,
    timestamp
  };
}

export function getAnalysisFiles(): FileInfo[] {
  const analysesDir = path.join(process.cwd(), 'src', 'data', 'analyses');
  const files = fs.readdirSync(analysesDir)
    .filter(file => file.endsWith('_analysis.json'))
    .map(file => parseAnalysisFilename(file))
    .filter((info): info is FileInfo => info !== null)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  return files;
}

export function getAnalysesByTicker(ticker: string): FileInfo[] {
  return getAnalysisFiles()
    .filter(file => file.filename.startsWith(ticker.toUpperCase()));
}

export function getLatestAnalyses(limit: number = 10): FileInfo[] {
  const analysesDir = path.join(process.cwd(), 'data', 'analyses');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(analysesDir)) {
    fs.mkdirSync(analysesDir, { recursive: true });
  }

  const files = fs.readdirSync(analysesDir)
    .filter(file => file.endsWith('.json'))
    .map(filename => {
      const filePath = path.join(analysesDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        timestamp: stats.mtime
      };
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);

  return files;
}

export function getAnalysesByDate(date: string): FileInfo[] {
  // date should be in YYYYMMDD format
  return getAnalysisFiles()
    .filter(file => file.filename.substring(0, 8) === date);
}

export function getAvailableTickers(): string[] {
  const tickers = new Set(getAnalysisFiles().map(file => file.filename.substring(0, 3)));
  return Array.from(tickers).sort();
}

export function getAvailableDates(): string[] {
  const dates = new Set(getAnalysisFiles().map(file => file.filename.substring(0, 8)));
  return Array.from(dates).sort().reverse();
}

export async function readAnalysisFile(fileInfo: FileInfo): Promise<AnalysisData> {
  const filePath = path.join(process.cwd(), 'data', 'analyses', fileInfo.filename);
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

// --- HUMANS ARTICLES UTILS ---

export interface HumanArticleMeta {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  author?: string;
}

export interface HumanArticle extends HumanArticleMeta {
  content: string;
}

const humansDir = path.join(process.cwd(), 'src', 'data', 'humans');

export function getHumanArticleSlugs(): string[] {
  if (!fs.existsSync(humansDir)) return [];
  return fs.readdirSync(humansDir)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''));
}

export function getAllHumanArticles(): HumanArticleMeta[] {
  return getHumanArticleSlugs().map(slug => {
    const filePath = path.join(humansDir, slug + '.md');
    const file = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(file);
    return {
      slug,
      title: data.title || slug,
      date: data.date || '',
      category: data.category || '',
      excerpt: data.excerpt || content.slice(0, 160),
      author: data.author || '',
    };
  });
}

export function getHumanArticlesByCategory(category: string): HumanArticleMeta[] {
  return getAllHumanArticles().filter(article => article.category.toLowerCase() === category.toLowerCase());
}

export function getHumanArticle(slug: string): HumanArticle | null {
  const filePath = path.join(humansDir, slug + '.md');
  if (!fs.existsSync(filePath)) return null;
  const file = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(file);
  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    category: data.category || '',
    excerpt: data.excerpt || content.slice(0, 160),
    author: data.author || '',
    content,
  };
}

// --- BACKTEST UTILS ---

export interface BacktestFileInfo {
  filename: string;
  timestamp: Date;
}

export function parseBacktestFilename(filename: string): BacktestFileInfo | null {
  // Expected format: TICKER_YYYYMMDD_HHMMSS_analysis.json
  const match = filename.match(/^([A-Z]+)_(\d{8})_(\d{6})_analysis\.json$/);
  if (!match) return null;
  const [, , date, time] = match;
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);
  const hour = time.substring(0, 2);
  const minute = time.substring(2, 4);
  const second = time.substring(4, 6);
  const timestamp = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  return { filename, timestamp };
}

export function getBacktestFiles(): BacktestFileInfo[] {
  const backtestDir = path.join(process.cwd(), 'data', 'backtest');
  if (!fs.existsSync(backtestDir)) return [];
  return fs.readdirSync(backtestDir)
    .filter(file => file.endsWith('_analysis.json'))
    .map(file => parseBacktestFilename(file))
    .filter((info): info is BacktestFileInfo => info !== null)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export interface BacktestPerformanceMetrics {
  sharpe_ratio: number | null;
  sortino_ratio: number | null;
  max_drawdown: number | null;
  long_short_ratio: number | null;
  gross_exposure: number | null;
  net_exposure: number | null;
  max_drawdown_date: string | null;
}

export interface BacktestPortfolioHistoryEntry {
  Date: string;
  "Portfolio Value": number;
  "Long Exposure"?: number;
  "Short Exposure"?: number;
  "Gross Exposure"?: number;
  "Net Exposure"?: number;
  "Long/Short Ratio"?: number;
}

export interface BacktestResult {
  tickers: string[];
  timestamp: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  final_value: number;
  total_return_pct: number;
  model_name: string;
  model_provider: string;
  selected_analysts: string[];
  margin_requirement: number;
  stop_loss_pct: number;
  take_profit_pct: number;
  performance_metrics: BacktestPerformanceMetrics;
  portfolio_history: BacktestPortfolioHistoryEntry[];
  [key: string]: unknown; // for any extra fields
}

export async function readBacktestFile(fileInfo: BacktestFileInfo): Promise<BacktestResult> {
  const filePath = path.join(process.cwd(), 'data', 'backtest', fileInfo.filename);
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return JSON.parse(content) as BacktestResult;
} 