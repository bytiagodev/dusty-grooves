import { motion, AnimatePresence } from 'framer-motion';
import BigTony from './BigTony';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import NowPlaying from './NowPlaying';
import { asset } from '../utils/assetPath';

export default function ShopInterior({
  theme,
  onToggleTheme,
  tonyPose,
  tonyMessage,
  tonyBob,
  showBubble,
  searchResults,
  selectedTrack,
  isSearching,
  isFetchingTrack,
  onSearchFocus,
  onSearch,
  onSelectTrack,
  showResults,
    isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSeek,
  onVolumeChange,
}) {
  const isNight = theme === 'night';
  const hasResults = showResults && searchResults?.length > 0;

  return (
    <motion.div
      key="interior"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
      }}
    >
      <img
        src={asset('/images/shop-interior.webp')}
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

      {isNight && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(10, 0, 16, 0.38)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 20 }}>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="search-dock">
        <AnimatePresence>
          {hasResults && (
            <SearchResults
              key="results"
              results={searchResults}
              selectedTrack={selectedTrack}
              isFetchingTrack={isFetchingTrack}
              onSelectTrack={onSelectTrack}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedTrack && (
            <NowPlaying
              key="now-playing"
              track={selectedTrack}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              onPlayPause={onPlayPause}
              onSeek={onSeek}
              onVolumeChange={onVolumeChange}
            />
          )}
        </AnimatePresence>

        <SearchBar
          onSearch={onSearch}
          onFocus={onSearchFocus}
          isSearching={isSearching}
        />
      </div>

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

