import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function ShopExterior({ theme, onToggleTheme, onEnter }) {
  const isNight = theme === "night";

  return (
    <motion.div
      className="shop-exterior"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      style={{
        position: "relative",
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        cursor: "pointer",
      }}
      onClick={onEnter}
    >
      {/* Background image — crossfades between day and night */}
      <AnimatePresence mode="wait">
        <motion.img
          key={theme}
          src={
            isNight
              ? "/images/shop-exterior-night.webp"
              : "/images/shop-exterior-day.webp"
          }
          alt={
            isNight ? "Dusty Grooves at night" : "Dusty Grooves in the daytime"
          }
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center bottom",
          }}
        />
      </AnimatePresence>

      {/* Night overlay — deepens the darkness slightly */}
      <AnimatePresence>
        {isNight && (
          <motion.div
            key="night-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10, 0, 16, 0.35)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* "Tap to enter" hint */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        style={{
          position: "absolute",
          bottom: "4%",
          left: "50%",
          zIndex: 10,
          textAlign: "center",
        }}
        transformTemplate={(_, generated) => `translateX(-50%) ${generated}`}
      >
        <TapToEnter isNight={isNight} />
      </motion.div>

      {/* Theme toggle — top right */}
      <div
        style={{
          position: "absolute",
          top: "1.5rem",
          right: "1.5rem",
          zIndex: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </motion.div>
  );
}

function TapToEnter({ isNight }) {
  return (
    <motion.p
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      style={{
        fontFamily: "'Righteous', sans-serif",
        fontSize: "1rem",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        color: isNight ? "#FF006E" : "#FFF5E1",
        textShadow: isNight
          ? "0 0 12px #FF006E, 0 0 24px #FF006E88"
          : "0 1px 3px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
        margin: 0,
        userSelect: "none",
      }}
    >
      Tap to enter
    </motion.p>
  );
}
