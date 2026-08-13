import { calls } from "../data";

export default function Calls({ ping }) {
  return (
    <div className="page">
      <p className="kicker">The verb</p>
      <h1 className="display">THE CALL</h1>
      <p className="lede">
        Side + optional % + optional why + stake. Someone fades you. The room watches two names. Resolve writes both cards.
      </p>
      <div className="grid g2 mt">
        {calls.map((c) => (
          <div key={c.id} className="card call">
            <div className="row between">
              <span className="pill">{c.status}</span>
              <span className="pct">{c.stake} pts</span>
            </div>
            <h2 className="mt">{c.from} vs {c.vs}</h2>
            <p>{c.text}</p>
            <div className="muted">{c.event} · conviction {c.pct}%</div>
            <div className="story mt">{c.story.map((n, i) => <span key={i}>{n}%</span>)}</div>
            <div className="row gap mt">
              <button className="btn ember sm" onClick={() => ping("Faded. Match inside the match.")}>Fade</button>
              <button className="btn sm" onClick={() => ping("Piled on. Same side, your stack.")}>Pile on</button>
              <button className="btn sm" onClick={() => ping("% moved. Flip recorded.")}>Change my %</button>
            </div>
          </div>
        ))}
      </div>
      <button className="btn primary mt" onClick={() => ping("Eight-seat prediction table opening.")}>
        Open a prediction table
      </button>
    </div>
  );
}
