import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { PDFProvider } from "@/context/PDFContext";
import { GlobalToolProvider } from "@/context/GlobalToolContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF AI Master – Precision Document Workstation & AI",
  description: "Next-generation client-side PDF utility suite. Chat with documents, merge, split, compress, OCR, and convert with 100% privacy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PDFProvider>
            <GlobalToolProvider>
              <Navbar />
              <AppShell>
                {children}
              </AppShell>
              <Footer />
            </GlobalToolProvider>
          </PDFProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
