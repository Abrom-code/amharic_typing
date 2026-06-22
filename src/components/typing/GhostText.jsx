import { useEffect, useRef } from 'react'

export const GhostText = ({ text, typedText }) => {
  const cursorRef = useRef(null)

  useEffect(() => {
    cursorRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [typedText])

  return (
    <div className="text-xl md:text-2xl leading-loose font-amharic tracking-wider select-none">
      {text.split('').map((char, i) => {
        let cls = 'text-slate-400 dark:text-slate-500'
        if (i < typedText.length) {
          cls = typedText[i] === char
            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 rounded'
            : 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded'
        } else if (i === typedText.length) {
          cls = 'text-slate-800 dark:text-slate-100 bg-brand-200 dark:bg-brand-500/40 rounded animate-blink'
        }
        return (
          <span key={i} ref={i === typedText.length ? cursorRef : null} className={`${cls} px-px inline-block`}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        )
      })}
    </div>
  )
}
