const apiKey = "AIzaSyDxT1IkB976AcN1gsjEDlOENQse5RB9JmI";
const adminKey = "jayasimha";
const liveDocUrl = `https://firestore.googleapis.com/v1/projects/weddind-card/databases/(default)/documents/weddingSites/main?key=${apiKey}`;
const statusText = document.getElementById("onlineStatus");
const saveButton = document.getElementById("saveLatestOnline");
const isAdmin = new URLSearchParams(location.search).get("admin") === adminKey;

function setStatus(message) {
  if (statusText) statusText.textContent = message;
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
    music: "",
    musicName: ""
  };
}

async function loadLatestOnline() {
  try {
    const response = await fetch(liveDocUrl, { cache: "no-store" });
    if (response.status === 404) {
      if (isAdmin) setStatus("No online invitation saved yet. Edit and click Save latest online.");
      return;
    }
    if (!response.ok) throw new Error(`load-${response.status}`);

    const doc = await response.json();
    const json = doc.fields?.invitationJson?.stringValue;
    if (!json) {
      if (isAdmin) setStatus("No online invitation saved yet. Edit and click Save latest online.");
      return;
    }

    window.weddingApp?.setData?.(JSON.parse(json));
    if (isAdmin) setStatus("Latest online invitation loaded. Edit and save when ready.");
  } catch (error) {
    console.error("Online invitation load failed", error);
    if (isAdmin) setStatus("Could not load online invitation. Check Firebase setup.");
  }
}

saveButton?.addEventListener("click", async () => {
  if (!isAdmin) return;
  try {
    setStatus("Saving latest invitation online...");
    const invitation = latestData();
    window.weddingApp?.setData?.(invitation);

    const response = await fetch(liveDocUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          adminKey: { stringValue: adminKey },
          invitationJson: { stringValue: JSON.stringify(invitation) },
          updatedAt: { timestampValue: new Date().toISOString() }
        }
      })
    });

    if (!response.ok) throw new Error(`save-${response.status}: ${await response.text()}`);
    setStatus("Saved online. The same guest link and QR now show these latest changes.");
  } catch (error) {
    console.error("Online invitation save failed", error);
    setStatus("Could not save online. Please try again.");
  }
});

loadLatestOnline();
