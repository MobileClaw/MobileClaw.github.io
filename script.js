function setLang(lang) {
  document.body.className = lang;
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  const toggle = document.getElementById("langToggle");
  if (toggle) {
    toggle.textContent = lang === "zh" ? "🌐 English" : "🌐 中文";
  }
  localStorage.setItem("mc-lang", lang);
}

function toggleLang() {
  setLang(document.body.className === "zh" ? "en" : "zh");
}

function setupDownloadModal() {
  const openButtons = document.querySelectorAll("[data-download-trigger='true']");
  const modal = document.getElementById("downloadModal");
  const closeButton = document.getElementById("downloadModalClose");
  const qrContainer = document.getElementById("downloadQrCode");
  const qrUrl = document.getElementById("downloadQrUrl");
  const directLink = document.getElementById("directApkLink");
  const apkUrl = "https://github.com/MobileClaw/MobileClaw/releases/latest/download/MobileClaw.apk";

  if (!openButtons.length || !modal || !closeButton || !qrContainer || !directLink) {
    return;
  }
  directLink.href = apkUrl;
  if (qrUrl) {
    qrUrl.textContent = apkUrl;
  }

  let qrReady = false;
  function ensureQr() {
    if (qrReady || typeof QRCode === "undefined") {
      return;
    }
    qrContainer.innerHTML = "";
    new QRCode(qrContainer, {
      text: apkUrl,
      width: 200,
      height: 200,
    });
    qrReady = true;
  }

  function openModal() {
    ensureQr();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });
  });
  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -6% 0px",
    }
  );

  items.forEach((item) => observer.observe(item));
}

function initLang() {
  const saved = localStorage.getItem("mc-lang");
  if (saved === "zh" || saved === "en") {
    setLang(saved);
    return;
  }
  const prefersZh = (navigator.language || "").toLowerCase().startsWith("zh");
  setLang(prefersZh ? "zh" : "en");
}

document.addEventListener("DOMContentLoaded", () => {
  initLang();
  setupReveal();
  setupDownloadModal();

  const toggle = document.getElementById("langToggle");
  if (toggle) {
    toggle.addEventListener("click", toggleLang);
  }
});
