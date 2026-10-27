# 🌾 AgriShare – Agricultural Resource Sharing & Exchange Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Language Support](https://img.shields.io/badge/Languages-English%20%7C%20%E0%A4%AE%E0%A4%B0%E0%A4%BE%E0%A4%A0%E0%A5%80-orange.svg)]()
[![Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

> **Subject:** MDM – Remote Sensing and GIS  
> **Course:** Multidisciplinary Engineering Minor Project (2026–2027)  
> **Project Type:** Full-Stack Community Web Application  

---

## 📌 Executive Summary

Small and marginal farmers across India face significant financial hurdles in procuring modern agricultural machinery (tractors, rotavators, combine harvesters, boom sprayers). Concurrently, equipment owned by medium and large farmers sits idle in farm sheds for prolonged periods between seasonal operations.

**AgriShare** is a hyper-local, community-driven resource sharing platform designed to connect neighbouring farmers. Through an intuitive, mobile-responsive web interface, farmers can lend, borrow, and exchange equipment under three flexible sharing models:
1. **Free Sharing:** Community-spirited tool and pump sharing without financial charges.
2. **Barter Exchange:** Peer-to-peer exchange of machinery or seasonal farming labor.
3. **Nominal Rental:** Affordable, subsidized daily or hourly rental without middleman commissions.

Additionally, AgriShare integrates **English and Marathi bilingual language support** to ensure maximum accessibility for vernacular farming communities across rural Maharashtra.

---

## 👥 Student Engineering Team

| Roll No | Student Name | Assigned Engineering Module |
| :---: | :--- | :--- |
| **BT42004** | **Omkar Ghongde** | User Authentication and Profile Module |
| **BT42015** | **Yash Hingolikar** | Resource Listing and Discovery UI |
| **BT42025** | **Arjun Joshi** | User Data and Security Architecture |
| **BT42054** | **Gopal Ubale** | Resource Engine and Request Logic |
| **BT43050** | **Sairaj Gire** | Admin Dashboard and System Integration |

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3 (Custom Agricultural Palette), Vanilla JavaScript, Bootstrap 5 (select layout utilities), Lucide Icons.
- **Backend:** Node.js, Express.js RESTful API Architecture.
- **Database:** MongoDB Atlas with Mongoose ODM.
- **Authentication:** JSON Web Tokens (JWT) & bcrypt password hashing.
- **Vernacular Localization:** Client-side English/Marathi dictionary engine with persistent state.
- **Cloud Deployment:** Netlify (Frontend), Render (Backend), MongoDB Atlas (Database).

---

## 📂 Project Structure

```
AgriShare/
│
├── client/                      # Frontend Client Application
│   ├── index.html               # Landing page with stats, models, & steps
│   ├── login.html               # Farmer & Admin authentication
│   ├── register.html            # Farmer onboarding form
│   ├── explore.html             # Real-time search & multi-filter catalogue
│   ├── resource-details.html    # Equipment specs, booking modal, & reviews
│   ├── dashboard.html           # Farmer dashboard (Listings, Requests, Profile)
│   ├── admin.html               # Administrative control & moderation center
│   ├── about.html               # Project mission & engineering team details
│   ├── contact.html             # Farmer helpdesk & FAQs
│   ├── css/
│   │   ├── style.css            # Agricultural theme palette & components
│   │   └── responsive.css       # Mobile viewports & hamburger menu
│   ├── js/
│   │   ├── api.js               # API wrapper & English/Marathi dictionary
│   │   ├── auth.js              # Session state & JWT handling
│   │   ├── resources.js         # Search, filter, & card rendering
│   │   ├── requests.js          # Booking request modal & review posting
│   │   ├── dashboard.js         # Farmer dashboard operations
│   │   └── admin.js             # Platform metrics & moderation logic
│   ├── package.json
│   └── .env.example
│
├── server/                      # Backend REST API Server
│   ├── config/
│   │   └── db.js                # MongoDB connection handler
│   ├── models/
│   │   ├── User.js              # Farmer & Admin schema with bcrypt
│   │   ├── Resource.js          # Equipment listings schema
│   │   ├── Request.js           # Booking request & date validation schema
│   │   └── Review.js            # Rating & feedback schema
│   ├── controllers/
│   │   ├── authController.js    # Registration, login, profile
│   │   ├── resourceController.js# Resource CRUD & filters
│   │   ├── requestController.js # Booking workflow & date-overlap prevention
│   │   ├── adminController.js   # Admin analytics & moderation
│   │   └── reviewController.js  # Ratings & community reviews
│   ├── routes/                  # Express REST route endpoints
│   ├── middleware/              # JWT & Admin authorization checks
│   ├── seedAdmin.js             # Initial Admin account provisioner
│   ├── seedSampleData.js        # Realistic Indian farming seed dataset
│   ├── server.js                # Server entry point
│   ├── package.json
│   └── .env.example
│
├── documentation/               # Project Documentation
│   ├── project-report-draft.docx# Academic Report Draft (20-25 pages)
│   ├── testing-checklist.md     # 23-scenario QA matrix
│   └── setup-guide.md           # Local & Cloud deployment manual
│
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start (Local Setup)

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/agrishare?retryWrites=true&w=majority
JWT_SECRET=supersecret_agrishare_jwt_token_key_2026
ADMIN_EMAIL=admin@agrishare.com
ADMIN_PASSWORD=Admin@AgriShare2026
```

### 3. Seed Sample Data & Run Server
```bash
node seedSampleData.js
npm start
```
The backend API starts on `http://localhost:5000`.

### 4. Launch Frontend
Open `client/index.html` in your browser or run:
```bash
cd ../client
npx serve . -p 3000
```
Access the application at `http://localhost:3000`.

---

## 🌐 Bilingual Language Toggle

AgriShare provides native support for **Marathi (मराठी)** and **English**:
- Toggle instantly using the `🌐 मराठी` button in the navigation bar.
- Automatically translates headings, buttons, categories, sharing models, form labels, and dashboard controls without page reloads.
- Farmer preference is stored in `localStorage` for continuous localization.

---

## 📋 Academic Evaluation Criteria Alignment (25 Marks)

1. **Problem Definition & Proposal (5 Marks):** Comprehensive exploration of rural machinery access hurdles, idle farm assets, and spatial GIS context.
2. **Execution & Work Quality (10 Marks):** Fully responsive frontend, secure JWT authentication, conflict-free booking calendar, real-time filters, and complete Admin operations.
3. **Report & Documentation (10 Marks):** Adherence to institutional guidelines, IEEE referencing, genuine test checklists, system architecture, and editable Word report draft.
