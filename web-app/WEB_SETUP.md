# Quiz Arena — Revised Web Version

Based on the original `Quiz-Arena-Revised-Starter.zip`, preserving its Next.js 15 project, existing Supabase client and database calls.

## UI preview on Windows

From a PowerShell terminal in `web-app`, run:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose **Open UI preview** to go straight to the dashboard. The sign-in and registration forms accept sample details in this mode. Under **My Quizzes**, open a sample or create a local quiz. Under **Multiplayer**, use `654321` to open the sample lobby, or host a preview room from a quiz.

UI preview is the default. Its quiz and room changes are stored in the current browser and stay there when you reload.

## Connect Supabase later

Set these values in `web-app/.env.local` and restart the development server:

```dotenv
NEXT_PUBLIC_QUIZ_ARENA_MODE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

Use your team's project with the tables, functions, and policies described in the [database notes](../sql/README.md). Remove `NEXT_PUBLIC_QUIZ_ARENA_MODE` to return to the web UI preview.

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
