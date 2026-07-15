(function setupGalleryLightbox() {
  const gallery = document.getElementById("galleryGrid");
  if (!gallery || document.getElementById("galleryLightbox")) return;

  const lightbox = document.createElement("dialog");
  lightbox.className = "gallery-lightbox";
  lightbox.id = "galleryLightbox";
  lightbox.setAttribute("aria-label", "Large wedding photo");
  lightbox.innerHTML = `
    <button class="gallery-lightbox-close" type="button" aria-label="Close large photo">&times;</button>
    <img alt="Large wedding gallery photo" />
    <p></p>`;
  document.body.appendChild(lightbox);

  const image = lightbox.querySelector("img");
  const caption = lightbox.querySelector("p");
  const closeButton = lightbox.querySelector(".gallery-lightbox-close");

  function decorateCards() {
    gallery.querySelectorAll(".photo-card").forEach((card) => {
      const name = card.textContent.trim() || "Wedding";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Open ${name} photo`);
    });
  }

  function closeLightbox() {
    if (typeof lightbox.close === "function") lightbox.close();
    else lightbox.removeAttribute("open");
  }

  function openPhoto(card) {
    const cards = Array.from(gallery.querySelectorAll(".photo-card"));
    const index = cards.indexOf(card);
    const source = window.weddingApp?.getData()?.photos?.[index];
    if (index < 0 || !source) return;
    const name = card.textContent.trim() || "Wedding photo";
    image.src = source;
    image.alt = `${name} wedding photo`;
    caption.textContent = name;
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");
  }

  gallery.addEventListener("click", (event) => {
    const card = event.target.closest?.(".photo-card");
    if (card) openPhoto(card);
  });

  gallery.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest?.(".photo-card");
    if (!card) return;
    event.preventDefault();
    openPhoto(card);
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener("close", () => image.removeAttribute("src"));

  new MutationObserver(decorateCards).observe(gallery, { childList: true });
  decorateCards();
})();
