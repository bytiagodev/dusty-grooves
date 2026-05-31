import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ShopExterior from './components/ShopExterior';
import ShopInterior from './components/ShopInterior';
import './index.css'

export default function App() {
  const [scene, setScene] = useState('exterior'); // 'exterior' | 'interior'
  const [theme, setTheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'
  );

  const toggleTheme = () =>
    setTheme((t) => (t === 'day' ? 'night' : 'day'));

  return (
    <div data-theme={theme} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {scene === 'exterior' ? (
          <ShopExterior
            key="exterior"
            theme={theme}
            onToggleTheme={toggleTheme}
            onEnter={() => setScene('interior')}
          />
        ) : (
          <ShopInterior
            key="interior"
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        )}
      </AnimatePresence>
    </div>
  );
}