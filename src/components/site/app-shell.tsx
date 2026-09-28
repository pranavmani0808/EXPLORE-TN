import { useState, type ReactNode } from "react";
import { FloatingNav, MobileTabBar } from "@/components/site/floating-nav";
import { SearchPanel } from "@/components/site/search-panel";
import { cn } from "@/lib/utils";

export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <FloatingNav onSearch={() => setSearchOpen(true)} />
      <SearchPanel open={searchOpen} onOpenChange={setSearchOpen} />
      <main className="pb-24 sm:pb-0">{children}</main>
      <MobileTabBar />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="gsap-section mx-auto max-w-6xl px-4 pb-8 pt-28 sm:px-6 sm:pt-36">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h1 className="gsap-heading mt-3 text-4xl font-black sm:text-6xl tracking-tight">{title}</h1>
      <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">{description}</p>
    </header>
  );
}
