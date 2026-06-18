import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-panel mt-20">
      <div className="max-w-6xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="grid place-items-center w-6 h-6 rounded bg-primary text-on-primary font-bold text-xs">
              R
            </span>
            <span className="font-semibold">Roblox GUI Maker</span>
          </div>
          <p className="text-ink-mute">
            A free visual builder for Roblox game interfaces. Drag, drop, and
            export clean Luau you can paste straight into Studio.
          </p>
        </div>
        <div>
          <p className="text-ink-dim font-medium mb-2">Tool</p>
          <ul className="space-y-1.5 text-ink-mute">
            <li>
              <Link className="hover:text-ink" href="/editor">
                Open the editor
              </Link>
            </li>
            <li>
              <Link className="hover:text-ink" href="/templates">
                GUI templates
              </Link>
            </li>
            <li>
              <Link className="hover:text-ink" href="/about">
                About
              </Link>
            </li>
            <li>
              <Link className="hover:text-ink" href="/for">
                Use cases
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-ink-dim font-medium mb-2">About</p>
          <p className="text-ink-mute">
            An independent, unofficial tool. Not affiliated with or endorsed by
            Roblox Corporation. &ldquo;Roblox&rdquo; is a trademark of Roblox
            Corporation.
          </p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-ink-mute">
        © {year} robloxguimaker.app ·{" "}
        <Link className="hover:text-ink" href="/">
          English
        </Link>{" "}
        ·{" "}
        <Link className="hover:text-ink" href="/zh">
          中文
        </Link>
      </div>
    </footer>
  );
}
