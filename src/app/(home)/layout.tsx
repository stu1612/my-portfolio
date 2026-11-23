import type { ReactNode } from "react";
import { Shell } from "@/components/shell";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <Shell theme="dark" frame>
      {children}
    </Shell>
  );
}
