# Nutri Ludo World — RC1

এটি **Production নয়**, এটি Release Candidate 1। Final DEV SPEC অনুযায়ী core engine নতুন করে ভাগ করা হয়েছে।

## RC1-এ implemented
- Classic এবং Snake আলাদা rule engine
- Classic 2-player opposite seating (Green ↔ Orange)
- Classic opening = 6
- Snake opening = 1
- Classic 4 tokens/player
- 52-cell common track
- 6-cell home lane + center finish
- Home gate/home lane nutrition visual theme
- Safe cells
- Capture
- Blockade validation
- Exact finish
- Bonus roll
- Triple-6 full rollback
- Triple-1 full rollback
- এক roll → এক movement action; roll যোগ করে movement নয়
- Mobile full-screen game screen
- Back/Quit confirmation
- 15 sec auto-roll timer
- 10 sec auto-select timer
- বড় visible dice result
- 4 distinct Panda variants
- Snake + ladder geometry
- watermark numbering
- nutrition / quiz / power tiles
- Firebase transaction helper
- Node engine regression tests

## Production-এর আগে বাকি
- Full online lobby/reconnect/host-transfer UI wiring
- Firebase rules hardening
- পূর্ণ বাংলা/English translation
- 50+ question bank
- actual Android/iPhone browser QA
- browser runtime regression test
- visual asset polish

## Local Test
`npm test`

## Deploy
পুরো folder structure GitHub Pages repository root-এ upload করতে হবে। শুধু root JS files upload করলে module imports ভেঙে যাবে।
