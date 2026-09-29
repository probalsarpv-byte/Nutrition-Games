# Nutri Ludo — Full Rebuild

পুরোনো dashboard-style UI বাদ দিয়ে mobile Ludo app feel-এ নতুন front-end বানানো হয়েছে।

## Included
- Solo vs Computer
- Local 2–4 Player
- Online 2–4 Player with Firebase room code
- Create / Join / Ready / Start / Live turn sync
- 5 Levels, Easy / Medium / Hard
- বাংলা + English
- Day / Night mode
- 4 Panda themes
- CSS 3D dice
- SVG snakes and ladders drawn across the board
- Animated tokens and Panda cards
- Quiz / Bonus / Trap / Duel tiles
- Working Hint, Shield, Boost and Freeze mechanics
- Web Audio sound effects
- Winner confetti
- Achievements via localStorage
- Daily Challenge
- Responsive mobile-first UI

## Upload
ZIP extract করে সব file GitHub repository root-এ replace/upload করুন।

তারপর GitHub → Settings → Pages → main → /(root)

## Firebase Rules
`firebase-rules.json`-এর content Firebase → Realtime Database → Rules-এ paste করে Publish করুন।
Anonymous Authentication ON রাখুন।

## Important
Firebase-only multiplayer casual educational game-এর জন্য ঠিক আছে। Ranked/public anti-cheat চাইলে dice এবং move validation authoritative Node.js backend-এ নিতে হবে।
