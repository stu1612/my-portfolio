"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { site } from "@/lib/site";
import { AvailabilityStatus } from "./availability-status";
import { MenuButton } from "./menu-button";
import { MenuOverlay } from "./menu-overlay";

export function Navbar() {
  const pathname = usePathname();
  // useId, not a fixed id: Next can keep the previous route's shell in the
  // DOM after a navigation, so two navbars may exist at once.
  const menuId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const openMenu = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };
  const closeMenu = () => dialogRef.current?.close();

  // Close if the route changes while open (e.g. the browser's back button).
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
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
            <MenuButton
              expanded={open}
              aria-controls={menuId}
              onClick={openMenu}
              className="-mr-2"
            />
          </div>
        </div>
      </header>
      <MenuOverlay
        id={menuId}
        ref={dialogRef}
        pathname={pathname}
        onRequestClose={closeMenu}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
