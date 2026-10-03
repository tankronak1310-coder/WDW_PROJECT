/* ============================================================
   signup.js — Garage Management System
   Handles: user registration, validation, localStorage storage
   ============================================================ */

// ── DOM References ──────────────────────────────────────────
const form          = document.getElementById('signupForm');
const submitBtn     = document.getElementById('submitBtn');
const successMsg    = document.getElementById('successMsg');
const roleDescEl    = document.getElementById('roleDesc');

const fieldFullName = document.getElementById('fullName');
const fieldEmail    = document.getElementById('email');
const fieldPhone    = document.getElementById('phone');
const fieldPassword = document.getElementById('password');
const fieldConfirm  = document.getElementById('confirmPassword');
const fieldTerms    = document.getElementById('terms');

// ── Role descriptions (shown when user picks a role) ────────
const roleDescriptions = {
  admin:    '<strong>Admin</strong> – Full access to manage the garage system, staff, bookings, and reports.',
  customer: '<strong>Customer</strong> – Book services, track your vehicle repairs, and view invoices.'
};

// Show description when a role pill is selected
document.querySelectorAll('input[name="role"]').forEach(radio => {
  radio.addEventListener('change', () => {
    roleDescEl.innerHTML = roleDescriptions[radio.value] || '';
    roleDescEl.classList.add('visible');
    validateRole();
  });
});

// ── Helper: mark a field group valid or invalid ──────────────
function setValidity(groupId, isValid) {
  const grp = document.getElementById(groupId);
  if (!grp) return;
  grp.classList.toggle('field-invalid', !isValid);
  grp.classList.toggle('field-valid',   isValid);
}

// ── Helper: email format check ───────────────────────────────
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());
}

// ── Helper: exactly 10 digits ────────────────────────────────
function isValidPhone(val) {
  return /^\d{10}$/.test(val.trim());
}

// ── Helper: get selected role value ─────────────────────────
function getRole() {
  const checked = document.querySelector('input[name="role"]:checked');
  return checked ? checked.value : '';
}

// ── Allow only digits while typing in phone field ───────────
fieldPhone.addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '');
});

// ── Per-field validators (return true = valid) ───────────────
function validateName() {
  const ok = fieldFullName.value.trim().length > 0;
  setValidity('grp-name', ok);
  return ok;
}

function validateEmail() {
  const ok = isValidEmail(fieldEmail.value);
  setValidity('grp-email', ok);
  return ok;
}

function validatePhone() {
  const ok = isValidPhone(fieldPhone.value);
  setValidity('grp-phone', ok);
  return ok;
}

function validateRole() {
  const ok = getRole() !== '';
  setValidity('grp-role', ok);
  return ok;
}

function validatePassword() {
  const ok = fieldPassword.value.length >= 8;
  setValidity('grp-password', ok);
  return ok;
}

function validateConfirm() {
  const ok = fieldConfirm.value === fieldPassword.value && fieldConfirm.value.length > 0;
  setValidity('grp-confirm', ok);
  return ok;
}

function validateTerms() {
  const ok = fieldTerms.checked;
  setValidity('grp-terms', ok);
  return ok;
}

// ── Live validation: fire when user leaves a field ───────────
fieldFullName.addEventListener('blur',   validateName);
fieldEmail   .addEventListener('blur',   validateEmail);
fieldPhone   .addEventListener('blur',   validatePhone);
fieldPassword.addEventListener('blur',   validatePassword);
fieldConfirm .addEventListener('blur',   validateConfirm);
fieldTerms   .addEventListener('change', validateTerms);

// Re-check confirm password whenever main password changes
fieldPassword.addEventListener('input', () => {
  if (fieldConfirm.value.length > 0) validateConfirm();
});

// ── Show / Hide password toggle ──────────────────────────────
function wireToggle(btnId, inputEl, iconId) {
  const btn  = document.getElementById(btnId);
  const icon = document.getElementById(iconId);

  btn.addEventListener('click', () => {
    const hidden   = inputEl.type === 'password';
    inputEl.type   = hidden ? 'text' : 'password';
    icon.className = hidden ? 'bi bi-eye-slash' : 'bi bi-eye';
    btn.setAttribute('aria-label',   hidden ? 'Hide password' : 'Show password');
    btn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
  });
}

wireToggle('togglePassword', fieldPassword, 'eyeIcon');
wireToggle('toggleConfirm',  fieldConfirm,  'eyeIconConfirm');

// ── localStorage helpers ─────────────────────────────────────

// Read the users array from localStorage (returns [] if nothing saved yet)
function getUsers() {
  return JSON.parse(localStorage.getItem('gms_users') || '[]');
}

// Save the updated users array back to localStorage
function saveUsers(users) {
  localStorage.setItem('gms_users', JSON.stringify(users));
}

// ── Form Submit ──────────────────────────────────────────────
form.addEventListener('submit', e => {
  e.preventDefault();

  // Run all validators
  const allValid = [
    validateName(),
    validateEmail(),
    validatePhone(),
    validateRole(),
    validatePassword(),
    validateConfirm(),
    validateTerms()
  ].every(Boolean);

  // If any field is invalid, focus the first bad one and stop
  if (!allValid) {
    const first = form.querySelector('.field-invalid input');
    if (first) first.focus();
    return;
  }

  // ── Step 1: Load existing users ──
  const users = getUsers();

  // ── Step 2: Check if email already registered ──
  const alreadyExists = users.find(
    u => u.email === fieldEmail.value.trim().toLowerCase()
  );

  if (alreadyExists) {
    setValidity('grp-email', false);
    document.getElementById('email-error').innerHTML =
      '<i class="bi bi-exclamation-circle me-1"></i>This email is already registered.';
    fieldEmail.focus();
    return;
  }

  // ── Step 3: Build the new user object ──
  const newUser = {
    name:     fieldFullName.value.trim(),
    email:    fieldEmail.value.trim().toLowerCase(),
    phone:    fieldPhone.value.trim(),
    role:     getRole(),            // "admin" or "customer"
    password: fieldPassword.value   // plain text — fine for demo/viva
  };

  // ── Step 4: Add to array and save ──
  users.push(newUser);
  saveUsers(users);

  // ── Step 5: Show success screen ──
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating account…';

  setTimeout(() => {
    form.style.display       = 'none';
    successMsg.style.display = 'block';
    successMsg.focus();
  }, 1000);
});
