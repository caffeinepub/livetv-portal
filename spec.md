# jagolive

## Current State
Full IPTV streaming site with HLS/M3U8 playback, channel grid, category filters, admin panel with multi-account system, API management, import/export JSON. Backend stores sessions in-memory (lost on canister restart).

## Requested Changes (Diff)

### Add
- `FeaturedChannelCard` component in HomePage that shows channel logo as cover image (object-cover) with dark overlay and play button
- `RelatedChannelItem` component in WatchPage with per-item image error state
- `ChannelLogo` component in WatchPage for the info panel below the player
- `/api/channels` route in App.tsx handled by new `ApiChannelsPage` component that calls `getChannelsApi` and renders raw JSON
- localStorage persistence for API token and enabled state (saved on form submit and loaded as fallback)

### Modify
- `ChannelCard`: removed LIVE indicator badge; changed logo image from `object-contain p-4` to `object-cover`
- `HlsPlayer`: removed LIVE badge overlay from player
- `WatchPage`: removed LIVE badge from channel info panel; removed live indicator from related channels sidebar; fixed logo display with proper error handling and `object-cover`
- `AdminDashboard` ApiManagementTab: added localStorage caching for apiToken/apiEnabled; fixed generateToken to not auto-overwrite saved state; save persists to localStorage on submit
- `HomePage`: featured channel now picks lowest-order active channel (sorted by order asc); cover card uses new FeaturedChannelCard with real logo

### Remove
- LIVE indicator badges from ChannelCard, HlsPlayer, WatchPage info panel, and related channels sidebar

## Implementation Plan
1. Remove LIVE badges from HlsPlayer and ChannelCard -- done
2. Fix ChannelCard image to object-cover -- done
3. Fix WatchPage: ChannelLogo component, RelatedChannelItem component, remove LIVE badges -- done
4. Fix HomePage: FeaturedChannelCard component with logo cover, sort featured by order -- done
5. Create ApiChannelsPage for /api/channels route -- done
6. Add /api/channels route to App.tsx -- done
7. Fix AdminDashboard API tab: localStorage persistence for token -- done
8. Build and validate -- done
