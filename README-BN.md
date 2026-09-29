# Nutri Ludo — Classic Mechanics Rebuild

এই build-এ সবচেয়ে বড় পরিবর্তন: গুটি আর auto-move করবে না।

## New classic Ludo behavior
- সব গুটি শুরুতে board-এর বাইরে HOME/YARD-এ থাকবে।
- 1 বা 6 roll না করলে গুটি board-এ ঢুকবে না।
- 1 বা 6 roll হলে user নিজের গুটিতে tap/click করলে গুটি tile 1-এ ঢুকবে।
- গুটি board-এ ঢোকার পর dice roll-এর result অনুযায়ী user গুটিতে tap করলে move করবে।
- move করার আগে token pulse/highlight করবে।
- Human move শেষ হলেই Computer নিজে dice roll করবে।
- Computer-এর dice resultও বড় করে board-এর পাশে দেখাবে।
- Dice click করলে dice board-এর ওপর দিয়ে উড়ে/ঘুরে গিয়ে result দেখাবে।
- Mobile-এ token size বড় করা হয়েছে।

## Nutrition board
Board-এর বিভিন্ন ঘরে:
- Healthy foods: 🥚🥦🍎🐟🥛🥗🥜🍊 → সামনে এগিয়ে দেয়।
- Junk foods: 🥤🍟🍩🍬🍔🧁🍕 → পিছিয়ে দেয়।
- ❓ Quiz tiles → nutrition question.
- Food tile থেকে destination পর্যন্ত dotted visual path দেখানো হয়।

## Existing features retained
- Solo vs Computer
- Local 2–4 players
- Online 2–4 players via Firebase
- 5 levels
- Easy / Medium / Hard
- Bangla / English
- Day / Night
- Hint / Boost / Freeze
- Score / quiz accuracy
- Achievements
- Sound + winner confetti

## Upload
পুরোনো repository root-এর game files replace করে ZIP-এর সব file upload করুন।

Firebase Realtime Database Rules-এর জন্য `firebase-rules.json` ব্যবহার করুন।
