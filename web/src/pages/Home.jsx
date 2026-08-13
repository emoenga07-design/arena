import { Link } from "react-router-dom";
import { me, events, calls, rankedSlate, clubs, recap } from "../data";

export default function Home({ ping }) {
  const live = events.find((e) => e.id === "ars-che");
  return (
    <div className="page">
      <p className="kicker">Good evening · weekday grind, weekend festival</p>
      <h1 className="display">WHAT’S ON</h1>
      <p className="lede">
        Live now, your club, open Calls, ranked left this week. Same grammar every day — Saturday is just louder.
      </p>

      <div className="grid g4 mt">
        <div className="card">
          <div className="tiny">OPEN CALLS</div>
          <div className="stat">{me.openCalls}</div>
          <div className="muted">Someone faded you</div>
        </div>
        <div className="card">
          <div className="tiny">RANKED LEFT</div>
          <div className="stat">{me.rankedLeft}<span className="muted"> / 5</span></div>
          <div className="muted">Locks through Sunday</div>
        </div>
        <div className="card">
          <div className="tiny">STREAK</div>
          <div className="stat">{me.streak}</div>
          <div className="muted">Calls, not logins</div>
        </div>
        <div className="card">
          <div className="tiny">SEASON</div>
          <div className="stat">{me.rank}</div>
          <div className="muted">{me.seasonPts} pts · 40 from Platinum</div>
        </div>
      </div>

      <div className="grid g-main mt">
        <div className="stack gap">
          <Link to={`/match/${live.id}`} className="card hot">
            <div className="row between">
              <span className="pill live"><i className="live-dot" /> Live · {live.minute}'</span>
              <span className="pill arena">Arena · {live.players.toLocaleString()} players</span>
            </div>
            <div className="row between mt" style={{ alignItems: "flex-end" }}>
              <div>
                <div className="teams">{live.sides[0]}</div>
                <div className="tiny">vs</div>
                <div className="teams">{live.sides[1]}</div>
              </div>
              <div className="score">{live.score[0]}–{live.score[1]}</div>
            </div>
            <div className="row between mt">
              <span className="muted">Arena win %</span>
              <span className="pct">{live.arena.Arsenal}% ARS</span>
            </div>
            <div className="bar mt">
              <i className="yes" style={{ width: `${live.arena.Arsenal}%` }} />
              <i className="no" style={{ width: `${live.arena.Chelsea}%` }} />
            </div>
            <div className="row between mt">
              <span className="pill house">House (Arsenal Kenya) {live.house.Arsenal}%</span>
              <span className="btn sm primary">Enter the Match</span>
            </div>
          </Link>

          <div className="card">
            <div className="row between mb">
              <h2>Your open Calls</h2>
              <Link to="/calls" className="muted">All →</Link>
            </div>
            {calls.filter((c) => c.status === "open").map((c) => (
              <div key={c.id} className="call mb">
                <div className="row between">
                  <strong>{c.from} vs {c.vs}</strong>
                  <span className="pct">{c.stake} pts</span>
                </div>
                <div className="muted">{c.text} · {c.pct}%</div>
                <div className="story mt">
                  {c.story.map((n, i) => <span key={i}>{n}%</span>)}
                </div>
              </div>
            ))}
            <button className="btn ember block" onClick={() => ping("Call issued. Waiting on a fade.")}>
              Issue a Call
            </button>
          </div>
        </div>

        <div className="stack gap">
          <div className="card">
            <h2 className="mb">Your clubs</h2>
            {clubs.filter((c) => ["arsenal-kenya", "crypto-kenya"].includes(c.id)).map((c) => (
              <Link key={c.id} to={`/club/${c.id}`} className="row between" style={{ padding: "8px 0", borderTop: "1px solid var(--line)" }}>
                <div>
                  <strong>{c.name}</strong>
                  <div className="tiny">{c.kind} · {c.members.toLocaleString()} players</div>
                </div>
                <span className="pill">{c.cal}% cal</span>
              </Link>
            ))}
          </div>
          <div className="card">
            <h2 className="mb">Ranked week</h2>
            {rankedSlate.map((r) => (
              <div key={r.q} className="row between" style={{ padding: "7px 0", borderTop: "1px solid var(--line)" }}>
                <span className={r.done ? "muted" : ""}>{r.q}</span>
                <span className="tiny">{r.done ? "IN" : r.lock}</span>
              </div>
            ))}
            <Link to="/season" className="btn block mt">Season table</Link>
          </div>
          <div className="card">
            <div className="tiny">LAST NIGHT STORY</div>
            <strong>{recap.label}</strong>
            <div className="story mt">
              {recap.path.map((n, i) => <span key={i}>{n}%</span>)}
              <span className="win">{recap.result}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
