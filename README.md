# SkillFetch Portal 💼

SkillFetch is a database-backed, real-time synchronized job portal. It enables job seekers (Candidates) to search, view, and apply for remote opportunities, allows recruiters (Employers) to post job listings and manage applicant review pipelines, and equips Admins with account moderation and cascading delete controls.

---

## 🚀 Key Features

*   **Live Job Synchronization**: On startup, the backend automatically fetches the latest remote listings from the public **Jobicy API**, parses and maps the properties, and upserts them locally into MongoDB so they remain fully interactive.
*   **Candidate Portal**:
    *   Register, sign in, and persist user sessions via `localStorage`.
    *   Manage a resume profile (contact info, bio, skills, education, experience).
    *   Submit job applications with custom pitch/cover letters.
    *   Track real-time statuses (Applied, Shortlisted, Hired, Rejected) on an application tracking board.
*   **Employer Panel**:
    *   Post new job opportunities.
    *   View candidate details, resumes, and cover letters.
    *   Manage applicant pipelines by changing statuses (Shortlist, Hire, Reject).
    *   Delete job postings with automatic cascade deletion of corresponding applications.
*   **Administrative Board**:
    *   Monitor total accounts, job postings, and applications.
    *   Suspend or unsuspend user accounts (suspension blocks user login).
    *   Delete user accounts with full cascading deletes (deleting an employer removes all their jobs and applications; deleting a candidate removes their applications).
*   **Polished Aesthetics**:
    *   Uses a clean, modern design featuring Google Font **Inter** and curated CSS elements.
    *   Includes company logos with dynamic, styled initials avatars as fallbacks for companies without logo URLs.
    *   Includes connection status banners and retry actions for network stability.

---

## 🛠️ Technology Stack

### Frontend
*   **React** (v18.2) — Component-based user interface.
*   **Vite** (v5.2) — Ultra-fast frontend build tool and dev server.
*   **Vanilla CSS** — Custom styling, transitions, and layout grids.

### Backend
*   **Node.js & Express** — Rest API server.
*   **MongoDB Atlas & Mongoose** — Cloud database connection and schema modeling.
*   **HTTPS (Native Node Module)** — Secure, dependency-free external API requests.

---

## 📂 Project Directory Structure

```text
Skillfetch/
├── backend/
│   ├── index.js          # Express server entry point, MongoDB connection, & seeder run
│   ├── models.js         # Mongoose Schemas (User, Job, Application)
│   ├── routes.js         # REST API routes (Auth, Jobs, Applications, Admin, Profiles)
│   ├── seed.js           # Live API job sync, test account setup, and fallback seeder
│   ├── package.json      # Backend configuration & server scripts
│   └── .env              # Environment secrets (MongoDB Atlas connection string - IGNORED)
├── frontend/
│   ├── src/
│   │   ├── main.jsx      # Vite entry point
│   │   ├── App.jsx       # Single-page router, page views, and API client state
│   │   └── index.css     # Global stylesheets and typography
│   ├── index.html        # HTML layout containing Font links
│   ├── vite.config.js    # Vite bundling configurations
│   └── package.json      # Frontend package configuration (pruned from unused deps)
├── .gitignore            # Excludes node_modules, .env, and OS metadata (.DS_Store)
└── README.md             # Project documentation (this file)
```

---

## 💻 Local Installation & Setup

### Prerequisites
*   **Node.js** (v18.0+ recommended)
*   **Git**

### Step 1: Clone the Repository
```bash
git clone git@github.com:jain-commits/skillfetch-portal.git
cd Skillfetch
```

### Step 2: Configure Backend Environment Variables
Create a file named `.env` in the `backend/` folder and insert your MongoDB Atlas connection string:
```env
MONGODB_URI=your_mongodb_connection_string
```

### Step 3: Run the Backend Server
```bash
cd backend
npm install
npm start
```
*The server will connect to MongoDB, seed/sync job listings, and listen on **port 5001**.*

### Step 4: Run the Frontend Development Server
Open a new terminal window, navigate to the `frontend/` folder, and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
*The Vite development server will start and serve the application on **http://localhost:5173/**.*

---

## 👥 Seeded Quick Prefills (For testing)

You can quickly sign into the application for testing using the prefill buttons on the login page:
*   **Candidate Account**: `candidate@jobportal.com` (password: `candidate123`)
*   **Employer Account**: `employer@jobportal.com` (password: `employer123`)
*   **Admin Account**: `admin@jobportal.com` (password: `admin123`)
