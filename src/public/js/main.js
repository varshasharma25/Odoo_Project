// src/public/js/main.js - Universal Dayflow HRMS Frontend
const API_BASE = '/api';

// Global state
let currentUser = null;

document.addEventListener('DOMContentLoaded', initPage);

async function initPage() {
  // Check if logged in on every page
  try {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (res.ok) {
      currentUser = await res.json();
      showDashboard(currentUser);
    } else {
      // Not logged in, redirect to login
      if (window.location.pathname !== '/login.html') {
        window.location.href
