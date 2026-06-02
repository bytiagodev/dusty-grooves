import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import ShopExterior from './components/ShopExterior';
import ShopInterior from './components/ShopInterior';
import useAppState from './hooks/useAppState';
import useLastFm from './hooks/useLastFm';
import './index.css';

export default function App() {
  const [scene, setScene] = useState('exterior');
  const [theme, setTheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'
  );
  const [showResults, setShowResults] = useState(false);

  const toggleTheme = () => setTheme((t) => (t === 'day' ? 'night' : 'day'));

  const { tonyPose, tonyMessage, tonyBob, nowSpinning, showBubble, actions } = useAppState();

  const { results, selectedTrack, isSearching, isFetchingTrack, searchTracks, fetchTrackInfo } = useLastFm();

  const handleEnterShop = useCallback(() => {
    setScene('interior');
    actions.reset();
  }, [actions]);

  const handleSearchFocus = useCallback(() => {
    actions.startSearch();
  }, [actions]);

  const handleSearch = useCallback(async (query) => {
    setShowResults(false);
    actions.submitSearch();

    const outcome = await searchTracks(query);

    if (outcome?.found) {
      actions.showResults();
      setShowResults(true);
    } else {
      actions.noResults();
    }
  }, [actions, searchTracks]);

  const handleSelectTrack = useCallback(async (track) => {
    actions.selectTrack();

    const fullTrack = await fetchTrackInfo({
      name: track.name,
      artist: track.artist,
      mbid: track.mbid,
    });

    if (fullTrack) {
      actions.startPlaying();
    } else {
      actions.setError();
    }
  }, [actions, fetchTrackInfo]);

  return (
    <div data-theme={theme} style={{ width: '100vw', height: '100dvh', overflow: 'hidden' }}>
      <div className="crt-overlay" />
      <AnimatePresence mode="wait">
        {scene === 'exterior' ? (
          <ShopExterior
            key="exterior"
            theme={theme}
            onToggleTheme={toggleTheme}
            onEnter={handleEnterShop}
          />
        ) : (
          <ShopInterior
            key="interior"
            theme={theme}
            onToggleTheme={toggleTheme}
            tonyPose={tonyPose}
            tonyMessage={tonyMessage}
            tonyBob={tonyBob}
            showBubble={showBubble}
            nowSpinning={nowSpinning}
            searchResults={results}
            selectedTrack={selectedTrack}
            isSearching={isSearching}
            isFetchingTrack={isFetchingTrack}
            onSearchFocus={handleSearchFocus}
            onSearch={handleSearch}
            onSelectTrack={handleSelectTrack}
            showResults={showResults}
          />
        )}
      </AnimatePresence>
    </div>
  );
}