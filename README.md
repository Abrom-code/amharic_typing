# 🇪🇹 Amharic Typing Trainer

A professional desktop-style typing tutor for learning Amharic (አማርኛ) with progressive skill-building from Beginner to Expert.

## Features

- **5 Progressive Levels**: Beginner → Elementary → Intermediate → Advanced → Expert
- **Structured Learning**: Guided course with locked progression system
- **Real-time Metrics**: WPM, Accuracy, and Timer tracking
- **Virtual Keyboard**: Visual feedback with key highlighting
- **Achievement System**: Unlock levels and track high scores
- **Sound Effects**: Key press, error, and success sounds
- **Local Progress**: All progress saved in browser localStorage

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── layout/      # AppLayout, Sidebar, Header
│   ├── typing/      # GhostText, VirtualKeyboard
│   ├── stats/       # MetricsBar
│   └── ui/          # Button, Modal, Badge, Card
├── pages/           # Dashboard, LessonPlayer
├── context/         # AppContext, ProgressContext
├── hooks/           # useTyping, useTimer, useSound, useLocalStorage
├── data/            # courseData, levelsConfig
├── utils/           # helpers, constants, storageKeys
└── styles/          # global.css
```

## Level System

### Level 1 - Beginner
Learn single fidel groups (ለ, መ, ሰ, etc.)
- 85% accuracy required
- No timer pressure

### Level 2 - Elementary
Simple words and spacing
- 80% accuracy + 10 WPM minimum

### Level 3 - Intermediate
Full sentences with punctuation
- 85% accuracy + 15 WPM minimum

### Level 4 - Advanced
Paragraphs and fluency
- 90% accuracy + 20 WPM minimum

### Level 5 - Expert
Timed challenges (1min, 3min, 5min)
- 95% accuracy + 25+ WPM

## Adding Sound Files

Place these files in `public/sounds/`:
- `key.mp3` - Key press sound
- `error.mp3` - Error sound
- `success.mp3` - Lesson complete sound

## License

MIT
