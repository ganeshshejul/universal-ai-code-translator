import { Code2 } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="flex h-16 items-center px-6 max-w-screen-2xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 font-bold group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Code2 className="h-5 w-5 text-primary" />
          </div>
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Universal AI Code Translator</span>
        </Link>
      </div>
    </nav>
  );
}
