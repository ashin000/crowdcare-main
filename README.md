# CrowdCare - Civic Engagement Portal

> **Bridge the gap between citizens and government**

A modern, full-stack civic engagement platform that enables citizens to report local infrastructure issues, participate in municipal polls, track resolution progress, and check official government announcements.

This application has been migrated from its legacy Django/HTML stack to a modern serverless architecture powered by **React 18**, **Vite**, and **Firebase (Authentication, Cloud Firestore Database, and Cloud Storage)**.

---

## 🌟 Key Features

### 👤 Citizen Portal
- 📝 **Easy Issue Reporting**: File reports for potholes, waste, water, streetlights, or safety with location details, severity, and custom image references.
- 🔄 **Real-time Status Tracking**: Watch your reported issue move along a dynamic progress timeline (Reported ➔ Acknowledged ➔ In Progress ➔ Resolved).
- 🗳️ **Democratic Priority Polls**: Vote in local civic priority polls posted by officials and see live percentage outcomes immediately.
- 📢 **Official Announcements Feed**: Stay updated with utility shutdown notices, maintenance schedules, or municipal updates.
- 🔔 **Instant Alerts & Notifications**: Receive alerts whenever officials comment on or update the status of your reported issues.

### 🏢 Official & Admin Portal
- 📊 **Real-time Analytics Dashboard**: View civic resolution status breakdowns and categories via interactive SVG data charts.
- 📋 **Issue Management Queue**: Filter, inspect, and update the status of reported issues, assign staff, and post official progress updates.
- 📢 **Broadcast Announcements**: Publish important municipal alerts that instantly notify all citizens in the district.
- 🗳️ **Launch Civic Polls**: Create active voting surveys to gather democratic public opinion on budget priorities.

---

## 🏗️ Technology Stack
- **Frontend Core**: React 18, Vite 5
- **Styling & Theme**: Custom Vanilla CSS (featuring glassmorphism, responsive grids, Outfit/Plus Jakarta typography, and CSS micro-animations)
- **Backend Services**: Firebase Web SDK (v10+)
  - **Firebase Authentication** (User management and session flows)
  - **Cloud Firestore Database** (Serverless NoSQL documents storage)
  - **Firebase Storage** (Issue reference attachments)
  - **Mock Fallback System** (Seamless LocalStorage-backed simulation)

---

## 🚀 Quick Start (Zero Configuration Required!)

The application includes an **Automatic Fallback Mock Mode** that allows you to run, test, and evaluate the entire application locally in your browser without setting up a Firebase account.

### 1. Install & Run (Windows)
Double-click the **[run_dev.bat](run_dev.bat)** file in the root directory. It will automatically run `npm install` (if node_modules are missing) and fire up the Vite local server.

### 2. Manual Commands (All Platforms)
Open your terminal in the project root directory and run:

```bash
# Install dependencies
npm install

# Start Vite local development server
npm run dev
```

The app will run on: **http://localhost:5173**

---

## 🧪 Default Test Accounts (Mock Mode)

When running in **Mock Mode**, you can sign in immediately using these predefined credentials:

1. **Citizen Portal Test**
   - **Email**: `citizen@example.com`
   - **Password**: `Admin@123456`
   
2. **Official Panel Test**
   - **Email**: `official@example.com`
   - **Password**: `Admin@123456`

*(You can also sign up with new email addresses to create new custom accounts directly!)*

---

## 🔥 Connecting to Your Live Firebase Project

To swap out the mock storage and link the application to your own live Google Firebase backend:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Register a new Web App inside your Firebase project to get the config keys.
3. Rename the **`.env.example`** file in the root of this project to **`.env`**.
4. Fill in the keys with your Firebase project credentials:

```ini
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... add other fields as shown in .env.example
```

5. In your Firebase Console, make sure to enable:
   - **Email/Password authentication** under *Build ➔ Authentication*.
   - **Cloud Firestore** under *Build ➔ Firestore Database* (in test mode).
6. Restart your local Vite server (`npm run dev`). The application will detect the `.env` keys and automatically start reading/writing to your live Cloud Firestore.

---

## 📦 Directory Structure

```
CrowdCare/
├── src/
│   ├── components/               # Shareable UI blocks
│   │   ├── Navbar.jsx            # Glassmorphic nav & theme controller
│   │   ├── IssueCard.jsx         # Card item displaying issue metrics
│   │   └── NotificationDrawer.jsx# Slide-in notifications panel
│   ├── pages/                    # Main app page screens
│   │   ├── LandingPage.jsx       # Elegant introductory homepage
│   │   ├── Login.jsx             # Role-selected login forms
│   │   ├── Register.jsx          # Register citizen/official details
│   │   ├── CitizenDashboard.jsx  # Citizen issue reporting & polls
│   │   ├── OfficialDashboard.jsx # Analytics charts & management queue
│   │   └── IssueDetail.jsx       # Detail modal, timeline, & comments
│   ├── services/
│   │   └── firebase.js           # Firebase SDK & local mock database
│   ├── styles/
│   │   └── index.css             # Unified CSS variables & style tokens
│   ├── App.jsx                   # Global router, notification ticks
│   └── main.jsx                  # App mounting & stylesheet imports
├── .env.example                  # Environment template config
├── index.html                    # Root index template
├── package.json                  # NPM modules configuration
├── run_dev.bat                   # Quick double-click script (Windows)
└── README.md                     # This file
```

---

**Made with ❤️ by the CrowdCare Team**
