/**
 * AgriShare - Core API & Translation Engine
 */

// Dynamically determine API base URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (localStorage.getItem('agrishare_api_url') || '/api');

// Unified API Fetch wrapper with JWT header injection
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = localStorage.getItem('agrishare_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
}

// ==========================================
// PART 7: ENGLISH & MARATHI LANGUAGE DICTIONARY
// ==========================================
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.explore': 'Explore Resources',
    'nav.howItWorks': 'How It Works',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.dashboard': 'Dashboard',
    'nav.admin': 'Admin Panel',
    'nav.logout': 'Logout',
    'nav.listResource': '+ List a Resource',

    // Hero Section
    'hero.badge': 'Community Driven Agricultural Sharing',
    'hero.title': 'Growing Together, Sharing Smarter.',
    'hero.desc': 'Empowering farmers through affordable agricultural resource sharing. Discover nearby equipment, exchange resources, and build stronger farming communities.',
    'hero.btnExplore': 'Explore Resources',
    'hero.btnJoin': 'Join AgriShare',
    'hero.btnList': 'List Your Resource',

    // Stats
    'stat.farmers': 'Registered Farmers',
    'stat.resources': 'Available Resources',
    'stat.requests': 'Completed Requests',
    'stat.villages': 'Villages Connected',

    // Featured & Categories
    'section.featured': 'Featured Agricultural Resources',
    'section.featuredSub': 'Discover high-demand farming machinery and tools available near you today',
    'section.viewAll': 'View All Resources',
    'cat.all': 'All Categories',
    'cat.machinery': 'Agricultural Machinery',
    'cat.tractors': 'Tractors',
    'cat.harvesters': 'Harvesters',
    'cat.seedDrills': 'Seed Drills',
    'cat.cultivators': 'Cultivators',
    'cat.irrigation': 'Irrigation Equipment',
    'cat.sprayers': 'Sprayers',
    'cat.tools': 'Farming Tools',
    'cat.seeds': 'Seeds',
    'cat.fertilizers': 'Fertilizers',
    'cat.storage': 'Storage Facilities',
    'cat.transport': 'Transport',
    'cat.other': 'Other',

    // Sharing Models
    'models.title': 'Three Flexible Sharing Models',
    'models.sub': 'Choose the model that best fits your farming schedule and requirements',
    'models.free': 'Free Sharing',
    'models.freeDesc': 'Farmers lend tools, sprayers, and extra water pumps without any rental fee to support neighbours in need.',
    'models.barter': 'Barter Exchange',
    'models.barterDesc': 'Exchange farming equipment or services directly without money (e.g. use of a rotavator in exchange for organic seeds).',
    'models.rental': 'Nominal Rental',
    'models.rentalDesc': 'Rent high-value tractors and combine harvesters at heavily subsidized, affordable hourly or daily rates.',

    // How It Works Steps
    'steps.title': 'How AgriShare Works',
    'steps.sub': 'Four straightforward steps to empower your farming operations',
    'step1.title': '1. Register as a Farmer',
    'step1.desc': 'Create a free profile with your village, district, landholding, and farming type details.',
    'step2.title': '2. Discover or List',
    'step2.desc': 'Search for available nearby resources or list your own idle machinery for others.',
    'step3.title': '3. Request & Approve',
    'step3.desc': 'Select booking dates and connect directly with the owner for quick confirmation.',
    'step4.title': '4. Share & Give Feedback',
    'step4.desc': 'Complete the exchange, cultivate with ease, and leave a genuine community review.',

    // Benefits
    'benefits.title': 'Why Choose AgriShare?',
    'benefit1.title': 'Reduced Equipment Costs',
    'benefit1.desc': 'Avoid heavy bank loans and capital expenses by renting or borrowing seasonal equipment when needed.',
    'benefit2.title': 'Higher Resource Utilization',
    'benefit2.desc': 'Earn supplemental income or community goodwill from tractors and tools sitting idle in your shed.',
    'benefit3.title': 'Hyper-Local Cooperation',
    'benefit3.desc': 'Strengthen rural village solidarity and collaborative problem solving among farming peers.',
    'benefit4.title': 'Sustainable Agriculture',
    'benefit4.desc': 'Promote shared machinery usage to optimize fuel, machinery wear, and community resilience.',

    // Explore Page
    'explore.title': 'Explore Agricultural Resources',
    'explore.sub': 'Find tractors, implements, irrigation pumps, and supplies available in your district',
    'explore.searchPlaceholder': 'Search by resource name, description, village...',
    'explore.filterDistrict': 'All Districts',
    'explore.filterModel': 'All Sharing Models',
    'explore.resetFilters': 'Reset Filters',

    // Resource Cards
    'card.viewDetails': 'View Details',
    'card.perDay': '/ day',
    'card.free': 'Free Sharing',
    'card.barter': 'Barter Exchange',
    'card.rental': 'Nominal Rental',
    'card.available': 'Available',

    // Dashboard
    'dash.title': 'Farmer Dashboard',
    'dash.tabOverview': 'Overview',
    'dash.tabMyResources': 'My Resources',
    'dash.tabIncoming': 'Incoming Requests',
    'dash.tabMyRequests': 'My Requests',
    'dash.tabProfile': 'My Profile',
    'dash.addResource': '+ Add New Resource',
    'dash.totalResources': 'My Listed Resources',
    'dash.incomingReq': 'Incoming Requests',
    'dash.outgoingReq': 'My Bookings',
    'dash.approvedReq': 'Approved Bookings',

    // Common Buttons & Actions
    'btn.save': 'Save Changes',
    'btn.cancel': 'Cancel',
    'btn.submit': 'Submit Request',
    'btn.approve': 'Approve',
    'btn.reject': 'Reject',
    'btn.delete': 'Delete',
    'btn.edit': 'Edit',

    // Footer
    'footer.desc': 'AgriShare is a community-driven agricultural resource-sharing platform engineered to make modern farming equipment accessible and affordable for every farmer.',
    'footer.quickLinks': 'Quick Links',
    'footer.sharingModels': 'Sharing Models',
    'footer.contactUs': 'Contact & Support',
    'footer.rights': '© 2026 AgriShare. Developed by Multidisciplinary Engineering Project Team.'
  },
  mr: {
    // Navigation
    'nav.home': 'मुख्यपृष्ठ',
    'nav.explore': 'साधने शोधा',
    'nav.howItWorks': 'हे कसे कार्य करते',
    'nav.about': 'आमच्याबद्दल',
    'nav.contact': 'संपर्क',
    'nav.login': 'लॉगिन',
    'nav.register': 'नोंदणी करा',
    'nav.dashboard': 'डॅशबोर्ड',
    'nav.admin': 'प्रशासक पॅनेल',
    'nav.logout': 'लॉगआउट',
    'nav.listResource': '+ साधन जोडा',

    // Hero Section
    'hero.badge': 'शेतकरी समुदायासाठी कृषी साधन देवाणघेवाण',
    'hero.title': 'एकत्र प्रगती, स्मार्ट शेती आणि साधने देवाणघेवाण.',
    'hero.desc': 'परवडणाऱ्या कृषी साधनांच्या देवाणघेवाणीतून शेतकऱ्यांचे सक्षमीकरण. जवळील शेती यंत्रे शोधा, परस्पर सहकार्य करा आणि मजबूत शेतकरी समुदाय घडवा.',
    'hero.btnExplore': 'साधने शोधा',
    'hero.btnJoin': 'अ‍ॅग्रीशेअरशी जोडा',
    'hero.btnList': 'तुमचे साधन नोंदवा',

    // Stats
    'stat.farmers': 'नोंदणीकृत शेतकरी',
    'stat.resources': 'उपलब्ध कृषी साधने',
    'stat.requests': 'पूर्ण झालेल्या विनंत्या',
    'stat.villages': 'जोडलेली गावे',

    // Featured & Categories
    'section.featured': 'वैशिष्ट्यपूर्ण कृषी साधने',
    'section.featuredSub': 'तुमच्या परिसरात उपलब्ध असलेली उच्च दर्जाची शेती यंत्रे आणि अवजारे शोधा',
    'section.viewAll': 'सर्व साधने पहा',
    'cat.all': 'सर्व प्रकार',
    'cat.machinery': 'कृषी यंत्रसामग्री',
    'cat.tractors': 'ट्रॅक्टर',
    'cat.harvesters': 'हार्वेस्टर (कापणी यंत्र)',
    'cat.seedDrills': 'पेरणी यंत्र (सीड ड्रिल)',
    'cat.cultivators': 'कल्टीव्हेटर / रोटाव्हेटर',
    'cat.irrigation': 'सिंचन उपकरणे (पंप)',
    'cat.sprayers': 'फवारणी यंत्रे',
    'cat.tools': 'शेतीची अवजारे',
    'cat.seeds': 'बियाणे',
    'cat.fertilizers': 'खते',
    'cat.storage': 'साठवणूक सुविधा',
    'cat.transport': 'वाहतूक वाहने',
    'cat.other': 'इतर साधने',

    // Sharing Models
    'models.title': 'साधने वाटपाचे तीन सुलभ प्रकार',
    'models.sub': 'तुमच्या शेतीच्या गरजेनुसार योग्य पर्याय निवडा',
    'models.free': 'विनामूल्य सामायिकरण (Free Sharing)',
    'models.freeDesc': 'शेतकरी मित्र गरजवंत शेतकऱ्यांना कोणतेही शुल्क न घेता अवजारे आणि पंप विनामूल्य वापरण्यासाठी देतात.',
    'models.barter': 'वस्तू-विनिमय (Barter Exchange)',
    'models.barterDesc': 'पैशांऐवजी साधनांची किंवा कामांची परस्पर देवाणघेवाण (उदा. रोटाव्हेटर वापराच्या बदल्यात सेंद्रिय बियाणे).',
    'models.rental': 'माफक भाडेतत्त्व (Nominal Rental)',
    'models.rentalDesc': 'मोठी यंत्रे जसे की ट्रॅक्टर व हार्वेस्टर अत्यंत माफक आणि परवडणाऱ्या दराने प्रति तास किंवा प्रति दिवस भाड्याने मिळवा.',

    // How It Works Steps
    'steps.title': 'अ‍ॅग्रीशेअर कसे कार्य करते',
    'steps.sub': 'शेतीतील खर्च कमी करण्यासाठी चार साध्या पायऱ्या',
    'step1.title': '१. शेतकरी नोंदणी',
    'step1.desc': 'तुमचे गाव, जिल्हा, शेतजमीन आणि पिकांचा प्रकार या माहितीसह विनामूल्य खाते तयार करा.',
    'step2.title': '२. साधन शोधा किंवा नोंदवा',
    'step2.desc': 'परिसरातील उपलब्ध यंत्रे शोधा किंवा तुमच्याकडील रिकामे यंत्र इतर शेतकऱ्यांसाठी नोंदवा.',
    'step3.title': '३. विनंती पाठवा व मान्यता मिळवा',
    'step3.desc': 'तारीख निवडून साधन मालकास विनंती पाठवा आणि खात्रीशीर मंजुरी मिळवा.',
    'step4.title': '४. वापर करा व अभिप्राय द्या',
    'step4.desc': 'साधनाचा योग्य वापर करा, शेतीची कामे पूर्ण करा आणि प्रामाणिक रेटिंग व अभिप्राय नोंदवा.',

    // Benefits
    'benefits.title': 'अ‍ॅग्रीशेअरचे फायदे',
    'benefit1.title': 'यंत्रसामग्रीवरील खर्च बचत',
    'benefit1.desc': 'महागडी यंत्रे खरेदी करण्यासाठी कर्ज घेण्याऐवजी गरजेनुसार अल्प भाड्यात यंत्रे वापरा.',
    'benefit2.title': 'साधनांचा पुरेपूर वापर',
    'benefit2.desc': 'घरात किंवा शेतात पडून असलेल्या ट्रॅक्टर आणि अवजारांमधून अतिरिक्त उत्पन्न किंवा सहकार्य मिळवा.',
    'benefit3.title': 'गावपातळीवर परस्पर सहकार्य',
    'benefit3.desc': 'गावातील शेतकऱ्यांमध्ये एकता वाढवून शेतीतील अडचणींवर एकत्रितपणे मात करा.',
    'benefit4.title': 'शाश्वत कृषी पद्धती',
    'benefit4.desc': 'साधनांचा सामायिक वापर करून इंधन बचत आणि पर्यावरणपूरक शेतीस चालना द्या.',

    // Explore Page
    'explore.title': 'कृषी साधने शोधा',
    'explore.sub': 'तुमच्या जिल्ह्यातील ट्रॅक्टर, पेरणी यंत्रे, सिंचन पंप व इतर साहित्य शोधा',
    'explore.searchPlaceholder': 'साधनाचे नाव, वर्णन किंवा गावाचे नाव शोधा...',
    'explore.filterDistrict': 'सर्व जिल्हे',
    'explore.filterModel': 'सर्व देवाणघेवाण प्रकार',
    'explore.resetFilters': 'फिल्टर पूर्ववत करा',

    // Resource Cards
    'card.viewDetails': 'तपशील पहा',
    'card.perDay': '/ दिवस',
    'card.free': 'विनामूल्य वाटप',
    'card.barter': 'वस्तू-विनिमय',
    'card.rental': 'माफक भाडे',
    'card.available': 'उपलब्ध',

    // Dashboard
    'dash.title': 'शेतकरी डॅशबोर्ड',
    'dash.tabOverview': 'एकूण आढावा',
    'dash.tabMyResources': 'माझी साधने',
    'dash.tabIncoming': 'आलेल्या विनंत्या',
    'dash.tabMyRequests': 'माझ्या विनंत्या',
    'dash.tabProfile': 'माझे प्रोफाइल',
    'dash.addResource': '+ नवीन साधन जोडा',
    'dash.totalResources': 'माझी नोंदवलेली साधने',
    'dash.incomingReq': 'आलेल्या विनंत्या',
    'dash.outgoingReq': 'माझ्या बुकिंग्ज',
    'dash.approvedReq': 'मंजूर बुकिंग्ज',

    // Common Buttons & Actions
    'btn.save': 'बदल जतन करा',
    'btn.cancel': 'रद्द करा',
    'btn.submit': 'विनंती पाठवा',
    'btn.approve': 'मंजूर करा',
    'btn.reject': 'नाकारा',
    'btn.delete': 'हटवा',
    'btn.edit': 'संपादित करा',

    // Footer
    'footer.desc': 'अ‍ॅग्रीशेअर हे शेतकऱ्यांसाठी शेतकऱ्यांनी तयार केलेले कृषी साधन वाटप व्यासपीठ आहे, ज्याचा उद्देश प्रत्येक शेतकऱ्यास आधुनिक तंत्रज्ञान परवडणाऱ्या खर्चात उपलब्ध करून देणे आहे.',
    'footer.quickLinks': 'जलद दुवे',
    'footer.sharingModels': 'वाटप प्रकार',
    'footer.contactUs': 'संपर्क व मदत',
    'footer.rights': '© २०२६ अ‍ॅग्रीशेअर. बहुविद्याशाखीय अभियांत्रिकी प्रकल्प पथकाद्वारे विकसित.'
  }
};

// Get current language from localStorage (defaults to English 'en')
function getCurrentLang() {
  return localStorage.getItem('agrishare_lang') || 'en';
}

// Set language and update UI
function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'mr') lang = 'en';
  localStorage.setItem('agrishare_lang', lang);
  applyTranslations();
  updateLangButtonText();
}

// Toggle language between en and mr
function toggleLanguage() {
  const current = getCurrentLang();
  const next = current === 'en' ? 'mr' : 'en';
  setLanguage(next);
}

// Update the language toggle button display text
function updateLangButtonText() {
  const btn = document.getElementById('langToggleBtn');
  if (btn) {
    const current = getCurrentLang();
    btn.innerHTML = current === 'en' 
      ? '🌐 <strong>मराठी</strong>' 
      : '🌐 <strong>English</strong>';
  }
}

// Apply translation keys to all DOM elements with data-i18n
function applyTranslations() {
  const lang = getCurrentLang();
  const dict = translations[lang] || translations.en;

  // Text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // HTML content if data-i18n-html is present
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  // Placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // Page title
  if (dict['meta.title']) {
    document.title = dict['meta.title'];
  }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  updateLangButtonText();

  // Attach click listener to language toggle button
  const toggleBtn = document.getElementById('langToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLanguage();
    });
  }

  // Mobile hamburger menu toggle
  const mobileToggle = document.getElementById('mobileNavToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
});
