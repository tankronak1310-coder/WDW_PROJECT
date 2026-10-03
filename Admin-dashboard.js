/* ================================================================
   admin-dashboard.js — Garage Management System
   All interactivity for the Admin Dashboard.
   Depends on: admin-data.js (loaded first in HTML)
   ================================================================

   TABLE OF CONTENTS
   -----------------
   1.  SPA Navigation
   2.  Toast Notification
   3.  Dashboard Section
       3a. Summary Cards
       3b. Repairs Table (with search + filter)
       3c. Activity Feed
   4.  Vehicles Section
       4a. Render table
       4b. Search
       4c. Add Vehicle modal
       4d. Delete vehicle
   5.  Repairs Section
       5a. Render table (with search + filter)
       5b. New Repair modal
       5c. View Details modal
       5d. Update Status modal
       5e. Assign Mechanic modal
       5f. Bill modal
   6.  Mechanics Section
   7.  Customers Section (with search)
   8.  Contact Section (form validation)
   9.  Init — wire everything up on DOMContentLoaded
================================================================ */


/* ════════════════════════════════════════════════════════════
   1. SPA NAVIGATION
════════════════════════════════════════════════════════════ */

const SECTIONS = ['dashboard','vehicles','repairs','mechanics','customers','contact'];

function showSection(key) {
  SECTIONS.forEach(s => {
    const el = document.getElementById('sec-' + s);
    if (el) el.classList.toggle('d-none', s !== key);
  });
  document.querySelectorAll('.adm-nav-link').forEach(a => {
    const active = a.dataset.section === key;
    a.classList.toggle('active', active);
    a.setAttribute('aria-current', active ? 'page' : 'false');
  });
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Close mobile nav
  const nav = document.getElementById('adminNav');
  if (nav.classList.contains('show')) {
    bootstrap.Collapse.getInstance(nav)?.hide();
  }
}

function initNav() {
  document.querySelectorAll('.adm-nav-link, .adm-brand').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const s = a.dataset.section;
      if (s) showSection(s);
    });
  });
}


/* ════════════════════════════════════════════════════════════
   2. TOAST NOTIFICATION
════════════════════════════════════════════════════════════ */

let toastTimer = null;

function showToast(msg, type = 'success') {
  const toast = document.getElementById('admToast');
  const icon  = document.getElementById('toastIcon');
  const msgEl = document.getElementById('toastMsg');
  icon.className = type === 'success'
    ? 'bi bi-check-circle-fill me-2 text-success'
    : 'bi bi-exclamation-circle-fill me-2 text-warning';
  msgEl.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}


/* ════════════════════════════════════════════════════════════
   3. DASHBOARD SECTION
════════════════════════════════════════════════════════════ */

/* ── 3a. Summary Cards ── */
function renderSummaryCards() {
  const totalVehicles   = vehicles.length;
  const activeRepairs   = repairs.filter(r => ['Received','In Progress','Quality Check'].includes(r.status)).length;
  const completedRep    = repairs.filter(r => r.status === 'Completed').length;
  const totalCustomers  = customers.length;
  const revenue         = repairs.filter(r => r.billType === 'final').reduce((s, r) => s + r.parts + r.labor, 0);

  const cards = [
    { label: 'Total Vehicles',    value: totalVehicles,         sub: 'in system',           icon: 'bi-car-front-fill',    ic: 'ic-blue'   },
    { label: 'Active Repairs',    value: activeRepairs,         sub: 'in progress',         icon: 'bi-wrench-adjustable', ic: 'ic-orange' },
    { label: 'Completed Repairs', value: completedRep,          sub: 'this month',          icon: 'bi-check2-all',        ic: 'ic-green'  },
    { label: 'Total Customers',   value: totalCustomers,        sub: 'registered',          icon: 'bi-people-fill',       ic: 'ic-purple' },
    { label: 'Revenue',           value: formatINR(revenue),    sub: 'from final bills',    icon: 'bi-currency-rupee',    ic: 'ic-yellow' },
  ];

  const wrap = document.getElementById('summaryCards');
  wrap.innerHTML = cards.map(c => `
    <div class="col-6 col-md-4 col-lg-2-4">
      <div class="adm-stat-card">
        <div class="adm-stat-icon-wrap ${c.ic}">
          <i class="bi ${c.icon}"></i>
        </div>
        <div class="adm-stat-info">
          <div class="adm-stat-label">${c.label}</div>
          <div class="adm-stat-value">${c.value}</div>
          <div class="adm-stat-sub">${c.sub}</div>
        </div>
      </div>
    </div>`).join('');

  // Inject today's date
  document.getElementById('todayDate').textContent =
    new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

/* ── 3b. Dashboard Repair Table ── */
function renderDashRepairTable(filterText = '', filterStatus = '') {
  const body = document.getElementById('dashRepairBody');
  const rows = repairs
    .map(repairFull)
    .filter(r => {
      const txt = (r.customer.name + r.vehicle.make + r.vehicle.model + r.vehicle.reg + r.mechanic.name + r.problem).toLowerCase();
      const matchText   = !filterText   || txt.includes(filterText.toLowerCase());
      const matchStatus = !filterStatus || r.status === filterStatus;
      return matchText && matchStatus;
    });

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">No repairs found.</td></tr>`;
    return;
  }

  body.innerHTML = rows.map(r => `
    <tr>
      <td><strong>#${r.id}</strong></td>
      <td>${r.customer.name || '—'}</td>
      <td>${r.vehicle.make} ${r.vehicle.model}</td>
      <td><span class="adm-reg">${r.vehicle.reg}</span></td>
      <td>${r.mechanic.name || '—'}</td>
      <td class="adm-problem-cell" title="${r.problem}">${r.problem}</td>
      <td>${statusBadge(r.status)}</td>
      <td>${r.dropoff}</td>
      <td>
        ${formatINR(r.total)}
        <span class="adm-bill-chip ${r.billType === 'final' ? 'bill-final' : 'bill-estimated'}">
          ${r.billType === 'final' ? 'Final' : 'Est.'}
        </span>
      </td>
      <td>${repairActionsMenu(r.id)}</td>
    </tr>`).join('');

  attachRepairActionListeners(body);
}

/* ── 3c. Activity Feed ── */
function renderActivityFeed() {
  const feed = document.getElementById('activityFeed');
  feed.innerHTML = activityLog.map(a => `
    <div class="adm-activity-item">
      <div class="adm-activity-icon">
        <i class="bi ${a.icon} ${a.color}"></i>
      </div>
      <div>
        <div>${a.text}</div>
        <div class="adm-activity-time"><i class="bi bi-clock me-1"></i>${a.time}</div>
      </div>
    </div>`).join('');
}


/* ════════════════════════════════════════════════════════════
   4. VEHICLES SECTION
════════════════════════════════════════════════════════════ */

function renderVehicleTable(filterText = '') {
  const body = document.getElementById('vehicleBody');
  const rows = vehicles.filter(v => {
    const c = getCustomer(v.customerId);
    const txt = (c.name + v.make + v.model + v.reg + v.year + v.color).toLowerCase();
    return !filterText || txt.includes(filterText.toLowerCase());
  });

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="11" class="text-center text-muted py-4">No vehicles found.</td></tr>`;
    updateClearBtn();
    return;
  }

  body.innerHTML = rows.map(v => {
    const c    = getCustomer(v.customerId);
    const rep  = repairs.filter(r => r.vehicleId === v.id).sort((a,b) => b.id - a.id)[0];
    const mech = rep ? getMechanic(rep.mechanicId) : null;
    // Auto-check vehicles whose latest repair is Completed
    const isCompleted = rep && rep.status === 'Completed';
    return `
      <tr class="${isCompleted ? 'row-completed' : ''}">
        <td>
          <input type="checkbox" class="adm-checkbox vehicle-chk" data-vehicle-id="${v.id}"
            aria-label="Select vehicle ${v.reg}" ${isCompleted ? 'checked' : ''}/>
        </td>
        <td><strong>#${v.id}</strong></td>
        <td>${c.name || '—'}</td>
        <td><strong>${v.make} ${v.model}</strong></td>
        <td>${v.year}</td>
        <td><span class="adm-reg">${v.reg}</span></td>
        <td>${v.color}</td>
        <td>${rep ? statusBadge(rep.status) : '<span class="text-muted">No repair</span>'}</td>
        <td>${mech ? mech.name : '—'}</td>
        <td>${rep ? `${formatINR(rep.parts + rep.labor)} <span class="adm-bill-chip ${rep.billType==='final'?'bill-final':'bill-estimated'}">${rep.billType==='final'?'Final':'Est.'}</span>` : '—'}</td>
        <td>
          <button class="adm-icon-btn edit" title="Edit vehicle" data-edit-vehicle="${v.id}" aria-label="Edit vehicle ${v.reg}"><i class="bi bi-pencil-fill"></i></button>
          <button class="adm-icon-btn del"  title="Remove vehicle" data-del-vehicle="${v.id}" aria-label="Remove vehicle ${v.reg}"><i class="bi bi-trash-fill"></i></button>
        </td>
      </tr>`;
  }).join('');

  // ── Sync "Select All" checkbox state ──
  updateSelectAllState();

  // ── Each checkbox: update Clear button visibility ──
  body.querySelectorAll('.vehicle-chk').forEach(chk => {
    chk.addEventListener('change', () => {
      updateSelectAllState();
      updateClearBtn();
    });
  });

  // ── Individual delete button ──
  body.querySelectorAll('[data-del-vehicle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.dataset.delVehicle;
      if (confirm('Remove this vehicle from the demo? (Not saved to a real database)')) {
        removeVehicleById(id);
        renderVehicleTable(document.getElementById('vehicleSearch').value);
        renderDashRepairTable();
        renderSummaryCards();
        showToast('Vehicle removed (demo only)');
      }
    });
  });

  updateClearBtn();
}

/* ── Helper: get IDs of all checked vehicles ── */
function getCheckedVehicleIds() {
  return [...document.querySelectorAll('.vehicle-chk:checked')]
    .map(chk => +chk.dataset.vehicleId);
}

/* ── Helper: show/hide Clear Selected button ── */
function updateClearBtn() {
  const btn = document.getElementById('clearSelectedBtn');
  if (!btn) return;
  const count = getCheckedVehicleIds().length;
  btn.classList.toggle('d-none', count === 0);
  btn.textContent = '';
  btn.innerHTML = `<i class="bi bi-trash-fill me-1"></i>Clear Selected (${count})`;
}

/* ── Helper: sync the Select All checkbox ── */
function updateSelectAllState() {
  const all  = document.querySelectorAll('.vehicle-chk');
  const chkd = document.querySelectorAll('.vehicle-chk:checked');
  const selectAll = document.getElementById('selectAllVehicles');
  if (!selectAll) return;
  selectAll.checked       = all.length > 0 && chkd.length === all.length;
  selectAll.indeterminate = chkd.length > 0 && chkd.length < all.length;
}

/* ── Helper: remove a vehicle + its repairs from data arrays ── */
function removeVehicleById(id) {
  // Remove all repairs linked to this vehicle first
  for (let i = repairs.length - 1; i >= 0; i--) {
    if (repairs[i].vehicleId === id) repairs.splice(i, 1);
  }
  // Remove the vehicle itself
  const idx = vehicles.findIndex(v => v.id === id);
  if (idx > -1) vehicles.splice(idx, 1);
}

function initVehiclesSection() {
  document.getElementById('vehicleSearch').addEventListener('input', function() {
    renderVehicleTable(this.value);
  });

  // ── Select All checkbox ──
  document.getElementById('selectAllVehicles').addEventListener('change', function() {
    document.querySelectorAll('.vehicle-chk').forEach(chk => {
      chk.checked = this.checked;
    });
    updateClearBtn();
  });

  // ── Clear Selected button ──
  document.getElementById('clearSelectedBtn').addEventListener('click', () => {
    const ids = getCheckedVehicleIds();
    if (!ids.length) return;
    if (!confirm(`Remove ${ids.length} selected vehicle(s) from the demo? Their repair records will also be removed.`)) return;

    ids.forEach(id => removeVehicleById(id));

    renderVehicleTable(document.getElementById('vehicleSearch').value);
    renderDashRepairTable();
    renderRepairTable();
    renderSummaryCards();
    renderActivityFeed();
    showToast(`${ids.length} vehicle(s) cleared (demo only)`);
  });

  // Add Vehicle button → modal
  document.getElementById('addVehicleBtn').addEventListener('click', () => {
    // Populate customer dropdown
    const sel = document.getElementById('vehCustomer');
    sel.innerHTML = customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    new bootstrap.Modal(document.getElementById('addVehicleModal')).show();
  });

  // Save Vehicle
  document.getElementById('saveVehicleBtn').addEventListener('click', () => {
    const cid   = +document.getElementById('vehCustomer').value;
    const make  = document.getElementById('vehMake').value.trim();
    const model = document.getElementById('vehModel').value.trim();
    const year  = +document.getElementById('vehYear').value || new Date().getFullYear();
    const color = document.getElementById('vehColor').value.trim() || 'N/A';
    const reg   = document.getElementById('vehReg').value.trim();

    if (!make || !model || !reg) { alert('Please fill in Make, Model, and Registration.'); return; }

    const newId = Math.max(...vehicles.map(v => v.id), 0) + 1;
    vehicles.push({ id: newId, customerId: cid, make, model, year, reg, color });
    bootstrap.Modal.getInstance(document.getElementById('addVehicleModal')).hide();
    renderVehicleTable(document.getElementById('vehicleSearch').value);
    showToast('Vehicle added (demo only)');

    // Clear fields
    ['vehMake','vehModel','vehYear','vehColor','vehReg'].forEach(id => document.getElementById(id).value = '');
  });
}


/* ════════════════════════════════════════════════════════════
   5. REPAIRS SECTION
════════════════════════════════════════════════════════════ */

/* ── Actions dropdown HTML ── */
function repairActionsMenu(repairId) {
  return `
    <div class="dropdown">
      <button class="adm-action-btn dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Actions for repair ${repairId}">
        <i class="bi bi-three-dots-vertical"></i>
      </button>
      <ul class="dropdown-menu adm-dropdown-menu">
        <li><button class="adm-dropdown-item" data-action="view"   data-repair-id="${repairId}"><i class="bi bi-eye text-primary"></i> View Details</button></li>
        <li><button class="adm-dropdown-item" data-action="status" data-repair-id="${repairId}"><i class="bi bi-arrow-repeat text-warning"></i> Update Status</button></li>
        <li><button class="adm-dropdown-item" data-action="assign" data-repair-id="${repairId}"><i class="bi bi-person-badge text-success"></i> Assign Mechanic</button></li>
        <li><button class="adm-dropdown-item" data-action="bill"   data-repair-id="${repairId}"><i class="bi bi-receipt text-danger"></i> View / Edit Bill</button></li>
      </ul>
    </div>`;
}

/* ── Attach listeners to action dropdowns ── */
function attachRepairActionListeners(container) {
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id     = +btn.dataset.repairId;
      const action = btn.dataset.action;
      if      (action === 'view')   openRepairDetail(id);
      else if (action === 'status') openUpdateStatus(id);
      else if (action === 'assign') openAssignMechanic(id);
      else if (action === 'bill')   openBillModal(id);
    });
  });
}

/* ── Full repairs table ── */
function renderRepairTable(filterText = '', filterStatus = '') {
  const body = document.getElementById('repairBody');
  const rows = repairs.map(repairFull).filter(r => {
    const txt = (r.customer.name + r.vehicle.make + r.vehicle.model + r.vehicle.reg + r.mechanic.name + r.problem).toLowerCase();
    return (!filterText || txt.includes(filterText.toLowerCase())) &&
           (!filterStatus || r.status === filterStatus);
  });

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="13" class="text-center text-muted py-4">No repairs found.</td></tr>`;
    return;
  }

  body.innerHTML = rows.map(r => `
    <tr>
      <td><strong>#${r.id}</strong></td>
      <td>${r.customer.name || '—'}</td>
      <td>${r.vehicle.make} ${r.vehicle.model}</td>
      <td><span class="adm-reg">${r.vehicle.reg}</span></td>
      <td>${r.mechanic.name || '—'}</td>
      <td class="adm-problem-cell" title="${r.problem}">${r.problem}</td>
      <td>${statusBadge(r.status)}</td>
      <td>${r.dropoff}</td>
      <td>${formatINR(r.parts)}</td>
      <td>${formatINR(r.labor)}</td>
      <td><strong>${formatINR(r.total)}</strong></td>
      <td><span class="adm-bill-chip ${r.billType==='final'?'bill-final':'bill-estimated'}">${r.billType==='final'?'Final':'Estimated'}</span></td>
      <td>${repairActionsMenu(r.id)}</td>
    </tr>`).join('');

  attachRepairActionListeners(body);
}

function initRepairsSection() {
  const searchEl  = document.getElementById('repairSearch');
  const filterEl  = document.getElementById('repairStatusFilter');

  searchEl.addEventListener('input',  () => renderRepairTable(searchEl.value, filterEl.value));
  filterEl.addEventListener('change', () => renderRepairTable(searchEl.value, filterEl.value));

  // New Repair button
  document.getElementById('addRepairBtn').addEventListener('click', () => {
    const vSel = document.getElementById('repVehicle');
    const mSel = document.getElementById('repMechanic');
    vSel.innerHTML = vehicles.map(v => {
      const c = getCustomer(v.customerId);
      return `<option value="${v.id}">${c.name} – ${v.make} ${v.model} (${v.reg})</option>`;
    }).join('');
    mSel.innerHTML = `<option value="">— None —</option>` +
      mechanics.map(m => `<option value="${m.id}">${m.name} (${m.specialty})</option>`).join('');
    new bootstrap.Modal(document.getElementById('addRepairModal')).show();
  });

  // Save new repair
  document.getElementById('saveRepairBtn').addEventListener('click', () => {
    const vId     = +document.getElementById('repVehicle').value;
    const mId     = +document.getElementById('repMechanic').value || null;
    const problem = document.getElementById('repProblem').value.trim();
    const parts   = +document.getElementById('repParts').value || 0;
    const labor   = +document.getElementById('repLabor').value || 0;

    if (!vId || !problem) { alert('Please select a vehicle and describe the problem.'); return; }

    const newId = Math.max(...repairs.map(r => r.id), 0) + 1;
    const today = new Date().toISOString().split('T')[0];
    repairs.push({
      id: newId, vehicleId: vId, mechanicId: mId,
      problem, status: 'Received',
      dropoff: today, estimatedCompletion: '',
      parts, labor, billType: 'estimated', notes: []
    });

    bootstrap.Modal.getInstance(document.getElementById('addRepairModal')).hide();
    renderRepairTable(searchEl.value, filterEl.value);
    renderDashRepairTable();
    renderSummaryCards();
    showToast('Repair record created (demo only)');
    document.getElementById('repProblem').value = '';
    document.getElementById('repParts').value   = 0;
    document.getElementById('repLabor').value   = 0;
  });
}

/* ── 5c. View Details Modal ── */
function openRepairDetail(id) {
  const r = repairFull(repairs.find(x => x.id === id));
  const body = document.getElementById('repairDetailBody');
  body.innerHTML = `
    <div class="adm-detail-row"><span class="adm-detail-key">Repair #</span><span>${r.id}</span></div>
    <div class="adm-detail-row"><span class="adm-detail-key">Customer</span><span>${r.customer.name} | ${r.customer.phone}</span></div>
    <div class="adm-detail-row"><span class="adm-detail-key">Vehicle</span><span>${r.vehicle.make} ${r.vehicle.model} ${r.vehicle.year}</span></div>
    <div class="adm-detail-row"><span class="adm-detail-key">Reg. No.</span><span>${r.vehicle.reg}</span></div>
    <div class="adm-detail-row"><span class="adm-detail-key">Mechanic</span><span>${r.mechanic.name || '—'} ${r.mechanic.specialty ? '(' + r.mechanic.specialty + ')' : ''}</span></div>
    <div class="adm-detail-row"><span class="adm-detail-key">Problem</span><span>${r.problem}</span></div>
    <div class="adm-detail-row"><span class="adm-detail-key">Status</span><span>${statusBadge(r.status)}</span></div>
    <div class="adm-detail-row"><span class="adm-detail-key">Drop-off</span><span>${r.dropoff}</span></div>
    <div class="adm-detail-row"><span class="adm-detail-key">Est. Completion</span><span>${r.estimatedCompletion || '—'}</span></div>
    <div class="adm-detail-row"><span class="adm-detail-key">Parts Cost</span><span>${formatINR(r.parts)}</span></div>
    <div class="adm-detail-row"><span class="adm-detail-key">Labour Cost</span><span>${formatINR(r.labor)}</span></div>
    <div class="adm-detail-row"><span class="adm-detail-key">Total Bill</span><span><strong>${formatINR(r.total)}</strong> <span class="adm-bill-chip ${r.billType==='final'?'bill-final':'bill-estimated'}">${r.billType==='final'?'Final':'Estimated'}</span></span></div>
    <div class="adm-detail-row"><span class="adm-detail-key">Mechanic Notes</span>
      <div class="w-100 mt-1">
        ${r.notes.length
          ? r.notes.map(n => `<div class="adm-note-entry"><div class="adm-note-meta">${n.by} — ${n.date}</div>${n.text}</div>`).join('')
          : '<span class="text-muted">No notes yet.</span>'}
      </div>
    </div>`;
  new bootstrap.Modal(document.getElementById('repairDetailModal')).show();
}

/* ── 5d. Update Status Modal ── */
function openUpdateStatus(id) {
  const r = repairs.find(x => x.id === id);
  document.getElementById('updateStatusRepairId').value = id;
  document.getElementById('newStatusSelect').value = r.status;
  document.getElementById('statusNote').value = '';
  new bootstrap.Modal(document.getElementById('updateStatusModal')).show();
}

function initUpdateStatus() {
  document.getElementById('confirmStatusBtn').addEventListener('click', () => {
    const id     = +document.getElementById('updateStatusRepairId').value;
    const status = document.getElementById('newStatusSelect').value;
    const note   = document.getElementById('statusNote').value.trim();
    const r      = repairs.find(x => x.id === id);
    if (!r) return;

    r.status = status;
    if (note) {
      r.notes.push({ by: 'Admin', date: new Date().toISOString().split('T')[0], text: note });
    }
    // Push to activity log
    activityLog.unshift({
      icon: 'bi-arrow-repeat', color: 'text-warning', time: 'Just now',
      text: `Repair #${id} status updated to <strong>${status}</strong>`
    });

    bootstrap.Modal.getInstance(document.getElementById('updateStatusModal')).hide();
    renderDashRepairTable(document.getElementById('dashRepairSearch').value, document.getElementById('dashStatusFilter').value);
    renderRepairTable(document.getElementById('repairSearch').value, document.getElementById('repairStatusFilter').value);
    renderActivityFeed();
    renderSummaryCards();
    showToast(`Status updated to "${status}"`);
  });
}

/* ── 5e. Assign Mechanic Modal ── */
function openAssignMechanic(id) {
  const r   = repairs.find(x => x.id === id);
  const sel = document.getElementById('mechanicSelect');
  sel.innerHTML = mechanics.map(m =>
    `<option value="${m.id}" ${m.id === r.mechanicId ? 'selected' : ''}>${m.name} — ${m.specialty} (${m.status})</option>`
  ).join('');
  document.getElementById('assignRepairId').value = id;
  new bootstrap.Modal(document.getElementById('assignMechanicModal')).show();
}

function initAssignMechanic() {
  document.getElementById('confirmAssignBtn').addEventListener('click', () => {
    const id  = +document.getElementById('assignRepairId').value;
    const mid = +document.getElementById('mechanicSelect').value;
    const r   = repairs.find(x => x.id === id);
    if (!r) return;
    r.mechanicId = mid;

    activityLog.unshift({
      icon: 'bi-person-badge', color: 'text-success', time: 'Just now',
      text: `Repair #${id} assigned to <strong>${getMechanic(mid).name}</strong>`
    });

    bootstrap.Modal.getInstance(document.getElementById('assignMechanicModal')).hide();
    renderDashRepairTable(); renderRepairTable(); renderMechanicsSection(); renderActivityFeed();
    showToast(`Mechanic assigned: ${getMechanic(mid).name}`);
  });
}

/* ── 5f. Bill Modal ── */
function openBillModal(id) {
  const r = repairs.find(x => x.id === id);
  document.getElementById('billRepairId').value = id;
  document.getElementById('billParts').value    = r.parts;
  document.getElementById('billLabor').value    = r.labor;
  document.getElementById('billType').value     = r.billType;
  updateBillPreview();
  new bootstrap.Modal(document.getElementById('billModal')).show();
}

function updateBillPreview() {
  const parts = +document.getElementById('billParts').value || 0;
  const labor = +document.getElementById('billLabor').value || 0;
  document.getElementById('billTotalPreview').textContent = 'Total: ' + formatINR(parts + labor);
}

function initBillModal() {
  document.getElementById('billParts').addEventListener('input', updateBillPreview);
  document.getElementById('billLabor').addEventListener('input', updateBillPreview);

  document.getElementById('saveBillBtn').addEventListener('click', () => {
    const id    = +document.getElementById('billRepairId').value;
    const parts = +document.getElementById('billParts').value || 0;
    const labor = +document.getElementById('billLabor').value || 0;
    const type  = document.getElementById('billType').value;
    const r     = repairs.find(x => x.id === id);
    if (!r) return;

    r.parts    = parts;
    r.labor    = labor;
    r.billType = type;

    activityLog.unshift({
      icon: 'bi-cash-coin', color: 'text-danger', time: 'Just now',
      text: `Bill for repair #${id} updated to <strong>${formatINR(parts + labor)}</strong> (${type})`
    });

    bootstrap.Modal.getInstance(document.getElementById('billModal')).hide();
    renderDashRepairTable(); renderRepairTable(); renderVehicleTable(); renderSummaryCards(); renderActivityFeed();
    showToast('Bill saved (demo only)');
  });
}


/* ════════════════════════════════════════════════════════════
   6. MECHANICS SECTION
════════════════════════════════════════════════════════════ */

function renderMechanicsSection() {
  const grid = document.getElementById('mechanicsGrid');
  grid.innerHTML = mechanics.map(m => {
    const assigned = repairs.filter(r =>
      r.mechanicId === m.id && r.status !== 'Completed'
    ).map(repairFull);

    return `
      <div class="col-12 col-md-6 col-xl-4">
        <div class="adm-mechanic-card">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="adm-mechanic-avatar"><i class="bi bi-person-fill"></i></div>
            <div>
              <div class="adm-mechanic-name">${m.name}</div>
              <div class="adm-mechanic-spec">${m.specialty}</div>
              <span class="adm-avail-badge ${m.status === 'Available' ? 'avail-available' : 'avail-busy'}">${m.status}</span>
            </div>
          </div>
          <div class="adm-mechanic-meta mb-1"><i class="bi bi-telephone me-1"></i>${m.phone}</div>
          <div class="adm-mechanic-meta mb-1"><i class="bi bi-envelope me-1"></i>${m.email}</div>
          <div class="adm-mechanic-meta mb-3"><i class="bi bi-award me-1"></i>${m.experience} experience</div>
          <div class="fw-bold" style="font-size:.78rem;color:var(--gms-muted);text-transform:uppercase;letter-spacing:1px;">
            Active Repairs (${assigned.length})
          </div>
          <div class="mt-1">
            ${assigned.length
              ? assigned.map(r => `
                  <span class="adm-repair-chip">
                    <i class="bi bi-car-front"></i> #${r.id} ${r.vehicle.reg} ${statusBadge(r.status)}
                  </span>`).join('')
              : '<span class="text-muted" style="font-size:.82rem">No active repairs</span>'}
          </div>
        </div>
      </div>`;
  }).join('');
}


/* ════════════════════════════════════════════════════════════
   7. CUSTOMERS SECTION
════════════════════════════════════════════════════════════ */

function renderCustomersSection(filterText = '') {
  const grid = document.getElementById('customersGrid');
  const list = customers.filter(c => {
    const txt = (c.name + c.phone + c.email).toLowerCase();
    return !filterText || txt.includes(filterText.toLowerCase());
  });

  if (!list.length) {
    grid.innerHTML = `<div class="col-12 text-center text-muted py-4">No customers found.</div>`;
    return;
  }

  grid.innerHTML = list.map(c => {
    const cVehicles = vehicles.filter(v => v.customerId === c.id);
    const cRepairs  = cVehicles.flatMap(v => repairs.filter(r => r.vehicleId === v.id));
    const initials  = c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return `
      <div class="col-12 col-md-6 col-xl-4">
        <div class="adm-customer-card">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="adm-customer-avatar">${initials}</div>
            <div>
              <div class="adm-customer-name">${c.name}</div>
              <div class="adm-customer-meta"><i class="bi bi-telephone me-1"></i>${c.phone}</div>
              <div class="adm-customer-meta"><i class="bi bi-envelope me-1"></i>${c.email}</div>
            </div>
          </div>
          <div class="adm-customer-meta mb-1"><i class="bi bi-geo-alt me-1"></i>${c.address}</div>
          <div class="adm-customer-meta mb-2">
            <i class="bi bi-car-front me-1"></i>${cVehicles.length} vehicle(s) &nbsp;|&nbsp;
            <i class="bi bi-wrench me-1"></i>${cRepairs.length} repair(s)
          </div>
          ${cRepairs.length ? `
            <div class="adm-customer-history">
              <div style="font-size:.72rem;font-weight:700;color:var(--gms-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:.35rem">Repair History</div>
              ${cRepairs.map(r => {
                const v = getVehicle(r.vehicleId);
                return `<div class="adm-history-row">
                  <span>#${r.id} ${v.make} ${v.model}</span>
                  <span>${statusBadge(r.status)}</span>
                  <span style="font-weight:700;color:#198754">${formatINR(r.parts + r.labor)}</span>
                </div>`;
              }).join('')}
            </div>` : ''}
        </div>
      </div>`;
  }).join('');
}

function initCustomersSection() {
  document.getElementById('customerSearch').addEventListener('input', function() {
    renderCustomersSection(this.value);
  });
}


/* ════════════════════════════════════════════════════════════
   8. CONTACT SECTION
════════════════════════════════════════════════════════════ */

function initContactSection() {
  const form      = document.getElementById('adminContactForm');
  const success   = document.getElementById('contactSuccess');
  const submitBtn = document.getElementById('acSubmitBtn');
  const anotherBtn= document.getElementById('anotherMsgBtn');

  const fName  = document.getElementById('acName');
  const fEmail = document.getElementById('acEmail');
  const fMsg   = document.getElementById('acMessage');

  function setCVal(groupId, ok) {
    const g = document.getElementById(groupId);
    g.classList.toggle('field-invalid', !ok);
    g.classList.toggle('field-valid',    ok);
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }

  fName .addEventListener('blur', () => setCVal('acgrp-name',  fName.value.trim().length > 0));
  fEmail.addEventListener('blur', () => setCVal('acgrp-email', isEmail(fEmail.value)));
  fMsg  .addEventListener('blur', () => setCVal('acgrp-msg',   fMsg.value.trim().length >= 10));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nameOk  = fName.value.trim().length > 0;
    const emailOk = isEmail(fEmail.value);
    const msgOk   = fMsg.value.trim().length >= 10;
    setCVal('acgrp-name',  nameOk);
    setCVal('acgrp-email', emailOk);
    setCVal('acgrp-msg',   msgOk);

    if (!nameOk || !emailOk || !msgOk) {
      form.querySelector('.field-invalid input, .field-invalid textarea')?.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending…';

    setTimeout(() => {
      form.style.display = 'none';
      success.classList.remove('d-none');
      success.focus();
    }, 900);
  });

  anotherBtn.addEventListener('click', () => {
    form.reset();
    form.style.display = '';
    success.classList.add('d-none');
    form.querySelectorAll('.field-invalid,.field-valid').forEach(el => {
      el.classList.remove('field-invalid','field-valid');
    });
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="bi bi-send-fill me-2"></i>Send Message';
    fName.focus();
  });
}


/* ════════════════════════════════════════════════════════════
   9. INIT — wire everything on DOMContentLoaded
════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navigation ──
  initNav();

  // ── Dashboard ──
  renderSummaryCards();
  renderDashRepairTable();
  renderActivityFeed();

  // Live search + filter on dashboard table
  document.getElementById('dashRepairSearch').addEventListener('input', function() {
    renderDashRepairTable(this.value, document.getElementById('dashStatusFilter').value);
  });
  document.getElementById('dashStatusFilter').addEventListener('change', function() {
    renderDashRepairTable(document.getElementById('dashRepairSearch').value, this.value);
  });

  // ── Vehicles ──
  renderVehicleTable();
  initVehiclesSection();

  // ── Repairs ──
  renderRepairTable();
  initRepairsSection();
  initUpdateStatus();
  initAssignMechanic();
  initBillModal();

  // ── Mechanics ──
  renderMechanicsSection();

  // ── Customers ──
  renderCustomersSection();
  initCustomersSection();

  // ── Contact ──
  initContactSection();

  // ── Sign out ──
  document.getElementById('adminSignOut').addEventListener('click', e => {
    e.preventDefault();
    window.location.href = 'signin.html';
  });

  // Style for col-lg-2-4 (5 equal columns)
  const style = document.createElement('style');
  style.textContent = `
    @media (min-width: 992px) {
      .col-lg-2-4 { flex: 0 0 auto; width: 20%; }
    }
  `;
  document.head.appendChild(style);

  // Inline reg number style
  const regStyle = document.createElement('style');
  regStyle.textContent = `
    .adm-reg {
      font-family: 'Courier New', monospace;
      background: var(--gms-dark);
      color: #fff;
      font-size: .72rem;
      font-weight: 700;
      letter-spacing: 1.5px;
      padding: .15rem .5rem;
      border-radius: .25rem;
    }
  `;
  document.head.appendChild(regStyle);

});
