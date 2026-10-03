/* ================================================================
   customer-dashboard.js — MechControl Customer Portal
   Written in Basic, Easy-to-Understand Vanilla JavaScript
   ================================================================ */

// Helper: Read jobs from browser storage
function getStoredJobs() {
  var data = localStorage.getItem("gms_jobs");
  if (data == null) {
    return [];
  }
  return JSON.parse(data);
}

// Helper: Save jobs to browser storage
function saveStoredJobs(list) {
  localStorage.setItem("gms_jobs", JSON.stringify(list));
}

// Startup
window.onload = function() {
  loadCustomerVehicleData();
  setupCustomerForms();
};

// ----------------------------------------------------------------
// 1. SECTION NAVIGATION (Dashboard, Book Service, Contact)
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
// 2. LOAD & DISPLAY VEHICLE LIVE TRACKING (From LocalStorage)
// ----------------------------------------------------------------
function loadCustomerVehicleData() {
  var container = document.getElementById("customerVehicleContainer");
  if (!container) return;

  var jobs = getStoredJobs();

  // If no jobs exist
  if (jobs.length == 0) {
    container.innerHTML = '<div class="mc-card text-center p-5 text-muted"><h5>No active vehicle in service.</h5><p class="small">Click "Book Service" in the top menu to schedule your vehicle check-up.</p></div>';
    return;
  }

  // Display the first vehicle (Customer's active vehicle)
  var job = jobs[0];

  // Update customer name header
  var nameEl = document.getElementById("custNameDisplay");
  if (nameEl) nameEl.innerText = job.customerName;

  // Calculate costs
  var extraCost = 0;
  var extraFindingsHtml = "";

  if (job.discoveredIssues && job.discoveredIssues.length > 0) {
    for (var i = 0; i < job.discoveredIssues.length; i++) {
      var issue = job.discoveredIssues[i];
      if (issue.approvalStatus == "approved") {
        extraCost += issue.estimatedCost;
      }

      var badgeHtml = '<span class="badge bg-warning text-dark">Awaiting Your Approval</span>';
      if (issue.approvalStatus == "approved") {
        badgeHtml = '<span class="badge bg-success">Approved by You</span>';
      } else if (issue.approvalStatus == "declined") {
        badgeHtml = '<span class="badge bg-danger">Declined by You</span>';
      }

      extraFindingsHtml += '<div class="d-flex justify-content-between align-items-center py-2 border-bottom small">';
      extraFindingsHtml += '  <div><strong>' + issue.description + '</strong><br><span class="text-muted">Extra Estimated Cost: ₹' + issue.estimatedCost + '</span></div>';
      extraFindingsHtml += '  <div class="text-end">' + badgeHtml;
      extraFindingsHtml += '    <div class="mt-1">';
      extraFindingsHtml += '      <button class="btn btn-sm btn-outline-success py-0 px-2 me-1" onclick="customerApproveIssue(' + issue.id + ', \'approved\')"><i class="bi bi-check-lg me-1"></i>Approve</button>';
      extraFindingsHtml += '      <button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="customerApproveIssue(' + issue.id + ', \'declined\')"><i class="bi bi-x-lg me-1"></i>Decline</button>';
      extraFindingsHtml += '    </div>';
      extraFindingsHtml += '  </div>';
      extraFindingsHtml += '</div>';
    }
  } else {
    extraFindingsHtml = '<div class="text-muted small">No unexpected problems found during mechanical inspection.</div>';
  }

  var grandTotal = job.baseCost + job.laborCost + extraCost;

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

  // Two columns: Problem & Mechanic
  html += '    <div class="row g-3 mb-3">';
  html += '      <div class="col-md-6">';
  html += '        <div class="p-3 bg-light rounded border h-100">';
  html += '          <small class="text-muted d-block fw-bold mb-1">YOUR SERVICE REQUEST</small>';
  html += '          <div class="text-dark">' + job.reportedIssue + '</div>';
  html += '          <div class="mt-2 text-muted small"><i class="bi bi-clock me-1"></i>Checked-in: ' + job.createdAt + '</div>';
  html += '        </div>';
  html += '      </div>';
  html += '      <div class="col-md-6">';
  html += '        <div class="p-3 bg-light rounded border h-100">';
  html += '          <small class="text-muted d-block fw-bold mb-1">YOUR DEDICATED MECHANIC</small>';
  html += '          <div class="fw-bold text-dark fs-6">' + job.mechanicName + '</div>';
  html += '          <div class="small text-muted mb-2">Certified Workshop Technician</div>';
  html += '          <a href="tel:9876543210" class="btn btn-sm btn-outline-success"><i class="bi bi-telephone-fill me-1"></i>Call Mechanic</a>';
  html += '        </div>';
  html += '      </div>';
  html += '    </div>';

  // Unexpected Mechanic Findings Box (Requirement 2)
  html += '    <div class="p-3 bg-warning-subtle border border-warning rounded mb-4">';
  html += '      <h6 class="fw-bold text-dark mb-1"><i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>Mechanic Discovered Additional Findings</h6>';
  html += '      <p class="text-muted small mb-2">Our technician discovered these defects during teardown. Please review and Approve or Decline:</p>';
  html += '      <div>' + extraFindingsHtml + '</div>';
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

  html += '  </div>'; // end p-4
  html += '</div>';

  container.innerHTML = html;
}

// ----------------------------------------------------------------
// 3. APPROVE OR DECLINE AN ISSUE AS CUSTOMER
// ----------------------------------------------------------------
function customerApproveIssue(issueId, newStatus) {
  var jobs = getStoredJobs();
  if (jobs.length == 0) return;

  var job = jobs[0];
  if (job.discoveredIssues) {
    for (var i = 0; i < job.discoveredIssues.length; i++) {
      if (job.discoveredIssues[i].id == issueId) {
        job.discoveredIssues[i].approvalStatus = newStatus;
        break;
      }
    }
  }

  saveStoredJobs(jobs);
  loadCustomerVehicleData();
  alert("Your response has been sent to the workshop mechanic!");
}

// ----------------------------------------------------------------
// 4. SHOW INVOICE MODAL
// ----------------------------------------------------------------
function showCustomerInvoice() {
  var jobs = getStoredJobs();
  if (jobs.length == 0) return;
  var job = jobs[0];

  var extraCost = 0;
  var extraRows = "";
  if (job.discoveredIssues) {
    for (var i = 0; i < job.discoveredIssues.length; i++) {
      var iss = job.discoveredIssues[i];
      if (iss.approvalStatus == "approved") {
        extraCost += iss.estimatedCost;
        extraRows += '<tr><td>Inspection Finding: ' + iss.description + '</td><td class="text-end">₹' + iss.estimatedCost.toLocaleString("en-IN") + '</td></tr>';
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
  html += '    <div class="col-6 text-end"><strong>Dedicated Mechanic:</strong><br>' + job.mechanicName + '<br>Status: <span class="badge bg-success">' + job.status.toUpperCase() + '</span></div>';
  html += '  </div>';
  html += '  <table class="table table-bordered">';
  html += '    <thead class="table-light small"><tr><th>Service Item / Spare Parts</th><th class="text-end">Cost</th></tr></thead>';
  html += '    <tbody>';
  html += '      <tr><td>Primary Repair: ' + job.reportedIssue + '</td><td class="text-end">₹' + job.baseCost.toLocaleString("en-IN") + '</td></tr>';
  html += '      <tr><td>Mechanic Labor & Inspection Charges</td><td class="text-end">₹' + job.laborCost.toLocaleString("en-IN") + '</td></tr>';
  html +=         extraRows;
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
// 5. BOOK A NEW SERVICE FORM SUBMIT
// ----------------------------------------------------------------
function setupCustomerForms() {
  var form = document.getElementById("bookServiceForm");
  if (!form) return;

  form.onsubmit = function(event) {
    event.preventDefault();

    var name = document.getElementById("bookName").value;
    var phone = document.getElementById("bookPhone").value;
    var type = document.getElementById("bookType").value;
    var model = document.getElementById("bookModel").value;
    var plate = document.getElementById("bookPlate").value.toUpperCase();
    var problem = document.getElementById("bookProblem").value;

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
