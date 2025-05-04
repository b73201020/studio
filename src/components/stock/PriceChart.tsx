
"use client"

import * as React from "react"
import type { StockData } from "@/services/stock-data";
import { TrendingUp, BarChart2 } from "lucide-react"; // Added BarChart2 icon
import {
    ComposedChart, // Changed from LineChart
    Bar,          // Added for Volume
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Brush,        // Added for zooming/range selection
    ResponsiveContainer, // Use ResponsiveContainer directly
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
} from "@/components/ui/chart"; // ChartContainer removed as we use ResponsiveContainer directly
import { Skeleton } from "@/components/ui/skeleton";

type PriceChartProps = {
  data: StockData[] | null;
  isLoading: boolean;
  ticker: string | null;
};

// Define colors in config (or use inline styles)
const chartConfig = {
  close: {
    label: "Close",
    color: "hsl(var(--chart-1))",
  },
  volume: {
    label: "Volume",
    color: "hsl(var(--chart-2))",
  },
};

export function PriceChart({ data, isLoading, ticker }: PriceChartProps) {
  const chartData = React.useMemo(() => {
    return data
      ? data.map(item => ({
          date: item.date,
          close: item.close,
          volume: item.volume,
          open: item.open, // Include OHLC for tooltip
          high: item.high,
          low: item.low,
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
            {ticker ? `${ticker} 技術分析圖` : "技術分析圖"} {/* Updated Title */}
        </CardTitle>
        <CardDescription>
          {isLoading
           ? `Loading chart data for ${ticker}...`
           : data && data.length > 0
           ? `Showing closing prices and volume for ${ticker}. Use the brush below to zoom.`
           : ticker
           ? `No chart data found for ${ticker}.`
           : "Enter a ticker symbol to view the price chart."
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          renderSkeletonChart()
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
             <ComposedChart // Use ComposedChart
              data={chartData}
              margin={{
                top: 5,
                right: 20,
                left: 0, // Adjusted margin for YAxis labels
                bottom: 5, // Adjusted margin for Brush
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
                     // Adjust formatting based on range? Could get complex.
                     // Simple day/month format for now.
                     return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                 }}
                 // Hide XAxis ticks within the main chart when Brush is active
                 // Alternatively, keep them but might overlap with Brush ticks
                 // tick={brushStartIndex !== undefined ? false : true}
                 // height={brushStartIndex !== undefined ? 1 : undefined} // Reduce space if ticks hidden
                 />

                {/* Y Axis for Price */}
                <YAxis
                  yAxisId="price"
                  orientation="left"
                  domain={['auto', 'auto']}
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
                     indicator="dot" // or "line"
                     labelFormatter={(label) => new Date(label).toLocaleDateString()}
                     formatter={(value, name, props) => {
                         const payloadData = props.payload as any;
                         if (name === 'close' && payloadData) {
                            return (
                              <div>
                                <div><strong>Date:</strong> {new Date(payloadData.date).toLocaleDateString()}</div>
                                <div><strong>O:</strong> ${payloadData.open?.toFixed(2)}</div>
                                <div><strong>H:</strong> ${payloadData.high?.toFixed(2)}</div>
                                <div><strong>L:</strong> ${payloadData.low?.toFixed(2)}</div>
                                <div><strong>C:</strong> ${payloadData.close?.toFixed(2)}</div>
                                <div><strong>Vol:</strong> {payloadData.volume?.toLocaleString()}</div>
                              </div>
                            );
                         }
                         if (name === 'volume') {
                             return null; // Volume info is included in the 'close' formatter
                         }
                         return `${name}: ${value}`;
                     }}
                     // Custom formatter to show OHLC and Volume
                     // formatter={(value, name, props) => {
                     //   if (name === 'close') {
                     //      return `$${(value as number).toFixed(2)} (Close)`;
                     //   }
                     //   if (name === 'volume') {
                     //      return `${(value as number).toLocaleString()} (Volume)`;
                     //   }
                     //   return `${name}: ${value}`;
                     // }}
                   />
                 }
               />

               {/* Price Line */}
               <Line
                 yAxisId="price"
                 dataKey="close"
                 type="monotone"
                 stroke={chartConfig.close.color}
                 strokeWidth={2}
                 dot={false}
                 isAnimationActive={!isLoading}
                 animationDuration={300}
                 name="Close" // Name for tooltip
               />

               {/* Volume Bars */}
               <Bar
                 yAxisId="volume"
                 dataKey="volume"
                 fill={chartConfig.volume.color}
                 opacity={0.6}
                 isAnimationActive={!isLoading}
                 animationDuration={300}
                 name="Volume" // Name for tooltip
                 />

                {/* Brush for Zooming */}
                <Brush
                    dataKey="date"
                    height={30}
                    stroke={chartConfig.close.color} // Match line color
                    startIndex={brushStartIndex}
                    endIndex={brushEndIndex}
                    onChange={handleBrushChange}
                    tickFormatter={(value) => { // Simpler tick format for brush
                         const date = new Date(value);
                         return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                     }}
                    // travellerWidth={10} // Adjust handle width
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
           Displaying historical closing prices and volume. Data may be delayed. Use the brush/slider below the chart to zoom in on a specific date range.
         </div>
      </CardFooter>
    </Card>
  );
}
