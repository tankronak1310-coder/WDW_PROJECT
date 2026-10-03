/* ============================================================
   signin.js — MechControl Sign In Logic
   Written in Basic, Easy-to-Understand Vanilla JavaScript
   ============================================================ */

// Seed default accounts in localStorage for testing
function ensureDefaultAccounts() {
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

// Category / Role Tab Switching
function selectRole(role) {
  var tabAdmin = document.getElementById("tabAdmin");
  var tabCustomer = document.getElementById("tabCustomer");
  var roleInput = document.getElementById("selectedRole");
  var regLink = document.getElementById("registerRedirectLink");

  if (role === "customer") {
    if (tabAdmin) {
      tabAdmin.classList.remove("active");
      tabAdmin.setAttribute("aria-selected", "false");
    }
    if (tabCustomer) {
      tabCustomer.classList.add("active");
      tabCustomer.setAttribute("aria-selected", "true");
    }
    if (roleInput) roleInput.value = "customer";
    if (regLink) regLink.href = "signup.html?role=customer";
  } else {
    if (tabCustomer) {
      tabCustomer.classList.remove("active");
      tabCustomer.setAttribute("aria-selected", "false");
    }
    if (tabAdmin) {
      tabAdmin.classList.add("active");
      tabAdmin.setAttribute("aria-selected", "true");
    }
    if (roleInput) roleInput.value = "admin";
    if (regLink) regLink.href = "signup.html?role=admin";
  }

  hideError();
}

// On Page Load: setup tabs & query param check
window.onload = function() {
  ensureDefaultAccounts();

  var tabAdmin = document.getElementById("tabAdmin");
  var tabCustomer = document.getElementById("tabCustomer");

  if (tabAdmin) {
    tabAdmin.onclick = function() { selectRole("admin"); };
  }
  if (tabCustomer) {
    tabCustomer.onclick = function() { selectRole("customer"); };
  }

  // Check URL query parameters (e.g. signin.html?role=customer)
  var urlParams = new URLSearchParams(window.location.search);
  var roleParam = urlParams.get("role");
  if (roleParam === "customer" || roleParam === "admin") {
    selectRole(roleParam);
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

// Error handling helpers
function showError(msg) {
  var banner = document.getElementById("errorBanner");
  var msgEl = document.getElementById("errorMsg");
  if (msgEl) msgEl.innerText = msg;
  if (banner) banner.classList.add("visible");
}

function hideError() {
  var banner = document.getElementById("errorBanner");
  if (banner) banner.classList.remove("visible");
}

// Sign In Form Submission
var signinForm = document.getElementById("signinForm");
if (signinForm) {
  signinForm.onsubmit = function(event) {
    event.preventDefault();
    hideError();

    var emailField = document.getElementById("email");
    var passField = document.getElementById("password");
    var roleInput = document.getElementById("selectedRole");

    var enteredEmail = emailField.value.trim().toLowerCase();
    var enteredPassword = passField.value;
    var selectedRole = roleInput ? roleInput.value : "admin";

    if (enteredEmail === "") {
      showError("Please enter your registered email address.");
      emailField.focus();
      return;
    }

    if (enteredPassword === "") {
      showError("Please enter your password.");
      passField.focus();
      return;
    }

    // Read registered users from localStorage
    var data = localStorage.getItem("gms_users");
    var users = [];
    if (data != null && data != "") {
      users = JSON.parse(data);
    }

    // Find matching user with same email, password, and role
    var matchedUser = null;
    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      if (u.email.toLowerCase() === enteredEmail && u.password === enteredPassword && u.role === selectedRole) {
        matchedUser = u;
        break;
      }
    }

    var submitBtn = document.getElementById("submitBtn");

    if (matchedUser == null) {
      showError("Invalid email, password, or category for " + (selectedRole === "admin" ? "Workshop Admin" : "Vehicle Customer") + ". If you are new, please register first.");
      passField.focus();
      return;
    }

    // Disable button and show signing in state
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Signing in...';
    }

    // Store active session in localStorage
    localStorage.setItem("mc_current_user", JSON.stringify(matchedUser));

    // If logged in as admin, also store active admin name for customer dashboard to display
    if (matchedUser.role === "admin") {
      localStorage.setItem("mc_active_admin_name", matchedUser.name);
    }

    setTimeout(function() {
      // Display success card
      signinForm.style.display = "none";
      var successMsg = document.getElementById("successMsg");
      var successHeading = document.getElementById("successHeading");
      var successSub = document.getElementById("successSub");
      var successIcon = document.getElementById("successIcon");

      if (successHeading) {
        successHeading.innerText = "Welcome back, " + matchedUser.name + "!";
      }

      if (successSub) {
        successSub.innerText = "Signed in as " + (matchedUser.role === "admin" ? "Workshop Admin" : "Vehicle Customer") + " — loading your dashboard...";
      }

      if (successIcon) {
        successIcon.className = "bi " + (matchedUser.role === "admin" ? "bi-shield-check-fill text-danger" : "bi-person-check-fill text-success") + " success-icon";
      }

      if (successMsg) {
        successMsg.style.display = "block";
      }

      // Redirect to appropriate dashboard
      setTimeout(function() {
        if (matchedUser.role === "admin") {
          window.location.href = "admin-dashboard.html";
        } else {
          window.location.href = "customer-dashboard.html";
        }
      }, 1000);

    }, 600);
  };
}
