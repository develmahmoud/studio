"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { FontSizeAdjuster } from "@/components/font-size-adjuster";
import { BookOpenText } from "lucide-react";
import AboutModalTrigger from "./about-us";
import AboutDev from "./about-dev";
export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <BookOpenText className="h-7 w-7 mr-2 text-primary" />
          <h1 className="text-2xl font-headline font-semibold tracking-tight text-foreground">
            iSight
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {<AboutModalTrigger />}
          <AboutDev />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
