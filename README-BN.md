# Nutri Ludo World — Three.js Final Package

এই build-এ একই app-এর মধ্যে ২টি game mode আছে:

1. Snake Nutrition
2. Classic Nutrition Ludo

## Three.js features
- Real WebGL scene
- Directional + hemisphere lighting
- Shadows
- 3D board tiles
- 3D animated dice
- Procedural low-poly Panda tokens
- Token raycasting/tap selection
- Animated selectable-token glow/scale
- 3D food-themed raised cells
- Responsive mobile canvas

## Snake Nutrition
- 1–100 3D board
- Token starts outside board
- 1 or 6 needed to enter
- User taps Panda after dice roll
- Healthy food = forward bonus
- Junk food = backward penalty
- Quiz tiles
- Solo / Local / Online

## Classic Nutrition Ludo
- 15×15 Ludo board
- 4 Panda tokens per player
- 2–4 players
- 1 or 6 enters a token
- Manual token selection
- 52-cell outer path
- Colored home lanes
- Basic capture/cut rule
- Safe cells
- Food / Quiz cells
- Solo / Local / Online

## UI
- Mobile app layout
- Day / Night
- Bangla / English
- Sound
- Results, accuracy, score, achievements
- Daily challenge

## Deploy
Upload all files to the root of:
probalsarpv-byte/Nutrition-Games

Then:
GitHub → Settings → Pages → main → /(root)

## Firebase
Realtime Database → Rules
Paste `firebase-rules.json` and Publish.

Anonymous Auth must remain enabled.

## Note
The Panda characters and food tiles are procedural Three.js models/sprites so the app stays lightweight and works on GitHub Pages/Blogger without large asset files. You can later replace them with GLB/GLTF artwork without changing the game logic.
