export const GhostText = ({ text, typedText }) => {
  return (
    <div className="text-4xl leading-relaxed font-amharic tracking-wider select-none">
      {text.split('').map((char, index) => {
        let className = 'text-gray-400' // Default: not yet typed
        
        // Only apply colors if we've actually typed this position
        if (index < typedText.length) {
          // Already typed - check if correct or incorrect
          if (typedText[index] === char) {
            className = 'text-green-600 bg-green-100'
          } else {
            className = 'text-red-600 bg-red-100'
          }
        } else if (index === typedText.length) {
          // Current character to type (cursor position)
          className = 'bg-yellow-300 text-black animate-blink'
        }

        return (
          <span key={index} className={`${className} px-0.5 inline-block`}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        )
      })}
    </div>
  )
}
