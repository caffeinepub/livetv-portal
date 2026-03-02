import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Play, Tv } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Footer } from "../components/Footer";
import { HlsPlayer } from "../components/HlsPlayer";
import { Navbar } from "../components/Navbar";
import { useChannelById, useChannels } from "../hooks/useQueries";

// Related channel item with per-item image error state
function RelatedChannelItem({
  ch,
}: { ch: { id: bigint; name: string; logoUrl: string; isActive: boolean } }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <Link
      to="/watch/$id"
      params={{ id: ch.id.toString() }}
      className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors group"
    >
      <div className="w-12 h-10 bg-black rounded flex items-center justify-center flex-shrink-0 border border-tv-border overflow-hidden">
        {ch.logoUrl && !imgErr ? (
          <img
            src={ch.logoUrl}
            alt={ch.name}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <Tv className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground group-hover:text-tv-red transition-colors truncate">
          {ch.name}
        </p>
      </div>
      <Play className="w-4 h-4 text-muted-foreground group-hover:text-tv-red transition-colors flex-shrink-0" />
    </Link>
  );
}

// Channel logo component with proper image handling
function ChannelLogo({ logoUrl, name }: { logoUrl: string; name: string }) {
  const [imgError, setImgError] = useState(false);

  if (logoUrl && !imgError) {
    return (
      <div className="w-16 h-16 rounded-lg bg-black flex items-center justify-center flex-shrink-0 border border-tv-border overflow-hidden">
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }
  return (
    <div className="w-16 h-16 rounded-lg bg-black flex items-center justify-center flex-shrink-0 border border-tv-border">
      <Tv className="w-8 h-8 text-muted-foreground" />
    </div>
  );
}

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
                  <ChannelLogo
                    logoUrl={displayChannel.logoUrl}
                    name={displayChannel.name}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="font-display font-bold text-xl text-foreground">
                        {displayChannel.name}
                      </h1>
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
                    <RelatedChannelItem key={ch.id.toString()} ch={ch} />
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
