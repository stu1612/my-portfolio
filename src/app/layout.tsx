import type { Metadata } from "next";
import { Space_Mono, Urbanist, Honk } from "next/font/google";
import "./globals.css";

import { PrismicPreview } from "@prismicio/next";
import { repositoryName } from "@/prismicio";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-urbanist",
});

const honk = Honk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-honk",
});

const mono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-slate-900 text-slate-100">
      <body
        className={`${urbanist.variable} ${mono.variable} ${honk.variable}`}
      >
        {children}
        <PrismicPreview repositoryName={repositoryName} />
      </body>
    </html>
  );
}
