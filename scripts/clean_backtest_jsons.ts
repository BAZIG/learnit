import fs from 'fs';
import path from 'path';

const backtestDir = path.join(process.cwd(), 'data', 'backtest');

function cleanValue(val: unknown): unknown {
  if (typeof val === 'number' && (!isFinite(val) || isNaN(val))) {
    return null;
  }
  return val;
}

function deepClean(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(deepClean);
  } else if (obj && typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      cleaned[k] = deepClean(v);
    }
    return cleaned;
  } else {
    return cleanValue(obj);
  }
}

function cleanBacktestFiles() {
  if (!fs.existsSync(backtestDir)) {
    console.error('Backtest directory does not exist:', backtestDir);
    process.exit(1);
  }
  const files = fs.readdirSync(backtestDir).filter(f => f.endsWith('.json'));
  let cleanedCount = 0;
  for (const file of files) {
    const filePath = path.join(backtestDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    let data;
    try {
      // Use eval to parse non-standard JSON (with Infinity/NaN)
      data = eval('(' + raw + ')');
    } catch (e) {
      console.error('Failed to parse', file, e);
      continue;
    }
    const cleaned = deepClean(data);
    fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2));
    cleanedCount++;
    console.log('Cleaned', file);
  }
  console.log(`\nCleaned ${cleanedCount} backtest JSON file(s).`);
}

cleanBacktestFiles(); 