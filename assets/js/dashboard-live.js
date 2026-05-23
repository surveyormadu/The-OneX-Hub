'use strict';

/* ============================================================
   OneX Command Center Dashboard — Live data simulation
   Updates every 60 seconds with animated counters & bar transitions
   ============================================================ */
(function () {

  // ── Initial state (mirrors the HTML defaults) ────────────────────────────
  const state = {
    active:    1234567,
    inactive:    89432,
    dormant:     45123,
    funded:    892341,
    unfunded:  341234,
    tat:          2.4,
    sla:         94.7,
    icsat:       80.55,
    pulse:          80,
    products: [
      { id: 'onebanking',  uptime: 99.2, incidents: 2, downtime: 1.8, status: 'up'   },
      { id: 'sterlingpro', uptime: 98.8, incidents: 3, downtime: 2.1, status: 'up'   },
      { id: 'debitcard',   uptime: 99.7, incidents: 1, downtime: 0.5, status: 'up'   },
      { id: 'ussd',        uptime: 97.5, incidents: 7, downtime: 3.2, status: 'warn' }
    ]
  };

  // ── Variation ranges ────────────────────────────────────────────────────
  const PROD_RANGES = {
    onebanking:  { uStep:0.12, uLo:98.5, uHi:99.9, iStep:0.4, iLo:1, iHi:4,  dStep:0.15, dLo:0.4, dHi:2.8 },
    sterlingpro: { uStep:0.18, uLo:97.5, uHi:99.4, iStep:0.5, iLo:2, iHi:6,  dStep:0.18, dLo:0.8, dHi:3.8 },
    debitcard:   { uStep:0.08, uLo:99.2, uHi:99.9, iStep:0.2, iLo:0, iHi:2,  dStep:0.10, dLo:0.1, dHi:1.2 },
    ussd:        { uStep:0.35, uLo:95.5, uHi:98.8, iStep:1.0, iLo:5, iHi:12, dStep:0.25, dLo:1.8, dHi:5.5 }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function jitter(v, step, lo, hi) { return clamp(v + (Math.random() - 0.5) * 2 * step, lo, hi); }

  // ── Formatters ──────────────────────────────────────────────────────────
  function fmtM(n)       { return (n / 1e6).toFixed(2) + 'M'; }
  function fmtK(n)       { return (n / 1e3).toFixed(1) + 'K'; }
  function fmtPct(n, d)  { return n.toFixed(d == null ? 1 : d) + '%'; }
  function fmtH(n)       { return n.toFixed(1) + 'h'; }
  function fmtComma(n)   { return Math.round(n).toLocaleString(); }

  // ── Animated counter (ease-out cubic) ───────────────────────────────────
  function countUp(elId, from, to, dur, fmt) {
    const el = document.getElementById(elId);
    if (!el) return;
    const t0 = performance.now();
    (function frame(now) {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(frame);
    })(t0);
  }

  // ── DOM helpers ─────────────────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }

  function setW(id, pct) {
    const e = el(id);
    if (e) e.style.width = pct.toFixed(2) + '%';
  }

  function setTxt(id, val) {
    const e = el(id);
    if (e) e.textContent = val;
  }

  function setCls(id, cls) {
    const e = el(id);
    if (e) e.className = cls;
  }

  // ── Glow flash on update ────────────────────────────────────────────────
  function flash(id) {
    const e = el(id);
    if (!e) return;
    e.style.transition = 'text-shadow 0s';
    e.style.textShadow = '0 0 14px currentColor, 0 0 5px currentColor';
    setTimeout(function () {
      e.style.transition = 'text-shadow 1.1s ease';
      e.style.textShadow = '0 0 0px currentColor';
    }, 60);
  }

  // ── Card pulse on update ────────────────────────────────────────────────
  function pulseCard(idx) {
    const cards = document.querySelectorAll('.dash-kpi-card');
    if (!cards[idx]) return;
    const c = cards[idx];
    c.style.transition = 'border-color 0s';
    c.style.borderColor = 'rgba(178,40,16,0.55)';
    setTimeout(function () {
      c.style.transition = 'border-color 1.5s ease';
      c.style.borderColor = '';
    }, 80);
  }

  // ── Main tick ────────────────────────────────────────────────────────────
  function tick() {
    var DUR = 1400;

    /* Customer health */
    var prevAct = state.active, prevInact = state.inactive, prevDorm = state.dormant;
    state.active   = Math.round(jitter(state.active,   4500, 1200000, 1260000));
    state.inactive = Math.round(jitter(state.inactive,  1800,   82000,   97000));
    state.dormant  = Math.round(jitter(state.dormant,    900,   42000,   49000));

    var total   = state.active + state.inactive + state.dormant;
    var actPct  = (state.active   / total) * 100;
    var inPct   = (state.inactive / total) * 100;
    var domPct  = (state.dormant  / total) * 100;

    countUp('kv-active',   prevAct,   state.active,   DUR, fmtM);
    countUp('kv-inactive', prevInact, state.inactive, DUR, fmtK);
    countUp('kv-dormant',  prevDorm,  state.dormant,  DUR, fmtK);
    setW('bar-active',   actPct);
    setW('bar-inactive', inPct);
    setW('bar-dormant',  domPct);
    setTxt('lbl-active-pct', fmtPct(actPct) + ' Active');
    setTxt('lbl-total',      fmtComma(total) + ' Total');
    flash('kv-active'); flash('kv-inactive'); flash('kv-dormant');
    pulseCard(0);

    /* Account status */
    var prevFund = state.funded, prevUnfund = state.unfunded;
    state.funded   = Math.round(jitter(state.funded,   2800, 878000, 906000));
    state.unfunded = Math.round(jitter(state.unfunded, 2800, 328000, 356000));

    var totAcc   = state.funded + state.unfunded;
    var fundPct  = (state.funded   / totAcc) * 100;
    var unfundPct = (state.unfunded / totAcc) * 100;

    countUp('kv-funded',   prevFund,   state.funded,   DUR, fmtK);
    countUp('kv-unfunded', prevUnfund, state.unfunded, DUR, fmtK);
    setW('bar-funded',   fundPct);
    setW('bar-unfunded', unfundPct);
    setTxt('lbl-funded-pct',   fmtPct(fundPct, 1)   + ' of accounts');
    setTxt('lbl-unfunded-pct', fmtPct(unfundPct, 1) + ' of accounts');
    flash('kv-funded'); flash('kv-unfunded');
    pulseCard(1);

    /* TAT & SLA */
    var prevTAT = state.tat, prevSLA = state.sla;
    state.tat = parseFloat(jitter(state.tat, 0.18, 1.8, 3.6).toFixed(1));
    state.sla = parseFloat(jitter(state.sla, 0.7,  90.5, 98.5).toFixed(1));

    countUp('kv-tat', prevTAT, state.tat, DUR, fmtH);
    countUp('kv-sla', prevSLA, state.sla, DUR, function (v) { return fmtPct(v, 1); });

    var tatEl = el('kv-tat');
    if (tatEl) tatEl.className = 'kpi-val ' + (state.tat <= 3.0 ? 'green' : state.tat <= 3.5 ? 'amber' : 'red');

    var breach = 100 - state.sla;
    setW('bar-sla', state.sla);
    setW('bar-sla-breach', breach);
    setTxt('lbl-sla-pct',    fmtPct(state.sla, 1) + ' On-Track');
    setTxt('lbl-breach-pct', fmtPct(breach,    1) + ' Breached');
    flash('kv-tat'); flash('kv-sla');
    pulseCard(2);

    /* Customer satisfaction */
    var prevICsat = state.icsat, prevPulse = state.pulse;
    state.icsat = parseFloat(jitter(state.icsat, 0.45, 77.5, 83.5).toFixed(2));
    state.pulse = Math.round(jitter(state.pulse, 1.5, 76, 86));

    countUp('kv-icsat', prevICsat, state.icsat, DUR, function (v) { return fmtPct(v, 2); });
    var pulseEl = el('kv-pulse');
    if (pulseEl) pulseEl.textContent = state.pulse + '+';

    var icsatGap = 100 - state.icsat;
    setW('bar-icsat',     state.icsat);
    setW('bar-icsat-gap', icsatGap);
    setTxt('lbl-icsat-pct', fmtPct(state.icsat, 2) + ' Satisfied');
    flash('kv-icsat'); flash('kv-pulse');
    pulseCard(3);

    /* Products */
    state.products.forEach(function (p) {
      var r = PROD_RANGES[p.id];
      var prevUptime = p.uptime;

      p.uptime    = parseFloat(jitter(p.uptime,    r.uStep, r.uLo, r.uHi).toFixed(1));
      p.incidents = Math.round(clamp(jitter(p.incidents, r.iStep, r.iLo, r.iHi), r.iLo, r.iHi));
      p.downtime  = parseFloat(jitter(p.downtime,  r.dStep, r.dLo, r.dHi).toFixed(1));

      var wasWarn = p.status === 'warn';
      p.status    = p.uptime < 98.0 ? 'warn' : 'up';
      var isWarn  = p.status === 'warn';

      countUp('pt-' + p.id + '-pct', prevUptime, p.uptime, DUR, function (v) { return v.toFixed(1) + '%'; });
      setW('pt-' + p.id + '-bar', p.uptime);
      setTxt('pt-' + p.id + '-inc', p.incidents + ' incident' + (p.incidents !== 1 ? 's' : ''));
      setTxt('pt-' + p.id + '-dwn', '~' + p.downtime.toFixed(1) + ' hrs');

      /* Colour class on pct */
      var pctEl = el('pt-' + p.id + '-pct');
      if (pctEl) pctEl.className = 'pt-pct ' + (isWarn ? 'amber' : 'green');

      /* Update incidents / downtime colour */
      var incEl = el('pt-' + p.id + '-inc');
      var dwnEl = el('pt-' + p.id + '-dwn');
      if (incEl) incEl.className = 'pt-incidents ' + (isWarn ? 'amber' : 'green');
      if (dwnEl) dwnEl.className = 'pt-downtime '  + (isWarn ? 'amber' : 'green');

      /* Status badge & row highlight — only update when status flips */
      if (wasWarn !== isWarn) {
        var badge = el('pt-' + p.id + '-status');
        if (badge) {
          badge.className = 'pt-status ' + p.status;
          var dot = badge.querySelector('.pt-dot');
          if (dot) dot.className = 'pt-dot ' + p.status;
          /* Update the text node */
          var nodes = Array.prototype.slice.call(badge.childNodes);
          for (var i = nodes.length - 1; i >= 0; i--) {
            if (nodes[i].nodeType === 3) { nodes[i].nodeValue = isWarn ? 'Degraded' : 'Operational'; break; }
          }
        }
        var rowEl = el('pt-' + p.id + '-row');
        if (rowEl) rowEl.className = 'prod-tbl-row' + (isWarn ? ' warn-row' : '');
      }

      flash('pt-' + p.id + '-pct');
    });
  }

  // ── Boot ────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(tick, 5000);          // first visible refresh after 5 s
    setInterval(tick, 5000);         // then every 5 seconds
  });

})();