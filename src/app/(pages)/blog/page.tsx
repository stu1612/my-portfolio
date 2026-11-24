import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "Blog · Stu Bolderson" };

export default function BlogPage() {
  return <PlaceholderPage title="Blog" />;
}
