import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SpeechBubble({ message }) {
  const [displayed, setDisplayed] = useState("");

  // Typewriter effect — reruns whenever message changes
  useEffect(() => {
    if (!message) return;
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      i++;
      setDisplayed(message.slice(0, i));
      if (i >= message.length) clearInterval(interval);
    }, 35);
    return () => clearInterval(interval);
  }, [message]);

  return (
    <motion.div
      className="tony-bubble-anchor"
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.92 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div
        style={{
          position: "relative",
          background: "rgba(255, 245, 225, 0.95)",
          border: "2px solid #FF006E",
          borderRadius: "12px",
          padding: "0.6rem 1rem",
          maxWidth: "260px",
          boxShadow: "0 0 10px rgba(255,0,110,0.3)",
        }}
      >
        <p
          style={{
            fontFamily: "'Nunito', sans-serif",
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#1a0a00",
            margin: 0,
            lineHeight: 1.4,
            minHeight: "1.4em",
          }}
        >
          {displayed}
        </p>

        {/* Tail pointing down toward Tony */}
        <div
          style={{
            position: "absolute",
            bottom: "-10px",
            left: "24px",
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "10px solid #FF006E",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-7px",
            left: "26px",
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid rgba(255,245,225,0.95)",
          }}
        />
      </div>
    </motion.div>
  );
}
