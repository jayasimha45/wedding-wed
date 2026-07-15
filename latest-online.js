const apiKey = "AIzaSyDxT1IkB976AcN1gsjEDlOENQse5RB9JmI";
const adminKey = "jayasimha";
const publicWeddingSite = "https://jayasimha45.github.io/wedding-wed/";
const firestoreDocuments = "https://firestore.googleapis.com/v1/projects/weddind-card/databases/(default)/documents";
const legacyDocUrl = `${firestoreDocuments}/weddingSites/main?key=${apiKey}`;
const registryDocUrl = `${firestoreDocuments}/weddingSites/invitationRegistry?key=${apiKey}`;

const params = new URLSearchParams(location.search);
const isAdmin = params.get("admin") === adminKey;
const currentInvitationId = params.get("wedding") || "";

const statusText = document.getElementById("onlineStatus");
const saveButton = document.getElementById("saveLatestOnline");
const invitationManager = document.getElementById("invitationManager");
const invitationSelect = document.getElementById("invitationSelect");
const newInvitationName = document.getElementById("newInvitationName");
const createInvitationButton = document.getElementById("createInvitation");
const openInvitationButton = document.getElementById("openInvitationAdmin");
const copySelectedButton = document.getElementById("copySelectedGuestLink");
const deleteInvitationButton = document.getElementById("deleteInvitation");

let invitationRegistry = [];

function setStatus(message) {
  if (statusText) statusText.textContent = message;
}

function invitationDocUrl(id) {
  return `${firestoreDocuments}/weddingSites/${encodeURIComponent(`invite-${id}`)}?key=${apiKey}`;
}

function guestLink(id = currentInvitationId) {
  return id ? `${publicWeddingSite}?wedding=${encodeURIComponent(id)}` : publicWeddingSite;
}

function adminLink(id = "") {
  const weddingPart = id ? `&wedding=${encodeURIComponent(id)}` : "";
  return `${publicWeddingSite}?admin=${encodeURIComponent(adminKey)}${weddingPart}`;
}

function slugify(value) {
  const slug = String(value || "wedding")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "wedding";
}

function editorValue(form, name, fallback = "") {
  return form?.elements?.[name]?.value?.trim() || fallback;
}

function editorData(current) {
  const form = document.getElementById("customForm");
  if (!form) return current;

  const next = {
    ...current,
    bride: editorValue(form, "bride", current.bride),
    groom: editorValue(form, "groom", current.groom),
    dateTime: editorValue(form, "dateTime", current.dateTime),
    dateText: editorValue(form, "dateText", current.dateText),
    venue: editorValue(form, "venue", current.venue),
    address: editorValue(form, "address", current.address),
    bridePhone: editorValue(form, "bridePhone", current.bridePhone),
    groomPhone: editorValue(form, "groomPhone", current.groomPhone),
    whatsapp: editorValue(form, "whatsapp", current.whatsapp),
    message: editorValue(form, "message", current.message),
    story: editorValue(form, "story", current.story)
  };

  next.events = (current.events || []).map((row, i) => row.map((value, j) => editorValue(form, `event-${i}-${j}`, value)));
  next.family = (current.family || []).map((row, i) => row.map((value, j) => editorValue(form, `family-${i}-${j}`, value)));
  return next;
}

function latestData() {
  const current = window.weddingApp?.getData?.() || {};
  const data = editorData(current);
  return {
    ...data,
    photos: Array.isArray(current.photos) ? current.photos : [],
    weddingPhoto: current.weddingPhoto || data.weddingPhoto || "",
    music: "",
    musicName: ""
  };
}

function invitationTitle(invitation = latestData()) {
  const groom = invitation.groom || "Groom";
  const bride = invitation.bride || "Bride";
  return `${groom} & ${bride}`;
}

async function parseInvitationResponse(response) {
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`load-${response.status}`);
  const doc = await response.json();
  const json = doc.fields?.invitationJson?.stringValue;
  return json ? JSON.parse(json) : null;
}

async function loadRegistry() {
  if (!isAdmin || !invitationManager) return;
  invitationManager.hidden = false;
  try {
    const response = await fetch(registryDocUrl, { cache: "no-store" });
    if (response.status !== 404) {
      if (!response.ok) throw new Error(`registry-load-${response.status}`);
      const doc = await response.json();
      const json = doc.fields?.invitationsJson?.stringValue;
      invitationRegistry = json ? JSON.parse(json) : [];
    }
  } catch (error) {
    console.error("Invitation registry load failed", error);
    setStatus("Could not load the saved invitation list.");
  }
  renderRegistry();
}

function renderRegistry() {
  if (!invitationSelect) return;
  invitationSelect.replaceChildren();
  invitationSelect.add(new Option("Main invitation", ""));

  invitationRegistry
    .slice()
    .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))
    .forEach((item) => invitationSelect.add(new Option(item.title || item.id, item.id)));

  if (currentInvitationId && !invitationRegistry.some((item) => item.id === currentInvitationId)) {
    invitationSelect.add(new Option("New invitation (not saved yet)", currentInvitationId));
  }
  invitationSelect.value = currentInvitationId;
  if (deleteInvitationButton) deleteInvitationButton.disabled = !invitationSelect.value;
}

async function saveRegistry() {
  const response = await window.weddingAdminAuth.authFetch(registryDocUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        invitationsJson: { stringValue: JSON.stringify(invitationRegistry) },
        updatedAt: { timestampValue: new Date().toISOString() }
      }
    })
  });
  if (!response.ok) throw new Error(`registry-save-${response.status}: ${await response.text()}`);
}

async function upsertRegistry(id, title) {
  const now = new Date().toISOString();
  invitationRegistry = invitationRegistry.filter((item) => item.id !== id);
  invitationRegistry.unshift({ id, title, updatedAt: now });
  await saveRegistry();
  renderRegistry();
}

async function loadLatestOnline() {
  try {
    const url = currentInvitationId ? invitationDocUrl(currentInvitationId) : legacyDocUrl;
    const response = await fetch(url, { cache: "no-store" });
    const invitation = await parseInvitationResponse(response);
    if (!invitation) {
      if (isAdmin) setStatus(currentInvitationId ? "New invitation ready. Edit it and click Save latest online." : "No main invitation saved yet.");
      return;
    }

    window.weddingApp?.setData?.(invitation);
    if (isAdmin) setStatus(`${invitationTitle(invitation)} loaded. Edit and save when ready.`);
  } catch (error) {
    console.error("Online invitation load failed", error);
    if (isAdmin) setStatus("Could not load this online invitation.");
  }
}

saveButton?.addEventListener("click", async () => {
  if (!isAdmin) return;
  try {
    setStatus("Preparing phone photos and saving online...");
    const invitation = await window.weddingMobileSave.compact(latestData());
    const title = invitationTitle(invitation);
    window.weddingApp?.setData?.(invitation);

    const response = await window.weddingAdminAuth.authFetch(currentInvitationId ? invitationDocUrl(currentInvitationId) : legacyDocUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          adminKey: { stringValue: adminKey },
          invitationId: { stringValue: currentInvitationId || "main" },
          title: { stringValue: title },
          invitationJson: { stringValue: JSON.stringify(invitation) },
          updatedAt: { timestampValue: new Date().toISOString() }
        }
      })
    });

    if (!response.ok) throw new Error(`save-${response.status}: ${await response.text()}`);
    if (currentInvitationId) await upsertRegistry(currentInvitationId, title);
    setStatus(`Saved online. This wedding has its own permanent guest link and QR.`);
  } catch (error) {
    console.error("Online invitation save failed", error);
    setStatus(window.weddingMobileSave.message(error));
  }
});

invitationSelect?.addEventListener("change", () => {
  if (deleteInvitationButton) deleteInvitationButton.disabled = !invitationSelect.value;
});

openInvitationButton?.addEventListener("click", () => {
  location.href = adminLink(invitationSelect?.value || "");
});

copySelectedButton?.addEventListener("click", async () => {
  const link = guestLink(invitationSelect?.value || "");
  try {
    await navigator.clipboard.writeText(link);
    setStatus("Selected guest link copied.");
  } catch (error) {
    setStatus(link);
  }
});

createInvitationButton?.addEventListener("click", async () => {
  if (!isAdmin) return;
  const requestedName = newInvitationName?.value?.trim() || "New wedding";
  const id = `${slugify(requestedName)}-${Date.now().toString(36).slice(-6)}`;
  try {
    await upsertRegistry(id, requestedName);
    location.href = adminLink(id);
  } catch (error) {
    console.error("Invitation creation failed", error);
    setStatus("Could not create the new invitation. Please try again.");
  }
});

deleteInvitationButton?.addEventListener("click", async () => {
  if (!isAdmin) return;
  const id = invitationSelect?.value || "";
  if (!id) {
    setStatus("The Main invitation cannot be deleted.");
    return;
  }
  const item = invitationRegistry.find((entry) => entry.id === id);
  if (!confirm(`Delete ${item?.title || id}? This cannot be undone.`)) return;

  try {
    setStatus("Deleting invitation...");
    const response = await window.weddingAdminAuth.authFetch(invitationDocUrl(id), { method: "DELETE" });
    if (!response.ok && response.status !== 404) throw new Error(`delete-${response.status}`);
    invitationRegistry = invitationRegistry.filter((entry) => entry.id !== id);
    await saveRegistry();
    localStorage.removeItem(`editableWeddingInvitation:${id}`);
    location.href = adminLink();
  } catch (error) {
    console.error("Invitation delete failed", error);
    setStatus("Could not delete this invitation.");
  }
});

async function initializeOnlineInvitations() {
  if (isAdmin) {
    const authorized = await window.weddingAdminAuth?.ready;
    if (!authorized) return;
    await loadRegistry();
  }
  await loadLatestOnline();
}

initializeOnlineInvitations();
