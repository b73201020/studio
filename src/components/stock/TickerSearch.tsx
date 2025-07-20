
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { searchTickers, type TickerSearchResult } from "@/services/stock-search";
import { Skeleton } from "../ui/skeleton";

type TickerSearchProps = {
  onSelect: (ticker: string) => void;
  isLoading: boolean;
  defaultTicker?: string;
};

export function TickerSearch({ onSelect, isLoading, defaultTicker = "" }: TickerSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultTicker);
  const [searchQuery, setSearchQuery] = React.useState(defaultTicker);
  const [searchResults, setSearchResults] = React.useState<TickerSearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Set initial selected item if defaultTicker is provided
  const selectedResult = React.useMemo(() => {
    if (!value) return null;
    return searchResults.find(r => r.symbol.toLowerCase() === value.toLowerCase()) ?? { symbol: value, name: "" };
  }, [value, searchResults]);

  // Sync component value with defaultTicker prop
  React.useEffect(() => {
    setValue(defaultTicker);
  }, [defaultTicker]);


  // Debounce search
  React.useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(async () => {
      if (searchQuery) {
        const results = await searchTickers(searchQuery);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);


  const handleSelect = (currentValue: string) => {
    const ticker = currentValue.toUpperCase();
    setValue(ticker);
    setSearchQuery(ticker); // update search query as well
    setOpen(false);
    onSelect(ticker);
  };

  return (
    <div className="space-y-2">
        <Label htmlFor="ticker-search">Stock Ticker</Label>
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            id="ticker-search"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
            >
            {selectedResult?.symbol ? `${selectedResult.symbol} - ${selectedResult.name}` : "Select ticker..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command shouldFilter={false}>
            <CommandInput
                placeholder="Search ticker..."
                value={searchQuery}
                onValueChange={setSearchQuery}
            />
             <CommandList>
                {isSearching && <CommandItem><Skeleton className="h-4 w-full" /></CommandItem>}
                <CommandEmpty>No ticker found.</CommandEmpty>
                <CommandGroup>
                {searchResults.map((result) => (
                    <CommandItem
                    key={result.symbol}
                    value={result.symbol}
                    onSelect={handleSelect}
                    >
                    <Check
                        className={cn(
                        "mr-2 h-4 w-4",
                        value === result.symbol ? "opacity-100" : "opacity-0"
                        )}
                    />
                     <span className="font-medium mr-2">{result.symbol}</span>
                     <span className="text-muted-foreground truncate">{result.name}</span>
                    </CommandItem>
                ))}
                </CommandGroup>
             </CommandList>
            </Command>
        </PopoverContent>
        </Popover>
    </div>
  );
}
