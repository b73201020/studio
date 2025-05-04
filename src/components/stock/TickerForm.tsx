"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  ticker: z.string().min(1, {
    message: "Ticker symbol is required.",
  }).max(10, {
    message: "Ticker symbol too long."
  }).regex(/^[A-Z0-9.^=-]+$/i, {
    message: "Invalid ticker symbol format."
  }),
});

type TickerFormProps = {
  onSubmit: (ticker: string) => void;
  isLoading: boolean;
  defaultTicker?: string;
};

export function TickerForm({ onSubmit, isLoading, defaultTicker = "" }: TickerFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ticker: defaultTicker,
    },
  });

  function handleFormSubmit(data: z.infer<typeof FormSchema>) {
    onSubmit(data.ticker.toUpperCase());
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex w-full max-w-sm items-end space-x-2">
        <FormField
          control={form.control}
          name="ticker"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel>Stock Ticker</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., AAPL, GOOG"
                  {...field}
                  aria-label="Stock Ticker Symbol"
                  className="uppercase"
                  autoCapitalize="characters"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                 />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} aria-label="Search Ticker">
          {isLoading ? (
             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
          ) : (
            <Search />
          )}
        </Button>
      </form>
    </Form>
  );
}
