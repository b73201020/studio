import type { Metadata } from 'next';
import { geistSans } from '@/app/(fonts)/Geist'; // Correct import path
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'StockPeek',
  description: 'View historical stock prices',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       {/* Apply font variable directly to html tag for better inheritance */}
      <body className={`${geistSans.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
