# Nutri Ludo World — Figma-guided Three.js Free Build

এই package-টি paid API ছাড়া তৈরি।

## Included
- Snake Nutrition mode
- Classic Nutrition Ludo mode
- Three.js 3D board
- Procedural 3D Panda tokens
- 3D animated dice
- Real snake + ladder geometry
- Food tiles
- Quiz tiles
- Manual token tap selection
- Solo vs Computer
- Local 2–4 player
- Online 2–4 player via Firebase
- Day/Night
- Bangla/English
- Sound
- Achievements
- Daily challenge
- Mobile-first UI based on the Figma design direction

## Snake mode
- Token starts outside board
- 1 or 6 needed to enter
- Snake / ladder effects
- Healthy food moves forward
- Junk food moves backward
- Quiz tiles

## Classic mode
- 4 tokens/player
- 1 or 6 enters token
- Manual token selection
- Safe cells
- Capture/cut
- Home lane
- Center finish
- Food + quiz cells

## Free stack
- GitHub Pages
- Firebase Anonymous Auth
- Firebase Realtime Database
- Three.js CDN
- No OpenAI API
- No paid API

## Deploy
Upload all files to the root of:
probalsarpv-byte/Nutrition-Games

Then GitHub Pages:
Settings → Pages → main → /(root)

## Firebase
Anonymous Authentication must be enabled.

Realtime Database → Rules:
Paste `firebase-rules.json` and Publish.

## Blogger
Use `blogger-embed.html`.
