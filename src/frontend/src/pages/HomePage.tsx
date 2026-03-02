import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Globe,
  Newspaper,
  Play,
  Radio,
  TrendingUp,
  Tv,
  WifiOff,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { ChannelCard } from "../components/ChannelCard";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import {
  useCategories,
  useChannels,
  useGetSiteSettings,
} from "../hooks/useQueries";
import type { Channel } from "../hooks/useQueries";

// Featured channel card with logo cover support
function FeaturedChannelCard({ channel }: { channel: Channel }) {
  const [imgError, setImgError] = useState(false);
  const hasLogo = !!channel.logoUrl && !imgError;

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-tv-border shadow-[0_8px_32px_rgba(0,0,0,0.5)] group cursor-pointer">
      {/* Background: logo or fallback */}
      {hasLogo ? (
        <img
          src={channel.logoUrl}
          alt={channel.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-card to-background">
          <Tv className="w-20 h-20 text-muted-foreground/30" />
        </div>
      )}

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-tv-red/90 group-hover:bg-tv-red flex items-center justify-center shadow-lg transition-colors">
          <Play className="w-7 h-7 text-white fill-white ml-1" />
        </div>
      </div>

      {/* Channel info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-3">
        <p className="text-white font-semibold text-sm">{channel.name}</p>
        <p className="text-white/60 text-xs capitalize">
          {channel.category.replace(/-/g, " ")}
        </p>
      </div>
    </div>
  );
}

// Demo/seed channels displayed when backend returns empty
const DEMO_CHANNELS = [
  {
    id: BigInt(1),
    name: "Channel i",
    category: "bangla-tv",
    logoUrl: "",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    description: "Popular Bangladeshi entertainment channel",
    isActive: true,
    order: BigInt(1),
  },
  {
    id: BigInt(2),
    name: "ATN Bangla",
    category: "bangla-tv",
    logoUrl: "",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    description: "24-hour Bangladeshi TV channel",
    isActive: true,
    order: BigInt(2),
  },
  {
    id: BigInt(3),
    name: "NTV Bangladesh",
    category: "news",
    logoUrl: "",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    description: "Bangladesh news and current affairs",
    isActive: true,
    order: BigInt(3),
  },
  {
    id: BigInt(4),
    name: "Somoy TV",
    category: "news",
    logoUrl: "",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    description: "Leading news channel of Bangladesh",
    isActive: true,
    order: BigInt(4),
  },
  {
    id: BigInt(5),
    name: "GTV Sports",
    category: "sports",
    logoUrl: "",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    description: "Cricket, football and more",
    isActive: true,
    order: BigInt(5),
  },
  {
    id: BigInt(6),
    name: "BBC Bangla",
    category: "international",
    logoUrl: "",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    description: "International news in Bangla",
    isActive: true,
    order: BigInt(6),
  },
  {
    id: BigInt(7),
    name: "Radio Shadhin",
    category: "radio",
    logoUrl: "",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    description: "Bangladesh's favourite FM radio",
    isActive: true,
    order: BigInt(7),
  },
  {
    id: BigInt(8),
    name: "Ekattor TV",
    category: "news",
    logoUrl: "",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    description: "24-hour news channel",
    isActive: false,
    order: BigInt(8),
  },
  {
    id: BigInt(9),
    name: "RTV",
    category: "bangla-tv",
    logoUrl: "",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    description: "Entertainment and lifestyle",
    isActive: true,
    order: BigInt(9),
  },
  {
    id: BigInt(10),
    name: "Desh TV",
    category: "bangla-tv",
    logoUrl: "",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    description: "News, drama, and entertainment",
    isActive: true,
    order: BigInt(10),
  },
  {
    id: BigInt(11),
    name: "ESPN Sports",
    category: "sports",
    logoUrl: "",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    description: "International sports coverage",
    isActive: true,
    order: BigInt(11),
  },
  {
    id: BigInt(12),
    name: "Al Jazeera Bangla",
    category: "international",
    logoUrl: "",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    description: "World news and documentaries",
    isActive: true,
    order: BigInt(12),
  },
];

const CATEGORY_TABS = [
  { label: "All", slug: "", icon: Tv },
  { label: "Bangla TV", slug: "bangla-tv", icon: Tv },
  { label: "News", slug: "news", icon: Newspaper },
  { label: "Sports", slug: "sports", icon: TrendingUp },
  { label: "International", slug: "international", icon: Globe },
  { label: "Radio", slug: "radio", icon: Radio },
];

export function HomePage() {
  const [activeCategory, setActiveCategory] = useState("");
  const { data: channelsData, isLoading } = useChannels();
  const { data: _categoriesData } = useCategories();
  const { data: siteSettings } = useGetSiteSettings();

  const siteName = siteSettings?.siteName || "jagolive";
  const isInMaintenance = siteSettings?.maintenanceMode === true;

  const channels = useMemo(() => {
    const source =
      channelsData && channelsData.length > 0 ? channelsData : DEMO_CHANNELS;
    if (!activeCategory) return source;
    return source.filter((c) => c.category === activeCategory);
  }, [channelsData, activeCategory]);

  const featuredChannel = useMemo(() => {
    const source =
      channelsData && channelsData.length > 0 ? channelsData : DEMO_CHANNELS;
    // Sort by order to get the lowest-order active channel first
    const sorted = [...source].sort(
      (a, b) => Number(a.order) - Number(b.order),
    );
    return sorted.find((c) => c.isActive) ?? sorted[0];
  }, [channelsData]);

  const liveCount = useMemo(() => {
    const source =
      channelsData && channelsData.length > 0 ? channelsData : DEMO_CHANNELS;
    return source.filter((c) => c.isActive).length;
  }, [channelsData]);

  // Maintenance mode: show full-page message
  if (isInMaintenance) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background dark text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md"
        >
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOff className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground mb-3">
            {siteName}
          </h1>
          <h2 className="font-display font-semibold text-xl text-amber-400 mb-4">
            Under Maintenance
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            We're currently performing scheduled maintenance to improve your
            experience. Please check back shortly.
          </p>
          {siteSettings?.contactEmail && (
            <p className="text-muted-foreground text-sm mt-4">
              Questions? Contact us at{" "}
              <a
                href={`mailto:${siteSettings.contactEmail}`}
                className="text-tv-red hover:underline"
              >
                {siteSettings.contactEmail}
              </a>
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background dark">
      <Navbar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-card to-background border-b border-tv-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.62_0.22_27/0.08),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative">
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            {/* Hero text */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="bg-tv-red/20 text-tv-red border-tv-red/30 mb-4 text-xs uppercase tracking-wider font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tv-red mr-1.5 animate-pulse-red inline-block" />
                  {liveCount} Live Channels
                </Badge>
                <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground leading-tight mb-3">
                  {siteSettings?.tagline ||
                    "Watch Bangladesh's Best TV Channels Live"}
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Stream Bangla TV, news, sports, radio, and international
                  channels. Free HLS live streaming.
                </p>
                {featuredChannel && (
                  <Link
                    to="/watch/$id"
                    params={{ id: featuredChannel.id.toString() }}
                  >
                    <button
                      type="button"
                      className="flex items-center gap-2 bg-tv-red hover:bg-tv-red-bright text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      Watch Now — {featuredChannel.name}
                    </button>
                  </Link>
                )}
              </motion.div>
            </div>

            {/* Featured channel preview */}
            {featuredChannel && (
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link
                  to="/watch/$id"
                  params={{ id: featuredChannel.id.toString() }}
                >
                  <FeaturedChannelCard channel={featuredChannel} />
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                type="button"
                key={tab.slug}
                onClick={() => setActiveCategory(tab.slug)}
                className={`
                  flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${
                    activeCategory === tab.slug
                      ? "bg-tv-red text-white shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-tv-border hover:text-foreground"
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-tv-red rounded-full" />
            <h2 className="font-display font-bold text-lg text-foreground">
              {activeCategory
                ? (CATEGORY_TABS.find((t) => t.slug === activeCategory)
                    ?.label ?? "Channels")
                : "All Channels"}
            </h2>
          </div>
          <span className="text-muted-foreground text-sm">
            {channels.length} channels
          </span>
        </div>

        {/* Channel grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
              <div key={i} className="rounded-lg overflow-hidden">
                <Skeleton className="aspect-video" />
                <div className="p-2.5 space-y-1.5">
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
              </div>
            ))}
          </div>
        ) : channels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Tv className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold mb-1">
              No channels found
            </p>
            <p className="text-muted-foreground text-sm">
              Try selecting a different category
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.04 } },
            }}
          >
            {channels.map((channel) => (
              <motion.div
                key={channel.id.toString()}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
                <ChannelCard channel={channel} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
