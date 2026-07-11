import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
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

const adminKey = "jayasimha";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const liveDoc = doc(db, "weddingSites", "main");
const statusText = document.getElementById("onlineStatus");
const saveButton = document.getElementById("saveLatestOnline");
const isAdmin = new URLSearchParams(location.search).get("admin") === adminKey;

function setStatus(message) {
  if (statusText) statusText.textContent = message;
}

function latestData() {
  const data = window.weddingApp.getData();
  return {
    ...data,
    photos: [],
    music: "",
    musicName: ""
  };
}

async function loadLatestOnline() {
  try {
    const snap = await getDoc(liveDoc);
    if (!snap.exists()) {
      if (isAdmin) setStatus("No online invitation saved yet. Edit and click Save latest online.");
      return;
    }
    window.weddingApp.setData(snap.data().invitation || {});
    if (isAdmin) setStatus("Latest online invitation loaded. Edit and save when ready.");
  } catch (error) {
    if (isAdmin) setStatus("Could not load online invitation. Check Firebase rules.");
  }
}

saveButton?.addEventListener("click", async () => {
  if (!isAdmin) return;
  try {
    setStatus("Saving latest invitation online...");
    await setDoc(liveDoc, {
      adminKey,
      invitation: latestData(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    setStatus("Saved online. The same guest link and QR now show these latest changes.");
  } catch (error) {
    setStatus("Could not save online. Firebase rules need to allow admin save.");
  }
});

loadLatestOnline();
