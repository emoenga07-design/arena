import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { events, matchMarkets, chat, calls } from "../data";

export default function Match({ ping }) {
  const { id } = useParams();
  const ev = events.find((e) => e.id === id) || events[0];
  const [lines, setLines] = useState(matchMarkets);
  const [msgs, setMsgs] = useState(chat);
  const [draft, setDraft] = useState("");
  const [tab, setTab] = useState("card");
  const liveish = ev.live;

  const take = (mid, opt) => {
    setLines((ls) =>
      ls.map((m) => {
        if (m.id !== mid) return m;
        const opts = m.opts.map((o) =>
          o.k === opt.k ? { ...o, p: Math.min(92, o.p + 2) } : { ...o, p: Math.max(4, o.p - 1) }
        );
        return { ...m, opts };
      })
    );
    ping(`Position on ${opt.k}. Thumb play — why is optional.`);
  };

  const send = () => {
    if (!draft.trim()) return;
    setMsgs((m) => [...m, { who: "Emmanuel", text: draft.trim() }]);
    setDraft("");
  };

  const story = useMemo(() => [68, 21, 49, 61], []);

  return (
    <div className="page">
      <div className="row wrap gap mb">
        <span className="pill live">{liveish ? <> <i className="live-dot" /> {ev.minute || "LIVE"}'</> : ev.kickoff}</span>
        <span className="pill arena">Arena</span>
        <span className="pill house">House · Arsenal Kenya</span>
        <span className="muted">{ev.players?.toLocaleString?.() || "—"} in the building</span>
      </div>

      <div className="row between wrap">
        <div>
          <div className="teams">{ev.sides[0]}</div>
          <div className="tiny">vs · {ev.venue}</div>
          <div className="teams">{ev.sides[1]}</div>
        </div>
        {ev.score && <div className="score">{ev.score[0]}–{ev.score[1]}</div>}
      </div>

      {ev.arena && ev.house && (
        <div className="grid g2 mt">
          <div className="card">
            <div className="tiny">ARENA % · the world</div>
            <div className="row between"><span>{ev.sides[0]}</span><span className="pct">{ev.arena[ev.sides[0]] || ev.arena.Yes}%</span></div>
            <div className="bar mt"><i className="yes" style={{ width: `${ev.arena[ev.sides[0]] || ev.arena.Yes}%` }} /></div>
          </div>
          <div className="card">
            <div className="tiny">HOUSE % · your club · not the world</div>
            <div className="row between"><span>{ev.sides[0]}</span><span className="pct">{ev.house[ev.sides[0]] || ev.house.Yes}%</span></div>
            <div className="bar mt"><i className="yes" style={{ width: `${ev.house[ev.sides[0]] || ev.house.Yes}%` }} /></div>
          </div>
        </div>
      )}

      <div className="row gap mt">
        {["card", "calls", "chat", "war"].map((t) => (
          <button key={t} className={`btn sm ${tab === t ? "primary" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid g-main mt">
        <div>
          {tab === "card" && (
            <div className="stack gap">
              {lines.map((m) => (
                <div key={m.id} className="card">
                  <div className="row between">
                    <strong>{m.q}</strong>
                    <span className={`pill ${m.type}`}>{m.type}</span>
                  </div>
                  <div className="grid g3 mt">
                    {m.opts.map((o) => (
                      <button key={o.k} className="btn" onClick={() => take(m.id, o)}>
                        {o.k} <span className="pct">{o.p}%</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "calls" && (
            <div className="stack gap">
              {calls.map((c) => (
                <div key={c.id} className="card call">
                  <div className="row between">
                    <strong>{c.from} vs {c.vs}</strong>
                    <span>{c.stake} pts</span>
                  </div>
                  <p>{c.text} · {c.pct}%</p>
                  <div className="story mt">{c.story.map((n, i) => <span key={i}>{n}%</span>)}</div>
                  <button className="btn ember sm mt" onClick={() => ping("You faded the Call. It's a match inside the match.")}>
                    Fade this Call
                  </button>
                </div>
              ))}
              <button className="btn primary" onClick={() => ping("Call on the table. Waiting.")}>Put a Call on this match</button>
            </div>
          )}
          {tab === "chat" && (
            <div className="card">
              <div className="chat">
                {msgs.map((m, i) => (
                  <div key={i} className="msg"><b>{m.who}</b> {m.text}</div>
                ))}
              </div>
              <div className="row mt">
                <input
                  className="top-search"
                  style={{ flex: 1, width: "auto", borderRadius: 10 }}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Talk. Or better — Call."
                />
                <button className="btn" onClick={send}>Send</button>
              </div>
            </div>
          )}
          {tab === "war" && (
            <div className="card">
              <div className="tiny">CLUB WAR · 8 markets left</div>
              <h2>Arsenal Kenya 71% · United Kenya 66%</h2>
              <div className="bar mt"><i className="yes" style={{ width: "71%" }} /><i className="no" style={{ width: "29%" }} /></div>
              <p className="muted mt">Your chair is empty until you Call. Wars are tribe-scale Calls.</p>
              <Link to="/club/arsenal-kenya" className="btn mt">Open club</Link>
            </div>
          )}
        </div>
        <div className="stack gap">
          <div className="card">
            <div className="tiny">YOUR PATH THIS MATCH</div>
            <div className="story mt">
              {story.map((n, i) => <span key={i}>{n}%</span>)}
            </div>
            <p className="muted mt">Red card 68→21. That’s the clip if you hold.</p>
          </div>
          <div className="card">
            <div className="tiny">LIVE TABLE</div>
            <table className="table">
              <tbody>
                <tr><td>1</td><td>Aisha</td><td className="ok">+420</td></tr>
                <tr><td>2</td><td>You</td><td className="ok">+180</td></tr>
                <tr><td>3</td><td>Brian</td><td className="danger">−40</td></tr>
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="tiny">STREAM</div>
            <p>Captain watch-along · 1,482 watching</p>
            <p className="tiny">Live exists to change Calls in public. Not a vlog.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
