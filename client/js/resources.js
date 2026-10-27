/**
 * AgriShare - Resource Exploration, Search & Filtering
 */

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Generate badge HTML according to sharing type
function getSharingBadge(type) {
  const lang = getCurrentLang();
  if (type === 'Free Sharing') {
    return `<span class="sharing-badge badge-free">${lang === 'mr' ? 'विनामूल्य वाटप' : 'Free Sharing'}</span>`;
  } else if (type === 'Barter Exchange') {
    return `<span class="sharing-badge badge-barter">${lang === 'mr' ? 'वस्तू-विनिमय' : 'Barter Exchange'}</span>`;
  } else {
    return `<span class="sharing-badge badge-rental">${lang === 'mr' ? 'माफक भाडे' : 'Nominal Rental'}</span>`;
  }
}

// Create single resource card element
function createResourceCardHTML(res) {
  const lang = getCurrentLang();
  const priceDisplay = res.sharingType === 'Nominal Rental'
    ? `<div class="price-display"><span class="price-val">₹${res.price}</span><span class="price-sub">${lang === 'mr' ? '/ दिवस' : '/ day'}</span></div>`
    : (res.sharingType === 'Barter Exchange' 
        ? `<div class="price-display"><span class="price-val" style="font-size: 0.95rem; color: #a8791c;">${lang === 'mr' ? 'वस्तू विनिमय' : 'Barter Terms'}</span></div>`
        : `<div class="price-display"><span class="price-val" style="color: var(--forest-green);">${lang === 'mr' ? 'विनामूल्य' : 'Free Sharing'}</span></div>`);

  const ownerName = res.ownerId ? res.ownerId.name : 'Verified Farmer';
  const village = res.village || 'Nearby Village';
  const district = res.district || 'Pune';

  return `
    <div class="resource-card">
      <div class="card-img-wrapper">
        <img src="${res.imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'}" alt="${res.resourceName}" loading="lazy">
        ${getSharingBadge(res.sharingType)}
        <span class="category-tag">${res.category}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${res.resourceName}</h3>
        <p class="card-desc">${res.description}</p>
        
        <div class="card-meta-list">
          <div class="card-meta-item">
            <span>📍</span>
            <span><strong>${village}</strong>, ${district}</span>
          </div>
          <div class="card-meta-item">
            <span>👨‍🌾</span>
            <span>${lang === 'mr' ? 'मालक:' : 'Owner:'} ${ownerName}</span>
          </div>
        </div>

        <div class="card-footer">
          ${priceDisplay}
          <a href="resource-details.html?id=${res._id}" class="btn-agri-primary" style="padding: 0.45rem 1rem; font-size: 0.88rem;">
            ${lang === 'mr' ? 'तपशील पहा' : 'View Details'} →
          </a>
        </div>
      </div>
    </div>
  `;
}

// Load Featured resources on homepage
async function loadFeaturedResources() {
  const container = document.getElementById('featuredResourcesContainer');
  if (!container) return;

  try {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem;"><div class="spinner-border text-success" role="status"></div></div>`;
    const data = await apiFetch('/resources');

    if (!data.resources || data.resources.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No agricultural resources currently listed. Be the first to share!</div>`;
      return;
    }

    // Show top 6 resources
    const featured = data.resources.slice(0, 6);
    container.innerHTML = featured.map(createResourceCardHTML).join('');
  } catch (err) {
    console.error('Error loading featured resources:', err);
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--terracotta); padding: 2rem;">Unable to load resources right now. Please verify server status.</div>`;
  }
}

// Load Live platform statistics on homepage
async function loadPublicStats() {
  try {
    const data = await apiFetch('/stats');
    if (data && data.stats) {
      const { farmers, resources, completedRequests, villages } = data.stats;
      const fEl = document.getElementById('statFarmers');
      const rEl = document.getElementById('statResources');
      const cEl = document.getElementById('statRequests');
      const vEl = document.getElementById('statVillages');

      if (fEl) fEl.textContent = `${farmers}+`;
      if (rEl) rEl.textContent = `${resources}+`;
      if (cEl) cEl.textContent = `${completedRequests}+`;
      if (vEl) vEl.textContent = `${villages}+`;
    }
  } catch (err) {
    console.warn('Could not fetch public stats:', err.message);
  }
}

// Load resources on explore.html with filters
async function loadExploreResources() {
  const container = document.getElementById('exploreGrid');
  const countBadge = document.getElementById('exploreResultCount');
  if (!container) return;

  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const districtFilter = document.getElementById('districtFilter');
  const sharingFilter = document.getElementById('sharingFilter');

  const params = new URLSearchParams();
  if (searchInput && searchInput.value.trim()) params.append('search', searchInput.value.trim());
  if (categoryFilter && categoryFilter.value !== 'All') params.append('category', categoryFilter.value);
  if (districtFilter && districtFilter.value !== 'All') params.append('district', districtFilter.value);
  if (sharingFilter && sharingFilter.value !== 'All') params.append('sharingType', sharingFilter.value);

  try {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem;"><div class="spinner-border text-success" role="status"></div><p style="margin-top: 1rem; color: var(--text-muted);">Finding available farm resources...</p></div>`;

    const data = await apiFetch(`/resources?${params.toString()}`);

    if (countBadge) {
      countBadge.textContent = `${data.count || 0} resources found`;
    }

    if (!data.resources || data.resources.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: #fff; border-radius: var(--radius-md); border: 1px dashed var(--border-color);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🌾</div>
          <h4 style="color: var(--forest-green); margin-bottom: 0.5rem;">No matching resources found</h4>
          <p style="color: var(--text-muted); max-width: 450px; margin: 0 auto 1.5rem;">
            Try widening your search, choosing "All Categories", or removing district filters.
          </p>
          <button id="resetFiltersBtn" class="btn-agri-outline" onclick="resetExploreFilters()">Reset All Filters</button>
        </div>
      `;
      return;
    }

    container.innerHTML = data.resources.map(createResourceCardHTML).join('');
  } catch (err) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 2.5rem; color: var(--terracotta);">
        <p>Error loading resources: ${err.message}</p>
      </div>
    `;
  }
}

function resetExploreFilters() {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const districtFilter = document.getElementById('districtFilter');
  const sharingFilter = document.getElementById('sharingFilter');

  if (searchInput) searchInput.value = '';
  if (categoryFilter) categoryFilter.value = 'All';
  if (districtFilter) districtFilter.value = 'All';
  if (sharingFilter) sharingFilter.value = 'All';

  loadExploreResources();
}

// Attach event listeners for explore page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('featuredResourcesContainer')) {
    loadFeaturedResources();
    loadPublicStats();
  }

  if (document.getElementById('exploreGrid')) {
    loadExploreResources();

    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const districtFilter = document.getElementById('districtFilter');
    const sharingFilter = document.getElementById('sharingFilter');

    let debounceTimer;
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(loadExploreResources, 350);
      });
    }

    if (categoryFilter) categoryFilter.addEventListener('change', loadExploreResources);
    if (districtFilter) districtFilter.addEventListener('change', loadExploreResources);
    if (sharingFilter) sharingFilter.addEventListener('change', loadExploreResources);
  }
});
