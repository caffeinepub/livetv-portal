import { AlertCircle, Loader2, Tv } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// hls.js is loaded via CDN script tag in index.html
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Hls: any;

interface HlsPlayerProps {
  streamUrl: string;
  autoplay?: boolean;
  className?: string;
}

type PlayerState = "loading" | "ready" | "error";

export function HlsPlayer({
  streamUrl,
  autoplay = true,
  className = "",
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<ReturnType<typeof Object.create>>(null);
  const [playerState, setPlayerState] = useState<PlayerState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    const video = videoRef.current;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setPlayerState("loading");
    setErrorMessage("");

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setPlayerState("ready");
        if (autoplay) {
          video.play().catch(() => {
            // Autoplay blocked by browser
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              setErrorMessage("Network error – retrying…");
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setPlayerState("error");
              setErrorMessage(
                "Stream unavailable. Please try another channel.",
              );
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari)
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        setPlayerState("ready");
        if (autoplay) {
          video.play().catch(() => {});
        }
      });
      video.addEventListener("error", () => {
        setPlayerState("error");
        setErrorMessage("Stream unavailable. Please try another channel.");
      });
    } else {
      setPlayerState("error");
      setErrorMessage("HLS is not supported in this browser.");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, autoplay]);

  return (
    <div
      className={`relative w-full aspect-video bg-black rounded-lg overflow-hidden ${className}`}
    >
      {/* Video element */}
      {/* biome-ignore lint/a11y/useMediaCaption: live streaming video – captions not available */}
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        style={{ display: playerState === "error" ? "none" : "block" }}
      />

      {/* Loading overlay */}
      {playerState === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
          <div className="relative mb-4">
            <Tv className="w-16 h-16 text-tv-red/40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-tv-red" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm font-body">
            Connecting to stream…
          </p>
        </div>
      )}

      {/* Error overlay */}
      {playerState === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
          <AlertCircle className="w-12 h-12 text-tv-red mb-3" />
          <p className="text-foreground font-semibold mb-1">
            Stream Unavailable
          </p>
          <p className="text-muted-foreground text-sm text-center px-6">
            {errorMessage}
          </p>
        </div>
      )}
    </div>
  );
}
