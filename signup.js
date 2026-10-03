/* ============================================================
   signup.js — MechControl Account Registration Logic
   Written in Basic, Easy-to-Understand Vanilla JavaScript
   ============================================================ */

// Seed default accounts if needed
function ensureDefaultUsersExist() {
  var data = localStorage.getItem("gms_users");
  var users = [];
  if (data != null && data != "") {
    users = JSON.parse(data);
  }

  var hasAdmin = false;
  var hasCustomer = false;

  for (var i = 0; i < users.length; i++) {
    if (users[i].email === "admin@mechcontrol.com") {
      hasAdmin = true;
    }
    if (users[i].email === "customer@mechcontrol.com") {
      hasCustomer = true;
    }
  }

  if (!hasAdmin) {
    users.push({
      name: "Ronak Tank (Admin)",
      phone: "9876543210",
      email: "admin@mechcontrol.com",
      password: "admin",
      role: "admin"
    });
  }

  if (!hasCustomer) {
    users.push({
      name: "Deep Sondagar (Customer)",
      phone: "9825012345",
      email: "customer@mechcontrol.com",
      password: "customer",
      role: "customer"
    });
  }

  localStorage.setItem("gms_users", JSON.stringify(users));
}

// Setup dedicated view for Admin vs Customer
function setupDedicatedSignup(role) {
  var roleInput = document.getElementById("selectedRole");
  if (roleInput) roleInput.value = role;

  var brandBadge = document.getElementById("brandRegBadge");
  var brandHeading = document.getElementById("brandRegHeading");
  var brandDesc = document.getElementById("brandRegDesc");

  var subBadge = document.getElementById("regSubBadge");
  var headerTitle = document.getElementById("regHeaderTitle");
  var headerSubtitle = document.getElementById("regHeaderSubtitle");

  var topLink = document.getElementById("topNavSignLink");
  var bottomLink = document.getElementById("bottomSignInLink");
  var switchPrompt = document.getElementById("switchRegPrompt");
  var switchLink = document.getElementById("switchRegLink");

  if (role === "admin") {
    document.title = "Admin Registration — MechControl";

    if (brandBadge) {
      brandBadge.innerText = "Workshop Admin";
      brandBadge.className = "badge bg-danger text-uppercase px-2 py-1 mb-2";
    }
    if (brandHeading) brandHeading.innerText = "Create Workshop Admin Account";
    if (brandDesc) brandDesc.innerText = "Register your Admin account to manage garage repairs, staff, and customer vehicle records.";

    if (subBadge) {
      subBadge.innerText = "Workshop Admin";
      subBadge.className = "badge bg-danger-subtle text-danger fw-bold text-uppercase px-2 py-1 mb-1";
    }
    if (headerTitle) headerTitle.innerText = "Create Admin Account";
    if (headerSubtitle) headerSubtitle.innerText = "Enter your details once to register as a Workshop Admin.";

    if (topLink) topLink.href = "signin.html?role=admin";
    if (bottomLink) bottomLink.href = "signin.html?role=admin";

    if (switchPrompt) switchPrompt.innerText = "Are you a Vehicle Customer?";
    if (switchLink) {
      switchLink.href = "signup.html?role=customer";
      switchLink.innerText = "Switch to Customer Registration →";
    }

  } else {
    // Default to Customer
    document.title = "Customer Registration — MechControl";

    if (brandBadge) {
      brandBadge.innerText = "Vehicle Customer";
      brandBadge.className = "badge bg-primary text-uppercase px-2 py-1 mb-2";
    }
    if (brandHeading) brandHeading.innerText = "Create Customer Account";
    if (brandDesc) brandDesc.innerText = "Register your account to track vehicle servicing, approve mechanic findings, and view invoices.";

    if (subBadge) {
      subBadge.innerText = "Vehicle Customer";
      subBadge.className = "badge bg-primary-subtle text-primary fw-bold text-uppercase px-2 py-1 mb-1";
    }
    if (headerTitle) headerTitle.innerText = "Create Customer Account";
    if (headerSubtitle) headerSubtitle.innerText = "Enter your details once to register as a Vehicle Customer.";

    if (topLink) topLink.href = "signin.html?role=customer";
    if (bottomLink) bottomLink.href = "signin.html?role=customer";

    if (switchPrompt) switchPrompt.innerText = "Workshop Owner or Supervisor?";
    if (switchLink) {
      switchLink.href = "signup.html?role=admin";
      switchLink.innerText = "Switch to Admin Registration →";
    }
  }
}

// On Page Load
window.onload = function() {
  ensureDefaultUsersExist();

  var urlParams = new URLSearchParams(window.location.search);
  var roleParam = urlParams.get("role");

  if (roleParam === "admin") {
    setupDedicatedSignup("admin");
  } else {
    setupDedicatedSignup("customer");
  }
};

// Toggle password visibility
var toggleBtn = document.getElementById("togglePassword");
var passInput = document.getElementById("password");
var eyeIcon = document.getElementById("eyeIcon");

if (toggleBtn && passInput && eyeIcon) {
  toggleBtn.onclick = function() {
    if (passInput.type === "password") {
      passInput.type = "text";
      eyeIcon.className = "bi bi-eye-slash";
    } else {
      passInput.type = "password";
      eyeIcon.className = "bi bi-eye";
    }
  };
}

// Show error message
function showError(message) {
  var errorBanner = document.getElementById("errorBanner");
  var errorMsgText = document.getElementById("errorMsgText");
  if (errorMsgText) errorMsgText.innerText = message;
  if (errorBanner) errorBanner.classList.add("visible");
}

// Hide error message
function hideError() {
  var errorBanner = document.getElementById("errorBanner");
  if (errorBanner) errorBanner.classList.remove("visible");
}

// Form Submission
var signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.onsubmit = function(event) {
    event.preventDefault();
    hideError();

    var nameVal = document.getElementById("fullName").value.trim();
    var phoneVal = document.getElementById("phone").value.trim();
    var emailVal = document.getElementById("email").value.trim().toLowerCase();
    var passVal = document.getElementById("password").value;
    var confVal = document.getElementById("confirmPassword").value;
    var termsOk = document.getElementById("terms").checked;

    var roleInput = document.getElementById("selectedRole");
    var selectedRole = (roleInput && roleInput.value === "admin") ? "admin" : "customer";

    // Validation checks
    if (nameVal.length < 2) {
      showError("Please enter your full name.");
      document.getElementById("fullName").focus();
      return;
    }

    if (phoneVal.length != 10) {
      showError("Please enter a valid 10-digit phone number.");
      document.getElementById("phone").focus();
      return;
    }

    if (emailVal.indexOf("@") == -1 || emailVal.indexOf(".") == -1) {
      showError("Please enter a valid email address.");
      document.getElementById("email").focus();
      return;
    }

    if (passVal.length < 4) {
      showError("Password must be at least 4 characters long.");
      document.getElementById("password").focus();
      return;
    }

    if (passVal !== confVal) {
      showError("Passwords do not match. Please re-enter.");
      document.getElementById("confirmPassword").focus();
      return;
    }

    if (!termsOk) {
      showError("You must agree to the Terms of Service & Privacy Policy.");
      return;
    }

    // Check if email already registered in localStorage
    var rawUsers = localStorage.getItem("gms_users");
    var usersList = [];
    if (rawUsers != null && rawUsers != "") {
      usersList = JSON.parse(rawUsers);
    }

    for (var i = 0; i < usersList.length; i++) {
      if (usersList[i].email.toLowerCase() === emailVal) {
        showError("This email is already registered! Please sign in with your email & password.");
        return;
      }
    }

    // Add new user
    var newUser = {
      name: nameVal,
      phone: phoneVal,
      email: emailVal,
      password: passVal,
      role: selectedRole
    };

    usersList.push(newUser);
    localStorage.setItem("gms_users", JSON.stringify(usersList));

    // Show success screen and redirect to signin.html with role
    var submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving Account...';
    }

    setTimeout(function() {
      signupForm.style.display = "none";
      var successMsg = document.getElementById("successMsg");
      if (successMsg) successMsg.style.display = "block";

      setTimeout(function() {
        window.location.href = "signin.html?role=" + selectedRole;
      }, 1200);
    }, 600);
  };
}
