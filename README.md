# 🇪🇹 Amharic Typing Trainer

A professional, browser-based typing tutor for learning the Amharic (አማርኛ) Ethiopic script. Built with React 18, Vite, and Tailwind CSS, it guides learners from zero through mastery across five progressive difficulty levels — all without a backend.

---

## Features

- **5 Progressive Levels** — Beginner → Elementary → Intermediate → Advanced → Expert
- **65+ Structured Lessons** — Covers every Ethiopic fidel group, labialized sounds, numbers, words, sentences, and timed passages
- **Locked Progression System** — Next level unlocks after completing 75% of the current level (100% required for Expert)
- **Real-time Metrics** — Live WPM, Accuracy, and Timer during each lesson
- **Ghost Text Display** — Character-by-character color feedback: green (correct), red (wrong), yellow (cursor)
- **Virtual Keyboard** — On-screen Amharic keyboard highlights the active key in blue and flashes red on errors
- **Per-character Letter Stats** — Tracks accuracy per Ethiopic character across sessions
- **Session History** — Every completed lesson is stored with WPM, accuracy, and date
- **Statistics Dashboard** — Charts (sessions, weekly, 30-day), alphabet proficiency heatmap, recent activity, and weak-spot suggestions
- **Achievement Popups** — Animated toast notification on lesson completion
- **Sound Effects** — Key press, error, and success sounds (place MP3s in `public/sounds/`)
- **Persistent Progress** — All data saved in browser `localStorage` — no account needed

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI and state management |
| Vite | Build tooling and dev server |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing |
| Recharts | Statistics charts |
| Lucide React | Icons |

---

## Installation

```bash
# Clone the repo
git clone https://github.com/Abrom-code/amharic_typing.git
cd amharic_typing

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Project Structure

```
src/
├── components/
│   ├── layout/        # AppLayout, Header, Sidebar
│   ├── typing/        # GhostText, VirtualKeyboard
│   ├── stats/         # MetricsBar
│   └── ui/            # Button, Modal, Badge, Card
├── pages/
│   ├── Dashboard.jsx          # Main shell — lesson selection + layout
│   ├── LessonPlayer.jsx       # Core typing experience
│   └── StatisticsDashboard.jsx
├── context/
│   ├── AppContext.jsx          # Active lesson + achievement toast state
│   └── ProgressContext.jsx     # Persistent progress (localStorage)
├── hooks/
│   ├── useTyping.js    # Typing engine: WPM, accuracy, letter stats, key highlights
│   ├── useTimer.js     # Count-up timer with optional time limit
│   ├── useSound.js     # Audio feedback hook
│   └── useLocalStorage.js
├── data/
│   ├── courseData.js   # All 65+ lessons across 5 levels
│   └── levelsConfig.js # Level unlock requirements
├── utils/
│   ├── helpers.js      # WPM/accuracy calculations, grade, time formatting
│   ├── constants.js    # Level names, icons, grade thresholds
│   └── storageKeys.js  # localStorage key constants
└── styles/
    └── global.css      # Tailwind imports + custom animations
```

---

## Level System

### Level 1 — Beginner (34 lessons)
Learn all 31 Ethiopic fidel base groups (ሀ through ፐ), labialized sounds, traditional numerals, and a full review. No timer, 85% accuracy required.

### Level 2 — Elementary (10 lessons)
Simple nouns, verbs, colors, body parts, days of the week. Timer enabled (2–3 min), 65–75% accuracy + 5–10 WPM minimum.

### Level 3 — Intermediate (8 lessons)
Full sentences, tense, travel, occupations, weather. 80–88% accuracy + 6–15 WPM.

### Level 4 — Advanced (7 lessons)
Paragraphs, explosive/glottalized sounds, punctuation, proverbs. 90–92% accuracy + 15–20 WPM.

### Level 5 — Expert (7 lessons)
Timed challenges from 60 seconds to 6 minutes covering complex passages on culture, technology, and philosophy. 92–98% accuracy + 24–35 WPM.

---

## Sound Files

Place these files in `public/sounds/` to enable audio feedback:

- `key.mp3` — key press sound
- `error.mp3` — wrong character sound  
- `success.mp3` — lesson complete sound

---

## License

MIT
