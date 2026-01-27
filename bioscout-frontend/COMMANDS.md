# BioScout Development Scripts

## Quick Commands

### Start Everything (Two Terminals Needed)

**Terminal 1 - Flask Backend:**

```powershell
cd "c:\Users\pc\Downloads\BioScout-main\BioScout-main\bioscout_islamabad"
..\venv\Scripts\python.exe app.py
```

**Terminal 2 - React Frontend:**

### First Time Setup

```powershell
# Install frontend dependencies
cd "c:\Users\pc\Downloads\BioScout-main\BioScout-main\bioscout-frontend"
npm install
```

# run the react project 
cd "c:\Users\pc\Downloads\BioScout-main\BioScout-main\bioscout-frontend"
npm run dev
```

### Useful Commands

**Check backend health:**

```powershell
curl http://localhost:5001/health
```

**Check frontend:**
Open browser: `http://localhost:3000`

**Build for production:**

```powershell
cd bioscout-frontend
npm run build
```

**Preview production build:**

```powershell
cd bioscout-frontend
npm run preview
```

## Port Reference

- **Flask Backend:** http://localhost:5001
- **React Frontend:** http://localhost:3000

## Stop Servers

Press `Ctrl + C` in each terminal window.
