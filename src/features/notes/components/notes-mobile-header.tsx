"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";

import { NotesSidebar } from "./notes-sidebar";

export function NotesMobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b bg-background/80 px-2 backdrop-blur md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" aria-label="Open notes menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" showCloseButton={false} className="w-72 gap-0 p-0 sm:max-w-72">
          <SheetTitle className="sr-only">Notes</SheetTitle>
          <NotesSidebar className="w-full" onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <Link href="/notes" className="font-semibold tracking-tight">
        {siteConfig.name}
      </Link>
    </header>
  );
}
