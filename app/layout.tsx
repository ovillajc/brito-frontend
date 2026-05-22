import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Transportes Brito | Logística y Barita",
  description: "Operador híbrido líder en el sureste de México. Transporte de carga pesada, refrigerada y suministro de barita grado API.",
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: "/assets/images/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Brito',
  },
};

import { QueryProvider } from "@/src/core/presentation/providers/query-provider";
import { ThemeProvider } from "@/src/core/presentation/providers/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#006d37" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-full flex flex-col font-body selection:bg-primary-container selection:text-on-primary-container">
        <ThemeProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
