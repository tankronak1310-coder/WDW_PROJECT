/* ============================================================
   signin.js — MechControl Sign-In Logic
   Handles: role tab switch, validation, localStorage login check
   ============================================================ */

// ── DOM References ──────────────────────────────────────────
const form        = document.getElementById('signinForm');
const submitBtn   = document.getElementById('submitBtn');
const successMsg  = document.getElementById('successMsg');
const errorBanner = document.getElementById('errorBanner');
const errorMsgEl  = document.getElementById('errorMsg');
const roleInput   = document.getElementById('selectedRole');

const fieldEmail    = document.getElementById('email');
const fieldPassword = document.getElementById('password');

// ── Role Tab Switching (Admin / Customer) ────────────────────
document.querySelectorAll('.role-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {

    // Remove active from all tabs
    document.querySelectorAll('.role-tab-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });

    // Set clicked tab as active
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    // Store the selected role ("admin" or "customer")
    roleInput.value = btn.dataset.role;

    // Clear any error message when switching role
    hideError();
  });
});

// ── Error Banner helpers ─────────────────────────────────────
function showError(msg) {
  errorMsgEl.textContent = msg;
  errorBanner.classList.add('visible');
}

function hideError() {
  errorBanner.classList.remove('visible');
}

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

// ── Per-field validators ─────────────────────────────────────
function validateEmail() {
  const ok = isValidEmail(fieldEmail.value);
  setValidity('grp-email', ok);
  return ok;
}

function validatePassword() {
  const ok = fieldPassword.value.length > 0;
  setValidity('grp-password', ok);
  return ok;
}

// ── Live validation on blur ──────────────────────────────────
fieldEmail.addEventListener('blur', validateEmail);
fieldPassword.addEventListener('blur', validatePassword);

// Clear error banner when user starts typing again
fieldEmail.addEventListener('input', hideError);
fieldPassword.addEventListener('input', hideError);

// ── Show / Hide password toggle ──────────────────────────────
const toggleBtn = document.getElementById('togglePassword');
const eyeIcon   = document.getElementById('eyeIcon');

if (toggleBtn && eyeIcon) {
  toggleBtn.addEventListener('click', () => {
    const hidden       = fieldPassword.type === 'password';
    fieldPassword.type = hidden ? 'text' : 'password';
    eyeIcon.className  = hidden ? 'bi bi-eye-slash' : 'bi bi-eye';
    toggleBtn.setAttribute('aria-label',   hidden ? 'Hide password' : 'Show password');
    toggleBtn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
  });
}

// ── localStorage helper with Demo Accounts ────────────────────
function getUsers() {
  let users = JSON.parse(localStorage.getItem('gms_users') || '[]');

  // Check if default demo admin exists
  const hasAdmin = users.some(u => u.email === 'admin@mechcontrol.com' || u.email === 'admin@garage.com');
  if (!hasAdmin) {
    users.push({
      name: 'Workshop Admin',
      email: 'admin@mechcontrol.com',
      password: 'admin',
      role: 'admin'
    });
  }

  // Check if default demo customer exists
  const hasCustomer = users.some(u => u.email === 'customer@mechcontrol.com' || u.email === 'alex@email.com');
  if (!hasCustomer) {
    users.push({
      name: 'Rahul Mehta',
      email: 'customer@mechcontrol.com',
      password: 'customer',
      role: 'customer'
    });
  }

  localStorage.setItem('gms_users', JSON.stringify(users));
  return users;
}

// ── Form Submit ──────────────────────────────────────────────
form.addEventListener('submit', e => {
  e.preventDefault();
  hideError();

  // Validate fields first
  const emailOk    = validateEmail();
  const passwordOk = validatePassword();

  if (!emailOk || !passwordOk) {
    const first = form.querySelector('.field-invalid input');
    if (first) first.focus();
    return;
  }

  const selectedRole  = roleInput.value; // "admin" or "customer"
  const enteredEmail  = fieldEmail.value.trim().toLowerCase();
  const enteredPass   = fieldPassword.value;

  // 1. Load users array from localStorage
  const users = getUsers();

  // 2. Find a matching user object
  const matchedUser = users.find(u =>
    u.email.toLowerCase() === enteredEmail &&
    u.password            === enteredPass  &&
    u.role                === selectedRole
  );

  // Show spinner while "checking"
  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Signing in…';

  setTimeout(() => {

    if (!matchedUser) {
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<i class="bi bi-box-arrow-in-right me-2" aria-hidden="true"></i>Sign In';
      showError('Invalid email, password, or role for ' + selectedRole.toUpperCase() + '. Please try again.');
      fieldPassword.focus();
      return;
    }

    // 3. Match found – show success screen
    const isAdmin = matchedUser.role === 'admin';

    const successIcon    = document.getElementById('successIcon');
    const successHeading = document.getElementById('successHeading');
    const successSub     = document.getElementById('successSub');

    if (successIcon) {
      successIcon.className = `bi ${isAdmin ? 'bi-shield-check-fill text-danger' : 'bi-person-check-fill text-success'} success-icon`;
    }
    if (successHeading) {
      successHeading.textContent = `Welcome back, ${matchedUser.name}!`;
    }
    if (successSub) {
      successSub.textContent = `Signed in as ${isAdmin ? 'Admin' : 'Customer'} — loading your MechControl dashboard…`;
    }

    form.style.display       = 'none';
    successMsg.style.display = 'block';
    successMsg.focus();

    // Redirect to the correct dashboard after 1 second
    setTimeout(() => {
      window.location.href = isAdmin
        ? 'admin-dashboard.html'
        : 'customer-dashboard.html';
    }, 1000);

  }, 800);
});
