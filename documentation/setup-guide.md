# AgriShare – Deployment & Setup Guide

This comprehensive guide details how to configure, run locally, and deploy **AgriShare** across MongoDB Atlas, Render, and Netlify.

---

## 1. Local Development Setup

### Prerequisites
- **Node.js**: v18.x or higher (Tested on Node.js v24)
- **Git** installed on your system
- A web browser (Google Chrome, Microsoft Edge, Mozilla Firefox)

### Step 1: Clone or Navigate to the Project
Open terminal or VS Code in the project root:
```bash
cd AgriShare
```

### Step 2: Configure Environment Variables
Inside the `server/` directory, create a `.env` file based on `.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/agrishare?retryWrites=true&w=majority
JWT_SECRET=supersecret_agrishare_jwt_token_key_2026
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@agrishare.com
ADMIN_PASSWORD=Admin@AgriShare2026
```

### Step 3: Install Backend Dependencies & Start Server
```powershell
cd server
npm install
npm start
```
The server will start listening on `http://localhost:5000`.  
Verify health check at: `http://localhost:5000/api/health`

### Step 4: Seed Initial Admin & Demo Sample Data
To create the administrator account:
```powershell
node seedAdmin.js
```
To seed realistic Indian agriculture sample data (tractors, rotavators, sprayers, farmer accounts):
```powershell
node seedSampleData.js
```

### Step 5: Run the Frontend
You can open `client/index.html` directly in your browser, or serve it using any HTTP static server:
```powershell
cd client
npx serve . -p 3000
```
Open `http://localhost:3000` in your web browser.

---

## 2. Cloud Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign in.
2. Click **Create a Deployment** and select the **M0 Free Tier** cluster.
3. Select your preferred cloud region (e.g. `ap-south-1 Mumbai` for low latency in India).
4. Under **Database Access**, create a database user:
   - Username: `agrishare_admin`
   - Password: Choose a secure password (e.g., `AgriShareAtlas2026#`)
   - Role: Read and write to any database (`Atlas admin` or `readWriteAnyDatabase`).
5. Under **Network Access**, click **Add IP Address**:
   - Choose **Allow Access from Anywhere** (`0.0.0.0/0`) so that your Render cloud backend can connect.
6. Click **Database** > **Connect** > **Drivers** (Node.js):
   - Copy your connection string:
     `mongodb+srv://agrishare_admin:<password>@cluster0.abcde.mongodb.net/agrishare?retryWrites=true&w=majority`
7. Replace `<password>` with your database user password and paste it as `MONGO_URI` in `server/.env`.

---

## 3. GitHub Repository Preparation

From the project root (`AgriShare/`), execute the following commands in VS Code terminal:

```bash
# 1. Initialize Git repository
git init

# 2. Check status to ensure .env is ignored
git status

# 3. Add all files
git add .

# 4. Commit files
git commit -m "Initial commit: AgriShare full-stack agricultural resource sharing platform"

# 5. Create remote repository on GitHub named 'AgriShare'
# Link remote and push (replace YOUR_GITHUB_USERNAME):
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/AgriShare.git
git push -u origin main
```

---

## 4. Backend Cloud Deployment (Render)

1. Sign in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your **AgriShare** repository.
4. Configure the Web Service settings:
   - **Name**: `agrishare-backend`
   - **Region**: `Singapore` or `Frankfurt`
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Advanced** > **Add Environment Variable**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (or leave default, Render sets `PORT` automatically)
   - `MONGO_URI`: `mongodb+srv://...` (your Atlas URI)
   - `JWT_SECRET`: `your_jwt_production_secret`
   - `ADMIN_EMAIL`: `admin@agrishare.com`
   - `ADMIN_PASSWORD`: `Admin@AgriShare2026`
   - `CLIENT_URL`: `https://agrishare.netlify.app` (your Netlify URL)
6. Click **Deploy Web Service**.
7. Once deployed, note down your Render service URL: `https://agrishare-backend.onrender.com`.
8. Test in browser: `https://agrishare-backend.onrender.com/api/health`.

---

## 5. Frontend Cloud Deployment (Netlify)

1. Sign in to [Netlify](https://www.netlify.com/).
2. Click **Add new site** > **Import an existing project**.
3. Select **GitHub** and authorize access to the **AgriShare** repository.
4. Configure site settings:
   - **Branch to deploy**: `main`
   - **Base directory**: `client`
   - **Publish directory**: `client` (or leave empty when base directory is `client`)
   - **Build command**: Leave blank (Vanilla HTML/CSS/JS requires no build step)
5. Update `client/js/api.js`:
   - Set the default production URL to your Render backend:
     `https://agrishare-backend.onrender.com/api`
6. Click **Deploy site**.
7. Your frontend will be live at `https://agrishare.netlify.app` (or your assigned Netlify subdomain).

---

## 6. End-to-End Verification Checklist

After deployment, verify the live platform:
- [x] Open frontend URL on desktop and mobile browser.
- [x] Register a new farmer account from Baramati or Saswad.
- [x] Verify JWT token and instant transition to Farmer Dashboard.
- [x] List a new machinery resource (e.g. 50HP Tractor for Nominal Rental).
- [x] Browse the Explore page and test searching and filtering by category and district.
- [x] Switch language to Marathi (`🌐 मराठी`) and verify immediate translation of navigation, categories, and buttons.
- [x] Submit a booking request as a second farmer for available dates.
- [x] Log in as the machinery owner and verify incoming request approval.
- [x] Log in as Administrator to verify platform metrics, user directory, and listing moderation.
