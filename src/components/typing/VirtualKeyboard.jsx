const AMHARIC_KEYS = [
  ['ቀ', 'ቁ', 'ቂ', 'ቃ', 'ቄ', 'ቅ', 'ቆ'],
  ['በ', 'ቡ', 'ቢ', 'ባ', 'ቤ', 'ብ', 'ቦ'],
  ['ተ', 'ቱ', 'ቲ', 'ታ', 'ቴ', 'ት', 'ቶ'],
  ['ነ', 'ኑ', 'ኒ', 'ና', 'ኔ', 'ን', 'ኖ'],
  ['አ', 'ኡ', 'ኢ', 'ኣ', 'ኤ', 'እ', 'ኦ'],
  ['ከ', 'ኩ', 'ኪ', 'ካ', 'ኬ', 'ክ', 'ኮ'],
  ['ወ', 'ዉ', 'ዊ', 'ዋ', 'ዌ', 'ው', 'ዎ'],
  ['ዘ', 'ዙ', 'ዚ', 'ዛ', 'ዜ', 'ዝ', 'ዞ'],
  ['የ', 'ዩ', 'ዪ', 'ያ', 'ዬ', 'ይ', 'ዮ'],
  ['ደ', 'ዱ', 'ዲ', 'ዳ', 'ዴ', 'ድ', 'ዶ'],
  ['ገ', 'ጉ', 'ጊ', 'ጋ', 'ጌ', 'ግ', 'ጎ'],
  ['ፈ', 'ፉ', 'ፊ', 'ፋ', 'ፌ', 'ፍ', 'ፎ'],
  ['ለ', 'ሉ', 'ሊ', 'ላ', 'ሌ', 'ል', 'ሎ'],
  ['መ', 'ሙ', 'ሚ', 'ማ', 'ሜ', 'ም', 'ሞ'],
  ['ረ', 'ሩ', 'ሪ', 'ራ', 'ሬ', 'ር', 'ሮ'],
  ['ሰ', 'ሱ', 'ሲ', 'ሳ', 'ሴ', 'ስ', 'ሶ'],
  ['ሸ', 'ሹ', 'ሺ', 'ሻ', 'ሼ', 'ሽ', 'ሾ'],
  ['ቸ', 'ቹ', 'ቺ', 'ቻ', 'ቼ', 'ች', 'ቾ'],
  ['።', '፣', '፡', ' ']
]

export const VirtualKeyboard = ({ activeKey, errorKey, show = true }) => {
  if (!show) return null

  return (
    <div className="bg-gray-800 py-3 px-4 shadow-inner">
      <div className="max-w-4xl mx-auto space-y-1">
        {AMHARIC_KEYS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((key, keyIndex) => {
              const isActive = activeKey === key
              const isError = errorKey === key

              return (
                <div
                  key={keyIndex}
                  className={`
                    px-2 py-1 rounded font-amharic text-sm text-center min-w-[35px]
                    transition-all duration-100 shadow-sm
                    ${isActive ? 'bg-blue-500 text-white scale-110' : ''}
                    ${isError ? 'bg-red-500 text-white animate-shake' : ''}
                    ${!isActive && !isError ? 'bg-gray-100 text-gray-800' : ''}
                  `}
                >
                  {key}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
