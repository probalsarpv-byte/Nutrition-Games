import {
  auth,
  signInAnonymously,
  onAuthStateChanged
} from "./firebase.js";

const statusEl = document.getElementById("status");
const errorBox = document.getElementById("errorBox");

function showError(err) {
  console.error(err);
  statusEl.textContent = "Firebase connection failed";
  errorBox.hidden = false;
  errorBox.textContent =
    (err && err.code ? `Code: ${err.code}\n` : "") +
    (err && err.message ? `Message: ${err.message}` : String(err));
}

window.addEventListener("error", (e) => showError(e.error || e.message));
window.addEventListener("unhandledrejection", (e) => showError(e.reason));

statusEl.textContent = "Signing in anonymously...";

signInAnonymously(auth)
  .catch(showError);

onAuthStateChanged(auth, (user) => {
  if (user) {
    statusEl.textContent = "Firebase connected successfully!";
    errorBox.hidden = true;
    console.log("Firebase connected");
    console.log("Anonymous UID:", user.uid);
  }
});
