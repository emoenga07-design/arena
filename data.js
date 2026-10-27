/* Terminal market data simulator.
 *
 * Everything is generated client-side from a seeded PRNG so the terminal
 * works offline with realistic, self-consistent prices. A real terminal would
 * fetch these from a market data feed; the shapes below are intentional so a
 * live API can be swapped in later.
 */

// --- Seeded PRNG (mulberry32) -----------------------------------------------
function createRng(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = createRng(0xc0ffee27);
const chance = (p) => rand() < p;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const range = (min, max) => min + rand() * (max - min);

// --- Universe ---------------------------------------------------------------
const SECTORS = [
  'Technology', 'Financials', 'Healthcare', 'Consumer Discretionary',
  'Consumer Staples', 'Industrials', 'Energy', 'Communication Services',
  'Cryptocurrency'
];

const UNIVERSE = [
  { symbol: 'AAPL', name: 'Apple Inc', sector: 'Technology', base: 189.45 },
  { symbol: 'MSFT', name: 'Microsoft Corp', sector: 'Technology', base: 378.20 },
  { symbol: 'GOOGL', name: 'Alphabet Inc Cl A', sector: 'Communication Services', base: 142.10 },
  { symbol: 'AMZN', name: 'Amazon.com Inc', sector: 'Consumer Discretionary', base: 178.60 },
  { symbol: 'META', name: 'Meta Platforms Inc', sector: 'Communication Services', base: 492.30 },
  { symbol: 'TSLA', name: 'Tesla Inc', sector: 'Consumer Discretionary', base: 245.10 },
  { symbol: 'NVDA', name: 'NVIDIA Corp', sector: 'Technology', base: 875.40 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', base: 162.70 },
  { symbol: 'INTC', name: 'Intel Corp', sector: 'Technology', base: 42.50 },
  { symbol: 'CSCO', name: 'Cisco Systems Inc', sector: 'Technology', base: 56.30 },
  { symbol: 'ORCL', name: 'Oracle Corp', sector: 'Technology', base: 138.90 },
  { symbol: 'ADBE', name: 'Adobe Inc', sector: 'Technology', base: 512.20 },
  { symbol: 'CRM', name: 'Salesforce Inc', sector: 'Technology', base: 278.10 },
  { symbol: 'NFLX', name: 'Netflix Inc', sector: 'Communication Services', base: 615.40 },
  { symbol: 'DIS', name: 'Walt Disney Co', sector: 'Communication Services', base: 92.70 },
  { symbol: 'V', name: 'Visa Inc', sector: 'Financials', base: 276.40 },
  { symbol: 'MA', name: 'Mastercard Inc', sector: 'Financials', base: 487.20 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co', sector: 'Financials', base: 198.50 },
  { symbol: 'BAC', name: 'Bank of America Corp', sector: 'Financials', base: 38.90 },
  { symbol: 'WFC', name: 'Wells Fargo & Co', sector: 'Financials', base: 60.20 },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc', sector: 'Financials', base: 445.10 },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financials', base: 98.40 },
  { symbol: 'C', name: 'Citigroup Inc', sector: 'Financials', base: 63.70 },
  { symbol: 'AXP', name: 'American Express Co', sector: 'Financials', base: 218.60 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', base: 154.30 },
  { symbol: 'PFE', name: 'Pfizer Inc', sector: 'Healthcare', base: 27.80 },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc', sector: 'Healthcare', base: 492.70 },
  { symbol: 'ABBV', name: 'AbbVie Inc', sector: 'Healthcare', base: 176.40 },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', sector: 'Healthcare', base: 541.20 },
  { symbol: 'DHR', name: 'Danaher Corp', sector: 'Healthcare', base: 228.50 },
  { symbol: 'BMY', name: 'Bristol-Myers Squibb Co', sector: 'Healthcare', base: 48.90 },
  { symbol: 'MRK', name: 'Merck & Co Inc', sector: 'Healthcare', base: 124.60 },
  { symbol: 'XOM', name: 'Exxon Mobil Corp', sector: 'Energy', base: 118.30 },
  { symbol: 'CVX', name: 'Chevron Corp', sector: 'Energy', base: 152.70 },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy', base: 124.20 },
  { symbol: 'SLB', name: 'Schlumberger Ltd', sector: 'Energy', base: 48.30 },
  { symbol: 'WMT', name: 'Walmart Inc', sector: 'Consumer Staples', base: 65.40 },
  { symbol: 'HD', name: "Home Depot Inc", sector: 'Consumer Discretionary', base: 356.80 },
  { symbol: 'PG', name: 'Procter & Gamble Co', sector: 'Consumer Staples', base: 158.20 },
  { symbol: 'KO', name: 'Coca-Cola Co', sector: 'Consumer Staples', base: 62.10 },
  { symbol: 'PEP', name: 'PepsiCo Inc', sector: 'Consumer Staples', base: 168.70 },
  { symbol: 'COST', name: 'Costco Wholesale Corp', sector: 'Consumer Staples', base: 872.30 },
  { symbol: 'MCD', name: "McDonald's Corp", sector: 'Consumer Discretionary', base: 284.40 },
  { symbol: 'NKE', name: 'Nike Inc', sector: 'Consumer Discretionary', base: 78.20 },
  { symbol: 'SBUX', name: 'Starbucks Corp', sector: 'Consumer Discretionary', base: 92.50 },
  { symbol: 'BA', name: 'Boeing Co', sector: 'Industrials', base: 198.30 },
  { symbol: 'CAT', name: 'Caterpillar Inc', sector: 'Industrials', base: 334.70 },
  { symbol: 'GE', name: 'GE Aerospace', sector: 'Industrials', base: 168.40 },
  { symbol: 'F', name: 'Ford Motor Co', sector: 'Consumer Discretionary', base: 12.60 },
  { symbol: 'GM', name: 'General Motors Co', sector: 'Consumer Discretionary', base: 44.20 },
  { symbol: 'PLTR', name: 'Palantir Technologies Inc', sector: 'Technology', base: 23.40 },
  { symbol: 'COIN', name: 'Coinbase Global Inc', sector: 'Cryptocurrency', base: 218.50 },
  { symbol: 'BTC-USD', name: 'Bitcoin USD', sector: 'Cryptocurrency', base: 67240.00 },
  { symbol: 'ETH-USD', name: 'Ethereum USD', sector: 'Cryptocurrency', base: 3450.00 }
];

const DEFAULT_WATCHLIST = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'AMD',
  'JPM', 'V', 'XOM', 'WMT', 'COIN', 'BTC-USD', 'ETH-USD', 'PLTR'
];

const INDICES = [
  { sym: 'SPX', name: 'S&P 500', base: 4567.89 },
  { sym: 'DJI', name: 'Dow Jones', base: 35421.40 },
  { sym: 'IXIC', name: 'Nasdaq Composite', base: 14321.55 },
  { sym: 'RUT', name: 'Russell 2000', base: 2014.30 },
  { sym: 'VIX', name: 'CBOE Volatility', base: 14.80 },
  { sym: 'FTSE', name: 'FTSE 100', base: 7643.20 },
  { sym: 'GDAXI', name: 'DAX', base: 15672.90 },
  { sym: 'N225', name: 'Nikkei 225', base: 33421.60 },
  { sym: 'HSI', name: 'Hang Seng', base: 17543.10 },
  { sym: 'SHCOMP', name: 'Shanghai Composite', base: 2956.40 }
];

const FX = [
  { sym: 'EURUSD', name: 'Euro / US Dollar', base: 1.0847 },
  { sym: 'GBPUSD', name: 'British Pound / US Dollar', base: 1.2654 },
  { sym: 'USDJPY', name: 'US Dollar / Japanese Yen', base: 149.20 },
  { sym: 'USDCHF', name: 'US Dollar / Swiss Franc', base: 0.8912 },
  { sym: 'AUDUSD', name: 'Australian Dollar / US Dollar', base: 0.6543 },
  { sym: 'USDCAD', name: 'US Dollar / Canadian Dollar', base: 1.3582 }
];

const CRYPTO = [
  { sym: 'BTCUSD', name: 'Bitcoin', base: 67240.00 },
  { sym: 'ETHUSD', name: 'Ethereum', base: 3450.00 },
  { sym: 'SOLUSD', name: 'Solana', base: 142.80 },
  { sym: 'XRPUSD', name: 'XRP', base: 0.6123 },
  { sym: 'ADAUSD', name: 'Cardano', base: 0.4451 },
  { sym: 'DOGEUSD', name: 'Dogecoin', base: 0.1564 }
];

const COMMODITIES = [
  { sym: 'CL1', name: 'Crude Oil WTI', base: 78.40, fmt: (v) => v.toFixed(2) },
  { sym: 'CO1', name: 'Brent Crude', base: 82.10, fmt: (v) => v.toFixed(2) },
  { sym: 'NG1', name: 'Natural Gas', base: 2.640, fmt: (v) => v.toFixed(3) },
  { sym: 'GC1', name: 'Gold', base: 2314.50, fmt: (v) => v.toFixed(2) },
  { sym: 'SI1', name: 'Silver', base: 27.80, fmt: (v) => v.toFixed(2) },
  { sym: 'ZC1', name: 'Corn', base: 432.50, fmt: (v) => v.toFixed(1) }
];

const CALENDAR = [
  { time: '08:30', event: 'Initial Jobless Claims', actual: '215K', forecast: '220K', prev: '218K' },
  { time: '08:30', event: 'CPI MoM', actual: '0.3%', forecast: '0.3%', prev: '0.1%' },
  { time: '10:00', event: 'Existing Home Sales', actual: '4.05M', forecast: '4.02M', prev: '3.98M' },
  { time: '10:30', event: 'Crude Oil Inventories', actual: '-1.4M', forecast: '-0.9M', prev: '+0.3M' },
  { time: '14:00', event: 'FOMC Statement', actual: '—', forecast: '—', prev: '—' }
];

const NEWS_TEMPLATES = [
  { sym: 'AAPL', title: 'Apple unveils new AI features for iPhone, shares rise', type: 'equity' },
  { sym: 'NVDA', title: 'NVIDIA data center revenue beats estimates on AI demand', type: 'equity' },
  { sym: 'TSLA', title: 'Tesla delivers record quarterly vehicle numbers', type: 'equity' },
  { sym: 'MSFT', title: 'Microsoft cloud growth accelerates on Azure AI workloads', type: 'equity' },
  { sym: 'BTC-USD', title: 'Bitcoin approaches all-time high as ETF inflows surge', type: 'crypto' },
  { sym: 'SPX', title: 'S&P 500 closes at record high on strong earnings', type: 'index' },
  { sym: 'JPM', title: 'JPMorgan raises quarterly dividend, buys back stock', type: 'equity' },
  { sym: 'XOM', title: 'Oil prices climb on Middle East supply concerns', type: 'commodity' },
  { sym: 'FED', title: 'Federal Reserve holds rates steady, signals cautious path', type: 'macro' },
  { sym: 'COIN', title: 'Coinbase reports record trading volume ahead of halving', type: 'crypto' }
];

// --- Quote model ------------------------------------------------------------
function fmtPrice(v, decimals = 2) {
  return v.toFixed(decimals);
}
function fmtVolume(v) {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(2) + 'K';
  return v.toFixed(0);
}
function fmtLarge(v) {
  if (v >= 1e12) return '$' + (v / 1e12).toFixed(2) + 'T';
  if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M';
  return '$' + v.toFixed(0);
}

function buildQuote(u) {
  const base = u.base;
  const changePct = (rand() - 0.5) * 14; // -7%..+7%
  const change = base * (changePct / 100);
  const price = base + change;
  const prev = base;
  const open = prev * (1 + (rand() - 0.5) * 0.02);
  const high = Math.max(price, open) * (1 + rand() * 0.03);
  const low = Math.min(price, open) * (1 - rand() * 0.03);
  const volume = Math.floor(1e6 + rand() * 90e6);
  const shares = Math.floor(3e8 + rand() * 12e8);
  const mcap = price * shares;
  const pe = 6 + rand() * 44;
  const divYield = u.sector === 'Cryptocurrency' ? 0 : rand() * 0.035;
  const week52Low = low * (0.7 + rand() * 0.3);
  const week52High = high * (1.1 + rand() * 0.4);
  return {
    symbol: u.symbol,
    name: u.name,
    sector: u.sector,
    price,
    change,
    changePct,
    prev,
    open,
    high,
    low,
    volume,
    shares,
    mcap,
    pe,
    divYield,
    week52Low,
    week52High,
    updated: Date.now()
  };
}

function buildUniverse() {
  return UNIVERSE.map(buildQuote);
}

// Random-walk tick for live price movement
function tickQuotes(quotes) {
  const now = Date.now();
  quotes.forEach((q) => {
    if (!chance(0.35)) return;
    const drift = (rand() - 0.5) * 0.0004; // tiny per-tick drift
    q.price *= 1 + drift;
    q.change = q.price - q.prev;
    q.changePct = (q.change / q.prev) * 100;
    if (chance(0.2)) q.volume += Math.floor(rand() * 300000);
    q.high = Math.max(q.high, q.price);
    q.low = Math.min(q.low, q.price);
    q.updated = now;
  });
}

function findQuote(quotes, symbol) {
  return quotes.find((q) => q.symbol === symbol.toUpperCase());
}

// Intraday chart history (96 five-minute points) anchored at current price
function buildHistory(q, points = 96) {
  const hist = [];
  let p = q.open;
  const step = (q.price - q.open) / (points - 1);
  for (let i = 0; i < points; i++) {
    p += step + (rand() - 0.5) * q.price * 0.0012;
    hist.push(Math.max(p, q.low * 0.995));
  }
  // nudge last point to close exactly at current price
  hist[points - 1] = q.price;
  return hist;
}

export {
  rand, chance, pick, range,
  SECTORS, UNIVERSE, DEFAULT_WATCHLIST,
  INDICES, FX, CRYPTO, COMMODITIES, CALENDAR, NEWS_TEMPLATES,
  buildQuote, buildUniverse, tickQuotes, buildHistory,
  findQuote, fmtPrice, fmtVolume, fmtLarge
};
