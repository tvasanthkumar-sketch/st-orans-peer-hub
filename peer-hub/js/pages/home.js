document.addEventListener('DOMContentLoaded', ()=>{
  const user = phRenderShell('home');
  if(!user) return;

  const hour = new Date().getHours();
  const greetWord = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting').textContent = `${greetWord}, ${user.name.split(' ')[0]}.`;
  document.getElementById('thought-of-day').textContent = 'Here\u2019s what\u2019s on for you today.';
  document.getElementById('thought-quote').textContent = '\u201C' + PeerHub.thoughtOfDay() + '\u201D';

  // Points progress (simple banding: every 200 points = a level)
  const level = Math.floor(user.points / 200);
  const into = user.points % 200;
  document.getElementById('points-label').textContent = `${user.points} pts — Level ${level+1}`;
  document.getElementById('points-fill').style.width = Math.round((into/200)*100) + '%';
  document.getElementById('streak-num').textContent = user.streak;

  // Deadlines
  const assignments = PeerHub.assignmentsFor(user.username)
    .filter(a=>!a.done)
    .sort((a,b)=> new Date(a.due) - new Date(b.due))
    .slice(0,4);
  const deadlinesEl = document.getElementById('deadlines-list');
  if(!assignments.length){
    deadlinesEl.innerHTML = `<div class="empty-state"><div class="glyph">🎉</div>Nothing due soon — enjoy the breathing room.</div>`;
  } else {
    deadlinesEl.innerHTML = assignments.map(a=>`
      <div class="flex-between" style="padding:10px 0; border-bottom:1px solid var(--border-hair);">
        <div class="flex-gap">
          <span class="badge-priority priority-${a.priority}"></span>
          <div>
            <div style="font-weight:600; font-size:.9rem;">${phEscape(a.title)}</div>
            <div class="text-muted" style="font-size:.76rem;">${phEscape(a.subject)}</div>
          </div>
        </div>
        <span class="chip ${phDaysUntil(a.due) <= 1 ? 'chip-burgundy' : 'chip-gold'}">${phDueLabel(a.due)}</span>
      </div>`).join('');
  }

  // Peers
  const peers = PeerHub.allPeers().filter(p=>p.availability==='now').slice(0,3);
  document.getElementById('peers-list').innerHTML = peers.map(p=>`
    <div class="peer-card">
      <div class="peer-avatar">${phInitials(p.name)}</div>
      <div style="flex:1;">
        <div class="flex-between">
          <strong style="font-size:.92rem;">${phEscape(p.name)}</strong>
          <span style="font-size:.75rem; color:var(--gold-deep); font-weight:700;">★ ${p.rating}</span>
        </div>
        <div class="text-muted" style="font-size:.78rem; margin:2px 0 6px;">${p.year} · ${p.subjects.join(', ')}</div>
        <span class="chip chip-gold"><span class="avail-dot avail-now"></span>Available now</span>
      </div>
    </div>`).join('');

  document.getElementById('home-peer-search').addEventListener('submit', (e)=>{
    e.preventDefault();
    const q = e.target.querySelector('input').value.trim();
    window.location.href = q ? `find-peer.html?q=${encodeURIComponent(q)}` : 'find-peer.html';
  });

  // Mini calendar (current month)
  renderMiniCalendar(user);
});

function renderMiniCalendar(user){
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const monthLabel = now.toLocaleDateString('en-NZ', { month:'long', year:'numeric' });
  document.getElementById('mini-cal-label').textContent = monthLabel;

  const events = PeerHub.eventsFor(user.username);
  const eventDates = new Set(events.map(e=>e.date));

  const first = new Date(year, month, 1);
  const startOffset = (first.getDay()+6)%7; // Mon-first
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const todayStr = now.toISOString().slice(0,10);

  const dows = ['M','T','W','T','F','S','S'];
  let html = dows.map(d=>`<div class="cal-dow">${d}</div>`).join('');

  for(let i=0;i<startOffset;i++) html += `<div class="cal-cell other-month"></div>`;
  for(let d=1; d<=daysInMonth; d++){
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === todayStr;
    const hasEvent = eventDates.has(dateStr);
    html += `<div class="cal-cell ${isToday?'today':''}" style="min-height:40px; align-items:center;">
      <span class="cal-date">${d}</span>
      ${hasEvent ? '<span style="width:5px;height:5px;border-radius:50%;background:var(--gold-deep);margin:0 auto;"></span>' : ''}
    </div>`;
  }
  document.getElementById('mini-cal').innerHTML = html;
}
