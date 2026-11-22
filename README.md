# Quiz Arena — Revised Starter Project (Web + Android)

**Important:** This is a fresh, runnable **starter scaffold**, not a complete copy of your previous project. The original project ZIP was not provided. Features not included are listed below. Teacher role is removed from the new registration interface. Regular accounts can sign up, create quizzes, and (when permitted by existing RLS) host rooms. Moderators remain assigned through existing database invitations; moderator UI is not yet integrated.

## Setup on Windows 11
1. Install Node.js 20+ and VS Code.
2. Open `web-app` in VS Code. Copy `.env.example` to `.env.local` and enter your existing Supabase Project URL and publishable/anon key. Never use the service role key in client apps.
3. In terminal run `npm install` then `npm run dev`. Open http://localhost:3000.
4. For Android, open `mobile-app`. Copy `.env.example` to `.env` and enter the same public Supabase values. Run `npm install` then `npx expo start`. Open Expo Go on Android (compatible SDK required).
5. Confirm email in Supabase Authentication if enabled. Use two test accounts for multiplayer.

## Included
- Web landing page, registration/sign-in with no Teacher role, dashboard, quiz creation, manual multiple-choice question editor, room creation, room joining through your existing RPC, room status controls and realtime subscriptions.
- Android Expo starter: registration/sign-in, room joining, session persistence.
- Crimson & Cream responsive UI and environment examples.

## Not yet implemented or validated
- AI question generation, admin screens, moderator invitation UI, full student live-question/answer interface, leaderboard, offline edge synchronization, analytics, publish/review workflow, automated tests, and deployment hardening.
- Database compatibility is based on schemas supplied in chat; some columns/defaults/permissions may differ. In particular, `quizzes` creation requires your database's exact required fields, and rooms require reviewed/published quizzes.
- Host privileges are **not** newly granted by this package. The existing RLS and SQL functions enforce authorization.
- Web/mobile code has not been executed against your Supabase instance.

## Security
- Never disable RLS or expose `service_role` credentials in the browser/mobile.
- Teacher-specific metadata/redirects are removed in this starter. If your database still has teacher-related role values, migrate them only after reviewing your actual schema and triggers.
