import { useState, useRef } from 'react';

export default function SearchBar({ onSearch, onFocus, isSearching, disabled }) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  const handleBlur = () => setFocused(false);

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed || isSearching) return;
    onSearch(trimmed);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="search-bar-wrapper" data-focused={focused}>
      <div className="search-label">
        <span className="search-label-text">FIND YOUR RECORD</span>
      </div>

      <div className="search-row">
        <div className="search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="artist, song, album…"
          className="search-input"
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
          maxLength={120}
          aria-label="Search for a song"
        />

        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="search-clear-btn"
            aria-label="Clear search"
            tabIndex={-1}
          >
            ✕
          </button>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!query.trim() || isSearching || disabled}
          className="search-submit-btn"
          aria-label="Search"
        >
          {isSearching ? (
            <span className="search-spinner" aria-hidden="true" />
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="22" y2="22" />
            </svg>
          )}
        </button>
      </div>

      <div className="search-groove" aria-hidden="true" />
    </div>
  );
}