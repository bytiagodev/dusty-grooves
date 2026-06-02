import { motion } from 'framer-motion';
import BigTony from './BigTony';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';

export default function ShopInterior({
  theme,
  onToggleTheme,
  tonyPose,
  tonyMessage,
  tonyBob,
  showBubble,
  nowSpinning,
  searchResults,
  selectedTrack,
  isSearching,
  isFetchingTrack,
  onSearchFocus,
  onSearch,
  onSelectTrack,
  showResults,
}) {
  const isNight = theme === 'night';

  return (
    <motion.div
      key="interior"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
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
        draggable={false}
      />

      {/* ── Night overlay ── */}
      {isNight && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(10, 0, 16, 0.38)',
          pointerEvents: 'none',
        }} />
      )}

      {/* ── NOW SPINNING glow ── */}
      {nowSpinning && (
        <div
          className="now-spinning-glow"
          style={{
            position: 'absolute',
            top: '13.5%',
            left: '49.5%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />
      )}

      {/* ── Theme toggle — top right, consistent with exterior ── */}
      <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 20 }}>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      {/* ── Search dock — bottom center, the main interaction ── */}
      <div className="search-dock">
        {/* Results expand upward from the search bar */}
        <SearchResults
          results={searchResults}
          selectedTrack={selectedTrack}
          isFetchingTrack={isFetchingTrack}
          onSelectTrack={onSelectTrack}
          isVisible={showResults}
        />
        <SearchBar
          onSearch={onSearch}
          onFocus={onSearchFocus}
          isSearching={isSearching}
        />
      </div>

      {/* ── Big Tony (speech bubble lives inside BigTony) ── */}
      <div
        className="tony-container"
        style={{
          position: 'absolute',
          bottom: 0,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <BigTony
          pose={tonyPose}
          bob={tonyBob}
          message={tonyMessage}
          showBubble={showBubble}
        />
      </div>
    </motion.div>
  );
}