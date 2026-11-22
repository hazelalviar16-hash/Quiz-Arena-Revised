# Quiz Arena — Web Icon Consistency Patch

Based on the prior Mobile-Matched web patch plus the latest Mobile Background patch.

## Install
1. Back up your existing `web-app` directory.
2. Copy the patch `web-app/app` files into the matching existing `web-app/app` paths, replacing only matching files.
3. Run `npm install lucide-react` in `web-app` if not already installed.
4. Restart `npm run dev`.

## Changes
- Removed emojis and decorative text arrows from landing page, auth, dashboard, multiplayer, room lobby, quiz pages, achievements, profile, settings, help.
- Replaced with consistent Lucide icons and CSS icon containers.
- Preserved the mobile-matched cream/purple/pink background and layout.
- No changes to `lib/supabase`, `.env.local`, SQL, RPC, or database schema.
- Existing server interactions in page components were not deliberately changed.

## Notes
- This is a UI patch; it does not implement unconnected features.
- Run and test with your existing Supabase project.
