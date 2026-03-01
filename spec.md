# jagolive

## Current State
A full-stack IPTV portal (formerly "JagoBD" / "LiveTV Portal") with:
- Public homepage with channel grid and category filter tabs
- Watch page with HLS.js player, channel info, and related channels sidebar
- Admin panel at /admin with channel and category CRUD
- Backend stores channels with `isActive` field

## Requested Changes (Diff)

### Add
- `getAllChannels(token)` backend endpoint: returns ALL channels regardless of `isActive`, for admin use only (auth-gated)
- Channel logo cover banner on WatchPage: large full-width logo image displayed at the top of the watch page above the video player

### Modify
- Admin panel's channel list: switch from `useChannels()` (public, active-only) to a new `useAllChannels(token)` hook that calls `getAllChannels` — so inactive channels remain visible and manageable in the admin
- Admin panel stats card "Total Channels": must count all channels including inactive
- All brand name occurrences "JagoBD" → "jagolive" (Navbar, Footer, index.html title, page titles, admin panel)
- WatchPage: show channel logo as a full-width cover banner (like YouTube channel page) at the top, above the player

### Remove
- Nothing removed

## Implementation Plan
1. Backend: add `getAllChannels(token: Text) : async [Channel]` — auth-gated, returns all channels without filtering by isActive
2. Update `backend.d.ts`: add `getAllChannels(token: string): Promise<Array<Channel>>`
3. Add `useAllChannels(token)` hook in useQueries.ts that calls `getAllChannels`
4. AdminDashboard: replace `useChannels()` with `useAllChannels(token)` for the channel table and stats
5. WatchPage: add a cover banner section at the top that shows `displayChannel.logoUrl` as a wide cover image (with fallback gradient), placed before the back button
6. Rename all "JagoBD" text to "jagolive" in Navbar.tsx, Footer.tsx, index.html, HomePage.tsx, AdminDashboard.tsx
