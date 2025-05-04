import type { StockData } from "@/services/stock-data";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

type PriceTableProps = {
  data: StockData[] | null;
  isLoading: boolean;
  ticker: string | null;
};

export function PriceTable({ data, isLoading, ticker }: PriceTableProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
  };

  const formatVolume = (value: number) => {
    return value.toLocaleString("en-US");
  };

  const renderSkeletonRows = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="rounded-lg border shadow-sm transition-opacity duration-300 ease-in-out" aria-live="polite" aria-busy={isLoading}>
      <Table>
        <TableCaption>
          {isLoading
            ? `Loading historical stock data for ${ticker}...`
            : data && data.length > 0
            ? `Historical stock data for ${ticker || "the selected ticker"}.`
            : ticker
            ? `No historical data found for ${ticker}.`
            : "Enter a ticker symbol to view historical data."}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Open</TableHead>
            <TableHead className="text-right">High</TableHead>
            <TableHead className="text-right">Low</TableHead>
            <TableHead className="text-right">Close</TableHead>
            <TableHead className="text-right">Volume</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            renderSkeletonRows(5) // Show 5 skeleton rows while loading
          ) : data && data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item.date}>
                <TableCell className="font-medium">{item.date}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.open)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.high)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.low)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.close)}</TableCell>
                <TableCell className="text-right">{formatVolume(item.volume)}</TableCell>
              </TableRow>
            ))
          ) : (
             <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {ticker ? `No data available for ${ticker}` : "Please enter a ticker symbol."}
                </TableCell>
             </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
