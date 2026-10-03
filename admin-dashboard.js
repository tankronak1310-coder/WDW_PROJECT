/* ================================================================
   admin-dashboard.js — MechControl Admin Dashboard
   Written in Basic, Easy-to-Understand Vanilla JavaScript
   ================================================================ */

// ----------------------------------------------------------------
// 1. DEFAULT DATA (Used if no data is stored in browser yet)
// ----------------------------------------------------------------
var DEFAULT_MECHANICS = [
  { id: 1, name: "Rajesh Kumar", phone: "98765-41122", specialty: "Bikes & Engines", status: "working" },
  { id: 2, name: "Vikram Sharma", phone: "98765-43344", specialty: "Brakes & Suspension", status: "working" },
  { id: 3, name: "Amit Patel", phone: "98765-45566", specialty: "Battery & Electrical", status: "working" },
  { id: 4, name: "Suresh Verma", phone: "98765-47788", specialty: "Oil & Tuning", status: "leave" },
  { id: 5, name: "Imran Khan", phone: "98765-49900", specialty: "Car AC & Cooling", status: "working" },
  { id: 6, name: "Manoj Rathod", phone: "98765-42233", specialty: "Denting & Painting", status: "leave" }
];

var DEFAULT_JOBS = [
  {
    id: "JOB-101",
    customerName: "Deep Sondagar",
    customerPhone: "9825012345",
    vehicleType: "Bike",
    vehicleModel: "Royal Enfield Classic 350",
    plateNumber: "GJ-01-EE-4512",
    reportedIssue: "Engine knocking noise and 10,000 km periodic service.",
    mechanicId: 1,
    mechanicName: "Rajesh Kumar",
    status: "repairing",
    progressPercent: 65,
    estimatedDuration: "Today by 5:30 PM",
    baseCost: 1850,
    laborCost: 650,
    discoveredIssues: [
      {
        id: 1,
        description: "Front brake pads heavily worn; rotor skim recommended.",
        estimatedCost: 850,
        approvalStatus: "pending"
      }
    ],
    paymentStatus: "Unpaid",
    createdAt: "Today 09:30 AM"
  },
  {
    id: "JOB-102",
    customerName: "Pooja Shah",
    customerPhone: "9898123456",
    vehicleType: "Scooter",
    vehicleModel: "Honda Activa 6G",
    plateNumber: "GJ-27-AK-7890",
    reportedIssue: "Self-starter not working and poor pickup.",
    mechanicId: 3,
    mechanicName: "Amit Patel",
    status: "awaiting-parts",
    progressPercent: 35,
    estimatedDuration: "Tomorrow by 11:30 AM",
    baseCost: 950,
    laborCost: 400,
    discoveredIssues: [],
    paymentStatus: "Unpaid",
    createdAt: "Today 10:15 AM"
  },
  {
    id: "JOB-103",
    customerName: "Karan Singhania",
    customerPhone: "9712345678",
    vehicleType: "Bike",
    vehicleModel: "Yamaha MT-15",
    plateNumber: "GJ-06-BQ-3321",
    reportedIssue: "Chain slack adjustment, front fork oil seal replacement.",
    mechanicId: 2,
    mechanicName: "Vikram Sharma",
    status: "ready",
    progressPercent: 100,
    estimatedDuration: "Ready Now",
    baseCost: 1200,
    laborCost: 500,
    discoveredIssues: [],
    paymentStatus: "Paid",
    createdAt: "Yesterday 03:00 PM"
  },
  {
    id: "JOB-104",
    customerName: "Dr. Ananya Joshi",
    customerPhone: "9909098765",
    vehicleType: "Car",
    vehicleModel: "Hyundai i20 Sportz",
    plateNumber: "GJ-01-MJ-9901",
    reportedIssue: "AC blowing warm air, cabin filter replacement.",
    mechanicId: 5,
    mechanicName: "Imran Khan",
    status: "repairing",
    progressPercent: 50,
    estimatedDuration: "Today by 4:00 PM",
    baseCost: 2200,
    laborCost: 900,
    discoveredIssues: [],
    paymentStatus: "Unpaid",
    createdAt: "Today 11:00 AM"
  }
];

// Current filter state
var currentStatusFilter = "all";
var currentSearchText = "";
var activeJobIdForIssue = null;

// ----------------------------------------------------------------
// 2. LOCALSTORAGE HELPERS
// ----------------------------------------------------------------
function getStoredMechanics() {
  var data = localStorage.getItem("gms_mechanics");
  if (data == null || data == "") {
    localStorage.setItem("gms_mechanics", JSON.stringify(DEFAULT_MECHANICS));
    return DEFAULT_MECHANICS;
  }
  return JSON.parse(data);
}

function saveStoredMechanics(list) {
  localStorage.setItem("gms_mechanics", JSON.stringify(list));
}

function getStoredJobs() {
  var data = localStorage.getItem("gms_jobs");
  if (data == null || data == "") {
    localStorage.setItem("gms_jobs", JSON.stringify(DEFAULT_JOBS));
    return DEFAULT_JOBS;
  }
  return JSON.parse(data);
}

function saveStoredJobs(list) {
  localStorage.setItem("gms_jobs", JSON.stringify(list));
}

// ----------------------------------------------------------------
// 3. STARTUP & DISPLAY ADMIN NAME (Requirement 2)
// ----------------------------------------------------------------
window.onload = function() {
  displayAdminName();
  startLiveClock();
  populateMechanicDropdown();
  renderAllSections();
  setupForms();
};

function displayAdminName() {
  var adminName = "Ronak Tank (Admin)";
  var userStr = localStorage.getItem("mc_current_user");

  if (userStr != null && userStr != "") {
    var userObj = JSON.parse(userStr);
    if (userObj && userObj.name) {
      adminName = userObj.name;
    }
  }

  // Display admin name in navbar
  var navEl = document.getElementById("adminNavName");
  if (navEl) {
    navEl.innerText = adminName;
  }

  // Display admin name in welcome header
  var welcomeEl = document.getElementById("adminWelcomeName");
  if (welcomeEl) {
    welcomeEl.innerText = adminName;
  }

  // Save for customer dashboard to display
  localStorage.setItem("mc_active_admin_name", adminName);
}

function startLiveClock() {
  var clockEl = document.getElementById("liveClock");
  if (!clockEl) return;

  function update() {
    var now = new Date();
    clockEl.innerText = now.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  update();
  setInterval(update, 30000);
}

// ----------------------------------------------------------------
// 4. TAB NAVIGATION
// ----------------------------------------------------------------
function switchAdminTab(tabName) {
  var sections = document.querySelectorAll(".admin-tab-section");
  for (var i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }

  var buttons = document.querySelectorAll(".adm-tab-link");
  for (var j = 0; j < buttons.length; j++) {
    buttons[j].classList.remove("active");
  }

  var targetSec = document.getElementById("section-" + tabName);
  var targetBtn = document.getElementById("tab-" + tabName);

  if (targetSec) targetSec.classList.add("active");
  if (targetBtn) targetBtn.classList.add("active");

  renderAllSections();
}

// ----------------------------------------------------------------
// 5. MASTER RENDER FUNCTION
// ----------------------------------------------------------------
function renderAllSections() {
  renderKpiMetrics();
  renderQuickOverview();
  renderRepairsTab();
  renderMechanicsTab();
  renderCustomersTab();
}

// ----------------------------------------------------------------
// 6. RENDER KPI METRICS
// ----------------------------------------------------------------
function renderKpiMetrics() {
  var mechanics = getStoredMechanics();
  var jobs = getStoredJobs();

  var working = 0;
  var leave = 0;
  for (var i = 0; i < mechanics.length; i++) {
    if (mechanics[i].status == "working") working++;
    else leave++;
  }

  var repairing = 0;
  var ready = 0;
  var totalRevenue = 0;

  for (var j = 0; j < jobs.length; j++) {
    var job = jobs[j];
    if (job.status == "repairing" || job.status == "awaiting-parts") {
      repairing++;
    }
    if (job.status == "ready") {
      ready++;
    }

    var jobTotal = job.baseCost + job.laborCost;
    if (job.discoveredIssues) {
      for (var k = 0; k < job.discoveredIssues.length; k++) {
        if (job.discoveredIssues[k].approvalStatus == "approved") {
          jobTotal += job.discoveredIssues[k].estimatedCost;
        }
      }
    }
    totalRevenue += jobTotal;
  }

  var elW = document.getElementById("statMechanicsWorking");
  var elL = document.getElementById("statMechanicsLeave");
  var elR = document.getElementById("statRepairing");
  var elRd = document.getElementById("statReady");
  var elRev = document.getElementById("statRevenue");

  if (elW) elW.innerText = working;
  if (elL) elL.innerText = leave;
  if (elR) elR.innerText = repairing;
  if (elRd) elRd.innerText = ready;
  if (elRev) elRev.innerText = "₹" + totalRevenue.toLocaleString("en-IN");
}

// ----------------------------------------------------------------
// 7. RENDER QUICK DASHBOARD PREVIEWS
// ----------------------------------------------------------------
function renderQuickOverview() {
  var mechanics = getStoredMechanics();
  var jobs = getStoredJobs();

  // Quick mechanics list (Top 4)
  var qm = document.getElementById("quickMechanicsList");
  if (qm) {
    var mHtml = "";
    var limit = Math.min(mechanics.length, 4);
    for (var i = 0; i < limit; i++) {
      var m = mechanics[i];
      var isWorking = m.status == "working";
      var badgeClass = isWorking ? "bg-success" : "bg-secondary";
      var badgeText = isWorking ? "Working" : "On Leave";
      var btnText = isWorking ? "Mark Leave" : "Mark Working";

      mHtml += "<tr>";
      mHtml += "<td><strong>" + m.name + "</strong></td>";
      mHtml += "<td class='text-muted small'>" + m.specialty + "</td>";
      mHtml += "<td><span class='badge " + badgeClass + "'>" + badgeText + "</span></td>";
      mHtml += "<td><button class='btn btn-sm btn-outline-dark py-0 px-2' onclick='toggleMechanicStatus(" + m.id + ")'>" + btnText + "</button></td>";
      mHtml += "</tr>";
    }
    qm.innerHTML = mHtml;
  }

  // Quick jobs list (Top 5)
  var qj = document.getElementById("quickJobsList");
  if (qj) {
    var jHtml = "";
    var jLimit = Math.min(jobs.length, 5);
    for (var j = 0; j < jLimit; j++) {
      var job = jobs[j];
      var badge = "bg-primary";
      if (job.status == "pending") badge = "bg-secondary";
      else if (job.status == "awaiting-parts") badge = "bg-warning text-dark";
      else if (job.status == "ready") badge = "bg-success";
      else if (job.status == "completed") badge = "bg-dark";

      jHtml += "<tr>";
      jHtml += "<td><span class='badge bg-light text-dark border font-monospace'>" + job.id + "</span></td>";
      jHtml += "<td><strong>" + job.vehicleModel + "</strong><br><small class='text-muted'>" + job.plateNumber + "</small></td>";
      jHtml += "<td>" + job.customerName + "</td>";
      jHtml += "<td><small>" + job.mechanicName + "</small></td>";
      jHtml += "<td><div class='progress' style='height: 6px; width: 60px;'><div class='progress-bar bg-danger' style='width: " + job.progressPercent + "%;'></div></div><small class='text-muted'>" + job.progressPercent + "%</small></td>";
      jHtml += "<td><span class='badge " + badge + "'>" + job.status + "</span></td>";
      jHtml += "</tr>";
    }
    qj.innerHTML = jHtml;
  }
}

// ----------------------------------------------------------------
// 8. RENDER REPAIRS TAB (With Additional Findings & Approval Status)
// ----------------------------------------------------------------
function renderRepairsTab() {
  var container = document.getElementById("repairsCardsGrid");
  if (!container) return;

  var jobs = getStoredJobs();

  // Filter & Search
  var filtered = [];
  for (var i = 0; i < jobs.length; i++) {
    var job = jobs[i];
    var matchStatus = (currentStatusFilter == "all" || job.status == currentStatusFilter);
    var searchLower = currentSearchText.toLowerCase();
    var matchSearch = (
      currentSearchText == "" ||
      job.plateNumber.toLowerCase().indexOf(searchLower) != -1 ||
      job.customerName.toLowerCase().indexOf(searchLower) != -1 ||
      job.vehicleModel.toLowerCase().indexOf(searchLower) != -1 ||
      job.id.toLowerCase().indexOf(searchLower) != -1
    );

    if (matchStatus && matchSearch) {
      filtered.push(job);
    }
  }

  var countBadge = document.getElementById("repairsCountBadge");
  if (countBadge) countBadge.innerText = filtered.length + " Vehicles";

  if (filtered.length == 0) {
    container.innerHTML = "<div class='col-12'><div class='mc-card p-5 text-center text-muted'><h5>No repair jobs found matching criteria.</h5></div></div>";
    return;
  }

  var html = "";
  for (var j = 0; j < filtered.length; j++) {
    var item = filtered[j];

    var totalCost = item.baseCost + item.laborCost;

    // Discovered Issues HTML
    var issuesHtml = "";
    if (item.discoveredIssues && item.discoveredIssues.length > 0) {
      for (var k = 0; k < item.discoveredIssues.length; k++) {
        var iss = item.discoveredIssues[k];
        var statusBadge = "<span class='badge bg-warning text-dark'><i class='bi bi-hourglass-split me-1'></i>Awaiting Customer</span>";

        if (iss.approvalStatus == "approved") {
          totalCost += iss.estimatedCost;
          statusBadge = "<span class='badge bg-success'><i class='bi bi-check-circle-fill me-1'></i>Customer Accepted (+₹" + iss.estimatedCost + ")</span>";
        } else if (iss.approvalStatus == "declined") {
          statusBadge = "<span class='badge bg-secondary'><i class='bi bi-x-circle me-1'></i>Customer Declined (₹0)</span>";
        }

        issuesHtml += "<div class='p-2 mb-1 bg-white rounded border small d-flex justify-content-between align-items-center flex-wrap gap-1'>";
        issuesHtml += "  <div><strong>" + iss.description + "</strong> <span class='text-danger ms-1 fw-bold'>₹" + iss.estimatedCost + "</span></div>";
        issuesHtml += "  <div>" + statusBadge + "</div>";
        issuesHtml += "</div>";
      }
    } else {
      issuesHtml = "<div class='text-muted small'>No extra defects reported yet.</div>";
    }

    var badgeClass = "bg-primary";
    if (item.status == "pending") badgeClass = "bg-secondary";
    else if (item.status == "awaiting-parts") badgeClass = "bg-warning text-dark";
    else if (item.status == "ready") badgeClass = "bg-success";
    else if (item.status == "completed") badgeClass = "bg-dark";

    html += "<div class='col-12 col-xl-6'>";
    html += "  <div class='mc-card p-3 h-100 d-flex flex-column'>";
    
    // Header
    html += "    <div class='d-flex justify-content-between align-items-start mb-2'>";
    html += "      <div>";
    html += "        <span class='badge bg-dark font-monospace me-1'>" + item.id + "</span>";
    html += "        <span class='badge bg-warning text-dark font-monospace'>" + item.plateNumber + "</span>";
    html += "        <h5 class='fw-bold text-dark mt-1 mb-0'>" + item.vehicleModel + "</h5>";
    html += "      </div>";
    html += "      <span class='badge " + badgeClass + "'>" + item.status.toUpperCase() + "</span>";
    html += "    </div>";

    // Customer & Mechanic row
    html += "    <div class='row g-2 small mb-3 text-muted'>";
    html += "      <div class='col-6'>Customer: <strong class='text-dark'>" + item.customerName + "</strong> (" + item.customerPhone + ")</div>";
    html += "      <div class='col-6'>Mechanic: <strong class='text-dark'>" + item.mechanicName + "</strong></div>";
    html += "    </div>";

    // Reported Problem
    html += "    <div class='p-2 bg-light rounded border mb-3 small'>";
    html += "      <span class='text-muted d-block fw-bold'>Primary Issue:</span>";
    html += "      <span class='text-dark'>" + item.reportedIssue + "</span>";
    html += "    </div>";

    // Extra Discovered Findings Box
    html += "    <div class='p-3 bg-warning-subtle border border-warning rounded mb-3'>";
    html += "      <div class='d-flex justify-content-between align-items-center mb-2'>";
    html += "        <strong class='text-dark small'><i class='bi bi-exclamation-triangle-fill text-warning me-1'></i>Extra Problems Reported to Customer:</strong>";
    html += "        <button class='btn btn-sm btn-outline-dark py-0 px-2 fw-semibold' onclick='openAddIssueModal(\"" + item.id + "\")'>+ Report Problem</button>";
    html += "      </div>";
    html += "      " + issuesHtml;
    html += "    </div>";

    // Progress bar
    html += "    <div class='mb-3'>";
    html += "      <div class='d-flex justify-content-between small text-muted mb-1'>";
    html += "        <span>Repair Progress</span>";
    html += "        <strong>" + item.progressPercent + "%</strong>";
    html += "      </div>";
    html += "      <div class='progress' style='height: 8px;'>";
    html += "        <div class='progress-bar bg-danger' style='width: " + item.progressPercent + "%;'></div>";
    html += "      </div>";
    html += "    </div>";

    // Action buttons & Cost
    html += "    <div class='d-flex justify-content-between align-items-center mt-auto pt-2 border-top flex-wrap gap-2'>";
    html += "      <div>";
    html += "        <small class='text-muted d-block'>TOTAL BILL ESTIMATE</small>";
    html += "        <h5 class='fw-bold text-danger mb-0'>₹" + totalCost.toLocaleString("en-IN") + "</h5>";
    html += "      </div>";
    html += "      <div class='d-flex gap-1'>";
    html += "        <div class='dropdown'>";
    html += "          <button class='btn btn-sm btn-outline-secondary dropdown-toggle' type='button' data-bs-toggle='dropdown'>Status</button>";
    html += "          <ul class='dropdown-menu dropdown-menu-end'>";
    html += "            <li><a class='dropdown-item' href='javascript:void(0)' onclick='updateJobStatus(\"" + item.id + "\", \"pending\", 10)'>Pending (10%)</a></li>";
    html += "            <li><a class='dropdown-item' href='javascript:void(0)' onclick='updateJobStatus(\"" + item.id + "\", \"repairing\", 60)'>Repairing (60%)</a></li>";
    html += "            <li><a class='dropdown-item' href='javascript:void(0)' onclick='updateJobStatus(\"" + item.id + "\", \"awaiting-parts\", 40)'>Awaiting Parts (40%)</a></li>";
    html += "            <li><a class='dropdown-item' href='javascript:void(0)' onclick='updateJobStatus(\"" + item.id + "\", \"ready\", 100)'>Ready for Pickup (100%)</a></li>";
    html += "            <li><a class='dropdown-item' href='javascript:void(0)' onclick='updateJobStatus(\"" + item.id + "\", \"completed\", 100)'>Completed & Delivered</a></li>";
    html += "          </ul>";
    html += "        </div>";
    html += "        <button class='btn btn-sm btn-outline-danger' onclick='showInvoiceModal(\"" + item.id + "\")'><i class='bi bi-receipt me-1'></i>Invoice</button>";
    html += "      </div>";
    html += "    </div>";

    html += "  </div>";
    html += "</div>";
  }

  container.innerHTML = html;
}

// ----------------------------------------------------------------
// 9. RENDER MECHANICS TAB
// ----------------------------------------------------------------
function renderMechanicsTab() {
  var container = document.getElementById("fullMechanicsGrid");
  if (!container) return;

  var mechanics = getStoredMechanics();
  var totalBadge = document.getElementById("mechanicsTotalBadge");
  if (totalBadge) totalBadge.innerText = mechanics.length + " Mechanics";

  var html = "";
  for (var i = 0; i < mechanics.length; i++) {
    var m = mechanics[i];
    var isWorking = m.status == "working";
    var badgeClass = isWorking ? "bg-success" : "bg-secondary";
    var badgeText = isWorking ? "Working on Floor" : "On Leave";
    var toggleBtnClass = isWorking ? "btn-outline-danger" : "btn-outline-success";
    var toggleBtnText = isWorking ? "Mark On Leave" : "Mark Working";

    html += "<div class='col-12 col-sm-6 col-lg-4'>";
    html += "  <div class='mc-card p-3 h-100'>";
    html += "    <div class='d-flex align-items-center gap-3 mb-3'>";
    html += "      <div class='p-3 bg-light rounded-circle text-danger fs-4'><i class='bi bi-person-fill'></i></div>";
    html += "      <div>";
    html += "        <h6 class='fw-bold mb-0 text-dark'>" + m.name + "</h6>";
    html += "        <small class='text-muted'>" + m.specialty + "</small>";
    html += "      </div>";
    html += "    </div>";
    html += "    <div class='small text-muted mb-3'><i class='bi bi-telephone me-1'></i>" + m.phone + "</div>";
    html += "    <div class='d-flex justify-content-between align-items-center pt-2 border-top'>";
    html += "      <span class='badge " + badgeClass + "'>" + badgeText + "</span>";
    html += "      <button class='btn btn-sm " + toggleBtnClass + "' onclick='toggleMechanicStatus(" + m.id + ")'>" + toggleBtnText + "</button>";
    html += "    </div>";
    html += "  </div>";
    html += "</div>";
  }

  container.innerHTML = html;
}

// ----------------------------------------------------------------
// 10. RENDER CUSTOMERS TAB
// ----------------------------------------------------------------
function renderCustomersTab() {
  var tbody = document.getElementById("customersTableBody");
  if (!tbody) return;

  var jobs = getStoredJobs();
  var html = "";

  for (var i = 0; i < jobs.length; i++) {
    var j = jobs[i];
    var badge = "bg-primary";
    if (j.status == "pending") badge = "bg-secondary";
    else if (j.status == "awaiting-parts") badge = "bg-warning text-dark";
    else if (j.status == "ready") badge = "bg-success";
    else if (j.status == "completed") badge = "bg-dark";

    html += "<tr>";
    html += "  <td><i class='bi bi-person-circle text-danger me-2'></i><strong>" + j.customerName + "</strong></td>";
    html += "  <td>" + j.customerPhone + "</td>";
    html += "  <td>" + j.vehicleModel + " <span class='badge bg-light text-dark border font-monospace ms-1'>" + j.plateNumber + "</span></td>";
    html += "  <td>" + j.mechanicName + "</td>";
    html += "  <td><span class='badge " + badge + "'>" + j.status + "</span></td>";
    html += "  <td><button class='btn btn-sm btn-outline-danger py-0 px-2' onclick='showInvoiceModal(\"" + j.id + "\")'>View Invoice</button></td>";
    html += "</tr>";
  }

  tbody.innerHTML = html;
}

// ----------------------------------------------------------------
// 11. MECHANIC TOGGLE
// ----------------------------------------------------------------
function toggleMechanicStatus(mechId) {
  var mechanics = getStoredMechanics();
  for (var i = 0; i < mechanics.length; i++) {
    if (mechanics[i].id == mechId) {
      mechanics[i].status = (mechanics[i].status == "working") ? "leave" : "working";
      break;
    }
  }
  saveStoredMechanics(mechanics);
  renderAllSections();
}

// ----------------------------------------------------------------
// 12. UPDATE JOB STATUS
// ----------------------------------------------------------------
function updateJobStatus(jobId, newStatus, newProgress) {
  var jobs = getStoredJobs();
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id == jobId) {
      jobs[i].status = newStatus;
      jobs[i].progressPercent = newProgress;
      break;
    }
  }
  saveStoredJobs(jobs);
  renderAllSections();
}

// ----------------------------------------------------------------
// 13. REPORT ADDITIONAL DEFECT TO CUSTOMER (Requirement 3)
// ----------------------------------------------------------------
function openAddIssueModal(jobId) {
  activeJobIdForIssue = jobId;
  var displayEl = document.getElementById("issueJobIdDisplay");
  if (displayEl) displayEl.innerText = jobId;

  document.getElementById("issueDescription").value = "";
  document.getElementById("issueCost").value = "";

  var modalEl = document.getElementById("addIssueModal");
  var modalInst = new bootstrap.Modal(modalEl);
  modalInst.show();
}

function handleAddIssueForm(event) {
  event.preventDefault();
  if (!activeJobIdForIssue) return;

  var desc = document.getElementById("issueDescription").value.trim();
  var cost = parseFloat(document.getElementById("issueCost").value) || 0;

  var jobs = getStoredJobs();
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id == activeJobIdForIssue) {
      if (!jobs[i].discoveredIssues) {
        jobs[i].discoveredIssues = [];
      }

      jobs[i].discoveredIssues.push({
        id: Date.now(),
        description: desc,
        estimatedCost: cost,
        approvalStatus: "pending" // Pending approval from customer
      });
      break;
    }
  }

  saveStoredJobs(jobs);

  var modalEl = document.getElementById("addIssueModal");
  var modalInst = bootstrap.Modal.getInstance(modalEl);
  if (modalInst) modalInst.hide();

  renderAllSections();
  alert("Finding recorded! This unexpected problem is now sent to the customer for approval.");
}

// ----------------------------------------------------------------
// 14. INVOICE MODAL
// ----------------------------------------------------------------
function showInvoiceModal(jobId) {
  var jobs = getStoredJobs();
  var job = null;
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id == jobId) {
      job = jobs[i];
      break;
    }
  }
  if (!job) return;

  var extraCost = 0;
  var extraRows = "";

  if (job.discoveredIssues) {
    for (var k = 0; k < job.discoveredIssues.length; k++) {
      var iss = job.discoveredIssues[k];
      if (iss.approvalStatus == "approved") {
        extraCost += iss.estimatedCost;
        extraRows += "<tr><td>Inspection Finding: " + iss.description + "</td><td class='text-end'>₹" + iss.estimatedCost.toLocaleString("en-IN") + "</td></tr>";
      }
    }
  }

  var total = job.baseCost + job.laborCost + extraCost;

  var html = "";
  html += "<div class='border p-4 bg-white rounded'>";
  html += "  <div class='d-flex justify-content-between mb-3 border-bottom pb-2'>";
  html += "    <h4 class='text-danger fw-bold'><i class='bi bi-gear-wide-connected me-2'></i>MechControl</h4>";
  html += "    <div class='text-end'><strong>Invoice #" + job.id + "</strong><div class='small text-muted'>" + job.createdAt + "</div></div>";
  html += "  </div>";
  html += "  <div class='row mb-3 small'>";
  html += "    <div class='col-6'><strong>Customer:</strong><br>" + job.customerName + "<br>Phone: " + job.customerPhone + "<br>Vehicle: " + job.vehicleModel + " (" + job.plateNumber + ")</div>";
  html += "    <div class='col-6 text-end'><strong>Workshop Mechanic:</strong><br>" + job.mechanicName + "<br>Status: <span class='badge bg-success'>" + job.status.toUpperCase() + "</span></div>";
  html += "  </div>";
  html += "  <table class='table table-bordered'>";
  html += "    <thead class='table-light small'><tr><th>Service Item / Spares</th><th class='text-end'>Amount</th></tr></thead>";
  html += "    <tbody>";
  html += "      <tr><td>Primary Repair: " + job.reportedIssue + "</td><td class='text-end'>₹" + job.baseCost.toLocaleString("en-IN") + "</td></tr>";
  html += "      <tr><td>Mechanic Labor & Inspection Charges</td><td class='text-end'>₹" + job.laborCost.toLocaleString("en-IN") + "</td></tr>";
  html +=        extraRows;
  html += "      <tr class='table-light fw-bold'><td>TOTAL AMOUNT DUE</td><td class='text-end text-danger'>₹" + total.toLocaleString("en-IN") + "</td></tr>";
  html += "    </tbody>";
  html += "  </table>";
  html += "</div>";

  document.getElementById("invoiceModalContent").innerHTML = html;
  var modalEl = document.getElementById("invoiceModal");
  var modalInst = new bootstrap.Modal(modalEl);
  modalInst.show();
}

// ----------------------------------------------------------------
// 15. CHECK-IN NEW VEHICLE FORM
// ----------------------------------------------------------------
function populateMechanicDropdown() {
  var sel = document.getElementById("newAssignedMechanic");
  if (!sel) return;

  var mechanics = getStoredMechanics();
  var opts = "";
  for (var i = 0; i < mechanics.length; i++) {
    var m = mechanics[i];
    opts += "<option value='" + m.id + "'>" + m.name + " (" + m.specialty + " - " + m.status + ")</option>";
  }
  sel.innerHTML = opts;
}

function setupForms() {
  var checkinForm = document.getElementById("checkinForm");
  if (checkinForm) {
    checkinForm.onsubmit = function(event) {
      event.preventDefault();

      var cName = document.getElementById("newCustomerName").value.trim();
      var cPhone = document.getElementById("newCustomerPhone").value.trim();
      var vType = document.getElementById("newVehicleType").value;
      var vModel = document.getElementById("newVehicleModel").value.trim();
      var vPlate = document.getElementById("newPlateNumber").value.trim().toUpperCase();
      var issue = document.getElementById("newReportedIssue").value.trim();
      var mechId = parseInt(document.getElementById("newAssignedMechanic").value);
      var cost = parseFloat(document.getElementById("newBaseCost").value) || 500;

      var mechanics = getStoredMechanics();
      var mechName = "Assigned Mechanic";
      for (var i = 0; i < mechanics.length; i++) {
        if (mechanics[i].id == mechId) {
          mechName = mechanics[i].name;
          break;
        }
      }

      var jobs = getStoredJobs();
      var newJob = {
        id: "JOB-" + (100 + jobs.length + 1),
        customerName: cName,
        customerPhone: cPhone,
        vehicleType: vType,
        vehicleModel: vModel,
        plateNumber: vPlate,
        reportedIssue: issue,
        mechanicId: mechId,
        mechanicName: mechName,
        status: "repairing",
        progressPercent: 20,
        estimatedDuration: "Today by 6:00 PM",
        baseCost: cost,
        laborCost: 350,
        discoveredIssues: [],
        paymentStatus: "Unpaid",
        createdAt: "Today " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      };

      jobs.unshift(newJob);
      saveStoredJobs(jobs);

      var modalEl = document.getElementById("checkinModal");
      var modalInst = bootstrap.Modal.getInstance(modalEl);
      if (modalInst) modalInst.hide();

      checkinForm.reset();
      renderAllSections();
      alert("Vehicle successfully checked in! Job ID: " + newJob.id);
    };
  }

  var issueForm = document.getElementById("addIssueForm");
  if (issueForm) {
    issueForm.onsubmit = handleAddIssueForm;
  }
}

// Filter and Search Helpers
function filterRepairs(status, btn) {
  currentStatusFilter = status;
  var group = btn.parentElement.querySelectorAll("button");
  for (var i = 0; i < group.length; i++) {
    group[i].classList.remove("active");
  }
  btn.classList.add("active");
  renderRepairsTab();
}

function handleRepairSearch(text) {
  currentSearchText = text;
  renderRepairsTab();
}
