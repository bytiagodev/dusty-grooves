import { motion, AnimatePresence } from 'framer-motion';

const PLACEHOLDER_ART = '/images/vinyl-default.svg';

function formatListeners(n) {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M listeners`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K listeners`;
  return `${n} listeners`;
}

function RecordCard({ track, index, onSelect, isSelected, isLoading }) {
  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isLoading) onSelect(track);
    }
  };

  return (
    <motion.div
      className={`record-card ${isSelected ? 'record-card--selected' : ''}`}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, delay: index * 0.045, ease: 'easeOut' }}
      onClick={() => { if (!isLoading) onSelect(track); }}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-label={`Play ${track.name} by ${track.artist}`}
      aria-pressed={isSelected}
    >
      <div className="record-card__art-wrap">
        <img
          src={track.artUrl || PLACEHOLDER_ART}
          alt={`${track.name} cover`}
          className="record-card__art"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_ART; }}
          loading="lazy"
        />
        <div className="record-card__vinyl-overlay" aria-hidden="true">
          <svg viewBox="0 0 60 60" width="60" height="60" className="record-card__vinyl-svg">
            <circle cx="30" cy="30" r="28" fill="rgba(0,0,0,0.55)" />
            <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <circle cx="30" cy="30" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <circle cx="30" cy="30" r="10" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <circle cx="30" cy="30" r="4" fill="rgba(255,0,110,0.8)" />
          </svg>
        </div>
      </div>

      <div className="record-card__info">
        <div className="record-card__track">{track.name}</div>
        <div className="record-card__artist">{track.artist}</div>
        {track.listeners && (
          <div className="record-card__listeners">{formatListeners(track.listeners)}</div>
        )}
      </div>

      <div className="record-card__play-indicator" aria-hidden="true">
        {isSelected ? (
          <span className="record-card__now-dot" />
        ) : (
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <polygon points="3,2 13,8 3,14" />
          </svg>
        )}
      </div>
    </motion.div>
  );
}

export default function SearchResults({ results, selectedTrack, isFetchingTrack, onSelectTrack, isVisible }) {
  if (!isVisible || !results.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="results-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        role="list"
        aria-label="Search results"
      >
        <div className="results-header">
          <span className="results-count">{results.length} records found</span>
          <div className="results-groove" aria-hidden="true" />
        </div>

        <div className="results-list">
          {results.map((track, i) => {
            const isSelected =
              selectedTrack?.name === track.name &&
              selectedTrack?.artist === track.artist;
            return (
              <RecordCard
                key={`${track.name}-${track.artist}-${i}`}
                track={track}
                index={i}
                onSelect={onSelectTrack}
                isSelected={isSelected}
                isLoading={isFetchingTrack}
              />
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}