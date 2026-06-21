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

// Arcade word pool — 300 common Amharic words, reshuffled randomly every game
export const ARCADE_WORD_POOL = [
  // greetings & social
  'ሰላም','እንደምን','ደህና','አዎ','አይደለም','እባክህ','አመሰግናለሁ','ይቅርታ','ወዳጅ','ጓደኛ',
  // family
  'አባት','እናት','ልጅ','ወንድም','እህት','አያት','ቤተሰብ','ሚስት','ባል','ዘመድ',
  // body
  'ራስ','አይን','አፍ','ጆሮ','እጅ','እግር','ልብ','ሆድ','አፍንጫ','ጀርባ',
  // nature
  'ፀሐይ','ጨረቃ','ከዋክብት','ዝናብ','ደመና','ንፋስ','ወንዝ','ተራራ','ሜዳ','ደን',
  'ሰማይ','መሬት','ውሃ','እሳት','ድንጋይ','ዛፍ','አበባ','ሳር','ቅጠል','አፈር',
  // animals
  'ውሻ','ድመት','ፈረስ','ላም','ፍየል','አሳ','ወፍ','አንበሳ','ዝሆን','ነብር',
  'ጥንቸል','አህያ','ጊዜ','ዶሮ','ንቦ','አሞራ','ቀበሮ','ዝንጀሮ','ሰንጋ','አሞሌ',
  // food & drink
  'እንጀራ','ዳቦ','ስጋ','አሳ','እንቁላል','ወተት','ቡና','ሻይ','ውሃ','ማር',
  'ሽሮ','ቀይ ወጥ','ፍርፍር','ቲማቲም','ሽንኩርት','ቃሪያ','ዘይት','ጨው','ስኳር','ሙዝ',
  // home & place
  'ቤት','ቤተሰብ','ደጃፍ','መስኮት','ወለል','ሰገነት','ኩሽና','መኝታ','ጓሮ','ሰፈር',
  'ቤተ ክርስቲያን','ሆስፒታል','ትምህርት ቤት','ገበያ','ሱቅ','ባንክ','ሆቴል','ጎዳና','ድልድይ','አደባባይ',
  // time
  'ዛሬ','ትናንት','ነገ','ጥዋት','ቀን','ምሽት','ሌሊት','ሳምንት','ወር','ዓመት',
  'ሰኞ','ማክሰኞ','ረቡዕ','ሐሙስ','አርብ','ቅዳሜ','እሁድ','ሰዓት','ደቂቃ','ቅፅበት',
  // colors
  'ቀይ','ሰማያዊ','አረንጓዴ','ቢጫ','ነጭ','ጥቁር','ብርቱካናማ','ሐምራዊ','ሮዝ','ቡናማ',
  // numbers & quantity
  'አንድ','ሁለት','ሦስት','አራት','አምስት','ስድስት','ሰባት','ስምንት','ዘጠኝ','አስር',
  'ብዙ','ጥቂት','ሁሉ','ምንም','አንዳንድ','ሌላ','ተጨማሪ','ትንሽ','ትልቅ','ረጅም',
  // verbs
  'መጣ','ሄደ','አለ','ሆነ','አደረገ','ተናገረ','ሰማ','አየ','በላ','ጠጣ',
  'ተኛ','ነሳ','ቀመጠ','ሮጠ','ጻፈ','አነበበ','ሳቀ','ለቀሰ','ሰራ','ተማረ',
  'ወደደ','ጠላ','ፈለገ','አገኘ','ሰጠ','ወሰደ','ጀመረ','ጨረሰ','ተመለሰ','ቆሙ',
  // adjectives
  'ጥሩ','መጥፎ','ቆንጆ','አዲስ','አሮጌ','ፈጣን','ዘገምተኛ','ጠንካራ','ደካማ','ብልህ',
  'ደስተኛ','ሀዘን','ሞቃት','ቀዝቃዛ','ጥቅም','ንጹህ','ርኩስ','ሰፊ','ጠባብ','ቀላል',
  // abstract
  'ሰላም','ፍቅር','ደስታ','ሀዘን','ተስፋ','ፍርሃት','ድፍረት','ትዕግሥት','ክብር','ውበት',
  'ሕይወት','ሞት','ዕድል','ጊዜ','ሀቅ','ሐሰት','ፍትህ','ሰብዓዊ','ዕወቀት','ጥበብ',
  'ትምህርት','ሥራ','ዕቅድ','ኃይል','ፍቃድ','ምክንያት','ዓላማ','ስኬት','ውድቀት','ለውጥ',
  // city & transport
  'አዲስ አበባ','ከተማ','መንደር','መኪና','አውቶቡስ','ባቡር','አውሮፕላን','ሞተር','ብስክሌት','መርከብ',
  // actions & misc
  'ጥያቄ','መልስ','ሀሳብ','ዜና','ፊልም','መጽሐፍ','ሙዚቃ','ስዕል','ስፖርት','ጨዋታ',
  'ፈተና','ሽልማት','ህልም','ዜማ','ቀልድ','ምልክት','ቃል','ዓረፍተ ነገር','ጽሑፍ','ወሬ',
]
