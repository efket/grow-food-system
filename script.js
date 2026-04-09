document.addEventListener("DOMContentLoaded", () => {
  // Smooth scroll for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") {
        return;
      }

      const target = document.querySelector(href);

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  // ── UTM / source attribution capture ────────────────────────────────────
  // Reads URL params on page load, populates hidden form fields,
  // persists to sessionStorage (first-touch: URL wins, fallback to stored).
  (function () {
    const p = new URLSearchParams(window.location.search);
    const SESSION_KEY = "gfs_utm";
    let stored = {};
    try { stored = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}"); } catch (e) {}

    const map = [
      ["f-utm-source",   "utm_source"],
      ["f-utm-medium",   "utm_medium"],
      ["f-utm-campaign", "utm_campaign"],
      ["f-utm-term",     "utm_term"],
      ["f-gclid",        "gclid"],
    ];

    const save = {};

    map.forEach(([id, key]) => {
      const val = p.get(key) || stored[key] || "";
      if (val) {
        save[key] = val;
        const el = document.getElementById(id);
        if (el) el.value = val;
      }
    });

    // landing_page: always the actual page path, never persisted across pages
    const lpEl = document.getElementById("f-landing-page");
    if (lpEl) lpEl.value = window.location.pathname;
    save.landing_page = window.location.pathname;

    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(save)); } catch (e) {}
  })();

  // Signup form — MailerLite integration
  const form = document.getElementById("signup-form");
  const success = document.getElementById("form-success");
  const submitBtn = form ? form.querySelector("button[type='submit']") : null;

  if (!form || !success || !submitBtn) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    try {
      await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        mode: "no-cors",
      });

      form.querySelectorAll(".field, .form-note").forEach((el) => {
        el.hidden = true;
      });
      submitBtn.textContent = "Sent!";
      success.hidden = false;
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
});
