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

// Configure page according to role parameter (Admin vs Customer)
function setupDedicatedRole(role) {
  var roleInput = document.getElementById("selectedRole");
  if (roleInput) roleInput.value = role;

  var brandBadge = document.getElementById("brandRoleBadge");
  var brandHeading = document.getElementById("brandHeading");
  var brandDesc = document.getElementById("brandDesc");

  var f1Title = document.getElementById("feature1Title");
  var f1Desc = document.getElementById("feature1Desc");
  var f2Title = document.getElementById("feature2Title");
  var f2Desc = document.getElementById("feature2Desc");

  var topBadge = document.getElementById("topRegBadge");
  var topTitle = document.getElementById("topRegTitle");
  var topDesc = document.getElementById("topRegDesc");
  var topBtn = document.getElementById("topRegisterBtn");

  var loginTitle = document.getElementById("loginHeaderTitle");
  var loginSub = document.getElementById("loginHeaderSubtitle");

  var bottomRegLink = document.getElementById("bottomRegisterLink");
  var switchPrompt = document.getElementById("switchCategoryPrompt");
  var switchLink = document.getElementById("switchCategoryLink");

  if (role === "admin") {
    document.title = "Admin Sign In — MechControl";

    if (brandBadge) {
      brandBadge.innerText = "Workshop Admin";
      brandBadge.className = "badge bg-danger text-uppercase px-2 py-1 mb-2";
    }
    if (brandHeading) brandHeading.innerText = "Workshop Admin Floor Portal";
    if (brandDesc) brandDesc.innerText = "Sign in to manage mechanic duty rosters, live repair queues, and billing.";

    if (f1Title) f1Title.innerText = "Mechanics Duty Floor";
    if (f1Desc) f1Desc.innerText = "Monitor on-duty staff, assign vehicles, and balance repair workloads.";
    if (f2Title) f2Title.innerText = "Inspection Approvals";
    if (f2Desc) f2Desc.innerText = "Report unexpected defects to vehicle owners for instant customer approval.";

    if (topBadge) topBadge.innerText = "New Admin?";
    if (topTitle) topTitle.innerText = "First Time Workshop Admin?";
    if (topDesc) topDesc.innerText = "If you have not registered your Admin profile yet, please register first.";
    if (topBtn) {
      topBtn.href = "signup.html?role=admin";
      topBtn.innerHTML = '<i class="bi bi-person-plus-fill me-1"></i> Register as Admin &rarr;';
    }

    if (loginTitle) loginTitle.innerText = "Workshop Admin Sign In";
    if (loginSub) loginSub.innerText = "Enter your registered Admin email and password to access the floor console.";

    if (bottomRegLink) bottomRegLink.href = "signup.html?role=admin";
    if (switchPrompt) switchPrompt.innerText = "Are you a Vehicle Customer?";
    if (switchLink) {
      switchLink.href = "signin.html?role=customer";
      switchLink.innerText = "Switch to Customer Portal →";
    }

  } else {
    // Default to Customer
    document.title = "Customer Sign In — MechControl";

    if (brandBadge) {
      brandBadge.innerText = "Vehicle Customer";
      brandBadge.className = "badge bg-primary text-uppercase px-2 py-1 mb-2";
    }
    if (brandHeading) brandHeading.innerText = "Vehicle Service & Repair Portal";
    if (brandDesc) brandDesc.innerText = "Sign in to follow live repairs, review mechanic findings, and view bills.";

    if (f1Title) f1Title.innerText = "Live Repair Stages";
    if (f1Desc) f1Desc.innerText = "Follow your vehicle live from check-in to ready for pickup.";
    if (f2Title) f2Title.innerText = "Defect Approval";
    if (f2Desc) f2Desc.innerText = "Accept or decline extra mechanic findings directly from your phone or PC.";

    if (topBadge) topBadge.innerText = "New Customer?";
    if (topTitle) topTitle.innerText = "First Time Vehicle Customer?";
    if (topDesc) topDesc.innerText = "If you have not created your account yet, please register first.";
    if (topBtn) {
      topBtn.href = "signup.html?role=customer";
      topBtn.innerHTML = '<i class="bi bi-person-plus-fill me-1"></i> Register as Customer &rarr;';
    }

    if (loginTitle) loginTitle.innerText = "Vehicle Customer Sign In";
    if (loginSub) loginSub.innerText = "Enter your registered customer email and password to view your vehicle.";

    if (bottomRegLink) bottomRegLink.href = "signup.html?role=customer";
    if (switchPrompt) switchPrompt.innerText = "Workshop Owner or Supervisor?";
    if (switchLink) {
      switchLink.href = "signin.html?role=admin";
      switchLink.innerText = "Switch to Admin Portal →";
    }
  }
}

// On Page Load
window.onload = function() {
  ensureDefaultAccounts();

  var urlParams = new URLSearchParams(window.location.search);
  var role = urlParams.get("role");

  if (role === "admin") {
    setupDedicatedRole("admin");
  } else {
    setupDedicatedRole("customer");
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
    var selectedRole = roleInput ? roleInput.value : "customer";

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
      var roleName = (selectedRole === "admin") ? "Workshop Admin" : "Vehicle Customer";
      showError("Invalid email or password for " + roleName + ". If you have not registered yet, please click 'Register First' above.");
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
