import type { ReactNode } from "react";
import { Shell } from "@/components/shell";
import { Stage } from "@/features/project-index/stage";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <Shell theme="dark" frame stage={<Stage />}>
      {children}
    </Shell>
  );
}
