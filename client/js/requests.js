/**
 * AgriShare - Resource Details & Request Booking Logic
 */

let currentResource = null;

// Get query param by name
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Load resource details
async function loadResourceDetails() {
  const id = getQueryParam('id');
  const detailsContainer = document.getElementById('resourceDetailsContainer');
  if (!id || !detailsContainer) return;

  try {
    detailsContainer.innerHTML = `<div style="text-align: center; padding: 4rem;"><div class="spinner-border text-success" role="status"></div><p style="margin-top: 1rem; color: var(--text-muted);">Loading agricultural resource details...</p></div>`;

    const data = await apiFetch(`/resources/${id}`);
    currentResource = data.resource;
    const reviews = data.reviews || [];
    const avgRating = data.avgRating;

    renderResourceDetails(currentResource, reviews, avgRating);
  } catch (err) {
    detailsContainer.innerHTML = `
      <div style="text-align: center; padding: 4rem; background: #fff; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <h3 style="color: var(--terracotta); margin-bottom: 1rem;">Resource Not Found</h3>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">The agricultural resource you are looking for does not exist or may have been unlisted.</p>
        <a href="explore.html" class="btn-agri-primary">← Back to Resources</a>
      </div>
    `;
  }
}

function renderResourceDetails(res, reviews, avgRating) {
  const detailsContainer = document.getElementById('resourceDetailsContainer');
  if (!detailsContainer) return;

  const user = getCurrentUser();
  const isOwner = user && res.ownerId && (user.id === res.ownerId._id || user._id === res.ownerId._id);
  const lang = getCurrentLang();

  // Price or Barter presentation
  let pricingSection = '';
  if (res.sharingType === 'Nominal Rental') {
    pricingSection = `
      <div style="background: var(--terracotta-light); border-left: 4px solid var(--terracotta); padding: 1.25rem; border-radius: var(--radius-sm); margin: 1.5rem 0;">
        <span style="font-size: 0.85rem; text-transform: uppercase; font-weight: 700; color: var(--terracotta);">${lang === 'mr' ? 'माफक भाडेदर' : 'Subsidized Rental Rate'}</span>
        <div style="font-size: 2rem; font-weight: 800; color: var(--terracotta);">₹${res.price} <span style="font-size: 1rem; font-weight: 500; color: var(--dark-charcoal);">${lang === 'mr' ? '/ दिवस' : '/ day'}</span></div>
        <p style="font-size: 0.85rem; margin-top: 0.3rem; color: var(--text-muted);">Direct peer-to-peer exchange with no hidden middleman commission.</p>
      </div>
    `;
  } else if (res.sharingType === 'Barter Exchange') {
    pricingSection = `
      <div style="background: var(--harvest-yellow-light); border-left: 4px solid var(--harvest-yellow); padding: 1.25rem; border-radius: var(--radius-sm); margin: 1.5rem 0;">
        <span style="font-size: 0.85rem; text-transform: uppercase; font-weight: 700; color: #8e620d;">${lang === 'mr' ? 'वस्तू विनिमय अटी' : 'Barter Exchange Terms'}</span>
        <div style="font-size: 1.15rem; font-weight: 700; color: var(--dark-charcoal); margin-top: 0.3rem;">${res.barterRequirements || 'Open to mutually agreed equipment or farm assistance.'}</div>
      </div>
    `;
  } else {
    pricingSection = `
      <div style="background: var(--leaf-green-light); border-left: 4px solid var(--forest-green); padding: 1.25rem; border-radius: var(--radius-sm); margin: 1.5rem 0;">
        <span style="font-size: 0.85rem; text-transform: uppercase; font-weight: 700; color: var(--forest-green);">${lang === 'mr' ? 'विनामूल्य सामायिकरण' : 'Free Community Sharing'}</span>
        <div style="font-size: 1.5rem; font-weight: 800; color: var(--forest-green); margin-top: 0.2rem;">₹0 / Free to Borrow</div>
        <p style="font-size: 0.85rem; margin-top: 0.3rem; color: var(--text-muted);">Offered voluntarily to support neighbour farmers during pressing field needs.</p>
      </div>
    `;
  }

  // Action button logic
  let actionButtonHtml = '';
  if (!isAuthenticated()) {
    actionButtonHtml = `
      <a href="login.html?redirect=resource-details.html?id=${res._id}" class="btn-agri-primary" style="width: 100%; justify-content: center; padding: 0.85rem;">
        🔐 Log In to Request This Resource
      </a>
    `;
  } else if (isOwner) {
    actionButtonHtml = `
      <div style="background: #eef2f6; padding: 1rem; border-radius: var(--radius-sm); text-align: center; color: var(--forest-green); font-weight: 700;">
        🚜 You are the owner of this listing.
        <div style="margin-top: 0.5rem;">
          <a href="dashboard.html" class="btn-agri-outline" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">Manage in Dashboard</a>
        </div>
      </div>
    `;
  } else {
    actionButtonHtml = `
      <button id="openRequestModalBtn" class="btn-agri-primary" style="width: 100%; justify-content: center; padding: 0.9rem; font-size: 1.05rem;" onclick="openBookingModal()">
        📅 Request to Borrow / Rent
      </button>
    `;
  }

  // Format availability dates
  const fromStr = new Date(res.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const toStr = new Date(res.availableTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Reviews markup
  const reviewsMarkup = reviews.length > 0 ? reviews.map(r => `
    <div style="border-bottom: 1px solid var(--border-color); padding: 1rem 0;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
        <span style="font-weight: 700; color: var(--forest-green);">👨‍🌾 ${r.reviewerId ? r.reviewerId.name : 'Verified Farmer'} (${r.reviewerId ? r.reviewerId.village : 'Local Area'})</span>
        <span style="color: #f59e0b; font-weight: 700;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
      </div>
      <p style="font-size: 0.9rem; color: var(--dark-charcoal); margin: 0;">${r.comment}</p>
      <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
    </div>
  `).join('') : `<p style="color: var(--text-muted); font-size: 0.9rem; padding: 1rem 0;">No reviews yet. Be the first farmer to share feedback!</p>`;

  detailsContainer.innerHTML = `
    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 2.5rem; margin-bottom: 3rem;">
      <!-- Left Column: Image & Description -->
      <div>
        <div style="border-radius: var(--radius-md); overflow: hidden; height: 380px; box-shadow: var(--shadow-md); margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
          <img src="${res.imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'}" alt="${res.resourceName}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <div style="background: #fff; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem; color: var(--forest-green);">About this Machinery / Resource</h3>
          <p style="font-size: 1rem; color: var(--dark-charcoal); line-height: 1.7; white-space: pre-line;">${res.description}</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; border-top: 1px dashed var(--border-color); padding-top: 1.25rem;">
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Category</span>
              <p style="font-weight: 700; color: var(--forest-green); margin: 0;">${res.category}</p>
            </div>
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Listing Status</span>
              <p style="font-weight: 700; color: #17723e; margin: 0;">● ${res.status}</p>
            </div>
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Available From</span>
              <p style="font-weight: 600; color: var(--dark-charcoal); margin: 0;">${fromStr}</p>
            </div>
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Available Until</span>
              <p style="font-weight: 600; color: var(--dark-charcoal); margin: 0;">${toStr}</p>
            </div>
          </div>
        </div>

        <!-- Community Reviews -->
        <div style="background: #fff; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
            <h3 style="font-size: 1.3rem; margin: 0; color: var(--forest-green);">Farmer Reviews & Ratings</h3>
            <span style="font-weight: 800; font-size: 1.1rem; color: #f59e0b;">★ ${avgRating || 'New'} (${reviews.length})</span>
          </div>

          <div id="reviewsList">
            ${reviewsMarkup}
          </div>

          ${isAuthenticated() && !isOwner ? `
            <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
              <h4 style="font-size: 1.05rem; margin-bottom: 0.75rem;">Leave a Community Review</h4>
              <form id="reviewForm" onsubmit="handleReviewSubmit(event)">
                <div style="margin-bottom: 0.75rem;">
                  <label class="form-label" style="font-size: 0.85rem;">Rating (1 to 5 Stars):</label>
                  <select id="reviewRating" class="form-select" style="max-width: 150px;" required>
                    <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                    <option value="4">⭐⭐⭐⭐ (4/5)</option>
                    <option value="3">⭐⭐⭐ (3/5)</option>
                    <option value="2">⭐⭐ (2/5)</option>
                    <option value="1">⭐ (1/5)</option>
                  </select>
                </div>
                <div style="margin-bottom: 0.75rem;">
                  <textarea id="reviewComment" class="form-control" rows="2" placeholder="Write genuine feedback regarding equipment quality and punctuality..." required></textarea>
                </div>
                <button type="submit" class="btn-agri-secondary" style="font-size: 0.85rem; padding: 0.45rem 1rem;">Post Review</button>
              </form>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Right Column: Booking Card & Owner Info -->
      <div>
        <div style="background: #fff; padding: 2rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); box-shadow: var(--shadow-md); position: sticky; top: 90px;">
          <h2 style="font-size: 1.7rem; color: var(--forest-green); margin-bottom: 0.5rem;">${res.resourceName}</h2>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem;">
            <span>📍</span>
            <span style="font-weight: 600; color: var(--dark-charcoal);">${res.village}, ${res.district}, ${res.ownerId ? res.ownerId.state : 'Maharashtra'}</span>
          </div>

          ${pricingSection}

          <!-- Owner Profile Card -->
          <div style="background: var(--cream-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 1.25rem; margin-bottom: 1.5rem;">
            <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem;">Listed By</div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 44px; height: 44px; background: var(--forest-green); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem;">
                ${res.ownerId ? res.ownerId.name[0] : 'F'}
              </div>
              <div>
                <div style="font-weight: 700; color: var(--forest-green);">${res.ownerId ? res.ownerId.name : 'Fellow Farmer'}</div>
                <div style="font-size: 0.82rem; color: var(--text-muted);">${res.ownerId ? (res.ownerId.farmingType || 'Mixed Farming') : ''}</div>
              </div>
            </div>

            ${isAuthenticated() && res.ownerId && res.ownerId.phone ? `
              <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px dashed var(--border-color); font-size: 0.88rem;">
                📞 <strong>Mobile:</strong> <a href="tel:${res.ownerId.phone}">${res.ownerId.phone}</a>
              </div>
            ` : `<div style="margin-top: 0.75rem; font-size: 0.8rem; color: var(--text-muted);">🔒 Log in to view direct farmer contact details.</div>`}
          </div>

          ${actionButtonHtml}
        </div>
      </div>
    </div>
  `;
}

// Open booking request modal
function openBookingModal() {
  const modal = document.getElementById('requestModal');
  if (!modal || !currentResource) return;

  const startInput = document.getElementById('bookingStartDate');
  const endInput = document.getElementById('bookingEndDate');

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  if (startInput) {
    startInput.min = today;
    startInput.value = today;
  }
  if (endInput) {
    endInput.min = today;
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    endInput.value = tomorrow;
  }

  modal.style.display = 'flex';
}

function closeBookingModal() {
  const modal = document.getElementById('requestModal');
  if (modal) modal.style.display = 'none';
}

// Handle request form submission
async function handleBookingSubmit(e) {
  e.preventDefault();
  if (!currentResource) return;

  const startDate = document.getElementById('bookingStartDate').value;
  const endDate = document.getElementById('bookingEndDate').value;
  const message = document.getElementById('bookingMessage').value.trim();
  const errorBox = document.getElementById('bookingError');
  const submitBtn = document.getElementById('submitBookingBtn');

  if (errorBox) errorBox.style.display = 'none';
  if (submitBtn) submitBtn.disabled = true;

  try {
    const res = await apiFetch('/requests', {
      method: 'POST',
      body: JSON.stringify({
        resourceId: currentResource._id,
        startDate,
        endDate,
        message
      })
    });

    if (res.success) {
      closeBookingModal();
      alert('Request sent successfully! You can track status in your Farmer Dashboard.');
      window.location.href = 'dashboard.html?tab=my-requests';
    }
  } catch (err) {
    if (errorBox) {
      errorBox.textContent = err.message || 'Error submitting request. Please try again.';
      errorBox.style.display = 'block';
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

// Handle review submit
async function handleReviewSubmit(e) {
  e.preventDefault();
  if (!currentResource) return;

  const rating = document.getElementById('reviewRating').value;
  const comment = document.getElementById('reviewComment').value.trim();

  try {
    const res = await apiFetch('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        resourceId: currentResource._id,
        rating: Number(rating),
        comment
      })
    });

    if (res.success) {
      alert('Thank you! Review recorded successfully.');
      loadResourceDetails(); // reload to show new review
    }
  } catch (err) {
    alert(`Could not submit review: ${err.message}`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('resourceDetailsContainer')) {
    loadResourceDetails();
  }

  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingSubmit);
  }
});
