import { Link } from "react-router-dom";
import { events } from "../data";

export default function Arena({ ping }) {
  return (
    <div className="page">
      <p className="kicker">The public square</p>
      <h1 className="display">ARENA</h1>
      <p className="lede">Fat events. Honest world %. Skinny rooms stay in the club and say House.</p>

      <div className="grid g2 mt">
        {events.map((e) => (
          <Link key={e.id} to={`/match/${e.id}`} className="card">
            <div className="row between">
              {e.live ? <span className="pill live"><i className="live-dot" /> Live</span> : <span className="pill">{e.kickoff}</span>}
              <span className="pill arena">{e.sport}</span>
            </div>
            <h2 className="mt">{e.title}</h2>
            <div className="tiny">{e.venue} · {e.players.toLocaleString()} players</div>
            <div className="mt">
              {Object.entries(e.arena).map(([k, v]) => (
                <div key={k} className="row between" style={{ marginTop: 6 }}>
                  <span>{k}</span>
                  <span className="pct">{v}%</span>
                </div>
              ))}
            </div>
            <div className="bar mt">
              <i className="yes" style={{ width: `${Object.values(e.arena)[0]}%` }} />
              <i className="no" style={{ width: `${100 - Object.values(e.arena)[0]}%` }} />
            </div>
            {e.house && (
              <div className="tiny mt">House (your club) reads different — {Object.entries(e.house)[0].join(" ")}%</div>
            )}
          </Link>
        ))}
      </div>
      <button className="btn mt" onClick={() => ping("Line queued. Captain or SF gavel still required.")}>
        Propose an Arena market
      </button>
    </div>
  );
}
