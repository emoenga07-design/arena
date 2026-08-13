import { Link } from "react-router-dom";
import { seasonTable, rankedSlate, me } from "../data";

export default function Season() {
  return (
    <div className="page">
      <p className="kicker">Season 12 · Aug 1 – Sep 30</p>
      <h1 className="display">GOLD DIVISION</h1>
      <p className="lede">
        Weekdays are the map. Weekend is the raid. You are {40} pts from Platinum. Promotion is a sport, not a deposit.
      </p>

      <div className="grid g-main mt">
        <div className="card">
          <table className="table">
            <thead>
              <tr><th>#</th><th>Player</th><th>Div</th><th>Pts</th><th>Cal</th></tr>
            </thead>
            <tbody>
              {seasonTable.map((r) => (
                <tr key={r.name} style={{ background: r.name === "Emmanuel" ? "#16120c" : "transparent" }}>
                  <td>{r.pos}</td>
                  <td><Link to={`/player/${r.name.toLowerCase()}`}>{r.name}</Link></td>
                  <td>{r.div}</td>
                  <td className="pct">{r.pts}</td>
                  <td>{r.cal}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="stack gap">
          <div className="card">
            <div className="tiny">YOUR WEEK</div>
            <div className="stat">{5 - me.rankedLeft}/5</div>
            <p className="muted">Ranked slate in</p>
            {rankedSlate.map((r) => (
              <div key={r.q} className="tiny" style={{ marginTop: 6 }}>{r.done ? "✓" : "○"} {r.q}</div>
            ))}
          </div>
          <div className="card">
            <h2>Club season</h2>
            <p className="muted mt">Arsenal Kenya #1 · 71% · war vs United still live.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
