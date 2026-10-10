import { useState, useEffect, ReactNode } from 'react'

interface TypewriterProps {
  texts: string[]
  speed?: number
  deleteSpeed?: number
  waitTime?: number
  cursorChar?: string
  className?: string
  onComplete?: () => void
}

export default function Typewriter({
  texts,
  speed = 80,
  deleteSpeed = 50,
  waitTime = 1500,
  cursorChar = '|',
  className = '',
  onComplete,
}: TypewriterProps): ReactNode {
  const [displayText, setDisplayText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const currentText = texts[textIndex]
    let timeout: NodeJS.Timeout

    if (isWaiting) {
      timeout = setTimeout(() => {
        setIsWaiting(false)
        setIsDeleting(true)
      }, waitTime)
    } else if (!isDeleting && displayText !== currentText) {
      // Typing
      timeout = setTimeout(() => {
        setDisplayText(currentText.slice(0, displayText.length + 1))
      }, speed)
    } else if (isDeleting && displayText !== '') {
      // Deleting
      timeout = setTimeout(() => {
        setDisplayText(displayText.slice(0, -1))
      }, deleteSpeed)
    } else if (isDeleting && displayText === '') {
      // Move to next text
      setIsDeleting(false)
      const nextIndex = (textIndex + 1) % texts.length
      setTextIndex(nextIndex)
      if (nextIndex === 0 && onComplete) {
        onComplete()
      }
    } else if (!isDeleting && displayText === currentText) {
      // Text complete, wait before deleting
      setIsWaiting(true)
    }

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, isWaiting, textIndex, texts, speed, deleteSpeed, waitTime, onComplete])

  // Blink cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className={className}>
      {displayText}
      {showCursor && <span className="opacity-70">{cursorChar}</span>}
    </span>
  )
}
