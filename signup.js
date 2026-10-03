/* ============================================================
   signup.js — MechControl Account Registration Logic
   Handles: registration, validation, localStorage storage,
            and automatic redirection to signin.html
   ============================================================ */

// DOM References
const form          = document.getElementById('signupForm');
const submitBtn     = document.getElementById('submitBtn');
const successMsg    = document.getElementById('successMsg');
const errorBanner   = document.getElementById('errorBanner');
const errorMsgText  = document.getElementById('errorMsgText');

const fieldFullName = document.getElementById('fullName');
const fieldEmail    = document.getElementById('email');
const fieldPhone    = document.getElementById('phone');
const fieldPassword = document.getElementById('password');
const fieldConfirm  = document.getElementById('confirmPassword');
const fieldTerms    = document.getElementById('terms');

// Helper: mark a field group valid or invalid
function setValidity(groupId, isValid) {
  const grp = document.getElementById(groupId);
  if (!grp) return;
  grp.classList.toggle('field-invalid', !isValid);
  grp.classList.toggle('field-valid',   isValid);
}

// Error banner helpers
function showError(msg) {
  if (errorMsgText) errorMsgText.textContent = msg;
  if (errorBanner) errorBanner.classList.add('visible');
}

function hideError() {
  if (errorBanner) errorBanner.classList.remove('visible');
}

// Helper: email format check
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());
}

// Helper: phone 10 digits check
function isValidPhone(val) {
  return /^\d{10}$/.test(val.trim());
}

// Restrict phone input to numbers only
if (fieldPhone) {
  fieldPhone.addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
    hideError();
  });
}

// Show/Hide password toggle
const toggleBtn = document.getElementById('togglePassword');
const eyeIcon   = document.getElementById('eyeIcon');
if (toggleBtn && eyeIcon && fieldPassword) {
  toggleBtn.addEventListener('click', () => {
    const hidden = fieldPassword.type === 'password';
    fieldPassword.type = hidden ? 'text' : 'password';
    eyeIcon.className  = hidden ? 'bi bi-eye-slash' : 'bi bi-eye';
  });
}

// Read users from localStorage
function getStoredUsers() {
  return JSON.parse(localStorage.getItem('gms_users') || '[]');
}

// Form Submission
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    hideError();

    // 1. Validation
    const nameVal  = fieldFullName.value.trim();
    const emailVal = fieldEmail.value.trim().toLowerCase();
    const phoneVal = fieldPhone.value.trim();
    const passVal  = fieldPassword.value;
    const confVal  = fieldConfirm.value;
    const termsOk  = fieldTerms.checked;

    const nameOk  = nameVal.length >= 2;
    const emailOk = isValidEmail(emailVal);
    const phoneOk = isValidPhone(phoneVal);
    const passOk  = passVal.length >= 6;
    const confOk  = confVal === passVal && confVal.length > 0;

    setValidity('grp-name', nameOk);
    setValidity('grp-email', emailOk);
    setValidity('grp-phone', phoneOk);
    setValidity('grp-password', passOk);
    setValidity('grp-confirm', confOk);
    setValidity('grp-terms', termsOk);

    if (!nameOk || !emailOk || !phoneOk || !passOk || !confOk || !termsOk) {
      showError('Please correct the highlighted fields before submitting.');
      return;
    }

    // Get selected role
    const roleRadio = document.querySelector('input[name="role"]:checked');
    const selectedRole = roleRadio ? roleRadio.value : 'customer';

    // 2. Check if email already registered
    const existingUsers = getStoredUsers();
    const duplicate = existingUsers.find(u => u.email.toLowerCase() === emailVal);

    if (duplicate) {
      showError('This email is already registered! Please sign in with your email & password.');
      setValidity('grp-email', false);
      fieldEmail.focus();
      return;
    }

    // 3. Save new user object
    const newUser = {
      name: nameVal,
      email: emailVal,
      phone: phoneVal,
      role: selectedRole,
      password: passVal,
      registeredAt: new Date().toLocaleDateString()
    };

    existingUsers.push(newUser);
    localStorage.setItem('gms_users', JSON.stringify(existingUsers));

    // 4. Show success screen & redirect to signin.html
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating Account…';

    setTimeout(() => {
      form.style.display = 'none';
      successMsg.style.display = 'block';

      // Redirect to signin.html with the registered role pre-selected!
      setTimeout(() => {
        window.location.href = 'signin.html?role=' + selectedRole;
      }, 1200);
    }, 600);

  });
}
