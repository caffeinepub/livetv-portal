import { Link } from "@tanstack/react-router";
import { Tv } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-tv-border mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-tv-red rounded flex items-center justify-center">
                <Tv className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">
                jagolive
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Bangladesh's premier IPTV streaming portal. Watch your favourite
              Bangla TV channels live, anytime, anywhere.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">
              Channels
            </h3>
            <ul className="space-y-1.5">
              {[
                { label: "All Channels", to: "/" as const },
                {
                  label: "Bangla TV",
                  to: "/category/$slug" as const,
                  params: { slug: "bangla-tv" },
                },
                {
                  label: "News",
                  to: "/category/$slug" as const,
                  params: { slug: "news" },
                },
                {
                  label: "Sports",
                  to: "/category/$slug" as const,
                  params: { slug: "sports" },
                },
                {
                  label: "International",
                  to: "/category/$slug" as const,
                  params: { slug: "international" },
                },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    params={"params" in link ? link.params : undefined}
                    className="text-muted-foreground hover:text-tv-red text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">
              Info
            </h3>
            <ul className="space-y-1.5">
              <li>
                <Link
                  to="/admin"
                  className="text-muted-foreground hover:text-tv-red text-sm transition-colors"
                >
                  Admin Panel
                </Link>
              </li>
            </ul>
            <p className="text-muted-foreground text-xs mt-4 leading-relaxed">
              Streaming via HLS/M3U8. Best viewed in modern browsers.
            </p>
          </div>
        </div>

        <div className="border-t border-tv-border mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            © {year} jagolive. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs">
            Maintained by{" "}
            <a
              href="https://github.com/sultanarabi161"
              target="_blank"
              rel="noopener noreferrer"
              className="text-tv-red hover:underline"
            >
              sultanarabi161
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
