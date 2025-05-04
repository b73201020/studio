"use client";

import * as React from "react";
import { getHistoricalStockData, type StockData } from "@/services/stock-data";
import { TickerForm } from "@/components/stock/TickerForm";
import { PriceTable } from "@/components/stock/PriceTable";
import { PriceChart } from "@/components/stock/PriceChart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


export default function Home() {
  const [ticker, setTicker] = React.useState<string | null>(null);
  const [stockData, setStockData] = React.useState<StockData[] | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleFetchData = async (tickerSymbol: string) => {
    if (!tickerSymbol) return;

    setIsLoading(true);
    setError(null);
    setTicker(tickerSymbol);
    setStockData(null); // Clear previous data immediately

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = await getHistoricalStockData(tickerSymbol);
      if (data.length === 0) {
         setError(`No historical data found for ticker: ${tickerSymbol}`);
         toast({
            title: "No Data Found",
            description: `Could not retrieve historical stock data for ${tickerSymbol}.`,
            variant: "destructive",
         });
      } else {
         setStockData(data);
         toast({
            title: "Data Loaded",
            description: `Successfully loaded historical data for ${tickerSymbol}.`,
         });
      }
    } catch (err) {
      console.error("Error fetching stock data:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to fetch data for ${tickerSymbol}: ${errorMessage}`);
       toast({
          title: "Error Fetching Data",
          description: `Could not retrieve data for ${tickerSymbol}. Please try again.`,
          variant: "destructive",
       });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12">
      <header className="w-full mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          StockPeek 📈
        </h1>
        <p className="text-muted-foreground">
          Enter a stock ticker symbol to view its historical price data.
        </p>
      </header>

      <section className="w-full max-w-md mb-8 md:mb-12 flex justify-center">
        <TickerForm onSubmit={handleFetchData} isLoading={isLoading} defaultTicker={ticker ?? ""} />
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
