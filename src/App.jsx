import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import ShopExterior from "./components/ShopExterior";
import ShopInterior from "./components/ShopInterior";
import AudioEngine from "./components/AudioEngine";
import useAppState from "./hooks/useAppState";
import useLastFm from "./hooks/useLastFm";
import usePiped from "./hooks/usePiped";
import { PLACEHOLDER_ART } from "./utils/placeholderArt";
import "./index.css";

export default function App() {
  const [scene, setScene] = useState("exterior");
  const [theme, setTheme] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day",
  );
  const [showResults, setShowResults] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const audioRef = useRef(null);

  const toggleTheme = () => setTheme((t) => (t === "day" ? "night" : "day"));

  const { tonyPose, tonyMessage, tonyBob, showBubble, actions } =
    useAppState();
  const {
    results,
    selectedTrack,
    isSearching,
    isFetchingTrack,
    searchTracks,
    fetchTrackInfo,
  } = useLastFm();
  const { videoId, streamMeta, isLoadingStream, searchStream, clearStream } =
    usePiped();

  const handleEnterShop = useCallback(() => {
    setScene("interior");
    actions.reset();
  }, [actions]);

  const handleSearchFocus = useCallback(() => {
    actions.startSearch();
  }, [actions]);

  const handleSearch = useCallback(
    async (query) => {
      setShowResults(false);
      actions.submitSearch();

      const outcome = await searchTracks(query);

      if (outcome?.found) {
        actions.showResults();
        setShowResults(true);
      } else {
        actions.noResults();
      }
    },
    [actions, searchTracks],
  );

  const handleSelectTrack = useCallback(
    async (track) => {

      audioRef.current?.pause();
      clearStream();

      actions.selectTrack(track.name);

      const fullTrack = await fetchTrackInfo({
        name: track.name,
        artist: track.artist,
        mbid: track.mbid,
      });

      if (!fullTrack) {
        actions.setError("Could not load track info");
        return;
      }

      const stream = await searchStream(
        fullTrack.name,
        fullTrack.artist,
        fullTrack.duration,
      );

      if (stream?.videoId) {

      } else {
        actions.setError("Could not find audio for this track");
      }
    },
    [actions, fetchTrackInfo, searchStream, clearStream],
  );

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }, [isPlaying]);

  const handleSeek = useCallback((time) => {
    audioRef.current?.seek(time);
  }, []);

  const handleVolumeChange = useCallback((v) => {
    setVolume(v);
    audioRef.current?.setVolume(v);
  }, []);

  const selectedTrackRef = useRef(null);
  useEffect(() => {
    selectedTrackRef.current = selectedTrack;
  }, [selectedTrack]);

  const handleAudioPlay = useCallback(() => {
    setIsPlaying(true);
    const track = selectedTrackRef.current;
    if (track) {
      actions.startPlaying(track.name, track.artist);
    }
  }, [actions]);

  const handleAudioPause = useCallback(() => {
    setIsPlaying(false);
    actions.pausePlayback();
  }, [actions]);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    actions.songEnded();
  }, [actions]);

  const handleTimeUpdate = useCallback(({ currentTime: ct, duration: dur }) => {
    setCurrentTime(ct);
    if (dur > 0) setDuration(dur);
  }, []);

  const handleLoadedData = useCallback(({ duration: dur }) => {
    if (dur > 0) setDuration(dur);
  }, []);

  const handleAudioError = useCallback(
    async ({ message, isRecoverable }) => {
      if (isRecoverable && selectedTrack) {
        const result = await searchStream(
          selectedTrack.name,
          selectedTrack.artist,
          selectedTrack.duration,
        );

        if (result?.videoId) {

          return;
        }
      }

      setIsPlaying(false);
      actions.setError(message);
    },
    [actions, selectedTrack, searchStream],
  );

  const displayTrack =
    selectedTrack && streamMeta?.artUrl
      ? {
          ...selectedTrack,
          artUrl:
            !selectedTrack.artUrl || selectedTrack.artUrl === PLACEHOLDER_ART
              ? streamMeta.artUrl
              : selectedTrack.artUrl,
        }
      : selectedTrack;

  return (
    <div
      data-theme={theme}
      style={{ width: "100vw", height: "100dvh", overflow: "hidden" }}
    >
      <div className="crt-overlay" />

      <AudioEngine
        ref={audioRef}
        videoId={videoId}
        autoPlay={true}
        onPlay={handleAudioPlay}
        onPause={handleAudioPause}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
      />

      <AnimatePresence mode="wait">
        {scene === "exterior" ? (
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
            searchResults={results}
            selectedTrack={displayTrack}
            isSearching={isSearching}
            isFetchingTrack={isFetchingTrack || isLoadingStream}
            onSearchFocus={handleSearchFocus}
            onSearch={handleSearch}
            onSelectTrack={handleSelectTrack}
            showResults={showResults}
                        isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

