import Link from "next/link";

// Reciprocal badge for the Launch directory listing (launchsoar.com).
// Rendered verbatim so the directory's required attributes (data-launch-badge)
// survive for verification.
const LAUNCH_BADGE = `<a href="https://launchsoar.com" target="_blank" rel="noopener noreferrer" data-launch-badge="true" style="display:inline-flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid #e5e7eb;border-radius:9999px;background:#ffffff;color:#111827;text-decoration:none;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Arial;line-height:1;"><img src="https://launchsoar.com/logo.png" alt="Launch" style="height:18px;width:auto;" /><span style="display:flex;flex-direction:column;gap:2px;line-height:1.1;"><span style="font-size:12px;opacity:0.8;">Listed on</span><span style="font-size:14px;font-weight:700;">Launch</span></span></a>`;

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
      <div className="max-w-6xl mx-auto px-6 pb-6 flex justify-center">
        <span dangerouslySetInnerHTML={{ __html: LAUNCH_BADGE }} />
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
