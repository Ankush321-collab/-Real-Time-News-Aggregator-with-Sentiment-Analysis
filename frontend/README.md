# ScrapeSense Frontend

Modern, animated React.js frontend for **AI-Powered ScrapeSense** – Real-Time News Aggregator with Sentiment Analysis.

## 🚀 Features

- ✨ **Glassmorphic UI** with smooth Framer Motion animations
- 📊 **Interactive Charts** (Recharts) for sentiment visualization
- 🌓 **Dark/Light Mode** with rotating theme toggle
- 🔍 **Expandable Search Bar** with smooth animations
- 📱 **Fully Responsive** design for all screen sizes
- 🎨 **Modern Design** with Tailwind CSS
- ⚡ **Fast & Optimized** with Vite

## 📦 Tech Stack

- **React.js 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - API calls
- **React Router DOM** - Routing
- **date-fns** - Date formatting

## 🛠️ Installation

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend API running on `http://localhost:5000`

### Setup

1. **Navigate to frontend folder:**
   \`\`\`powershell
   cd frontend
   \`\`\`

2. **Install dependencies:**
   \`\`\`powershell
   npm install
   \`\`\`

3. **Create environment file:**
   \`\`\`powershell
   Copy-Item .env.example .env
   \`\`\`

4. **Update `.env` if needed:**
   \`\`\`
   VITE_API_URL=http://localhost:5000/api
   \`\`\`

5. **Start development server:**
   \`\`\`powershell
   npm run dev
   \`\`\`

6. **Open browser:**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

\`\`\`
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx           # Main layout wrapper
│   │   ├── Navbar.jsx           # Glassmorphic navbar with search
│   │   ├── NewsCard.jsx         # Animated news card component
│   │   └── SkeletonLoader.jsx   # Loading skeletons
│   ├── pages/
│   │   ├── Dashboard.jsx        # Main dashboard with news & charts
│   │   ├── Insights.jsx         # Deep analytics page
│   │   ├── Sources.jsx          # Source management
│   │   └── About.jsx            # About page
│   ├── context/
│   │   └── ThemeContext.jsx     # Dark/Light theme provider
│   ├── services/
│   │   └── api.js               # Axios API service
│   ├── utils/
│   │   ├── constants.js         # App constants & animation variants
│   │   └── helpers.js           # Helper functions
│   ├── App.jsx                  # Root component with routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
\`\`\`

## 🎨 Pages

### 1. Dashboard (`/`)
- Real-time news cards with sentiment badges
- Sentiment distribution pie chart
- Sentiment by source bar chart
- Quick stats panel
- Source & sentiment filters
- Refresh button with rotation animation

### 2. Insights (`/insights`)
- Sentiment trend over time (area chart)
- Top 5 most positive articles
- Top 5 most negative articles
- Top keywords bar chart
- Animated keyword cloud

### 3. Sources (`/sources`)
- Source management interface
- Add/remove sources
- Toggle source status (Active/Paused)
- Source statistics

### 4. About (`/about`)
- Project description
- Key features showcase
- Tech stack breakdown
- Social links

## 🎭 Components

### NewsCard
Animated card displaying:
- Article title (clickable)
- Description (truncated)
- Source name
- Published date
- Sentiment badge with icon
- "Read Full Article" button with gradient hover

### Navbar
Features:
- Glassmorphic sticky header
- Animated logo with glow effect
- Active tab indicator
- Expandable search bar
- Rotating theme toggle (Sun/Moon)
- Mobile responsive menu

### SkeletonLoader
Loading states:
- `SkeletonCard` - Individual card skeleton
- `SkeletonGrid` - Grid of loading cards
- `SkeletonChart` - Chart loading placeholder

## 🎨 Design System

### Colors
\`\`\`css
Positive: #22c55e (green)
Neutral:  #eab308 (yellow)
Negative: #ef4444 (red)
Dark BG:  #0f172a (navy)
Dark Card: #1e293b (slate)
\`\`\`

### Fonts
- **Primary:** Inter
- **Secondary:** Poppins

### Animations
- **fadeIn** - Opacity fade
- **slideUp** - Slide from bottom
- **slideInFromLeft** - Slide from left
- **slideInFromRight** - Slide from right
- **scaleIn** - Scale up
- **shimmer** - Loading effect
- **float** - Floating animation
- **glow** - Pulsing glow

## 🔌 API Integration

The frontend connects to the backend API via Axios. Configure the base URL in `.env`:

\`\`\`
VITE_API_URL=http://localhost:5000/api
\`\`\`

### API Endpoints Used
- `GET /api/articles` - Fetch articles with filters
- `GET /api/articles/stats` - Get sentiment statistics
- `GET /api/articles/keywords` - Get top keywords

## 📱 Responsive Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## 🚀 Build for Production

\`\`\`powershell
npm run build
\`\`\`

Preview production build:
\`\`\`powershell
npm run preview
\`\`\`

## 🧪 Development Tips

1. **Hot Module Replacement (HMR)** is enabled - changes reflect instantly
2. **Tailwind JIT** compiles only used classes
3. **React DevTools** recommended for debugging
4. **Use Framer Motion DevTools** to debug animations

## 🎯 Future Enhancements

- [ ] WebSocket for real-time updates
- [ ] AI summary modal for articles
- [ ] Floating filter button for mobile
- [ ] Advanced search with filters
- [ ] Export data as CSV/JSON
- [ ] User authentication
- [ ] Personalized dashboard

## 📄 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

Contributions welcome! Please follow the existing code style and animation patterns.

---

**Built with ❤️ using React, Tailwind CSS, and Framer Motion**
