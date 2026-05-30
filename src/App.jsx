import useTheme from './hooks/useTheme'
import NeonSign from './components/NeonSign'
import ThemeToggle from './components/ThemeToggle'

export default function App() {
  const { toggleTheme, isNight } = useTheme()

  return (
    <div
      className="vhs-noise"
      style={{
        position: 'fixed',
        inset: 0,
        background: isNight
          ? 'linear-gradient(135deg, #0A0010 0%, #0D0020 50%, #1a0030 100%)'
          : 'linear-gradient(135deg, #FFF5E1 0%, #F5E6C8 50%, #ede0b8 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        padding: '2rem',
        transition: 'background 0.8s ease',
      }}
    >
      <div className="crt-overlay" />

      <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 100 }}>
        <ThemeToggle toggleTheme={toggleTheme} isNight={isNight} />
      </div>

      <NeonSign text="DUSTY GROOVES" color="pink" size="xl" flicker={isNight} isNight={isNight} />
      <NeonSign text="Est. 1983" color="orange" size="md" flicker={isNight} isNight={isNight} />

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <NeonSign text="GROOVES" color="pink" size="md" bordered flicker={isNight} isNight={isNight} />
        <NeonSign text="NOW SPINNING" color="cyan" size="md" bordered flicker={isNight} isNight={isNight} />
        <NeonSign text="EST. 1983" color="orange" size="md" bordered flicker={isNight} isNight={isNight} />
      </div>

      <p
        className="font-groovy"
        style={{
          color: isNight ? '#FFF5E1' : '#5C3D1A',
          fontSize: '1.25rem',
          opacity: 0.7,
          marginTop: '1rem',
        }}
      >
        If it ain't vinyl, it ain't real.
      </p>
    </div>
  )
}