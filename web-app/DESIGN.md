# Quiz Arena web design

## Typography

Use Luckiest Guy for the wordmark, page and section headings, and game mode titles. The web app serves its own Latin and extended Latin font files from `public/fonts` and includes the upstream Apache license alongside them. Use Nunito for body text, form controls, and navigation.

The time gap, result numbers, and form headings on `/auth` use Super Squad Regular from `app/auth/super-squad.ttf` with `0.035em` letter spacing. Its supplied license is stored beside the font. Use CODE Bold from `app/auth/code-bold.otf` for round labels, player names, question and answer text, field labels, and the primary button. Use Nunito for small text and input values.

## Authentication

The sign-in and registration screens share a plum background and a top-left wordmark. Desktop places the round preview beside a cream form panel with a cut top-right corner. Both default form states fit within a 1366 × 768 viewport.

| Token | Value | Use |
| --- | --- | --- |
| Background | `#211437` | Auth page |
| Results board | `#2e2044` | Answer times |
| Surface | `#fdfbf7` | Form panel and light wordmark text |
| Ink | `#221638` | Headings and labels |
| Action | `#5633cf` | Primary button, mode switch, and focus ring |
| Mint | `#64efc3` | Arena wordmark accent, correct answer, and first-place time |
| Pink | `#f6a0c8` | Second-place time |
| Gold | `#ffcc38` | Time gap |
| Field border | `#797181` | Input boundaries |

The auth tokens and layout live in `app/auth/auth.module.css`. Place the stopwatch beside the time gap and show both players against the same 0–4 second scale. Keep the 460 px form panel's fields stacked. At 820 px and below, put the form before the round preview and let the page scroll.

Keep the preview static and mark the correct answer with a check and accessible text. Use visible field boundaries, a single primary action, and an underlined mode switch. Give controls at least 44 px of height and a visible keyboard focus ring.

## Last updated

2026-11-24 — Added the timed round preview and stacked auth forms.
