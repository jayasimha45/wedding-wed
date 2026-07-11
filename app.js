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
  photos: ["", "", "", "", ""],
  music: "",
  musicName: "",
  groomPhoto: "",
  bridePhoto: ""
};

const storeKey = "editableWeddingInvitation";
const pageParams = new URLSearchParams(location.search);
const isAdminEditor = pageParams.get("admin") === "jayasimha";
let data = merge(defaults, JSON.parse(localStorage.getItem(storeKey) || "{}"));
let targetDate = parseDate(data.dateTime);

function merge(base, saved) {
  return {
    ...base,
    ...saved,
    events: base.events.map((row, i) => saved.events?.[i] || row),
    family: base.family.map((row, i) => saved.family?.[i] || row),
    photos: base.photos.map((photo, i) => saved.photos?.[i] || photo),
    music: saved.music || base.music,
    musicName: saved.musicName || base.musicName,
    groomPhoto: saved.groomPhoto || base.groomPhoto,
    bridePhoto: saved.bridePhoto || base.bridePhoto
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
  text("groomPhotoName", data.groom);
  text("bridePhotoName", data.bride);
  applyCouplePhotos();

  const eventGrid = document.getElementById("eventGrid");
  eventGrid.innerHTML = data.events.map((event, i) => `<article class="event-card ${i === 4 ? "featured" : ""}"><span>${event[0]}</span><h3>${event[1]}</h3><p>${event[2]}</p><p>${event[3]}</p></article>`).join("");

  const familyGrid = document.getElementById("familyGrid");
  familyGrid.innerHTML = data.family.map((member) => `<article class="family-card"><span>${member[0]}</span><strong>${member[1]}</strong></article>`).join("");

  const captions = ["Engagement Glow", "Mehendi Smiles", "Haldi Sunshine", "Sangeet Night", "Royal Reception"];
  const gallery = document.getElementById("galleryGrid");
  gallery.innerHTML = captions.map((caption, i) => `<figure class="photo-card" style="${data.photos[i] ? `background-image:linear-gradient(180deg,transparent,rgba(39,20,22,.58)),url('${data.photos[i]}')` : ""}"><span>${caption}</span></figure>`).join("");

    const mapQuery = encodeURIComponent(`${data.venue} ${data.address}`);
  const mapLink = document.getElementById("mapLink");
  mapLink.href = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;
  mapLink.textContent = "Get Directions";
  document.getElementById("mapFrame").src = `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  const phone = data.whatsapp.replace(/[^0-9]/g, "");
  const websiteLink = "https://jayasimha45.github.io/wedding-wed/";
  const message = encodeURIComponent(`You are invited to ${couple}'s wedding at ${data.venue} on ${data.dateText}. Open the wedding website: ${websiteLink}`);
  document.getElementById("whatsappLink").href = `https://wa.me/${phone}?text=${message}`;
  document.getElementById("callLink").href = `tel:${(data.groomPhone || data.bridePhone).replace(/\s/g, "")}`;
  applyMusic();
  updateGuestQrCard();
}

function applyCouplePhotos() {
  const groomPortrait = document.getElementById("groomPortrait");
  const bridePortrait = document.getElementById("bridePortrait");
  const groomPhoto = document.getElementById("groomPhoto");
  const bridePhoto = document.getElementById("bridePhoto");
  if (data.groomPhoto) {
    groomPhoto.src = data.groomPhoto;
    groomPortrait.classList.remove("hidden");
  } else {
    groomPhoto.removeAttribute("src");
    groomPortrait.classList.add("hidden");
  }
  if (data.bridePhoto) {
    bridePhoto.src = data.bridePhoto;
    bridePortrait.classList.remove("hidden");
  } else {
    bridePhoto.removeAttribute("src");
    bridePortrait.classList.add("hidden");
  }
  document.getElementById("couplePortraits").classList.toggle("empty", !data.groomPhoto && !data.bridePhoto);
}

function applyMusic() {
  const player = document.getElementById("musicPlayer");
  const audio = document.getElementById("weddingAudio");
  const title = document.getElementById("musicTitle");
  const status = document.getElementById("musicStatus");
  if (!player || !audio) return;

  if (!data.music) {
    audio.pause();
    audio.removeAttribute("src");
    player.classList.add("hidden");
    player.classList.remove("playing");
    if (status) status.textContent = "Song added";
    return;
  }

  audio.src = data.music;
  title.textContent = data.musicName || "Wedding music";
  status.textContent = "Tap to play";
  player.classList.remove("hidden");
}

function fillEditor() {
  const form = document.getElementById("customForm");
  if (!form) return;
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

function resizeImage(file, maxSize = 520, quality = 0.72) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function readImageUpload(input, callback, maxSize = 520) {
  const file = input.files?.[0];
  if (!file) return;
  resizeImage(file, maxSize).then(callback);
}

document.getElementById("groomPhotoUpload").addEventListener("change", (event) => {
  readImageUpload(event.target, (image) => {
    data.groomPhoto = image;
    save();
    applyCouplePhotos();
    document.getElementById("saveNote").textContent = "Groom photo added near the names.";
  });
});

document.getElementById("bridePhotoUpload").addEventListener("change", (event) => {
  readImageUpload(event.target, (image) => {
    data.bridePhoto = image;
    save();
    applyCouplePhotos();
    document.getElementById("saveNote").textContent = "Bride photo added near the names.";
  });
});

document.getElementById("removeCouplePhotos").addEventListener("click", () => {
  data.groomPhoto = "";
  data.bridePhoto = "";
  save();
  applyCouplePhotos();
  document.getElementById("groomPhotoUpload").value = "";
  document.getElementById("bridePhotoUpload").value = "";
  document.getElementById("saveNote").textContent = "Couple photos removed.";
});

document.getElementById("musicUpload").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    data.music = String(reader.result);
    data.musicName = file.name;
    save();
    applyMusic();
    document.getElementById("saveNote").textContent = "Music added. Guests can tap play if they want to hear it.";
  };
  reader.readAsDataURL(file);
});

document.getElementById("removeMusic").addEventListener("click", () => {
  data.music = "";
  data.musicName = "";
  save();
  applyMusic();
  document.getElementById("musicUpload").value = "";
  document.getElementById("saveNote").textContent = "Music removed. The invitation is silent again.";
});

const weddingAudio = document.getElementById("weddingAudio");
const musicToggle = document.getElementById("musicToggle");
musicToggle.addEventListener("click", () => {
  if (!data.music) return;
  if (weddingAudio.paused) weddingAudio.play();
  else weddingAudio.pause();
});
weddingAudio.addEventListener("play", () => {
  document.getElementById("musicPlayer").classList.add("playing");
  document.getElementById("musicStatus").textContent = "Playing";
});
weddingAudio.addEventListener("pause", () => {
  document.getElementById("musicPlayer").classList.remove("playing");
  document.getElementById("musicStatus").textContent = "Tap to play";
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

function quickShareData() {
  return {
    ...data,
    photos: [],
    music: "",
    musicName: ""
  };
}

const publicWeddingSite = "https://jayasimha45.github.io/wedding-wed/";

function makeQuickShareLink() {
  return publicWeddingSite;
}

function makeBackupShareLink() {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(quickShareData()))));
  return `${publicWeddingSite}?invite=${encodeURIComponent(encoded)}`;
}

function setupAdminAccess() {
  const customizeButton = document.getElementById("customizeTab");
  const customizerPanel = document.getElementById("customizer");
  if (isAdminEditor) return;
  if (customizeButton) customizeButton.remove();
  if (customizerPanel) customizerPanel.remove();
}

function loadQuickShareFromUrl() {
  const invite = new URLSearchParams(location.search).get("invite");
  if (!invite) return;
  try {
    data = merge(defaults, JSON.parse(decodeURIComponent(escape(atob(invite)))));
    save();
  } catch (error) {
    document.getElementById("saveNote").textContent = "This shared invitation link could not be loaded.";
  }
}

const copyShareButton = document.getElementById("copyShareLink");
const showQrButton = document.getElementById("showQrCode");
const qrShare = document.getElementById("qrShare");
const qrImage = document.getElementById("qrImage");
const downloadQr = document.getElementById("downloadQr");
const guestQrImage = document.getElementById("guestQrImage");
const guestQrOpen = document.getElementById("guestQrOpen");
const onlineStatus = document.getElementById("onlineStatus");

function qrImageUrl(link) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=18&data=${encodeURIComponent(link)}`;
}

function updateGuestQrCard() {
  const link = makeQuickShareLink();
  const imageUrl = qrImageUrl(link);
  if (guestQrImage) guestQrImage.src = imageUrl;
  if (guestQrOpen) guestQrOpen.href = imageUrl;
}

function showQrForCurrentInvitation() {
  const link = makeQuickShareLink();
  const imageUrl = qrImageUrl(link);
  if (qrImage) qrImage.src = imageUrl;
  if (downloadQr) downloadQr.href = imageUrl;
  if (qrShare) qrShare.hidden = false;
  if (onlineStatus) onlineStatus.textContent = "QR scanner is ready. It opens the latest saved invitation.";
}

copyShareButton?.addEventListener("click", async () => {
  const link = makeQuickShareLink();
  showQrForCurrentInvitation();
  try {
    await navigator.clipboard.writeText(link);
    if (onlineStatus) onlineStatus.textContent = "Guest link copied. It always opens the latest saved invitation.";
  } catch (error) {
    if (onlineStatus) onlineStatus.textContent = link;
  }
});

showQrButton?.addEventListener("click", showQrForCurrentInvitation);

function openCard(){ const opening = document.getElementById("opening"); if(opening.classList.contains("opening-now")) return; opening.classList.add("opening-now"); document.getElementById("openCard").textContent = "Opening..."; setTimeout(() => { opening.classList.add("hidden"); document.body.classList.remove("locked"); }, 3100); }
document.getElementById("openCard").addEventListener("click", (event) => { event.stopPropagation(); openCard(); });
document.getElementById("opening").addEventListener("click", openCard);

window.weddingApp = {
  getData: () => data,
  setData: (newData) => {
    data = merge(defaults, newData || {});
    save();
    fillEditor();
    applyData();
    updateCountdown();
  },
  saveLocal: save,
  applyData,
  updateCountdown,
  makeBackupShareLink
};

loadQuickShareFromUrl();
setupAdminAccess();
updateGuestQrCard();
fillEditor();
applyData();
updateCountdown();
setInterval(updateCountdown, 1000);





