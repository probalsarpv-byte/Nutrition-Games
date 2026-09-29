# Interaction Fix

মূল সমস্যা: app.js শুরুতেই Firebase এবং Three.js external modules import করছিল।
এই external module-এর যেকোনো একটি load fail করলে পুরো app.js execute হতো না।
ফলে theme, language, mode, play—কোনো click handler-ই attach হতো না।

এই build-এ:
- Three.js lazy-load হয় শুধু game start করার সময়।
- Firebase lazy-load হয় শুধু Online mode খুললে।
- Solo/Local UI Firebase-এর উপর নির্ভর করে না।
- External service fail হলেও Home/Setup buttons কাজ করবে।
- 3D engine fail হলে screen-এ visible error দেখাবে।
- token movement এখন আগের position থেকে নতুন position পর্যন্ত animated, শুধু bounce-in-place নয়।
