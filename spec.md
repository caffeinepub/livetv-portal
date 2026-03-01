# jagolive

## Current State
Full-stack IPTV streaming site with:
- Public homepage (channel grid, category filter, hero section)
- Watch page (HLS player, channel cover banner between navbar and player, related channels sidebar)
- Admin panel (channels, categories, users, site settings tabs)
- Backend: Motoko with channels, categories, accounts, sessions, site settings
- Footer: "Built with ❤️ using caffeine.ai"

## Requested Changes (Diff)

### Add
- **Channel Import system**: Admin can upload a JSON file to bulk-import channels. JSON format: array of channel objects with fields: name, logoUrl, streamUrl, category, description, isActive, order.
- **Channel Export system**: Admin can export all channels as a downloadable JSON file from the admin panel.
- **API system (backend)**: New backend functions:
  - `getApiSettings(token)` → returns `{enabled: Bool, apiToken: Text}` (admin only)
  - `updateApiSettings(enabled: Bool, apiToken: Text, token: Text)` → update API settings (admin only)
  - `getChannelsApi(apiToken: Text)` → returns all active channels as JSON-compatible array if API is enabled and apiToken matches
- **API Management tab (frontend)**: Admin-only tab in dashboard to:
  - Toggle API enabled/disabled
  - Set/change the API token (secret URL token)
  - Show the full API URL: `<canister_url>/api/channels?token=<apiToken>`
  - Copy URL button
- **importChannels backend function**: `importChannels(channels: [ChannelImport], token: Text)` — bulk-inserts channels, skipping duplicates by name

### Modify
- **WatchPage**: Remove the channel logo cover banner section (the full-width banner between Navbar and main content). The channel info with logo still appears in the info card below the player. Keep the info card intact.
- **ChannelCard (HomePage fix)**: The `imgError` state is per-card and resets correctly, but channels with `order=0` may not render logo due to `channel.logoUrl` being falsy for seeded channels. Fix: ensure `imgError` is initialized correctly and `channel.logoUrl` is treated as a valid truthy check; also ensure sorted channels (order=0 first) show their logos.
- **Footer**: Change "Built with ❤️ using caffeine.ai" text to "Maintained by sultanarabi161". Keep the caffeine.ai link removed (or link to GitHub profile).
- **Backend addChannel**: The current `addChannel` function checks `validRoles` which verifies at least one active channel exists before adding — this is a bug. Remove this check. Just auto-increment ID and add the channel.

### Remove
- Channel cover banner section in WatchPage (the `h-40/h-48` banner with blurred background between Navbar and main).

## Implementation Plan
1. Update `main.mo`:
   - Fix `addChannel` bug: remove the broken `validRoles` check
   - Add `ApiSettings` type: `{enabled: Bool; apiToken: Text}`
   - Add `apiSettings` stable var with default `{enabled: false; apiToken: "jagolive-api-secret"}`
   - Add `getApiSettings(token)` query (admin only)
   - Add `updateApiSettings(enabled, apiToken, token)` update (admin only)
   - Add `getChannelsApi(apiToken)` query — returns active channels if enabled and token matches
   - Add `importChannels(channelsToImport: [{name; logoUrl; streamUrl; category; description; isActive; order}], token)` — bulk add skipping name duplicates

2. Update `backend.d.ts` to reflect new API functions.

3. Update `WatchPage.tsx`: Remove the cover banner block entirely (lines ~52-105 in current file).

4. Update `ChannelCard.tsx`: Fix the logo display. The issue is `imgError` state default is `false` so logos should show. The real problem may be that sorted channels with `order=0` from the backend have empty `logoUrl`. Ensure the fallback (Tv icon) shows correctly when no logo. No code change needed here — the real fix is in backend seed data (order starts at 1 not 0). The admin sorts channels by order and `order=0` channels appear first but have empty logos in seed data. This is expected behavior — just verify the ChannelCard handles the case gracefully.

5. Update `Footer.tsx`: Change the attribution line to "Maintained by sultanarabi161".

6. Update `AdminDashboard.tsx`:
   - Add Import button in Channels tab header: hidden file input accepting `.json`, reads file, parses, calls `importChannels` mutation
   - Add Export button in Channels tab header: serializes current channels array to JSON, triggers download
   - Add API tab (admin only) with: enabled toggle, apiToken input field, display full API URL, copy button

7. Update `useQueries.ts`: Add hooks for `getApiSettings`, `updateApiSettings`, `importChannels`, `getChannelsApi`.
