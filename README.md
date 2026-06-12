<div align="center">
  <h1>SkillFetch Portal 💼</h1>
  <p><i>A database-backed, real-time synchronized remote job portal.</i></p>
  
  ![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
  ![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?logo=react)
  ![Node.js](https://img.shields.io/badge/Node.js-Express-339933.svg?logo=node.js)
  ![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?logo=mongodb)
</div>

---

**SkillFetch** is a comprehensive, full-stack job board designed to bridge the gap between remote talent and growing companies. 

It equips **Candidates** with powerful tools to search and apply for remote opportunities, enables **Employers** to post jobs and manage applicant review pipelines, and provides **Admins** with robust moderation controls. The platform is automatically synchronized with the public Jobicy API to ensure a constant stream of fresh, interactive job listings.

## ✨ Key Features

### 🔄 Live Job Synchronization
On startup, the backend automatically fetches the latest remote listings from the **Jobicy API**. It parses the data, maps the properties, and upserts them locally into MongoDB, ensuring the job board is always populated and fully interactive.

### 🧑‍💻 Candidate Experience
*   **Persistent Sessions:** Secure registration and login, with sessions maintained via `localStorage`.
*   **Dynamic Resumes:** Manage a comprehensive profile including contact info, a bio, skills, education, and professional experience.
*   **One-Click Applications:** Submit applications complete with custom pitches or cover letters.
*   **Kanban Tracking:** Track application progress in real-time across distinct statuses *(Applied, Shortlisted, Hired, Rejected)*.

### 🏢 Employer Panel
*   **Job Management:** Post, edit, and manage remote job opportunities.
*   **Applicant Review:** Seamlessly view candidate profiles, resumes, and cover letters within the platform.
*   **Pipeline Control:** Move candidates through the hiring pipeline by updating their application status.
*   **Smart Deletion:** Removing a job posting triggers a cascading delete, automatically cleaning up associated applications.

### 🛡️ Administrative Board
*   **System Overview:** Monitor total user accounts, active job postings, and total applications.
*   **Moderation:** Suspend or unsuspend user accounts instantly to block unauthorized access.
*   **Cascading Removal:** Delete user accounts safely. Deleting an employer removes all their jobs and applications; deleting a candidate wipes their application history.

### 💅 Polished, Modern UI (Updated in v1.2.0)
*   **Design System:** Built with a clean, modern aesthetic utilizing **Inter** typography and a refined color palette.
*   **Fluid Animations:** Features smooth CSS transitions and keyframe animations that respect OS-level `prefers-reduced-motion` settings.
*   **Custom Components:** Utilizes highly reusable, responsive `Card` components for job listings and profiles.
*   **Resilient Architecture:** Implemented global React Error Boundaries to prevent full-app crashes, ensuring maximum uptime and a premium user experience.
*   **Smart Avatars:** Generates dynamic, styled initials for companies missing logo URLs.

---

## 🛠️ Technology Stack

| Environment | Technologies |
| :--- | :--- |
| **Frontend** | React (v18.2), Vite (v5.2), Vanilla CSS |
| **Backend** | Node.js, Express, Native HTTPS Module |
| **Database** | MongoDB Atlas, Mongoose ODM |

---

## 🚀 Getting Started

Follow these steps to run the SkillFetch Portal locally on your machine.

### Prerequisites
*   **Node.js** (v18.0+ recommended)
*   **Git**

### 1. Clone the Repository
```bash
git clone git@github.com:jain-commits/skillfetch-portal.git
cd Skillfetch
2. Configure Environment Variables
Create a file named .env inside the backend/ directory and insert your MongoDB Atlas connection string:

Code snippet
MONGODB_URI=your_mongodb_connection_string_here
3. Initialize the Backend
Open a terminal in the backend/ folder to install dependencies and start the Express server.

Bash
cd backend
npm install
npm start
Note: The server will connect to MongoDB, sync live job listings, and listen on port 5001.

4. Initialize the Frontend
Open a new terminal window in the frontend/ folder to spin up the Vite development server.

Bash
cd frontend
npm install
npm run dev
Note: The frontend application will be served locally at http://localhost:5173/.

🧪 Testing Credentials
To make testing easier, the application comes with seeded accounts. You can click the prefill buttons on the login page, or manually use the following credentials:

Candidate: candidate@jobportal.com | Pass: candidate123

Employer: employer@jobportal.com | Pass: employer123

Admin: admin@jobportal.com | Pass: admin123

📂 Project Architecture
Plaintext
Skillfetch/
├── backend/
│   ├── index.js          # Express server entry, DB connection, & seeder run
│   ├── models.js         # Mongoose Schemas (User, Job, Application)
│   ├── routes.js         # REST API routes (Auth, Jobs, Applications, Admin)
│   ├── seed.js           # Live API job sync and test account seeder
│   └── .env              # Environment secrets (IGNORED IN GIT)
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI elements (Cards, Buttons, ErrorBoundary)
│   │   ├── styles/       # Modular Vanilla CSS stylesheets
│   │   ├── App.jsx       # Single-page router and state management
│   │   └── main.jsx      # Vite entry point
│   └── vite.config.js    # Bundler configuration
└── README.md             # Project documentation