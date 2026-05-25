import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ProMeistars — Atrod uzticamu meistaru Latvijā",
    template: "%s | ProMeistars",
  },
  description: "Latvijas lielākā meistaru platforma. Santehniķi, elektriķi, remontdarbu speciālisti un citi — vienuviet.",
  keywords: ["meistari", "santehniķi", "elektriķi", "remontdarbi", "pakalpojumi", "Latvija", "Rīga"],
  authors: [{ name: "ProMeistars" }],
  creator: "ProMeistars",
  publisher: "ProMeistars",
  metadataBase: new URL("https://promeistars.lv"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "ProMeistars — Atrod uzticamu meistaru Latvijā",
    description: "Latvijas lielākā meistaru platforma. Santehniķi, elektriķi un citi speciālisti — vienuviet.",
    url: "https://promeistars.lv",
    siteName: "ProMeistars",
    locale: "lv_LV",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProMeistars",
    description: "Atrod uzticamu meistaru Latvijā",
    images: ["/og-image.png"],
  },
  icons: { icon: "/favicon.ico" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
