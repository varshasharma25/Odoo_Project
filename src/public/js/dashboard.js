// Check if logged in
fetch('/api/dashboard')
  .then(res => res.json())
  .then(data => {
    document.getElementById('userInfo').textContent = data.message;
    
    if (data.role === 'admin') {
      document.getElementById('employeeDash').style.display = 'none';
      document.getElementById('adminDash').style.display = 'block';
      document.getElementById('pendingLeaves').textContent = data.stats.pendingLeaves;
    } else {
      document.getElementById('adminDash').style.display = 'none';
      document.getElementById('employeeDash').style.display = 'block';
      document.getElementById('todayStatus').textContent = data.today.status;
    }
  })
  .catch(() => {
    window.location.href = '/index.html'; // Redirect to login
  });
