# Quiz Arena — Revised Starter Project (Web + Android)

**Important:** This is a fresh, runnable **starter scaffold**, not a complete copy of your previous project. The original project ZIP was not provided. Features not included are listed below. Teacher role is removed from the new registration interface. Regular accounts can sign up, create quizzes, and (when permitted by existing RLS) host rooms. Moderators remain assigned through existing database invitations; moderator UI is not yet integrated.

## Run the web UI preview on Windows

Install Node.js 22 or later. From the project root, run:

```powershell
cd web-app
npm.cmd ci
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000) and choose **Open UI preview**. The web app starts with sample quizzes and a room code. Preview edits are stored in the current browser. Real account and multiplayer integration can be enabled later using the [web setup guide](web-app/WEB_SETUP.md).

## Run the Android starter

In `mobile-app`, create `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` for your team's project. Run `npm install` and `npx expo start`, then open Expo Go with a compatible SDK.

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
