import { Tajawal } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Little One",
    default: "Little One - متجر سرائر أطفال في ليبيا",
  },
  description: "متجر ليبي متخصص في صناعة وبيع سرائر غرف الأطفال الخشبية بجودة أمان عالية. تصاميم عصرية، راقية وبأسعار تنافسية تناسب الجميع.",
  openGraph: {
    title: "Little One - متجر سرائر أطفال في ليبيا",
    description: "متجر ليبي متخصص في صناعة وبيع سرائر غرف الأطفال الخشبية بجودة أمان عالية.",
    url: "https://little-one-store.com",
    siteName: "Little One",
    locale: "ar_LY",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#537D84",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Analytics />
        {children}
      </body>
    </html>
  );
}
