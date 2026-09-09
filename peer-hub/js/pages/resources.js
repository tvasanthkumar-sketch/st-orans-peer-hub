let phResUser = null;
let phResFilter = null;

const PH_TYPE_ICON = { Notes:'📝', Guide:'📘', Video:'🎬', Template:'🗂️', Audio:'🎧' };

document.addEventListener('DOMContentLoaded', ()=>{
  const user = phRenderShell('resources');
  if(!user) return;
  phResUser = user;

  document.getElementById('res-subject').innerHTML = PH_SUBJECTS.map(s=>`<option>${s}</option>`).join('');

  const filterEl = document.getElementById('resource-subject-filter');
  filterEl.innerHTML = `<span class="chip chip-select active" data-subject="">All subjects</span>` +
    PH_SUBJECTS.map(s=>`<span class="chip chip-select" data-subject="${s}">${s}</span>`).join('');
  filterEl.querySelectorAll('.chip-select').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      filterEl.querySelectorAll('.chip-select').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      phResFilter = chip.dataset.subject || null;
      renderResources();
    });
  });

  renderResources();

  const modal = document.getElementById('resource-modal');
  document.getElementById('add-resource-btn').addEventListener('click', ()=> modal.classList.remove('hidden'));
  document.getElementById('resource-modal-close').addEventListener('click', ()=> modal.classList.add('hidden'));
  modal.addEventListener('click', (e)=>{ if(e.target===modal) modal.classList.add('hidden'); });

  document.getElementById('resource-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    const d = PeerHub.load();
    d.resources.unshift({
      id:'id_'+Math.random().toString(36).slice(2,10),
      title: document.getElementById('res-title').value.trim(),
      subject: document.getElementById('res-subject').value,
      type: document.getElementById('res-type').value,
      addedBy: phResUser.name
    });
    PeerHub.save();
    modal.classList.add('hidden');
    e.target.reset();
    renderResources();
    phToast('Thanks for sharing! Your resource is now live.');
  });
});

function renderResources(){
  let items = PeerHub.allResources().slice();
  if(phResFilter) items = items.filter(r=>r.subject === phResFilter);

  const grid = document.getElementById('resource-grid');
  const empty = document.getElementById('resource-empty');
  if(!items.length){ grid.innerHTML=''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  grid.innerHTML = items.map(r=>`
    <div class="card">
      <div style="font-size:1.5rem; margin-bottom:10px;">${PH_TYPE_ICON[r.type] || '📄'}</div>
      <span class="chip chip-gold" style="margin-bottom:10px;">${r.subject}</span>
      <h3 style="margin:6px 0 4px;">${phEscape(r.title)}</h3>
      <div class="text-muted" style="font-size:.78rem; margin-bottom:14px;">${r.type} · shared by ${phEscape(r.addedBy)}</div>
      <button class="btn btn-outline btn-sm btn-block" data-open="${r.id}">Open resource</button>
    </div>`).join('');

  grid.querySelectorAll('[data-open]').forEach(btn=>{
    btn.addEventListener('click', ()=> phToast('This is a prototype — resource files aren\u2019t attached yet.'));
  });
}
