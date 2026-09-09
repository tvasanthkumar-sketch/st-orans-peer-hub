let phCalUser = null;
let phCalCursor = new Date();

document.addEventListener('DOMContentLoaded', ()=>{
  const user = phRenderShell('calendar');
  if(!user) return;
  phCalUser = user;

  renderCalendar();
  renderEventList();

  document.getElementById('cal-prev').addEventListener('click', ()=>{
    phCalCursor.setMonth(phCalCursor.getMonth()-1); renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', ()=>{
    phCalCursor.setMonth(phCalCursor.getMonth()+1); renderCalendar();
  });

  const modal = document.getElementById('event-modal');
  document.getElementById('add-event-btn').addEventListener('click', ()=>{
    document.getElementById('ev-date').value = new Date().toISOString().slice(0,10);
    modal.classList.remove('hidden');
  });
  document.getElementById('event-modal-close').addEventListener('click', ()=> modal.classList.add('hidden'));
  modal.addEventListener('click', (e)=>{ if(e.target === modal) modal.classList.add('hidden'); });

  document.getElementById('event-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    PeerHub.addEvent(phCalUser.username, {
      title: document.getElementById('ev-title').value.trim(),
      date: document.getElementById('ev-date').value,
      importance: document.getElementById('ev-importance').value
    });
    modal.classList.add('hidden');
    e.target.reset();
    renderCalendar();
    renderEventList();
    phToast('Event added to your calendar.');
  });
});

function renderCalendar(){
  const year = phCalCursor.getFullYear(), month = phCalCursor.getMonth();
  document.getElementById('cal-month-label').textContent = phCalCursor.toLocaleDateString('en-NZ', { month:'long', year:'numeric' });

  const events = PeerHub.eventsFor(phCalUser.username);
  const byDate = {};
  events.forEach(e=>{ (byDate[e.date] = byDate[e.date]||[]).push(e); });

  const first = new Date(year, month, 1);
  const startOffset = (first.getDay()+6)%7;
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0,10);
  const prevMonthDays = new Date(year, month, 0).getDate();

  const dows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  let html = dows.map(d=>`<div class="cal-dow">${d}</div>`).join('');

  for(let i=startOffset;i>0;i--){
    html += `<div class="cal-cell other-month"><span class="cal-date">${prevMonthDays-i+1}</span></div>`;
  }
  for(let d=1; d<=daysInMonth; d++){
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === todayStr;
    const dayEvents = byDate[dateStr] || [];
    html += `<div class="cal-cell ${isToday?'today':''}">
      <span class="cal-date">${d}</span>
      ${dayEvents.slice(0,2).map(e=>`<span class="cal-evt imp-${e.importance}">${phEscape(e.title)}</span>`).join('')}
      ${dayEvents.length>2 ? `<span style="font-size:.63rem;color:var(--ink-soft);">+${dayEvents.length-2} more</span>` : ''}
    </div>`;
  }
  const totalCells = startOffset + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for(let i=1;i<=trailing;i++){
    html += `<div class="cal-cell other-month"><span class="cal-date">${i}</span></div>`;
  }
  document.getElementById('cal-grid').innerHTML = html;
}

function renderEventList(){
  const events = PeerHub.eventsFor(phCalUser.username)
    .slice()
    .sort((a,b)=> new Date(a.date) - new Date(b.date));
  const el = document.getElementById('event-list');
  if(!events.length){
    el.innerHTML = `<div class="empty-state"><div class="glyph">🗓️</div>No events yet — add your first one above.</div>`;
    return;
  }
  el.innerHTML = events.map(e=>`
    <div class="flex-between" style="padding:11px 0; border-bottom:1px solid var(--border-hair);">
      <div class="flex-gap">
        <span class="badge-priority priority-${e.importance}"></span>
        <div>
          <div style="font-weight:600; font-size:.9rem;">${phEscape(e.title)}</div>
          <div class="text-muted" style="font-size:.76rem;">${phFormatDate(e.date)}</div>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" data-id="${e.id}">Remove</button>
    </div>`).join('');
  el.querySelectorAll('button[data-id]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      PeerHub.deleteEvent(phCalUser.username, btn.dataset.id);
      renderCalendar(); renderEventList();
      phToast('Event removed.');
    });
  });
}
