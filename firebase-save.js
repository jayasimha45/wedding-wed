import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDxT1IkB976AcN1gsjEDlOENQse5RB9JmI",
  authDomain: "weddind-card.firebaseapp.com",
  projectId: "weddind-card",
  storageBucket: "weddind-card.firebasestorage.app",
  messagingSenderId: "741288872986",
  appId: "1:741288872986:web:08a4988528e75bf76515a3",
  measurementId: "G-3T88ENR76G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const signInButton = document.getElementById("googleSignIn");
const saveButton = document.getElementById("saveOnline");
const statusText = document.getElementById("onlineStatus");
let currentUser = null;
let currentShareLink = "";
const isFilePreview = location.protocol === "file:";

function setStatus(message) {
  if (statusText) statusText.textContent = message;
}

function publicData() {
  const data = window.weddingApp.getData();
  return {
    ...data,
    music: "",
    musicName: ""
  };
}

function textShareData() {
  const data = publicData();
  return {
    ...data,
    bridePhoto: "",
    groomPhoto: "",
    photos: []
  };
}

const publicWeddingSite = "https://jayasimha45.github.io/wedding-wed/";

function shareLinkFor(uid) {
  return `${publicWeddingSite}?wedding=${encodeURIComponent(uid)}`;
}

function quickShareLink() {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(textShareData()))));
  return `${publicWeddingSite}?invite=${encodeURIComponent(encoded)}`;
}

function loadQuickInvitation() {
  const params = new URLSearchParams(location.search);
  const invite = params.get("invite");
  if (!invite) return false;
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(invite))));
    window.weddingApp.setData(data);
    currentShareLink = location.href;
    setStatus("Shared invitation loaded.");
    return true;
  } catch (error) {
    setStatus("Could not load this shared invitation.");
    return false;
  }
}

async function loadSharedInvitation() {
  const params = new URLSearchParams(location.search);
  const weddingId = params.get("wedding");
  if (!weddingId) return;
  setStatus("Loading shared invitation...");
  const snap = await getDoc(doc(db, "weddings", weddingId));
  if (!snap.exists()) {
    setStatus("Shared invitation not found.");
    return;
  }
  window.weddingApp.setData(snap.data().invitation || {});
  currentShareLink = shareLinkFor(weddingId);
  setStatus("Shared invitation loaded.");
}

signInButton?.addEventListener("click", async () => {
  if (isFilePreview) {
    setStatus("Google sign-in works only on the published website, not this local file. Use Copy share link here.");
    return;
  }
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    if (error?.code === "auth/unauthorized-domain") {
      setStatus("Google sign-in is not allowed on this website domain yet. Use Copy share link.");
      return;
    }
    setStatus("Google sign-in did not finish. Use Copy share link instead.");
  }
});

saveButton?.addEventListener("click", async () => {
  if (!currentUser) {
    setStatus("Please sign in first.");
    return;
  }
  try {
    setStatus("Saving online...");
    await setDoc(doc(db, "weddings", currentUser.uid), {
      owner: currentUser.uid,
      ownerEmail: currentUser.email || "",
      invitation: publicData(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    currentShareLink = shareLinkFor(currentUser.uid);
    setStatus("Saved online. Share link is ready.");
  } catch (error) {
    currentShareLink = quickShareLink();
    setStatus("Online save did not finish. A normal share link is ready instead.");
  }
});


onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (isFilePreview) {
    saveButton.disabled = true;
    signInButton.textContent = "Google sign-in needs published site";
    setStatus("Local file preview: use Copy share link.");
    return;
  }
  if (!user) {
    saveButton.disabled = true;
    signInButton.textContent = "Sign in with Google";
    if (!currentShareLink) setStatus("Ready to share");
    return;
  }
  signInButton.textContent = user.displayName ? `Signed in: ${user.displayName}` : "Signed in with Google";
  saveButton.disabled = false;
  currentShareLink = shareLinkFor(user.uid);
  setStatus("Signed in. Click Save online after editing.");
});

if (!loadQuickInvitation()) {
  loadSharedInvitation().catch(() => setStatus("Could not load shared invitation."));
}
