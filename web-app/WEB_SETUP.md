# Quiz Arena — Revised Web Version

Based on the original `Quiz-Arena-Revised-Starter.zip`, preserving its Next.js 15 project, existing Supabase client and database calls.

## Run on Windows 11

1. Open the `web-app` folder in VS Code.
2. Copy `.env.example` to `.env.local` and add the SAME Supabase URL and anon/publishable key used by the mobile app, using the `NEXT_PUBLIC_...` variable names shown in the example.
3. Open the terminal in `web-app`.
4. Run `npm install`.
5. Run `npm run dev`.
6. Visit http://localhost:3000.

## Included
- Responsive Playful Purple & Cream design, matching mobile
- Landing page, sign in/register, dashboard, multiplayer join/host, quiz management, room lobby
- Local browser login streak, badges, avatar colors, light/dark appearance, help
- Room code copy and share
- Existing Supabase auth, quiz creation, question creation, room creation, join RPC, room status controls

## Limitations
- AI quiz generation, solo gameplay, full live answering, leaderboard, and server-synchronized badges are NOT implemented.
- New local features use localStorage, not Supabase. No database migration is included.
- Room creation still uses the starter's random six-digit code and existing game_sessions insert. Collisions or backend policies may cause errors.
- This revision has not been verified with your actual Supabase instance.
