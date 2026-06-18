import Link from "next/link";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-6 bg-panel/80 backdrop-blur border-b border-line">
      <Link href="/" className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="Roblox GUI Maker"
          width={28}
          height={28}
          className="h-7 w-auto rounded-md"
        />
        <span className="font-semibold tracking-tight">
          Roblox<span className="text-ink-dim"> GUI Maker</span>
        </span>
      </Link>
      <nav className="flex items-center gap-1 text-sm">
        <Link
          href="/editor"
          className="px-3 py-1.5 rounded-md text-ink-dim hover:text-ink hover:bg-raised transition-colors"
        >
          Editor
        </Link>
        <Link
          href="/templates"
          className="px-3 py-1.5 rounded-md text-ink-dim hover:text-ink hover:bg-raised transition-colors"
        >
          Templates
        </Link>
        <Link
          href="/guides"
          className="px-3 py-1.5 rounded-md text-ink-dim hover:text-ink hover:bg-raised transition-colors"
        >
          Guides
        </Link>
        <Link
          href="/editor"
          className="ml-2 px-4 py-1.5 rounded-md font-semibold bg-primary text-on-primary hover:brightness-110 transition"
        >
          Launch Editor
        </Link>
      </nav>
    </header>
  );
}
