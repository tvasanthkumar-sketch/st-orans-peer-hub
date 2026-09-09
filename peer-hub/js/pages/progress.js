document.addEventListener('DOMContentLoaded', ()=>{
  const user = phRenderShell('progress');
  if(!user) return;

  document.getElementById('pg-points').textContent = user.points;
  document.getElementById('pg-helped').textContent = user.helped;
  document.getElementById('pg-sessions').textContent = user.sessions;
  document.getElementById('pg-streak').textContent = user.streak;

  const minutes = PeerHub.studyMinutesFor(user.username);
  const max = Math.max(...minutes, 60);
  document.getElementById('pg-chart').innerHTML = minutes.map(m=>`
    <div style="flex:1; display:flex; align-items:flex-end;">
      <div style="width:100%; height:${Math.max(4,(m/max)*140)}px; background:linear-gradient(180deg, var(--gold-soft), var(--gold-deep)); border-radius:6px 6px 3px 3px;" title="${m} min"></div>
    </div>`).join('');

  const level = Math.floor(user.points / 200);
  const into = user.points % 200;
  document.getElementById('pg-fill').style.width = Math.round((into/200)*100) + '%';
  document.getElementById('pg-level-label').textContent = `Level ${level+1}`;
  document.getElementById('pg-remaining').textContent = `${200-into} pts to Level ${level+2}`;

  const allBadges = [
    { name:'First Session', desc:'Completed your first study session' },
    { name:'Helpful Hand', desc:'Helped 5 or more students' },
    { name:'Five-Day Streak', desc:'Studied 5 days in a row' },
    { name:'Study Marathon', desc:'Logged 20+ sessions' },
    { name:'Peer Champion', desc:'Helped 20 or more students' }
  ];
  document.getElementById('pg-badges').innerHTML = allBadges.map(b=>{
    const earned = user.badges.includes(b.name);
    return `<span class="chip ${earned ? 'chip-gold' : ''}" style="${earned?'':'opacity:.45;'}" title="${b.desc}">${earned?'🏅':'🔒'} ${b.name}</span>`;
  }).join('');
});
