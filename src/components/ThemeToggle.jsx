import { motion } from 'framer-motion'

export default function ThemeToggle({ toggleTheme, isNight }) {
  return (
    <motion.button
      onClick={toggleTheme}
      className="font-groovy text-sm tracking-wide px-4 py-2 rounded cursor-pointer"
      style={{
        color: isNight ? '#FFE600' : '#5C3D1A',
        border: isNight ? '1px solid #FFE600' : '1px solid #5C3D1A',
        background: 'transparent',
        boxShadow: isNight ? '0 0 5px #FFE600, 0 0 10px #FFE600' : 'none',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isNight ? '☀️ Daytime' : '🌙 Nighttime'}
    </motion.button>
  )
}