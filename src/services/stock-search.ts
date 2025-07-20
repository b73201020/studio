
export interface TickerSearchResult {
  symbol: string;
  name: string;
}

// In a real app, this would come from a database or a search API
const MOCK_TICKERS: TickerSearchResult[] = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "AMZN", name: "Amazon.com, Inc." },
  { symbol: "NVDA", name: "NVIDIA Corporation" },
  { symbol: "TSLA", name: "Tesla, Inc." },
  { symbol: "META", name: "Meta Platforms, Inc." },
  { symbol: "BRK.A", name: "Berkshire Hathaway Inc." },
  { symbol: "JPM", name: "JPMorgan Chase & Co." },
  { symbol: "V", name: "Visa Inc." },
  { symbol: "DIS", name: "The Walt Disney Company" },
  { symbol: "NFLX", name: "Netflix, Inc." },
  { symbol: "PYPL", name: "PayPal Holdings, Inc." },
  { symbol: "ADBE", name: "Adobe Inc." },
  { symbol: "CRM", name: "Salesforce, Inc." },
  { symbol: "NODATA", name: "No Data Corp" },
  { symbol: "ERROR", name: "Error Inc." },
  { symbol: "TSM", name: "Taiwan Semiconductor Manufacturing Company"},
  { symbol: "2330.TW", name: "台積電 (TSMC)"}
];

/**
 * Asynchronously searches for stock tickers based on a query.
 * This is a mock implementation.
 *
 * @param query The search query string.
 * @returns A promise that resolves to an array of TickerSearchResult objects.
 */
export async function searchTickers(query: string): Promise<TickerSearchResult[]> {
  const lowerCaseQuery = query.toLowerCase();

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  if (!query) {
    return [];
  }

  const results = MOCK_TICKERS.filter(
    (ticker) =>
      ticker.symbol.toLowerCase().includes(lowerCaseQuery) ||
      ticker.name.toLowerCase().includes(lowerCaseQuery)
  );

  return results.slice(0, 10); // Return top 10 results
}
