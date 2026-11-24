import type { ReactNode } from "react";
import { Shell } from "@/components/shell";

export default function PagesLayout({ children }: { children: ReactNode }) {
  return <Shell theme="light">{children}</Shell>;
}
