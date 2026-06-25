const defaults = {
  bride: "Meera",
  groom: "Aarav",
  dateTime: "2026-12-14T10:30",
  dateText: "14 December 2026",
  venue: "The Royal Orchid Garden",
  address: "Palace Road, Bengaluru, Karnataka",
  bridePhone: "+91 98765 43210",
  groomPhone: "+91 91234 56789",
  whatsapp: "",
  message: "With the blessings of elders and the warmth of family, we invite you to celebrate this sacred union. Your presence will make every ritual brighter and every memory more precious.",
  story: "They met at a family celebration, became friends through endless conversations, and discovered a quiet love that felt like home. Now they begin forever with your blessings.",
  events: [
    ["10 Dec", "Engagement", "7:00 PM", "Crystal Ballroom"],
    ["11 Dec", "Mehendi", "4:00 PM", "Lotus Courtyard"],
    ["12 Dec", "Haldi", "10:00 AM", "Poolside Pavilion"],
    ["13 Dec", "Sangeet", "7:30 PM", "Grand Saffron Lawn"],
    ["14 Dec", "Wedding", "10:30 AM Muhurtham", "Royal Mandap Hall"],
    ["14 Dec", "Reception", "7:30 PM", "Imperial Garden"]
  ],
  family: [
    ["Groom's Parents", "Rajesh & Kavita Sharma"],
    ["Bride's Parents", "Vikram & Ananya Rao"],
    ["Groom's Sibling", "Rhea Sharma"],
    ["Bride's Sibling", "Arjun Rao"]
  ],
  photos: ["", "", "", "", ""]
};

const storeKey = "editableWeddingInvitation";
let data = merge(defaults, JSON.parse(localStorage.getItem(storeKey) || "{}"));
let targetDate = parseDate(data.dateTime);

function merge(base, saved) {
  return {
    ...base,
    ...saved,
    events: base.events.map((row, i) => saved.events?.[i] || row),
    family: base.family.map((row, i) => saved.family?.[i] || row),
    photos: base.photos.map((photo, i) => saved.photos?.[i] || photo)
  };
}

function parseDate(value) {
  return new Date(`${value || defaults.dateTime}:00+05:30`);
}

function save() {
  localStorage.setItem(storeKey, JSON.stringify(data));
}

function text(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function applyData() {
  const couple = `${data.groom} & ${data.bride}`;
  targetDate = parseDate(data.dateTime);
  document.title = `${couple} | Royal Wedding Invitation`;
  text("logoText", `${(data.groom[0] || "G").toUpperCase()}&${(data.bride[0] || "B").toUpperCase()}`);
  text("groomName", data.groom);
  text("brideName", data.bride);
  text("dateText", data.dateText);
  text("venueText", data.venue);
  text("heroLine", `Request your presence as ${data.groom} and ${data.bride} begin a new life together.`);
  text("messageText", data.message);
  text("storyText", data.story);
  text("phoneText", `Bride: ${data.bridePhone} | Groom: ${data.groomPhone}`);
  text("venueTitle", data.venue);
  text("addressText", data.address);
  text("footerText", `With love, ${couple} and their families`);

  const eventGrid = document.getElementById("eventGrid");
  eventGrid.innerHTML = data.events.map((event, i) => `<article class="event-card ${i === 4 ? "featured" : ""}"><span>${event[0]}</span><h3>${event[1]}</h3><p>${event[2]}</p><p>${event[3]}</p></article>`).join("");

  const familyGrid = document.getElementById("familyGrid");
  familyGrid.innerHTML = data.family.map((member) => `<article class="family-card"><span>${member[0]}</span><strong>${member[1]}</strong></article>`).join("");

  const captions = ["Engagement Glow", "Mehendi Smiles", "Haldi Sunshine", "Sangeet Night", "Royal Reception"];
  const gallery = document.getElementById("galleryGrid");
  gallery.innerHTML = captions.map((caption, i) => `<figure class="photo-card" style="${data.photos[i] ? `background-image:linear-gradient(180deg,transparent,rgba(39,20,22,.58)),url('${data.photos[i]}')` : ""}"><span>${caption}</span></figure>`).join("");

  const mapQuery = encodeURIComponent(`${data.venue} ${data.address}`);
  document.getElementById("mapLink").href = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  document.getElementById("mapFrame").src = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  const phone = data.whatsapp.replace(/[^0-9]/g, "");
  const message = encodeURIComponent(`I am confirming my RSVP for ${couple}'s wedding at ${data.venue} on ${data.dateText}.`);
  document.getElementById("whatsappLink").href = `https://wa.me/${phone}?text=${message}`;
  document.getElementById("callLink").href = `tel:${(data.groomPhone || data.bridePhone).replace(/\s/g, "")}`;
}

function fillEditor() {
  const form = document.getElementById("customForm");
  ["bride", "groom", "dateTime", "dateText", "venue", "address", "bridePhone", "groomPhone", "whatsapp", "message", "story"].forEach((key) => {
    form.elements[key].value = data[key] || "";
  });

  document.getElementById("eventEditor").innerHTML = data.events.map((event, i) => `
    <div class="mini-card"><strong>${event[1]}</strong>
      <label>Date<input name="event-${i}-0" value="${event[0]}"></label>
      <label>Name<input name="event-${i}-1" value="${event[1]}"></label>
      <label>Time<input name="event-${i}-2" value="${event[2]}"></label>
      <label>Place<input name="event-${i}-3" value="${event[3]}"></label>
    </div>`).join("");

  document.getElementById("familyEditor").innerHTML = data.family.map((member, i) => `
    <div class="mini-card"><strong>${member[0]}</strong>
      <label>Relation<input name="family-${i}-0" value="${member[0]}"></label>
      <label>Name<input name="family-${i}-1" value="${member[1]}"></label>
    </div>`).join("");

  document.getElementById("photoEditor").innerHTML = ["Engagement", "Mehendi", "Haldi", "Sangeet", "Reception"].map((name, i) => `<label>${name} photo<input type="file" accept="image/*" data-photo="${i}"></label>`).join("");
}

function updateCountdown() {
  const diff = Math.max(0, targetDate - new Date());
  const total = Math.floor(diff / 1000);
  text("days", String(Math.floor(total / 86400)).padStart(3, "0"));
  text("hours", String(Math.floor((total % 86400) / 3600)).padStart(2, "0"));
  text("minutes", String(Math.floor((total % 3600) / 60)).padStart(2, "0"));
  text("seconds", String(total % 60).padStart(2, "0"));
}

document.getElementById("customizeTab").addEventListener("click", () => document.getElementById("customizer").classList.toggle("open"));

document.getElementById("customForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  ["bride", "groom", "dateTime", "dateText", "venue", "address", "bridePhone", "groomPhone", "whatsapp", "message", "story"].forEach((key) => data[key] = form.elements[key].value.trim());
  data.events = data.events.map((row, i) => row.map((_, j) => form.elements[`event-${i}-${j}`].value.trim()));
  data.family = data.family.map((row, i) => row.map((_, j) => form.elements[`family-${i}-${j}`].value.trim()));
  save();
  applyData();
  updateCountdown();
  document.getElementById("saveNote").textContent = "Saved. The invitation is updated on this browser.";
});

document.getElementById("photoEditor").addEventListener("change", (event) => {
  const input = event.target;
  if (!input.matches("input[type='file']") || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = () => {
    data.photos[Number(input.dataset.photo)] = String(reader.result);
    save();
    applyData();
  };
  reader.readAsDataURL(input.files[0]);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  localStorage.removeItem(storeKey);
  data = merge(defaults, {});
  save();
  window.location.reload();
});

document.getElementById("rsvpForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  document.getElementById("rsvpNote").textContent = `Thank you, ${form.get("name")}. Your RSVP has been noted.`;
  event.currentTarget.reset();
});

let audioContext, gainNode, timer, playing = false, note = 0;
const melody = [196, 261.63, 293.66, 329.63, 392, 329.63, 293.66, 261.63];
function setupAudio(){ if(audioContext) return; audioContext = new AudioContext(); gainNode = audioContext.createGain(); gainNode.gain.value = .55; gainNode.connect(audioContext.destination); }
function playNote(){ const now = audioContext.currentTime; const osc = audioContext.createOscillator(); const gain = audioContext.createGain(); osc.type = "triangle"; osc.frequency.value = melody[note]; gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(.075, now + .05); gain.gain.exponentialRampToValueAtTime(.001, now + 1.35); osc.connect(gain); gain.connect(gainNode); osc.start(now); osc.stop(now + 1.4); note = (note + 1) % melody.length; }
function startMusic(){ setupAudio(); audioContext.resume(); playing = true; document.querySelector(".music").classList.add("playing"); text("musicStatus", "Playing softly"); playNote(); timer = setInterval(playNote, 900); }
function stopMusic(){ playing = false; clearInterval(timer); document.querySelector(".music").classList.remove("playing"); text("musicStatus", "Tap to play"); }
document.getElementById("musicToggle").addEventListener("click", () => playing ? stopMusic() : startMusic());

function openCard(){ const opening = document.getElementById("opening"); if(opening.classList.contains("opening-now")) return; opening.classList.add("opening-now"); document.getElementById("openCard").textContent = "Opening..."; setTimeout(() => { opening.classList.add("hidden"); document.body.classList.remove("locked"); if(!playing) startMusic(); }, 3100); }
document.getElementById("openCard").addEventListener("click", (event) => { event.stopPropagation(); openCard(); });
document.getElementById("opening").addEventListener("click", openCard);

fillEditor();
applyData();
updateCountdown();
setInterval(updateCountdown, 1000);
