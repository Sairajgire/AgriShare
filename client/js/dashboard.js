/**
 * AgriShare - Farmer Dashboard Logic
 */

let myResourcesData = [];
let incomingRequestsData = [];
let myRequestsData = [];

// Switch dashboard tabs
function switchTab(tabId) {
  document.querySelectorAll('.dash-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.dash-tab-content').forEach(content => {
    content.style.display = content.id === `${tabId}Tab` ? 'block' : 'none';
  });

  // Update URL search query without reloading
  const url = new URL(window.location);
  url.searchParams.set('tab', tabId);
  window.history.replaceState({}, '', url);

  // Load specific tab data
  if (tabId === 'resources') loadMyResources();
  if (tabId === 'incoming') loadIncomingRequests();
  if (tabId === 'requests') loadMyRequests();
  if (tabId === 'profile') loadUserProfile();
  if (tabId === 'overview') loadOverviewStats();
}

// Load Overview Statistics
async function loadOverviewStats() {
  try {
    const [resData, incData, myReqData] = await Promise.all([
      apiFetch('/resources/my/all'),
      apiFetch('/requests/incoming'),
      apiFetch('/requests/my')
    ]);

    myResourcesData = resData.resources || [];
    incomingRequestsData = incData.requests || [];
    myRequestsData = myReqData.requests || [];

    const approvedCount = incomingRequestsData.filter(r => r.status === 'Approved').length +
                          myRequestsData.filter(r => r.status === 'Approved').length;

    const elTotal = document.getElementById('dashTotalResources');
    const elInc = document.getElementById('dashIncomingRequests');
    const elOut = document.getElementById('dashOutgoingRequests');
    const elApp = document.getElementById('dashApprovedRequests');

    if (elTotal) elTotal.textContent = myResourcesData.length;
    if (elInc) elInc.textContent = incomingRequestsData.filter(r => r.status === 'Pending').length;
    if (elOut) elOut.textContent = myRequestsData.length;
    if (elApp) elApp.textContent = approvedCount;

    // Render quick activity previews on overview
    renderOverviewPreviews();
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
  }
}

function renderOverviewPreviews() {
  const incPreview = document.getElementById('overviewIncomingPreview');
  if (incPreview) {
    const pending = incomingRequestsData.filter(r => r.status === 'Pending');
    if (pending.length === 0) {
      incPreview.innerHTML = `<p style="color: var(--text-muted); font-size: 0.9rem;">No pending incoming requests right now.</p>`;
    } else {
      incPreview.innerHTML = pending.slice(0, 3).map(r => `
        <div style="border-bottom: 1px solid var(--border-color); padding: 0.6rem 0; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>${r.resourceId ? r.resourceId.resourceName : 'Machinery'}</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted);">From: ${r.borrowerId ? r.borrowerId.name : 'Farmer'} (${r.borrowerId ? r.borrowerId.village : ''})</div>
          </div>
          <button class="btn-agri-outline" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="switchTab('incoming')">Respond</button>
        </div>
      `).join('');
    }
  }
}

// 1. My Resources Tab
async function loadMyResources() {
  const container = document.getElementById('myResourcesTableBody');
  if (!container) return;

  try {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;"><div class="spinner-border text-success"></div></td></tr>`;
    const data = await apiFetch('/resources/my/all');
    myResourcesData = data.resources || [];

    if (myResourcesData.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            You have not listed any resources yet. Click <strong>"+ Add Resource"</strong> to share equipment with nearby farmers.
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = myResourcesData.map(res => {
      const fromStr = new Date(res.availableFrom).toLocaleDateString();
      const toStr = new Date(res.availableTo).toLocaleDateString();
      const priceText = res.sharingType === 'Nominal Rental' ? `₹${res.price}/day` : (res.sharingType === 'Barter Exchange' ? 'Barter' : 'Free');

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${res.imageUrl}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px;" alt="">
              <div>
                <strong>${res.resourceName}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${res.category}</div>
              </div>
            </div>
          </td>
          <td>${res.sharingType}</td>
          <td>${priceText}</td>
          <td><span style="font-size: 0.82rem;">${fromStr} - ${toStr}</span></td>
          <td><span class="status-pill status-approved">● ${res.status}</span></td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn-agri-outline" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="openEditResourceModal('${res._id}')">Edit</button>
              <button class="btn-agri-terracotta" style="padding: 0.25rem 0.55rem; font-size: 0.75rem;" onclick="handleDeleteResource('${res._id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--terracotta);">Error loading resources: ${err.message}</td></tr>`;
  }
}

// 2. Incoming Requests Tab
async function loadIncomingRequests() {
  const container = document.getElementById('incomingRequestsTableBody');
  if (!container) return;

  try {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;"><div class="spinner-border text-success"></div></td></tr>`;
    const data = await apiFetch('/requests/incoming');
    incomingRequestsData = data.requests || [];

    if (incomingRequestsData.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">No incoming requests received yet.</td></tr>`;
      return;
    }

    container.innerHTML = incomingRequestsData.map(req => {
      const borrower = req.borrowerId || {};
      const resource = req.resourceId || {};
      const sDate = new Date(req.startDate).toLocaleDateString();
      const eDate = new Date(req.endDate).toLocaleDateString();

      let actions = '';
      if (req.status === 'Pending') {
        actions = `
          <div style="display: flex; gap: 0.35rem;">
            <button class="btn-agri-primary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="handleRequestAction('${req._id}', 'Approved')">Approve</button>
            <button class="btn-agri-outline" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; color: var(--terracotta); border-color: var(--terracotta);" onclick="handleRequestAction('${req._id}', 'Rejected')">Reject</button>
          </div>
        `;
      } else if (req.status === 'Approved') {
        actions = `
          <button class="btn-agri-secondary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="handleRequestAction('${req._id}', 'Completed')">Mark Completed</button>
        `;
      } else {
        actions = `<span style="font-size: 0.8rem; color: var(--text-muted);">${req.status}</span>`;
      }

      return `
        <tr>
          <td><strong>${resource.resourceName || 'Machinery'}</strong></td>
          <td>
            <div><strong>${borrower.name || 'Farmer'}</strong></div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">📍 ${borrower.village || ''}, ${borrower.district || ''} | 📞 ${borrower.phone || ''}</div>
          </td>
          <td>${sDate} to ${eDate}</td>
          <td><span style="font-size: 0.82rem; color: var(--dark-charcoal);">${req.message || 'Standard Request'}</span></td>
          <td><span class="status-pill status-${req.status.toLowerCase()}">${req.status}</span></td>
          <td>${actions}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--terracotta);">Error loading incoming requests: ${err.message}</td></tr>`;
  }
}

// 3. My Requests (Outgoing) Tab
async function loadMyRequests() {
  const container = document.getElementById('myRequestsTableBody');
  if (!container) return;

  try {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem;"><div class="spinner-border text-success"></div></td></tr>`;
    const data = await apiFetch('/requests/my');
    myRequestsData = data.requests || [];

    if (myRequestsData.length === 0) {
      container.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">You have not requested any resources yet. Browse resources in the Explore section!</td></tr>`;
      return;
    }

    container.innerHTML = myRequestsData.map(req => {
      const resource = req.resourceId || {};
      const owner = req.ownerId || {};
      const sDate = new Date(req.startDate).toLocaleDateString();
      const eDate = new Date(req.endDate).toLocaleDateString();

      let action = '';
      if (req.status === 'Pending' || req.status === 'Approved') {
        action = `
          <button class="btn-agri-outline" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; color: var(--terracotta); border-color: var(--terracotta);" onclick="handleCancelRequest('${req._id}')">Cancel</button>
        `;
      } else {
        action = `<span style="font-size: 0.8rem; color: var(--text-muted);">Closed</span>`;
      }

      return `
        <tr>
          <td><strong>${resource.resourceName || 'Machinery'}</strong></td>
          <td>
            <div><strong>${owner.name || 'Owner'}</strong></div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">📍 ${owner.village || ''}, ${owner.district || ''} | 📞 ${owner.phone || 'Protected'}</div>
          </td>
          <td>${sDate} to ${eDate}</td>
          <td>${resource.sharingType || 'Free'}</td>
          <td><span class="status-pill status-${req.status.toLowerCase()}">${req.status}</span></td>
          <td>${action}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--terracotta);">Error: ${err.message}</td></tr>`;
  }
}

// Handle Approve / Reject / Complete
async function handleRequestAction(requestId, status) {
  if (!confirm(`Are you sure you want to mark this request as ${status}?`)) return;

  try {
    const res = await apiFetch(`/requests/${requestId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });

    if (res.success) {
      alert(`Request updated to ${status}!`);
      loadIncomingRequests();
      loadOverviewStats();
    }
  } catch (err) {
    alert(`Action failed: ${err.message}`);
  }
}

// Handle Cancel Request
async function handleCancelRequest(requestId) {
  if (!confirm('Are you sure you want to cancel this booking request?')) return;

  try {
    const res = await apiFetch(`/requests/${requestId}/cancel`, {
      method: 'PUT'
    });

    if (res.success) {
      alert('Request cancelled successfully.');
      loadMyRequests();
      loadOverviewStats();
    }
  } catch (err) {
    alert(`Could not cancel: ${err.message}`);
  }
}

// Handle Delete Resource
async function handleDeleteResource(resourceId) {
  if (!confirm('Are you sure you want to delete this resource listing? This action cannot be undone.')) return;

  try {
    const res = await apiFetch(`/resources/${resourceId}`, {
      method: 'DELETE'
    });

    if (res.success) {
      alert('Resource deleted successfully.');
      loadMyResources();
      loadOverviewStats();
    }
  } catch (err) {
    alert(`Could not delete resource: ${err.message}`);
  }
}

// Modal handling for Add / Edit Resource
function openAddResourceModal() {
  const modal = document.getElementById('resourceModal');
  const form = document.getElementById('resourceForm');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('resourceIdField').value = '';
  document.getElementById('resourceModalTitle').textContent = 'List New Agricultural Resource';

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  document.getElementById('resAvailableFrom').value = today;
  document.getElementById('resAvailableTo').value = nextMonth;

  // Pre-fill village and district from farmer profile
  const user = getCurrentUser();
  if (user) {
    document.getElementById('resVillage').value = user.village || '';
    document.getElementById('resDistrict').value = user.district || 'Pune';
  }

  toggleSharingModelFields();
  modal.style.display = 'flex';
}

function openEditResourceModal(resourceId) {
  const resource = myResourcesData.find(r => r._id === resourceId);
  if (!resource) return;

  const modal = document.getElementById('resourceModal');
  if (!modal) return;

  document.getElementById('resourceIdField').value = resource._id;
  document.getElementById('resourceModalTitle').textContent = 'Edit Agricultural Resource';

  document.getElementById('resName').value = resource.resourceName;
  document.getElementById('resCategory').value = resource.category;
  document.getElementById('resDescription').value = resource.description;
  document.getElementById('resImageUrl').value = resource.imageUrl;
  document.getElementById('resVillage').value = resource.village;
  document.getElementById('resDistrict').value = resource.district;
  document.getElementById('resSharingType').value = resource.sharingType;
  document.getElementById('resPrice').value = resource.price || '';
  document.getElementById('resBarter').value = resource.barterRequirements || '';
  document.getElementById('resAvailableFrom').value = new Date(resource.availableFrom).toISOString().split('T')[0];
  document.getElementById('resAvailableTo').value = new Date(resource.availableTo).toISOString().split('T')[0];
  document.getElementById('resStatus').value = resource.status || 'Available';

  toggleSharingModelFields();
  modal.style.display = 'flex';
}

function closeResourceModal() {
  const modal = document.getElementById('resourceModal');
  if (modal) modal.style.display = 'none';
}

function toggleSharingModelFields() {
  const type = document.getElementById('resSharingType').value;
  const priceGroup = document.getElementById('priceFieldGroup');
  const barterGroup = document.getElementById('barterFieldGroup');

  if (priceGroup) priceGroup.style.display = type === 'Nominal Rental' ? 'block' : 'none';
  if (barterGroup) barterGroup.style.display = type === 'Barter Exchange' ? 'block' : 'none';
}

// Handle Add/Edit Resource Form Submit
async function handleResourceFormSubmit(e) {
  e.preventDefault();
  const resourceId = document.getElementById('resourceIdField').value;
  const isEdit = !!resourceId;

  const payload = {
    resourceName: document.getElementById('resName').value.trim(),
    category: document.getElementById('resCategory').value,
    description: document.getElementById('resDescription').value.trim(),
    imageUrl: document.getElementById('resImageUrl').value.trim() || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
    village: document.getElementById('resVillage').value.trim(),
    district: document.getElementById('resDistrict').value,
    sharingType: document.getElementById('resSharingType').value,
    price: Number(document.getElementById('resPrice').value) || 0,
    barterRequirements: document.getElementById('resBarter').value.trim(),
    availableFrom: document.getElementById('resAvailableFrom').value,
    availableTo: document.getElementById('resAvailableTo').value,
    status: document.getElementById('resStatus') ? document.getElementById('resStatus').value : 'Available'
  };

  try {
    const endpoint = isEdit ? `/resources/${resourceId}` : '/resources';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await apiFetch(endpoint, {
      method,
      body: JSON.stringify(payload)
    });

    if (res.success) {
      closeResourceModal();
      alert(isEdit ? 'Resource updated successfully!' : 'Resource listed successfully!');
      loadMyResources();
      loadOverviewStats();
    }
  } catch (err) {
    alert(`Failed to save resource: ${err.message}`);
  }
}

// 4. User Profile Tab
async function loadUserProfile() {
  try {
    const data = await apiFetch('/auth/me');
    const user = data.user;
    if (!user) return;

    document.getElementById('profName').value = user.name || '';
    document.getElementById('profEmail').value = user.email || '';
    document.getElementById('profPhone').value = user.phone || '';
    document.getElementById('profVillage').value = user.village || '';
    document.getElementById('profDistrict').value = user.district || 'Pune';
    document.getElementById('profState').value = user.state || 'Maharashtra';
    document.getElementById('profLandholding').value = user.landholdingSize || '';
    document.getElementById('profFarmingType').value = user.farmingType || '';
  } catch (err) {
    console.error('Error fetching profile:', err);
  }
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('profName').value.trim(),
    phone: document.getElementById('profPhone').value.trim(),
    village: document.getElementById('profVillage').value.trim(),
    district: document.getElementById('profDistrict').value,
    state: document.getElementById('profState').value,
    landholdingSize: document.getElementById('profLandholding').value,
    farmingType: document.getElementById('profFarmingType').value
  };

  try {
    const res = await apiFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    if (res.success) {
      localStorage.setItem('agrishare_user', JSON.stringify(res.user));
      updateNavAuth();
      alert('Profile details updated successfully!');
    }
  } catch (err) {
    alert(`Could not update profile: ${err.message}`);
  }
}

// Initialize on Dashboard page load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('dashboardRoot')) {
    if (!checkAuth(false)) return;

    // Read initial tab from URL or default to overview
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab') || 'overview';
    switchTab(initialTab);

    // If 'action=new' is requested
    if (urlParams.get('action') === 'new') {
      setTimeout(openAddResourceModal, 400);
    }

    // Attach listeners
    document.querySelectorAll('.dash-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.getAttribute('data-tab'));
      });
    });

    const resForm = document.getElementById('resourceForm');
    if (resForm) resForm.addEventListener('submit', handleResourceFormSubmit);

    const profForm = document.getElementById('profileForm');
    if (profForm) profForm.addEventListener('submit', handleProfileUpdate);

    const sharingSelect = document.getElementById('resSharingType');
    if (sharingSelect) sharingSelect.addEventListener('change', toggleSharingModelFields);
  }
});
