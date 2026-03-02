import { useNavigate } from "@tanstack/react-router";
import { Play, Tv } from "lucide-react";
import { useState } from "react";
import type { Channel } from "../hooks/useQueries";

interface ChannelCardProps {
  channel: Channel;
  featured?: boolean;
}

export function ChannelCard({ channel, featured = false }: ChannelCardProps) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleClick = () => {
    navigate({ to: "/watch/$id", params: { id: channel.id.toString() } });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        group relative flex flex-col bg-card border border-tv-border rounded-lg overflow-hidden
        channel-card-hover text-left cursor-pointer w-full
        ${featured ? "col-span-2 row-span-2" : ""}
      `}
      aria-label={`Watch ${channel.name}`}
    >
      {/* Logo area */}
      <div
        className="relative bg-black flex items-center justify-center overflow-hidden"
        style={{ aspectRatio: "16/9", minHeight: featured ? "180px" : "110px" }}
      >
        {channel.logoUrl && !imgError ? (
          <img
            src={channel.logoUrl}
            alt={channel.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 w-full h-full bg-gradient-to-br from-muted to-background">
            <Tv className="w-10 h-10 text-muted-foreground" />
          </div>
        )}

        {/* Hover play overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-tv-red flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5 flex-1">
        <p className="font-semibold text-sm text-foreground truncate leading-tight">
          {channel.name}
        </p>
        <span className="text-xs text-muted-foreground mt-0.5 block truncate">
          {channel.category}
        </span>
      </div>
    </button>
  );
}
