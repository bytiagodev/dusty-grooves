import { motion } from 'framer-motion';

const CONFIGS = {
  pink: {
    color: '#FF006E',
    glow: '0 0 7px #FF006E, 0 0 14px #FF006E, 0 0 28px #FF006E',
    glowStrong: '0 0 10px #FF006E, 0 0 25px #FF006E, 0 0 50px #FF006E',
    dimColor: '#660030',
    dimGlow: 'none',
  },
  cyan: {
    color: '#00F5D4',
    glow: '0 0 7px #00F5D4, 0 0 14px #00F5D4, 0 0 28px #00F5D4',
    glowStrong: '0 0 10px #00F5D4, 0 0 25px #00F5D4, 0 0 50px #00F5D4',
    dimColor: '#003d35',
    dimGlow: 'none',
  },
};

const SIZES = {
  large: { fontSize: '2.8rem', letterSpacing: '0.15em', borderWidth: '3px', padding: '0.3rem 1.2rem' },
  small: { fontSize: '1.1rem', letterSpacing: '0.2em', borderWidth: '2px', padding: '0.2rem 0.8rem' },
};

export default function NeonSign({
  text,
  color = 'pink',
  size = 'large',
  flicker = false,
  active = true,
  theme,
}) {
  const isNight = theme === 'night';
  const cfg = CONFIGS[color];
  const sz = SIZES[size];

  // In day mode signs are visible but muted — no glow
  const textColor = isNight ? (active ? cfg.color : cfg.dimColor) : cfg.dimColor;
  const textShadow = isNight && active ? cfg.glow : 'none';
  const borderColor = isNight ? (active ? cfg.color : cfg.dimColor) : cfg.dimColor;
  const boxShadow = isNight && active ? cfg.glow : 'none';

  return (
    <motion.div
      animate={
        isNight && active && flicker
          ? { opacity: [1, 1, 0.7, 1, 1, 0.85, 1] }
          : { opacity: 1 }
      }
      transition={
        flicker
          ? { duration: 6, repeat: Infinity, times: [0, 0.88, 0.9, 0.92, 0.94, 0.96, 1] }
          : {}
      }
      style={{
        fontFamily: "'Righteous', cursive",
        fontSize: sz.fontSize,
        letterSpacing: sz.letterSpacing,
        textTransform: 'uppercase',
        color: textColor,
        textShadow,
        border: `${sz.borderWidth} solid ${borderColor}`,
        boxShadow,
        borderRadius: '6px',
        padding: sz.padding,
        background: 'transparent',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        transition: 'color 0.4s ease, text-shadow 0.4s ease, box-shadow 0.4s ease',
      }}
    >
      {text}
    </motion.div>
  );
}