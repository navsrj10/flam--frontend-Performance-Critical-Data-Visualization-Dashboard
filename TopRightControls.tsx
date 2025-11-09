"use client";
import { useEffect, useState } from "react";

export default function TopRightControls() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [time, setTime] = useState<string>("");

  // Apply theme to <html> tag
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Live clock
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="topRight">
      <select className="select">
        <option>Overview</option>
        <option>Network</option>
        <option>System</option>
        <option>Storage</option>
      </select>

      <span className="pill">{time}</span>

      <button
        className="toggle"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <div
          className="toggle-dot"
          data-mode={theme === "dark" ? "dark" : "light"}
        />
      </button>
    </div>
  );
}
