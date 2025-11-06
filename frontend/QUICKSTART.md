# 🎨 ScrapeSense Frontend - Quick Start Guide

## ✨ What You Get

A beautiful, modern React dashboard with:
- 🌊 **Glassmorphic UI** - Transparent, blurred elements with neon accents
- 🎭 **Smooth Animations** - Every interaction feels alive with Framer Motion
- 📊 **Interactive Charts** - Real-time sentiment analysis visualization
- 🌓 **Dark/Light Mode** - Rotating theme toggle with smooth transitions
- 📱 **Fully Responsive** - Perfect on mobile, tablet, and desktop
- ⚡ **Lightning Fast** - Built with Vite for instant hot reload

## 🚀 Quick Install (PowerShell)

```powershell
# Navigate to frontend
cd frontend

# Install all dependencies
npm install

# Create environment file
Copy-Item .env.example .env

# Start development server
npm run dev
```

Open browser to: **http://localhost:3000**

## 📸 Screenshots

### Dashboard Page
- Left: Animated news cards with sentiment badges
- Right: Live sentiment charts (pie, bar, line)
- Top: Filters for source and sentiment
- Refresh button with rotation animation

### Insights Page
- Sentiment trend over time (area chart)
- Top 5 positive/negative articles
- Keyword trends (bar chart)
- Animated keyword cloud

### Sources Page
- Manage scraping sources
- Add/remove sources
- Toggle active/paused status
- View source statistics

### About Page
- Project overview
- Tech stack showcase
- Team information
- Social links

## 🎨 Design Features

### Colors
- **Positive**: Green (#22c55e)
- **Neutral**: Yellow (#eab308)  
- **Negative**: Red (#ef4444)
- **Background**: Deep Navy (#0f172a)
- **Cards**: Slate (#1e293b)

### Animations
- Cards slide up and fade in
- Hover effects with scale and lift
- Search bar expands smoothly
- Theme toggle rotates 180°
- Charts animate on load
- Shimmer loading effects

### Typography
- **Headings**: Inter (bold, 700-800)
- **Body**: Inter (regular, 400)
- **Accent**: Poppins

## 🔌 API Connection

Frontend automatically proxies API requests through Vite:

```javascript
// In vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

Make sure your backend is running on **port 5000** before starting the frontend.

## 📦 Dependencies Breakdown

### Core
- `react` (18.2.0) - UI library
- `react-dom` (18.2.0) - DOM rendering
- `react-router-dom` (6.20.0) - Routing

### Styling
- `tailwindcss` (3.3.6) - Utility CSS
- `autoprefixer` (10.4.16) - CSS compatibility
- `postcss` (8.4.32) - CSS processing

### Animations
- `framer-motion` (10.16.16) - Animation library

### Charts
- `recharts` (2.10.3) - Chart library

### Icons
- `lucide-react` (0.294.0) - Icon library

### API & Utils
- `axios` (1.6.2) - HTTP client
- `date-fns` (2.30.0) - Date formatting

### Build Tools
- `vite` (5.0.8) - Build tool & dev server
- `@vitejs/plugin-react` (4.2.1) - React support

## 🎯 Key Components

### Navbar (`components/Navbar.jsx`)
```jsx
Features:
- Sticky glassmorphic header
- Animated logo with rotating sparkle
- Active tab indicator (sliding blue line)
- Expandable search bar
- Rotating Sun/Moon theme toggle
- Responsive mobile menu
```

### NewsCard (`components/NewsCard.jsx`)
```jsx
Shows:
- Article title (clickable link)
- Description (truncated to 150 chars)
- Source badge
- Sentiment badge with icon
- Published date (relative, e.g., "2 hours ago")
- "Read Full Article" gradient button

Animations:
- Slide up on mount (staggered)
- Scale & lift on hover
- Gradient button glow on hover
```

### Dashboard (`pages/Dashboard.jsx`)
```jsx
Sections:
- Header with refresh button
- Filters (source & sentiment dropdowns)
- News cards grid (left, 2/3 width)
- Charts panel (right, 1/3 width)
  - Pie chart: Sentiment distribution
  - Bar chart: Sentiment by source
  - Quick stats card

Features:
- Loading skeletons
- Empty state with icon
- Responsive grid layout
```

### Insights (`pages/Insights.jsx`)
```jsx
Sections:
- Sentiment trend over time (area chart)
- Top 5 positive articles (left column)
- Top 5 negative articles (right column)
- Keyword trends (horizontal bar chart)
- Keyword cloud (animated text)

Charts:
- Area chart with gradients
- Smooth animations
- Interactive tooltips
```

## 🛠️ Development Commands

```powershell
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📱 Responsive Design

### Mobile (< 640px)
- Single column layout
- Stacked charts
- Hamburger menu
- Touch-optimized buttons

### Tablet (640px - 1024px)
- Two column grid
- Side-by-side charts
- Expanded navigation

### Desktop (> 1024px)
- Three column layout
- Full dashboard view
- Optimal chart sizes

## 🎨 Customization

### Change Theme Colors

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      positive: '#your-color',
      neutral: '#your-color',
      negative: '#your-color',
    }
  }
}
```

### Add Animation

Use predefined variants in `utils/constants.js`:
```jsx
import { ANIMATION_VARIANTS } from '../utils/constants'

<motion.div
  variants={ANIMATION_VARIANTS.slideUp}
  initial="hidden"
  animate="visible"
>
  Your content
</motion.div>
```

### Modify API Base URL

Edit `.env`:
```
VITE_API_URL=http://your-api-url:port/api
```

## 🐛 Common Issues

### Port 3000 already in use
```powershell
# Use different port
npm run dev -- --port 3001
```

### Tailwind styles not working
```powershell
# Rebuild Tailwind
npm run build
```

### API proxy not working
1. Check backend is running on port 5000
2. Restart dev server: `npm run dev`
3. Clear browser cache

### Charts not rendering
1. Check data format matches Recharts requirements
2. Ensure `ResponsiveContainer` wraps chart
3. Verify chart library is installed

## 🚀 Next Steps

1. **Customize branding** - Update colors, logo, fonts
2. **Add features** - WebSocket, notifications, filters
3. **Optimize** - Code splitting, lazy loading
4. **Test** - Add unit tests with Jest
5. **Deploy** - Build and deploy to Vercel/Netlify

## 📚 Resources

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org)
- [Vite](https://vitejs.dev)

---

**Built with ❤️ for ScrapeSense**
