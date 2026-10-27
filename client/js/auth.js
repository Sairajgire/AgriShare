/**
 * AgriShare - Authentication & Session Management
 */

function getToken() {
  return localStorage.getItem('agrishare_token');
}

function getCurrentUser() {
  const user = localStorage.getItem('agrishare_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

function setAuthSession(token, user) {
  localStorage.setItem('agrishare_token', token);
  localStorage.setItem('agrishare_user', JSON.stringify(user));
}

function clearAuthSession() {
  localStorage.removeItem('agrishare_token');
  localStorage.removeItem('agrishare_user');
}

function isAuthenticated() {
  return !!getToken();
}

function isAdmin() {
  const user = getCurrentUser();
  return user && user.role === 'admin';
}

function logout() {
  clearAuthSession();
  window.location.href = 'login.html';
}

// Update Navigation Links based on authentication state
function updateNavAuth() {
  const user = getCurrentUser();
  const guestNav = document.getElementById('guestNav');
  const userNav = document.getElementById('userNav');
  const adminNavLink = document.getElementById('adminNavLink');
  const userDisplay = document.getElementById('userNameDisplay');

  if (isAuthenticated() && user) {
    if (guestNav) guestNav.style.display = 'none';
    if (userNav) userNav.style.display = 'flex';
    if (userDisplay) userDisplay.textContent = user.name.split(' ')[0];

    if (adminNavLink) {
      adminNavLink.style.display = user.role === 'admin' ? 'inline-flex' : 'none';
    }
  } else {
    if (guestNav) guestNav.style.display = 'flex';
    if (userNav) userNav.style.display = 'none';
    if (adminNavLink) adminNavLink.style.display = 'none';
  }
}

// Global Auth Check for protected pages (e.g. dashboard.html, admin.html)
function checkAuth(requireAdmin = false) {
  if (!isAuthenticated()) {
    window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
    return false;
  }

  if (requireAdmin && !isAdmin()) {
    alert('Access restricted to administrators.');
    window.location.href = 'dashboard.html';
    return false;
  }
  return true;
}

// Initialize Auth listeners on page load
document.addEventListener('DOMContentLoaded', () => {
  updateNavAuth();

  // Attach logout handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Handle Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errorBox = document.getElementById('authError');
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (errorBox) errorBox.style.display = 'none';
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        if (res.success && res.token) {
          setAuthSession(res.token, res.user);
          if (res.user.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }
      } catch (err) {
        if (errorBox) {
          errorBox.textContent = err.message || 'Login failed. Please verify credentials.';
          errorBox.style.display = 'block';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Handle Registration form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('regConfirmPassword').value;
      const village = document.getElementById('regVillage').value.trim();
      const district = document.getElementById('regDistrict').value;
      const state = document.getElementById('regState').value;
      const landholdingSize = document.getElementById('regLandholding').value;
      const farmingType = document.getElementById('regFarmingType').value;
      const errorBox = document.getElementById('authError');
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      if (errorBox) errorBox.style.display = 'none';

      if (password !== confirmPassword) {
        if (errorBox) {
          errorBox.textContent = 'Passwords do not match.';
          errorBox.style.display = 'block';
        }
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name, email, phone, password,
            village, district, state,
            landholdingSize, farmingType
          })
        });

        if (res.success && res.token) {
          setAuthSession(res.token, res.user);
          window.location.href = 'dashboard.html';
        }
      } catch (err) {
        if (errorBox) {
          errorBox.textContent = err.message || 'Registration failed.';
          errorBox.style.display = 'block';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
});
