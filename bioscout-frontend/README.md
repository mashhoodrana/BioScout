# BioScout Islamabad - React Frontend

Modern React-based frontend for the BioScout biodiversity monitoring platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Flask backend running on `http://localhost:5001`

### Installation

1. **Install dependencies:**

```bash
cd bioscout-frontend
npm install
```

2. **Start the development server:**

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
bioscout-frontend/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Header.jsx       # Navigation header
│   │   ├── MapView.jsx      # Leaflet map with markers
│   │   ├── QueryPanel.jsx   # Natural language query interface
│   │   └── ObservationModal.jsx  # Add observation form
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx    # Main map view
│   │   └── AboutPage.jsx   # About/info page
│   ├── services/           # API integration
│   │   └── api.js          # Axios API calls to Flask backend
│   ├── App.jsx             # Main app component with routing
│   ├── main.jsx            # React entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
└── vite.config.js          # Vite configuration
```

## 🔌 Backend Integration

The frontend uses Vite's proxy feature to forward API calls to the Flask backend:

**Development:**

- React dev server: `http://localhost:3000`
- Flask API: `http://localhost:5001`
- API calls to `/api/*` are proxied to Flask

**Configuration** is in `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5001',
      changeOrigin: true,
    }
  }
}
```

## 🧩 Key Components

### MapView

- Displays observations on an interactive Leaflet map
- Custom markers for different species types (birds, mammals, plants, etc.)
- Popup details for each observation
- Click handlers for marker interaction

### QueryPanel

- Natural language query input
- Quick example queries
- Results display panel
- Filters map based on query results

### ObservationModal

- Multi-step form (Basic Info → Species Details → Location)
- Image upload with preview
- Interactive map for location selection
- Form validation
- API integration for submission

### Header

- Navigation menu
- "Add Observation" button
- Responsive design

## 📦 Dependencies

**Core:**

- `react` ^18.2.0
- `react-dom` ^18.2.0
- `react-router-dom` ^6.20.0

**API & Data:**

- `axios` ^1.6.2

**Mapping:**

- `leaflet` ^1.9.4
- `react-leaflet` ^4.2.1

**Build Tools:**

- `vite` ^5.0.8
- `@vitejs/plugin-react` ^4.2.1

## 🛠️ Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🎨 Styling

Components use CSS modules with individual `.css` files co-located with their React components.

**Global styles:** `src/index.css`, `src/App.css`

**Component styles:**

- `Header.css`
- `MapView.css`
- `QueryPanel.css`
- `ObservationModal.css`
- `HomePage.css`
- `AboutPage.css`

## 🌐 API Endpoints Used

**Observations:**

- `GET /api/observations/` - Fetch all observations
- `POST /api/observations/` - Create new observation (multipart/form-data)

**Queries:**

- `POST /api/queries` - Submit natural language query

**Health:**

- `GET /health` - Check API status

## 🚀 Production Build

1. **Build the app:**

```bash
npm run build
```

2. **Output:** Static files in `dist/` folder

3. **Deployment options:**
   - Serve with Flask (copy `dist/` contents to Flask `static/` folder)
   - Deploy to Vercel/Netlify (configure API proxy)
   - Use Nginx to serve static files and proxy API

## 🔧 Development Tips

**Hot Reload:** Changes to `.jsx` and `.css` files trigger instant reload

**React DevTools:** Install browser extension for component debugging

**API Testing:** Use browser DevTools Network tab to inspect API calls

**Map Debug:** Leaflet console warnings are normal for marker icons

## 📝 Code Conventions

- Components use PascalCase: `MapView.jsx`
- Functional components with hooks
- PropTypes or TypeScript for type checking (future)
- CSS co-located with components
- API calls abstracted in `services/api.js`

## 🐛 Common Issues

**Issue:** Map not displaying

- **Fix:** Ensure Leaflet CSS is loaded in `index.html`

**Issue:** API calls failing

- **Fix:** Check Flask backend is running on port 5001

**Issue:** Image upload not working

- **Fix:** Verify FormData is properly constructed and Content-Type is multipart/form-data

## 🤝 Contributing

1. Create feature branch
2. Follow existing code style
3. Test all components
4. Submit pull request

## 📄 License

Part of the BioScout Islamabad project.
