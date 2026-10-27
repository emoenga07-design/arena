# Bloomberg Terminal (clone)

A single-page, classic Bloomberg-style financial terminal built with plain
HTML/CSS/JS — no build step, no dependencies, no API keys. Works fully
offline; market data is generated client-side from a seeded PRNG so prices,
indices, FX, crypto and commodities are realistic and self-consistent, and
drift in real time.

## Features

- **Header bar** — Bloomberg wordmark, live clock, market status
- **Scrolling ticker tape** — simulated symbols with live green/red changes
- **World indices** — S&P 500, Dow Jones, Nasdaq, Russell, VIX, FTSE, DAX, Nikkei, Hang Seng, Shanghai
- **Top movers** — gainers and losers, clickable
- **Watchlist** — searchable table; click a row to inspect a security
- **Intraday charts** — canvas-drawn 5-minute charts with grid, range labels and OHLC legend
- **Top news** — headline feed
- **Right rail** — forex, crypto, commodities, economic calendar
- **Command line** — type a symbol (e.g. `AAPL US`) or function (`MARKETS`, `NEWS`, `FX`, `CRYPTO`, `COMMODITIES`, `HELP`, `CLEAR`) and press Enter; tab-style hints as you type
- **Security detail** — price, change, day/52-week range, market cap, P/E, dividend yield, volume, related news

## Run

Open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8765
# then open http://localhost:8765
```

No backend, no network required.

## Files

- `index.html` — shell and panels
- `styles.css` — terminal aesthetic (phosphor green on near-black)
- `data.js` — seeded market simulator and symbol universe
- `app.js` — rendering, charting, command line, detail modal
