import { useEffect, useRef } from 'react'

export const GhostText = ({ text, typedText }) => {
  const cursorRef = useRef(null)

  // Keep the cursor character scrolled into view inside the fixed-height box
  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }, [typedText])

  return (
    <div className="text-2xl leading-loose font-amharic tracking-wider select-none">
      {text.split('').map((char, index) => {
        let className = 'text-gray-400'

        if (index < typedText.length) {
          className = typedText[index] === char
            ? 'text-green-600 bg-green-100'
            : 'text-red-600 bg-red-100'
        } else if (index === typedText.length) {
          className = 'bg-yellow-300 text-black animate-blink'
        }

        const isCursor = index === typedText.length

        return (
          <span
            key={index}
            ref={isCursor ? cursorRef : null}
            className={`${className} px-0.5 inline-block`}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        )
      })}
    </div>
  )
}
