import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ShopExterior from './components/ShopExterior';
import ShopInterior from './components/ShopInterior';
import useAppState from './hooks/useAppState';
import './index.css';

export default function App() {
  const [scene, setScene] = useState('exterior');
  const [theme, setTheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'
  );

  const toggleTheme = () => setTheme((t) => (t === 'day' ? 'night' : 'day'));

  const {
    appState,
    tonyPose,
    tonyMessage,
    tonyBob,
    nowSpinning,
    showBubble,
    actions,
  } = useAppState();

  return (
    <div data-theme={theme} style={{ width: '100vw', height: '100dvh', overflow: 'hidden' }}>
      <div className="crt-overlay" />

      <AnimatePresence mode="wait">
        {scene === 'exterior' ? (
          <ShopExterior
            key="exterior"
            theme={theme}
            onToggleTheme={toggleTheme}
            onEnter={() => {
              setScene('interior');
              actions.enterShop();
            }}
          />
        ) : (
          <ShopInterior
            key="interior"
            theme={theme}
            onToggleTheme={toggleTheme}
            appState={appState}
            tonyPose={tonyPose}
            tonyMessage={tonyMessage}
            tonyBob={tonyBob}
            showBubble={showBubble}
            nowSpinning={nowSpinning}
            actions={actions}
          />
        )}
      </AnimatePresence>
    </div>
  );
}