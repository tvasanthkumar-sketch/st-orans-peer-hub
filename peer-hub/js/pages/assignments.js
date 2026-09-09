let phAsUser = null;
let phAsFilter = 'all';

document.addEventListener('DOMContentLoaded', ()=>{
  const user = phRenderShell('assignments');
  if(!user) return;
  phAsUser = user;

  document.getElementById('as-subject').innerHTML = PH_SUBJECTS.map(s=>`<option>${s}</option>`).join('');

  renderAssignments();

  document.querySelectorAll('.chip-select').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      document.querySelectorAll('.chip-select').forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      phAsFilter = chip.dataset.filter;
      renderAssignments();
    });
  });

  const modal = document.getElementById('assignment-modal');
  document.getElementById('add-assignment-btn').addEventListener('click', ()=>{
    document.getElementById('as-due').value = new Date().toISOString().slice(0,10);
    modal.classList.remove('hidden');
  });
  document.getElementById('assignment-modal-close').addEventListener('click', ()=> modal.classList.add('hidden'));
  modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.classList.add('hidden'); });

  document.getElementById('assignment-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    PeerHub.addAssignment(phAsUser.username, {
      title: document.getElementById('as-title').value.trim(),
      subject: document.getElementById('as-subject').value,
      due: document.getElementById('as-due').value,
      priority: document.getElementById('as-priority').value
    });
    modal.classList.add('hidden');
    e.target.reset();
    renderAssignments();
    phToast('Assignment added.');
  });
});

function renderAssignments(){
  let items = PeerHub.assignmentsFor(phAsUser.username).slice();
  items.sort((a,b)=> new Date(a.due) - new Date(b.due));

  if(phAsFilter === 'pending') items = items.filter(a=>!a.done);
  if(phAsFilter === 'done') items = items.filter(a=>a.done);
  if(phAsFilter === 'high') items = items.filter(a=>a.priority==='high' && !a.done);

  const rowsEl = document.getElementById('assignment-rows');
  const emptyEl = document.getElementById('assignment-empty');

  if(!items.length){
    rowsEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');

  rowsEl.innerHTML = items.map(a=>`
    <tr style="${a.done ? 'opacity:.55;' : ''}">
      <td><input type="checkbox" data-toggle="${a.id}" ${a.done?'checked':''} style="width:17px;height:17px; accent-color:var(--forest);"></td>
      <td style="${a.done?'text-decoration:line-through;':''}">${phEscape(a.title)}</td>
      <td>${phEscape(a.subject)}</td>
      <td><span class="badge-priority priority-${a.priority}"></span>${a.priority[0].toUpperCase()+a.priority.slice(1)}</td>
      <td>${a.done ? phFormatDate(a.due) : `<span class="chip ${phDaysUntil(a.due)<=1?'chip-burgundy':'chip-gold'}">${phDueLabel(a.due)}</span>`}</td>
      <td><button class="btn btn-ghost btn-sm" data-delete="${a.id}">Remove</button></td>
    </tr>`).join('');

  rowsEl.querySelectorAll('[data-toggle]').forEach(cb=>{
    cb.addEventListener('change', ()=>{
      PeerHub.toggleAssignment(phAsUser.username, cb.dataset.toggle);
      phAsUser = PeerHub.currentUser();
      renderAssignments();
      if(cb.checked) phToast('Nicely done — assignment marked complete (+5 Peer Points).');
    });
  });
  rowsEl.querySelectorAll('[data-delete]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      PeerHub.deleteAssignment(phAsUser.username, btn.dataset.delete);
      renderAssignments();
      phToast('Assignment removed.');
    });
  });
}
