import './globals.css';
import '@/styles/markdown.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Navbar } from '@/components/layout/Navbar';
import { cn } from "@/lib/utils";

const geist = Inter({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mujarrad - Knowledge Graph',
  description: 'Visual knowledge graph management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}