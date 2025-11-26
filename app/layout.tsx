import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "JSON Visualizer - Explore JSON Data Structures",
  description: "A modern, open-source tool for visualizing, editing, and collaborating on JSON data. Features real-time collaboration, multiple view modes, and powerful search capabilities.",
  keywords: ["JSON", "visualizer", "JSON viewer", "JSON editor", "data visualization", "developer tools"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "JSON Visualizer - Explore JSON Data Structures",
    description: "A modern, open-source tool for visualizing, editing, and collaborating on JSON data.",
    url: defaultUrl,
    siteName: "JSON Visualizer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Visualizer",
    description: "A modern, open-source tool for visualizing, editing, and collaborating on JSON data.",
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23000'/%3E%3Cg stroke='%23fff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 10 Q10 10 10 12 L10 14 Q10 15 9 15 Q10 15 10 16 L10 18 Q10 20 12 20'/%3E%3Cpath d='M20 10 Q22 10 22 12 L22 14 Q22 15 23 15 Q22 15 22 16 L22 18 Q22 20 20 20'/%3E%3Ccircle cx='16' cy='15' r='1.5' fill='%23fff'/%3E%3C/g%3E%3C/svg%3E",
        type: "image/svg+xml"
      }
    ],
    apple: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23000'/%3E%3Cg stroke='%23fff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 10 Q10 10 10 12 L10 14 Q10 15 9 15 Q10 15 10 16 L10 18 Q10 20 12 20'/%3E%3Cpath d='M20 10 Q22 10 22 12 L22 14 Q22 15 23 15 Q22 15 22 16 L22 18 Q22 20 20 20'/%3E%3Ccircle cx='16' cy='15' r='1.5' fill='%23fff'/%3E%3C/g%3E%3C/svg%3E"
      }
    ]
  }
  
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z'/><polyline points='14 2 14 8 20 8'/><path d='M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1'/><path d='M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1'/></svg>" type="image/svg+xml" /> */}
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}