
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12">
      <header className="w-full mb-8 md:mb-12 text-center">
        <Skeleton className="h-10 w-1/2 mx-auto mb-2" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </header>

      {/* Input Section Skeleton */}
       <section className="w-full max-w-4xl mb-8 md:mb-12 flex flex-col items-center gap-4 md:flex-row md:justify-center md:items-end md:gap-6">
        {/* Ticker Input Skeleton */}
        <div className="w-full max-w-xs md:w-auto md:flex-grow space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Date Pickers Skeleton */}
        <div className="w-full max-w-xs md:w-auto flex flex-col gap-2 sm:flex-row sm:gap-4">
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex-1 space-y-1">
               <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>
        </div>

         {/* Update Button Skeleton */}
          <div className="w-full max-w-xs md:w-auto flex justify-center md:self-end">
              <Skeleton className="h-10 w-full md:w-32" />
          </div>
       </section>


      <section className="w-full max-w-5xl space-y-8">
         <Skeleton className="aspect-video w-full" />
         <Skeleton className="h-64 w-full" />
      </section>

       <footer className="mt-12 text-center text-sm text-muted-foreground space-y-1">
         <Skeleton className="h-4 w-48 mx-auto" />
         <Skeleton className="h-4 w-64 mx-auto" />
      </footer>
    </main>
  );
}
