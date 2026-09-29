# NutriQuest 4P — Premium Final Package

## Included
- Solo vs AI
- Local 2–4 Player
- Online 2–4 Player via Firebase Realtime Database
- Create Room / Join Room / Ready / Host Start / Live Turn Sync
- Dynamic room capacity: 2, 3 or 4
- 5 learning levels
- Easy / Medium / Hard
- Bilingual Bangla + English
- Day / Night mode
- 3D-style animated dice
- 3D board perspective
- Animated Nutri Panda mascot
- 4 Panda player avatars / color-coded tokens
- Nutrition quizzes
- Snake / Ladder / Quiz / Bonus / Trap / Duel tiles
- Power-ups: Shield, Hint, Boost, Freeze slots
- Score, streak, accuracy and achievements
- Daily Challenge entry
- Responsive mobile layout
- Blogger iframe file

## Upload to GitHub
Extract ZIP. Upload every file to repository root:
index.html
style.css
firebase.js
levels.js
questions.js
game.js
app.js
firebase-rules.json
blogger-embed.html

Then GitHub → Settings → Pages → Deploy from branch → main → /(root)

## Firebase Rules
Firebase Console → Realtime Database → Rules
Copy all text from `firebase-rules.json` → Paste → Publish.

## Test 4-player online
1. Device 1: Create Room → capacity 4.
2. Device 2/3/4: Join with same 6-digit room code.
3. Everyone presses Ready.
4. Host selects Level + Difficulty.
5. Host presses Start Game.
6. Turns rotate Player 1 → 2 → 3 → 4.

## Important
This is a Firebase-only casual educational multiplayer architecture. It is not fully anti-cheat because clients still execute game logic. For ranked/public competitive play, move dice generation and move validation to an authoritative Node.js/Cloud Functions backend.
