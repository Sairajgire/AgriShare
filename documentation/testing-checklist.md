# AgriShare – Comprehensive Testing Checklist & Quality Assurance

**Project Name:** AgriShare – A Web-Based Agricultural Resource Sharing & Exchange Platform  
**Subject:** MDM – Remote Sensing and GIS (Multidisciplinary Engineering Minor Project)  
**Academic Year:** 2026–2027  
**Team Members:**  
1. Omkar Ghongde (BT42004) – User Authentication and Profile Module  
2. Yash Hingolikar (BT42015) – Resource Listing and Discovery UI  
3. Arjun Joshi (BT42025) – User Data and Security Architecture  
4. Gopal Ubale (BT42054) – Resource Engine and Request Logic  
5. Sairaj Gire (BT43050) – Admin Dashboard and System Integration  

---

## 1. Quality Assurance Summary

All 23 core test scenarios outlined in the project specification were systematically verified across frontend UI, client state persistence, API route handling, database models, and role-based access control.

| Total Test Cases | Passed | Failed | Blocked | Success Rate |
| :--- | :---: | :---: | :---: | :---: |
| **23** | **23** | **0** | **0** | **100%** |

---

## 2. Test Execution Checklist

| Test ID | Test Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | **Farmer Registration** | New farmer can register with Full Name, Email, Phone, Password, Village, District, State, Landholding Size, and Farming Type. Form prevents self-assigning admin role. Password hashed with bcrypt; JWT token issued. | Account created in MongoDB with role `farmer`, password hashed, JWT stored, auto-redirect to dashboard. | **PASSED** |
| **TC-02** | **Farmer Login** | Farmer submits valid email and password; receives 200 OK with JWT token and user profile; redirected to Farmer Dashboard. | JWT returned and saved in `localStorage`, navbar updates with farmer name and logout button. | **PASSED** |
| **TC-03** | **Invalid Login** | Farmer enters incorrect password or un registered email; server rejects with HTTP 401 and descriptive error message. | "Invalid email or password" error banner displayed; no session created. | **PASSED** |
| **TC-04** | **Profile Update** | Farmer modifies mobile number, village, district, landholding, or crop type on Profile tab; updates persist in database. | Server returns HTTP 200 with updated user object; updated profile information persists on page refresh. | **PASSED** |
| **TC-05** | **Resource Listing** | Farmer adds a machinery listing (Name, Category, Image URL, Location, Dates, Sharing Model: Free/Barter/Rental). | Listing created with owner ID reference; visible immediately in My Resources and Explore page. | **PASSED** |
| **TC-06** | **Resource Editing** | Resource owner edits details (e.g. rental price, availability dates); non-owners cannot edit. | Modal populates existing data; changes saved; unauthorized edits blocked with 403 Forbidden. | **PASSED** |
| **TC-07** | **Resource Deletion** | Owner or Admin deletes an existing listing; listing is removed from database and UI. | Resource deleted from MongoDB; table and card grids update immediately without stale cards. | **PASSED** |
| **TC-08** | **Resource Search** | User enters search keywords (e.g. "Mahindra", "Tractor", "Baramati") on Explore page. | Cards filter in real time using backend text search regex across name, description, and village. | **PASSED** |
| **TC-09** | **Category Filtering** | User selects category dropdown (e.g. "Tractors", "Sprayers", "Seed Drills"). | Only resources matching selected category are retrieved and rendered. | **PASSED** |
| **TC-10** | **Location Filtering** | User selects district (e.g. "Pune", "Satara", "Solapur") or enters village name. | Server queries by district/village regex; displays count of matching regional resources. | **PASSED** |
| **TC-11** | **Resource Details View** | Clicking "View Details" opens dedicated page with full specs, owner profile, contact, pricing, and reviews. | Full machinery information rendered; booking dates initialized; owner phone shown if logged in. | **PASSED** |
| **TC-12** | **Request Submission** | Farmer selects start and end dates and submits booking request; prevents requesting own resource. | Booking recorded in MongoDB with status `Pending`; self-request rejected with clear message. | **PASSED** |
| **TC-13** | **Request Approval** | Resource owner navigates to Incoming Requests tab and clicks "Approve". | Status changes to `Approved`; prevents overlapping approvals for conflicting dates. | **PASSED** |
| **TC-14** | **Request Rejection** | Owner clicks "Reject" on incoming request. | Status transitions to `Rejected`; borrower sees rejection update in My Requests. | **PASSED** |
| **TC-15** | **Request Cancellation** | Borrower cancels an eligible pending or upcoming booking request. | Status transitions to `Cancelled`; booking slot freed for other farmers. | **PASSED** |
| **TC-16** | **Review Submission** | Farmer submits 1 to 5 star rating and written feedback on equipment performance. | Review created and linked to resource; average star rating recalculated and displayed on detail page. | **PASSED** |
| **TC-17** | **Admin Authorization** | Regular farmer attempting to access `/api/admin` routes or `admin.html` is denied. | Backend returns HTTP 403 Forbidden; frontend redirects non-admin users to dashboard. | **PASSED** |
| **TC-18** | **Admin Resource Moderation** | Admin accesses Admin Control Center to approve, reject, or delete listings, and manage user accounts. | Listing approval toggle works; user cascade deletion verified; metric counters update dynamically. | **PASSED** |
| **TC-19** | **English Language Support** | Default UI renders crisp English typography across navigation, hero, cards, and forms. | English labels, placeholders, badges, and alerts render seamlessly. | **PASSED** |
| **TC-20** | **Marathi Language Support** | User clicks language toggle in navbar (`🌐 मराठी`); entire UI switches to vernacular Marathi. | All navigation links, categories, sharing models, buttons, and dashboard tabs translate accurately. | **PASSED** |
| **TC-21** | **Language Persistence** | User toggles language to Marathi and navigates to another page or refreshes browser. | `localStorage.getItem('agrishare_lang')` maintains Marathi preference across page loads. | **PASSED** |
| **TC-22** | **Mobile Responsiveness** | Website accessed on smartphone/tablet screen widths (360px - 768px). | Mobile hamburger menu toggles cleanly; grids stack to single column; tables scroll horizontally. | **PASSED** |
| **TC-23** | **Database Persistence** | Data operations (Users, Resources, Requests, Reviews) tested against MongoDB. | Schema references, timestamps, unique email indexes, and compound query indexes function as designed. | **PASSED** |

---

## 3. UI/UX Verification Notes

- **Color Palette Consistency:** Verified strict adherence to the agricultural palette (`#244C32` Forest Green, `#687747` Olive Green, `#83A65B` Leaf Green, `#F4EFE1` Warm Cream, `#E9B95D` Harvest Yellow, `#BD704E` Terracotta, `#292D26` Charcoal). No generic blue/white templates.
- **Button Feedback:** All action buttons provide hover states, loading disabled attributes during API calls, and alert banners for error/success outcomes.
- **Empty States:** Verified informative empty states when no listings match search queries or when a farmer has zero bookings.
