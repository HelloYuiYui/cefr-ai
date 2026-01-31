import {NextIntlClientProvider} from 'next-intl';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cefr-ai-mistral.vercel.app'),
  title: {
    default: 'CEFR AI - AI-Powered Language Writing Practice',
    template: '%s | CEFR AI',
  },
  description: 'Improve your writing in English, German, and French with AI-powered feedback aligned to CEFR levels A1-C2. Get instant analysis of grammar, vocabulary, and fluency.',
  keywords: ['CEFR', 'language learning', 'writing practice', 'AI feedback', 'German', 'French', 'English', 'language assessment', 'grammar checker'],
  authors: [{ name: 'CEFR AI' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cefr-ai-mistral.vercel.app',
    siteName: 'CEFR AI',
    title: 'CEFR AI - AI-Powered Language Writing Practice',
    description: 'Improve your writing in English, German, and French with AI-powered feedback aligned to CEFR levels A1-C2.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CEFR AI - Language Writing Practice',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CEFR AI - AI-Powered Language Writing Practice',
    description: 'Improve your writing with AI-powered CEFR-aligned feedback.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider>
          <div className="app-container">
            <Header />
            <main className="main-content">
              {children}
            </main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
