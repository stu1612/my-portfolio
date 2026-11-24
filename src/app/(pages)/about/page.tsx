import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "About · Stu Bolderson" };

export default function AboutPage() {
  return <PlaceholderPage title="About" />;
}
