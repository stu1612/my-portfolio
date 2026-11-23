"use client";

import Link from "next/link";
import { site } from "@/lib/site";
import { AvailabilityStatus } from "./availability-status";
import { MenuButton } from "./menu-button";

export function Navbar() {
  return (
    <header className="border-hairline shrink-0 border-b">
      <div className="flex items-center justify-between gap-4 px-4 py-2 min-[720px]:px-8">
        <Link
          href="/"
          className="type-meta focus-ring hover:text-accent focus-visible:text-accent"
        >
          {site.name}
        </Link>
        <div className="flex items-center gap-6">
          <AvailabilityStatus className="hidden min-[720px]:flex" />
          <MenuButton expanded={false} className="-mr-2" />
        </div>
      </div>
    </header>
  );
}
