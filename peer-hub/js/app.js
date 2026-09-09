/* ==========================================================================
   St Oran's Peer Hub — App shell
   Renders the sidebar, topbar, notification panel and Roro the dragon
   on every internal page, and guards pages behind login.
   ========================================================================== */

const PH_ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>',
  assignments: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"/><path d="M14 3.5V8h4M9 12.5h6M9 16h4"/></svg>',
  findPeer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.8-3.8"/></svg>',
  resources: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 1 4 18.5v-13Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 0 2.5-2.5v-13Z"/></svg>',
  study: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.6 2.6M9.5 2.5h5"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8.5" r="3.5"/><path d="M4.5 20c1.4-4 4.2-6 7.5-6s6.1 2 7.5 6"/></svg>',
  progress: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10M11 20V4M18 20v-7"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1h-.2a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.6v-.2a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.8-3.8"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9.5a6 6 0 0 1 12 0c0 4.5 1.5 5.5 1.5 5.5h-15S6 14 6 9.5Z"/><path d="M10 18.5a2 2 0 0 0 4 0"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3M16 17l5-5-5-5M21 12H9"/></svg>'
};

const PH_NAV = [
  { key:'home', label:'Home', href:'home.html', icon:PH_ICONS.home },
  { key:'calendar', label:'Calendar', href:'calendar.html', icon:PH_ICONS.calendar },
  { key:'assignments', label:'Assignments', href:'assignments.html', icon:PH_ICONS.assignments },
  { key:'findPeer', label:'Find a Peer', href:'find-peer.html', icon:PH_ICONS.findPeer },
  { key:'resources', label:'Study Resources', href:'resources.html', icon:PH_ICONS.resources },
  { key:'study', label:'Study Session', href:'study-session.html', icon:PH_ICONS.study },
  { key:'profile', label:'My Profile', href:'profile.html', icon:PH_ICONS.profile },
  { key:'progress', label:'My Progress', href:'progress.html', icon:PH_ICONS.progress },
  { key:'settings', label:'Settings', href:'settings.html', icon:PH_ICONS.settings }
];

const RORO_SVG = `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="38" rx="17" ry="15" fill="#2E5B47"/>
  <path d="M17 30c-4-2-7-7-6-12 4 1 8 4 10 8Z" fill="#C6A15B"/>
  <path d="M47 30c4-2 7-7 6-12-4 1-8 4-10 8Z" fill="#C6A15B"/>
  <circle cx="25" cy="35" r="3" fill="#1B3B2F"/>
  <circle cx="39" cy="35" r="3" fill="#1B3B2F"/>
  <circle cx="24" cy="34" r="1" fill="#fff"/>
  <circle cx="38" cy="34" r="1" fill="#fff"/>
  <path d="M27 43c2 2 8 2 10 0" stroke="#1B3B2F" stroke-width="1.6" stroke-linecap="round" fill="none"/>
  <path d="M32 20c2-6 8-9 13-8-2 5-7 8-13 8Z" fill="#7A2E37"/>
  <ellipse cx="20" cy="41" rx="2.4" ry="1.6" fill="#E8B3B8" opacity=".8"/>
  <ellipse cx="44" cy="41" rx="2.4" ry="1.6" fill="#E8B3B8" opacity=".8"/>
</svg>`;

function phEscape(str){
  return String(str).replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
function phInitials(name){
  return name.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase();
}
function phFormatDate(iso){
  const d = new Date(iso+'T00:00:00');
  return d.toLocaleDateString('en-NZ', { day:'numeric', month:'short' });
}
function phDaysUntil(iso){
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(iso+'T00:00:00');
  return Math.round((target - today) / 86400000);
}
function phDueLabel(iso){
  const n = phDaysUntil(iso);
  if(n < 0) return `${Math.abs(n)}d overdue`;
  if(n === 0) return 'Due today';
  if(n === 1) return 'Due tomorrow';
  return `Due in ${n}d`;
}

function phToast(msg){
  let stack = document.querySelector('.toast-stack');
  if(!stack){
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  stack.appendChild(t);
  setTimeout(()=>t.remove(), 3200);
}

function phRequireAuth(){
  const user = PeerHub.currentUser();
  if(!user){
    window.location.href = 'index.html';
    return null;
  }
  return user;
}

function phRenderShell(activeKey){
  const user = phRequireAuth();
  if(!user) return null;

  const sidebarSlot = document.getElementById('sidebar-slot');
  const topbarSlot = document.getElementById('topbar-slot');
  const roroSlot = document.getElementById('roro-slot');

  if(sidebarSlot){
    sidebarSlot.innerHTML = `
      <div class="sidebar">
        <div class="sidebar-brand">
          <svg class="crest" viewBox="0 0 40 40" fill="none"><path d="M20 3 34 9v10c0 9-6 15.5-14 18-8-2.5-14-9-14-18V9Z" fill="#C6A15B" opacity="0.18"/><path d="M20 3 34 9v10c0 9-6 15.5-14 18-8-2.5-14-9-14-18V9Z" stroke="#C6A15B" stroke-width="1.6"/><path d="M20 12v16M13.5 16.5h13" stroke="#F6F1E3" stroke-width="1.6"/></svg>
          <div class="brand-text">
            <div class="school">St Oran's</div>
            <div class="hub">PEER HUB</div>
          </div>
        </div>
        <div class="sidebar-divider"></div>
        <nav class="sidebar-nav">
          ${PH_NAV.map(item => `<a href="${item.href}" class="${item.key===activeKey?'active':''}">${item.icon}<span>${item.label}</span></a>`).join('')}
        </nav>
        <div class="sidebar-foot">
          <div class="sidebar-points">
            <span>🏅</span>
            <span><strong>${user.points}</strong> Peer Points</span>
          </div>
          <a href="#" id="ph-logout" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:6px;color:rgba(246,241,227,0.75);font-size:.85rem;">${PH_ICONS.logout}<span>Sign out</span></a>
        </div>
      </div>`;
    document.getElementById('ph-logout').addEventListener('click', (e)=>{
      e.preventDefault();
      PeerHub.logout();
      window.location.href = 'index.html';
    });
  }

  if(topbarSlot){
    const notifs = PeerHub.notificationsFor(user.username);
    const unread = notifs.filter(n=>!n.read).length;
    topbarSlot.innerHTML = `
      <div class="topbar-search">
        ${PH_ICONS.search}
        <input type="text" id="ph-global-search" placeholder="Search peers, subjects, resources..." />
      </div>
      <div class="topbar-right">
        <button class="icon-btn" id="ph-bell" title="Notifications">${PH_ICONS.bell}${unread ? '<span class="dot"></span>' : ''}</button>
        <a href="profile.html" class="avatar-chip">
          <span class="av">${phInitials(user.name)}</span>
          <span class="name">${user.name.split(' ')[0]}</span>
        </a>
      </div>
      <div id="ph-notif-panel" class="card hidden" style="position:absolute; top:64px; right:42px; width:300px; z-index:400; box-shadow:0 8px 28px rgba(16,40,32,0.18);">
        <div class="card-header"><h3>Notifications</h3><span class="link" id="ph-mark-read">Mark all read</span></div>
        <div style="display:flex; flex-direction:column; gap:10px; max-height:280px; overflow-y:auto;">
          ${notifs.length ? notifs.map(n=>`
            <div style="padding:9px 10px; border-radius:8px; background:${n.read?'transparent':'var(--cream-dim)'};">
              <div style="font-size:.82rem;">${phEscape(n.text)}</div>
              <div style="font-size:.7rem; color:var(--ink-soft); margin-top:3px;">${n.time}</div>
            </div>`).join('') : '<div class="text-muted" style="font-size:.85rem;">No notifications yet.</div>'}
        </div>
      </div>`;
    const bell = document.getElementById('ph-bell');
    const panel = document.getElementById('ph-notif-panel');
    bell.addEventListener('click', ()=> panel.classList.toggle('hidden'));
    document.addEventListener('click', (e)=>{
      if(!panel.contains(e.target) && e.target !== bell && !bell.contains(e.target)) panel.classList.add('hidden');
    });
    document.getElementById('ph-mark-read').addEventListener('click', ()=>{
      PeerHub.markAllRead(user.username);
      bell.querySelector('.dot')?.remove();
      panel.querySelectorAll('[style*="var(--cream-dim)"]').forEach(el=> el.style.background='transparent');
    });
    document.getElementById('ph-global-search').addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' && e.target.value.trim()){
        window.location.href = `find-peer.html?q=${encodeURIComponent(e.target.value.trim())}`;
      }
    });
  }

  if(roroSlot){
    roroSlot.innerHTML = `
      <div class="roro-wrap">
        <div class="roro-bubble hidden" id="roro-bubble"><strong>Roro:</strong> <span id="roro-text"></span></div>
        <button class="roro-btn" id="roro-btn" title="Say hi to Roro" aria-label="Roro the dragon mascot">${RORO_SVG}</button>
      </div>`;
    const bubble = document.getElementById('roro-bubble');
    const text = document.getElementById('roro-text');
    let shown = false;
    const showLine = ()=>{
      text.textContent = PeerHub.roroLine(activeKey);
      bubble.classList.remove('hidden');
      shown = true;
      clearTimeout(window._roroTimer);
      window._roroTimer = setTimeout(()=> bubble.classList.add('hidden'), 5000);
    };
    document.getElementById('roro-btn').addEventListener('click', showLine);
    setTimeout(showLine, 900);
  }

  return user;
}

document.addEventListener('DOMContentLoaded', ()=>{
  PeerHub.load();
});
