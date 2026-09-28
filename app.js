import {
  auth,
  signInAnonymously,
  onAuthStateChanged
} from "./firebase.js";

const statusEl = document.getElementById("status");

signInAnonymously(auth).catch((error) => {
  console.error("Anonymous login failed:", error);
  statusEl.textContent = "Firebase connection failed. Open browser console for details.";
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    statusEl.textContent = "Firebase connected successfully!";
    console.log("Firebase connected");
    console.log("Anonymous UID:", user.uid);
  }
});
