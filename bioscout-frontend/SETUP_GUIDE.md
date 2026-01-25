# 🎯 Step-by-Step Guide: Running BioScout React Frontend

## Overview

You now have a **complete React frontend** that replaces the old HTML/JS templates. Here's how everything works together.

---

## 📋 What We Built

### Project Structure

```
bioscout-frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx              ← Navigation bar
│   │   ├── MapView.jsx             ← Interactive Leaflet map
│   │   ├── QueryPanel.jsx          ← Ask questions interface
│   │   └── ObservationModal.jsx    ← Add observation form
│   ├── pages/
│   │   ├── HomePage.jsx            ← Main page (replaces index.html)
│   │   └── AboutPage.jsx           ← About page
│   ├── services/
│   │   └── api.js                  ← All API calls to Flask
│   ├── App.jsx                     ← Main app with routing
│   ├── main.jsx                    ← React entry point
│   └── index.css                   ← Global styles
├── package.json                    ← Dependencies
├── vite.config.js                  ← Dev server config
└── index.html                      ← HTML template
```

---

## 🚀 Step 1: Install Dependencies

Open PowerShell and navigate to the frontend folder:

```powershell
cd "c:\Users\pc\Downloads\BioScout-main\BioScout-main\bioscout-frontend"
```

Install all Node.js packages:

```powershell
npm install
```

**What gets installed:**

- React & React DOM
- React Router (for navigation)
- Axios (for API calls)
- Leaflet & React-Leaflet (for maps)
- Vite (development server)

**Wait time:** 1-3 minutes depending on your internet speed.

---

## 🚀 Step 2: Start Flask Backend (Terminal 1)

The React app needs the Flask API running. In one terminal:

```powershell
cd "c:\Users\pc\Downloads\BioScout-main\BioScout-main\bioscout_islamabad"
..\venv\Scripts\python.exe app.py
```

**Wait for:**

```
* Running on http://127.0.0.1:5001
```

**Keep this terminal open!**

---

## 🚀 Step 3: Start React Frontend (Terminal 2)

In a **NEW** PowerShell window:

```powershell
cd "c:\Users\pc\Downloads\BioScout-main\BioScout-main\bioscout-frontend"
npm run dev
```

**You should see:**

```
VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Keep this terminal open too!**

---

## 🌐 Step 4: Open in Browser

Open your browser and go to:

```
http://localhost:3000
```

**You should see:**

- Green navigation bar with "BioScout Islamabad"
- Interactive map showing observation markers
- Query input box at the bottom
- Colored markers (green for plants, orange for mammals, etc.)

---

## 🧪 Step 5: Test Features

### Test 1: View Observations on Map

- You should see ~169 markers on the map around Islamabad
- Click any marker to see a popup with details

### Test 2: Ask a Query

1. Click in the query box at the bottom
2. Type: `Show me all plants`
3. Click "Ask"
4. The map should filter to show only plant observations

### Test 3: Add New Observation

1. Click "Add Observation" in the header
2. Modal should open with a form
3. Fill out the 3 steps:
   - **Basic Info:** Upload image, enter species name
   - **Species Details:** Add notes, quantity
   - **Location:** Click on map to select coordinates
4. Click "Submit Observation"

### Test 4: Navigation

- Click "About" in the header
- Should navigate to an about page
- Click "Map" to go back

---

## 📊 How It Works (Architecture)

### Communication Flow

```
Browser (React)  →  Vite Dev Server  →  Flask API
   :3000         →     Proxy           →    :5001
```

**Example API Call:**

1. User clicks "Ask" with query
2. React calls: `submitQuery("Show me plants")`
3. Axios sends: `POST http://localhost:3000/api/queries`
4. Vite proxies to: `POST http://localhost:5001/api/queries`
5. Flask processes and returns JSON
6. React updates the map

### File Conversion Table

| Old (Flask Templates)      | New (React Components)            |
| -------------------------- | --------------------------------- |
| `templates/index.html`     | `pages/HomePage.jsx`              |
| `static/js/map.js`         | `components/MapView.jsx`          |
| `static/js/query.js`       | `components/QueryPanel.jsx`       |
| `static/js/observation.js` | `components/ObservationModal.jsx` |
| `static/css/style.css`     | Individual component `.css` files |

---

## 🔧 Development Workflow

### Making Changes

**1. Edit a component:**

```powershell
# Open in VS Code or any editor
code src/components/MapView.jsx
```

**2. Save the file:**

- Vite automatically reloads the browser (Hot Module Replacement)
- Changes appear instantly!

**3. Add a new feature:**

```javascript
// Example: Add a new component
// src/components/ObservationList.jsx

import React from "react";

const ObservationList = ({ observations }) => {
  return (
    <div className="observation-list">
      {observations.map((obs) => (
        <div key={obs.observation_id}>{obs.species_name}</div>
      ))}
    </div>
  );
};

export default ObservationList;
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module 'react'"

**Cause:** Dependencies not installed
**Fix:**

```powershell
npm install
```

### Issue 2: Map not showing

**Cause:** Leaflet CSS not loaded
**Fix:** Check `index.html` has this line:

```html
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>
```

### Issue 3: API calls failing (CORS errors)

**Cause:** Flask backend not running or not on port 5001
**Fix:**

1. Check Flask is running: `http://localhost:5001/health`
2. Verify proxy in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5001',
    changeOrigin: true,
  }
}
```

### Issue 4: Changes not appearing

**Cause:** Browser cache
**Fix:** Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)

---

## 🎨 Customization Guide

### Change Colors

Edit `src/components/Header.css`:

```css
.header {
  background-color: #2e7d32; /* Change this! */
}
```

### Add a New Page

1. Create `src/pages/MyPage.jsx`
2. Add route in `App.jsx`:

```javascript
<Route path="/mypage" element={<MyPage />} />
```

3. Add link in `Header.jsx`:

```javascript
<Link to="/mypage">My Page</Link>
```

### Modify Map Markers

Edit `src/components/MapView.jsx`:

```javascript
const colors = {
  bird: "#4CAF50", // Change marker colors
  mammal: "#FF9800",
  // ... add more
};
```

---

## 📦 Building for Production

When ready to deploy:

```powershell
npm run build
```

**Output:** `dist/` folder with optimized files

**Deploy options:**

1. **With Flask:** Copy `dist/` contents to Flask `static/` folder
2. **Separate hosting:** Deploy to Vercel, Netlify, or any static host
3. **Nginx:** Serve static files, proxy `/api` to Flask

---

## 🎓 Learning the Code

### Start Here (Recommended Order):

1. **`src/main.jsx`** - Entry point (5 lines)
2. **`src/App.jsx`** - Main app structure (40 lines)
3. **`src/pages/HomePage.jsx`** - Simple page component (50 lines)
4. **`src/services/api.js`** - API calls (100 lines)
5. **`src/components/MapView.jsx`** - Map logic (150 lines)
6. **`src/components/QueryPanel.jsx`** - Form handling (100 lines)
7. **`src/components/ObservationModal.jsx`** - Complex form (300+ lines)

### Key React Concepts Used:

- **Components:** Reusable UI pieces
- **Props:** Pass data between components
- **State (`useState`):** Component data that can change
- **Effects (`useEffect`):** Run code when component loads
- **Event Handlers:** Respond to user clicks/input
- **Routing:** Navigate between pages without page reload

---

## 📚 Next Steps

Now that you have the frontend running:

1. ✅ **Test all features** thoroughly
2. ✅ **Customize styling** to your preference
3. ✅ **Add new features** (e.g., observation detail page, user profiles)
4. ✅ **Optimize performance** (lazy loading, code splitting)
5. ✅ **Add error handling** (better error messages)
6. ✅ **Implement authentication** (user login)

---

## 🤔 Questions?

**Q: Can I run just the React app without Flask?**
A: No, it needs the Flask backend for data. You'll get API errors.

**Q: Do I need to restart after code changes?**
A: No! Vite hot-reloads automatically.

**Q: How do I stop the servers?**
A: Press `Ctrl + C` in each terminal.

**Q: Can I use this in production?**
A: Yes, but run `npm run build` first for optimized files.

---

**Congratulations!** 🎉 You now have a modern React frontend for BioScout!
