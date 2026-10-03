/* ================================================================
   admin-dashboard.js — MechControl Admin Dashboard
   Written in Basic, Easy-to-Understand JavaScript
   ================================================================ */

// ----------------------------------------------------------------
// 1. DEFAULT DATA (Used if no data is stored in the browser yet)
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
    customerName: "Rahul Mehta",
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
        approvalStatus: "approved"
      }
    ],
    paymentStatus: "Partial",
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
    discoveredIssues: [
      {
        id: 1,
        description: "Battery voltage dead cell; replacement required.",
        estimatedCost: 1400,
        approvalStatus: "pending"
      }
    ],
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
    discoveredIssues: [
      {
        id: 1,
        description: "AC condenser coil blocked with debris; foam clean needed.",
        estimatedCost: 650,
        approvalStatus: "approved"
      }
    ],
    paymentStatus: "Unpaid",
    createdAt: "Today 11:00 AM"
  }
];

// Current filter state
var currentStatusFilter = "all";
var currentSearchText = "";
var currentVehicleType = "all";
var activeJobIdForIssue = null;

// ----------------------------------------------------------------
// 2. HELPER FUNCTIONS: Read & Write LocalStorage
// ----------------------------------------------------------------
function getMechanics() {
  var saved = localStorage.getItem("gms_mechanics");
  if (saved == null) {
    localStorage.setItem("gms_mechanics", JSON.stringify(DEFAULT_MECHANICS));
    return DEFAULT_MECHANICS;
  }
  return JSON.parse(saved);
}

function saveMechanics(list) {
  localStorage.setItem("gms_mechanics", JSON.stringify(list));
}

function getJobs() {
  var saved = localStorage.getItem("gms_jobs");
  if (saved == null) {
    localStorage.setItem("gms_jobs", JSON.stringify(DEFAULT_JOBS));
    return DEFAULT_JOBS;
  }
  return JSON.parse(saved);
}

function saveJobs(list) {
  localStorage.setItem("gms_jobs", JSON.stringify(list));
}

// ----------------------------------------------------------------
// 3. STARTUP & TAB SWITCHING
// ----------------------------------------------------------------
window.onload = function() {
  startLiveClock();
  fillMechanicDropdown();
  updateTopCounters();
  displayQuickTable();
  displayJobs();
  displayMechanicsRoster();
  displayCustomers();
  setupButtonListeners();
};

function startLiveClock() {
  setInterval(function() {
    var now = new Date();
    var clockEl = document.getElementById("liveClock");
    if (clockEl) {
      clockEl.innerHTML = '<i class="bi bi-clock me-1"></i>' + now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }, 1000);
}

function switchAdminTab(tabName) {
  // Hide all sections
  var sections = document.querySelectorAll(".admin-tab-section");
  for (var i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }

  // Deactivate all tab links
  var tabs = document.querySelectorAll(".adm-tab-link");
  for (var j = 0; j < tabs.length; j++) {
    tabs[j].classList.remove("active");
  }

  // Show selected section
  var targetSection = document.getElementById("section-" + tabName);
  var targetTab = document.getElementById("tab-" + tabName);

  if (targetSection) targetSection.classList.add("active");
  if (targetTab) targetTab.classList.add("active");
}

// ----------------------------------------------------------------
// 4. FILL MECHANIC DROPDOWN in "Check-in Vehicle" Form
// ----------------------------------------------------------------
function fillMechanicDropdown() {
  var dropdown = document.getElementById("mechanicSelect");
  if (!dropdown) return;

  var mechanics = getMechanics();
  var html = '<option value="">-- Choose Assigned Mechanic --</option>';

  for (var i = 0; i < mechanics.length; i++) {
    var m = mechanics[i];
    if (m.status == "working") {
      html += '<option value="' + m.id + '">' + m.name + ' (' + m.specialty + ') - Available</option>';
    } else {
      html += '<option value="' + m.id + '" disabled>' + m.name + ' (' + m.specialty + ') - On Leave</option>';
    }
  }

  dropdown.innerHTML = html;
}

// ----------------------------------------------------------------
// 5. UPDATE TOP KPI COUNTERS (Requirement 3)
// ----------------------------------------------------------------
function updateTopCounters() {
  var mechanics = getMechanics();
  var jobs = getJobs();

  var workingCount = 0;
  var leaveCount = 0;

  for (var i = 0; i < mechanics.length; i++) {
    if (mechanics[i].status == "working") {
      workingCount++;
    } else {
      leaveCount++;
    }
  }

  var repairingCount = 0;
  var readyCount = 0;
  var completedCount = 0;
  var totalRevenue = 0;

  for (var j = 0; j < jobs.length; j++) {
    var job = jobs[j];

    if (job.status == "repairing" || job.status == "awaiting-parts") {
      repairingCount++;
    } else if (job.status == "ready") {
      readyCount++;
    } else if (job.status == "completed") {
      completedCount++;
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

  document.getElementById("statMechanicsWorking").innerText = workingCount;
  document.getElementById("statMechanicsLeave").innerText = leaveCount;
  document.getElementById("statRepairingCount").innerText = repairingCount;
  document.getElementById("statReadyCount").innerText = readyCount;
  document.getElementById("statCompletedCount").innerText = completedCount;
  document.getElementById("statTotalRevenue").innerText = "₹" + totalRevenue.toLocaleString("en-IN");
  
  var dutySummary = document.getElementById("mechanicDutySummary");
  if (dutySummary) dutySummary.innerText = workingCount;
}

// ----------------------------------------------------------------
// 6. DISPLAY QUICK RECENT REPAIRS TABLE on Dashboard
// ----------------------------------------------------------------
function displayQuickTable() {
  var tbody = document.getElementById("quickTableBody");
  if (!tbody) return;

  var jobs = getJobs();
  var mechanics = getMechanics();
  var html = "";

  for (var i = 0; i < jobs.length; i++) {
    var job = jobs[i];

    var assignedMechanic = null;
    for (var m = 0; m < mechanics.length; m++) {
      if (mechanics[m].id == job.mechanicId) {
        assignedMechanic = mechanics[m];
        break;
      }
    }
    var mechName = assignedMechanic ? assignedMechanic.name : (job.mechanicName || "Unassigned");

    // Total cost
    var extraCost = 0;
    if (job.discoveredIssues) {
      for (var k = 0; k < job.discoveredIssues.length; k++) {
        if (job.discoveredIssues[k].approvalStatus == "approved") extraCost += job.discoveredIssues[k].estimatedCost;
      }
    }
    var totalCost = job.baseCost + job.laborCost + extraCost;

    var badgeClass = "bg-secondary";
    var badgeText = "In Queue";
    if (job.status == "repairing") { badgeClass = "bg-primary"; badgeText = "In Progress"; }
    else if (job.status == "awaiting-parts") { badgeClass = "bg-warning text-dark"; badgeText = "Awaiting Parts"; }
    else if (job.status == "ready") { badgeClass = "bg-success"; badgeText = "Ready for Pickup"; }
    else if (job.status == "completed") { badgeClass = "bg-dark"; badgeText = "Completed"; }

    html += '<tr>';
    html += '  <td><strong>' + job.id + '</strong></td>';
    html += '  <td><strong>' + job.customerName + '</strong><div class="small text-muted">' + job.customerPhone + '</div></td>';
    html += '  <td>' + job.vehicleModel + ' <span class="badge bg-light text-dark border">' + job.plateNumber + '</span></td>';
    html += '  <td>' + mechName + '</td>';
    html += '  <td><span class="badge ' + badgeClass + '">' + badgeText + '</span></td>';
    html += '  <td><small class="text-muted">' + job.estimatedDuration + '</small></td>';
    html += '  <td><strong>₹' + totalCost.toLocaleString("en-IN") + '</strong></td>';
    html += '  <td class="text-end">';
    html += '    <button class="btn btn-sm btn-outline-secondary py-1 px-2 me-1" onclick="showCustomerPreview(\'' + job.id + '\')"><i class="bi bi-eye"></i></button>';
    html += '    <button class="btn btn-sm btn-outline-primary py-1 px-2" onclick="showInvoice(\'' + job.id + '\')"><i class="bi bi-receipt"></i></button>';
    html += '  </td>';
    html += '</tr>';
  }

  tbody.innerHTML = html;
}

// ----------------------------------------------------------------
// 7. DISPLAY FULL JOB CARDS on Repairs & Vehicles Tab
// ----------------------------------------------------------------
function displayJobs() {
  var container = document.getElementById("jobsContainer");
  if (!container) return;

  var jobs = getJobs();
  var mechanics = getMechanics();
  var html = "";
  var count = 0;

  for (var i = 0; i < jobs.length; i++) {
    var job = jobs[i];

    // Filter checks
    if (currentStatusFilter != "all" && job.status != currentStatusFilter) continue;
    if (currentVehicleType != "all" && job.vehicleType.toLowerCase() != currentVehicleType.toLowerCase()) continue;

    if (currentSearchText.trim() != "") {
      var s = currentSearchText.toLowerCase();
      var m1 = job.customerName.toLowerCase().indexOf(s) != -1;
      var m2 = job.customerPhone.indexOf(s) != -1;
      var m3 = job.plateNumber.toLowerCase().indexOf(s) != -1;
      var m4 = job.vehicleModel.toLowerCase().indexOf(s) != -1;
      var m5 = job.id.toLowerCase().indexOf(s) != -1;
      if (!m1 && !m2 && !m3 && !m4 && !m5) continue;
    }

    count++;

    // Find mechanic
    var mech = null;
    for (var m = 0; m < mechanics.length; m++) {
      if (mechanics[m].id == job.mechanicId) {
        mech = mechanics[m];
        break;
      }
    }
    var mechName = mech ? mech.name : (job.mechanicName || "Unassigned");
    var mechPhone = mech ? mech.phone : "N/A";
    var mechSpecialty = mech ? mech.specialty : "General Service";

    // Extra discovered issues
    var extraCost = 0;
    var extraHtml = "";

    if (job.discoveredIssues && job.discoveredIssues.length > 0) {
      for (var e = 0; e < job.discoveredIssues.length; e++) {
        var iss = job.discoveredIssues[e];
        if (iss.approvalStatus == "approved") extraCost += iss.estimatedCost;

        var appBadge = '<span class="badge bg-warning text-dark">Pending Customer Approval</span>';
        if (iss.approvalStatus == "approved") appBadge = '<span class="badge bg-success">Approved by Customer</span>';
        if (iss.approvalStatus == "declined") appBadge = '<span class="badge bg-danger">Declined by Customer</span>';

        extraHtml += '<div class="d-flex justify-content-between align-items-center py-2 border-bottom small">';
        extraHtml += '  <div><i class="bi bi-tools text-warning me-1"></i><strong>' + iss.description + '</strong> (₹' + iss.estimatedCost + ')</div>';
        extraHtml += '  <div>' + appBadge;
        extraHtml += '    <button class="btn btn-sm btn-outline-success py-0 px-2 ms-1" onclick="changeIssueApproval(\'' + job.id + '\', ' + iss.id + ', \'approved\')">Yes</button>';
        extraHtml += '    <button class="btn btn-sm btn-outline-danger py-0 px-2 ms-1" onclick="changeIssueApproval(\'' + job.id + '\', ' + iss.id + ', \'declined\')">No</button>';
        extraHtml += '  </div>';
        extraHtml += '</div>';
      }
    } else {
      extraHtml = '<div class="text-muted small">No extra problems discovered by mechanic.</div>';
    }

    var grandTotal = job.baseCost + job.laborCost + extraCost;

    var statusClass = "bg-secondary";
    var statusText = "In Queue";
    if (job.status == "repairing") { statusClass = "bg-primary"; statusText = "In Progress"; }
    else if (job.status == "awaiting-parts") { statusClass = "bg-warning text-dark"; statusText = "Awaiting Parts"; }
    else if (job.status == "ready") { statusClass = "bg-success"; statusText = "Ready for Pickup"; }
    else if (job.status == "completed") { statusClass = "bg-dark"; statusText = "Completed"; }

    var vehicleIcon = "bi-bicycle";
    if (job.vehicleType == "Car") vehicleIcon = "bi-car-front";
    if (job.vehicleType == "Scooter") vehicleIcon = "bi-moped";

    // Requirement 4: Pickup & Privacy Notice
    var privacyBoxHtml = "";
    if (job.status == "ready" || job.status == "completed") {
      privacyBoxHtml += '<div class="pickup-privacy-box">';
      privacyBoxHtml += '  <div class="pickup-privacy-title"><i class="bi bi-shield-check"></i> Vehicle Ready – Customer Pickup & Privacy Guideline:</div>';
      privacyBoxHtml += '  <div class="pickup-privacy-text">When the customer collects their vehicle and pays ₹' + grandTotal + ', please delete/archive this customer personal record to comply with garage data privacy rules.</div>';
      privacyBoxHtml += '  <button class="btn btn-sm btn-danger fw-bold" onclick="deleteCustomerJob(\'' + job.id + '\')">';
      privacyBoxHtml += '    <i class="bi bi-trash3-fill me-1"></i>Mark as Picked Up & Purge Active Data';
      privacyBoxHtml += '  </button>';
      privacyBoxHtml += '</div>';
    }

    // Build Job Card HTML
    html += '<div class="col-12 col-xl-6 mb-4">';
    html += '  <div class="vehicle-job-card">';

    // Header
    html += '    <div class="job-card-header">';
    html += '      <div class="d-flex align-items-center gap-2">';
    html += '        <strong>' + job.id + '</strong>';
    html += '        <span class="plate-badge"><i class="bi ' + vehicleIcon + ' me-1"></i>' + job.plateNumber + '</span>';
    html += '        <span class="badge ' + statusClass + '">' + statusText + '</span>';
    html += '      </div>';
    html += '      <div>';
    html += '        <button class="btn btn-sm btn-outline-secondary py-1 px-2 me-1" onclick="showCustomerPreview(\'' + job.id + '\')"><i class="bi bi-eye me-1"></i>Customer View</button>';
    html += '        <button class="btn btn-sm btn-outline-primary py-1 px-2" onclick="showInvoice(\'' + job.id + '\')"><i class="bi bi-receipt me-1"></i>Invoice</button>';
    html += '      </div>';
    html += '    </div>';

    // Body
    html += '    <div class="job-card-body">';

    // Info row
    html += '      <div class="row g-2 mb-3">';
    html += '        <div class="col-6">';
    html += '          <small class="text-muted d-block">CUSTOMER</small>';
    html += '          <div class="fw-bold text-dark">' + job.customerName + '</div>';
    html += '          <div class="small text-muted"><i class="bi bi-telephone text-primary me-1"></i>' + job.customerPhone + '</div>';
    html += '        </div>';
    html += '        <div class="col-6">';
    html += '          <small class="text-muted d-block">VEHICLE MODEL</small>';
    html += '          <div class="fw-bold text-dark">' + job.vehicleModel + '</div>';
    html += '          <span class="badge bg-light text-dark border">' + job.vehicleType + '</span>';
    html += '        </div>';
    html += '      </div>';

    // Reported issue
    html += '      <div class="p-2 mb-3 bg-light rounded border-start border-3 border-secondary small">';
    html += '        <strong>Reported Issue:</strong> ' + job.reportedIssue;
    html += '      </div>';

    // Mechanic and Duration
    html += '      <div class="row g-2 mb-3 align-items-center">';
    html += '        <div class="col-7">';
    html += '          <small class="text-muted d-block mb-1">ASSIGNED MECHANIC</small>';
    html += '          <div class="assigned-mechanic-box">';
    html += '            <div class="fw-bold small">' + mechName + '</div>';
    html += '            <div class="small text-muted">' + mechSpecialty + ' | Ph: ' + mechPhone + '</div>';
    html += '          </div>';
    html += '        </div>';
    html += '        <div class="col-5">';
    html += '          <small class="text-muted d-block mb-1">ESTIMATED REPAIR TIME</small>';
    html += '          <div class="p-2 bg-light rounded border text-center">';
    html += '            <strong class="text-primary small d-block">' + job.estimatedDuration + '</strong>';
    html += '            <div class="progress my-1" style="height: 6px;">';
    html += '              <div class="progress-bar bg-success" style="width: ' + job.progressPercent + '%;"></div>';
    html += '            </div>';
    html += '            <span class="small text-muted">' + job.progressPercent + '% Finished</span>';
    html += '          </div>';
    html += '        </div>';
    html += '      </div>';

    // Unexpected findings (Requirement 2)
    html += '      <div class="discovered-issue-box">';
    html += '        <div class="d-flex justify-content-between align-items-center mb-1">';
    html += '          <span class="discovered-issue-title"><i class="bi bi-exclamation-triangle-fill"></i> Extra Problems Discovered by Mechanic:</span>';
    html += '          <button class="btn btn-sm btn-outline-warning text-dark fw-bold py-0 px-2" onclick="openAddIssueModal(\'' + job.id + '\')">+ Add Extra Finding</button>';
    html += '        </div>';
    html += '        <div>' + extraHtml + '</div>';
    html += '      </div>';

    // Costs & Status dropdown
    html += '      <div class="row align-items-center mt-3 pt-3 border-top">';
    html += '        <div class="col-7">';
    html += '          <small class="text-muted d-block">TOTAL BILL AMOUNT</small>';
    html += '          <h5 class="fw-bold mb-0 text-dark">₹' + grandTotal.toLocaleString("en-IN") + ' <span class="badge bg-info text-dark" style="font-size: 11px;">' + job.paymentStatus + '</span></h5>';
    html += '          <div class="text-muted small" style="font-size: 11px;">Base: ₹' + job.baseCost + ' | Labor: ₹' + job.laborCost + ' | Extra: ₹' + extraCost + '</div>';
    html += '        </div>';
    html += '        <div class="col-5 text-end">';
    html += '          <div class="dropdown">';
    html += '            <button class="btn btn-sm btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">Change Stage</button>';
    html += '            <ul class="dropdown-menu dropdown-menu-end shadow">';
    html += '              <li><a class="dropdown-item" href="javascript:void(0)" onclick="updateStatus(\'' + job.id + '\', \'pending\', 10)">In Queue (10%)</a></li>';
    html += '              <li><a class="dropdown-item" href="javascript:void(0)" onclick="updateStatus(\'' + job.id + '\', \'repairing\', 60)">In Progress (60%)</a></li>';
    html += '              <li><a class="dropdown-item" href="javascript:void(0)" onclick="updateStatus(\'' + job.id + '\', \'awaiting-parts\', 35)">Awaiting Parts (35%)</a></li>';
    html += '              <li><a class="dropdown-item text-success fw-bold" href="javascript:void(0)" onclick="updateStatus(\'' + job.id + '\', \'ready\', 100)">Ready for Pickup (100%)</a></li>';
    html += '            </ul>';
    html += '          </div>';
    html += '        </div>';
    html += '      </div>';

    // Customer Pickup & Privacy Notice
    html += privacyBoxHtml;

    html += '    </div>';
    html += '  </div>';
    html += '</div>';
  }

  if (count == 0) {
    html = '<div class="col-12 text-center py-5 bg-white border rounded text-muted">No vehicle records found matching this search or filter.</div>';
  }

  container.innerHTML = html;
}

// ----------------------------------------------------------------
// 8. DISPLAY MECHANICS ROSTER (Requirement 3)
// ----------------------------------------------------------------
function displayMechanicsRoster() {
  var tbody = document.getElementById("mechanicsRosterBody");
  if (!tbody) return;

  var mechanics = getMechanics();
  var jobs = getJobs();
  var html = "";

  for (var i = 0; i < mechanics.length; i++) {
    var m = mechanics[i];

    var loadCount = 0;
    for (var j = 0; j < jobs.length; j++) {
      if (jobs[j].mechanicId == m.id && (jobs[j].status == "repairing" || jobs[j].status == "awaiting-parts")) {
        loadCount++;
      }
    }

    var isWorking = m.status == "working";
    var dutyBadge = isWorking ? '<span class="badge bg-success">Working Today</span>' : '<span class="badge bg-secondary">On Leave</span>';
    var actionBtn = isWorking
      ? '<button class="btn btn-sm btn-outline-danger" onclick="toggleMechanicDuty(' + m.id + ')">Mark On Leave</button>'
      : '<button class="btn btn-sm btn-outline-success" onclick="toggleMechanicDuty(' + m.id + ')">Mark Working</button>';

    html += '<tr>';
    html += '  <td><strong>' + m.name + '</strong></td>';
    html += '  <td><span class="badge bg-light text-dark border">' + m.specialty + '</span></td>';
    html += '  <td>' + m.phone + '</td>';
    html += '  <td>' + dutyBadge + '</td>';
    html += '  <td><span class="badge bg-primary">' + loadCount + ' Active Vehicles</span></td>';
    html += '  <td class="text-end">' + actionBtn + '</td>';
    html += '</tr>';
  }

  tbody.innerHTML = html;
}

function toggleMechanicDuty(mechanicId) {
  var mechanics = getMechanics();
  for (var i = 0; i < mechanics.length; i++) {
    if (mechanics[i].id == mechanicId) {
      mechanics[i].status = (mechanics[i].status == "working") ? "leave" : "working";
      break;
    }
  }
  saveMechanics(mechanics);
  updateTopCounters();
  fillMechanicDropdown();
  displayMechanicsRoster();
}

// ----------------------------------------------------------------
// 9. DISPLAY CUSTOMERS DIRECTORY
// ----------------------------------------------------------------
function displayCustomers() {
  var tbody = document.getElementById("customersDirectoryBody");
  if (!tbody) return;

  var jobs = getJobs();
  var html = "";

  for (var i = 0; i < jobs.length; i++) {
    var job = jobs[i];
    html += '<tr>';
    html += '  <td><strong>' + job.customerName + '</strong></td>';
    html += '  <td><i class="bi bi-telephone text-primary me-1"></i>' + job.customerPhone + '</td>';
    html += '  <td>' + job.vehicleModel + ' (' + job.vehicleType + ')</td>';
    html += '  <td><span class="plate-badge">' + job.plateNumber + '</span></td>';
    html += '  <td><span class="badge bg-secondary">' + job.status.toUpperCase() + '</span></td>';
    html += '  <td class="text-end">';
    html += '    <a href="tel:' + job.customerPhone + '" class="btn btn-sm btn-outline-success py-1 px-2"><i class="bi bi-telephone me-1"></i>Call</a>';
    html += '  </td>';
    html += '</tr>';
  }

  tbody.innerHTML = html;
}

// ----------------------------------------------------------------
// 10. UPDATE REPAIR STATUS & APPROVALS
// ----------------------------------------------------------------
function updateStatus(jobId, newStatus, percent) {
  var jobs = getJobs();
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id == jobId) {
      jobs[i].status = newStatus;
      jobs[i].progressPercent = percent;
      if (newStatus == "ready") jobs[i].estimatedDuration = "Ready for Pickup";
      if (newStatus == "repairing") jobs[i].estimatedDuration = "Today by 5:30 PM";
      break;
    }
  }
  saveJobs(jobs);
  updateTopCounters();
  displayQuickTable();
  displayJobs();
}

function changeIssueApproval(jobId, issueId, newApproval) {
  var jobs = getJobs();
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id == jobId && jobs[i].discoveredIssues) {
      for (var j = 0; j < jobs[i].discoveredIssues.length; j++) {
        if (jobs[i].discoveredIssues[j].id == issueId) {
          jobs[i].discoveredIssues[j].approvalStatus = newApproval;
          break;
        }
      }
      break;
    }
  }
  saveJobs(jobs);
  updateTopCounters();
  displayQuickTable();
  displayJobs();
}

// ----------------------------------------------------------------
// 11. DELETE CUSTOMER RECORD ON PICKUP (Requirement 4)
// ----------------------------------------------------------------
function deleteCustomerJob(jobId) {
  var ok = confirm("CONFIRM VEHICLE PICKUP & PRIVACY DATA PURGE:\n\nHas the customer collected the vehicle and paid the bill?\n\nClick OK to purge/archive this customer personal data according to garage data privacy guidelines.");
  if (ok) {
    var jobs = getJobs();
    var newList = [];
    for (var i = 0; i < jobs.length; i++) {
      if (jobs[i].id != jobId) newList.push(jobs[i]);
    }
    saveJobs(newList);
    updateTopCounters();
    displayQuickTable();
    displayJobs();
    displayCustomers();
    alert("Record purged. Customer data has been removed from active garage floor.");
  }
}

// ----------------------------------------------------------------
// 12. NEW VEHICLE CHECK-IN FORM SUBMIT
// ----------------------------------------------------------------
function handleNewVehicleForm(event) {
  event.preventDefault();

  var name = document.getElementById("newCustomerName").value;
  var phone = document.getElementById("newCustomerPhone").value;
  var type = document.getElementById("newVehicleType").value;
  var model = document.getElementById("newVehicleModel").value;
  var plate = document.getElementById("newPlateNumber").value.toUpperCase();
  var issue = document.getElementById("newReportedIssue").value;
  var mechanicSelect = document.getElementById("mechanicSelect");
  var mechanicId = parseInt(mechanicSelect.value);
  var duration = document.getElementById("newEstimatedDuration").value || "Tomorrow 5:00 PM";
  var baseCost = parseFloat(document.getElementById("newBaseCost").value) || 800;
  var laborCost = parseFloat(document.getElementById("newLaborCost").value) || 350;

  var mechanics = getMechanics();
  var assignedName = "Unassigned";
  for (var m = 0; m < mechanics.length; m++) {
    if (mechanics[m].id == mechanicId) {
      assignedName = mechanics[m].name;
      break;
    }
  }

  var jobs = getJobs();
  var newJob = {
    id: "JOB-" + (100 + jobs.length + 1),
    customerName: name,
    customerPhone: phone,
    vehicleType: type,
    vehicleModel: model,
    plateNumber: plate,
    reportedIssue: issue,
    mechanicId: mechanicId,
    mechanicName: assignedName,
    status: "repairing",
    progressPercent: 20,
    estimatedDuration: duration,
    baseCost: baseCost,
    laborCost: laborCost,
    discoveredIssues: [],
    paymentStatus: "Unpaid",
    createdAt: "Just now"
  };

  jobs.unshift(newJob);
  saveJobs(jobs);

  document.getElementById("newVehicleForm").reset();

  var modalEl = document.getElementById("checkinModal");
  var modalInst = bootstrap.Modal.getInstance(modalEl);
  if (modalInst) modalInst.hide();

  updateTopCounters();
  displayQuickTable();
  displayJobs();
  displayMechanicsRoster();
  displayCustomers();
  switchAdminTab("repairs");
}

// ----------------------------------------------------------------
// 13. ADD EXTRA DISCOVERED PROBLEM (Requirement 2)
// ----------------------------------------------------------------
function openAddIssueModal(jobId) {
  activeJobIdForIssue = jobId;
  document.getElementById("issueJobIdDisplay").innerText = jobId;
  document.getElementById("issueDescription").value = "";
  document.getElementById("issueCost").value = "";
  document.getElementById("issueApproval").value = "pending";

  var modalEl = document.getElementById("addIssueModal");
  var modalInst = new bootstrap.Modal(modalEl);
  modalInst.show();
}

function handleAddIssueForm(event) {
  event.preventDefault();
  if (!activeJobIdForIssue) return;

  var desc = document.getElementById("issueDescription").value;
  var cost = parseFloat(document.getElementById("issueCost").value) || 0;
  var approval = document.getElementById("issueApproval").value;

  var jobs = getJobs();
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id == activeJobIdForIssue) {
      if (!jobs[i].discoveredIssues) jobs[i].discoveredIssues = [];
      jobs[i].discoveredIssues.push({
        id: new Date().getTime(),
        description: desc,
        estimatedCost: cost,
        approvalStatus: approval
      });
      break;
    }
  }

  saveJobs(jobs);

  var modalEl = document.getElementById("addIssueModal");
  var modalInst = bootstrap.Modal.getInstance(modalEl);
  if (modalInst) modalInst.hide();

  updateTopCounters();
  displayQuickTable();
  displayJobs();
}

// ----------------------------------------------------------------
// 14. SHOW INVOICE (Requirement 5)
// ----------------------------------------------------------------
function showInvoice(jobId) {
  var jobs = getJobs();
  var job = null;
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id == jobId) { job = jobs[i]; break; }
  }
  if (!job) return;

  var extraCost = 0;
  var extraRows = "";
  if (job.discoveredIssues) {
    for (var k = 0; k < job.discoveredIssues.length; k++) {
      var iss = job.discoveredIssues[k];
      if (iss.approvalStatus == "approved") {
        extraCost += iss.estimatedCost;
        extraRows += '<tr><td>Inspection Finding: ' + iss.description + '</td><td class="text-end">₹' + iss.estimatedCost.toLocaleString("en-IN") + '</td></tr>';
      }
    }
  }

  var total = job.baseCost + job.laborCost + extraCost;

  var html = '';
  html += '<div class="border p-3 bg-white rounded">';
  html += '  <div class="d-flex justify-content-between mb-3 border-bottom pb-2">';
  html += '    <h4 class="text-danger fw-bold"><i class="bi bi-gear-wide-connected me-2"></i>MechControl</h4>';
  html += '    <div class="text-end"><strong>Invoice #' + job.id + '</strong><div class="small text-muted">' + job.createdAt + '</div></div>';
  html += '  </div>';
  html += '  <div class="row mb-3 small">';
  html += '    <div class="col-6"><strong>Customer:</strong><br>' + job.customerName + '<br>Phone: ' + job.customerPhone + '<br>Vehicle: ' + job.vehicleModel + ' (' + job.plateNumber + ')</div>';
  html += '    <div class="col-6 text-end"><strong>Serviced By:</strong><br>' + job.mechanicName + '<br>Status: <span class="badge bg-success">' + job.status.toUpperCase() + '</span><br>Payment: ' + job.paymentStatus + '</div>';
  html += '  </div>';
  html += '  <table class="table table-bordered">';
  html += '    <thead class="table-light small"><tr><th>Service Item / Description</th><th class="text-end">Cost</th></tr></thead>';
  html += '    <tbody>';
  html += '      <tr><td>Primary Problem: ' + job.reportedIssue + '</td><td class="text-end">₹' + job.baseCost.toLocaleString("en-IN") + '</td></tr>';
  html += '      <tr><td>Mechanic Labor & Inspection Charges</td><td class="text-end">₹' + job.laborCost.toLocaleString("en-IN") + '</td></tr>';
  html +=         extraRows;
  html += '      <tr class="table-light fw-bold"><td>GRAND TOTAL AMOUNT</td><td class="text-end text-danger">₹' + total.toLocaleString("en-IN") + '</td></tr>';
  html += '    </tbody>';
  html += '  </table>';
  html += '</div>';

  document.getElementById("invoiceModalContent").innerHTML = html;
  var modalEl = document.getElementById("invoiceModal");
  var modalInst = new bootstrap.Modal(modalEl);
  modalInst.show();
}

// ----------------------------------------------------------------
// 15. CUSTOMER LIVE VIEW PREVIEW
// ----------------------------------------------------------------
function showCustomerPreview(jobId) {
  var jobs = getJobs();
  var job = null;
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id == jobId) { job = jobs[i]; break; }
  }
  if (!job) return;

  var extra = "";
  if (job.discoveredIssues && job.discoveredIssues.length > 0) {
    extra += '<div class="alert alert-warning small text-start mt-2 mb-0"><strong>Mechanic Found Additional Issue:</strong><ul class="mb-0 ps-3">';
    for (var k = 0; k < job.discoveredIssues.length; k++) {
      extra += '<li>' + job.discoveredIssues[k].description + ' (₹' + job.discoveredIssues[k].estimatedCost + ') - <strong>' + job.discoveredIssues[k].approvalStatus.toUpperCase() + '</strong></li>';
    }
    extra += '</ul></div>';
  }

  var html = '';
  html += '<div class="text-center p-3 bg-white border rounded">';
  html += '  <div class="badge bg-danger mb-2">MechControl Live Customer View</div>';
  html += '  <h5 class="fw-bold mb-1">' + job.vehicleModel + '</h5>';
  html += '  <div class="badge bg-dark mb-3">' + job.plateNumber + '</div>';
  html += '  <div class="p-3 bg-light rounded mb-2">';
  html += '    <small class="text-muted d-block">CURRENT REPAIR STAGE</small>';
  html += '    <h6 class="fw-bold text-primary text-uppercase mb-2">' + job.status.replace("-", " ") + '</h6>';
  html += '    <div class="progress mb-2"><div class="progress-bar bg-success" style="width: ' + job.progressPercent + '%;"></div></div>';
  html += '    <small class="text-muted">Estimated Ready: <strong>' + job.estimatedDuration + '</strong></small>';
  html += '  </div>';
  html += '  <div class="p-2 border rounded bg-light text-start mb-2 small">';
  html += '    <strong>Assigned Mechanic:</strong> ' + job.mechanicName;
  html += '  </div>';
  html +=    extra;
  html += '</div>';

  document.getElementById("customerViewContent").innerHTML = html;
  var modalEl = document.getElementById("customerViewModal");
  var modalInst = new bootstrap.Modal(modalEl);
  modalInst.show();
}

// ----------------------------------------------------------------
// 16. EVENT LISTENERS
// ----------------------------------------------------------------
function setupButtonListeners() {
  var search = document.getElementById("searchInput");
  if (search) {
    search.oninput = function() {
      currentSearchText = search.value;
      displayJobs();
    };
  }

  var pills = document.querySelectorAll(".filter-pill");
  for (var i = 0; i < pills.length; i++) {
    pills[i].onclick = function() {
      for (var j = 0; j < pills.length; j++) pills[j].classList.remove("active");
      this.classList.add("active");
      currentStatusFilter = this.getAttribute("data-status");
      displayJobs();
    };
  }

  var typeSelect = document.getElementById("vehicleTypeFilter");
  if (typeSelect) {
    typeSelect.onchange = function() {
      currentVehicleType = typeSelect.value;
      displayJobs();
    };
  }

  var newForm = document.getElementById("newVehicleForm");
  if (newForm) newForm.onsubmit = handleNewVehicleForm;

  var issueForm = document.getElementById("addIssueForm");
  if (issueForm) issueForm.onsubmit = handleAddIssueForm;
}
