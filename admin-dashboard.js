/* ================================================================
   admin-dashboard.js — Garage Management System
   Written in BASIC JavaScript (easy to understand and explain)
   ================================================================ */

// ----------------------------------------------------------------
// 1. DEFAULT DATA (Used if no data is stored in the browser yet)
// ----------------------------------------------------------------

// List of mechanics working in the garage
var DEFAULT_MECHANICS = [
  { id: 1, name: "Rajesh Kumar", phone: "98765-41122", specialty: "Bikes & Engines", status: "working" },
  { id: 2, name: "Vikram Sharma", phone: "98765-43344", specialty: "Brakes & Suspension", status: "working" },
  { id: 3, name: "Amit Patel", phone: "98765-45566", specialty: "Battery & Electrical", status: "working" },
  { id: 4, name: "Suresh Verma", phone: "98765-47788", specialty: "Oil & Tuning", status: "leave" },
  { id: 5, name: "Imran Khan", phone: "98765-49900", specialty: "Car AC & Cooling", status: "working" },
  { id: 6, name: "Manoj Rathod", phone: "98765-42233", specialty: "Denting & Painting", status: "leave" }
];

// Initial list of vehicle repair jobs
var DEFAULT_JOBS = [
  {
    id: "JOB-101",
    customerName: "Rahul Mehta",
    customerPhone: "9825012345",
    vehicleType: "Bike",
    vehicleModel: "Royal Enfield Classic 350",
    plateNumber: "GJ-01-EE-4512",
    reportedIssue: "Engine knocking noise and 10,000 km regular service.",
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
        description: "Front brake pads worn out; needs replacement.",
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
    reportedIssue: "Self starter not working properly.",
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
        description: "Battery voltage is low (dead cell); new battery required.",
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
    reportedIssue: "Chain adjustment and fork oil seal change.",
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
    reportedIssue: "AC blowing warm air, needs gas refilling.",
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
        description: "AC condenser coil blocked with dust; needs cleaning.",
        estimatedCost: 650,
        approvalStatus: "approved"
      }
    ],
    paymentStatus: "Unpaid",
    createdAt: "Today 11:00 AM"
  }
];

// Current filter values
var currentStatusFilter = "all";
var currentSearchText = "";
var currentVehicleType = "all";
var activeJobIdForIssue = null;

// ----------------------------------------------------------------
// 2. HELPER FUNCTIONS: Read & Write from LocalStorage
// ----------------------------------------------------------------

// Get mechanics list from browser storage
function getMechanics() {
  var saved = localStorage.getItem("gms_mechanics");
  if (saved == null) {
    localStorage.setItem("gms_mechanics", JSON.stringify(DEFAULT_MECHANICS));
    return DEFAULT_MECHANICS;
  }
  return JSON.parse(saved);
}

// Save mechanics list to browser storage
function saveMechanics(list) {
  localStorage.setItem("gms_mechanics", JSON.stringify(list));
}

// Get jobs list from browser storage
function getJobs() {
  var saved = localStorage.getItem("gms_jobs");
  if (saved == null) {
    localStorage.setItem("gms_jobs", JSON.stringify(DEFAULT_JOBS));
    return DEFAULT_JOBS;
  }
  return JSON.parse(saved);
}

// Save jobs list to browser storage
function saveJobs(list) {
  localStorage.setItem("gms_jobs", JSON.stringify(list));
}

// ----------------------------------------------------------------
// 3. STARTUP FUNCTION (Runs automatically when page loads)
// ----------------------------------------------------------------
window.onload = function() {
  startLiveClock();
  fillMechanicDropdown();
  updateTopCounters();
  displayJobs();
  setupButtonListeners();
};

// Simple live clock in header
function startLiveClock() {
  setInterval(function() {
    var now = new Date();
    var clockElement = document.getElementById("liveClock");
    if (clockElement) {
      clockElement.innerHTML = now.toLocaleDateString() + " " + now.toLocaleTimeString();
    }
  }, 1000);
}

// ----------------------------------------------------------------
// 4. FILL MECHANIC DROPDOWN in "Check-in Vehicle" Form
// ----------------------------------------------------------------
function fillMechanicDropdown() {
  var dropdown = document.getElementById("mechanicSelect");
  if (!dropdown) return;

  var mechanics = getMechanics();
  var html = '<option value="">-- Select a Mechanic --</option>';

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
// 5. UPDATE TOP KPI COUNTERS (Total working mechanics, bikes, revenue)
// ----------------------------------------------------------------
function updateTopCounters() {
  var mechanics = getMechanics();
  var jobs = getJobs();

  var workingMechanicsCount = 0;
  var onLeaveMechanicsCount = 0;

  for (var i = 0; i < mechanics.length; i++) {
    if (mechanics[i].status == "working") {
      workingMechanicsCount++;
    } else {
      onLeaveMechanicsCount++;
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

    // Add up total cost
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

  // Put numbers into HTML elements
  document.getElementById("statMechanicsWorking").innerText = workingMechanicsCount;
  document.getElementById("statMechanicsLeave").innerText = onLeaveMechanicsCount;
  document.getElementById("statRepairingCount").innerText = repairingCount;
  document.getElementById("statReadyCount").innerText = readyCount;
  document.getElementById("statCompletedCount").innerText = completedCount;
  document.getElementById("statTotalRevenue").innerText = "Rs. " + totalRevenue;
}

// ----------------------------------------------------------------
// 6. DISPLAY JOBS ON SCREEN (Cards)
// ----------------------------------------------------------------
function displayJobs() {
  var container = document.getElementById("jobsContainer");
  if (!container) return;

  var jobs = getJobs();
  var mechanics = getMechanics();

  var html = "";
  var countShown = 0;

  for (var i = 0; i < jobs.length; i++) {
    var job = jobs[i];

    // Filter by Status
    if (currentStatusFilter != "all" && job.status != currentStatusFilter) {
      continue;
    }

    // Filter by Vehicle Type
    if (currentVehicleType != "all" && job.vehicleType.toLowerCase() != currentVehicleType.toLowerCase()) {
      continue;
    }

    // Filter by Search Query
    if (currentSearchText.trim() != "") {
      var searchLower = currentSearchText.toLowerCase();
      var matchName = job.customerName.toLowerCase().indexOf(searchLower) != -1;
      var matchPhone = job.customerPhone.indexOf(searchLower) != -1;
      var matchPlate = job.plateNumber.toLowerCase().indexOf(searchLower) != -1;
      var matchModel = job.vehicleModel.toLowerCase().indexOf(searchLower) != -1;
      var matchId = job.id.toLowerCase().indexOf(searchLower) != -1;

      if (!matchName && !matchPhone && !matchPlate && !matchModel && !matchId) {
        continue;
      }
    }

    countShown++;

    // Find assigned mechanic
    var assignedMechanic = null;
    for (var m = 0; m < mechanics.length; m++) {
      if (mechanics[m].id == job.mechanicId) {
        assignedMechanic = mechanics[m];
        break;
      }
    }

    var mechanicName = assignedMechanic ? assignedMechanic.name : (job.mechanicName || "Not Assigned");
    var mechanicPhone = assignedMechanic ? assignedMechanic.phone : "N/A";
    var mechanicSpecialty = assignedMechanic ? assignedMechanic.specialty : "General Service";

    // Calculate total cost
    var extraCost = 0;
    var extraIssuesHtml = "";

    if (job.discoveredIssues && job.discoveredIssues.length > 0) {
      for (var e = 0; e < job.discoveredIssues.length; e++) {
        var issue = job.discoveredIssues[e];
        if (issue.approvalStatus == "approved") {
          extraCost += issue.estimatedCost;
        }

        var approvalBadge = '<span class="badge bg-warning text-dark">Pending Customer Approval</span>';
        if (issue.approvalStatus == "approved") {
          approvalBadge = '<span class="badge bg-success">Approved by Customer</span>';
        } else if (issue.approvalStatus == "declined") {
          approvalBadge = '<span class="badge bg-danger">Declined by Customer</span>';
        }

        extraIssuesHtml += '<div class="d-flex justify-content-between align-items-center py-1 border-bottom small">';
        extraIssuesHtml += '  <div><strong>' + issue.description + '</strong> (Rs. ' + issue.estimatedCost + ')</div>';
        extraIssuesHtml += '  <div>' + approvalBadge;
        extraIssuesHtml += '    <button class="btn btn-sm btn-outline-success py-0 px-1 ms-1" onclick="changeIssueApproval(\'' + job.id + '\', ' + issue.id + ', \'approved\')">Yes</button>';
        extraIssuesHtml += '    <button class="btn btn-sm btn-outline-danger py-0 px-1 ms-1" onclick="changeIssueApproval(\'' + job.id + '\', ' + issue.id + ', \'declined\')">No</button>';
        extraIssuesHtml += '  </div>';
        extraIssuesHtml += '</div>';
      }
    } else {
      extraIssuesHtml = '<div class="text-muted small">No extra problems found by mechanic.</div>';
    }

    var totalCost = job.baseCost + job.laborCost + extraCost;

    // Status Label and Badge
    var statusBadgeClass = "bg-secondary";
    var statusText = "In Queue";

    if (job.status == "repairing") {
      statusBadgeClass = "bg-primary";
      statusText = "Repair In Progress";
    } else if (job.status == "awaiting-parts") {
      statusBadgeClass = "bg-warning text-dark";
      statusText = "Awaiting Parts";
    } else if (job.status == "ready") {
      statusBadgeClass = "bg-success";
      statusText = "Ready for Pickup";
    } else if (job.status == "completed") {
      statusBadgeClass = "bg-dark";
      statusText = "Completed";
    }

    // Vehicle Icon
    var vehicleIcon = "bi-bicycle";
    if (job.vehicleType == "Car") vehicleIcon = "bi-car-front";
    if (job.vehicleType == "Scooter") vehicleIcon = "bi-moped";

    // Requirement 4: Pickup & Privacy Notice
    var pickupBoxHtml = "";
    if (job.status == "ready" || job.status == "completed") {
      pickupBoxHtml += '<div class="pickup-notice-box">';
      pickupBoxHtml += '  <div class="pickup-notice-title"><i class="bi bi-shield-check me-1"></i> Customer Pickup & Data Privacy Notice:</div>';
      pickupBoxHtml += '  <div class="pickup-notice-text">When the customer collects their vehicle and pays Rs. ' + totalCost + ', please delete/archive this customer record from the active garage database to protect personal customer data.</div>';
      pickupBoxHtml += '  <button class="btn btn-sm btn-danger" onclick="deleteCustomerJob(\'' + job.id + '\')">';
      pickupBoxHtml += '    <i class="bi bi-trash me-1"></i> Mark as Picked Up & Delete Active Record';
      pickupBoxHtml += '  </button>';
      pickupBoxHtml += '</div>';
    }

    // Build the complete Job Card HTML
    html += '<div class="col-12 col-md-6 mb-4">';
    html += '  <div class="job-card">';

    // Header
    html += '    <div class="job-header d-flex justify-content-between align-items-center">';
    html += '      <div>';
    html += '        <strong>' + job.id + '</strong> ';
    html += '        <span class="plate-badge"><i class="bi ' + vehicleIcon + ' me-1"></i>' + job.plateNumber + '</span> ';
    html += '        <span class="badge ' + statusBadgeClass + '">' + statusText + '</span>';
    html += '      </div>';
    html += '      <div>';
    html += '        <button class="btn btn-sm btn-outline-secondary me-1" onclick="showCustomerPreview(\'' + job.id + '\')">Customer View</button>';
    html += '        <button class="btn btn-sm btn-outline-primary" onclick="showInvoice(\'' + job.id + '\')">Invoice</button>';
    html += '      </div>';
    html += '    </div>';

    // Body
    html += '    <div class="job-body">';

    // Customer & Vehicle Info
    html += '      <div class="row mb-2">';
    html += '        <div class="col-6">';
    html += '          <div class="text-muted small">CUSTOMER:</div>';
    html += '          <strong>' + job.customerName + '</strong>';
    html += '          <div class="small text-muted"><i class="bi bi-telephone me-1"></i>' + job.customerPhone + '</div>';
    html += '        </div>';
    html += '        <div class="col-6">';
    html += '          <div class="text-muted small">VEHICLE:</div>';
    html += '          <strong>' + job.vehicleModel + '</strong> (' + job.vehicleType + ')';
    html += '        </div>';
    html += '      </div>';

    // Problem Reported
    html += '      <div class="p-2 mb-2 bg-light border rounded small">';
    html += '        <strong>Problem Reported:</strong> ' + job.reportedIssue;
    html += '      </div>';

    // Mechanic & Estimated Duration
    html += '      <div class="row mb-2 align-items-center">';
    html += '        <div class="col-7">';
    html += '          <div class="text-muted small">ASSIGNED MECHANIC:</div>';
    html += '          <div class="mechanic-assigned-box">';
    html += '            <strong>' + mechanicName + '</strong>';
    html += '            <div class="small text-muted">' + mechanicSpecialty + ' | Ph: ' + mechanicPhone + '</div>';
    html += '          </div>';
    html += '        </div>';
    html += '        <div class="col-5">';
    html += '          <div class="text-muted small">REPAIR TIME:</div>';
    html += '          <div class="p-2 bg-light border rounded text-center">';
    html += '            <strong class="text-primary small">' + job.estimatedDuration + '</strong>';
    html += '            <div class="progress my-1" style="height: 6px;">';
    html += '              <div class="progress-bar bg-success" style="width: ' + job.progressPercent + '%;"></div>';
    html += '            </div>';
    html += '            <span class="small text-muted">' + job.progressPercent + '% Finished</span>';
    html += '          </div>';
    html += '        </div>';
    html += '      </div>';

    // Requirement 2: Unexpected Mechanic Findings Box
    html += '      <div class="discovered-issue-box">';
    html += '        <div class="d-flex justify-content-between align-items-center mb-1">';
    html += '          <span class="discovered-issue-title"><i class="bi bi-exclamation-triangle-fill me-1"></i> Extra Problems Discovered by Mechanic:</span>';
    html += '          <button class="btn btn-sm btn-outline-warning text-dark fw-bold py-0 px-2" onclick="openAddIssueModal(\'' + job.id + '\')">+ Add Extra Finding</button>';
    html += '        </div>';
    html += '        <div>' + extraIssuesHtml + '</div>';
    html += '      </div>';

    // Requirement 5: Cost Breakdown & Status Selector
    html += '      <div class="row align-items-center mt-3 pt-2 border-top">';
    html += '        <div class="col-7">';
    html += '          <div class="text-muted small">TOTAL BILL AMOUNT:</div>';
    html += '          <h5 class="fw-bold mb-0 text-dark">Rs. ' + totalCost + ' <span class="badge bg-info text-dark" style="font-size: 11px;">' + job.paymentStatus + '</span></h5>';
    html += '          <div class="text-muted" style="font-size: 11px;">Base: Rs. ' + job.baseCost + ' | Labor: Rs. ' + job.laborCost + ' | Extra: Rs. ' + extraCost + '</div>';
    html += '        </div>';
    html += '        <div class="col-5 text-end">';
    html += '          <div class="dropdown">';
    html += '            <button class="btn btn-sm btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">Change Status</button>';
    html += '            <ul class="dropdown-menu dropdown-menu-end shadow">';
    html += '              <li><a class="dropdown-item" href="javascript:void(0)" onclick="updateStatus(\'' + job.id + '\', \'pending\', 10)">In Queue (10%)</a></li>';
    html += '              <li><a class="dropdown-item" href="javascript:void(0)" onclick="updateStatus(\'' + job.id + '\', \'repairing\', 60)">Repairing (60%)</a></li>';
    html += '              <li><a class="dropdown-item" href="javascript:void(0)" onclick="updateStatus(\'' + job.id + '\', \'awaiting-parts\', 35)">Awaiting Parts (35%)</a></li>';
    html += '              <li><a class="dropdown-item text-success fw-bold" href="javascript:void(0)" onclick="updateStatus(\'' + job.id + '\', \'ready\', 100)">Ready for Pickup (100%)</a></li>';
    html += '            </ul>';
    html += '          </div>';
    html += '        </div>';
    html += '      </div>';

    // Requirement 4: Pickup & Data Delete Notice
    html += pickupBoxHtml;

    html += '    </div>'; // end job-body
    html += '  </div>';   // end job-card
    html += '</div>';     // end col
  }

  if (countShown == 0) {
    html = '<div class="col-12 text-center p-4 bg-white border rounded text-muted">No vehicle records found for this filter.</div>';
  }

  container.innerHTML = html;
}

// ----------------------------------------------------------------
// 7. CHANGE JOB REPAIR STATUS
// ----------------------------------------------------------------
function updateStatus(jobId, newStatus, percent) {
  var jobs = getJobs();
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id == jobId) {
      jobs[i].status = newStatus;
      jobs[i].progressPercent = percent;
      if (newStatus == "ready") {
        jobs[i].estimatedDuration = "Ready for Pickup";
      }
      break;
    }
  }
  saveJobs(jobs);
  updateTopCounters();
  displayJobs();
}

// ----------------------------------------------------------------
// 8. APPROVE OR DECLINE AN EXTRA DISCOVERED PROBLEM
// ----------------------------------------------------------------
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
  displayJobs();
}

// ----------------------------------------------------------------
// 9. DELETE/ARCHIVE CUSTOMER DATA ON PICKUP (Requirement 4)
// ----------------------------------------------------------------
function deleteCustomerJob(jobId) {
  var confirmDelete = confirm("Has the customer picked up this vehicle and paid the bill?\n\nClick OK to delete/archive this customer personal data according to garage privacy guidelines.");
  if (confirmDelete) {
    var jobs = getJobs();
    var newList = [];
    for (var i = 0; i < jobs.length; i++) {
      if (jobs[i].id != jobId) {
        newList.push(jobs[i]);
      }
    }
    saveJobs(newList);
    updateTopCounters();
    displayJobs();
    alert("Record deleted. Customer data has been removed from active garage floor.");
  }
}

// ----------------------------------------------------------------
// 10. ADD A NEW VEHICLE (Check-in Form Submit)
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
  var baseCost = parseFloat(document.getElementById("newBaseCost").value) || 500;
  var laborCost = parseFloat(document.getElementById("newLaborCost").value) || 300;

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

  // Close modal
  var modalElement = document.getElementById("checkinModal");
  var modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) modalInstance.hide();

  updateTopCounters();
  displayJobs();
}

// ----------------------------------------------------------------
// 11. ADD EXTRA PROBLEM FOUND BY MECHANIC (Requirement 2)
// ----------------------------------------------------------------
function openAddIssueModal(jobId) {
  activeJobIdForIssue = jobId;
  document.getElementById("issueJobIdDisplay").innerText = jobId;
  document.getElementById("issueDescription").value = "";
  document.getElementById("issueCost").value = "";
  document.getElementById("issueApproval").value = "pending";

  var modalElement = document.getElementById("addIssueModal");
  var modalInstance = new bootstrap.Modal(modalElement);
  modalInstance.show();
}

function handleAddIssueForm(event) {
  event.preventDefault();
  if (!activeJobIdForIssue) return;

  var description = document.getElementById("issueDescription").value;
  var cost = parseFloat(document.getElementById("issueCost").value) || 0;
  var approval = document.getElementById("issueApproval").value;

  var jobs = getJobs();
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id == activeJobIdForIssue) {
      if (!jobs[i].discoveredIssues) {
        jobs[i].discoveredIssues = [];
      }
      jobs[i].discoveredIssues.push({
        id: new Date().getTime(),
        description: description,
        estimatedCost: cost,
        approvalStatus: approval
      });
      break;
    }
  }

  saveJobs(jobs);

  var modalElement = document.getElementById("addIssueModal");
  var modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) modalInstance.hide();

  updateTopCounters();
  displayJobs();
}

// ----------------------------------------------------------------
// 12. MECHANIC ROSTER MANAGEMENT (Working vs On Leave)
// ----------------------------------------------------------------
function openMechanicsModal() {
  var mechanics = getMechanics();
  var jobs = getJobs();
  var tableBody = document.getElementById("mechanicsListContainer");
  var html = "";

  for (var i = 0; i < mechanics.length; i++) {
    var m = mechanics[i];

    // Count how many active jobs this mechanic is working on
    var activeJobsCount = 0;
    for (var j = 0; j < jobs.length; j++) {
      if (jobs[j].mechanicId == m.id && (jobs[j].status == "repairing" || jobs[j].status == "awaiting-parts")) {
        activeJobsCount++;
      }
    }

    var isWorking = m.status == "working";
    var statusBadge = isWorking ? '<span class="badge bg-success">Working Today</span>' : '<span class="badge bg-secondary">On Leave</span>';
    var actionButton = isWorking
      ? '<button class="btn btn-sm btn-outline-danger" onclick="toggleMechanicDuty(' + m.id + ')">Mark On Leave</button>'
      : '<button class="btn btn-sm btn-outline-success" onclick="toggleMechanicDuty(' + m.id + ')">Mark Working</button>';

    html += '<tr>';
    html += '  <td><strong>' + m.name + '</strong><div class="small text-muted">' + m.phone + '</div></td>';
    html += '  <td>' + m.specialty + '</td>';
    html += '  <td>' + statusBadge + '</td>';
    html += '  <td><span class="badge bg-primary">' + activeJobsCount + ' Active Vehicles</span></td>';
    html += '  <td class="text-end">' + actionButton + '</td>';
    html += '</tr>';
  }

  tableBody.innerHTML = html;

  var modalElement = document.getElementById("mechanicsModal");
  var modalInstance = new bootstrap.Modal(modalElement);
  modalInstance.show();
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
  openMechanicsModal();
}

// ----------------------------------------------------------------
// 13. SHOW INVOICE MODAL (Requirement 5)
// ----------------------------------------------------------------
function showInvoice(jobId) {
  var jobs = getJobs();
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
        extraRows += '<tr><td>Extra Finding: ' + iss.description + '</td><td class="text-end">Rs. ' + iss.estimatedCost + '</td></tr>';
      }
    }
  }

  var grandTotal = job.baseCost + job.laborCost + extraCost;

  var invoiceHtml = '';
  invoiceHtml += '<div class="border p-3 bg-white">';
  invoiceHtml += '  <div class="d-flex justify-content-between mb-3 border-bottom pb-2">';
  invoiceHtml += '    <h4 class="text-danger fw-bold"><i class="bi bi-tools me-2"></i>Garage Management System</h4>';
  invoiceHtml += '    <div class="text-end"><strong>Invoice #' + job.id + '</strong><div class="small text-muted">' + job.createdAt + '</div></div>';
  invoiceHtml += '  </div>';
  invoiceHtml += '  <div class="row mb-3">';
  invoiceHtml += '    <div class="col-6"><strong>Billed To:</strong><br>' + job.customerName + '<br>Phone: ' + job.customerPhone + '<br>Vehicle: ' + job.vehicleModel + ' (' + job.plateNumber + ')</div>';
  invoiceHtml += '    <div class="col-6 text-end"><strong>Mechanic:</strong> ' + job.mechanicName + '<br>Status: <span class="badge bg-success">' + job.status + '</span><br>Payment: ' + job.paymentStatus + '</div>';
  invoiceHtml += '  </div>';
  invoiceHtml += '  <table class="table table-bordered">';
  invoiceHtml += '    <thead class="table-light"><tr><th>Service / Item</th><th class="text-end">Cost</th></tr></thead>';
  invoiceHtml += '    <tbody>';
  invoiceHtml += '      <tr><td>Primary Problem: ' + job.reportedIssue + '</td><td class="text-end">Rs. ' + job.baseCost + '</td></tr>';
  invoiceHtml += '      <tr><td>Mechanic Labor & Inspection Charges</td><td class="text-end">Rs. ' + job.laborCost + '</td></tr>';
  invoiceHtml +=         extraRows;
  invoiceHtml += '      <tr class="table-light fw-bold"><td>GRAND TOTAL</td><td class="text-end text-danger">Rs. ' + grandTotal + '</td></tr>';
  invoiceHtml += '    </tbody>';
  invoiceHtml += '  </table>';
  invoiceHtml += '</div>';

  document.getElementById("invoiceModalContent").innerHTML = invoiceHtml;
  var modalElement = document.getElementById("invoiceModal");
  var modalInstance = new bootstrap.Modal(modalElement);
  modalInstance.show();
}

// ----------------------------------------------------------------
// 14. SHOW CUSTOMER PREVIEW (What the customer sees on their phone)
// ----------------------------------------------------------------
function showCustomerPreview(jobId) {
  var jobs = getJobs();
  var job = null;
  for (var i = 0; i < jobs.length; i++) {
    if (jobs[i].id == jobId) {
      job = jobs[i];
      break;
    }
  }
  if (!job) return;

  var previewHtml = '';
  previewHtml += '<div class="text-center p-3 bg-white border rounded">';
  previewHtml += '  <div class="badge bg-danger mb-2">Live Vehicle Status</div>';
  previewHtml += '  <h5 class="fw-bold mb-1">' + job.vehicleModel + '</h5>';
  previewHtml += '  <div class="badge bg-dark mb-3">' + job.plateNumber + '</div>';
  previewHtml += '  <div class="p-3 bg-light rounded mb-3">';
  previewHtml += '    <div class="text-muted small">CURRENT STAGE:</div>';
  previewHtml += '    <h6 class="fw-bold text-primary text-uppercase mb-2">' + job.status + '</h6>';
  previewHtml += '    <div class="progress mb-2"><div class="progress-bar bg-success" style="width: ' + job.progressPercent + '%;"></div></div>';
  previewHtml += '    <div class="small text-muted">Estimated Ready: <strong>' + job.estimatedDuration + '</strong></div>';
  previewHtml += '  </div>';
  previewHtml += '  <div class="p-2 border rounded bg-light mb-2 text-start">';
  previewHtml += '    <small class="text-muted d-block">YOUR ASSIGNED MECHANIC:</small>';
  previewHtml += '    <strong>' + job.mechanicName + '</strong>';
  previewHtml += '  </div>';
  previewHtml += '  <div class="small text-muted mt-2"><i class="bi bi-shield-check text-success me-1"></i>Garage Live Customer Tracking</div>';
  previewHtml += '</div>';

  document.getElementById("customerViewContent").innerHTML = previewHtml;
  var modalElement = document.getElementById("customerViewModal");
  var modalInstance = new bootstrap.Modal(modalElement);
  modalInstance.show();
}

// ----------------------------------------------------------------
// 15. BUTTON & SEARCH EVENT LISTENERS
// ----------------------------------------------------------------
function setupButtonListeners() {
  // Live search input
  var searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.oninput = function() {
      currentSearchText = searchInput.value;
      displayJobs();
    };
  }

  // Filter Buttons (All, In Progress, Ready, etc.)
  var filterButtons = document.querySelectorAll(".filter-btn");
  for (var i = 0; i < filterButtons.length; i++) {
    filterButtons[i].onclick = function() {
      for (var j = 0; j < filterButtons.length; j++) {
        filterButtons[j].classList.remove("active");
      }
      this.classList.add("active");
      currentStatusFilter = this.getAttribute("data-status");
      displayJobs();
    };
  }

  // Vehicle Type Dropdown
  var typeSelect = document.getElementById("vehicleTypeFilter");
  if (typeSelect) {
    typeSelect.onchange = function() {
      currentVehicleType = typeSelect.value;
      displayJobs();
    };
  }

  // Forms
  var newVehicleForm = document.getElementById("newVehicleForm");
  if (newVehicleForm) {
    newVehicleForm.onsubmit = handleNewVehicleForm;
  }

  var addIssueForm = document.getElementById("addIssueForm");
  if (addIssueForm) {
    addIssueForm.onsubmit = handleAddIssueForm;
  }
}
