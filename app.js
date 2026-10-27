/* Bloomberg Terminal — application logic.
 *
 * A self-contained, single-page financial terminal in classic Bloomberg
 * style: ticker tape, market panels, watchlist, intraday charts, news and a
 * command line. Market data is generated client-side by data.js so the
 * terminal runs fully offline.
 */

import {
  buildUniverse, tickQuotes, buildHistory, findQuote,
  DEFAULT_WATCHLIST, INDICES, FX, CRYPTO, COMMODITIES, CALENDAR, NEWS_TEMPLATES,
  fmtPrice, fmtVolume, fmtLarge, pick, range
} from './data.js';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
const state = {
  quotes: [],                 // full universe of simulated quotes
  watchlist: [...DEFAULT_WATCHLIST],
  selected: null,             // currently inspected symbol
  search: '',                 // watchlist filter
  history: [],                // intraday history for selected symbol
  lastTickerRender: 0
};

// ---------------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const els = {
  clock: $('clock'),
  date: $('date'),
  tape: $('tape'),
  indices: $('panel-indices'),
  movers: $('panel-movers'),
  watchlist: $('panel-watchlist'),
  watchSearch: $('watch-search'),
  watchCount: $('watch-count'),
  chartTitle: $('chart-title'),
  chartCanvas: $('chart'),
  chartLegend: $('chart-legend'),
  news: $('panel-news'),
  railMarkets: $('rail-markets'),
  railFunctions: $('rail-functions'),
  railFx: $('rail-fx'),
  railCrypto: $('rail-crypto'),
  railCommodities: $('rail-commodities'),
  railCalendar: $('rail-calendar'),
  cmd: $('cmd'),
  cmdHints: $('cmd-hints'),
  modalRoot: $('modal-root')
};

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
const updown = (v) => (v > 0 ? '▲' : v < 0 ? '▼' : '─');
const changeClass = (v) => (v > 0 ? 'up' : v < 0 ? 'down' : 'flat');
const pct = (v) => v.toFixed(2) + '%';
const symLabel = (s) => s.replace('-USD', '').replace('USD', '');

// Index-like quote built from an index definition (stable within a render)
function indexQuote(def) {
  const ch = (Math.random() - 0.5) * 2.4;
  const price = def.base + ch;
  return { sym: def.sym, name: def.name, price, change: ch, changePct: (ch / def.base) * 100 };
}
function fxQuote(def) {
  const ch = (Math.random() - 0.5) * 0.012;
  const price = def.base + ch;
  return { sym: def.sym, name: def.name, price, change: ch, changePct: (ch / def.base) * 100 };
}

// ---------------------------------------------------------------------------
// Clock
// ---------------------------------------------------------------------------
function tickClock() {
  const now = new Date();
  const optsTime = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  const optsDate = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  els.clock.textContent = now.toLocaleTimeString('en-US', optsTime);
  els.date.textContent = now.toLocaleDateString('en-US', optsDate).toUpperCase();
}
setInterval(tickClock, 1000);
tickClock();

// ---------------------------------------------------------------------------
// Ticker tape
// ---------------------------------------------------------------------------
function buildTickerHtml() {
  const sample = [...state.quotes]
    .sort(() => Math.random() - 0.5)
    .slice(0, 26);
  const half = sample.map(q => tapeItem(q)).join('');
  return half + half; // duplicate for seamless CSS loop
}

function tapeItem(q) {
  const cls = changeClass(q.changePct);
  const sign = q.changePct >= 0 ? '+' : '';
  return `
    <div class="tape-item">
      <span class="tape-sym">${q.symbol}</span>
      <span class="tape-price">${fmtPrice(q.price, q.price < 100 ? 2 : 2)}</span>
      <span class="tape-change ${cls}">${sign}${pct(Math.abs(q.changePct))}</span>
    </div>`;
}

function renderTicker() {
  const now = Date.now();
  if (now - state.lastTickerRender < 3000 && state.quotes.length) return;
  state.lastTickerRender = now;
  if (!state.quotes.length) return;
  els.tape.innerHTML = buildTickerHtml();
}

// ---------------------------------------------------------------------------
// Panels: world indices
// ---------------------------------------------------------------------------
function renderIndices() {
  const html = INDICES.map(d => {
    const q = indexQuote(d);
    const cls = changeClass(q.changePct);
    const sign = q.change >= 0 ? '+' : '';
    return `
      <div class="index-item">
        <div>
          <div class="index-sym">${q.sym}</div>
          <div class="index-name" style="font-size:9px;color:var(--text-dim)">${d.name}</div>
        </div>
        <div style="text-align:right;">
          <div class="index-val">${fmtPrice(q.price, q.price < 100 ? 2 : 2)}</div>
          <div class="index-change ${cls}">${sign}${pct(Math.abs(q.changePct))}</div>
        </div>
      </div>`;
  }).join('');
  els.indices.innerHTML = `<div class="indices-wrap">${html}</div>`;
}

// ---------------------------------------------------------------------------
// Panels: top movers
// ---------------------------------------------------------------------------
function renderMovers() {
  const sorted = [...state.quotes].sort((a, b) => b.changePct - a.changePct);
  const gainers = sorted.slice(0, 5);
  const losers = sorted.slice(-5).reverse();
  const col = (title, rows, up) => `
    <div class="mover-col">
      <div class="mover-head">${title}</div>
      ${rows.map(q => `
        <div class="mover-row" data-sym="${q.symbol}">
          <div style="display:flex;flex-direction:column;gap:2px;">
            <div class="mover-sym">${q.symbol}</div>
            <div class="mover-name">${q.name}</div>
          </div>
          <div class="mover-val">${fmtPrice(q.price, 2)}</div>
          <div class="mover-change ${up ? 'up' : 'down'}">${q.changePct >= 0 ? '+' : ''}${pct(Math.abs(q.changePct))}</div>
        </div>`).join('')}
    </div>`;
  els.movers.innerHTML = `
    <div class="movers-wrap">
      ${col('GAINERS', gainers, true)}
      ${col('LOSERS', losers, false)}
    </div>`;
  els.movers.querySelectorAll('.mover-row').forEach(row => {
    row.addEventListener('click', () => select(row.dataset.sym));
  });
}

// ---------------------------------------------------------------------------
// Panels: watchlist
// ---------------------------------------------------------------------------
function renderWatchlist() {
  const term = state.search.toLowerCase();
  const list = state.watchlist
    .map(s => findQuote(state.quotes, s))
    .filter(q => q && (q.symbol.toLowerCase().includes(term) || q.name.toLowerCase().includes(term)))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

  els.watchCount.textContent = list.length;
  const rows = list.map(q => {
    const cls = changeClass(q.changePct);
    const sign = q.changePct >= 0 ? '+' : '';
    const isSel = state.selected === q.symbol ? 'selected' : '';
    return `
      <tr class="watch-row ${isSel}" data-sym="${q.symbol}">
        <td class="watch-sym">${q.symbol}</td>
        <td class="watch-name">${q.name}</td>
        <td class="watch-val">${fmtPrice(q.price, q.price < 100 ? 2 : 2)}</td>
        <td class="watch-change ${cls}">${sign}${pct(Math.abs(q.changePct))}</td>
        <td class="watch-vol">${fmtVolume(q.volume)}</td>
      </tr>`;
  }).join('');
  els.watchlist.innerHTML = `
    <table class="watch">
      <thead><tr>
        <th style="width:12%">SYMBOL</th>
        <th style="width:34%">NAME</th>
        <th>LAST</th>
        <th>CHANGE</th>
        <th style="width:18%">VOLUME</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  els.watchlist.querySelectorAll('.watch-row').forEach(row => {
    row.addEventListener('click', () => select(row.dataset.sym));
  });
}

els.watchSearch.addEventListener('input', (e) => {
  state.search = e.target.value;
  renderWatchlist();
});

// ---------------------------------------------------------------------------
// Panels: news
// ---------------------------------------------------------------------------
function renderNews() {
  const pool = [...NEWS_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 8);
  const now = Date.now();
  const html = pool.map((n, i) => {
    const mins = (i * 13) + 5;
    const time = new Date(now - mins * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `
      <div class="news-item" data-sym="${n.sym}">
        <div class="news-time">${time}</div>
        <div>
          <div class="news-body">${n.title}</div>
          <div class="news-sym">${n.sym} ${n.type.toUpperCase()}</div>
        </div>
      </div>`;
  }).join('');
  els.news.innerHTML = `<div class="news-list">${html}</div>`;
  els.news.querySelectorAll('.news-item').forEach(row => {
    row.addEventListener('click', () => select(row.dataset.sym));
  });
}

// ---------------------------------------------------------------------------
// Right rail: FX / crypto / commodities / calendar
// ---------------------------------------------------------------------------
function renderRail() {
  const fxHtml = FX.map(d => {
    const q = fxQuote(d);
    const cls = changeClass(q.changePct);
    const sign = q.change >= 0 ? '+' : '';
    return `<div class="rail-item" data-sym="${q.sym}">
      <span class="sym">${q.sym}</span>
      <span class="val">${fmtPrice(q.price, q.price > 10 ? 2 : 4)}</span>
      <span class="chg ${cls}">${sign}${pct(Math.abs(q.changePct))}</span>
    </div>`;
  }).join('');
  const cryptoHtml = CRYPTO.map(d => {
    const q = fxQuote(d);
    const cls = changeClass(q.changePct);
    const sign = q.change >= 0 ? '+' : '';
    return `<div class="rail-item" data-sym="${q.sym}">
      <span class="sym">${q.sym}</span>
      <span class="val">${fmtPrice(q.price, q.price > 100 ? 2 : 4)}</span>
      <span class="chg ${cls}">${sign}${pct(Math.abs(q.changePct))}</span>
    </div>`;
  }).join('');
  const commHtml = COMMODITIES.map(d => {
    const q = fxQuote(d);
    const cls = changeClass(q.changePct);
    const sign = q.change >= 0 ? '+' : '';
    return `<div class="rail-item" data-sym="${d.sym}">
      <span class="sym">${d.sym}</span>
      <span class="val">${d.fmt(q.price)}</span>
      <span class="chg ${cls}">${sign}${pct(Math.abs(q.changePct))}</span>
    </div>`;
  }).join('');
  const calHtml = CALENDAR.map(c => `
    <div class="rail-item" style="font-size:9.5px;">
      <span class="sym">${c.time}</span>
      <span class="val">${c.event}</span>
      <span class="chg flat">${c.actual}</span>
    </div>`).join('');

  els.railFx.innerHTML = fxHtml;
  els.railCrypto.innerHTML = cryptoHtml;
  els.railCommodities.innerHTML = commHtml;
  els.railCalendar.innerHTML = calHtml;

  [...els.railFx.children, ...els.railCrypto.children, ...els.railCommodities.children].forEach(item => {
    item.addEventListener('click', () => select(item.dataset.sym));
  });
}

// ---------------------------------------------------------------------------
// Rail navigation lists
// ---------------------------------------------------------------------------
function renderRailNav() {
  const markets = ['All Securities', 'Equities', 'Fixed Income', 'Currencies', 'Commodities', 'Cryptocurrency'];
  els.railMarkets.innerHTML = markets.map(m => `<li>${m}</li>`).join('');
  const functions = [
    { cmd: 'MARKETS', label: 'MARKET — World Markets' },
    { cmd: 'NEWS', label: 'NEWS — Top News' },
    { cmd: 'FX', label: 'FX — Currencies' },
    { cmd: 'CRYPTO', label: 'CRYPTO — Digital Assets' },
    { cmd: 'COMMODITIES', label: 'COMMODITIES — Energy & Metals' },
    { cmd: 'HELP', label: 'HELP — Terminal Functions' },
    { cmd: 'CLEAR', label: 'CLEAR — Clear Command Line' }
  ];
  els.railFunctions.innerHTML = functions.map(f => `<li data-cmd="${f.cmd}">${f.label}</li>`).join('');
  els.railFunctions.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => execute(li.dataset.cmd));
  });
}

// ---------------------------------------------------------------------------
// Chart
// ---------------------------------------------------------------------------
function drawChart(q) {
  const canvas = els.chartCanvas;
  const wrap = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const w = wrap.clientWidth;
  const h = wrap.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const hist = state.history;
  const pad = { top: 24, right: 70, bottom: 20, left: 40 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const min = Math.min(...hist);
  const max = Math.max(...hist);
  const padRange = (max - min) * 0.12 || max * 0.1;
  const lo = min - padRange;
  const hi = max + padRange;
  const x = (i) => pad.left + (i / (hist.length - 1)) * innerW;
  const y = (v) => pad.top + innerH - ((v - lo) / (hi - lo)) * innerH;

  // grid
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 4; i++) {
    const v = lo + (hi - lo) * (i / 4);
    const yy = Math.round(y(v)) + 0.5;
    ctx.moveTo(pad.left, yy);
    ctx.lineTo(w - pad.right, yy);
  }
  for (let i = 0; i <= 8; i++) {
    const xx = Math.round(x(i)) + 0.5;
    ctx.moveTo(xx, pad.top);
    ctx.lineTo(xx, h - pad.bottom);
  }
  ctx.stroke();

  // line + fill
  const up = q.price >= q.open;
  ctx.strokeStyle = up ? '#00ff41' : '#ff3b3b';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  hist.forEach((v, i) => {
    if (i === 0) ctx.moveTo(x(i), y(v));
    else ctx.lineTo(x(i), y(v));
  });
  ctx.stroke();

  ctx.globalAlpha = 0.12;
  ctx.fillStyle = up ? '#00ff41' : '#ff3b3b';
  ctx.lineTo(w - pad.right, h - pad.bottom);
  ctx.lineTo(pad.left, h - pad.bottom);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // labels right side
  const last = hist[hist.length - 1];
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillStyle = up ? '#00ff41' : '#ff3b3b';
  ctx.fillText(fmtPrice(last, 2) + '  ', w - pad.right + 4, y(last) + 4);
  ctx.fillStyle = '#8a8aa0';
  ctx.font = '10px "Courier New", monospace';
  ctx.fillText(fmtPrice(hi, 2), pad.left, pad.top + 10);
  ctx.fillText(fmtPrice(lo, 2), pad.left, h - pad.bottom - 4);

  // time axis
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30);
  const labels = ['9:30', '11:00', '12:30', '14:00', '15:30'];
  labels.forEach((lab, i) => {
    const xx = Math.round(pad.left + (i / 4) * innerW);
    ctx.fillText(lab, xx - 12, h - pad.bottom + 14);
  });

  els.chartTitle.textContent = `${q.symbol}  ${q.name}  —  INTRADAY  (5 MIN)`;
  els.chartLegend.innerHTML = `
    <span>O ${fmtPrice(q.open, 2)}</span>
    <span>H ${fmtPrice(q.high, 2)}</span>
    <span>L ${fmtPrice(q.low, 2)}</span>
    <span class="${changeClass(q.changePct)}">C ${fmtPrice(q.price, 2)} ${q.changePct >= 0 ? '+' : ''}${pct(Math.abs(q.changePct))}</span>
    <span>VOL ${fmtVolume(q.volume)}</span>`;
}

// ---------------------------------------------------------------------------
// Selection & detail modal
// ---------------------------------------------------------------------------
function select(symbol) {
  const q = findQuote(state.quotes, symbol);
  if (!q) return;
  state.selected = q.symbol;
  state.history = buildHistory(q);
  renderWatchlist(); // refresh selection highlight
  openModal(q);
}

function openModal(q) {
  const up = q.changePct >= 0;
  const cls = up ? 'up' : 'down';
  const sign = q.changePct >= 0 ? '+' : '';

  const root = els.modalRoot;
  root.style.display = 'flex';
  root.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-head">
        <div class="modal-title">${q.symbol} — ${q.name}</div>
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      <div class="modal-body">
        <div class="modal-left">
          <div class="security-head">
            <div>
              <div class="security-sym">${q.symbol}</div>
              <div class="security-name">${q.sector}</div>
            </div>
            <div>
              <div class="security-px">${fmtPrice(q.price, q.price < 100 ? 2 : 2)}</div>
              <div class="security-chg ${cls}">${sign}${q.change.toFixed(2)} (${sign}${pct(Math.abs(q.changePct))})</div>
            </div>
          </div>
          <div class="chart-box" id="modal-chart-wrap">
            <canvas id="modal-chart" width="1" height="1"></canvas>
          </div>
          <div class="modal-foot">
            Bid ${fmtPrice(q.price * 0.999, 2)} &nbsp;|&nbsp; Ask ${fmtPrice(q.price * 1.001, 2)} &nbsp;|&nbsp;
            Open ${fmtPrice(q.open, 2)} &nbsp;|&nbsp; Day ${fmtPrice(q.low, 2)} – ${fmtPrice(q.high, 2)}
          </div>
        </div>
        <div class="modal-right">
          <div style="border:1px solid var(--border-dim);border-radius:2px;padding:10px;background:#05050a;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:8px;">KEY STATS</div>
            <div class="meta-grid">
              <div><div class="lab">Previous Close</div><div class="val">${fmtPrice(q.prev, 2)}</div></div>
              <div><div class="lab">Open</div><div class="val">${fmtPrice(q.open, 2)}</div></div>
              <div><div class="lab">Day's Range</div><div class="val">${fmtPrice(q.low, 2)} – ${fmtPrice(q.high, 2)}</div></div>
              <div><div class="lab">52 Week Range</div><div class="val">${fmtPrice(q.week52Low, 2)} – ${fmtPrice(q.week52High, 2)}</div></div>
              <div><div class="lab">Market Cap</div><div class="val">${fmtLarge(q.mcap)}</div></div>
              <div><div class="lab">P/E Ratio</div><div class="val">${q.pe.toFixed(2)}</div></div>
              <div><div class="lab">Dividend Yield</div><div class="val">${(q.divYield * 100).toFixed(2)}%</div></div>
              <div><div class="lab">Volume</div><div class="val">${fmtVolume(q.volume)}</div></div>
              <div><div class="lab">Avg Volume</div><div class="val">${fmtVolume(q.volume * (0.8 + Math.random() * 0.4))}</div></div>
              <div><div class="lab">Shares Out.</div><div class="val">${(q.shares / 1e9).toFixed(2)}B</div></div>
              <div><div class="lab">Beta</div><div class="val">${(1 + (Math.random() - 0.5) * 2).toFixed(2)}</div></div>
            </div>
          </div>
          <div style="border:1px solid var(--border-dim);border-radius:2px;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);padding:8px 10px;border-bottom:1px solid var(--border-dim);">RELATED NEWS</div>
            <div class="news-list" style="padding:6px 10px;">
              ${NEWS_TEMPLATES.slice(0, 4).map(n => `
                <div class="news-item" style="cursor:default;" data-sym="${n.sym}">
                  <div class="news-time">14:${String(30 + Math.floor(Math.random() * 30)).padStart(2, '0')}</div>
                  <div>
                    <div class="news-body">${n.title}</div>
                    <div class="news-sym">${n.sym} ${n.type.toUpperCase()}</div>
                  </div>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const chartWrap = root.querySelector('#modal-chart-wrap');
  const mcanvas = root.querySelector('#modal-chart');
  const mctx = mcanvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const mw = chartWrap.clientWidth;
  const mh = chartWrap.clientHeight;
  mcanvas.width = mw * dpr;
  mcanvas.height = mh * dpr;
  mcanvas.style.width = mw + 'px';
  mcanvas.style.height = mh + 'px';
  mctx.scale(dpr, dpr);

  const hist = state.history;
  const mp = { top: 16, right: 14, bottom: 14, left: 34 };
  const miw = mw - mp.left - mp.right;
  const mih = mh - mp.top - mp.bottom;
  const mmin = Math.min(...hist);
  const mmax = Math.max(...hist);
  const mpad = (mmax - mmin) * 0.12 || mmax * 0.1;
  const mlo = mmin - mpad;
  const mhi = mmax + mpad;
  const mx = (i) => mp.left + (i / (hist.length - 1)) * miw;
  const my = (v) => mp.top + mih - ((v - mlo) / (mhi - mlo)) * mih;

  mctx.strokeStyle = '#1a1a2e';
  mctx.lineWidth = 1;
  mctx.beginPath();
  for (let i = 0; i <= 4; i++) {
    const v = mmin + (mmax - mmin) * (i / 4);
    const yy = Math.round(my(v)) + 0.5;
    mctx.moveTo(mp.left, yy);
    mctx.lineTo(mw - mp.right, yy);
  }
  for (let i = 0; i <= 8; i++) {
    const xx = Math.round(mx(i)) + 0.5;
    mctx.moveTo(xx, mp.top);
    mctx.lineTo(xx, mh - mp.bottom);
  }
  mctx.stroke();

  mctx.strokeStyle = up ? '#00ff41' : '#ff3b3b';
  mctx.lineWidth = 2;
  mctx.lineJoin = 'round';
  mctx.beginPath();
  hist.forEach((v, i) => {
    if (i === 0) mctx.moveTo(mx(i), my(v));
    else mctx.lineTo(mx(i), my(v));
  });
  mctx.stroke();

  mctx.globalAlpha = 0.12;
  mctx.fillStyle = up ? '#00ff41' : '#ff3b3b';
  mctx.lineTo(mw - mp.right, mh - mp.bottom);
  mctx.lineTo(mp.left, mh - mp.bottom);
  mctx.closePath();
  mctx.fill();
  mctx.globalAlpha = 1;

  root.querySelector('#modal-close').addEventListener('click', closeModal);
  root.addEventListener('click', (e) => { if (e.target === root) closeModal(); });
}

function closeModal() {
  els.modalRoot.style.display = 'none';
  els.modalRoot.innerHTML = '';
  state.selected = null;
  state.history = [];
  renderWatchlist();
  drawChartPlaceholder();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && els.modalRoot.style.display === 'flex') closeModal();
  if (e.key === 'Escape') els.cmd.value = '';
});

function drawChartPlaceholder() {
  const canvas = els.chartCanvas;
  const ctx = canvas.getContext('2d');
  const w = canvas.clientWidth || 640;
  const h = canvas.clientHeight || 320;
  canvas.width = w;
  canvas.height = h;
  ctx.fillStyle = '#05050a';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#1f1f33';
  ctx.font = '12px "Courier New", monospace';
  ctx.fillText('Type a symbol in the command line (e.g. AAPL US) then press Enter', 24, h / 2);
}

// ---------------------------------------------------------------------------
// Command line
// ---------------------------------------------------------------------------
const COMMANDS = [
  { cmd: 'MARKETS', desc: 'World markets / indices' },
  { cmd: 'INDICES', desc: 'World markets / indices' },
  { cmd: 'NEWS', desc: 'Top news' },
  { cmd: 'FX', desc: 'Currencies' },
  { cmd: 'FOREX', desc: 'Currencies' },
  { cmd: 'CRYPTO', desc: 'Cryptocurrency' },
  { cmd: 'COMMODITIES', desc: 'Commodities' },
  { cmd: 'HELP', desc: 'Terminal functions' },
  { cmd: 'CLEAR', desc: 'Clear command line' }
];

function showHints(value) {
  const raw = value.trim();
  if (!raw) { els.cmdHints.textContent = ''; return; }
  const tok = raw.split(/\s+/).pop().toUpperCase().replace('<GO>', '');
  const matches = [];
  state.quotes.forEach(q => {
    if (q.symbol.includes(tok)) matches.push({ label: q.symbol, extra: q.name, type: 'sym' });
  });
  COMMANDS.forEach(c => {
    if (c.cmd.includes(tok)) matches.push({ label: c.cmd, extra: c.desc, type: 'cmd' });
  });
  if (!tok) { els.cmdHints.textContent = ''; return; }
  const top = matches.slice(0, 6).map(m => `<span style="color:var(--${m.type === 'cmd' ? 'orange' : 'yellow'})">${m.label}</span>  ${m.extra}`).join('   │   ');
  els.cmdHints.textContent = '';
  const hint = document.createElement('div');
  hint.style.cssText = 'color:var(--text-dim);font-size:10px;white-space:pre;';
  hint.textContent = top;
  els.cmdHints.appendChild(hint);
}

els.cmd.addEventListener('input', (e) => showHints(e.target.value));

function execute(value) {
  const raw = value.trim();
  if (!raw) return;
  const token = raw.split(/\s+/)[0].toUpperCase().replace('<GO>', '');

  // Symbol lookup?
  const q = findQuote(state.quotes, token);
  if (q) {
    select(q.symbol);
    els.cmd.value = '';
    els.cmdHints.textContent = '';
    return;
  }

  switch (token) {
    case 'MARKETS':
    case 'INDICES':
      scrollPanel(els.indices);
      break;
    case 'NEWS':
      scrollPanel(els.news);
      break;
    case 'FX':
    case 'FOREX':
      els.railFx.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      break;
    case 'CRYPTO':
      els.railCrypto.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      break;
    case 'COMMODITIES':
      els.railCommodities.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      break;
    case 'HELP':
      showHelp();
      break;
    case 'CLEAR':
      els.cmd.value = '';
      els.cmdHints.textContent = '';
      break;
    default:
      els.cmdHints.textContent = `UNRECOGNIZED: ${raw}  (type HELP for functions)`;
      setTimeout(() => { els.cmdHints.textContent = ''; }, 2500);
      break;
  }
  els.cmd.value = '';
}

els.cmd.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    execute(els.cmd.value);
  }
});

els.cmd.addEventListener('focus', () => { /* ensure hints visible */ });
els.cmd.focus();

function scrollPanel(panel) {
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showHelp() {
  const help = `
    <div class="help-wrap">
      <p style="color:var(--text);font-weight:bold;">BLOOMBERG TERMINAL — FUNCTIONS</p>
      <p><span class="cmd">SYMBOL US</span> (e.g. <span class="cmd">AAPL US</span>) — inspect a security: chart, key stats, news.</p>
      <p><span class="cmd">MARKETS</span> — world indices panel.</p>
      <p><span class="cmd">NEWS</span> — top news feed.</p>
      <p><span class="cmd">FX</span> / <span class="cmd">CRYPTO</span> / <span class="cmd">COMMODITIES</span> — rail panels.</p>
      <p><span class="cmd">CLEAR</span> — clear command line.</p>
      <p>Click any row in the watchlist, movers or ticker-related panels to inspect that security.</p>
      <p>Prices move in real time (simulated). Green = up, red = down.</p>
    </div>`;
  els.modalRoot.style.display = 'flex';
  els.modalRoot.innerHTML = `
    <div class="modal">
      <div class="modal-head">
        <div class="modal-title">HELP — TERMINAL FUNCTIONS</div>
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      <div class="modal-body" style="padding:14px;">
        <div style="flex:1;overflow:auto;">${help}</div>
      </div>
    </div>`;
  els.modalRoot.querySelector('#modal-close').addEventListener('click', closeModal);
  els.modalRoot.addEventListener('click', (e) => { if (e.target === els.modalRoot) closeModal(); });
}

// ---------------------------------------------------------------------------
// Main render loop
// ---------------------------------------------------------------------------
function renderAll() {
  renderTicker();
  renderIndices();
  renderMovers();
  renderWatchlist();
  renderNews();
  renderRail();
  if (state.selected) {
    const q = findQuote(state.quotes, state.selected);
    if (q) drawChart(q);
  } else {
    drawChartPlaceholder();
  }
}

function init() {
  state.quotes = buildUniverse();
  state.quotes.forEach(q => { state.quotesBySym[q.symbol] = q; });
  renderRailNav();
  renderAll();

  // Live heartbeat: prices drift, panels refresh
  setInterval(() => {
    tickQuotes(state.quotes);
    renderAll();
  }, 1200);
}

init();
