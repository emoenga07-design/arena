export const me = {
  id: "emmanuel",
  name: "Emmanuel",
  handle: "@nyachae",
  initials: "EN",
  level: 38,
  rank: "Gold",
  stake: "Silver",
  table: "Ranked",
  club: "Arsenal Kenya",
  clubId: "arsenal-kenya",
  streak: 14,
  cal: 67.8,
  preds: 2481,
  rival: "Brian",
  domains: [
    { name: "Football", grade: "Elite", pct: 74 },
    { name: "F1", grade: "Strong", pct: 66 },
    { name: "Crypto", grade: "Average", pct: 55 },
    { name: "Politics", grade: "Weak", pct: 48 },
  ],
  seasonPts: 1840,
  rankedLeft: 3,
  openCalls: 2,
};

export const events = [
  {
    id: "ars-che",
    title: "Arsenal vs Chelsea",
    sport: "Football",
    live: true,
    minute: 67,
    score: [1, 1],
    sides: ["Arsenal", "Chelsea"],
    players: 18421,
    arena: { Arsenal: 61, Draw: 18, Chelsea: 21 },
    house: { Arsenal: 72, Draw: 11, Chelsea: 17 },
    venue: "Emirates",
    kickoff: "Tonight",
  },
  {
    id: "afcon-q",
    title: "Kenya vs Uganda",
    sport: "Football",
    live: false,
    minute: null,
    score: [0, 0],
    sides: ["Kenya", "Uganda"],
    players: 9204,
    arena: { Kenya: 54, Draw: 26, Uganda: 20 },
    house: null,
    venue: "Kasarani",
    kickoff: "Sat 16:00",
  },
  {
    id: "btc",
    title: "BTC close above $120k Friday",
    sport: "Crypto",
    live: true,
    minute: null,
    score: null,
    sides: ["Yes", "No"],
    players: 6102,
    arena: { Yes: 64, No: 36 },
    house: { Yes: 58, No: 42 },
    venue: "Arena",
    kickoff: "Resolves Fri 00:00 UTC",
  },
  {
    id: "f1-monza",
    title: "Monza — Verstappen podium",
    sport: "F1",
    live: false,
    sides: ["Yes", "No"],
    players: 3301,
    arena: { Yes: 71, No: 29 },
    house: null,
    venue: "Monza",
    kickoff: "Sun",
  },
];

export const matchMarkets = [
  { id: "m1", q: "Match winner", type: "arena", opts: [
    { k: "Arsenal", p: 61 }, { k: "Draw", p: 18 }, { k: "Chelsea", p: 21 },
  ]},
  { id: "m2", q: "Who scores next?", type: "arena", opts: [
    { k: "Arsenal", p: 52 }, { k: "Chelsea", p: 31 }, { k: "No more", p: 17 },
  ]},
  { id: "m3", q: "Over 2.5 goals", type: "arena", opts: [
    { k: "Yes", p: 44 }, { k: "No", p: 56 },
  ]},
  { id: "m4", q: "Saka 2+ shots on target", type: "house", opts: [
    { k: "Yes", p: 63 }, { k: "No", p: 37 },
  ]},
];

export const clubs = [
  {
    id: "arsenal-kenya",
    name: "Arsenal Kenya",
    kind: "Official",
    members: 12840,
    cal: 71,
    rank: 1,
    rival: "United Kenya",
    war: { us: 71, them: 66, left: 8 },
    about: "The shirt. Matchdays, house lines, Thursday fades.",
  },
  {
    id: "united-kenya",
    name: "United Kenya",
    kind: "Official",
    members: 11002,
    cal: 66,
    rank: 2,
    rival: "Arsenal Kenya",
    war: { us: 66, them: 71, left: 8 },
    about: "Theatre of dreams, Nairobi chapter.",
  },
  {
    id: "crypto-kenya",
    name: "Kenya Crypto Degens",
    kind: "House",
    members: 5401,
    cal: 55,
    rank: 6,
    rival: null,
    war: null,
    about: "Prints, fades, no suits.",
  },
  {
    id: "nairobi-gooners",
    name: "Nairobi Gooners",
    kind: "House",
    members: 890,
    cal: 69,
    rank: 4,
    rival: "Westlands Blues",
    war: { us: 4, them: 3, left: 3 },
    about: "Small room. Loud. 11v11 still a night.",
  },
];

export const players = [
  { id: "emmanuel", name: "Emmanuel", rank: "Gold", cal: 67.8, club: "Arsenal Kenya", streak: 14, domain: "Football Elite" },
  { id: "brian", name: "Brian", rank: "Platinum", cal: 71.2, club: "United Kenya", streak: 6, domain: "Football Elite" },
  { id: "aisha", name: "Aisha", rank: "Diamond", cal: 74.1, club: "Crypto Kenya", streak: 9, domain: "Crypto Strong" },
  { id: "kevin", name: "Kevin", rank: "Gold", cal: 64.0, club: "Nairobi Gooners", streak: 3, domain: "Football Strong" },
  { id: "zuri", name: "Zuri", rank: "Silver", cal: 61.4, club: "Arsenal Kenya", streak: 2, domain: "Politics Rising" },
];

export const chat = [
  { who: "Kevin", text: "Red card flipped the whole room. Hold or fold." },
  { who: "Zuri", text: "Fade Brian's next-scorer. He always overrates the 9." },
  { who: "Brian", text: "Call is live. 200 on Chelsea next. Don't hide." },
  { who: "Captain", text: "Club war: we need 40 more Calls before 80'." },
];

export const calls = [
  {
    id: "c1",
    from: "Emmanuel",
    vs: "Brian",
    event: "Arsenal vs Chelsea",
    text: "Arsenal don't concede again",
    pct: 58,
    stake: 200,
    status: "open",
    story: [68, 21, 49, 58],
  },
  {
    id: "c2",
    from: "Aisha",
    vs: "Open",
    event: "BTC > $120k",
    text: "Prints before Friday. Fade me.",
    pct: 64,
    stake: 150,
    status: "open",
    story: [61, 64],
  },
  {
    id: "c3",
    from: "Kevin",
    vs: "Emmanuel",
    event: "Arsenal vs Chelsea",
    text: "Saka SOT ≥ 2 — house line",
    pct: 63,
    stake: 100,
    status: "locked",
    story: [55, 63],
  },
];

export const seasonTable = [
  { pos: 1, name: "Aisha", div: "Gold", pts: 2210, cal: 74.1 },
  { pos: 2, name: "Brian", div: "Gold", pts: 2104, cal: 71.2 },
  { pos: 3, name: "Emmanuel", div: "Gold", pts: 1840, cal: 67.8 },
  { pos: 4, name: "Kevin", div: "Gold", pts: 1712, cal: 64.0 },
  { pos: 5, name: "Zuri", div: "Silver ↑", pts: 980, cal: 61.4 },
];

export const rankedSlate = [
  { q: "Kenya vs Uganda — Kenya win", lock: "Sat 15:45", done: false },
  { q: "BTC Friday close > 120k", lock: "Fri 23:00", done: true },
  { q: "Monza — Verstappen podium", lock: "Sun 14:00", done: false },
  { q: "NSE 20 week green", lock: "Fri 16:00", done: true },
  { q: "Over 2.5 tonight (ARS-CHE)", lock: "Live", done: false },
];

export const recap = {
  path: [68, 21, 49, 81],
  result: "WIN",
  label: "Your Arsenal journey",
};
