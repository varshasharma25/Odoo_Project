// src/public/js/app.js

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  let data = {};
  try {
    data = await res.json();
  } catch (_) {}

  if (!res.ok) {
    const msg = data.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

function qs(id) { return document.getElementById(id); }

function setRolePill(role) {
  const pill = qs('rolePill');
  if (pill) pill.textContent = `Role: ${role || '—'}`;
}

async function loadDashboardAndRole() {
  const dash = await apiFetch('/api/dashboard', { method: 'GET' });
  setRolePill(dash.role);

  // Dashboard page toggle
  const employeePanel = qs('employeePanel');
  const adminPanel = qs('adminPanel');
  const dashSubtitle = qs('dashSubtitle');
  const dashError = qs('dashError');
  const dashErrorMsg = qs('dashErrorMsg');

  if (dashSubtitle) dashSubtitle.textContent = dash.message || 'Welcome';

  if (employeePanel && adminPanel) {
    if (dash.role === 'admin') {
      adminPanel.hidden = false;
      employeePanel.hidden = true;

      if (qs('admEmployees')) qs('admEmployees').textContent = dash?.stats?.employees ?? '—';
      if (qs('admPendingLeaves')) qs('admPendingLeaves').textContent = dash?.stats?.pendingLeaves ?? '—';
    } else {
      employeePanel.hidden = false;
      adminPanel.hidden = true;

      if (qs('empTodayStatus')) qs('empTodayStatus').textContent = dash?.today?.status ?? '—';
      if (qs('empSalaryNext')) qs('empSalaryNext').textContent = dash?.today?.salaryNext ?? '—';
    }
  }

  // Role pill available on other pages too
  return dash;
}

async function initLoginPage() {
  const form = qs('loginForm');
  const msg = qs('loginMsg') || qs('result');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (msg) msg.textContent = 'Logging in...';

    const email = qs('email')?.value?.trim();
    const password = qs('password')?.value;

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (msg) msg.textContent = `✅ ${data.message} | Role: ${data.role}`;
      window.location.href = '/dashboard.html';
    } catch (err) {
      if (msg) msg.textContent = `❌ ${err.message}`;
    }
  });
}

function initLogoutButton() {
  const btn = qs('btnLogout');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    // If you add /api/auth/logout later, call it here.
    // For now, just redirect to login.
    window.location.href = '/login.html';
  });
}

function formatDT(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}
function formatDateOnly(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString();
}

async function initAttendancePage() {
  // ensure role pill loads + protect page
  await loadDashboardAndRole();
  initLogoutButton();

  const msg = qs('attMsg');
  const todayRecord = qs('todayRecord');

  async function refreshMyAttendance(from, to) {
    let url = '/api/attendance/my';
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if ([...params.keys()].length) url += `?${params.toString()}`;

    const data = await apiFetch(url);
    const tbody = qs('attendanceTbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (!data.records || data.records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="muted">No records found.</td></tr>`;
      return;
    }

    for (const r of data.records) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDateOnly(r.date)}</td>
        <td>${formatDT(r.checkIn)}</td>
        <td>${formatDT(r.checkOut)}</td>
        <td>${r.status || '—'}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  // Default: load last 7 days
  refreshMyAttendance().catch((e) => { if (msg) msg.textContent = e.message; });

  const btnIn = qs('btnCheckIn');
  const btnOut = qs('btnCheckOut');

  if (btnIn) {
    btnIn.addEventListener('click', async () => {
      if (msg) msg.textContent = 'Checking in...';
      try {
        const data = await apiFetch('/api/attendance/checkin', { method: 'POST' });
        if (msg) msg.textContent = `✅ ${data.message}`;
        if (todayRecord) todayRecord.textContent = JSON.stringify(data.attendance, null, 2);
        await refreshMyAttendance();
      } catch (e) {
        if (msg) msg.textContent = `❌ ${e.message}`;
      }
    });
  }

  if (btnOut) {
    btnOut.addEventListener('click', async () => {
      if (msg) msg.textContent = 'Checking out...';
      try {
        const data = await apiFetch('/api/attendance/checkout', { method: 'POST' });
        if (msg) msg.textContent = `✅ ${data.message}`;
        if (todayRecord) todayRecord.textContent = JSON.stringify(data.attendance, null, 2);
        await refreshMyAttendance();
      } catch (e) {
        if (msg) msg.textContent = `❌ ${e.message}`;
      }
    });
  }

  const rangeForm = qs('rangeForm');
  if (rangeForm) {
    rangeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const from = qs('fromDate')?.value || '';
      const to = qs('toDate')?.value || '';
      try {
        await refreshMyAttendance(from, to);
        if (msg) msg.textContent = 'Loaded.';
      } catch (err) {
        if (msg) msg.textContent = `❌ ${err.message}`;
      }
    });
  }
}

async function initDashboardPage() {
  try {
    const dash = await loadDashboardAndRole();
    initLogoutButton();

    // Admin lookup demo: call admin attendance endpoint if you implement it.
    const lookupForm = qs('adminLookupForm');
    const lookupResult = qs('adminLookupResult');
    if (dash.role === 'admin' && lookupForm && lookupResult) {
      lookupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const empId = qs('lookupEmployeeId')?.value?.trim();
        if (!empId) { lookupResult.textContent = 'Enter employee ID'; return; }

        // This endpoint is optional; you can implement later.
        // Example if you create: GET /api/attendance/admin?employeeId=EMP001
        try {
          const data = await apiFetch(`/api/attendance/admin?employeeId=${encodeURIComponent(empId)}`);
          lookupResult.textContent = JSON.stringify(data, null, 2);
        } catch (err) {
          lookupResult.textContent = `Not available yet: ${err.message}`;
        }
      });
    }
  } catch (err) {
    const dashError = qs('dashError');
    const dashErrorMsg = qs('dashErrorMsg');
    if (dashError) dashError.hidden = false;
    if (dashErrorMsg) dashErrorMsg.textContent = err.message;
  }
}

async function initGenericProtectedPage() {
  // For pages like profile/leave/admin-leave where APIs may not be wired yet
  await loadDashboardAndRole();
  initLogoutButton();

  // Simple role check for admin-leave
  if (document.body.dataset.page === 'admin-leave') {
    const dash = await apiFetch('/api/dashboard');
    if (dash.role !== 'admin') {
      alert('Admin access required');
      window.location.href = '/dashboard.html';
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const page = document.body?.dataset?.page || '';

  try {
    if (page === 'login') return initLoginPage();

    // Protected pages: need dashboard (session)
    if (page === 'dashboard') return initDashboardPage();
    if (page === 'attendance') return initAttendancePage();

    // Skeleton pages (still protected)
    if (page === 'leave' || page === 'profile' || page === 'admin-leave') {
      return initGenericProtectedPage();
    }
  } catch (err) {
    console.error(err);
  }
});
