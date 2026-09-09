let phActiveSubject = null;

document.addEventListener('DOMContentLoaded', ()=>{
  const user = phRenderShell('findPeer');
  if(!user) return;

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if(q) document.getElementById('fp-search').value = q;

  const chipsEl = document.getElementById('fp-subject-chips');
  chipsEl.innerHTML = PH_SUBJECTS.map(s=>`<span class="chip chip-select" data-subject="${s}">${s}</span>`).join('');
  chipsEl.querySelectorAll('.chip-select').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const isActive = chip.classList.contains('active');
      chipsEl.querySelectorAll('.chip-select').forEach(c=>c.classList.remove('active'));
      if(!isActive){ chip.classList.add('active'); phActiveSubject = chip.dataset.subject; }
      else { phActiveSubject = null; }
      renderPeers();
    });
  });

  ['fp-search','fp-year','fp-avail'].forEach(id=>{
    document.getElementById(id).addEventListener('input', renderPeers);
  });

  renderPeers();
});

function renderPeers(){
  const q = document.getElementById('fp-search').value.trim().toLowerCase();
  const year = document.getElementById('fp-year').value;
  const avail = document.getElementById('fp-avail').value;

  let peers = PeerHub.allPeers().filter(p=>{
    if(year && p.year !== year) return false;
    if(avail && p.availability !== avail) return false;
    if(phActiveSubject && !p.subjects.includes(phActiveSubject)) return false;
    if(q){
      const hay = (p.name + ' ' + p.subjects.join(' ')).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });

  const grid = document.getElementById('peer-grid');
  const empty = document.getElementById('peer-empty');
  if(!peers.length){ grid.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  const availLabel = { now:'Available now', soon:'Available soon', later:'Available later' };
  const availDot = { now:'avail-now', soon:'avail-soon', later:'avail-later' };

  grid.innerHTML = peers.map(p=>`
    <div class="card">
      <div class="peer-card" style="margin-bottom:12px;">
        <div class="peer-avatar" style="width:52px;height:52px;font-size:1.1rem;">${phInitials(p.name)}</div>
        <div>
          <div class="flex-between">
            <h3 style="margin:0;">${phEscape(p.name)}</h3>
            <span style="font-size:.78rem; color:var(--gold-deep); font-weight:700;">★ ${p.rating}</span>
          </div>
          <div class="text-muted" style="font-size:.8rem;">${p.year}</div>
        </div>
      </div>
      <p style="font-size:.85rem; color:var(--ink-soft); margin:0 0 10px;">${phEscape(p.blurb)}</p>
      <div class="tag-list" style="margin-bottom:12px;">
        ${p.subjects.map(s=>`<span class="chip">${s}</span>`).join('')}
      </div>
      <div class="flex-between">
        <span class="chip chip-gold"><span class="avail-dot ${availDot[p.availability]}"></span>${availLabel[p.availability]}</span>
        <button class="btn btn-outline btn-sm" data-request="${p.id}">Request help</button>
      </div>
    </div>`).join('');

  grid.querySelectorAll('[data-request]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const peer = peers.find(p=>p.id === btn.dataset.request);
      openRequestModal(peer);
    });
  });
}

function openRequestModal(peer){
  const modal = document.getElementById('request-modal');
  document.getElementById('request-body').textContent = `Send ${peer.name} a quick note about what you'd like help with.`;
  modal.classList.remove('hidden');
  document.getElementById('request-send').onclick = ()=>{
    modal.classList.add('hidden');
    document.getElementById('request-msg').value = '';
    phToast(`Request sent to ${peer.name}.`);
  };
}
document.addEventListener('DOMContentLoaded', ()=>{
  const modal = document.getElementById('request-modal');
  document.getElementById('request-modal-close').addEventListener('click', ()=> modal.classList.add('hidden'));
  modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.classList.add('hidden'); });
});
