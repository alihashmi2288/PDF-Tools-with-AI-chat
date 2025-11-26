import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
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
  title: "PDF AI Master",
  description: "Manage and chat with your PDFs using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <PDFProvider>
            <GlobalToolProvider>
              <Navbar />
              <div className="flex flex-1 container mx-auto">
                <Sidebar />
                <main className="flex-1 p-4 md:p-6">
                  {children}
                </main>
              </div>
              <Footer />
            </GlobalToolProvider>
          </PDFProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
