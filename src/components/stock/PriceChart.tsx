"use client"

import * as React from "react"
import type { StockData } from "@/services/stock-data";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

type PriceChartProps = {
  data: StockData[] | null;
  isLoading: boolean;
  ticker: string | null;
};

const chartConfig = {
  close: {
    label: "Close Price",
    color: "hsl(var(--chart-1))", // Use primary color from theme
  },
} satisfies React.ComponentProps<typeof ChartContainer>["config"];

export function PriceChart({ data, isLoading, ticker }: PriceChartProps) {
  const chartData = React.useMemo(() => {
    return data
      ? data.map(item => ({
          date: item.date,
          close: item.close,
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Ensure data is sorted by date
      : [];
  }, [data]);

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
            {ticker ? `${ticker} Closing Price Trend` : "Closing Price Trend"}
        </CardTitle>
        <CardDescription>
          {isLoading
           ? `Loading chart data for ${ticker}...`
           : data && data.length > 0
           ? `Showing closing prices over the available period for ${ticker}.`
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
          <ChartContainer config={chartConfig} className="aspect-video w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                    // Display fewer ticks if data spans a long period
                    // Basic example: show month/year if more than 30 days
                    if (chartData.length > 30) {
                       const date = new Date(value);
                       return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    }
                    // Show day/month otherwise
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                }}
              />
               <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${value.toFixed(0)}`} // Basic currency formatting
                  domain={['auto', 'auto']} // Auto-scale Y-axis
                />
              <Tooltip
                cursor={true}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    formatter={(value) => `$${(value as number).toFixed(2)}`}
                  />
                }
              />
              <Line
                dataKey="close"
                type="monotone"
                stroke="var(--color-close)"
                strokeWidth={2}
                dot={false} // Hide dots for cleaner look with potentially many data points
                isAnimationActive={!isLoading} // Animate only when not loading
                animationDuration={300} // Subtle animation
              />
            </LineChart>
          </ChartContainer>
        ) : (
          renderNoDataMessage()
        )}
      </CardContent>
       <CardFooter className="flex-col items-start gap-2 text-sm">
        {data && data.length > 0 && (
          <div className="flex gap-2 font-medium leading-none">
             <TrendingUp className="h-4 w-4 text-accent" /> Data fetched successfully for {ticker}
          </div>
        )}
         <div className="leading-none text-muted-foreground">
           Displaying historical closing prices. Data may be delayed.
         </div>
      </CardFooter>
    </Card>
  );
}
