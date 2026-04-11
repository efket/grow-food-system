document.addEventListener("DOMContentLoaded", () => {

  // ── Smooth scroll for anchor links ──────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  // ── CTA click tracking ───────────────────────────────────────────────────
  document.querySelectorAll("a[data-cta-location]").forEach((link) => {
    link.addEventListener("click", () => {
      gtag("event", "cta_click", { cta_location: link.dataset.ctaLocation });
    });
  });

  // ── UTM / source attribution capture ────────────────────────────────────
  // Reads URL params on page load, populates hidden fields in BOTH forms,
  // persists to sessionStorage (first-touch: URL wins, fallback to stored).
  (function () {
    const p = new URLSearchParams(window.location.search);
    const SESSION_KEY = "gfs_utm";
    let stored = {};
    try { stored = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}"); } catch (e) {}

    // Each UTM key maps to [lower-form-id, quick-optin-form-id]
    const UTM_MAP = [
      ["utm_source",   ["f-utm-source",   "h-utm-source"]],
      ["utm_medium",   ["f-utm-medium",   "h-utm-medium"]],
      ["utm_campaign", ["f-utm-campaign", "h-utm-campaign"]],
      ["utm_term",     ["f-utm-term",     "h-utm-term"]],
      ["gclid",        ["f-gclid",        "h-gclid"]],
    ];

    const save = {};

    UTM_MAP.forEach(([key, ids]) => {
      const val = p.get(key) || stored[key] || "";
      if (val) {
        save[key] = val;
        ids.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.value = val;
        });
      }
    });

    // landing_page: always the actual page path, populate both forms
    ["f-landing-page", "h-landing-page"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = window.location.pathname;
    });
    save.landing_page = window.location.pathname;

    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(save)); } catch (e) {}
  })();

  // ── Scroll depth tracking (25 / 50 / 75%) ───────────────────────────────
  (function () {
    const thresholds = [25, 50, 75];
    const fired = new Set();

    function getScrollPct() {
      const total = document.body.scrollHeight - window.innerHeight;
      return total > 0 ? Math.round((window.scrollY / total) * 100) : 0;
    }

    window.addEventListener("scroll", () => {
      const pct = getScrollPct();
      thresholds.forEach((t) => {
        if (pct >= t && !fired.has(t)) {
          fired.add(t);
          gtag("event", "scroll_depth", { depth_percent: t });
        }
      });
    }, { passive: true });
  })();

  // ── Form submit handler (shared) ─────────────────────────────────────────
  // hideSelector: CSS selector for elements to hide on success (within the form)
  function wireForm(formId, successId, gaEvent, hideSelector) {
    const form = document.getElementById(formId);
    const success = document.getElementById(successId);
    if (!form || !success) return;

    const submitBtn = form.querySelector("button[type='submit']");
    if (!submitBtn) return;

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

        gtag("event", gaEvent);
        gtag("event", "lead_form_submit"); // unified primary conversion for Google Ads bidding
        gtag("event", "conversion", { send_to: "AW-18057221634/Q2ssCPb7iZocEIKsraJD", value: 1.5, currency: "GBP" }); // GFS Lead Form Submit conversion action

        form.querySelectorAll(hideSelector).forEach((el) => { el.hidden = true; });
        submitBtn.hidden = true;
        success.hidden = false;
      } catch {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }

  // Quick opt-in (above fold): hide the row + note on success
  wireForm("quick-optin-form", "quick-optin-success", "quick_optin_submit", ".quick-optin-row, .quick-optin-note");

  // Lower full form: hide fields + form note on success
  wireForm("signup-form", "form-success", "lower_form_submit", ".field, .form-note");

});
