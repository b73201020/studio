// src/app/(fonts)/Geist.ts
// This file exports the Geist font configurations.
// We keep it separate to potentially manage multiple fonts later.

import { Geist } from 'next/font/google';

export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap', // Use swap for better performance
});
