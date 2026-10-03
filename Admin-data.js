/* ================================================================
   admin-data.js — Garage Management System
   All sample data for the Admin Dashboard demo.
   NOTE: Changes made in the browser are NOT saved to a real
         database. This is front-end demo data only.
================================================================ */

/* ── Mechanics ─────────────────────────────────────────────── */
const mechanics = [
  { id: 1, name: 'Ravi Patel',    specialty: 'Engine & Transmission',  phone: '9876501001', email: 'ravi@gms.com',    experience: '8 yrs', status: 'Available' },
  { id: 2, name: 'Mike Turner',   specialty: 'Suspension & Brakes',    phone: '9876501002', email: 'mike@gms.com',    experience: '6 yrs', status: 'Busy'      },
  { id: 3, name: 'Suresh Mehta',  specialty: 'Electrical & AC',        phone: '9876501003', email: 'suresh@gms.com',  experience: '5 yrs', status: 'Available' },
  { id: 4, name: 'Arjun Sharma',  specialty: 'Body & Paint',           phone: '9876501004', email: 'arjun@gms.com',   experience: '10 yrs', status: 'Busy'     },
  { id: 5, name: 'Deepak Joshi',  specialty: 'Tyres & Wheel Alignment', phone: '9876501005', email: 'deepak@gms.com', experience: '4 yrs', status: 'Available' },
];

/* ── Customers ─────────────────────────────────────────────── */
const customers = [
  { id: 1, name: 'Alex Johnson',   phone: '9876543210', email: 'alex@email.com',   address: 'B-12, Satellite, Ahmedabad' },
  { id: 2, name: 'Priya Shah',     phone: '9876543211', email: 'priya@email.com',  address: 'C-45, Bopal, Ahmedabad'     },
  { id: 3, name: 'Rahul Verma',    phone: '9876543212', email: 'rahul@email.com',  address: 'D-7, Navrangpura, Ahmedabad'},
  { id: 4, name: 'Sneha Kapoor',   phone: '9876543213', email: 'sneha@email.com',  address: 'A-3, Maninagar, Ahmedabad'  },
  { id: 5, name: 'Kiran Desai',    phone: '9876543214', email: 'kiran@email.com',  address: 'E-22, Vastrapur, Ahmedabad' },
  { id: 6, name: 'Amit Trivedi',   phone: '9876543215', email: 'amit@email.com',   address: 'F-8, Paldi, Ahmedabad'      },
];

/* ── Vehicles ──────────────────────────────────────────────── */
const vehicles = [
  { id: 1, customerId: 1, make: 'Toyota',   model: 'Camry',    year: 2021, reg: 'GJ-05-AB-1234', color: 'White'  },
  { id: 2, customerId: 2, make: 'Honda',    model: 'City',     year: 2020, reg: 'GJ-01-CD-5678', color: 'Silver' },
  { id: 3, customerId: 3, make: 'Hyundai',  model: 'Creta',    year: 2022, reg: 'GJ-27-EF-9101', color: 'Red'    },
  { id: 4, customerId: 4, make: 'Maruti',   model: 'Swift',    year: 2019, reg: 'GJ-18-GH-1121', color: 'Blue'   },
  { id: 5, customerId: 5, make: 'Tata',     model: 'Nexon',    year: 2023, reg: 'GJ-09-IJ-3141', color: 'Black'  },
  { id: 6, customerId: 6, make: 'Mahindra', model: 'XUV700',   year: 2022, reg: 'GJ-12-KL-5161', color: 'Grey'   },
  { id: 7, customerId: 1, make: 'Toyota',   model: 'Fortuner', year: 2020, reg: 'GJ-05-MN-7181', color: 'White'  },
];

/* ── Repairs ───────────────────────────────────────────────── */
/* status: "Received" | "In Progress" | "Quality Check" | "Ready for Pickup" | "Completed" */
const repairs = [
  {
    id: 1, vehicleId: 1, mechanicId: 2,
    problem: 'Engine overheating and unusual suspension noise',
    status: 'In Progress',
    dropoff: '2026-10-01',
    estimatedCompletion: '2026-10-05',
    parts: 8500, labor: 4500,
    billType: 'estimated',
    notes: [
      { by: 'Mike Turner', date: '2026-10-02', text: 'Coolant hose replaced. Strut mounts ordered.' },
      { by: 'Mike Turner', date: '2026-10-03', text: 'Brake fluid topped up. Awaiting strut mount parts.' },
    ]
  },
  {
    id: 2, vehicleId: 2, mechanicId: 1,
    problem: 'Car not starting, battery drain issue',
    status: 'Quality Check',
    dropoff: '2026-09-28',
    estimatedCompletion: '2026-10-03',
    parts: 5200, labor: 2000,
    billType: 'estimated',
    notes: [
      { by: 'Ravi Patel', date: '2026-09-29', text: 'Alternator faulty. Replaced and battery recharged.' },
    ]
  },
  {
    id: 3, vehicleId: 3, mechanicId: 3,
    problem: 'AC not cooling, electrical short in dashboard',
    status: 'Received',
    dropoff: '2026-10-03',
    estimatedCompletion: '2026-10-07',
    parts: 3200, labor: 1800,
    billType: 'estimated',
    notes: []
  },
  {
    id: 4, vehicleId: 4, mechanicId: 5,
    problem: 'Tyre puncture and wheel alignment needed',
    status: 'Completed',
    dropoff: '2026-09-25',
    estimatedCompletion: '2026-09-26',
    parts: 1800, labor: 800,
    billType: 'final',
    notes: [
      { by: 'Deepak Joshi', date: '2026-09-26', text: 'All four tyres checked. Two replaced. Alignment done.' },
    ]
  },
  {
    id: 5, vehicleId: 5, mechanicId: 4,
    problem: 'Front bumper dent and scratch repair',
    status: 'In Progress',
    dropoff: '2026-09-30',
    estimatedCompletion: '2026-10-06',
    parts: 7500, labor: 5500,
    billType: 'estimated',
    notes: [
      { by: 'Arjun Sharma', date: '2026-10-01', text: 'Bumper panel removed. Dent work in progress.' },
    ]
  },
  {
    id: 6, vehicleId: 6, mechanicId: 1,
    problem: 'Clutch slipping and gear not engaging',
    status: 'Ready for Pickup',
    dropoff: '2026-09-27',
    estimatedCompletion: '2026-10-02',
    parts: 12000, labor: 6000,
    billType: 'final',
    notes: [
      { by: 'Ravi Patel', date: '2026-09-29', text: 'Clutch plate and pressure plate replaced.' },
      { by: 'Ravi Patel', date: '2026-10-01', text: 'Road test done. All gears engaging smoothly.' },
    ]
  },
  {
    id: 7, vehicleId: 7, mechanicId: 2,
    problem: 'Brake pads worn, brake fluid leak',
    status: 'Completed',
    dropoff: '2026-09-20',
    estimatedCompletion: '2026-09-22',
    parts: 4200, labor: 2200,
    billType: 'final',
    notes: [
      { by: 'Mike Turner', date: '2026-09-21', text: 'All brake pads replaced. Fluid line repaired and bled.' },
    ]
  },
];

/* ── Activity Log ──────────────────────────────────────────── */
const activityLog = [
  { icon: 'bi-wrench',          color: 'text-warning', time: '10 min ago',  text: 'Mike Turner updated repair #1 status to <strong>In Progress</strong>'          },
  { icon: 'bi-person-plus',     color: 'text-success', time: '45 min ago',  text: 'New customer <strong>Kiran Desai</strong> registered'                           },
  { icon: 'bi-car-front',       color: 'text-primary', time: '1 hr ago',    text: 'Vehicle <strong>GJ-09-IJ-3141</strong> added for Kiran Desai'                   },
  { icon: 'bi-check-circle',    color: 'text-success', time: '3 hrs ago',   text: 'Repair #4 marked as <strong>Completed</strong> by Deepak Joshi'                 },
  { icon: 'bi-cash-coin',       color: 'text-danger',  time: '5 hrs ago',   text: 'Final bill of <strong>₹18,000</strong> issued for repair #6'                   },
  { icon: 'bi-person-badge',    color: 'text-info',    time: 'Yesterday',   text: 'Arjun Sharma assigned to repair #5 (Tata Nexon – body work)'                   },
];

/* ── Helper: get related objects ───────────────────────────── */
function getVehicle(id)   { return vehicles.find(v => v.id === id) || {}; }
function getCustomer(id)  { return customers.find(c => c.id === id) || {}; }
function getMechanic(id)  { return mechanics.find(m => m.id === id) || {}; }

function repairFull(r) {
  const v = getVehicle(r.vehicleId);
  const c = getCustomer(v.customerId);
  const m = getMechanic(r.mechanicId);
  return { ...r, vehicle: v, customer: c, mechanic: m, total: r.parts + r.labor };
}

/* ── Helper: format rupees ─────────────────────────────────── */
function formatINR(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

/* ── Helper: status badge HTML ─────────────────────────────── */
function statusBadge(status) {
  const map = {
    'Received':          'badge-received',
    'In Progress':       'badge-inprogress',
    'Quality Check':     'badge-quality',
    'Ready for Pickup':  'badge-ready',
    'Completed':         'badge-completed',
  };
  const cls = map[status] || 'badge-received';
  return `<span class="adm-badge ${cls}">${status}</span>`;
}
