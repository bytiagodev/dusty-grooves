import { motion } from 'framer-motion'

const colorMap = {
  pink: {
    text: '#FF006E',
    shadow: '0 0 7px #FF006E, 0 0 10px #FF006E, 0 0 21px #FF006E, 0 0 42px #FF006E',
    border: '1px solid #FF006E',
    boxShadow: '0 0 5px #FF006E, 0 0 10px #FF006E, 0 0 20px #FF006E, inset 0 0 5px rgba(255,0,110,0.1)',
  },
  cyan: {
    text: '#00F5D4',
    shadow: '0 0 7px #00F5D4, 0 0 10px #00F5D4, 0 0 21px #00F5D4, 0 0 42px #00F5D4',
    border: '1px solid #00F5D4',
    boxShadow: '0 0 5px #00F5D4, 0 0 10px #00F5D4, 0 0 20px #00F5D4, inset 0 0 5px rgba(0,245,212,0.1)',
  },
  yellow: {
    text: '#FFE600',
    shadow: '0 0 7px #FFE600, 0 0 10px #FFE600, 0 0 21px #FFE600, 0 0 42px #FFE600',
    border: '1px solid #FFE600',
    boxShadow: '0 0 5px #FFE600, 0 0 10px #FFE600, 0 0 20px #FFE600, inset 0 0 5px rgba(255,230,0,0.1)',
  },
}

const sizeClasses = {
  sm: 'text-lg px-3 py-1',
  md: 'text-2xl px-5 py-2',
  lg: 'text-4xl px-7 py-3',
  xl: 'text-6xl px-10 py-4',
}

// Computed once at module load, not during render
const flickerDelay = Math.random() * 8 + 4

const flickerVariants = {
  on: { opacity: 1 },
  flicker: {
    opacity: [1, 0.6, 1, 0.8, 1, 0.6, 1],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatDelay: flickerDelay,
    },
  },
}

export default function NeonSign({
  text,
  color = 'pink',
  size = 'md',
  flicker = false,
  bordered = false,
  className = '',
}) {
  const colors = colorMap[color] || colorMap.pink

  return (
    <motion.div
      className={`font-display inline-block ${sizeClasses[size]} ${className}`}
      style={{
        color: colors.text,
        textShadow: colors.shadow,
        ...(bordered && {
          border: colors.border,
          boxShadow: colors.boxShadow,
          borderRadius: '4px',
        }),
      }}
      variants={flickerVariants}
      animate={flicker ? 'flicker' : 'on'}
    >
      {text}
    </motion.div>
  )
}