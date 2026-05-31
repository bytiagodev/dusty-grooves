import { motion } from 'framer-motion';

export default function ThemeToggle({ theme, onToggle }) {
  const isNight = theme === 'night';

  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isNight ? 'Switch to day' : 'Switch to night'}
      style={{
        background: isNight ? 'rgba(10,0,16,0.7)' : 'rgba(255,245,225,0.8)',
        border: isNight ? '1px solid #FF006E' : '1px solid #5C3D1A',
        borderRadius: '2rem',
        padding: '0.4rem 1rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backdropFilter: 'blur(6px)',
      }}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ fontSize: '1.1rem' }}
      >
        {isNight ? '🌙' : '☀️'}
      </motion.span>
      <span
        style={{
          fontFamily: "'Righteous', sans-serif",
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: isNight ? '#FF006E' : '#5C3D1A',
        }}
      >
        {isNight ? 'Nighttime' : 'Daytime'}
      </span>
    </motion.button>
  );
}