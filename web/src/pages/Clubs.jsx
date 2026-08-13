import { Link } from "react-router-dom";
import { clubs } from "../data";

export default function Clubs() {
  return (
    <div className="page">
      <p className="kicker">Your people · they carry Tuesday</p>
      <h1 className="display">CLUBS</h1>
      <p className="lede">Official tenants and house rooms. A club that only speaks on Saturday is a fan page.</p>
      <div className="grid g2 mt">
        {clubs.map((c) => (
          <Link key={c.id} to={`/club/${c.id}`} className="card">
            <div className="row between">
              <span className={`pill ${c.kind === "House" ? "house" : "gold"}`}>{c.kind}</span>
              <span className="tiny">#{c.rank} club season</span>
            </div>
            <h2 className="mt">{c.name}</h2>
            <p className="muted">{c.about}</p>
            <div className="row between mt">
              <span>{c.members.toLocaleString()} players</span>
              <span className="pct">{c.cal}% cal</span>
            </div>
            {c.war && (
              <div className="tiny mt">War vs {c.rival}: {c.war.us}–{c.war.them} · {c.war.left} left</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
