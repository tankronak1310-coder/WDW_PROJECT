/* ================================================================
   customer-dashboard.js ΓÇö Garage Management System
   Handles: SPA navigation, active nav link, contact form validation
================================================================ */


/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
   1. SPA NAVIGATION
   Shows/hides sections without reloading the page.
   Each nav link has data-section="dashboard" or "contact".
ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

// All navigable sections
const sections = {
  dashboard : document.getElementById('section-dashboard'),
  contact   : document.getElementById('section-contact'),
};

// All nav links (including the brand logo)
const navLinks = document.querySelectorAll('[data-section]');

/**
 * Show the requested section, hide all others,
 * and update the active state on nav links.
 * @param {string} sectionKey - "dashboard" or "contact"
 */
function navigateTo(sectionKey) {
  // Guard: ignore unknown keys
  if (!sections[sectionKey]) return;

  // Hide every section, show the target
  Object.entries(sections).forEach(([key, el]) => {
    el.classList.toggle('d-none', key !== sectionKey);
  });

  // Update active class on nav links
  navLinks.forEach(link => {
    const isActive = link.dataset.section === sectionKey;
    link.classList.toggle('active', isActive);
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  // Scroll to top of main content smoothly
  document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Close mobile nav if open
  const navCollapse = document.getElementById('navMenu');
  if (navCollapse.classList.contains('show')) {
    // Use Bootstrap's Collapse API to close it
    const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
    if (bsCollapse) bsCollapse.hide();
  }
}

// Attach click listeners to all data-section links
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(link.dataset.section);
  });
});

// Handle browser back/forward if hash is present on load
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (sections[hash]) {
    navigateTo(hash);
  }
});


/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
   2. CONTACT FORM VALIDATION
   Validates name, email, and message before submitting.
ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */

const contactForm      = document.getElementById('contactForm');
const contactSuccess   = document.getElementById('contactSuccess');
const sendAnotherBtn   = document.getElementById('sendAnotherBtn');
const contactSubmitBtn = document.getElementById('contactSubmitBtn');

const cfName    = document.getElementById('contactName');
const cfEmail   = document.getElementById('contactEmail');
const cfMessage = document.getElementById('contactMessage');

// ΓöÇΓöÇ Helper: mark a field group valid or invalid ΓöÇΓöÇ
function setCValidity(groupId, isValid) {
  const grp = document.getElementById(groupId);
  if (!grp) return;
  grp.classList.toggle('field-invalid', !isValid);
  grp.classList.toggle('field-valid',   isValid);
}

// ΓöÇΓöÇ Helper: email format check ΓöÇΓöÇ
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());
}

// ΓöÇΓöÇ Per-field validators ΓöÇΓöÇ
function validateCName() {
  const ok = cfName.value.trim().length > 0;
  setCValidity('cgrp-name', ok);
  return ok;
}

function validateCEmail() {
  const ok = isValidEmail(cfEmail.value);
  setCValidity('cgrp-email', ok);
  return ok;
}

function validateCMessage() {
  const ok = cfMessage.value.trim().length >= 10;
  setCValidity('cgrp-message', ok);
  return ok;
}

// ΓöÇΓöÇ Live validation on blur ΓöÇΓöÇ
cfName   .addEventListener('blur', validateCName);
cfEmail  .addEventListener('blur', validateCEmail);
cfMessage.addEventListener('blur', validateCMessage);

// ΓöÇΓöÇ Form submission ΓöÇΓöÇ
contactForm.addEventListener('submit', e => {
  e.preventDefault();

  // Run all validators
  const allValid = [
    validateCName(),
    validateCEmail(),
    validateCMessage()
  ].every(Boolean);

  if (!allValid) {
    // Focus first invalid field
    const first = contactForm.querySelector('.field-invalid input, .field-invalid textarea');
    if (first) first.focus();
    return;
  }

  // Simulate sending (replace with real API call)
  contactSubmitBtn.disabled = true;
  contactSubmitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>SendingΓÇª';

  setTimeout(() => {
    // Hide form, show success message
    contactForm.style.display    = 'none';
    contactSuccess.classList.remove('d-none');
    contactSuccess.focus();
  }, 1000);
});

// ΓöÇΓöÇ "Send Another Message" resets form ΓöÇΓöÇ
sendAnotherBtn.addEventListener('click', () => {
  contactForm.reset();
  contactForm.style.display = '';
  contactSuccess.classList.add('d-none');

  // Clear all validation states
  contactForm.querySelectorAll('.field-invalid, .field-valid').forEach(el => {
    el.classList.remove('field-invalid', 'field-valid');
  });

  // Re-enable the submit button
  contactSubmitBtn.disabled = false;
  contactSubmitBtn.innerHTML =
    '<i class="bi bi-send-fill me-2" aria-hidden="true"></i>Send Message';

  cfName.focus();
});


/* ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
   3. SIGN OUT
   Clears any session data and redirects to signin page.
ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */
document.getElementById('signOutBtn').addEventListener('click', e => {
  e.preventDefault();
  // In a real app: clear session/token here
  // e.g. localStorage.removeItem('gms_loggedIn');
  window.location.href = 'signin.html';
});
