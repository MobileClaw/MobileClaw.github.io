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

function renderQrCode(container, text, options = {}) {
  if (!container || typeof QRCode === "undefined" || !text) {
    return false;
  }

  const {
    width = 200,
    height = 200,
  } = options;

  const levels = [
    QRCode.CorrectLevel?.L,
    QRCode.CorrectLevel?.M,
    QRCode.CorrectLevel?.Q,
    QRCode.CorrectLevel?.H,
  ].filter((level) => level !== undefined);

  for (const level of levels) {
    try {
      container.innerHTML = "";
      new QRCode(container, {
        text,
        width,
        height,
        correctLevel: level,
      });
      return true;
    } catch (error) {
      container.innerHTML = "";
      console.warn("QR generation retrying with another correction level:", error);
    }
  }

  container.innerHTML = '<p class="qr-error">QR code generation failed. Please copy the YAML text instead.</p>';
  return false;
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
    qrReady = renderQrCode(qrContainer, apkUrl, {
      width: 200,
      height: 200,
    });
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

function setupConfigTool() {
  const form = document.getElementById("configToolForm");
  const generateButton = document.getElementById("generateConfigQr");
  const copyButton = document.getElementById("copyConfigYaml");
  const preview = document.getElementById("configYamlPreview");
  const qrContainer = document.getElementById("configQrCode");

  if (!form || !generateButton || !copyButton || !preview || !qrContainer) {
    return;
  }

  const providerInputs = form.querySelectorAll("input[name='model_provider']");
  const wisewkBlock = form.querySelector("[data-provider-block='wisewk']");
  const customBlock = form.querySelector("[data-provider-block='custom']");
  const useWisewkBackup = document.getElementById("useWisewkBackup");
  const wisewkBackupBlock = document.getElementById("wisewkBackupBlock");
  const channelCheckboxes = {
    telegram: document.getElementById("channelTelegram"),
    zulip: document.getElementById("channelZulip"),
    lark: document.getElementById("channelLark"),
    weixin: document.getElementById("channelWeixin"),
  };

  function updateProviderVisibility() {
    const provider = form.querySelector("input[name='model_provider']:checked")?.value || "wisewk";
    if (wisewkBlock) wisewkBlock.classList.toggle("is-visible", provider === "wisewk");
    if (customBlock) customBlock.classList.toggle("is-visible", provider === "custom");
    if (wisewkBackupBlock) {
      wisewkBackupBlock.classList.toggle("is-visible", provider === "custom" && !!useWisewkBackup?.checked);
    }
  }

  function updateChannelVisibility() {
    Object.entries(channelCheckboxes).forEach(([channel, checkbox]) => {
      const block = form.querySelector(`[data-channel-block='${channel}']`);
      if (block) {
        block.classList.toggle("is-visible", !!checkbox?.checked);
      }
    });
  }

  function yamlLine(key, value, quote = true) {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    if (typeof value === "boolean") {
      return `${key}: ${value ? "true" : "false"}`;
    }
    return quote ? `${key}: "${String(value).replace(/"/g, '\\"')}"` : `${key}: ${value}`;
  }

  function buildYaml() {
    const provider = form.querySelector("input[name='model_provider']:checked")?.value || "wisewk";
    const lines = [];
    lines.push(yamlLine("model_provider", provider));

    if (provider === "wisewk") {
      lines.push(yamlLine("wisewk_key", document.getElementById("wisewkKey")?.value.trim()));
    } else {
      lines.push(yamlLine("use_custom_fm", document.getElementById("useCustomFm")?.checked, false));
      lines.push(yamlLine("custom_fm_url", document.getElementById("fmUrl")?.value.trim()));
      lines.push(yamlLine("custom_fm_key", document.getElementById("fmKey")?.value.trim()));
      lines.push(yamlLine("custom_fm_name", document.getElementById("fmName")?.value.trim()));
      lines.push(yamlLine("use_custom_gui_vlm", document.getElementById("useCustomGuiVlm")?.checked, false));
      lines.push(yamlLine("custom_gui_vlm_url", document.getElementById("guiVlmUrl")?.value.trim()));
      lines.push(yamlLine("custom_gui_vlm_key", document.getElementById("guiVlmKey")?.value.trim()));
      lines.push(yamlLine("custom_gui_vlm_name", document.getElementById("guiVlmName")?.value.trim()));
      lines.push(yamlLine("tavily_api_key", document.getElementById("tavilyApiKey")?.value.trim()));
      if (useWisewkBackup?.checked) {
        lines.push(yamlLine("wisewk_key", document.getElementById("wisewkBackupKey")?.value.trim()));
        lines.push(yamlLine("use_wisewk_service", true, false));
      }
    }

    const selectedChannels = Object.entries(channelCheckboxes)
      .filter(([, checkbox]) => checkbox?.checked)
      .map(([channel]) => channel);
    if (selectedChannels.length) {
      lines.push(yamlLine("chat_channels", selectedChannels.join(",")));
    }

    if (channelCheckboxes.telegram?.checked) {
      lines.push(yamlLine("chat_telegram_token", document.getElementById("telegramToken")?.value.trim()));
    }
    if (channelCheckboxes.zulip?.checked) {
      lines.push(yamlLine("chat_zulip_email", document.getElementById("zulipEmail")?.value.trim()));
      lines.push(yamlLine("chat_zulip_key", document.getElementById("zulipKey")?.value.trim()));
      lines.push(yamlLine("chat_zulip_site", document.getElementById("zulipSite")?.value.trim()));
    }
    if (channelCheckboxes.lark?.checked) {
      lines.push(yamlLine("chat_lark_app_id", document.getElementById("larkAppId")?.value.trim()));
      lines.push(yamlLine("chat_lark_app_secret", document.getElementById("larkAppSecret")?.value.trim()));
    }
    if (channelCheckboxes.weixin?.checked) {
      lines.push(yamlLine("chat_weixin_bot_token", document.getElementById("weixinBotToken")?.value.trim()));
    }

    return lines.filter(Boolean).join("\n");
  }

  function renderQr(content) {
    if (typeof QRCode === "undefined" || !content) {
      qrContainer.innerHTML = "";
      return;
    }
    renderQrCode(qrContainer, content, {
      width: 200,
      height: 200,
    });
  }

  function refreshOutput() {
    const yaml = buildYaml();
    preview.value = yaml;
    renderQr(yaml);
  }

  providerInputs.forEach((input) => input.addEventListener("change", updateProviderVisibility));
  useWisewkBackup?.addEventListener("change", updateProviderVisibility);
  Object.values(channelCheckboxes).forEach((checkbox) => checkbox?.addEventListener("change", updateChannelVisibility));

  generateButton.addEventListener("click", refreshOutput);
  copyButton.addEventListener("click", async () => {
    if (!preview.value.trim()) {
      refreshOutput();
    }
    if (navigator.clipboard && preview.value.trim()) {
      try {
        await navigator.clipboard.writeText(preview.value);
      } catch (error) {
        console.error("Failed to copy YAML:", error);
      }
    }
  });

  updateProviderVisibility();
  updateChannelVisibility();
  refreshOutput();
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

function setupScenarioSlider() {
  const slider = document.getElementById("scenarioSlider");
  const track = document.getElementById("scenarioTrack");
  const prevButton = document.getElementById("scenarioPrev");
  const nextButton = document.getElementById("scenarioNext");
  const dotsRoot = document.getElementById("scenarioDots");

  if (!slider || !track || !prevButton || !nextButton || !dotsRoot) {
    return;
  }

  const slides = Array.from(track.children);
  if (!slides.length) {
    return;
  }

  let currentIndex = 0;
  let autoplayTimer = null;
  let touchStartX = 0;
  let touchDeltaX = 0;
  const autoplayDelay = 4200;

  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "scenario-dot";
    dot.setAttribute("aria-label", `Go to scenario ${index + 1}`);
    dot.addEventListener("click", () => goTo(index));
    dotsRoot.appendChild(dot);
    return dot;
  });

  function update() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentIndex);
      dot.setAttribute("aria-current", index === currentIndex ? "true" : "false");
    });
  }

  function goTo(index) {
    currentIndex = (index + slides.length) % slides.length;
    update();
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = window.setInterval(() => {
      goTo(currentIndex + 1);
    }, autoplayDelay);
  }

  prevButton.addEventListener("click", () => goTo(currentIndex - 1));
  nextButton.addEventListener("click", () => goTo(currentIndex + 1));

  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", startAutoplay);

  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      goTo(currentIndex - 1);
    } else if (event.key === "ArrowRight") {
      goTo(currentIndex + 1);
    }
  });

  slider.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0]?.clientX || 0;
    touchDeltaX = 0;
    stopAutoplay();
  }, { passive: true });

  slider.addEventListener("touchmove", (event) => {
    touchDeltaX = (event.touches[0]?.clientX || 0) - touchStartX;
  }, { passive: true });

  slider.addEventListener("touchend", () => {
    if (Math.abs(touchDeltaX) > 48) {
      goTo(touchDeltaX > 0 ? currentIndex - 1 : currentIndex + 1);
    }
    startAutoplay();
  });

  slider.addEventListener("touchcancel", startAutoplay);

  update();
  startAutoplay();
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
  setupConfigTool();
  setupScenarioSlider();

  const toggle = document.getElementById("langToggle");
  if (toggle) {
    toggle.addEventListener("click", toggleLang);
  }
});
