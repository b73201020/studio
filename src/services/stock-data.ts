import { format, subDays, differenceInDays, parseISO } from 'date-fns';

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
function generateMockData(ticker: string, startDateStr: string, endDateStr: string): StockData[] {
  const data: StockData[] = [];
  const startDate = parseISO(startDateStr);
  const endDate = parseISO(endDateStr);

  // Validate dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
      console.error("Invalid date range provided:", startDateStr, endDateStr);
      return []; // Return empty for invalid range
  }

  const days = differenceInDays(endDate, startDate) + 1; // +1 to include both start and end dates
  if (days <= 0) {
      return [];
  }


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


  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateString = format(currentDate, 'yyyy-MM-dd');

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
 * Asynchronously retrieves historical stock data for a given stock ticker symbol between specified dates.
 *
 * @param ticker The stock ticker symbol to retrieve data for (e.g., AAPL, GOOG). Use 'NODATA' for empty result test, 'ERROR' for error test.
 * @param startDate Optional. The start date for the data range (YYYY-MM-DD). Defaults to 90 days ago.
 * @param endDate Optional. The end date for the data range (YYYY-MM-DD). Defaults to today.
 * @returns A promise that resolves to an array of StockData objects for the specified date range.
 */
export async function getHistoricalStockData(
    ticker: string,
    startDate?: string,
    endDate?: string
): Promise<StockData[]> {
    const effectiveEndDate = endDate || format(new Date(), 'yyyy-MM-dd');
    const effectiveStartDate = startDate || format(subDays(new Date(), 90), 'yyyy-MM-dd');

    console.log(`Fetching mock data for ticker: ${ticker} from ${effectiveStartDate} to ${effectiveEndDate}`);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

  // In a real application, you would fetch data from an API like Alpha Vantage, IEX Cloud, etc.
  // Example:
  // const apiKey = process.env.STOCK_API_KEY;
  // const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${apiKey}`);
  // const rawData = await response.json();
  // const processedData = parseAlphaVantageData(rawData, effectiveStartDate, effectiveEndDate); // Implement parsing & filtering logic
  // return processedData;

  // For now, return generated mock data for the specified range
  return generateMockData(ticker.toUpperCase(), effectiveStartDate, effectiveEndDate);
}

// Example parsing function (if using Alpha Vantage)
/*
function parseAlphaVantageData(rawData: any, startDate?: string, endDate?: string): StockData[] {
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

  let data = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
    date: date,
    open: parseFloat(values["1. open"]),
    high: parseFloat(values["2. high"]),
    low: parseFloat(values["3. low"]),
    close: parseFloat(values["4. close"]),
    volume: parseInt(values["5. volume"], 10),
  }));

  // Filter by date range if provided
  if (startDate) {
    data = data.filter(item => item.date >= startDate);
  }
  if (endDate) {
    data = data.filter(item => item.date <= endDate);
  }


  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ensure chronological order
}
*/
