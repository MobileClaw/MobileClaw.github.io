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

  const toggle = document.getElementById("langToggle");
  if (toggle) {
    toggle.addEventListener("click", toggleLang);
  }
});
