/**
 * Represents historical stock data for a given date.
 */
export interface StockData {
  /**
   * The date for which the stock data is recorded. ISO 8601 format (YYYY-MM-DD).
   */
  date: string;
  /**
   * The opening price of the stock on the given date.
   */
  open: number;
  /**
   * The highest price of the stock on the given date.
   */
  high: number;
  /**
   * The lowest price of the stock on the given date.
   */
  low: number;
  /**
   * The closing price of the stock on the given date.
   */
  close: number;
  /**
   * The volume of shares traded on the given date.
   */
  volume: number;
}

// Mock data generation function
function generateMockData(ticker: string, days: number): StockData[] {
  const data: StockData[] = [];
  let lastClose = 150 + Math.random() * 50; // Start price between 150 and 200

  // Simple seed based on ticker for pseudo-consistency
  let seed = 0;
  for (let i = 0; i < ticker.length; i++) {
    seed += ticker.charCodeAt(i);
  }
  const pseudoRandom = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };


  // Return empty array for a specific ticker for testing 'no data' case
  if (ticker === 'NODATA') {
    return [];
  }
  // Simulate an error for a specific ticker
  if (ticker === 'ERROR') {
    throw new Error("Simulated API error for ticker ERROR");
  }


  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    const changePercent = (pseudoRandom() - 0.48) * 0.1; // -4.8% to +5.2% daily change
    const open = lastClose * (1 + (pseudoRandom() - 0.5) * 0.01); // Open +/- 0.5% of last close
    const high = Math.max(open, lastClose) * (1 + pseudoRandom() * 0.03); // High up to 3% higher
    const low = Math.min(open, lastClose) * (1 - pseudoRandom() * 0.03); // Low up to 3% lower
    const close = open * (1 + changePercent);
    const volume = Math.floor(pseudoRandom() * 5000000) + 500000; // Volume between 500k and 5.5M

    data.push({
      date: dateString,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: volume,
    });

    lastClose = close;
  }

  return data;
}


/**
 * Asynchronously retrieves historical stock data for a given stock ticker symbol.
 *
 * @param ticker The stock ticker symbol to retrieve data for (e.g., AAPL, GOOG). Use 'NODATA' for empty result test, 'ERROR' for error test.
 * @returns A promise that resolves to an array of StockData objects for the last 90 days.
 */
export async function getHistoricalStockData(ticker: string): Promise<StockData[]> {
  console.log(`Fetching mock data for ticker: ${ticker}`);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

  // In a real application, you would fetch data from an API like Alpha Vantage, IEX Cloud, etc.
  // Example:
  // const apiKey = process.env.STOCK_API_KEY;
  // const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${apiKey}`);
  // const rawData = await response.json();
  // const processedData = parseAlphaVantageData(rawData); // Implement parsing logic
  // return processedData;

  // For now, return generated mock data for the last 90 days
  return generateMockData(ticker.toUpperCase(), 90);
}

// Example parsing function (if using Alpha Vantage)
/*
function parseAlphaVantageData(rawData: any): StockData[] {
  const timeSeries = rawData["Time Series (Daily)"];
  if (!timeSeries) {
    // Handle case where ticker is invalid or no data is returned
    if (rawData["Error Message"]) {
      console.warn(`API Error for ticker: ${rawData["Error Message"]}`);
    } else if (rawData["Note"]) {
       console.warn(`API Note: ${rawData["Note"]}`); // Often indicates API limit reached
    }
    return [];
  }

  return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
    date: date,
    open: parseFloat(values["1. open"]),
    high: parseFloat(values["2. high"]),
    low: parseFloat(values["3. low"]),
    close: parseFloat(values["4. close"]),
    volume: parseInt(values["5. volume"], 10),
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ensure chronological order
}
*/
