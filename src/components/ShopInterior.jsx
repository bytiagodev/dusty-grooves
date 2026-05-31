import { motion } from 'framer-motion';
import BigTony from './BigTony';
import ThemeToggle from './ThemeToggle';

export default function ShopInterior({
  theme,
  onToggleTheme,
  tonyPose,
  tonyMessage,
  tonyBob,
  showBubble,
}) {
  const isNight = theme === 'night';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* ── Background ── */}
      <img
        src="/images/shop-interior.webp"
        alt="Inside Dusty Grooves"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />

      {/* ── Night overlay ── */}
      {isNight && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(10, 0, 16, 0.35)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ── Big Tony ── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: '4%',
          zIndex: 10,
        }}
      >
        <BigTony
          pose={tonyPose}
          message={tonyMessage}
          bob={tonyBob}
          showBubble={showBubble}
          context="interior"
        />
      </motion.div>

      {/* ── Theme toggle ── */}
      <div
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 20,
        }}
      >
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      {/* ── Main content slot (search + playback — Phase 5+) ── */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '3%',
          width: 'clamp(280px, 38%, 480px)',
          zIndex: 10,
        }}
        id="main-content-slot"
      >
        {/* SearchBar, SearchResults, NowPlaying drop in here in Phase 5+ */}
      </div>
    </motion.div>
  );
}