import { useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Arena from "./pages/Arena.jsx";
import Match from "./pages/Match.jsx";
import Club from "./pages/Club.jsx";
import Clubs from "./pages/Clubs.jsx";
import Player from "./pages/Player.jsx";
import Season from "./pages/Season.jsx";
import Calls from "./pages/Calls.jsx";

export default function App() {
  const [toast, setToast] = useState("");
  const nav = useNavigate();
  const ping = (t) => {
    setToast(t);
    setTimeout(() => setToast(""), 2400);
  };

  return (
    <div className="app">
      <header className="topbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark">SF MARKETS</span>
          <span className="brand-sub">Play the world</span>
        </NavLink>
        <nav className="nav">
          <NavLink to="/" end>Tonight</NavLink>
          <NavLink to="/arena">Arena</NavLink>
          <NavLink to="/match/ars-che">Match</NavLink>
          <NavLink to="/clubs">Clubs</NavLink>
          <NavLink to="/calls">Calls</NavLink>
          <NavLink to="/season">Season</NavLink>
        </nav>
        <input
          className="top-search"
          placeholder="Search events, clubs, players"
          onKeyDown={(e) => {
            if (e.key === "Enter") nav("/arena");
          }}
        />
        <NavLink to="/player/emmanuel" className="me-chip">
          <span className="avatar">EN</span>
          <span style={{ fontSize: 13, fontWeight: 650 }}>Gold · 14 streak</span>
        </NavLink>
      </header>

      <Routes>
        <Route path="/" element={<Home ping={ping} />} />
        <Route path="/arena" element={<Arena ping={ping} />} />
        <Route path="/match/:id" element={<Match ping={ping} />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/club/:id" element={<Club ping={ping} />} />
        <Route path="/player/:id" element={<Player ping={ping} />} />
        <Route path="/calls" element={<Calls ping={ping} />} />
        <Route path="/season" element={<Season />} />
      </Routes>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
