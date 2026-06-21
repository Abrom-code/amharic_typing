export const LEVELS = {
  BEGINNER: 'beginner',
  ELEMENTARY: 'elementary',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
}

export const LEVEL_ICONS = {
  beginner: '📚',
  elementary: '📖',
  intermediate: '📝',
  advanced: '🎓',
  expert: '🏆'
}

export const LEVEL_NAMES = {
  beginner: 'Level 1: Beginner',
  elementary: 'Level 2: Elementary',
  intermediate: 'Level 3: Intermediate',
  advanced: 'Level 4: Advanced',
  expert: 'Level 5: Expert'
}

export const GRADES = {
  EXCELLENT: { min: 95, label: 'Excellent', color: 'text-green-600' },
  ADVANCED: { min: 90, label: 'Advanced', color: 'text-blue-600' },
  GOOD: { min: 80, label: 'Good', color: 'text-yellow-600' },
  PRACTICE: { min: 0, label: 'Practice Again', color: 'text-red-600' }
}

// Arcade game mode definitions
export const GAME_MODES = {
  TIME_ATTACK: 'time_attack',
  WORD_SPRINT: 'word_sprint',
}

export const TIME_ATTACK_OPTIONS = [
  { label: '30s', seconds: 30 },
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '2 min', seconds: 120 },
]

export const WORD_SPRINT_OPTIONS = [
  { label: '10 words', count: 10 },
  { label: '20 words', count: 20 },
  { label: '50 words', count: 50 },
]

// Word pool for arcade mode — mix of common Amharic words
export const ARCADE_WORD_POOL = [
  'ሰላም','ቤት','አባት','እናት','ልጅ','ውሻ','ድመት','ምግብ','ውሃ','ፀሐይ',
  'ዝናብ','ደስታ','ሕይወት','ትምህርት','ሀገር','ጊዜ','ሰው','ቀን','ሌሊት','መሬት',
  'ሰማይ','ዛፍ','ወንዝ','ተራራ','ቤተሰብ','ወንድም','እህት','አዲስ','ጥሩ','መጥፎ',
  'ትልቅ','ትንሽ','ፍቅር','ሰላምታ','ስራ','ጓደኛ','ልብ','አእምሮ','ዕውቀት','ጥበብ',
  'ብርሃን','ጨለማ','ሙቀት','ቅዝቃዜ','ፍጥነት','ትዕግሥት','ደፋርነት','ታሪክ','ባህል','ሙዚቃ',
  'ምርጫ','ነፃነት','ሰላም','ሀቅ','ፍትህ','ቆይታ','ስኬት','ውድቀት','ተስፋ','ፈቃድ',
  'ጥረት','ልምምድ','ትኩረት','ቅርፅ','ቀለም','ስእል','ጽሑፍ','ቋንቋ','ቃል','ዓረፍተ',
  'ምላሽ','ጥያቄ','ድምፅ','ሃሳብ','ዕቅድ','ጅምር','መጨረሻ','ሂደት','ለውጥ','እድገት',
]
