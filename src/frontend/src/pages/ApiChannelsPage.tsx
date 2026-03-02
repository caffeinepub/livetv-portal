import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";

// This page handles /api/channels?token=xxx requests
// It renders a JSON response in the browser
export function ApiChannelsPage() {
  const { actor, isFetching } = useActor();
  const [output, setOutput] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState(200);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isFetching || !actor) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || "";

    async function checkApiAndBuildResponse() {
      try {
        // Get API settings - use a direct call since this is a public endpoint
        // We need to validate the token against what's stored in backend
        // Call getChannelsApi which does all validation server-side
        const result = await actor!.getChannelsApi(token);
        const formatted = result.map((ch) => ({
          id: Number(ch.id),
          name: ch.name,
          logoUrl: ch.logoUrl,
          streamUrl: ch.streamUrl,
          category: ch.category,
          description: ch.description,
          isActive: ch.isActive,
          order: Number(ch.order),
        }));
        setOutput(JSON.stringify(formatted, null, 2));
        setStatusCode(200);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        if (msg.includes("disabled")) {
          setOutput(
            JSON.stringify({ error: "API is currently disabled." }, null, 2),
          );
          setStatusCode(503);
        } else if (msg.includes("Invalid API token") || msg.includes("token")) {
          setOutput(
            JSON.stringify({ error: "Invalid or missing API token." }, null, 2),
          );
          setStatusCode(401);
        } else {
          setOutput(JSON.stringify({ error: msg }, null, 2));
          setStatusCode(500);
        }
      }
      setChecked(true);
    }

    checkApiAndBuildResponse();
  }, [actor, isFetching]);

  // Set content-type via meta tag hint (can't truly set HTTP headers in SPA)
  // But render raw JSON for easy consumption / curl-like viewing
  if (isFetching || !checked) {
    return (
      <pre
        style={{
          fontFamily: "monospace",
          fontSize: "14px",
          padding: "16px",
          background: "#000",
          color: "#0f0",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        Loading...
      </pre>
    );
  }

  const color = statusCode === 200 ? "#0f0" : "#f55";

  return (
    <pre
      style={{
        fontFamily: "monospace",
        fontSize: "14px",
        padding: "16px",
        background: "#0a0a0a",
        color,
        minHeight: "100vh",
        margin: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      }}
    >
      {output}
    </pre>
  );
}
