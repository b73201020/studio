
"use client"

import * as React from "react"
import type { StockData } from "@/services/stock-data";
import { TrendingUp, BarChart2 } from "lucide-react";
import {
    ComposedChart,
    Bar,
    Cell, // Import Cell for custom bar coloring
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Brush,
    ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

type PriceChartProps = {
  data: StockData[] | null;
  isLoading: boolean;
  ticker: string | null;
};

// Define colors in config (or use inline styles)
// Removed chartConfig as colors are now handled by CSS variables and Cell rendering

export function PriceChart({ data, isLoading, ticker }: PriceChartProps) {
  const chartData = React.useMemo(() => {
    return data
      ? data.map(item => ({
          date: item.date,
          // Keep OHLC and Volume for chart and tooltip
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          // Data for candlestick body bar [open, close] or [close, open]
          // We need to render based on which is higher/lower for recharts Bar
          candleBody: [item.open, item.close].sort((a, b) => a - b),
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Ensure data is sorted by date
      : [];
  }, [data]);

  // State for Brush range
  const [brushStartIndex, setBrushStartIndex] = React.useState<number | undefined>(undefined);
  const [brushEndIndex, setBrushEndIndex] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    // Reset brush when data changes
    setBrushStartIndex(undefined);
    setBrushEndIndex(undefined);
  }, [data]);

  const handleBrushChange = (e: any) => {
    setBrushStartIndex(e.startIndex);
    setBrushEndIndex(e.endIndex);
  };

  const renderSkeletonChart = () => (
     <div className="aspect-video w-full">
        <Skeleton className="h-full w-full" />
     </div>
  );

  const renderNoDataMessage = () => (
     <div className="flex aspect-video w-full items-center justify-center text-muted-foreground">
      {ticker ? `No chart data available for ${ticker}` : "Enter a ticker to see the chart."}
     </div>
  );

  return (
    <Card className="transition-opacity duration-300 ease-in-out">
      <CardHeader>
        <CardTitle>
            {ticker ? `${ticker} K線圖` : "K線圖"}
        </CardTitle>
        <CardDescription>
          {isLoading
           ? `Loading chart data for ${ticker}...`
           : data && data.length > 0
           ? `顯示 ${ticker} 的開盤價、最高價、最低價、收盤價及成交量。使用下方的滑塊縮放。` // Updated description
           : ticker
           ? `No chart data found for ${ticker}.`
           : "Enter a ticker symbol to view the candlestick chart."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          renderSkeletonChart()
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
             <ComposedChart
              data={chartData}
              margin={{
                top: 5,
                right: 20, // Space for right YAxis
                left: 0, // Space for left YAxis
                bottom: 5, // Space for Brush
              }}
             >
               <CartesianGrid strokeDasharray="3 3" vertical={false} />
               {/* X Axis */}
               <XAxis
                 dataKey="date"
                 tickLine={false}
                 axisLine={false}
                 tickMargin={8}
                 tickFormatter={(value) => {
                     const date = new Date(value);
                     // Ensure value is a valid date string before formatting
                     if (isNaN(date.getTime())) return "";
                     return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                 }}
                 />

                {/* Y Axis for Price (Candlestick) */}
                <YAxis
                  yAxisId="price"
                  orientation="left"
                  domain={['auto', 'auto']} // Auto domain based on high/low
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                  width={60} // Give space for labels
                />
                {/* Y Axis for Volume */}
                <YAxis
                  yAxisId="volume"
                  orientation="right"
                  domain={[0, 'auto']} // Start volume from 0
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => {
                     if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
                     if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
                     if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
                     return value.toString();
                  }}
                  width={60} // Give space for labels
                />

               <Tooltip
                 cursor={{ strokeDasharray: '3 3' }}
                 content={
                   <ChartTooltipContent
                     // indicator="line" // Use line indicator for clarity
                     formatter={(value, name, props) => {
                         const payloadData = props.payload as any;
                         if (name === 'candleBody' && payloadData) { // Trigger tooltip on candleBody bar
                            // Ensure date is valid before formatting
                            const dateStr = !isNaN(new Date(payloadData.date).getTime()) ? new Date(payloadData.date).toLocaleDateString() : 'Invalid Date';
                            return (
                              <div>
                                <div className="font-semibold">{dateStr}</div>
                                <div><span className="text-muted-foreground">開:</span> ${payloadData.open?.toFixed(2)}</div>
                                <div><span className="text-muted-foreground">高:</span> ${payloadData.high?.toFixed(2)}</div>
                                <div><span className="text-muted-foreground">低:</span> ${payloadData.low?.toFixed(2)}</div>
                                <div><span className="text-muted-foreground">收:</span> ${payloadData.close?.toFixed(2)}</div>
                                <div><span className="text-muted-foreground">量:</span> {payloadData.volume?.toLocaleString()}</div>
                              </div>
                            );
                         }
                         // Don't show volume or wick in tooltip directly, it's in the main entry
                         if (name === 'volume' || name === 'candleWick') {
                             return null;
                         }
                         // Fallback for unexpected names
                         return `${name}: ${value}`;
                     }}
                   />
                 }
               />


                {/* Candlestick Wick (High/Low) - Thin Bar */}
                <Bar
                   yAxisId="price"
                   dataKey={(dataItem) => [dataItem.low, dataItem.high]} // Data for the full range (low to high)
                   name="candleWick" // Name for tooltip logic (hidden)
                   barSize={1} // Make it very thin like a wick
                   isAnimationActive={!isLoading}
                   animationDuration={300}
                   shape={<rect />} // Use basic shape, coloring done by Cell
                 >
                    {/* Color based on open/close */}
                    {chartData.map((entry, index) => (
                         <Cell
                            key={`cell-wick-${index}`}
                            fill={entry.close >= entry.open ? 'hsl(var(--chart-positive))' : 'hsl(var(--chart-negative))'}
                         />
                     ))}
                 </Bar>

                {/* Candlestick Body (Open/Close) - Thicker Bar */}
                <Bar
                  yAxisId="price"
                  dataKey="candleBody" // Use the sorted [lowVal, highVal] of open/close
                  name="candleBody" // Name for tooltip trigger
                  barSize={8} // Adjust size as needed
                  isAnimationActive={!isLoading}
                  animationDuration={300}
                  shape={<rect />} // Use basic shape, coloring done by Cell
                 >
                    {/* Color based on open/close */}
                     {chartData.map((entry, index) => (
                         <Cell
                            key={`cell-body-${index}`}
                            fill={entry.close >= entry.open ? 'hsl(var(--chart-positive))' : 'hsl(var(--chart-negative))'}
                         />
                     ))}
                 </Bar>

               {/* Volume Bars */}
               <Bar
                 yAxisId="volume"
                 dataKey="volume"
                 fill="hsl(var(--chart-2))" // Keep volume color consistent
                 opacity={0.5} // Slightly less opaque
                 isAnimationActive={!isLoading}
                 animationDuration={300}
                 name="Volume" // Name for tooltip logic (hidden)
                 />

                {/* Brush for Zooming */}
                <Brush
                    dataKey="date"
                    height={30}
                    stroke={'hsl(var(--chart-1))'} // Use a neutral color for brush
                    startIndex={brushStartIndex}
                    endIndex={brushEndIndex}
                    onChange={handleBrushChange}
                    tickFormatter={(value) => { // Simpler tick format for brush
                         const date = new Date(value);
                         // Ensure value is a valid date string before formatting
                         if (isNaN(date.getTime())) return "";
                         return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                     }}
                    />

             </ComposedChart>
           </ResponsiveContainer>
        ) : (
          renderNoDataMessage()
        )}
      </CardContent>
       <CardFooter className="flex-col items-start gap-2 text-sm">
        {data && data.length > 0 && (
          <div className="flex gap-2 font-medium leading-none">
             <TrendingUp className="h-4 w-4 text-primary" /> Price trend for {ticker}
          </div>
        )}
        {data && data.length > 0 && (
            <div className="flex gap-2 font-medium leading-none text-muted-foreground">
                 <BarChart2 className="h-4 w-4 text-secondary-foreground" /> Volume data shown
            </div>
        )}
         <div className="leading-none text-muted-foreground">
           Displaying historical OHLC (Open, High, Low, Close) prices and volume. Green candles indicate Close &gt;= Open, Red candles indicate Close &lt; Open. Use the brush/slider below the chart to zoom. Data may be delayed. {/* Corrected comparison character */}
         </div>
      </CardFooter>
    </Card>
  );
}
