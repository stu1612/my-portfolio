import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "Now · Stu Bolderson" };

export default function NowPage() {
  return <PlaceholderPage title="Now" />;
}
