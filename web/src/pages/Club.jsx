import { Link, useParams } from "react-router-dom";
import { clubs, matchMarkets } from "../data";

export default function Club({ ping }) {
  const { id } = useParams();
  const c = clubs.find((x) => x.id === id) || clubs[0];
  const house = matchMarkets.filter((m) => m.type === "house");

  return (
    <div className="page">
      <p className="kicker">{c.kind} club</p>
      <h1 className="display">{c.name.toUpperCase()}</h1>
      <p className="lede">{c.about}</p>
      <div className="row wrap gap mt">
        <span className="pill">{c.members.toLocaleString()} players</span>
        <span className="pill gold">{c.cal}% club cal</span>
        {c.rival && <span className="pill">Rival · {c.rival}</span>}
      </div>

      <div className="grid g-main mt">
        <div className="stack gap">
          <div className="card hot">
            <div className="row between">
              <span className="pill live"><i className="live-dot" /> Thursday fades · live</span>
              <Link to="/match/ars-che" className="btn sm primary">Jump into Match</Link>
            </div>
            <h2 className="mt">Arsenal vs Chelsea is our night</h2>
            <p className="muted">House lines sit next to Arena. They are not the world price.</p>
          </div>
          {house.map((m) => (
            <div key={m.id} className="card">
              <div className="row between">
                <strong>{m.q}</strong>
                <span className="pill house">House</span>
              </div>
              <div className="row gap mt">
                {m.opts.map((o) => (
                  <button key={o.k} className="btn" onClick={() => ping(`House position: ${o.k}`)}>
                    {o.k} {o.p}%
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="stack gap">
          {c.war && (
            <div className="card">
              <div className="tiny">CLUB WAR</div>
              <h2>{c.name.split(" ")[0]} {c.war.us}%</h2>
              <p className="muted">{c.rival} {c.war.them}% · {c.war.left} markets left</p>
              <button className="btn ember block mt" onClick={() => ping("You're in the war. Chair filled.")}>
                Fill your chair
              </button>
            </div>
          )}
          <div className="card">
            <h2>Weekday lights</h2>
            <p className="muted mt">Wed 11v11 · Thu fades · Sun autopsy. Captain hosts even when FIFA doesn't.</p>
          </div>
          <div className="card">
            <h2>Captain</h2>
            <p className="muted">Opens house markets. Gavel on house questions. Never sells resolution.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
