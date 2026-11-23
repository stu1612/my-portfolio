import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stu — Full-stack developer",
  description:
    "Portfolio of Stu, a full-stack developer in Copenhagen and Skåne.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="bg-surface text-ink font-sans min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
