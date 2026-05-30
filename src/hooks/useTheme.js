import { useState, useEffect } from 'react'

export default function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('dusty-theme')
    if (saved) return saved

    // Otherwise auto-detect by time of day
    const hour = new Date().getHours()
    return hour >= 7 && hour < 20 ? 'day' : 'night'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('dusty-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'day' ? 'night' : 'day')
  }

  const isNight = theme === 'night'

  return { theme, toggleTheme, isNight }
}