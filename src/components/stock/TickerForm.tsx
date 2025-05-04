
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
// Removed Search import as button is removed

import { Button } from "@/components/ui/button"; // Keep Button if needed elsewhere, remove if not
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
  isLoading: boolean; // Keep isLoading if parent needs to disable input
  defaultTicker?: string;
};

export function TickerForm({ onSubmit, isLoading, defaultTicker = "" }: TickerFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ticker: defaultTicker,
    },
    mode: "onBlur" // Validate on blur to avoid errors while typing
  });

  // Use useEffect to update the default value if it changes externally
   React.useEffect(() => {
       form.reset({ ticker: defaultTicker });
   }, [defaultTicker, form]);


  // Trigger submit when input loses focus and is valid
  const handleBlur = () => {
    form.trigger("ticker").then((isValid) => {
       if (isValid) {
          const tickerValue = form.getValues("ticker");
          onSubmit(tickerValue.toUpperCase());
       }
    });
  };

   // Also trigger submit on Enter key press
   const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
       if (event.key === 'Enter') {
           event.preventDefault(); // Prevent default form submission if any
           form.trigger("ticker").then((isValid) => {
              if (isValid) {
                 const tickerValue = form.getValues("ticker");
                 onSubmit(tickerValue.toUpperCase());
              }
           });
       }
   };

  return (
    <Form {...form}>
      {/* Remove the form tag if it's wrapping only this component now */}
      {/* <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex w-full max-w-sm items-end space-x-2"> */}
        <FormField
          control={form.control}
          name="ticker"
          render={({ field }) => (
            <FormItem className="flex-grow"> {/* Make FormItem flex-grow */}
              <FormLabel>Stock Ticker</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., AAPL, GOOG"
                  {...field}
                  onBlur={handleBlur} // Add onBlur handler
                  onKeyDown={handleKeyDown} // Add onKeyDown handler
                  disabled={isLoading} // Disable input while loading data
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
        {/* Remove the Search Button */}
        {/*
        <Button type="submit" disabled={isLoading} aria-label="Search Ticker">
          {isLoading ? (
             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
          ) : (
            <Search />
          )}
        </Button>
        */}
      {/* </form> */}
    </Form>
  );
}
