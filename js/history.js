/**
 * history.js — Histórico dos últimos 10 setups calculados
 */
'use strict';

const History = {
  MAX: 10,

  _load() {
    try { return JSON.parse(localStorage.getItem(CFG.HISTORY_KEY) || '[]'); }
    catch { return []; }
  },

  _save(h) { localStorage.setItem(CFG.HISTORY_KEY, JSON.stringify(h)); },

  push(r) {
    const h = this._load();
    h.unshift({
      ts:        Date.now(),
      fichaNome: r.f.nome,
      nFusos:    r.nFusos,
      mTotal:    r.mTotal,
      espula:    r.f.espula,
      fichaId:   r.f.id
    });
    this._save(h.slice(0, this.MAX));
    this.render();
  },

  render() {
    const h     = this._load();
    const panel = document.getElementById('hist-panel');
    const list  = document.getElementById('hist-list');
    if (!panel || !list) return;

    if (!h.length) { panel.style.display = 'none'; return; }
    panel.style.display = 'block';

    list.innerHTML = h.map((item, idx) => {
      const d   = new Date(item.ts);
      const fmt = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `<div class="hist-item" data-hist-idx="${idx}" tabindex="0" role="button"
          aria-label="Reutilizar setup: ${UI.esc(item.fichaNome)}, ${item.nFusos} fusos, ${UI.fmtM(item.mTotal)} m">
        <div class="hist-item-info">
          <div class="hist-item-main">${UI.esc(item.fichaNome)} · ${item.nFusos} fusos · ${UI.fmtM(item.mTotal)} m</div>
          <div class="hist-item-meta">${fmt} · ${UI.esc(item.espula)}</div>
        </div>
        <span class="hist-item-arrow">↩</span>
      </div>`;
    }).join('');

    // Event delegation — evita onclick inline e problemas de CSP
    list.onclick = (e) => {
      const item = e.target.closest('.hist-item[data-hist-idx]');
      if (!item) return;
      const entry = h[+item.dataset.histIdx];
      if (entry) App.reuseHistory(entry.fichaId, entry.nFusos, entry.mTotal);
    };
    list.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const item = e.target.closest('.hist-item[data-hist-idx]');
        if (!item) return;
        const entry = h[+item.dataset.histIdx];
        if (entry) App.reuseHistory(entry.fichaId, entry.nFusos, entry.mTotal);
      }
    };
  }
};
