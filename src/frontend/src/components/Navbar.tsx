import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Settings, X } from "lucide-react";
import { useState } from "react";

const NAV_CATEGORIES = [
  { label: "All Channels", slug: "" },
  { label: "Bangla TV", slug: "bangla-tv" },
  { label: "News", slug: "news" },
  { label: "Sports", slug: "sports" },
  { label: "International", slug: "international" },
  { label: "Radio", slug: "radio" },
];

interface NavbarProps {
  activeCategory?: string;
  onCategoryChange?: (slug: string) => void;
}

export function Navbar({ activeCategory = "", onCategoryChange }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleCategoryClick = (slug: string) => {
    if (onCategoryChange) {
      onCategoryChange(slug);
    } else {
      navigate({
        to: slug ? "/category/$slug" : "/",
        params: slug ? { slug } : undefined,
      });
    }
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-tv-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <img
              src="/assets/generated/logo-transparent.dim_300x80.png"
              alt="jagolive"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = "none";
              }}
            />
            <span className="font-display font-bold text-xl text-tv-red sr-only">
              jagolive
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`
                  px-3 py-1.5 rounded text-sm font-medium transition-colors
                  ${
                    activeCategory === cat.slug
                      ? "bg-tv-red text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link to="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-4 h-4" />
                <span className="text-xs">Admin</span>
              </Button>
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-3 border-t border-tv-border pt-2">
            <div className="flex flex-col gap-1">
              {NAV_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.slug}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`
                    px-3 py-2 rounded text-sm font-medium text-left transition-colors
                    ${
                      activeCategory === cat.slug
                        ? "bg-tv-red text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }
                  `}
                >
                  {cat.label}
                </button>
              ))}
              <Link
                to="/admin"
                className="px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Admin Panel
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
