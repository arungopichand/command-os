// COMMAND. OS - Market Intelligence Utility
// Provides simulated real-time data for the world's most active stocks and indices
// Designed for the "War Room" aesthetic without requiring external API keys

export interface MarketTicker {
  symbol: string;
  name: string;
  price: number;
  change: number;
  type: 'index' | 'stock';
}

const BASE_MARKET_DATA: MarketTicker[] = [
  { symbol: 'SPY', name: 'S&P 500 ETF', price: 512.45, change: 0.12, type: 'index' },
  { symbol: 'QQQ', name: 'Nasdaq 100', price: 438.20, change: -0.45, type: 'index' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', price: 895.10, change: 2.34, type: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc', price: 175.40, change: -1.20, type: 'stock' },
  { symbol: 'AAPL', name: 'Apple Inc', price: 182.30, change: 0.85, type: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft', price: 415.60, change: 0.25, type: 'stock' },
];

export function getSimulatedMarketData(): MarketTicker[] {
  return BASE_MARKET_DATA.map(ticker => {
    // Generate a small random fluctuation (-0.5% to +0.5%)
    const volatility = (Math.random() - 0.5) * 0.01;
    const newPrice = ticker.price * (1 + volatility);
    const newChange = ticker.change + (Math.random() - 0.5) * 0.2;
    
    return {
      ...ticker,
      price: Number(newPrice.toFixed(2)),
      change: Number(newChange.toFixed(2))
    };
  });
}

export function getMarketSentiment(data: MarketTicker[]): { status: string; color: string; val: number } {
  const avgChange = data.reduce((acc, t) => acc + t.change, 0) / data.length;
  if (avgChange > 0.5) return { status: 'BULLISH OVERDRIVE', color: 'text-emerald-500', val: avgChange };
  if (avgChange > 0) return { status: 'MODERATE BULL', color: 'text-emerald-400', val: avgChange };
  if (avgChange > -0.5) return { status: 'CAUTIOUS BEAR', color: 'text-rose-400', val: avgChange };
  return { status: 'EXTREME VOLATILITY / BEAR', color: 'text-rose-600', val: avgChange };
}
