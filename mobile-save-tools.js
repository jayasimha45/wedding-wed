(function setupMobileOnlineSaveTools() {
  function compressPhoto(source, maxSize, quality) {
    if (!String(source || "").startsWith("data:image/")) return Promise.resolve(source);
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        try {
          const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext("2d");
          context.fillStyle = "#fffdf8";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch (error) {
          resolve(source);
        }
      };
      image.onerror = () => resolve(source);
      image.src = source;
    });
  }

  async function compressInvitationPhotos(invitation, maxSize, quality) {
    const compact = { ...invitation, photos: [] };
    for (const photo of invitation.photos || []) {
      compact.photos.push(await compressPhoto(photo, maxSize, quality));
    }
    compact.groomPhoto = await compressPhoto(invitation.groomPhoto || "", maxSize, quality);
    compact.bridePhoto = await compressPhoto(invitation.bridePhoto || "", maxSize, quality);
    return compact;
  }

  async function compact(invitation) {
    let compactInvitation = await compressInvitationPhotos(invitation, 420, 0.62);
    if (JSON.stringify(compactInvitation).length > 680000) {
      compactInvitation = await compressInvitationPhotos(compactInvitation, 320, 0.5);
    }
    if (JSON.stringify(compactInvitation).length > 850000) {
      throw new Error("INVITATION_TOO_LARGE");
    }
    return compactInvitation;
  }

  function message(error) {
    const detail = String(error?.message || error || "");
    if (!navigator.onLine) return "No internet connection. Connect the phone and try again.";
    if (/LOGIN_REQUIRED|SESSION|save-401|save-403/i.test(detail)) {
      return "Admin login expired. Sign out, sign in again, then save.";
    }
    if (/INVITATION_TOO_LARGE|save-400|maximum size|too large/i.test(detail)) {
      return "The photos are too large. Remove one photo or choose smaller photos, then save.";
    }
    return "Could not save online. Check the phone internet and try again.";
  }

  window.weddingMobileSave = { compact, message };
})();
