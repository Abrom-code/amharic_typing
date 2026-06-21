import { useEffect, useRef } from 'react'

export const GhostText = ({ text, typedText }) => {
  const cursorRef = useRef(null)

  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
  }, [typedText])

  return (
    <div className="text-2xl leading-loose font-amharic tracking-wider select-none">
      {text.split('').map((char, index) => {
        let className = 'text-gray-400 dark:text-gray-500'

        if (index < typedText.length) {
          className = typedText[index] === char
            ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/40'
            : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/40'
        } else if (index === typedText.length) {
          className = 'bg-yellow-300 dark:bg-yellow-500/70 text-black dark:text-white animate-blink'
        }

        return (
          <span
            key={index}
            ref={index === typedText.length ? cursorRef : null}
            className={`${className} px-0.5 inline-block`}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        )
      })}
    </div>
  )
}
