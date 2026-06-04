import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function formatListeners(n) {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M listeners`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K listeners`;
  return `${n} listeners`;
}

function RecordCard({ track, index, onSelect, isSelected, isLoading }) {
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isLoading) onSelect(track);
    }
  };

  return (
    <motion.div
      className={`record-card ${isSelected ? "record-card--selected" : ""}`}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, delay: index * 0.045, ease: "easeOut" }}
      onClick={() => {
        if (!isLoading) onSelect(track);
      }}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-label={`Play ${track.name} by ${track.artist}`}
      aria-pressed={isSelected}
    >
      <div className="record-card__art-wrap">
        <svg
          viewBox="0 0 60 60"
          width="46"
          height="46"
          className="record-card__vinyl-svg"
          aria-hidden="true"
        >
          <circle cx="30" cy="30" r="28" fill="#0a0010" />
          <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          <circle cx="30" cy="30" r="19" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          <circle cx="30" cy="30" r="14" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
          <circle cx="30" cy="30" r="9" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
          <circle cx="30" cy="30" r="5" fill="#1a0030" />
          <circle cx="30" cy="30" r="3" fill="rgba(255,0,110,0.8)" />
        </svg>
      </div>

      <div className="record-card__info">
        <div className="record-card__track">{track.name}</div>
        <div className="record-card__artist">{track.artist}</div>
        {track.listeners && (
          <div className="record-card__listeners">
            {formatListeners(track.listeners)}
          </div>
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

// NOTE: Mount/unmount is controlled by AnimatePresence in ShopInterior.
// This component always renders its content when mounted.

export default function SearchResults({
  results,
  selectedTrack,
  isFetchingTrack,
  onSelectTrack,
}) {
  const [collapsedFor, setCollapsedFor] = useState(null);
  const isCollapsed = collapsedFor === results;

  const toggleCollapsed = () => {
    setCollapsedFor(isCollapsed ? null : results);
  };

  return (
    <motion.div
      className="results-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      role="region"
      aria-label="Search results"
    >
      {/* ── Header — always visible, tap to toggle ── */}
      <button
        className="results-header results-header--btn"
        onClick={() => toggleCollapsed()}
        aria-expanded={!isCollapsed}
        aria-controls="results-list"
      >
        <span className="results-count">{results.length} records found</span>

        <div className="results-header__right">
          <span className="results-toggle-hint">
            {isCollapsed ? "show" : "hide"}
          </span>
          <motion.svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="currentColor"
            className="results-chevron"
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          >
            <path
              d="M2 5l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </div>

        <div className="results-groove" aria-hidden="true" />
      </button>

      {/* ── Collapsible list ── */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            id="results-list"
            className="results-list"
            role="list"
            key="results-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
