import { useParams, Link } from "react-router-dom";
import { me, players } from "../data";

export default function Player({ ping }) {
  const { id } = useParams();
  const p = players.find((x) => x.id === id) || players[0];
  const self = p.id === "emmanuel";

  return (
    <div className="page">
      <p className="kicker">Player · not a profile</p>
      <div className="row gap">
        <span className="avatar lg">{p.name.slice(0, 2).toUpperCase()}</span>
        <div>
          <h1 className="display" style={{ margin: 0 }}>{p.name.toUpperCase()}</h1>
          <div className="row wrap gap">
            <span className="pill gold">{p.rank} division</span>
            <span className="pill">{p.club}</span>
            <span className="pill">{p.streak}-Call streak</span>
          </div>
        </div>
      </div>

      <div className="grid g4 mt">
        <div className="card"><div className="tiny">Rank</div><div className="stat">{self ? me.rank : p.rank}</div><div className="tiny">Season sport</div></div>
        <div className="card"><div className="tiny">Stake class</div><div className="stat">{self ? me.stake : "Silver"}</div><div className="tiny">What you may put up</div></div>
        <div className="card"><div className="tiny">Table</div><div className="stat">{self ? me.table : "Ranked"}</div><div className="tiny">Who you may fight</div></div>
        <div className="card"><div className="tiny">Cal</div><div className="stat">{p.cal}%</div><div className="tiny">Not deposit VIP</div></div>
      </div>

      <div className="grid g2 mt">
        <div className="card">
          <h2 className="mb">Domains</h2>
          {(self ? me.domains : [{ name: p.domain, grade: "—", pct: p.cal }]).map((d) => (
            <div key={d.name} className="row between" style={{ padding: "8px 0", borderTop: "1px solid var(--line)" }}>
              <span>{d.name} <span className="tiny">{d.grade}</span></span>
              <span className="pct">{d.pct}%</span>
            </div>
          ))}
          <p className="tiny mt">Follow a mind on Football without following them on crypto.</p>
        </div>
        <div className="card">
          <h2 className="mb">Last Calls</h2>
          <div className="call mb"><strong>ARS don’t concede</strong><div className="muted">vs Brian · 200 · path 68→21→49→58</div></div>
          <div className="call mb"><strong>Saka SOT ≥ 2</strong><div className="muted">House · locked</div></div>
          <button className="btn ember" onClick={() => ping(`Challenge sent to ${p.name}. Table rules apply.`)}>
            Challenge {p.name}
          </button>
          <p className="tiny mt">Bronze fights Bronze/Silver. Elite can tap anyone.</p>
        </div>
      </div>
      <p className="muted mt">Pit ratings (if any) live on this account but never mix into this rank.</p>
      <Link to="/season" className="btn mt">Season</Link>
    </div>
  );
}
