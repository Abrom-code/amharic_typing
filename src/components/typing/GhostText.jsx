export const GhostText = ({ text, currentIndex, typedChars }) => {
  return (
    <div className="text-4xl leading-relaxed font-amharic tracking-wider select-none">
      {text.split('').map((char, index) => {
        let className = ''
        
        if (index < currentIndex) {
          className = typedChars[index] === char ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
        } else if (index === currentIndex) {
          className = 'bg-blue-500 text-white animate-blink'
        }

        return (
          <span key={index} className={`${className} px-0.5`}>
            {char}
          </span>
        )
      })}
    </div>
  )
}
