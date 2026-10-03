/* ================================================================
   customer-dashboard.js — MechControl Customer Portal
   Written in Basic, Easy-to-Understand Vanilla JavaScript
   ================================================================ */

// ----------------------------------------------------------------
// 1. LOCALSTORAGE HELPERS
// ----------------------------------------------------------------
function getStoredJobs() {
  var data = localStorage.getItem("gms_jobs");
  if (data == null || data == "") {
    return [];
  }
  return JSON.parse(data);
}

function saveStoredJobs(list) {
  localStorage.setItem("gms_jobs", JSON.stringify(list));
}

// ----------------------------------------------------------------
// 2. STARTUP & DISPLAY NAMES (Requirement 2)
// ----------------------------------------------------------------
window.onload = function() {
  displayNames();
  loadCustomerVehicleData();
  setupCustomerForms();
};

function displayNames() {
  // Display Customer Name
  var custName = "Deep Sondagar (Customer)";
  var userStr = localStorage.getItem("mc_current_user");
  if (userStr != null && userStr != "") {
    var userObj = JSON.parse(userStr);
    if (userObj && userObj.name) {
      custName = userObj.name;
    }
  }

  var c1 = document.getElementById("custNameDisplay");
  if (c1) c1.innerText = custName;

  var c2 = document.getElementById("custNavName");
  if (c2) c2.innerText = custName;

  // Display Workshop Admin Name (Requirement 2: customer sees admin name)
  var adminName = localStorage.getItem("mc_active_admin_name");
  if (adminName == null || adminName == "") {
    adminName = "Ronak Tank (Admin)";
  }

  var a1 = document.getElementById("adminNameDisplay");
  if (a1) a1.innerText = adminName;

  var a2 = document.getElementById("adminNameDisplayContact");
  if (a2) a2.innerText = adminName;
}

// ----------------------------------------------------------------
// 3. TAB NAVIGATION (Dashboard, Book Service, Contact)
// ----------------------------------------------------------------
function showCustomerSection(sectionName) {
  var sections = document.querySelectorAll(".customer-section");
  for (var i = 0; i < sections.length; i++) {
    sections[i].classList.add("d-none");
  }

  var navLinks = document.querySelectorAll(".mc-nav-link");
  for (var j = 0; j < navLinks.length; j++) {
    navLinks[j].classList.remove("active");
  }

  var targetSec = document.getElementById("sec-" + sectionName);
  var targetNav = document.getElementById("nav-" + sectionName);

  if (targetSec) targetSec.classList.remove("d-none");
  if (targetNav) targetNav.classList.add("active");
}

// ----------------------------------------------------------------
// 4. LOAD & DISPLAY VEHICLE LIVE TRACKING (Requirement 2 & 3)
// ----------------------------------------------------------------
function loadCustomerVehicleData() {
  var container = document.getElementById("customerVehicleContainer");
  if (!container) return;

  var jobs = getStoredJobs();

  // If no jobs exist in storage
  if (jobs.length == 0) {
    container.innerHTML = '<div class="mc-card text-center p-5 text-muted"><h5>No active vehicle in service.</h5><p class="small">Click "Book Service" in the top menu to schedule your vehicle check-up.</p></div>';
    return;
  }

  // Find customer's job or fallback to the first job
  var userStr = localStorage.getItem("mc_current_user");
  var loggedInName = "Deep Sondagar";
  if (userStr != null && userStr != "") {
    var uObj = JSON.parse(userStr);
    if (uObj && uObj.name) {
      loggedInName = uObj.name;
    }
  }

  var job = jobs[0]; // Default to active vehicle

  // Sync customer name on job
  job.customerName = loggedInName;
  saveStoredJobs(jobs);

  var adminName = localStorage.getItem("mc_active_admin_name") || "Ronak Tank (Admin)";

  // ----------------------------------------------------------------
  // REQUIREMENT 3: ADDITIONAL PROBLEM MESSAGE LOGIC
  // If pending: show message with Accept / Decline
  // If accepted: directly increment cost
  // If declined: cost remains same
  // After whatever is selected: remove that message!
  // ----------------------------------------------------------------
  var pendingAlertHtml = "";
  var approvedExtraCost = 0;

  if (job.discoveredIssues && job.discoveredIssues.length > 0) {
    for (var i = 0; i < job.discoveredIssues.length; i++) {
      var iss = job.discoveredIssues[i];

      // If approved by customer, accumulate to cost
      if (iss.approvalStatus == "approved") {
        approvedExtraCost += iss.estimatedCost;
      }

      // Only show prompt message if status is "pending"
      if (iss.approvalStatus == "pending") {
        pendingAlertHtml += '<div class="alert alert-warning border-warning border-2 p-3 mb-4 rounded-3 shadow-sm" id="defectAlertBox">';
        pendingAlertHtml += '  <div class="d-flex align-items-start gap-3">';
        pendingAlertHtml += '    <span class="fs-2 text-warning"><i class="bi bi-exclamation-triangle-fill"></i></span>';
        pendingAlertHtml += '    <div class="w-100">';
        pendingAlertHtml += '      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-1">';
        pendingAlertHtml += '        <h5 class="fw-bold text-dark mb-0">Unexpected Defect Found by Workshop Mechanic!</h5>';
        pendingAlertHtml += '        <span class="badge bg-warning text-dark px-2 py-1"><i class="bi bi-hourglass-split me-1"></i>Awaiting Your Action</span>';
        pendingAlertHtml += '      </div>';
        pendingAlertHtml += '      <p class="text-muted small mb-2">Our workshop mechanic inspected your vehicle and found the following problem:</p>';
        pendingAlertHtml += '      <div class="p-3 bg-white rounded border mb-3">';
        pendingAlertHtml += '        <div class="fw-bold text-dark fs-6">' + iss.description + '</div>';
        pendingAlertHtml += '        <div class="text-muted small mt-1">Estimated Additional Repair Cost: <strong class="text-danger fs-6">₹' + iss.estimatedCost.toLocaleString("en-IN") + '</strong></div>';
        pendingAlertHtml += '      </div>';
        pendingAlertHtml += '      <div class="d-flex gap-2 flex-wrap">';
        pendingAlertHtml += '        <button class="btn btn-success btn-sm px-3 fw-bold" onclick="customerRespondToIssue(' + iss.id + ', \'accept\')">';
        pendingAlertHtml += '          <i class="bi bi-check-circle-fill me-1"></i> Accept (+₹' + iss.estimatedCost.toLocaleString("en-IN") + ')';
        pendingAlertHtml += '        </button>';
        pendingAlertHtml += '        <button class="btn btn-outline-danger btn-sm px-3 fw-bold" onclick="customerRespondToIssue(' + iss.id + ', \'decline\')">';
        pendingAlertHtml += '          <i class="bi bi-x-circle me-1"></i> Decline (Cost Remains Same)';
        pendingAlertHtml += '        </button>';
        pendingAlertHtml += '      </div>';
        pendingAlertHtml += '    </div>';
        pendingAlertHtml += '  </div>';
        pendingAlertHtml += '</div>';
      }
    }
  }

  // Calculate Grand Total Cost: Base + Labor + Approved Extra Cost
  var grandTotal = job.baseCost + job.laborCost + approvedExtraCost;

  // Status Badge
  var statusBadge = "bg-primary";
  var statusTitle = "Repair In Progress";
  if (job.status == "pending") { statusBadge = "bg-secondary"; statusTitle = "In Queue (Waiting Inspection)"; }
  else if (job.status == "awaiting-parts") { statusBadge = "bg-warning text-dark"; statusTitle = "Awaiting Specific Parts"; }
  else if (job.status == "ready") { statusBadge = "bg-success"; statusTitle = "Vehicle Ready for Pickup"; }
  else if (job.status == "completed") { statusBadge = "bg-dark"; statusTitle = "Service Completed & Delivered"; }

  // Vehicle Icon
  var vehicleIcon = "bi-bicycle";
  if (job.vehicleType == "Car") vehicleIcon = "bi-car-front-fill";
  if (job.vehicleType == "Scooter") vehicleIcon = "bi-moped";

  // Build the complete Customer Tracking Card HTML
  var html = "";

  // Insert the pending alert message (if any pending issue exists).
  // Once accepted or declined, pendingAlertHtml is empty, which completely removes the message!
  html += pendingAlertHtml;

  html += '<div class="mc-card p-0 overflow-hidden mb-4">';

  // Top header banner
  html += '  <div class="p-3 bg-dark text-white d-flex justify-content-between align-items-center flex-wrap gap-2">';
  html += '    <div class="d-flex align-items-center gap-2">';
  html += '      <span class="fs-4"><i class="bi ' + vehicleIcon + ' text-danger"></i></span>';
  html += '      <div>';
  html += '        <h5 class="fw-bold mb-0 text-white">' + job.vehicleModel + '</h5>';
  html += '        <span class="badge bg-warning text-dark font-monospace">' + job.plateNumber + '</span>';
  html += '      </div>';
  html += '    </div>';
  html += '    <div>';
  html += '      <span class="badge ' + statusBadge + ' fs-6 px-3 py-2">' + statusTitle + '</span>';
  html += '    </div>';
  html += '  </div>';

  html += '  <div class="p-4">';

  // Live Progress Track
  html += '    <div class="p-3 bg-light rounded border mb-4 text-center">';
  html += '      <div class="text-muted small mb-1">LIVE REPAIR PROGRESS</div>';
  html += '      <div class="progress my-2" style="height: 10px;">';
  html += '        <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" style="width: ' + job.progressPercent + '%;"></div>';
  html += '      </div>';
  html += '      <div class="d-flex justify-content-between small text-muted">';
  html += '        <span>Progress: <strong>' + job.progressPercent + '%</strong></span>';
  html += '        <span>Estimated Completion: <strong class="text-primary">' + job.estimatedDuration + '</strong></span>';
  html += '      </div>';
  html += '    </div>';

  // Two columns: Problem & Mechanic + Admin Supervisor
  html += '    <div class="row g-3 mb-4">';
  html += '      <div class="col-md-6">';
  html += '        <div class="p-3 bg-light rounded border h-100">';
  html += '          <small class="text-muted d-block fw-bold mb-1 text-uppercase">Primary Service Request</small>';
  html += '          <div class="text-dark">' + job.reportedIssue + '</div>';
  html += '          <div class="mt-2 text-muted small"><i class="bi bi-clock me-1"></i>Checked-in: ' + job.createdAt + '</div>';
  html += '        </div>';
  html += '      </div>';
  html += '      <div class="col-md-6">';
  html += '        <div class="p-3 bg-light rounded border h-100">';
  html += '          <small class="text-muted d-block fw-bold mb-1 text-uppercase">Assigned Workshop Mechanic</small>';
  html += '          <div class="fw-bold text-dark fs-6">' + job.mechanicName + '</div>';
  html += '          <div class="small text-muted mb-2">Certified Workshop Technician</div>';
  html += '          <div class="small text-muted pt-2 border-top"><i class="bi bi-shield-shaded text-danger me-1"></i>Workshop Floor Admin: <strong class="text-dark">' + adminName + '</strong></div>';
  html += '        </div>';
  html += '      </div>';
  html += '    </div>';

  // Cost and Invoice Row
  html += '    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-3 border-top">';
  html += '      <div>';
  html += '        <small class="text-muted d-block">TOTAL CURRENT ESTIMATE</small>';
  html += '        <h4 class="fw-bold text-dark mb-0">₹' + grandTotal.toLocaleString("en-IN") + ' <span class="badge bg-info text-dark" style="font-size: 11px;">' + job.paymentStatus + '</span></h4>';
  html += '      </div>';
  html += '      <div>';
  html += '        <button class="btn btn-mc-primary" onclick="showCustomerInvoice()"><i class="bi bi-receipt me-1"></i>View Full Invoice</button>';
  html += '      </div>';
  html += '    </div>';

  html += '  </div>';
  html += '</div>';

  container.innerHTML = html;
}

// ----------------------------------------------------------------
// 5. CUSTOMER ACTION ON ADDITIONAL PROBLEM (Requirement 3)
// ----------------------------------------------------------------
function customerRespondToIssue(issueId, action) {
  var jobs = getStoredJobs();
  if (jobs.length == 0) return;

  var job = jobs[0];

  if (job.discoveredIssues) {
    for (var i = 0; i < job.discoveredIssues.length; i++) {
      var item = job.discoveredIssues[i];

      if (item.id == issueId) {
        if (action === "accept") {
          // If accepted: mark approved -> directly increments total cost
          item.approvalStatus = "approved";
          alert("Additional repair accepted! ₹" + item.estimatedCost + " has been added to your total bill.");
        } else {
          // If declined: mark declined -> cost remains unchanged
          item.approvalStatus = "declined";
          alert("Additional repair declined. Total cost remains unchanged.");
        }
        break;
      }
    }
  }

  // Save changes to browser storage
  saveStoredJobs(jobs);

  // Reload view: Since approvalStatus is no longer "pending", the message is completely removed!
  loadCustomerVehicleData();
}

// ----------------------------------------------------------------
// 6. SHOW INVOICE MODAL
// ----------------------------------------------------------------
function showCustomerInvoice() {
  var jobs = getStoredJobs();
  if (jobs.length == 0) return;
  var job = jobs[0];

  var adminName = localStorage.getItem("mc_active_admin_name") || "Ronak Tank (Admin)";
  var extraCost = 0;
  var extraRows = "";

  if (job.discoveredIssues) {
    for (var k = 0; k < job.discoveredIssues.length; k++) {
      var iss = job.discoveredIssues[k];
      if (iss.approvalStatus == "approved") {
        extraCost += iss.estimatedCost;
        extraRows += "<tr><td>Approved Additional Work: " + iss.description + "</td><td class='text-end'>₹" + iss.estimatedCost.toLocaleString("en-IN") + "</td></tr>";
      }
    }
  }

  var total = job.baseCost + job.laborCost + extraCost;

  var html = '';
  html += '<div class="border p-4 bg-white rounded">';
  html += '  <div class="d-flex justify-content-between mb-3 border-bottom pb-2">';
  html += '    <h4 class="text-danger fw-bold"><i class="bi bi-gear-wide-connected me-2"></i>MechControl</h4>';
  html += '    <div class="text-end"><strong>Service Invoice #' + job.id + '</strong><div class="small text-muted">' + job.createdAt + '</div></div>';
  html += '  </div>';
  html += '  <div class="row mb-3 small">';
  html += '    <div class="col-6"><strong>Customer:</strong><br>' + job.customerName + '<br>Phone: ' + job.customerPhone + '<br>Vehicle: ' + job.vehicleModel + ' (' + job.plateNumber + ')</div>';
  html += '    <div class="col-6 text-end"><strong>Workshop Floor Admin:</strong><br>' + adminName + '<br>Mechanic: ' + job.mechanicName + '<br>Status: <span class="badge bg-success">' + job.status.toUpperCase() + '</span></div>';
  html += '  </div>';
  html += '  <table class="table table-bordered">';
  html += '    <thead class="table-light small"><tr><th>Service Item / Spares</th><th class="text-end">Cost</th></tr></thead>';
  html += '    <tbody>';
  html += '      <tr><td>Primary Repair & Servicing: ' + job.reportedIssue + '</td><td class="text-end">₹' + job.baseCost.toLocaleString("en-IN") + '</td></tr>';
  html += '      <tr><td>Mechanic Labor & Inspection Charges</td><td class="text-end">₹' + job.laborCost.toLocaleString("en-IN") + '</td></tr>';
  html +=        extraRows;
  html += '      <tr class="table-light fw-bold"><td>TOTAL BILL AMOUNT</td><td class="text-end text-danger">₹' + total.toLocaleString("en-IN") + '</td></tr>';
  html += '    </tbody>';
  html += '  </table>';
  html += '  <div class="text-center text-muted small p-2 bg-light rounded">All repairs are covered by MechControl 30-day warranty.</div>';
  html += '</div>';

  document.getElementById("customerInvoiceContent").innerHTML = html;
  var modalEl = document.getElementById("customerInvoiceModal");
  var modalInst = new bootstrap.Modal(modalEl);
  modalInst.show();
}

// ----------------------------------------------------------------
// 7. BOOK A NEW SERVICE FORM SUBMIT
// ----------------------------------------------------------------
function setupCustomerForms() {
  var form = document.getElementById("bookServiceForm");
  if (!form) return;

  form.onsubmit = function(event) {
    event.preventDefault();

    var name = document.getElementById("bookName").value.trim();
    var phone = document.getElementById("bookPhone").value.trim();
    var type = document.getElementById("bookType").value;
    var model = document.getElementById("bookModel").value.trim();
    var plate = document.getElementById("bookPlate").value.trim().toUpperCase();
    var problem = document.getElementById("bookProblem").value.trim();

    var jobs = getStoredJobs();
    var newJob = {
      id: "JOB-" + (100 + jobs.length + 1),
      customerName: name,
      customerPhone: phone,
      vehicleType: type,
      vehicleModel: model,
      plateNumber: plate,
      reportedIssue: problem,
      mechanicId: 1,
      mechanicName: "Rajesh Kumar",
      status: "pending",
      progressPercent: 10,
      estimatedDuration: "Awaiting Inspection",
      baseCost: 800,
      laborCost: 350,
      discoveredIssues: [],
      paymentStatus: "Unpaid",
      createdAt: "Just now"
    };

    // Add to start of jobs list
    jobs.unshift(newJob);
    saveStoredJobs(jobs);

    form.reset();
    alert("Success! Your service slot is booked. Our mechanic will inspect your vehicle shortly.");
    showCustomerSection("dashboard");
    loadCustomerVehicleData();
  };
}
