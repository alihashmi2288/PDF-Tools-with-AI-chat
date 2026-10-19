import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { PDFProvider } from "@/context/PDFContext";
import { GlobalToolProvider } from "@/context/GlobalToolContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDFKit – Fast, Simple & 100% Private PDF Tools",
  description: "Chat with documents, merge, split, compress, edit, and convert PDFs directly on your device. Free, instant, and completely private.",
  applicationName: "PDFKit",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col bg-canvas text-ink selection:bg-primary/20 selection:text-primary tracking-tight font-sans`}
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
