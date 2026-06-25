const weddingDate = new Date("2026-12-14T10:30:00+05:30");
const countdownParts = {
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds")
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateCountdown() {
  const diff = Math.max(0, weddingDate - new Date());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownParts.days.textContent = String(days).padStart(3, "0");
  countdownParts.hours.textContent = pad(hours);
  countdownParts.minutes.textContent = pad(minutes);
  countdownParts.seconds.textContent = pad(seconds);
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

const rsvpForm = document.querySelector("#rsvpForm");
const formNote = document.querySelector("#formNote");

rsvpForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(rsvpForm);
  const name = String(formData.get("name") || "Guest").trim();
  const guests = String(formData.get("guests") || "1");
  const attending = formData.get("attending");

  if (attending === "yes") {
    formNote.textContent = `Thank you, ${name}. Your RSVP for ${guests} guest${guests === "1" ? "" : "s"} is confirmed.`;
  } else if (attending === "maybe") {
    formNote.textContent = `Thank you, ${name}. We will wait for your final confirmation.`;
  } else {
    formNote.textContent = `Thank you, ${name}. Your blessings mean a lot to the couple.`;
  }

  rsvpForm.reset();
});

let audioContext;
let masterGain;
let musicTimer;
let isPlaying = false;
const musicPlayer = document.querySelector(".music-player");
const musicToggle = document.querySelector("#musicToggle");
const musicStatus = document.querySelector("#musicStatus");
const ganeshSplash = document.querySelector("#ganeshSplash");
const enterInvitation = document.querySelector("#enterInvitation");
const melody = [196, 261.63, 293.66, 329.63, 392, 329.63, 293.66, 261.63, 220, 261.63];
let noteIndex = 0;

function setupMusic() {
  if (audioContext) return;
  audioContext = new AudioContext();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.55;
  masterGain.connect(audioContext.destination);
}

function playNote(frequency) {
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.detune.setValueAtTime(-8, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.075, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(now);
  oscillator.stop(now + 1.5);
}

function startMusic() {
  setupMusic();
  if (audioContext.state === "suspended") audioContext.resume();
  isPlaying = true;
  musicPlayer.classList.add("playing");
  musicStatus.textContent = "Playing softly";

  playNote(melody[noteIndex]);
  musicTimer = window.setInterval(() => {
    noteIndex = (noteIndex + 1) % melody.length;
    playNote(melody[noteIndex]);
  }, 900);
}

function stopMusic() {
  isPlaying = false;
  musicPlayer.classList.remove("playing");
  musicStatus.textContent = "Tap to play";
  window.clearInterval(musicTimer);
}

musicToggle.addEventListener("click", () => {
  if (isPlaying) stopMusic();
  else startMusic();
});

function openInvitation() {
  if (!ganeshSplash || ganeshSplash.classList.contains("curtain-opening")) return;
  enterInvitation.disabled = true;
  enterInvitation.textContent = "Opening...";
  ganeshSplash.classList.add("curtain-opening");

  window.setTimeout(() => {
    ganeshSplash.classList.add("hidden");
    document.body.classList.remove("splash-open");
    if (!isPlaying) startMusic();
  }, 3100);
}

enterInvitation?.addEventListener("click", (event) => {
  event.stopPropagation();
  openInvitation();
});

ganeshSplash?.addEventListener("click", openInvitation);
document.body.classList.add("splash-open");

updateCountdown();
setInterval(updateCountdown, 1000);





