import Link from "next/link";

// Reciprocal badge for the Launch directory listing (launchsoar.com).
// Rendered verbatim so the directory's required attributes (data-launch-badge)
// survive for verification.
const LAUNCH_BADGE = `<a href="https://launchsoar.com" target="_blank" rel="noopener noreferrer" data-launch-badge="true" style="display:inline-flex;align-items:center;gap:10px;padding:10px 14px;border:1px solid #e5e7eb;border-radius:9999px;background:#ffffff;color:#111827;text-decoration:none;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Arial;line-height:1;"><img src="https://launchsoar.com/logo.png" alt="Launch" style="height:18px;width:auto;" /><span style="display:flex;flex-direction:column;gap:2px;line-height:1.1;"><span style="font-size:12px;opacity:0.8;">Listed on</span><span style="font-size:14px;font-weight:700;">Launch</span></span></a>`;

// Reciprocal badge for the ShinyLaunch directory listing. Rendered verbatim
// (the exact snippet they provide) so any required attributes survive
// the directory's link verification.
const SHINYLAUNCH_BADGE = `<a target="_blank" href="https://shinylaunch.com/product/robloxguimaker"><img src="https://shinylaunch.com/assets/images/badge.png" alt="ShinyLaunch" height="54" loading="lazy"></a>`;

// Reciprocal badge for the Indie.Deals directory listing.
const INDIE_DEALS_BADGE = `<a href="https://indie.deals?ref=https%3A%2F%2Frobloxguimaker.app%2F" target="_blank" rel="noopener noreferrer"><style>.indie-deals-badge{position:relative;overflow:hidden;display:inline-block}.indie-deals-badge::after{content:'';position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(45deg,rgba(255,255,255,0) 0%,rgba(255,255,255,0) 40%,rgba(255,255,255,0.9) 50%,rgba(255,255,255,0) 60%,rgba(255,255,255,0) 100%);transform:translateX(-100%) rotate(45deg);pointer-events:none;transition:transform 0.3s ease-out}.indie-deals-badge:hover::after{animation:indie-deals-shine 1s ease-out}@keyframes indie-deals-shine{0%{transform:translateX(-100%) rotate(45deg)}50%{transform:translateX(0%) rotate(45deg)}100%{transform:translateX(100%) rotate(45deg)}}</style><svg width="120" height="40" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" class="indie-deals-badge"><defs><linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#e6f0fc"/></linearGradient></defs><rect width="120" height="40" rx="10" fill="url(#badgeGradient)"/><rect x="0.75" y="0.75" width="118.5" height="38.5" rx="9.25" fill="none" stroke="#0070f3" stroke-width="1.5" stroke-opacity="0.3"/><image href="https://indie.deals/logo_badge.png" x="9.6" y="8" width="24" height="24" preserveAspectRatio="xMidYMid meet" filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.15))"/><text x="80.4" y="15.2" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,-apple-system,sans-serif" font-size="7.2" fill="#4b5563" letter-spacing="0.01em">Find us on</text><text x="80.4" y="26" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,-apple-system,sans-serif" font-size="8.8" font-weight="bold" fill="#0070f3" letter-spacing="0.01em">Indie.Deals</text></svg></a>`;

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
      <div className="max-w-6xl mx-auto px-6 pb-6 flex justify-center items-center gap-4 flex-wrap">
        <span dangerouslySetInnerHTML={{ __html: LAUNCH_BADGE }} />
        <span dangerouslySetInnerHTML={{ __html: INDIE_DEALS_BADGE }} />
        <a
          href="https://neeed.directory/products/roblox-gui-maker?utm_source=roblox-gui-maker"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://neeed.directory/badges/neeed-badge-light.svg"
            alt="Featured on neeed.directory"
            className="h-10 w-auto"
          />
        </a>
        <a href="https://shipstry.com/" target="_blank" rel="noopener noreferrer">
          <img
            src="https://shipstry.com/badges/featured.svg"
            alt="Featured on Shipstry"
            className="h-10 w-auto"
          />
        </a>
        <a href="https://newtool.site/item/roblox-gui-maker" target="_blank" rel="noopener noreferrer">
          <img
            src="https://newtool.site/badges/newtool-light.svg"
            alt="Featured on NewTool.site"
            className="h-[54px] w-auto"
          />
        </a>
        <a href="https://www.buildway.cc" target="_blank" rel="noopener noreferrer">
          <img
            src="https://www.buildway.cc/logo-dark.png"
            alt="Listed on BuildWay"
            className="h-10 w-auto"
          />
        </a>
        <span dangerouslySetInnerHTML={{ __html: SHINYLAUNCH_BADGE }} />
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
