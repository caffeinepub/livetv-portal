import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Tv } from "lucide-react";
import { motion } from "motion/react";
import { ChannelCard } from "../components/ChannelCard";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { useChannelsByCategory } from "../hooks/useQueries";

const CATEGORY_LABELS: Record<string, string> = {
  "bangla-tv": "Bangla TV",
  news: "News",
  sports: "Sports",
  international: "International",
  radio: "Radio",
};

export function CategoryPage() {
  const { slug } = useParams({ from: "/category/$slug" });
  const navigate = useNavigate();
  const { data: channels, isLoading } = useChannelsByCategory(slug ?? null);
  const label = CATEGORY_LABELS[slug ?? ""] ?? slug ?? "Category";

  return (
    <div className="min-h-screen flex flex-col bg-background dark">
      <Navbar activeCategory={slug ?? ""} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Channels
        </button>

        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 bg-tv-red rounded-full" />
          <h1 className="font-display font-bold text-2xl text-foreground">
            {label}
          </h1>
        </div>

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
        ) : channels && channels.length > 0 ? (
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
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Tv className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold mb-1">
              No channels in {label}
            </p>
            <p className="text-muted-foreground text-sm">
              Check back later or browse all channels
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
