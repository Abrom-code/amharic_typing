import { ARCADE_WORD_POOL } from './constants'

/** Fisher-Yates shuffle */
export const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick n random words, cycling pool if needed */
export const pickWords = (n) => {
  const result = []
  while (result.length < n) result.push(...shuffle(ARCADE_WORD_POOL))
  return result.slice(0, n)
}

/** Single random word */
export const randomWord = () => ARCADE_WORD_POOL[Math.floor(Math.random() * ARCADE_WORD_POOL.length)]

/** Word of given approximate length (short ≤4, medium 5-6, long ≥7 chars) */
export const wordByLength = (type = 'medium') => {
  const short  = ARCADE_WORD_POOL.filter(w => w.length <= 4)
  const medium = ARCADE_WORD_POOL.filter(w => w.length >= 5 && w.length <= 6)
  const long   = ARCADE_WORD_POOL.filter(w => w.length >= 7)
  const pool   = type === 'short' ? short : type === 'long' ? long : medium
  const src    = pool.length ? pool : ARCADE_WORD_POOL
  return src[Math.floor(Math.random() * src.length)]
}
