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