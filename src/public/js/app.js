console.log('🎯 app.js LOADED');

// Simple fetch wrapper
async function apiFetch(path, options = {}) {
  console.log('🚀 API:', path);
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  console.log('📡 RESP:', data);
  if (!res.ok) throw new Error(data.message || 'Error');
  return data;
}

function qs(id) { return document.getElementById(id); }
function showMsg(id, msg) {
  const el = qs(id);
  if (el) el.textContent = msg;
}

// REGISTER
function initRegisterPage() {
  console.log('🔍 REGISTER INIT');
  const form = qs('registerForm');
  const msg = qs('registerMsg');
  
  if (!form) {
    console.error('❌ NO FORM');
    return;
  }

  // HR toggle
  const role = form.querySelector('[name="role"]');
  const hrCode = form.querySelector('[name="hrCode"]').parentElement;
  hrCode.style.display = 'none';
  
  role.addEventListener('change', e => {
    hrCode.style.display = e.target.value === 'hr' ? 'block' : 'none';
  });

  form.onsubmit = async e => {
    e.preventDefault();
    showMsg('registerMsg', 'Creating...');

    const fd = new FormData(form);
    const data = Object.fromEntries(fd);

    try {
      await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      showMsg('registerMsg', '✅ Registered! Login now.');
      setTimeout(() => location.href = '/login.html', 1500);
    } catch (err) {
      showMsg('registerMsg', '❌ ' + err.message);
    }
  };
}

// LOGIN  
function initLoginPage() {
  console.log('🔍 LOGIN INIT');
  const form = qs('loginForm');
  const msg = qs('loginMsg') || qs('result');
  
  if (!form) return;

  form.onsubmit = async e => {
    e.preventDefault();
    showMsg('loginMsg', 'Logging in...');

    const email = qs('email').value;
    const password = qs('password').value;

    try {
      await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      showMsg('loginMsg', '✅ Login OK!');
      setTimeout(() => location.href = '/dashboard.html', 1000);
    } catch (err) {
      showMsg('loginMsg', '❌ ' + err.message);
    }
  };
}

// BOOT
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  console.log('📄 PAGE:', page);
  
  if (page === 'register') initRegisterPage();
  if (page === 'login') initLoginPage();
});

async function initAdminPage() {
  const employees = await apiFetch('/api/admin/employees');
  // Render table...
}

if (page === 'admin') initAdminPage();
