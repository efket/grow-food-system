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
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

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
