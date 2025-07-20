
"use client";

import * as React from "react";
import { format, subDays } from "date-fns";
import { getHistoricalStockData, type StockData } from "@/services/stock-data";
import { TickerForm } from "@/components/stock/TickerForm";
import { PriceTable } from "@/components/stock/PriceTable";
import { PriceChart } from "@/components/stock/PriceChart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/stock/DatePicker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; // Import Button


export default function Home() {
  const [ticker, setTicker] = React.useState<string | null>(null);
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [stockData, setStockData] = React.useState<StockData[] | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  // Set initial dates on client-side to avoid hydration mismatch
  React.useEffect(() => {
    setStartDate(subDays(new Date(), 90));
    setEndDate(new Date());
  }, []);


  // Function to trigger data fetch based on current state
  const fetchData = async () => {
    if (!ticker) {
      setError("Please enter a ticker symbol.");
      toast({
        title: "Missing Ticker",
        description: "Please enter a stock ticker symbol first.",
        variant: "destructive",
      });
      return;
    }
     if (!startDate || !endDate) {
      setError("Please select both a start and end date.");
       toast({
         title: "Missing Dates",
         description: "Please select a valid start and end date.",
         variant: "destructive",
       });
      return;
    }
    if (startDate > endDate) {
        setError("Start date cannot be after end date.");
         toast({
            title: "Invalid Date Range",
            description: "The start date cannot be after the end date.",
            variant: "destructive",
         });
        return;
    }

    setIsLoading(true);
    setError(null);
    // Don't clear ticker here, keep it persistent
    setStockData(null); // Clear previous data immediately

    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = await getHistoricalStockData(ticker, formattedStartDate, formattedEndDate);

      if (data.length === 0) {
         setError(`No historical data found for ticker: ${ticker} between ${formattedStartDate} and ${formattedEndDate}`);
         toast({
            title: "No Data Found",
            description: `Could not retrieve historical stock data for ${ticker} in the selected date range.`,
            variant: "destructive",
         });
      } else {
         setStockData(data);
         toast({
            title: "Data Loaded",
            description: `Successfully loaded historical data for ${ticker}.`,
         });
      }
    } catch (err) {
      console.error("Error fetching stock data:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to fetch data for ${ticker}: ${errorMessage}`);
       toast({
          title: "Error Fetching Data",
          description: `Could not retrieve data for ${ticker}. Please try again.`,
          variant: "destructive",
       });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle ticker submission
  const handleTickerSubmit = (tickerSymbol: string) => {
     if (!tickerSymbol) return;
     setTicker(tickerSymbol.toUpperCase());
     // Trigger fetch immediately after setting ticker if dates are valid
     if (startDate && endDate && startDate <= endDate) {
         fetchData();
     } else if (!startDate || !endDate) {
         // If dates are not set yet, just set the ticker and wait for date selection or button click
          setError("Please select a start and end date."); // Remind user
     } else {
         setError("Start date cannot be after end date."); // Remind user
     }
   };


  // Handle date changes - optionally trigger fetch if ticker is already set
  const handleStartDateChange = (date: Date | undefined) => {
      setStartDate(date);
      // Optional: Automatically fetch if ticker exists and dates are valid
      // if (ticker && date && endDate && date <= endDate) fetchData();
  };

  const handleEndDateChange = (date: Date | undefined) => {
      setEndDate(date);
      // Optional: Automatically fetch if ticker exists and dates are valid
      // if (ticker && startDate && date && startDate <= date) fetchData();
  };

  // Disable dates after today for the end date picker
  const disableFutureDates = (date: Date) => {
      return date > new Date();
  };

  // Disable dates after the selected end date for the start date picker
   const disableDatesAfterEndDate = (date: Date) => {
       return (endDate && date > endDate) || date > new Date();
   };

   // Disable dates before the selected start date (and future dates) for the end date picker
    const disableDatesBeforeStartDateOrFuture = (date: Date) => {
       return (startDate && date < startDate) || date > new Date();
    };


  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12">
      <header className="w-full mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          StockPeeker 股票K線圖 📈
        </h1>
        <p className="text-muted-foreground">
          Enter a stock ticker and select a date range to view historical price data.
        </p>
      </header>

      {/* Input Section */}
      <section className="w-full max-w-4xl mb-8 md:mb-12 flex flex-col items-center gap-4 md:flex-row md:justify-center md:items-end md:gap-6">
        {/* Ticker Form */}
        <div className="w-full max-w-xs md:w-auto md:flex-grow">
           <TickerForm onSubmit={handleTickerSubmit} isLoading={isLoading} defaultTicker={ticker ?? ""} />
        </div>

        {/* Date Pickers */}
        <div className="w-full max-w-xs md:w-auto flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="flex-1 space-y-1">
              <Label htmlFor="start-date">開始日期 Start Date</Label>
              <DatePicker
                 date={startDate}
                 setDate={handleStartDateChange}
                 placeholder="Start Date"
                 disabled={disableDatesAfterEndDate}
                 buttonClassName="w-full"
                 aria-label="Select start date"
                 />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="end-date">結束日期 End Date</Label>
               <DatePicker
                   date={endDate}
                   setDate={handleEndDateChange}
                   placeholder="End Date"
                   disabled={disableDatesBeforeStartDateOrFuture}
                   buttonClassName="w-full"
                   aria-label="Select end date"
                   />
            </div>
        </div>
         {/* Update Button */}
         <div className="w-full max-w-xs md:w-auto flex justify-center md:self-end">
           <Button onClick={fetchData} disabled={isLoading || !ticker || !startDate || !endDate || startDate > endDate} className="w-full md:w-auto">
              <CalendarDays className="mr-2 h-4 w-4" />
               {isLoading ? "載入 Loading..." : "更新 Update Range"}
           </Button>
         </div>

      </section>

       {error && (
        <Alert variant="destructive" className="w-full max-w-3xl mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}


      <section className="w-full max-w-5xl space-y-8">
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
           <PriceChart data={stockData} isLoading={isLoading} ticker={ticker} />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <PriceTable data={stockData} isLoading={isLoading} ticker={ticker} />
        </div>
      </section>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
         <p>&copy; {new Date().getFullYear()} StockPeek. All rights reserved.</p>
         <p>Data provided for informational purposes only.</p>
      </footer>

      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0; /* Start hidden */
        }
      `}</style>
    </main>
  );
}
