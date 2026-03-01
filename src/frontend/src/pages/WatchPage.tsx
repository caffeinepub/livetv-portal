import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Play, Tv } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { Footer } from "../components/Footer";
import { HlsPlayer } from "../components/HlsPlayer";
import { Navbar } from "../components/Navbar";
import { useChannelById, useChannels } from "../hooks/useQueries";

const DEMO_CHANNEL = {
  id: BigInt(1),
  name: "Channel i",
  category: "bangla-tv",
  logoUrl: "",
  streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  description: "Popular Bangladeshi entertainment channel",
  isActive: true,
  order: BigInt(1),
};

export function WatchPage() {
  const { id } = useParams({ from: "/watch/$id" });
  const navigate = useNavigate();

  const channelId = id ? BigInt(id) : null;
  const { data: channel, isLoading } = useChannelById(channelId);
  const { data: allChannels } = useChannels();

  const displayChannel = channel ?? (isLoading ? null : DEMO_CHANNEL);

  const relatedChannels = useMemo(() => {
    if (!displayChannel) return [];
    const source = allChannels && allChannels.length > 0 ? allChannels : [];
    return source
      .filter(
        (c) =>
          c.category === displayChannel.category && c.id !== displayChannel.id,
      )
      .slice(0, 8);
  }, [allChannels, displayChannel]);

  const streamUrl =
    displayChannel?.streamUrl ||
    "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

  return (
    <div className="min-h-screen flex flex-col bg-background dark">
      <Navbar />

      {/* Channel Cover Banner */}
      {isLoading ? (
        <div className="w-full h-40 bg-card border-b border-tv-border animate-pulse" />
      ) : displayChannel ? (
        <div className="relative w-full h-40 sm:h-48 bg-black border-b border-tv-border overflow-hidden">
          {/* Background blur layer */}
          {displayChannel.logoUrl && (
            <div
              className="absolute inset-0 scale-110 blur-2xl opacity-30"
              style={{
                backgroundImage: `url(${displayChannel.logoUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          {/* Centered logo */}
          <div className="relative h-full flex items-center justify-center">
            {displayChannel.logoUrl ? (
              <img
                src={displayChannel.logoUrl}
                alt={displayChannel.name}
                className="max-h-28 sm:max-h-36 max-w-xs object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = "none";
                  const fallback = el.nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="flex-col items-center gap-2"
              style={{ display: displayChannel.logoUrl ? "none" : "flex" }}
            >
              <Tv className="w-16 h-16 text-white/30" />
              <span className="font-display font-bold text-white/60 text-lg">
                {displayChannel.name}
              </span>
            </div>
          </div>
          {/* Live badge */}
          {displayChannel.isActive && (
            <div className="absolute top-3 right-4">
              <span className="flex items-center gap-1.5 bg-tv-red text-white text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wide shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-red" />
                LIVE
              </span>
            </div>
          )}
        </div>
      ) : null}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Channels
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Player column */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <Skeleton className="w-full aspect-video rounded-lg" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <HlsPlayer
                  streamUrl={streamUrl}
                  autoplay={true}
                  className="shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
                />
              </motion.div>
            )}

            {/* Channel info */}
            <div className="mt-4 p-4 bg-card border border-tv-border rounded-lg">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : displayChannel ? (
                <div className="flex items-start gap-3">
                  {/* Channel logo */}
                  <div className="w-14 h-14 rounded-lg bg-black flex items-center justify-center flex-shrink-0 border border-tv-border overflow-hidden">
                    {displayChannel.logoUrl ? (
                      <img
                        src={displayChannel.logoUrl}
                        alt={displayChannel.name}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.style.display = "none";
                        }}
                      />
                    ) : (
                      <Tv className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="font-display font-bold text-xl text-foreground">
                        {displayChannel.name}
                      </h1>
                      {displayChannel.isActive && (
                        <Badge className="bg-tv-red/20 text-tv-red border-tv-red/30 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-tv-red animate-pulse-red" />
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mt-0.5 capitalize">
                      {displayChannel.category.replace(/-/g, " ")}
                    </p>
                    {displayChannel.description && (
                      <p className="text-muted-foreground text-sm mt-2">
                        {displayChannel.description}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Channel not found.
                </p>
              )}
            </div>
          </div>

          {/* Related channels sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-tv-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-tv-border flex items-center gap-2">
                <div className="w-1 h-4 bg-tv-red rounded-full" />
                <h2 className="font-semibold text-sm text-foreground">
                  Related Channels
                </h2>
              </div>
              <div className="divide-y divide-tv-border">
                {relatedChannels.length === 0 ? (
                  <div className="p-6 flex flex-col items-center gap-2 text-center">
                    <Tv className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-muted-foreground text-sm">
                      No related channels
                    </p>
                  </div>
                ) : (
                  relatedChannels.map((ch) => (
                    <Link
                      key={ch.id.toString()}
                      to="/watch/$id"
                      params={{ id: ch.id.toString() }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors group"
                    >
                      <div className="w-12 h-10 bg-black rounded flex items-center justify-center flex-shrink-0 border border-tv-border overflow-hidden">
                        {ch.logoUrl ? (
                          <img
                            src={ch.logoUrl}
                            alt={ch.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              el.style.display = "none";
                            }}
                          />
                        ) : (
                          <Tv className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-tv-red transition-colors truncate">
                          {ch.name}
                        </p>
                        {ch.isActive && (
                          <span className="text-[10px] text-tv-red font-semibold uppercase flex items-center gap-1 mt-0.5">
                            <span className="w-1 h-1 rounded-full bg-tv-red animate-pulse-red" />
                            Live
                          </span>
                        )}
                      </div>
                      <Play className="w-4 h-4 text-muted-foreground group-hover:text-tv-red transition-colors flex-shrink-0" />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
