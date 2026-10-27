/**
 * AgriShare - Admin Dashboard Logic
 */

let allUsers = [];
let allResources = [];

// Load Admin Dashboard
async function initAdminDashboard() {
  if (!checkAuth(true)) return;

  loadAdminStats();
  loadAllUsers();
  loadAllResources();
}

async function loadAdminStats() {
  try {
    const data = await apiFetch('/admin/dashboard');
    if (data.success && data.stats) {
      const s = data.stats;
      document.getElementById('admTotalFarmers').textContent = s.totalFarmers;
      document.getElementById('admTotalResources').textContent = s.totalResources;
      document.getElementById('admActiveListings').textContent = s.activeListings;
      document.getElementById('admPendingListings').textContent = s.pendingListings;
      document.getElementById('admTotalRequests').textContent = s.totalRequests;
      document.getElementById('admCompletedRequests').textContent = s.completedRequests;
      document.getElementById('admVillages').textContent = s.villagesConnected;
    }
  } catch (err) {
    console.error('Error loading admin stats:', err);
  }
}

async function loadAllUsers() {
  const container = document.getElementById('adminUsersTableBody');
  if (!container) return;

  try {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;"><div class="spinner-border text-success"></div></td></tr>`;
    const data = await apiFetch('/admin/users');
    allUsers = data.users || [];

    if (allUsers.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">No registered farmers found.</td></tr>`;
      return;
    }

    container.innerHTML = allUsers.map(u => `
      <tr>
        <td>
          <strong>${u.name}</strong>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${u.email}</div>
        </td>
        <td>📞 ${u.phone}</td>
        <td>📍 ${u.village}, ${u.district}</td>
        <td>${u.farmingType || 'Mixed'} (${u.landholdingSize || 'N/A'})</td>
        <td><span class="status-pill ${u.role === 'admin' ? 'status-completed' : 'status-approved'}">${u.role.toUpperCase()}</span></td>
        <td>
          ${u.role !== 'admin' ? `
            <button class="btn-agri-terracotta" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="handleDeleteUser('${u._id}', '${u.name}')">Delete</button>
          ` : '<span style="font-size: 0.8rem; color: var(--text-muted);">Protected</span>'}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--terracotta);">Error loading users: ${err.message}</td></tr>`;
  }
}

async function loadAllResources() {
  const container = document.getElementById('adminResourcesTableBody');
  if (!container) return;

  try {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;"><div class="spinner-border text-success"></div></td></tr>`;
    const data = await apiFetch('/admin/resources');
    allResources = data.resources || [];

    if (allResources.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;">No resources listed.</td></tr>`;
      return;
    }

    container.innerHTML = allResources.map(r => {
      const owner = r.ownerId || {};
      const statusClass = r.approvalStatus === 'Approved' ? 'status-approved' : (r.approvalStatus === 'Pending' ? 'status-pending' : 'status-rejected');

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <img src="${r.imageUrl}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;" alt="">
              <div>
                <strong>${r.resourceName}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${r.category}</div>
              </div>
            </div>
          </td>
          <td>
            <strong>${owner.name || 'Unknown'}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">📍 ${r.village}, ${r.district}</div>
          </td>
          <td>${r.sharingType}</td>
          <td><span class="status-pill ${statusClass}">● ${r.approvalStatus || 'Approved'}</span></td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn-agri-primary" style="padding: 0.2rem 0.5rem; font-size: 0.72rem;" onclick="handleResourceApproval('${r._id}', 'Approved')">Approve</button>
              <button class="btn-agri-outline" style="padding: 0.2rem 0.5rem; font-size: 0.72rem; color: var(--terracotta); border-color: var(--terracotta);" onclick="handleResourceApproval('${r._id}', 'Rejected')">Reject</button>
              <button class="btn-agri-terracotta" style="padding: 0.2rem 0.5rem; font-size: 0.72rem;" onclick="handleDeleteResourceAdmin('${r._id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--terracotta);">Error loading resources: ${err.message}</td></tr>`;
  }
}

async function handleResourceApproval(resourceId, status) {
  try {
    const res = await apiFetch(`/admin/resources/${resourceId}/approval`, {
      method: 'PUT',
      body: JSON.stringify({ approvalStatus: status })
    });

    if (res.success) {
      loadAllResources();
      loadAdminStats();
    }
  } catch (err) {
    alert(`Failed to update approval status: ${err.message}`);
  }
}

async function handleDeleteUser(userId, userName) {
  if (!confirm(`Are you sure you want to delete farmer account: ${userName}? All their listings and requests will also be removed.`)) return;

  try {
    const res = await apiFetch(`/admin/users/${userId}`, {
      method: 'DELETE'
    });

    if (res.success) {
      alert('Farmer account deleted successfully.');
      loadAllUsers();
      loadAdminStats();
    }
  } catch (err) {
    alert(`Could not delete user: ${err.message}`);
  }
}

async function handleDeleteResourceAdmin(resourceId) {
  if (!confirm('Are you sure you want to permanently delete this resource?')) return;

  try {
    const res = await apiFetch(`/resources/${resourceId}`, {
      method: 'DELETE'
    });

    if (res.success) {
      alert('Resource removed.');
      loadAllResources();
      loadAdminStats();
    }
  } catch (err) {
    alert(`Could not delete: ${err.message}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('adminRoot')) {
    initAdminDashboard();
  }
});
