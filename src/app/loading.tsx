import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12">
      <header className="w-full mb-8 md:mb-12 text-center">
        <Skeleton className="h-10 w-1/2 mx-auto mb-2" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
      </header>

      <section className="w-full max-w-md mb-8 md:mb-12 flex justify-center">
        <div className="flex w-full max-w-sm items-end space-x-2">
           <div className="flex-grow space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
           </div>
            <Skeleton className="h-10 w-10" />
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
